namespace ProductIQ.Application.DTOs;

using System;
using System.Collections.Generic;

public class SearchResultDto
{
    public Guid ProductId { get; set; }
    public string AmazonItemId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string? Category { get; set; }
    public string? ProductType { get; set; }
    public string? ModelName { get; set; }
    public string? ModelNumber { get; set; }
    public decimal? Price { get; set; }
    public string? Currency { get; set; }
    public string? MainImageUrl { get; set; }
    public double RelevanceScore { get; set; }
    public int RelevancePercent { get; set; }
    public double KeywordScore { get; set; }
    public double SemanticScore { get; set; }
    public List<string> MatchedFields { get; set; } = new();
    public string Explanation { get; set; } = string.Empty;
}
