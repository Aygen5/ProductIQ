namespace ProductIQ.Application.DTOs;

using System;

public class AnalyticsSummaryDto
{
    public CatalogAnalyticsDto Catalog { get; set; } = new();
    public DuplicateAnalyticsDto Duplicates { get; set; } = new();
    public RiskAnalyticsDto Risk { get; set; } = new();
    public SearchAnalyticsDto Search { get; set; } = new();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}
