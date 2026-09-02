namespace ProductIQ.IntegrationTests.Search;

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

public class SearchApiTests(ProductIQApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task Search_KeywordMode_Returns200OK_WithMatchingResults()
    {
        var client = await CreateUserClientAsync();
        var product = new Product
        {
            AmazonItemId = "B00SEARCH01",
            Name = "Ergonomic Mechanical Keyboard",
            Brand = "Keychron",
            Category = "Computer Accessories"
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.Add(product);
            await context.SaveChangesAsync();
        });

        var response = await client.GetAsync("api/search?q=Keychron+Mechanical&mode=Keyword");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var searchResult = await response.Content.ReadFromJsonAsync<SearchResponseDto>();
        searchResult.Should().NotBeNull();
        searchResult!.Results.Should().NotBeEmpty();
        searchResult.Results[0].Name.Should().Be("Ergonomic Mechanical Keyboard");
    }

    [Fact]
    public async Task Search_SemanticMode_ExecutesPgVectorCosineDistance_Returns200OK()
    {
        var client = await CreateUserClientAsync();
        var product = new Product
        {
            AmazonItemId = "B00VEC01",
            Name = "Noise Cancelling Earbuds",
            Brand = "Sony",
            Category = "Audio"
        };

        var vectorData = new float[1536];
        for (var i = 0; i < 1536; i++)
        {
            vectorData[i] = 1.0f / (float)Math.Sqrt(1536);
        }

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.Add(product);
            context.ProductEmbeddings.Add(new ProductEmbedding
            {
                ProductId = product.Id,
                EmbeddingType = EmbeddingType.Text,
                ModelName = "text-embedding-3-small",
                Dimension = 1536,
                Vector = vectorData,
                CreatedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();
        });

        var response = await client.GetAsync("api/search?q=earbuds&mode=Semantic");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var searchResult = await response.Content.ReadFromJsonAsync<SearchResponseDto>();
        searchResult.Should().NotBeNull();
        searchResult!.Results.Should().NotBeEmpty();
    }

    [Fact]
    public async Task Search_HybridMode_CombinesScores_Returns200OK()
    {
        var client = await CreateUserClientAsync();
        var product = new Product
        {
            AmazonItemId = "B00HYBRID01",
            Name = "Ultra HD 4K Monitor",
            Brand = "Dell",
            Category = "Displays"
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.Add(product);
            await context.SaveChangesAsync();
        });

        var response = await client.GetAsync("api/search?q=Dell+4K+Monitor&mode=Hybrid");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var searchResult = await response.Content.ReadFromJsonAsync<SearchResponseDto>();
        searchResult.Should().NotBeNull();
        searchResult!.Results.Should().NotBeEmpty();
    }

    [Fact]
    public async Task Search_EmptyQuery_Returns200OK_WithEmptyResults()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/search?q=");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var searchResult = await response.Content.ReadFromJsonAsync<SearchResponseDto>();
        searchResult.Should().NotBeNull();
        searchResult!.Results.Should().BeEmpty();
        searchResult.TotalCount.Should().Be(0);
    }

    [Fact]
    public async Task Search_InvalidPage_Returns400BadRequest()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/search?q=test&page=0");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task AnalyzeQuery_Returns200OK_WithIntentAnalysis()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/search/analyze?q=AmazonBasics+Office+Chair");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var analysis = await response.Content.ReadFromJsonAsync<QueryAnalysisDto>();
        analysis.Should().NotBeNull();
        analysis!.SearchIntent.Should().Be("BrandCategorySearch");
        analysis.DetectedBrand.Should().Be("AmazonBasics");
        analysis.DetectedCategory.Should().Be("CHAIR");
    }

    [Fact]
    public async Task Search_Anonymous_Returns401Unauthorized()
    {
        var client = CreateAnonymousClient();

        var response = await client.GetAsync("api/search?q=anything");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
