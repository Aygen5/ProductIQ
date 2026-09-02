namespace ProductIQ.UnitTests.Search;

using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using ProductIQ.Application.Common.Configuration;
using ProductIQ.Application.Interfaces;
using ProductIQ.Infrastructure.Services;
using Xunit;

public class SearchServiceQueryAnalysisTests
{
    private readonly Mock<IProductIQDbContext> _contextMock = new();
    private readonly Mock<IEmbeddingService> _embeddingServiceMock = new();
    private readonly Mock<ILogger<SearchService>> _loggerMock = new();
    private readonly EmbeddingOptions _options = new();

    private SearchService CreateSut()
    {
        return new SearchService(
            _contextMock.Object,
            _embeddingServiceMock.Object,
            Options.Create(_options),
            _loggerMock.Object);
    }

    [Fact]
    public void AnalyzeQuery_WithBrandAndCategory_ShouldDetectBrandCategoryIntent()
    {
        var sut = CreateSut();
        var query = "Rivet modern living room sofa";

        var analysis = sut.AnalyzeQuery(query);

        analysis.DetectedBrand.Should().Be("Rivet");
        analysis.DetectedCategory.Should().Be("SOFA");
        analysis.SearchIntent.Should().Be("BrandCategorySearch");
        analysis.HasVisualAdjectives.Should().BeTrue();
    }

    [Fact]
    public void AnalyzeQuery_WithOnlyBrand_ShouldDetectBrandSearchIntent()
    {
        var sut = CreateSut();
        var query = "AmazonBasics products";

        var analysis = sut.AnalyzeQuery(query);

        analysis.DetectedBrand.Should().Be("AmazonBasics");
        analysis.DetectedCategory.Should().BeNull();
        analysis.SearchIntent.Should().Be("BrandSearch");
    }

    [Fact]
    public void AnalyzeQuery_WithOnlyCategory_ShouldDetectCategorySearchIntent()
    {
        var sut = CreateSut();
        var query = "ergonomic office chair";

        var analysis = sut.AnalyzeQuery(query);

        analysis.DetectedBrand.Should().BeNull();
        analysis.DetectedCategory.Should().Be("CHAIR");
        analysis.SearchIntent.Should().Be("CategorySearch");
    }

    [Fact]
    public void AnalyzeQuery_WithAsinPattern_ShouldDetectIdentifierSearchIntent()
    {
        var sut = CreateSut();
        var query = "B07F2G588X";

        var analysis = sut.AnalyzeQuery(query);

        analysis.DetectedModel.Should().Be("B07F2G588X");
        analysis.SearchIntent.Should().Be("IdentifierSearch");
    }

    [Fact]
    public void AnalyzeQuery_WithVisualAdjectives_ShouldDetectAttributeSearchIntent()
    {
        var sut = CreateSut();
        var query = "rustic blue velvet";

        var analysis = sut.AnalyzeQuery(query);

        analysis.HasVisualAdjectives.Should().BeTrue();
        analysis.SearchIntent.Should().Be("AttributeSearch");
    }

    [Fact]
    public void AnalyzeQuery_WithStopwords_ShouldFilterStopwordsFromKeyTerms()
    {
        var sut = CreateSut();
        var query = "a table for the kitchen with and from wood";

        var analysis = sut.AnalyzeQuery(query);

        analysis.KeyTerms.Should().NotContain("a");
        analysis.KeyTerms.Should().NotContain("the");
        analysis.KeyTerms.Should().NotContain("for");
        analysis.KeyTerms.Should().NotContain("with");
        analysis.KeyTerms.Should().NotContain("and");
        analysis.KeyTerms.Should().NotContain("from");
        analysis.KeyTerms.Should().Contain("table");
        analysis.KeyTerms.Should().Contain("kitchen");
        analysis.KeyTerms.Should().Contain("wood");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void AnalyzeQuery_WithNullOrWhitespace_ShouldReturnEmptyAnalysisSafely(string? emptyQuery)
    {
        var sut = CreateSut();

        var analysis = sut.AnalyzeQuery(emptyQuery!);

        analysis.Should().NotBeNull();
        analysis.RawQuery.Should().BeEmpty();
        analysis.NormalizedQuery.Should().BeEmpty();
        analysis.KeyTerms.Should().BeEmpty();
    }
}
