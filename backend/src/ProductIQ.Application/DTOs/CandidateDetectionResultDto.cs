namespace ProductIQ.Application.DTOs;

public class CandidateDetectionResultDto
{
    public int TotalProductsEvaluated { get; set; }
    public int TotalCandidatePairsFound { get; set; }
    public int NewlySavedCandidates { get; set; }
    public int SkippedExistingCandidates { get; set; }
    public TimeSpan ExecutionDuration { get; set; }
    public Dictionary<string, int> RuleMatchCounts { get; set; } = new();
}
