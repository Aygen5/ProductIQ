namespace ProductIQ.Application.DTOs;

public class RiskSignalDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public int ScoreContribution { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Evidence { get; set; } = string.Empty;
}
