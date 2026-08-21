using Microsoft.EntityFrameworkCore;

namespace ProductIQ.Infrastructure.Persistence;

public class ProductIQDbContext : DbContext
{
    public ProductIQDbContext(DbContextOptions<ProductIQDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ProductIQDbContext).Assembly);
    }
}
