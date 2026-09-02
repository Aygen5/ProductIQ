namespace ProductIQ.UnitTests.Duplicates;

using System;
using System.Collections.Generic;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using ProductIQ.Application.Common.Configuration;
using ProductIQ.Application.Interfaces;
using ProductIQ.Application.Services;
using ProductIQ.Domain.Entities;
using Xunit;

public class DuplicateScoringServiceTests
{
    private readonly Mock<IProductIQDbContext> _contextMock = new();
    private readonly Mock<IProductEmbeddingService> _textServiceMock = new();
    private readonly Mock<ILogger<DuplicateScoringService>> _loggerMock = new();
    private readonly DuplicateScoringOptions _defaultOptions = new();

    private DuplicateScoringService CreateSut(DuplicateScoringOptions? options = null)
    {
        _textServiceMock
            .Setup(t => t.BuildProductEmbeddingText(It.IsAny<Product>()))
            .Returns<Product>(p => $"{p.Brand} {p.Name} {p.ModelName} {p.ModelNumber}".Trim());

        return new DuplicateScoringService(
            _contextMock.Object,
            _textServiceMock.Object,
            Options.Create(options ?? _defaultOptions),
            _loggerMock.Object);
    }

    [Fact]
    public void CalculateScore_IdenticalProducts_ShouldProduceHighScore()
    {
        var sut = CreateSut();
        var vec = new float[] { 0.5f, 0.5f, 0.5f, 0.5f };

        var prodA = new Product
        {
            Id = Guid.NewGuid(),
            AmazonItemId = "B00TEST01",
            Name = "Logitech MX Master 3S Wireless Performance Mouse",
            Brand = "Logitech",
            Category = "Computer Mice",
            ModelName = "MX Master 3S",
            ModelNumber = "910-006561",
            Attributes = new List<ProductAttribute>
            {
                new() { Key = "Connectivity", Value = "Bluetooth" },
                new() { Key = "Color", Value = "Graphite" }
            }
        };

        var prodB = new Product
        {
            Id = Guid.NewGuid(),
            AmazonItemId = "B00TEST02",
            Name = "Logitech MX Master 3S Wireless Performance Mouse",
            Brand = "Logitech",
            Category = "Computer Mice",
            ModelName = "MX Master 3S",
            ModelNumber = "910-006561",
            Attributes = new List<ProductAttribute>
            {
                new() { Key = "Connectivity", Value = "Bluetooth" },
                new() { Key = "Color", Value = "Graphite" }
            }
        };

        var breakdown = sut.CalculateScore(prodA, prodB, vec, vec);

        breakdown.OverallScore.Should().BeGreaterThanOrEqualTo(0.90m);
        breakdown.BrandScore.Should().Be(1.0m);
        breakdown.ModelScore.Should().Be(1.0m);
        breakdown.CategoryScore.Should().Be(1.0m);
        breakdown.TextSimilarity.Should().Be(1.0m);
        breakdown.SemanticSimilarity.Should().Be(1.0m);
        breakdown.AttributeSimilarity.Should().Be(1.0m);
    }

    [Fact]
    public void CalculateScore_CompletelyDifferentProducts_ShouldProduceLowScore()
    {
        var sut = CreateSut();
        var vecA = new float[] { 1.0f, 0.0f, 0.0f };
        var vecB = new float[] { 0.0f, 1.0f, 0.0f };

        var prodA = new Product
        {
            Id = Guid.NewGuid(),
            AmazonItemId = "B00DIFF01",
            Name = "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
            Brand = "Sony",
            Category = "Headphones",
            ModelName = "WH-1000XM5",
            ModelNumber = "WH1000XM5/B"
        };

        var prodB = new Product
        {
            Id = Guid.NewGuid(),
            AmazonItemId = "B00DIFF02",
            Name = "Amazon Basics Kitchen Stainless Steel Chef Knife Set",
            Brand = "AmazonBasics",
            Category = "Kitchen Knives",
            ModelName = "Cutlery",
            ModelNumber = "KNF-88"
        };

        var breakdown = sut.CalculateScore(prodA, prodB, vecA, vecB);

        breakdown.OverallScore.Should().BeLessThan(0.30m);
        breakdown.BrandScore.Should().Be(0.0m);
        breakdown.ModelScore.Should().Be(0.0m);
        breakdown.CategoryScore.Should().Be(0.0m);
    }

    [Fact]
    public void CalculateScore_WithExactBrandMatch_ShouldYieldFullBrandScore()
    {
        var sut = CreateSut();
        var prodA = new Product { AmazonItemId = "B00BRD01", Name = "Camera", Brand = "Canon" };
        var prodB = new Product { AmazonItemId = "B00BRD02", Name = "Camera", Brand = "canon" };

        var breakdown = sut.CalculateScore(prodA, prodB, null, null);

        breakdown.BrandScore.Should().Be(1.0m);
    }

