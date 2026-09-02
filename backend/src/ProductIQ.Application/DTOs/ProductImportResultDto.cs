namespace ProductIQ.Application.DTOs;

public class ProductImportResultDto
{
    public bool Success { get; set; }
    public int ImportedCount { get; set; }
    public int UpdatedCount { get; set; }
    public int TotalProductsNow { get; set; }
    public double ExecutionTimeMs { get; set; }
    public string Message { get; set; } = string.Empty;
}
