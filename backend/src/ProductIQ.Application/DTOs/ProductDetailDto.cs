namespace ProductIQ.Application.DTOs;

public class ProductDetailDto
{
    public Guid Id { get; set; }
    public required string AmazonItemId { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? Brand { get; set; }
    public string? Category { get; set; }
    public long? NodeId { get; set; }
    public string? NodePath { get; set; }
    public string? ProductType { get; set; }
    public string? ModelName { get; set; }
    public string? ModelNumber { get; set; }
    public string? Color { get; set; }
    public string? Material { get; set; }
    public ItemDimensionsDto? Dimensions { get; set; }
    public decimal? Price { get; set; }
    public string? Currency { get; set; }
    public string? MainImageUrl { get; set; }
    public string? Country { get; set; }
    public string? DomainName { get; set; }
    public List<ProductImageDto> Images { get; set; } = new();
    public List<ProductAttributeDto> Attributes { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
