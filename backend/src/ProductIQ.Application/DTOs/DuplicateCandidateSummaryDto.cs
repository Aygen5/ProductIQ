namespace ProductIQ.Application.DTOs;

using ProductIQ.Domain.Enums;

public class DuplicateCandidateSummaryDto
{
    public Guid Id { get; set; }
    public Guid ProductAId { get; set; }
    public Guid ProductBId { get; set; }
    public ProductSummaryDto? ProductA { get; set; }
    public ProductSummaryDto? ProductB { get; set; }
    public decimal OverallScore { get; set; }
    public decimal? TextSimilarity { get; set; }
    public decimal? SemanticSimilarity { get; set; }
    public decimal? AttributeSimilarity { get; set; }
    public decimal? VisualSimilarity { get; set; }
    public bool BrandMatch { get; set; }
    public bool ModelMatch { get; set; }
    public bool CategoryMatch { get; set; }
    public DuplicateStatus Status { get; set; }
    public string? MatchSignals { get; set; }
    public int RiskScore { get; set; }
    public string RiskLevel { get; set; } = "Low";
    public DateTime CreatedAt { get; set; }
}
