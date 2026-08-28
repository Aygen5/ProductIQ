namespace ProductIQ.Application.DTOs;

public class DuplicateCandidatesSummaryDto
{
    public int TotalCandidates { get; set; }
    public int ScoredCandidates { get; set; }
    public int PotentialCount { get; set; }
    public int ConfirmedCount { get; set; }
    public int RejectedCount { get; set; }
    public int HighConfidenceCount { get; set; }
    public int MediumConfidenceCount { get; set; }
    public int LowConfidenceCount { get; set; }
    public decimal AverageOverallScore { get; set; }
    public decimal MinimumScore { get; set; }
    public decimal MaximumScore { get; set; }
}
