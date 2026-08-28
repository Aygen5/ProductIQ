namespace ProductIQ.Application.DTOs;

public class CandidateScoringResultDto
{
    public Guid CandidateId { get; set; }
    public Guid ProductAId { get; set; }
    public Guid ProductBId { get; set; }
    public string? ProductAAsin { get; set; }
    public string? ProductBAsin { get; set; }
    public string? ProductAName { get; set; }
    public string? ProductBName { get; set; }
    public DuplicateScoreBreakdownDto ScoreBreakdown { get; set; } = new();
}