    [Fact]
    public void CalculateScore_WithConflictingBrands_ShouldYieldZeroBrandScore()
    {
        var sut = CreateSut();
        var prodA = new Product { AmazonItemId = "B00BRD03", Name = "Camera", Brand = "Canon" };
        var prodB = new Product { AmazonItemId = "B00BRD04", Name = "Camera", Brand = "Nikon" };

        var breakdown = sut.CalculateScore(prodA, prodB, null, null);

        breakdown.BrandScore.Should().Be(0.0m);
    }

    [Fact]
    public void CalculateScore_WithMatchingTaxonomy_ShouldYieldHighCategoryScore()
    {
        var sut = CreateSut();
        var prodA = new Product { AmazonItemId = "B00CAT01", Name = "Item", Category = "Electronics > Audio > Headphones" };
        var prodB = new Product { AmazonItemId = "B00CAT02", Name = "Item", Category = "Electronics > Audio > Headphones" };

        var breakdown = sut.CalculateScore(prodA, prodB, null, null);

        breakdown.CategoryScore.Should().Be(1.0m);
    }

    [Fact]
    public void CalculateScore_WithMatchingModelNumber_ShouldYieldFullModelScore()
    {
        var sut = CreateSut();
        var prodA = new Product { AmazonItemId = "B00MOD01", Name = "Item", ModelNumber = "MOD-990-X" };
        var prodB = new Product { AmazonItemId = "B00MOD02", Name = "Item", ModelNumber = "mod-990-x" };

        var breakdown = sut.CalculateScore(prodA, prodB, null, null);

        breakdown.ModelScore.Should().Be(1.0m);
    }

    [Fact]
    public void CalculateScore_WithConflictingModelNumber_ShouldYieldZeroModelScore()
    {
        var sut = CreateSut();
        var prodA = new Product { AmazonItemId = "B00MOD03", Name = "Item", ModelNumber = "MOD-990-A" };
        var prodB = new Product { AmazonItemId = "B00MOD04", Name = "Item", ModelNumber = "MOD-880-B" };

        var breakdown = sut.CalculateScore(prodA, prodB, null, null);

        breakdown.ModelScore.Should().Be(0.0m);
    }

    [Fact]
    public void CalculateScore_WithVisualVectors_ShouldIncorporateImageSimilarity()
    {
        var sut = CreateSut();
        var imgVecA = new List<float[]> { new float[] { 1.0f, 0.0f } };
        var imgVecB = new List<float[]> { new float[] { 1.0f, 0.0f } };

        var prodA = new Product { AmazonItemId = "B00IMG01", Name = "Coffee Mug", Brand = "Rivet" };
        var prodB = new Product { AmazonItemId = "B00IMG02", Name = "Coffee Mug", Brand = "Rivet" };

        var breakdown = sut.CalculateScore(prodA, prodB, null, null, imgVecA, imgVecB);

        breakdown.ImageSimilarity.Should().NotBeNull();
        breakdown.ImageSimilarity!.Value.Should().Be(1.0m);
        breakdown.Signals.Should().ContainKey("image_similarity");
    }

    [Fact]
    public void CalculateScore_WithNullOrEmptyFields_ShouldHandleGracefullyWithoutThrowing()
    {
        var sut = CreateSut();
        var prodA = new Product { AmazonItemId = "B00EMPTY01", Name = "" };
        var prodB = new Product { AmazonItemId = "B00EMPTY02", Name = "" };

        var act = () => sut.CalculateScore(prodA, prodB, null, null);

        act.Should().NotThrow();
        var result = act();
        result.OverallScore.Should().BeGreaterThanOrEqualTo(0.0m);
        result.OverallScore.Should().BeLessThanOrEqualTo(1.0m);
    }

    [Fact]
    public void CalculateScore_WithMissingSemanticVectors_ShouldFallbackToTextSimilarity()
    {
        var sut = CreateSut();
        var prodA = new Product { AmazonItemId = "B00TXT01", Name = "Ergonomic Office Chair Mesh High Back" };
        var prodB = new Product { AmazonItemId = "B00TXT02", Name = "Ergonomic Office Chair Mesh High Back" };

        var breakdown = sut.CalculateScore(prodA, prodB, null, null);

        breakdown.SemanticSimilarity.Should().Be(breakdown.TextSimilarity);
        breakdown.SemanticSimilarity.Should().Be(1.0m);
    }
}
