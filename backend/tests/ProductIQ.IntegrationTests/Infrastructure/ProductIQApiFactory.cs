namespace ProductIQ.IntegrationTests.Infrastructure;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Entities;
using ProductIQ.Domain.Enums;
using ProductIQ.Infrastructure.Persistence;

public class ProductIQApiFactory : WebApplicationFactory<Program>
{
    public const string TestConnectionString = "Host=127.0.0.1;Port=5433;Database=productiq_test_db;Username=postgres;Password=postgres;SSL Mode=Disable;Trust Server Certificate=true";

    private static readonly object InitLock = new();
    private static bool _databaseInitialized = false;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            var testConfig = new Dictionary<string, string?>
            {
                { "ConnectionStrings:DefaultConnection", TestConnectionString },
                { "Jwt:Key", "ProductIQ_SuperSecret_Jwt_SigningKey_2026_Development_Min32Chars!" },
                { "Jwt:Issuer", "ProductIQ.API" },
                { "Jwt:Audience", "ProductIQ.Client" },
                { "Jwt:ExpirationHours", "24" },
                { "Auth:Seed:AdminEmail", "admin@productiq.internal" },
                { "Auth:Seed:AdminPassword", "Admin123!*" },
                { "Auth:Seed:UserEmail", "user@productiq.internal" },
                { "Auth:Seed:UserPassword", "User123!*" }
            };

            config.AddInMemoryCollection(testConfig);
        });

        builder.ConfigureServices(services =>
        {
            var embeddingDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IEmbeddingService));
            if (embeddingDescriptor != null)
            {
                services.Remove(embeddingDescriptor);
            }
            services.AddSingleton<IEmbeddingService, TestEmbeddingService>();

            var clipDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IClipImageEmbeddingService));
            if (clipDescriptor != null)
            {
                services.Remove(clipDescriptor);
            }
            services.AddSingleton<IClipImageEmbeddingService, TestClipImageEmbeddingService>();

            var llmDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IExplanationLlmService));
            if (llmDescriptor != null)
            {
                services.Remove(llmDescriptor);
            }
            services.AddSingleton<IExplanationLlmService, TestExplanationLlmService>();
        });
    }

    public void InitializeDatabase()
    {
        lock (InitLock)
        {
            if (_databaseInitialized)
            {
                return;
            }

            using var scope = Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ProductIQDbContext>();
            var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

            var creator = (RelationalDatabaseCreator)context.Database.GetService<IDatabaseCreator>();
            if (!creator.HasTables())
            {
                creator.CreateTables();
            }

            SeedDefaultUsers(context, hasher);

            _databaseInitialized = true;
        }
    }

    private static void SeedDefaultUsers(ProductIQDbContext context, IPasswordHasher hasher)
    {
        var adminEmail = "admin@productiq.internal";
        var userEmail = "user@productiq.internal";
        var inactiveEmail = "inactive@productiq.internal";

        if (!context.Users.Any(u => u.Email == adminEmail))
        {
            context.Users.Add(new User
            {
                Email = adminEmail,
                PasswordHash = hasher.HashPassword("Admin123!*"),
                FirstName = "Admin",
                LastName = "System",
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        if (!context.Users.Any(u => u.Email == userEmail))
        {
            context.Users.Add(new User
            {
                Email = userEmail,
                PasswordHash = hasher.HashPassword("User123!*"),
                FirstName = "Standard",
                LastName = "User",
                Role = UserRole.User,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        if (!context.Users.Any(u => u.Email == inactiveEmail))
        {
            context.Users.Add(new User
            {
                Email = inactiveEmail,
                PasswordHash = hasher.HashPassword("Inactive123!*"),
                FirstName = "Deactivated",
                LastName = "Account",
                Role = UserRole.User,
                IsActive = false,
                CreatedAt = DateTime.UtcNow
            });
        }

        context.SaveChanges();
    }

    public async Task ResetDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ProductIQDbContext>();

        await context.RiskAlerts.ExecuteDeleteAsync();
        await context.DuplicateCandidates.ExecuteDeleteAsync();
        await context.ProductImageEmbeddings.ExecuteDeleteAsync();
        await context.ProductEmbeddings.ExecuteDeleteAsync();
        await context.ProductAttributes.ExecuteDeleteAsync();
        await context.ProductImages.ExecuteDeleteAsync();
        await context.Products.ExecuteDeleteAsync();
        await context.SystemSettings.ExecuteDeleteAsync();
        await context.SearchQueryLogs.ExecuteDeleteAsync();
        await context.Users
            .Where(u => u.Email != "admin@productiq.internal" && u.Email != "user@productiq.internal" && u.Email != "inactive@productiq.internal")
            .ExecuteDeleteAsync();
    }

    public HttpClient CreateAnonymousClient()
    {
        InitializeDatabase();
        return CreateClient();
    }

    public async Task<HttpClient> CreateAuthenticatedClientAsync(UserRole role)
    {
        InitializeDatabase();
        var client = CreateClient();

        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ProductIQDbContext>();
        var tokenGenerator = scope.ServiceProvider.GetRequiredService<IJwtTokenGenerator>();

        var targetEmail = role == UserRole.Admin ? "admin@productiq.internal" : "user@productiq.internal";
        var user = await context.Users.FirstAsync(u => u.Email == targetEmail);

        var (token, _) = tokenGenerator.GenerateToken(user);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        return client;
    }
}
