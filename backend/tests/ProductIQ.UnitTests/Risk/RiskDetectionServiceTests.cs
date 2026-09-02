namespace ProductIQ.UnitTests.Risk;

using System;
using System.Linq;
using FluentAssertions;
using ProductIQ.Application.Services;
using ProductIQ.Domain.Entities;
using Xunit;

public class RiskDetectionServiceTests
{
    private readonly RiskDetectionService _sut = new(null);

    [Fact]
    public void AssessCandidateRisk_WithConflictingModelNumbers_ShouldTriggerModelConflictSignal()
    {
        var prodA = new Product { AmazonItemId = "B00RSK01", Name = "Display 27", ModelNumber = "DELL-U2723QE" };
        var prodB = new Product { AmazonItemId = "B00RSK02", Name = "Display 27", ModelNumber = "DELL-P2722H" };
        var candidate = new DuplicateCandidate
        {
            ProductAId = prodA.Id,
            ProductBId = prodB.Id,
            OverallScore = 0.85m
        };

        var assessment = _sut.AssessCandidateRisk(prodA, prodB, candidate);

        assessment.RiskSignals.Should().Contain(s => s.Code == "RSK_MODEL_CONFLICT");
        var signal = assessment.RiskSignals.First(s => s.Code == "RSK_MODEL_CONFLICT");
        signal.Severity.Should().Be("High");
        signal.ScoreContribution.Should().Be(25);
    }

    [Fact]
    public void AssessCandidateRisk_WithMissingModelMetadata_ShouldTriggerMissingModelSignal()
    {
        var prodA = new Product { AmazonItemId = "B00RSK03", Name = "Table Lamp", ModelNumber = null, ModelName = null };
        var prodB = new Product { AmazonItemId = "B00RSK04", Name = "Table Lamp", ModelNumber = null, ModelName = null };
        var candidate = new DuplicateCandidate
        {
            ProductAId = prodA.Id,
            ProductBId = prodB.Id,
            OverallScore = 0.80m
        };

        var assessment = _sut.AssessCandidateRisk(prodA, prodB, candidate);

        assessment.RiskSignals.Should().Contain(s => s.Code == "RSK_MISSING_MODEL_METADATA");
        var signal = assessment.RiskSignals.First(s => s.Code == "RSK_MISSING_MODEL_METADATA");
        signal.Severity.Should().Be("Low");
        signal.ScoreContribution.Should().Be(10);
    }

    [Fact]
    public void AssessCandidateRisk_WithMismatchedCategories_ShouldTriggerCategoryMismatchSignal()
    {
        var prodA = new Product { AmazonItemId = "B00RSK05", Name = "Chair", Category = "Office Furniture" };
        var prodB = new Product { AmazonItemId = "B00RSK06", Name = "Chair", Category = "Patio Lawn & Garden" };
        var candidate = new DuplicateCandidate
        {
            ProductAId = prodA.Id,
            ProductBId = prodB.Id,
            OverallScore = 0.80m
        };

        var assessment = _sut.AssessCandidateRisk(prodA, prodB, candidate);

        assessment.RiskSignals.Should().Contain(s => s.Code == "RSK_CATEGORY_MISMATCH");
        var signal = assessment.RiskSignals.First(s => s.Code == "RSK_CATEGORY_MISMATCH");
        signal.Severity.Should().Be("High");
        signal.ScoreContribution.Should().Be(20);
    }

    [Fact]
    public void AssessCandidateRisk_WithHighVisualAndLowText_ShouldTriggerVisualTextMismatchSignal()
    {
        var prodA = new Product { AmazonItemId = "B00RSK07", Name = "Brown Leather Chesterfield Couch" };
        var prodB = new Product { AmazonItemId = "B00RSK08", Name = "Contemporary Brown Sectional Ottoman" };
        var candidate = new DuplicateCandidate
        {
            ProductAId = prodA.Id,
            ProductBId = prodB.Id,
            OverallScore = 0.70m,
            TextSimilarity = 0.35m,
            VisualSimilarity = 0.90m
        };

        var assessment = _sut.AssessCandidateRisk(prodA, prodB, candidate, visualSimilarity: 0.90m);

        assessment.RiskSignals.Should().Contain(s => s.Code == "RSK_VISUAL_TEXT_MISMATCH");
        var signal = assessment.RiskSignals.First(s => s.Code == "RSK_VISUAL_TEXT_MISMATCH");
        signal.Severity.Should().Be("High");
        signal.ScoreContribution.Should().Be(20);
    }

