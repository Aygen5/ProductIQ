namespace ProductIQ.Application.DTOs;

using System;

public class SearchQueryLogDto
{
    public Guid Id { get; set; }
    public string QueryText { get; set; } = string.Empty;
    public int ExecutionTimeMs { get; set; }
    public int TotalResults { get; set; }
    public decimal? AvgRelevanceScore { get; set; }
    public DateTime CreatedAt { get; set; }
}
