namespace ProductIQ.Application.DTOs;

public class CatalogAnalyticsDto
{
    public int TotalProducts { get; set; }
    public int ProductsWithImages { get; set; }
    public int ProductsWithAttributes { get; set; }
    public int TotalBrands { get; set; }
    public int TotalCategories { get; set; }
}
