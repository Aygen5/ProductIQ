using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ProductIQ.Application.Interfaces;
using ProductIQ.Infrastructure.Persistence;

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

        return services;
    }
}
