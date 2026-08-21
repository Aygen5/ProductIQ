using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProductIQ.Domain.Entities;

namespace ProductIQ.Infrastructure.Persistence.Configurations;

public class RiskAlertConfiguration : IEntityTypeConfiguration<RiskAlert>
{
    public void Configure(EntityTypeBuilder<RiskAlert> builder)
    {
        builder.ToTable("risk_alerts");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.RiskScore)
            .IsRequired();

        builder.Property(r => r.Level)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(r => r.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(r => r.AnomalyType)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(r => r.KeyFindings)
            .HasColumnType("jsonb");

        builder.Property(r => r.AiReasoning)
            .HasColumnType("text");

        builder.Property(r => r.RecommendedAction)
            .HasMaxLength(1000);

        // Relationship
        builder.HasOne(r => r.Product)
            .WithMany()
            .HasForeignKey(r => r.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(r => r.ProductId);
        builder.HasIndex(r => r.Level);
        builder.HasIndex(r => r.Status);
        builder.HasIndex(r => r.AnomalyType);
        builder.HasIndex(r => r.RiskScore);
    }
}
