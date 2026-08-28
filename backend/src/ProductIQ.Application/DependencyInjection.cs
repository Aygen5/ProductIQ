using Microsoft.Extensions.DependencyInjection;
using ProductIQ.Application.Interfaces;
using ProductIQ.Application.Services;

namespace ProductIQ.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IProductEmbeddingService, ProductEmbeddingService>();
        services.AddScoped<IProductEmbeddingBatchService, ProductEmbeddingBatchService>();
        return services;
    }
}
