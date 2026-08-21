namespace ProductIQ.Domain.Entities;

using ProductIQ.Domain.Common;
using ProductIQ.Domain.Common.ValueObjects;

public class Product : BaseEntity
{
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
    public decimal? Price { get; set; }
    public string? Currency { get; set; }
    public string? MainImageUrl { get; set; }
    public string? Country { get; set; }
    public string? DomainName { get; set; }
    public string? RawMetadata { get; set; }

    public ItemDimensions? Dimensions { get; set; }

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<ProductAttribute> Attributes { get; set; } = new List<ProductAttribute>();
}
