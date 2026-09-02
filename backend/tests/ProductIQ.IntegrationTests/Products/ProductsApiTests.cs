namespace ProductIQ.IntegrationTests.Products;

using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ProductIQ.Application.Common.Models;
using ProductIQ.Application.DTOs;
using ProductIQ.Domain.Entities;
using ProductIQ.IntegrationTests.Infrastructure;
using Xunit;

public class ProductsApiTests(ProductIQApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task GetProducts_Authenticated_Returns200OK_WithPagedResponse()
    {
        var client = await CreateUserClientAsync();
        var prod1 = new Product { AmazonItemId = "B00LIST01", Name = "Listed Product 1" };
        var prod2 = new Product { AmazonItemId = "B00LIST02", Name = "Listed Product 2" };

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.AddRange(prod1, prod2);
            await context.SaveChangesAsync();
        });

        var response = await client.GetAsync("api/products?page=1&pageSize=10");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var json = await response.Content.ReadAsStringAsync();
        using var doc = System.Text.Json.JsonDocument.Parse(json);
        doc.RootElement.GetProperty("totalCount").GetInt32().Should().Be(2);
        doc.RootElement.GetProperty("items").GetArrayLength().Should().Be(2);
    }

    [Fact]
    public async Task GetProducts_InvalidPage_Returns400BadRequest()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/products?page=0");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetProducts_InvalidPageSize_Returns400BadRequest()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/products?pageSize=150");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetProductById_ExistingGuid_Returns200OK()
    {
        var client = await CreateUserClientAsync();
        var product = new Product
        {
            AmazonItemId = "B00BYID01",
            Name = "Guid Lookup Item",
            Brand = "Sony",
            Price = 199.99m
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.Add(product);
            await context.SaveChangesAsync();
        });

        var response = await client.GetAsync($"api/products/{product.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var detail = await response.Content.ReadFromJsonAsync<ProductDetailDto>();
        detail.Should().NotBeNull();
        detail!.Id.Should().Be(product.Id);
        detail.Name.Should().Be("Guid Lookup Item");
    }

    [Fact]
    public async Task GetProductById_ExistingAmazonItemId_Returns200OK()
    {
        var client = await CreateUserClientAsync();
        var product = new Product
        {
            AmazonItemId = "B00ASINLOOKUP",
            Name = "Asin Lookup Item",
            Brand = "Bose"
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.Add(product);
            await context.SaveChangesAsync();
        });

        var response = await client.GetAsync("api/products/B00ASINLOOKUP");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var detail = await response.Content.ReadFromJsonAsync<ProductDetailDto>();
        detail.Should().NotBeNull();
        detail!.AmazonItemId.Should().Be("B00ASINLOOKUP");
    }

    [Fact]
    public async Task GetProductById_NonExistent_Returns404NotFound()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync($"api/products/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateProduct_ValidRequest_Returns201Created_AndPersistsToDatabase()
    {
        var client = await CreateUserClientAsync();
        var request = new CreateProductRequest
        {
            Name = "Brand New Wireless Headphones",
            Brand = "Sony",
            Category = "Electronics > Audio",
            ModelName = "WH-1000XM5",
            ModelNumber = "WH1000XM5/B",
            Price = 398.00m,
            Currency = "USD",
            MainImageUrl = "https://example.com/sony.jpg",
            Description = "Industry leading noise canceling"
        };

        var response = await client.PostAsJsonAsync("api/products", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await response.Content.ReadFromJsonAsync<ProductDetailDto>();
        created.Should().NotBeNull();
        created!.Name.Should().Be("Brand New Wireless Headphones");
        created.AmazonItemId.Should().StartWith("PIQ-");

        var inDb = await ExecuteDbContextAsync(async context =>
            await context.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == created.Id));

        inDb.Should().NotBeNull();
        inDb!.Brand.Should().Be("Sony");
        inDb.ModelNumber.Should().Be("WH1000XM5/B");
    }

    [Fact]
    public async Task ImportProducts_Authenticated_Returns200OK()
    {
        var client = await CreateUserClientAsync();

        var response = await client.PostAsync("api/products/import?batchSize=5", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var importResult = await response.Content.ReadFromJsonAsync<ProductImportResultDto>();
        importResult.Should().NotBeNull();
    }
}
