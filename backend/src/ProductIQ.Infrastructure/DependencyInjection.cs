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
            return ParsePostgresUri(raw);
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

    private static string ParsePostgresUri(string raw)
    {
        var schemeIndex = raw.IndexOf("://", StringComparison.Ordinal);
        var withoutScheme = schemeIndex >= 0 ? raw.Substring(schemeIndex + 3) : raw;

        var queryIndex = withoutScheme.IndexOf('?');
        if (queryIndex >= 0)
        {
            withoutScheme = withoutScheme.Substring(0, queryIndex);
        }

        var lastAtIndex = withoutScheme.LastIndexOf('@');
        var userInfoPart = lastAtIndex >= 0 ? withoutScheme.Substring(0, lastAtIndex) : "";
        var hostDbPart = lastAtIndex >= 0 ? withoutScheme.Substring(lastAtIndex + 1) : withoutScheme;

        var username = "postgres";
        var password = "";
        if (!string.IsNullOrWhiteSpace(userInfoPart))
        {
            var firstColonIndex = userInfoPart.IndexOf(':');
            if (firstColonIndex >= 0)
            {
                username = Uri.UnescapeDataString(userInfoPart.Substring(0, firstColonIndex));
                password = Uri.UnescapeDataString(userInfoPart.Substring(firstColonIndex + 1));
            }
            else
            {
                username = Uri.UnescapeDataString(userInfoPart);
            }
        }

        var slashIndex = hostDbPart.IndexOf('/');
        var hostPortPart = slashIndex >= 0 ? hostDbPart.Substring(0, slashIndex) : hostDbPart;
        var database = slashIndex >= 0 ? hostDbPart.Substring(slashIndex + 1) : "postgres";
        if (string.IsNullOrWhiteSpace(database)) database = "postgres";

        var portIndex = hostPortPart.LastIndexOf(':');
        var host = portIndex >= 0 ? hostPortPart.Substring(0, portIndex) : hostPortPart;
        var port = portIndex >= 0 && int.TryParse(hostPortPart.Substring(portIndex + 1), out var p) ? p : 5432;

        var isLocal = host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                      host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase) ||
                      host.Equals("postgres", StringComparison.OrdinalIgnoreCase) ||
                      host.Equals("::1", StringComparison.OrdinalIgnoreCase);

        var sslMode = isLocal ? "Disable" : "Require";

        return $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode={sslMode};Trust Server Certificate=true";
    }
}
