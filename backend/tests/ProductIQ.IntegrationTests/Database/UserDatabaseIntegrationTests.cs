namespace ProductIQ.IntegrationTests.Database;

using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ProductIQ.Domain.Entities;
using ProductIQ.Domain.Enums;
using ProductIQ.IntegrationTests.Infrastructure;
using Xunit;

public class UserDatabaseIntegrationTests(ProductIQApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task User_CanBeCreatedAndPersisted_InPostgreSql()
    {
        var user = new User
        {
            Email = "dbtest.user@productiq.internal",
            PasswordHash = "100000.salt.hash",
            FirstName = "Database",
            LastName = "Tester",
            Role = UserRole.User,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Users.Add(user);
            await context.SaveChangesAsync();
        });

        var persisted = await ExecuteDbContextAsync(async context =>
            await context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == "dbtest.user@productiq.internal"));

        persisted.Should().NotBeNull();
        persisted!.FirstName.Should().Be("Database");
        persisted.LastName.Should().Be("Tester");
        persisted.Role.Should().Be(UserRole.User);
        persisted.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task User_EmailUniqueConstraint_ShouldThrowDbUpdateException_OnDuplicate()
    {
        var email = "unique.constraint@productiq.internal";
        var user1 = new User
        {
            Email = email,
            PasswordHash = "hash1",
            FirstName = "First",
            LastName = "User",
            Role = UserRole.User,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Users.Add(user1);
            await context.SaveChangesAsync();
        });

        var user2 = new User
        {
            Email = email,
            PasswordHash = "hash2",
            FirstName = "Second",
            LastName = "User",
            Role = UserRole.User,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var act = async () =>
        {
            await ExecuteDbContextAsync(async context =>
            {
                context.Users.Add(user2);
                await context.SaveChangesAsync();
            });
        };

        await act.Should().ThrowAsync<DbUpdateException>();
    }

    [Fact]
    public async Task User_PasswordHash_IsPersistedAccurately()
    {
        var expectedHash = "100000.randomsaltvalue123.derivedhashvalue456";
        var user = new User
        {
            Email = "hash.persistence@productiq.internal",
            PasswordHash = expectedHash,
            FirstName = "Hash",
            LastName = "Check",
            Role = UserRole.User,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Users.Add(user);
            await context.SaveChangesAsync();
        });

        var persisted = await ExecuteDbContextAsync(async context =>
            await context.Users.AsNoTracking().FirstAsync(u => u.Email == "hash.persistence@productiq.internal"));

        persisted.PasswordHash.Should().Be(expectedHash);
    }

    [Fact]
    public async Task User_Role_IsPersistedAsEnum_InPostgreSql()
    {
        var adminUser = new User
        {
            Email = "role.admin@productiq.internal",
            PasswordHash = "hash",
            FirstName = "Admin",
            LastName = "RoleCheck",
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        });

        var persisted = await ExecuteDbContextAsync(async context =>
            await context.Users.AsNoTracking().FirstAsync(u => u.Email == "role.admin@productiq.internal"));

        persisted.Role.Should().Be(UserRole.Admin);
    }

    [Fact]
    public async Task User_IsActiveFlag_IsPersistedCorrectly()
    {
        var deactivatedUser = new User
        {
            Email = "deactivated.check@productiq.internal",
            PasswordHash = "hash",
            FirstName = "Inactive",
            LastName = "Person",
            Role = UserRole.User,
            IsActive = false,
            CreatedAt = DateTime.UtcNow
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Users.Add(deactivatedUser);
            await context.SaveChangesAsync();
        });

        var persisted = await ExecuteDbContextAsync(async context =>
            await context.Users.AsNoTracking().FirstAsync(u => u.Email == "deactivated.check@productiq.internal"));

        persisted.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task User_LastLoginAt_CanBeUpdatedAndPersisted()
    {
        var user = new User
        {
            Email = "login.update@productiq.internal",
            PasswordHash = "hash",
            FirstName = "Login",
            LastName = "Timestamp",
            Role = UserRole.User,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = null
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Users.Add(user);
            await context.SaveChangesAsync();
        });

        var loginTime = DateTime.UtcNow;

        await ExecuteDbContextAsync(async context =>
        {
            var tracked = await context.Users.FirstAsync(u => u.Email == "login.update@productiq.internal");
            tracked.LastLoginAt = loginTime;
            await context.SaveChangesAsync();
        });

        var persisted = await ExecuteDbContextAsync(async context =>
            await context.Users.AsNoTracking().FirstAsync(u => u.Email == "login.update@productiq.internal"));

        persisted.LastLoginAt.Should().NotBeNull();
        persisted.LastLoginAt!.Value.Should().BeCloseTo(loginTime, TimeSpan.FromSeconds(2));
    }
}
