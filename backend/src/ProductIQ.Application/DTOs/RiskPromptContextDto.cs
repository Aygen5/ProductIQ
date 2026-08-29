namespace ProductIQ.Application.DTOs;

using System;
using System.Collections.Generic;

public class RiskPromptContextDto
{
    public Guid CandidateId { get; set; }
    public decimal OverallDuplicateScore { get; set; }
    public int RiskScore { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public string ProductAName { get; set; } = string.Empty;
    public string ProductBName { get; set; } = string.Empty;
    public List<RiskSignalDto> RiskSignals { get; set; } = new();
    public string DeterministicSummary { get; set; } = string.Empty;
}
