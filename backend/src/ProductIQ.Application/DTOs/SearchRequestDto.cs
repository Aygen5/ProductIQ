namespace ProductIQ.Application.DTOs;

using ProductIQ.Domain.Enums;

public class SearchRequestDto
{
    public string Query { get; set; } = string.Empty;
    public SearchMode Mode { get; set; } = SearchMode.Hybrid;
    public string? Brand { get; set; }
    public string? Category { get; set; }
    public double? MinScore { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
