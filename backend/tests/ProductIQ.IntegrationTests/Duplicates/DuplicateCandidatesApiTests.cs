namespace ProductIQ.IntegrationTests.Duplicates;

using System;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ProductIQ.Application.DTOs;
using ProductIQ.Domain.Entities;
using ProductIQ.Domain.Enums;
using ProductIQ.IntegrationTests.Infrastructure;
using Xunit;

public class DuplicateCandidatesApiTests(ProductIQApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task GetDuplicateCandidates_Authenticated_Returns200OK()
    {
        var client = await CreateUserClientAsync();
        var prodA = new Product { AmazonItemId = "B00DC01", Name = "Product One" };
        var prodB = new Product { AmazonItemId = "B00DC02", Name = "Product Two" };
        var candidate = new DuplicateCandidate
        {
            ProductAId = prodA.Id,
            ProductBId = prodB.Id,
            OverallScore = 0.85m,
            Status = DuplicateStatus.Potential,
            CreatedAt = DateTime.UtcNow
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.AddRange(prodA, prodB);
            context.DuplicateCandidates.Add(candidate);
            await context.SaveChangesAsync();
        });

        var response = await client.GetAsync("api/duplicate-candidates?page=1&pageSize=10");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        doc.RootElement.GetProperty("totalCount").GetInt32().Should().Be(1);
    }

    [Fact]
    public async Task GetSummary_Authenticated_Returns200OK()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/duplicate-candidates/summary");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var summary = await response.Content.ReadFromJsonAsync<DuplicateCandidatesSummaryDto>();
        summary.Should().NotBeNull();
    }

    [Fact]
    public async Task GetCandidateById_Existing_Returns200OK()
    {
        var client = await CreateUserClientAsync();
        var prodA = new Product { AmazonItemId = "B00DC03", Name = "Product Three" };
        var prodB = new Product { AmazonItemId = "B00DC04", Name = "Product Four" };
        var candidate = new DuplicateCandidate
        {
            ProductAId = prodA.Id,
            ProductBId = prodB.Id,
            OverallScore = 0.91m,
            Status = DuplicateStatus.Potential,
            CreatedAt = DateTime.UtcNow
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.AddRange(prodA, prodB);
            context.DuplicateCandidates.Add(candidate);
            await context.SaveChangesAsync();
        });

        var response = await client.GetAsync($"api/duplicate-candidates/{candidate.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var detail = await response.Content.ReadFromJsonAsync<DuplicateCandidateDetailDto>();
        detail.Should().NotBeNull();
        detail!.Id.Should().Be(candidate.Id);
    }

    [Fact]
    public async Task GetCandidateById_NonExistent_Returns404NotFound()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync($"api/duplicate-candidates/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ConfirmCandidate_UpdatesStatusToConfirmed_AndReturns200OK()
    {
        var client = await CreateUserClientAsync();
        var prodA = new Product { AmazonItemId = "B00CONF01", Name = "Confirm A" };
        var prodB = new Product { AmazonItemId = "B00CONF02", Name = "Confirm B" };
        var candidate = new DuplicateCandidate
        {
            ProductAId = prodA.Id,
            ProductBId = prodB.Id,
            OverallScore = 0.94m,
            Status = DuplicateStatus.Potential,
            CreatedAt = DateTime.UtcNow
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.AddRange(prodA, prodB);
            context.DuplicateCandidates.Add(candidate);
            await context.SaveChangesAsync();
        });

        var updateRequest = new UpdateCandidateStatusRequest
        {
            ResolutionNotes = "Confirmed identical products"
        };

        var response = await client.PostAsJsonAsync($"api/duplicate-candidates/{candidate.Id}/confirm", updateRequest);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var inDb = await ExecuteDbContextAsync(async context =>
            await context.DuplicateCandidates.AsNoTracking().FirstAsync(c => c.Id == candidate.Id));

        inDb.Status.Should().Be(DuplicateStatus.Confirmed);
        inDb.ResolutionNotes.Should().Be("Confirmed identical products");
    }

    [Fact]
    public async Task RejectCandidate_UpdatesStatusToRejected_AndReturns200OK()
    {
        var client = await CreateUserClientAsync();
        var prodA = new Product { AmazonItemId = "B00REJ01", Name = "Reject A" };
        var prodB = new Product { AmazonItemId = "B00REJ02", Name = "Reject B" };
        var candidate = new DuplicateCandidate
        {
            ProductAId = prodA.Id,
            ProductBId = prodB.Id,
            OverallScore = 0.70m,
            Status = DuplicateStatus.Potential,
            CreatedAt = DateTime.UtcNow
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.AddRange(prodA, prodB);
            context.DuplicateCandidates.Add(candidate);
            await context.SaveChangesAsync();
        });

        var updateRequest = new UpdateCandidateStatusRequest
        {
            ResolutionNotes = "Distinct accessory items"
        };

        var response = await client.PostAsJsonAsync($"api/duplicate-candidates/{candidate.Id}/reject", updateRequest);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var inDb = await ExecuteDbContextAsync(async context =>
            await context.DuplicateCandidates.AsNoTracking().FirstAsync(c => c.Id == candidate.Id));

        inDb.Status.Should().Be(DuplicateStatus.Rejected);
    }

    [Fact]
    public async Task ReopenCandidate_UpdatesStatusToPotential_AndReturns200OK()
    {
        var client = await CreateUserClientAsync();
        var prodA = new Product { AmazonItemId = "B00REOPEN01", Name = "Reopen A" };
        var prodB = new Product { AmazonItemId = "B00REOPEN02", Name = "Reopen B" };
        var candidate = new DuplicateCandidate
        {
            ProductAId = prodA.Id,
            ProductBId = prodB.Id,
            OverallScore = 0.88m,
            Status = DuplicateStatus.Rejected,
            CreatedAt = DateTime.UtcNow
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.AddRange(prodA, prodB);
            context.DuplicateCandidates.Add(candidate);
            await context.SaveChangesAsync();
        });

        var response = await client.PostAsJsonAsync($"api/duplicate-candidates/{candidate.Id}/reopen", new UpdateCandidateStatusRequest());

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var inDb = await ExecuteDbContextAsync(async context =>
            await context.DuplicateCandidates.AsNoTracking().FirstAsync(c => c.Id == candidate.Id));

        inDb.Status.Should().Be(DuplicateStatus.Potential);
    }

    [Fact]
    public async Task RunDetection_Admin_Returns200OK()
    {
        var client = await CreateAdminClientAsync();

        var response = await client.PostAsync("api/duplicate-candidates/detect", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task RunDetection_User_Returns403Forbidden()
    {
        var client = await CreateUserClientAsync();

        var response = await client.PostAsync("api/duplicate-candidates/detect", null);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}
