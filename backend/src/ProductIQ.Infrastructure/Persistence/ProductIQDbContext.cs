using Microsoft.EntityFrameworkCore;
using ProductIQ.Domain.Entities;

namespace ProductIQ.Infrastructure.Persistence;

public class ProductIQDbContext : DbContext
{
    public ProductIQDbContext(DbContextOptions<ProductIQDbContext> options)
        : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductAttribute> ProductAttributes => Set<ProductAttribute>();
    public DbSet<DuplicateCandidate> DuplicateCandidates => Set<DuplicateCandidate>();
    public DbSet<RiskAlert> RiskAlerts => Set<RiskAlert>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<SearchQueryLog> SearchQueryLogs => Set<SearchQueryLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ProductIQDbContext).Assembly);
    }
}
