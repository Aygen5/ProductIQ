namespace ProductIQ.Application.DTOs;

using System.Collections.Generic;

public class QueryAnalysisDto
{
    public string RawQuery { get; set; } = string.Empty;
    public string NormalizedQuery { get; set; } = string.Empty;
    public string? DetectedBrand { get; set; }
    public string? DetectedCategory { get; set; }
    public string? DetectedModel { get; set; }
    public string SearchIntent { get; set; } = "GeneralSearch";
    public List<string> KeyTerms { get; set; } = new();
    public bool HasVisualAdjectives { get; set; }
}
