using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProductIQ.Domain.Entities;

namespace ProductIQ.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.AmazonItemId)
            .HasMaxLength(64)
            .IsRequired();

        builder.HasIndex(p => p.AmazonItemId)
            .IsUnique();

        builder.Property(p => p.Name)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(p => p.Brand)
            .HasMaxLength(255);
        builder.HasIndex(p => p.Brand);

        builder.Property(p => p.ProductType)
            .HasMaxLength(100);
        builder.HasIndex(p => p.ProductType);

        builder.Property(p => p.Category)
            .HasMaxLength(1000);

        builder.Property(p => p.ModelName)
            .HasMaxLength(255);

        builder.Property(p => p.ModelNumber)
            .HasMaxLength(255);

        builder.Property(p => p.Color)
            .HasMaxLength(100);

        builder.Property(p => p.Material)
            .HasMaxLength(255);

        builder.Property(p => p.Price)
            .HasColumnType("numeric(12,2)");

        builder.Property(p => p.Currency)
            .HasMaxLength(10);

        builder.Property(p => p.MainImageUrl)
            .HasMaxLength(2048);

        builder.Property(p => p.Country)
            .HasMaxLength(10);

        builder.Property(p => p.DomainName)
            .HasMaxLength(100);

        builder.Property(p => p.RawMetadata)
            .HasColumnType("jsonb");

        // Relationships
        builder.HasMany(p => p.Images)
            .WithOne(i => i.Product)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Attributes)
            .WithOne(a => a.Product)
            .HasForeignKey(a => a.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
