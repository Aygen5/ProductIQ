using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pgvector;
using ProductIQ.Domain.Entities;

namespace ProductIQ.Infrastructure.Persistence.Configurations;

public class ProductEmbeddingConfiguration : IEntityTypeConfiguration<ProductEmbedding>
{
    public void Configure(EntityTypeBuilder<ProductEmbedding> builder)
    {
        builder.ToTable("product_embeddings");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.ProductId)
            .IsRequired();

        builder.HasIndex(e => e.ProductId);

        builder.Property(e => e.EmbeddingType)
            .HasConversion<int>()
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
            .HasColumnType("vector(1536)")
            .HasConversion(
                v => v == null ? null : new Vector(v),
                v => v == null ? null : v.ToArray(),
                vectorComparer
            );

        builder.HasIndex(e => new { e.ProductId, e.EmbeddingType, e.ModelName })
            .IsUnique();

        builder.HasOne(e => e.Product)
            .WithMany(p => p.Embeddings)
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
