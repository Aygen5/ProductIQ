namespace ProductIQ.Application.DTOs;

public class ProductQueryParameters
{
    private const int MaxPageSize = 100;
    private const int DefaultPageSize = 20;

    private int _page = 1;
    private int _pageSize = DefaultPageSize;

    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value < 1 ? 1 : (value > MaxPageSize ? MaxPageSize : value);
    }

    public string? Search { get; set; }
    public string? Brand { get; set; }
    public string? Category { get; set; }
    public string? ProductType { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
}
