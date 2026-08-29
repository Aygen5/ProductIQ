namespace ProductIQ.Application.DTOs;

using System;
using System.Collections.Generic;

public class CandidateAiRiskExplanationDto
{
    public string Summary { get; set; } = string.Empty;
    public string Reasoning { get; set; } = string.Empty;
    public List<string> KeyRisks { get; set; } = new();
    public string OperatorGuidance { get; set; } = string.Empty;
    public string Status { get; set; } = "Generated";
    public DateTime? GeneratedAt { get; set; }
    public string? ModelUsed { get; set; }
}
