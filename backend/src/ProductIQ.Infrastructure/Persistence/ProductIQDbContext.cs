using Microsoft.EntityFrameworkCore;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Entities;

namespace ProductIQ.Infrastructure.Persistence;

public class ProductIQDbContext : DbContext, IProductIQDbContext
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
    public DbSet<ProductEmbedding> ProductEmbeddings => Set<ProductEmbedding>();
    public DbSet<ProductImageEmbedding> ProductImageEmbeddings => Set<ProductImageEmbedding>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasPostgresExtension("vector");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ProductIQDbContext).Assembly);
    }
}
