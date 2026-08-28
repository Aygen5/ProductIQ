namespace ProductIQ.Domain.Entities;

using ProductIQ.Domain.Common;
using ProductIQ.Domain.Enums;

public class ProductEmbedding : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public EmbeddingType EmbeddingType { get; set; } = EmbeddingType.Text;
    public required string ModelName { get; set; }
    public int Dimension { get; set; }
    public float[]? Vector { get; set; }
    public string? ContentHash { get; set; }
}
