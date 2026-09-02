namespace ProductIQ.UnitTests.Common;

using System;
using Microsoft.EntityFrameworkCore;
using ProductIQ.Domain.Entities;
using ProductIQ.Infrastructure.Persistence;

public class TestProductIQDbContext : ProductIQDbContext
{
    public TestProductIQDbContext(DbContextOptions<ProductIQDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<ProductEmbedding>().Ignore(e => e.Vector);
        modelBuilder.Entity<ProductImageEmbedding>().Ignore(e => e.Vector);
    }
}

public static class TestDbContextFactory
{
    public static ProductIQDbContext Create(string? databaseName = null)
    {
        var dbName = databaseName ?? Guid.NewGuid().ToString();

        var options = new DbContextOptionsBuilder<ProductIQDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;

        var context = new TestProductIQDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }
}
