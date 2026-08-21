namespace ProductIQ.Domain.Entities;

using ProductIQ.Domain.Common;

public class ProductAttribute : BaseEntity
{
    public Guid ProductId { get; set; }
    public required string Key { get; set; }
    public required string Value { get; set; }
    public string? Language { get; set; }

    public Product Product { get; set; } = null!;
}
