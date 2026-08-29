using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pgvector;
using ProductIQ.Domain.Entities;

namespace ProductIQ.Infrastructure.Persistence.Configurations;

public class ProductImageEmbeddingConfiguration : IEntityTypeConfiguration<ProductImageEmbedding>
{
    public void Configure(EntityTypeBuilder<ProductImageEmbedding> builder)
    {
        builder.ToTable("product_image_embeddings");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.ProductImageId)
            .IsRequired();

        builder.Property(e => e.ProductId)
            .IsRequired();

        builder.Property(e => e.ModelName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.Dimension)
            .IsRequired();

        builder.Property(e => e.ContentHash)
            .HasMaxLength(64);

        var vectorComparer = new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<float[]?>(
            (c1, c2) => System.Collections.StructuralComparisons.StructuralEqualityComparer.Equals(c1, c2),
            c => c == null ? 0 : System.Collections.StructuralComparisons.StructuralEqualityComparer.GetHashCode(c),
            c => c == null ? null : (float[])c.Clone()
        );

        builder.Property(e => e.Vector)
            .HasColumnType("vector(512)")
            .HasConversion(
                v => v == null ? null : new Vector(v),
                v => v == null ? null : v.ToArray(),
                vectorComparer
            );

        builder.HasIndex(e => new { e.ProductImageId, e.ModelName })
            .IsUnique();

        builder.HasIndex(e => e.ProductId);

        builder.HasOne(e => e.ProductImage)
            .WithOne(pi => pi.Embedding)
            .HasForeignKey<ProductImageEmbedding>(e => e.ProductImageId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Product)
            .WithMany(p => p.ImageEmbeddings)
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
