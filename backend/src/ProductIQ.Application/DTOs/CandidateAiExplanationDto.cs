namespace ProductIQ.Application.DTOs;

using System;
using System.Collections.Generic;

public class CandidateAiExplanationDto
{
    public string Summary { get; set; } = string.Empty;
    public string Reasoning { get; set; } = string.Empty;
    public List<string> KeyMatches { get; set; } = new();
    public List<string> KeyConflicts { get; set; } = new();
    public string OperatorGuidance { get; set; } = string.Empty;
    public string Status { get; set; } = "Generated";
    public DateTime? GeneratedAt { get; set; }
    public string? ModelUsed { get; set; }
}
