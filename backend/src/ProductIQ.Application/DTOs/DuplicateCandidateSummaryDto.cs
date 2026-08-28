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
    public bool BrandMatch { get; set; }
    public bool ModelMatch { get; set; }
    public DuplicateStatus Status { get; set; }
    public string? MatchSignals { get; set; }
    public DateTime CreatedAt { get; set; }
}
