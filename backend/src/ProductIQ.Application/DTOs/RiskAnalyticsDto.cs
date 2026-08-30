namespace ProductIQ.Application.DTOs;

using System.Collections.Generic;

public class RiskAnalyticsDto
{
    public int TotalEvaluated { get; set; }
    public int CriticalRiskCount { get; set; }
    public int HighRiskCount { get; set; }
    public int MediumRiskCount { get; set; }
    public int LowRiskCount { get; set; }
    public int ImmediateReviewCount { get; set; }
    public double AverageRiskScore { get; set; }
    public Dictionary<string, int> TopRiskSignals { get; set; } = new();
}
