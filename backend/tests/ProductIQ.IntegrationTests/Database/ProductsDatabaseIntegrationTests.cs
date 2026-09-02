namespace ProductIQ.IntegrationTests.Database;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ProductIQ.Domain.Entities;
using ProductIQ.IntegrationTests.Infrastructure;
using Xunit;

public class ProductsDatabaseIntegrationTests(ProductIQApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task Product_CanBeCreatedWithImagesAndAttributes_InPostgreSql()
    {
        var product = new Product
        {
            AmazonItemId = "B00TESTINT01",
            Name = "Ergonomic Standing Desk 60 Inch",
            Brand = "FlexiSpot",
            Category = "Office Furniture > Desks",
            Price = 349.99m,
            Currency = "USD",
            MainImageUrl = "https://example.com/desk.jpg",
            Images = new List<ProductImage>
            {
                new() { ImageId = "IMG01", Url = "https://example.com/desk.jpg", IsMain = true, Width = 800, Height = 600 },
                new() { ImageId = "IMG02", Url = "https://example.com/desk-side.jpg", IsMain = false, Width = 800, Height = 600 }
            },
            Attributes = new List<ProductAttribute>
            {
                new() { Key = "Material", Value = "Bamboo" },
                new() { Key = "Color", Value = "Natural" }
            }
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.Add(product);
            await context.SaveChangesAsync();
        });

        var persisted = await ExecuteDbContextAsync(async context =>
            await context.Products
                .Include(p => p.Images)
                .Include(p => p.Attributes)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.AmazonItemId == "B00TESTINT01"));

        persisted.Should().NotBeNull();
        persisted!.Name.Should().Be("Ergonomic Standing Desk 60 Inch");
        persisted.Images.Should().HaveCount(2);
        persisted.Attributes.Should().HaveCount(2);
        persisted.Attributes.Should().Contain(a => a.Key == "Material" && a.Value == "Bamboo");
    }

    [Fact]
    public async Task Product_CanBeQueriedByBrandAndCategory_InPostgreSql()
    {
        var prod1 = new Product { AmazonItemId = "B00QUERY01", Name = "Chair 1", Brand = "Herman Miller", Category = "Chairs" };
        var prod2 = new Product { AmazonItemId = "B00QUERY02", Name = "Chair 2", Brand = "Herman Miller", Category = "Chairs" };
        var prod3 = new Product { AmazonItemId = "B00QUERY03", Name = "Desk 1", Brand = "Steelcase", Category = "Desks" };

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.AddRange(prod1, prod2, prod3);
            await context.SaveChangesAsync();
        });

        var hermanMillerProducts = await ExecuteDbContextAsync(async context =>
            await context.Products.AsNoTracking().Where(p => p.Brand == "Herman Miller").ToListAsync());

        hermanMillerProducts.Should().HaveCount(2);
        hermanMillerProducts.Should().OnlyContain(p => p.Brand == "Herman Miller");
    }

    [Fact]
    public async Task Product_CanBeDeleted_CascadeDeletesImagesAndAttributes()
    {
        var product = new Product
        {
            AmazonItemId = "B00DEL01",
            Name = "To Be Deleted",
            Images = new List<ProductImage>
            {
                new() { ImageId = "IMG03", Url = "https://example.com/del.jpg", IsMain = true }
            },
            Attributes = new List<ProductAttribute>
            {
                new() { Key = "Color", Value = "Red" }
            }
        };

        await ExecuteDbContextAsync(async context =>
        {
            context.Products.Add(product);
            await context.SaveChangesAsync();
        });

        await ExecuteDbContextAsync(async context =>
        {
            var tracked = await context.Products.FirstAsync(p => p.AmazonItemId == "B00DEL01");
            context.Products.Remove(tracked);
            await context.SaveChangesAsync();
        });

        var remainingImages = await ExecuteDbContextAsync(async context =>
            await context.ProductImages.AsNoTracking().Where(i => i.ProductId == product.Id).ToListAsync());

        var remainingAttributes = await ExecuteDbContextAsync(async context =>
            await context.ProductAttributes.AsNoTracking().Where(a => a.ProductId == product.Id).ToListAsync());

        remainingImages.Should().BeEmpty();
        remainingAttributes.Should().BeEmpty();
    }
}
