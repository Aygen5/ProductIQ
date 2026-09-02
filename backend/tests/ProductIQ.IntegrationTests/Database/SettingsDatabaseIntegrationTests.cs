namespace ProductIQ.IntegrationTests.Database;

using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ProductIQ.Domain.Entities;
using ProductIQ.IntegrationTests.Infrastructure;
using Xunit;

public class SettingsDatabaseIntegrationTests(ProductIQApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task SystemSetting_CanBeCreatedAndRead_InPostgreSql()
    {
        var setting = new SystemSetting
        {
            Key = "DuplicateThreshold",
            Value = "0.85",
            Category = "Similarity",
            Description = "Minimum threshold for duplicate candidate generation"
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.SystemSettings.Add(setting);
            await context.SaveChangesAsync();
        });

        var persisted = await ExecuteDbContextAsync(async context =>
            await context.SystemSettings.AsNoTracking().FirstOrDefaultAsync(s => s.Key == "DuplicateThreshold"));

        persisted.Should().NotBeNull();
        persisted!.Value.Should().Be("0.85");
        persisted.Category.Should().Be("Similarity");
    }

    [Fact]
    public async Task SystemSetting_CanBeUpdated_InPostgreSql()
    {
        var setting = new SystemSetting
        {
            Key = "RiskScoreWeight",
            Value = "10",
            Category = "Risk"
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.SystemSettings.Add(setting);
            await context.SaveChangesAsync();
        });

        await ExecuteDbContextAsync(async context =>
        {
            var tracked = await context.SystemSettings.FirstAsync(s => s.Key == "RiskScoreWeight");
            tracked.Value = "25";
            await context.SaveChangesAsync();
        });

        var updated = await ExecuteDbContextAsync(async context =>
            await context.SystemSettings.AsNoTracking().FirstAsync(s => s.Key == "RiskScoreWeight"));

        updated.Value.Should().Be("25");
    }
}
