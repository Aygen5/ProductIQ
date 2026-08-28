using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ProductIQ.Application.Common.Configuration;
using ProductIQ.Application.Interfaces;
using ProductIQ.Infrastructure.Persistence;
using ProductIQ.Infrastructure.Services;

namespace ProductIQ.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

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

        services.AddHttpClient<IEmbeddingService, OpenAiEmbeddingService>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(60);
        });

        services.AddScoped<ISimilaritySearchService, SimilaritySearchService>();

        return services;
    }
}
