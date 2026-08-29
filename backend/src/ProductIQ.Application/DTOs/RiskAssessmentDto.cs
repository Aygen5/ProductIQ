namespace ProductIQ.Application.DTOs;

using System.Collections.Generic;

public class RiskAssessmentDto
{
    public int RiskScore { get; set; }
    public string RiskLevel { get; set; } = "Low";
    public string Summary { get; set; } = string.Empty;
    public List<RiskSignalDto> RiskSignals { get; set; } = new();
    public int ConflictingSignalsCount { get; set; }
    public int DataQualityIssuesCount { get; set; }
    public bool RequiresImmediateReview { get; set; }
    public CandidateAiRiskExplanationDto? AiExplanation { get; set; }
}
