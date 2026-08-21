namespace ProductIQ.Domain.Entities;

using ProductIQ.Domain.Common;

public class SearchQueryLog : BaseEntity
{
    public required string QueryText { get; set; }
    public int ExecutionTimeMs { get; set; }
    public int TotalResults { get; set; }
    public decimal? AvgRelevanceScore { get; set; }
}
