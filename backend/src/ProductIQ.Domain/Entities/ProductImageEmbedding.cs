namespace ProductIQ.Domain.Entities;

using ProductIQ.Domain.Common;

public class ProductImageEmbedding : BaseEntity
{
    public Guid ProductImageId { get; set; }
    public ProductImage ProductImage { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public required string ModelName { get; set; }
    public int Dimension { get; set; }
    public float[]? Vector { get; set; }
    public string? ContentHash { get; set; }
}
