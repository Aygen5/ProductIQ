namespace ProductIQ.Application.DTOs;

public class CandidateExplanationDto
{
    public string Summary { get; set; } = string.Empty;
    public string ConfidenceLevel { get; set; } = string.Empty;
    public List<string> KeyMatches { get; set; } = new();
    public List<string> KeyDifferences { get; set; } = new();
    public string Recommendation { get; set; } = string.Empty;
}
