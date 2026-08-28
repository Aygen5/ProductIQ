namespace ProductIQ.Application.DTOs;

using ProductIQ.Domain.Enums;

public class DuplicateCandidateDetailDto
{
    public Guid Id { get; set; }
    public Guid ProductAId { get; set; }
    public Guid ProductBId { get; set; }
    public ProductDetailDto? ProductA { get; set; }
    public ProductDetailDto? ProductB { get; set; }
    public decimal OverallScore { get; set; }
    public decimal? TextSimilarity { get; set; }
    public decimal? SemanticSimilarity { get; set; }
    public decimal? AttributeSimilarity { get; set; }
    public decimal? VisualSimilarity { get; set; }
    public bool BrandMatch { get; set; }
    public bool ModelMatch { get; set; }
    public DuplicateStatus Status { get; set; }
    public string? MatchSignals { get; set; }
    public string? AiExplanation { get; set; }
    public string? ResolutionNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
