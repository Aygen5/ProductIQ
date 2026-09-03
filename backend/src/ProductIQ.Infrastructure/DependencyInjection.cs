using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ProductIQ.Application.Common.Configuration;
using ProductIQ.Application.Interfaces;
using ProductIQ.Infrastructure.Persistence;
using ProductIQ.Infrastructure.Services;
using ProductIQ.Infrastructure.Services.Auth;

namespace ProductIQ.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var rawConnectionString = 
            (!string.IsNullOrWhiteSpace(configuration["DATABASE_URL"]) ? configuration["DATABASE_URL"] : null)
            ?? (!string.IsNullOrWhiteSpace(configuration["DATABASE_URL_UNPOOLED"]) ? configuration["DATABASE_URL_UNPOOLED"] : null)
            ?? (!string.IsNullOrWhiteSpace(configuration["POSTGRES_URL"]) ? configuration["POSTGRES_URL"] : null)
            ?? (!string.IsNullOrWhiteSpace(configuration["POSTGRESQL_URL"]) ? configuration["POSTGRESQL_URL"] : null)
            ?? (!string.IsNullOrWhiteSpace(configuration["ConnectionStrings__DefaultConnection"]) ? configuration["ConnectionStrings__DefaultConnection"] : null)
            ?? (!string.IsNullOrWhiteSpace(configuration.GetConnectionString("DefaultConnection")) ? configuration.GetConnectionString("DefaultConnection") : null)
            ?? throw new InvalidOperationException("Connection string 'DATABASE_URL' or 'DefaultConnection' not found in configuration or environment variables.");

        var connectionString = BuildNpgsqlConnectionString(rawConnectionString);

        services.AddDbContext<ProductIQDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.UseVector();
                npgsqlOptions.MigrationsAssembly(typeof(ProductIQDbContext).Assembly.FullName);
            });
        });

        services.AddScoped<IProductIQDbContext>(provider => provider.GetRequiredService<ProductIQDbContext>());

        services.Configure<EmbeddingOptions>(configuration.GetSection(EmbeddingOptions.SectionName));
        services.Configure<ClipOptions>(configuration.GetSection(ClipOptions.SectionName));
        services.Configure<OpenAiExplanationOptions>(configuration.GetSection(OpenAiExplanationOptions.SectionName));
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        services.AddHttpContextAccessor();

        services.AddHttpClient<IEmbeddingService, OpenAiEmbeddingService>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(60);
        });

        services.AddHttpClient<IClipImageEmbeddingService, ClipImageEmbeddingService>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(60);
        });

        services.AddHttpClient<IExplanationLlmService, OpenAiExplanationLlmService>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        services.AddScoped<ISimilaritySearchService, SimilaritySearchService>();
        services.AddScoped<ISearchService, SearchService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();
        services.AddScoped<ISettingsService, SettingsService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IProductImportService, Services.DataImport.ProductImportService>();
        services.AddScoped<UserSeeder>();

        return services;
    }

    private static string BuildNpgsqlConnectionString(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return raw;
        raw = raw.Trim().Trim('"').Trim('\'');

        if (raw.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            raw.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            var uri = new Uri(raw);
            var userInfo = uri.UserInfo.Split(':', 2);
            var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "postgres";
            var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
            var port = uri.Port > 0 ? uri.Port : 5432;
            var database = uri.AbsolutePath.TrimStart('/');
            if (string.IsNullOrWhiteSpace(database)) database = "postgres";

            var isLocal = uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                          uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase) ||
                          uri.Host.Equals("postgres", StringComparison.OrdinalIgnoreCase) ||
                          uri.Host.Equals("::1", StringComparison.OrdinalIgnoreCase);

            var sslMode = isLocal ? "Disable" : "Require";

            return $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode={sslMode};Trust Server Certificate=true";
        }

        if (raw.Contains("Host=", StringComparison.OrdinalIgnoreCase) &&
            !raw.Contains("SSL Mode", StringComparison.OrdinalIgnoreCase))
        {
            var isLocalHost = raw.Contains("Host=localhost", StringComparison.OrdinalIgnoreCase) ||
                              raw.Contains("Host=127.0.0.1", StringComparison.OrdinalIgnoreCase) ||
                              raw.Contains("Host=postgres;", StringComparison.OrdinalIgnoreCase) ||
                              raw.EndsWith("Host=postgres", StringComparison.OrdinalIgnoreCase) ||
                              raw.Contains("Host=::1", StringComparison.OrdinalIgnoreCase);

            if (!isLocalHost)
            {
                return $"{raw.TrimEnd(';')};SSL Mode=Require;Trust Server Certificate=true";
            }
        }

        return raw;
    }
}
