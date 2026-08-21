using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProductIQ.Domain.Entities;

namespace ProductIQ.Infrastructure.Persistence.Configurations;

public class DuplicateCandidateConfiguration : IEntityTypeConfiguration<DuplicateCandidate>
{
    public void Configure(EntityTypeBuilder<DuplicateCandidate> builder)
    {
        builder.ToTable("duplicate_candidates");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.OverallScore)
            .HasColumnType("numeric(5,4)")
            .IsRequired();

        builder.Property(d => d.TextSimilarity)
            .HasColumnType("numeric(5,4)");

        builder.Property(d => d.SemanticSimilarity)
            .HasColumnType("numeric(5,4)");

        builder.Property(d => d.AttributeSimilarity)
            .HasColumnType("numeric(5,4)");

        builder.Property(d => d.VisualSimilarity)
            .HasColumnType("numeric(5,4)");

        builder.Property(d => d.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(d => d.MatchSignals)
            .HasColumnType("jsonb");

        builder.Property(d => d.AiExplanation)
            .HasColumnType("text");

        builder.Property(d => d.ResolutionNotes)
            .HasMaxLength(2000);

        // Relationships: Restrict on delete to avoid cascade cycles
        builder.HasOne(d => d.ProductA)
            .WithMany()
            .HasForeignKey(d => d.ProductAId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.ProductB)
            .WithMany()
            .HasForeignKey(d => d.ProductBId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(d => d.ProductAId);
        builder.HasIndex(d => d.ProductBId);
        builder.HasIndex(d => new { d.ProductAId, d.ProductBId }).IsUnique();
        builder.HasIndex(d => d.OverallScore);
        builder.HasIndex(d => d.Status);
    }
}
