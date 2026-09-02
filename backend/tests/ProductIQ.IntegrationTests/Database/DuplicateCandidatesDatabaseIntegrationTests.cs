namespace ProductIQ.IntegrationTests.Database;

using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ProductIQ.Domain.Entities;
using ProductIQ.Domain.Enums;
using ProductIQ.IntegrationTests.Infrastructure;
using Xunit;

public class DuplicateCandidatesDatabaseIntegrationTests(ProductIQApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task DuplicateCandidate_CanBeCreated_LinkingTwoProducts_InPostgreSql()
    {
        var prodA = new Product { AmazonItemId = "B00CAND01", Name = "Product Alpha", Brand = "Logitech" };
        var prodB = new Product { AmazonItemId = "B00CAND02", Name = "Product Beta", Brand = "Logitech" };

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.AddRange(prodA, prodB);
            await context.SaveChangesAsync();
        });

        var candidate = new DuplicateCandidate
        {
            ProductAId = prodA.Id,
            ProductBId = prodB.Id,
            OverallScore = 0.8875m,
            TextSimilarity = 0.90m,
            BrandMatch = true,
            ModelMatch = true,
            Status = DuplicateStatus.Potential,
            CreatedAt = DateTime.UtcNow
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.DuplicateCandidates.Add(candidate);
            await context.SaveChangesAsync();
        });

        var persisted = await ExecuteDbContextAsync(async context =>
            await context.DuplicateCandidates
                .Include(c => c.ProductA)
                .Include(c => c.ProductB)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == candidate.Id));

        persisted.Should().NotBeNull();
        persisted!.ProductA.Name.Should().Be("Product Alpha");
        persisted.ProductB.Name.Should().Be("Product Beta");
        persisted.OverallScore.Should().Be(0.8875m);
        persisted.Status.Should().Be(DuplicateStatus.Potential);
    }

    [Fact]
    public async Task DuplicateCandidate_StatusTransitions_ArePersisted_InPostgreSql()
    {
        var prodA = new Product { AmazonItemId = "B00STAT01", Name = "Status Test A" };
        var prodB = new Product { AmazonItemId = "B00STAT02", Name = "Status Test B" };

        var candidate = new DuplicateCandidate
        {
            ProductAId = prodA.Id,
            ProductBId = prodB.Id,
            OverallScore = 0.92m,
            Status = DuplicateStatus.Potential,
            CreatedAt = DateTime.UtcNow
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.AddRange(prodA, prodB);
            context.DuplicateCandidates.Add(candidate);
            await context.SaveChangesAsync();
        });

        await ExecuteDbContextAsync(async context =>
        {
            var tracked = await context.DuplicateCandidates.FirstAsync(c => c.Id == candidate.Id);
            tracked.Status = DuplicateStatus.Confirmed;
            tracked.ResolutionNotes = "Verified identical SKU packaging";
            await context.SaveChangesAsync();
        });

        var confirmed = await ExecuteDbContextAsync(async context =>
            await context.DuplicateCandidates.AsNoTracking().FirstAsync(c => c.Id == candidate.Id));

        confirmed.Status.Should().Be(DuplicateStatus.Confirmed);
        confirmed.ResolutionNotes.Should().Be("Verified identical SKU packaging");

        await ExecuteDbContextAsync(async context =>
        {
            var tracked = await context.DuplicateCandidates.FirstAsync(c => c.Id == candidate.Id);
            tracked.Status = DuplicateStatus.Rejected;
            tracked.ResolutionNotes = "Different color editions";
            await context.SaveChangesAsync();
        });

        var rejected = await ExecuteDbContextAsync(async context =>
            await context.DuplicateCandidates.AsNoTracking().FirstAsync(c => c.Id == candidate.Id));

        rejected.Status.Should().Be(DuplicateStatus.Rejected);
        rejected.ResolutionNotes.Should().Be("Different color editions");
    }
}
