namespace ProductIQ.Application.DTOs;

public class ProductQueryParameters
{
    private static readonly HashSet<string> AllowedSortFields = new(StringComparer.OrdinalIgnoreCase)
    {
        "name", "brand", "category", "producttype", "price", "createdat"
    };

    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;

    public string? Search { get; set; }
    public string? Brand { get; set; }
    public string? Category { get; set; }
    public string? ProductType { get; set; }

    private string? _sortBy;
    public string? SortBy
    {
        get => _sortBy;
        set => _sortBy = value != null && AllowedSortFields.Contains(value.Trim()) ? value.Trim() : null;
    }

    public string? SortDirection { get; set; }

    public bool SortDescending => string.Equals(SortDirection, "desc", StringComparison.OrdinalIgnoreCase);
}
