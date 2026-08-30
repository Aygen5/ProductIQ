using Microsoft.EntityFrameworkCore;
using ProductIQ.Domain.Entities;

namespace ProductIQ.Application.Interfaces;

public interface IProductIQDbContext
{
    DbSet<Product> Products { get; }
    DbSet<ProductImage> ProductImages { get; }
    DbSet<ProductAttribute> ProductAttributes { get; }
    DbSet<DuplicateCandidate> DuplicateCandidates { get; }
    DbSet<RiskAlert> RiskAlerts { get; }
    DbSet<SystemSetting> SystemSettings { get; }
    DbSet<SearchQueryLog> SearchQueryLogs { get; }
    DbSet<ProductEmbedding> ProductEmbeddings { get; }
    DbSet<ProductImageEmbedding> ProductImageEmbeddings { get; }
    DbSet<User> Users { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
