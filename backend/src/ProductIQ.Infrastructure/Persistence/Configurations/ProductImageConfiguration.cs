using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProductIQ.Domain.Entities;

namespace ProductIQ.Infrastructure.Persistence.Configurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("product_images");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.ImageId)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(i => i.Path)
            .HasMaxLength(500);

        builder.Property(i => i.Url)
            .HasMaxLength(2048);

        builder.HasIndex(i => i.ProductId);
        builder.HasIndex(i => i.ImageId);
    }
}
