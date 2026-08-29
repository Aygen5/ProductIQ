namespace ProductIQ.Application.DTOs;

using System;
using System.Collections.Generic;

public class ExplanationPromptContextDto
{
    public Guid CandidateId { get; set; }
    public decimal OverallScore { get; set; }
    public string ConfidenceLevel { get; set; } = string.Empty;

    public bool BrandMatch { get; set; }
    public bool CategoryMatch { get; set; }
    public bool ModelMatch { get; set; }

    public decimal? TextSimilarity { get; set; }
    public decimal? SemanticSimilarity { get; set; }
    public decimal? AttributeSimilarity { get; set; }
    public decimal? VisualSimilarity { get; set; }

    public ExplanationProductSummaryDto ProductA { get; set; } = new();
    public ExplanationProductSummaryDto ProductB { get; set; } = new();

    public List<string> DeterministicMatches { get; set; } = new();
    public List<string> DeterministicDifferences { get; set; } = new();
    public string DeterministicRecommendation { get; set; } = string.Empty;
}

public class ExplanationProductSummaryDto
{
    public string AmazonItemId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string? Category { get; set; }
    public string? ProductType { get; set; }
    public string? ModelName { get; set; }
    public string? ModelNumber { get; set; }
    public string? Dimensions { get; set; }
    public decimal? Price { get; set; }
}
