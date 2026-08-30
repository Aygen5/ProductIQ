namespace ProductIQ.Application.DTOs;

using System.Collections.Generic;

public class SearchResponseDto
{
    public string Query { get; set; } = string.Empty;
    public string Mode { get; set; } = "Hybrid";
    public int TotalCount { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public long ExecutionTimeMs { get; set; }
    public QueryAnalysisDto QueryAnalysis { get; set; } = new();
    public List<SearchResultDto> Results { get; set; } = new();
}
