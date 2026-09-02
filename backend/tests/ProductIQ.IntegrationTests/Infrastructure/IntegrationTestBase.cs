namespace ProductIQ.IntegrationTests.Infrastructure;

using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using ProductIQ.Domain.Enums;
using ProductIQ.Infrastructure.Persistence;
using Xunit;

public abstract class IntegrationTestBase : IClassFixture<ProductIQApiFactory>, IAsyncLifetime
{
    protected readonly ProductIQApiFactory Factory;

    protected IntegrationTestBase(ProductIQApiFactory factory)
    {
        Factory = factory;
        Factory.InitializeDatabase();
    }

    public virtual async Task InitializeAsync()
    {
        await Factory.ResetDatabaseAsync();
    }

    public virtual Task DisposeAsync()
    {
        return Task.CompletedTask;
    }

    protected HttpClient CreateAnonymousClient()
    {
        return Factory.CreateAnonymousClient();
    }

    protected async Task<HttpClient> CreateUserClientAsync()
    {
        return await Factory.CreateAuthenticatedClientAsync(UserRole.User);
    }

    protected async Task<HttpClient> CreateAdminClientAsync()
    {
        return await Factory.CreateAuthenticatedClientAsync(UserRole.Admin);
    }

    protected async Task ExecuteDbContextAsync(Func<ProductIQDbContext, Task> action)
    {
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ProductIQDbContext>();
        await action(context);
    }

    protected async Task<T> ExecuteDbContextAsync<T>(Func<ProductIQDbContext, Task<T>> action)
    {
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ProductIQDbContext>();
        return await action(context);
    }
}
