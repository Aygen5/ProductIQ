using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProductIQ.Domain.Entities;

namespace ProductIQ.Infrastructure.Persistence.Configurations;

public class ProductAttributeConfiguration : IEntityTypeConfiguration<ProductAttribute>
{
    public void Configure(EntityTypeBuilder<ProductAttribute> builder)
    {
        builder.ToTable("product_attributes");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Key)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(a => a.Value)
            .IsRequired();

        builder.Property(a => a.Language)
            .HasMaxLength(20);

        builder.HasIndex(a => a.ProductId);
        builder.HasIndex(a => new { a.ProductId, a.Key });
    }
}
