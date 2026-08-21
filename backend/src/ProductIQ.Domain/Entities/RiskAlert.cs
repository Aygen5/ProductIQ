namespace ProductIQ.Domain.Entities;

using ProductIQ.Domain.Common;
using ProductIQ.Domain.Enums;

public class RiskAlert : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int RiskScore { get; set; }
    public RiskLevel Level { get; set; } = RiskLevel.Low;
    public RiskStatus Status { get; set; } = RiskStatus.Active;
    public RiskAnomalyType AnomalyType { get; set; } = RiskAnomalyType.Other;

    public string? KeyFindings { get; set; }
    public string? AiReasoning { get; set; }
    public string? RecommendedAction { get; set; }
}
