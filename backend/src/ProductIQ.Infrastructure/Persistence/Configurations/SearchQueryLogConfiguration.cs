using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ProductIQ.Domain.Entities;

namespace ProductIQ.Infrastructure.Persistence.Configurations;

public class SearchQueryLogConfiguration : IEntityTypeConfiguration<SearchQueryLog>
{
    public void Configure(EntityTypeBuilder<SearchQueryLog> builder)
    {
        builder.ToTable("search_query_logs");

        builder.HasKey(q => q.Id);

        builder.Property(q => q.QueryText)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(q => q.ExecutionTimeMs)
            .IsRequired();

        builder.Property(q => q.TotalResults)
            .IsRequired();

        builder.Property(q => q.AvgRelevanceScore)
            .HasColumnType("numeric(5,4)");

        builder.HasIndex(q => q.CreatedAt);
    }
}
