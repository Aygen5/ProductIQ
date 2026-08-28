namespace ProductIQ.Application.DTOs;

public class BatchScoringResultDto
{
    public int TotalCandidatesEvaluated { get; set; }
    public int TotalCandidatesScored { get; set; }
    public decimal AverageOverallScore { get; set; }
    public decimal HighestScore { get; set; }
    public decimal LowestScore { get; set; }
    public TimeSpan ExecutionDuration { get; set; }
    public List<CandidateScoringResultDto> ScoredCandidates { get; set; } = new();
}
