namespace ProductIQ.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Pgvector;
using Pgvector.EntityFrameworkCore;
using ProductIQ.Application.Common.Configuration;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Enums;

public class SimilaritySearchService : ISimilaritySearchService
{
    private readonly IProductIQDbContext _context;
    private readonly EmbeddingOptions _options;

    public SimilaritySearchService(
        IProductIQDbContext context,
        IOptions<EmbeddingOptions> options)
    {
        _context = context;
        _options = options.Value;
    }

    public async Task<IReadOnlyList<SimilarProductDto>> FindSimilarProductsAsync(Guid productId, int limit = 10, double? minSimilarity = null, CancellationToken cancellationToken = default)
    {
        var modelName = _options.Model;

        var sourceEmbedding = await _context.ProductEmbeddings
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.ProductId == productId && e.EmbeddingType == EmbeddingType.Text && e.ModelName == modelName && e.Vector != null, cancellationToken);

        if (sourceEmbedding == null || sourceEmbedding.Vector == null)
        {
            return Array.Empty<SimilarProductDto>();
        }

        return await FindSimilarByVectorInternalAsync(sourceEmbedding.Vector, productId, limit, minSimilarity, cancellationToken);
    }

    public async Task<IReadOnlyList<SimilarProductDto>> FindSimilarByVectorAsync(float[] vector, int limit = 10, double? minSimilarity = null, CancellationToken cancellationToken = default)
    {
        return await FindSimilarByVectorInternalAsync(vector, null, limit, minSimilarity, cancellationToken);
    }

    private async Task<IReadOnlyList<SimilarProductDto>> FindSimilarByVectorInternalAsync(
        float[] vector,
        Guid? excludeProductId,
        int limit,
        double? minSimilarity,
        CancellationToken cancellationToken)
    {
        var modelName = _options.Model;
        var pgVector = new Vector(vector);

        var query = _context.ProductEmbeddings
            .AsNoTracking()
            .Where(e => e.EmbeddingType == EmbeddingType.Text && e.ModelName == modelName && e.Vector != null);

        if (excludeProductId.HasValue)
        {
            query = query.Where(e => e.ProductId != excludeProductId.Value);
        }

        var projectionQuery = query
            .Select(e => new
            {
                e.ProductId,
                e.Product.AmazonItemId,
                e.Product.Name,
                e.Product.Brand,
                Category = e.Product.Category ?? e.Product.NodePath,
                e.Product.MainImageUrl,
                Distance = e.Vector!.CosineDistance(pgVector)
            });

        if (minSimilarity.HasValue)
        {
            projectionQuery = projectionQuery.Where(x => 1.0 - x.Distance >= minSimilarity.Value);
        }

        var results = await projectionQuery
            .OrderBy(x => x.Distance)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return results.Select(r => new SimilarProductDto
        {
            ProductId = r.ProductId,
            AmazonItemId = r.AmazonItemId,
            Name = r.Name,
            Brand = r.Brand,
            Category = r.Category,
            MainImageUrl = r.MainImageUrl,
            CosineDistance = r.Distance,
            SimilarityScore = Math.Round(1.0 - r.Distance, 4)
        }).ToList();
    }
}
