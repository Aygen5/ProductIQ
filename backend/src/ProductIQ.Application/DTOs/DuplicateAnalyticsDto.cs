namespace ProductIQ.Application.DTOs;

public class DuplicateAnalyticsDto
{
    public int TotalCandidates { get; set; }
    public int PendingReviewCount { get; set; }
    public int ConfirmedCount { get; set; }
    public int RejectedCount { get; set; }
    public int AutoMergedCount { get; set; }
    public int UniqueProductsInvolved { get; set; }
    public double DuplicateRate { get; set; }
    public int DuplicateRatePercent { get; set; }
    public double AverageOverallScore { get; set; }
    public double MinScore { get; set; }
    public double MaxScore { get; set; }
    public double? Precision { get; set; }
    public int? PrecisionPercent { get; set; }
    public bool PrecisionAvailable { get; set; }
    public string PrecisionExplanation { get; set; } = string.Empty;
    public double? Recall { get; set; }
    public int? RecallPercent { get; set; }
    public bool RecallAvailable { get; set; }
    public string RecallExplanation { get; set; } = string.Empty;
}