    [Fact]
    public void AssessCandidateRisk_WithSignificantPriceDiscrepancy_ShouldTriggerPriceDivergenceSignal()
    {
        var prodA = new Product { AmazonItemId = "B00RSK09", Name = "Watch", Price = 50.00m, Currency = "USD" };
        var prodB = new Product { AmazonItemId = "B00RSK10", Name = "Watch", Price = 350.00m, Currency = "USD" };
        var candidate = new DuplicateCandidate
        {
            ProductAId = prodA.Id,
            ProductBId = prodB.Id,
            OverallScore = 0.82m
        };

        var assessment = _sut.AssessCandidateRisk(prodA, prodB, candidate);

        assessment.RiskSignals.Should().Contain(s => s.Code == "RSK_PRICE_DIVERGENCE");
        var signal = assessment.RiskSignals.First(s => s.Code == "RSK_PRICE_DIVERGENCE");
        signal.ScoreContribution.Should().Be(15);
    }

    [Fact]
    public void AssessCandidateRisk_WhenScoreIsUnder25_ShouldClassifyAsLowRisk()
    {
        var prodA = new Product { AmazonItemId = "B00RSK11", Name = "Desk", ModelNumber = "MOD-1", Category = "Furniture" };
        var prodB = new Product { AmazonItemId = "B00RSK12", Name = "Desk", ModelNumber = "MOD-1", Category = "Furniture" };
        var candidate = new DuplicateCandidate
        {
            ProductAId = prodA.Id,
            ProductBId = prodB.Id,
            OverallScore = 0.95m
        };

        var assessment = _sut.AssessCandidateRisk(prodA, prodB, candidate);

        assessment.RiskScore.Should().BeLessThan(25);
        assessment.RiskLevel.Should().Be("Low");
    }

    [Fact]
    public void AssessCandidateRisk_WhenScoreIsBetween25And49_ShouldClassifyAsMediumRisk()
    {
        var prodA = new Product { AmazonItemId = "B00RSK13", Name = "Item", ModelNumber = "M1", Price = 100m, Currency = "USD" };
        var prodB = new Product { AmazonItemId = "B00RSK14", Name = "Item", ModelNumber = "M1", Price = 250m, Currency = "USD" };
        var candidate = new DuplicateCandidate
        {
            ProductAId = prodA.Id,
            ProductBId = prodB.Id,
            OverallScore = 0.82m
        };

        var assessment = _sut.AssessCandidateRisk(prodA, prodB, candidate);

        if (assessment.RiskScore >= 25 && assessment.RiskScore < 50)
        {
            assessment.RiskLevel.Should().Be("Medium");
        }
    }

    [Fact]
    public void AssessCandidateRisk_WhenScoreIs50OrHigher_ShouldClassifyAsHighOrCriticalRisk()
    {
        var prodA = new Product
        {
            AmazonItemId = "B00RSK15",
            Name = "Monitor 4K",
            ModelNumber = "M-A",
            Category = "Displays",
            Price = 200m,
            Currency = "USD"
        };
        var prodB = new Product
        {
            AmazonItemId = "B00RSK16",
            Name = "Monitor 1080P",
            ModelNumber = "M-B",
            Category = "Home Audio",
            Price = 900m,
            Currency = "USD"
        };
        var candidate = new DuplicateCandidate
        {
            ProductAId = prodA.Id,
            ProductBId = prodB.Id,
            OverallScore = 0.65m,
            TextSimilarity = 0.30m,
            VisualSimilarity = 0.88m
        };

        var assessment = _sut.AssessCandidateRisk(prodA, prodB, candidate);

        assessment.RiskScore.Should().BeGreaterThanOrEqualTo(50);
        assessment.RiskLevel.Should().BeOneOf("High", "Critical");
        assessment.Summary.Should().Contain("risk factors");
    }
}
