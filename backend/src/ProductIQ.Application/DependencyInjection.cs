using Microsoft.Extensions.DependencyInjection;

namespace ProductIQ.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Application layer services, validators, and handlers will be registered here.
        return services;
    }
}
