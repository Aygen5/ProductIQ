namespace ProductIQ.IntegrationTests.Analytics;

using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using ProductIQ.Application.DTOs;
using ProductIQ.Domain.Entities;
using ProductIQ.Domain.Enums;
using ProductIQ.IntegrationTests.Infrastructure;
using Xunit;

public class AnalyticsApiTests(ProductIQApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task GetAnalyticsSummary_Authenticated_Returns200OK_WithCalculatedStats()
    {
        var client = await CreateUserClientAsync();
        var prodA = new Product { AmazonItemId = "B00AN01", Name = "Analytics Prod A", Brand = "Sony" };
        var prodB = new Product { AmazonItemId = "B00AN02", Name = "Analytics Prod B", Brand = "Sony" };
        var candidate = new DuplicateCandidate
        {
            ProductAId = prodA.Id,
            ProductBId = prodB.Id,
            OverallScore = 0.92m,
            Status = DuplicateStatus.Confirmed,
            CreatedAt = DateTime.UtcNow
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.AddRange(prodA, prodB);
            context.DuplicateCandidates.Add(candidate);
            await context.SaveChangesAsync();
        });

        var response = await client.GetAsync("api/analytics");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var summary = await response.Content.ReadFromJsonAsync<AnalyticsSummaryDto>();
        summary.Should().NotBeNull();
        summary!.Catalog.TotalProducts.Should().Be(2);
        summary.Duplicates.ConfirmedCount.Should().Be(1);
    }

    [Fact]
    public async Task GetCatalogAnalytics_Authenticated_Returns200OK()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/analytics/catalog");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var catalog = await response.Content.ReadFromJsonAsync<CatalogAnalyticsDto>();
        catalog.Should().NotBeNull();
    }

    [Fact]
    public async Task GetDuplicateAnalytics_Authenticated_Returns200OK()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/analytics/duplicates");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var duplicates = await response.Content.ReadFromJsonAsync<DuplicateAnalyticsDto>();
        duplicates.Should().NotBeNull();
    }

    [Fact]
    public async Task GetRiskAnalytics_Authenticated_Returns200OK()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/analytics/risk");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var risk = await response.Content.ReadFromJsonAsync<RiskAnalyticsDto>();
        risk.Should().NotBeNull();
    }

    [Fact]
    public async Task GetCatalogHealth_Authenticated_Returns200OK_WithDataPoints()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/analytics/catalog-health?period=30d");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var health = await response.Content.ReadFromJsonAsync<CatalogHealthDto>();
        health.Should().NotBeNull();
        health!.Period.Should().Be("30D");
        health.DataPoints.Should().NotBeEmpty();
    }

    [Fact]
    public async Task Analytics_Anonymous_Returns401Unauthorized()
    {
        var client = CreateAnonymousClient();

        var response = await client.GetAsync("api/analytics");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
