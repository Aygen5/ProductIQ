namespace ProductIQ.Application.DTOs;

using System.Collections.Generic;

public class SearchAnalyticsDto
{
    public int TotalSearches { get; set; }
    public int ZeroResultSearches { get; set; }
    public double ZeroResultRate { get; set; }
    public int ZeroResultRatePercent { get; set; }
    public double? AverageSearchRelevance { get; set; }
    public int? AverageSearchRelevancePercent { get; set; }
    public double AverageExecutionTimeMs { get; set; }
    public bool SearchRelevanceAvailable { get; set; }
    public bool ZeroResultRateAvailable { get; set; }
    public string RelevanceExplanation { get; set; } = string.Empty;
    public List<SearchQueryLogDto> RecentSearches { get; set; } = new();
}
