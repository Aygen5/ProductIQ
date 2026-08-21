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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Register PostgreSQL pgvector extension for future vector embeddings
        modelBuilder.HasPostgresExtension("vector");

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ProductIQDbContext).Assembly);
    }
}
