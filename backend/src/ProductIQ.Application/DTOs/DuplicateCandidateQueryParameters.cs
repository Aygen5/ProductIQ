namespace ProductIQ.Application.DTOs;

using ProductIQ.Domain.Enums;

public class DuplicateCandidateQueryParameters
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public decimal? MinScore { get; set; }
    public decimal? MaxScore { get; set; }
    public DuplicateStatus? Status { get; set; }
    public string? Brand { get; set; }
    public string? Search { get; set; }
    public string? SortBy { get; set; } = "score";
    public string? SortDirection { get; set; } = "desc";
}
