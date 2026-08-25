namespace ProductIQ.Application.DTOs;

public class ProductSummaryDto
{
    public Guid Id { get; set; }
    public required string AmazonItemId { get; set; }
    public required string Name { get; set; }
    public string? Brand { get; set; }
    public string? Category { get; set; }
    public string? NodePath { get; set; }
    public string? ProductType { get; set; }
    public string? MainImageUrl { get; set; }
    public decimal? Price { get; set; }
    public string? Currency { get; set; }
    public DateTime CreatedAt { get; set; }
}
