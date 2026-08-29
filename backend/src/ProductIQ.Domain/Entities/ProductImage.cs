namespace ProductIQ.Domain.Entities;

using ProductIQ.Domain.Common;

public class ProductImage : BaseEntity
{
    public Guid ProductId { get; set; }
    public required string ImageId { get; set; }
    public string? Path { get; set; }
    public string? Url { get; set; }
    public int? Height { get; set; }
    public int? Width { get; set; }
    public bool IsMain { get; set; }

    public Product Product { get; set; } = null!;
    public ProductImageEmbedding? Embedding { get; set; }
}
