namespace ProductIQ.Domain.Entities;

using ProductIQ.Domain.Common;
using ProductIQ.Domain.Enums;

public class DuplicateCandidate : BaseEntity
{
    public Guid ProductAId { get; set; }
    public Product ProductA { get; set; } = null!;

    public Guid ProductBId { get; set; }
    public Product ProductB { get; set; } = null!;

    public decimal OverallScore { get; set; }
    public decimal? TextSimilarity { get; set; }
    public decimal? SemanticSimilarity { get; set; }
    public decimal? AttributeSimilarity { get; set; }
    public decimal? VisualSimilarity { get; set; }

    public bool BrandMatch { get; set; }
    public bool ModelMatch { get; set; }

    public DuplicateStatus Status { get; set; } = DuplicateStatus.Potential;
    public string? MatchSignals { get; set; }
    public string? AiExplanation { get; set; }
    public string? ResolutionNotes { get; set; }
    public DateTime? ReviewedAt { get; set; }
}
