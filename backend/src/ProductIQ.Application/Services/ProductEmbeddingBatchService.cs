namespace ProductIQ.Application.Services;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ProductIQ.Application.Common.Configuration;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Entities;
using ProductIQ.Domain.Enums;

public class ProductEmbeddingBatchService : IProductEmbeddingBatchService
{
    private readonly IProductIQDbContext _context;
    private readonly IProductEmbeddingService _textService;
    private readonly IEmbeddingService _embeddingService;
    private readonly EmbeddingOptions _options;
    private readonly ILogger<ProductEmbeddingBatchService> _logger;

    public ProductEmbeddingBatchService(
        IProductIQDbContext context,
        IProductEmbeddingService textService,
        IEmbeddingService embeddingService,
        IOptions<EmbeddingOptions> options,
        ILogger<ProductEmbeddingBatchService> logger)
    {
        _context = context;
        _textService = textService;
        _embeddingService = embeddingService;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<EmbeddingBatchResultDto> GenerateEmbeddingsForAllProductsAsync(CancellationToken cancellationToken = default)
    {
        var result = new EmbeddingBatchResultDto();
        var totalProducts = await _context.Products.CountAsync(cancellationToken);
        var batchSize = Math.Max(1, _options.BatchSize);
        var modelName = _options.Model;
        var dimension = _options.Dimension;

        _logger.LogInformation("Starting embedding generation for {Total} products in batches of {BatchSize} using model {Model}", totalProducts, batchSize, modelName);

        var page = 0;
        while (true)
        {
            var products = await _context.Products
                .AsNoTracking()
                .Include(p => p.Attributes)
                .OrderBy(p => p.Id)
                .Skip(page * batchSize)
                .Take(batchSize)
                .ToListAsync(cancellationToken);

            if (products.Count == 0)
            {
                break;
            }

            var productIds = products.Select(p => p.Id).ToList();
            var existingEmbeddings = await _context.ProductEmbeddings
                .Where(e => productIds.Contains(e.ProductId) && e.EmbeddingType == EmbeddingType.Text && e.ModelName == modelName)
                .ToListAsync(cancellationToken);

            var existingMap = existingEmbeddings.ToDictionary(e => e.ProductId);

            var itemsToEmbed = new List<(Product Product, string Text, string Hash, ProductEmbedding? Existing)>();

            foreach (var product in products)
            {
                result.TotalProcessed++;
                var text = _textService.BuildProductEmbeddingText(product);
                var hash = _textService.ComputeContentHash(text);

                if (existingMap.TryGetValue(product.Id, out var existing) && existing.ContentHash == hash && existing.Vector != null && existing.Vector.Length == dimension)
                {
                    result.SkippedUnchanged++;
                    continue;
                }

                itemsToEmbed.Add((product, text, hash, existing));
            }

            if (itemsToEmbed.Count > 0)
            {
                try
                {
                    var texts = itemsToEmbed.Select(x => x.Text).ToList();
                    var vectors = await _embeddingService.GenerateEmbeddingsAsync(texts, cancellationToken);

                    for (var i = 0; i < itemsToEmbed.Count; i++)
                    {
                        var item = itemsToEmbed[i];
                        var vector = vectors[i];

                        if (item.Existing != null)
                        {
                            item.Existing.Vector = vector;
                            item.Existing.ContentHash = item.Hash;
                            item.Existing.Dimension = dimension;
                            item.Existing.UpdatedAt = DateTime.UtcNow;
                        }
                        else
                        {
                            var newEmbedding = new ProductEmbedding
                            {
                                Id = Guid.NewGuid(),
                                ProductId = item.Product.Id,
                                EmbeddingType = EmbeddingType.Text,
                                ModelName = modelName,
                                Dimension = dimension,
                                Vector = vector,
                                ContentHash = item.Hash,
                                CreatedAt = DateTime.UtcNow
                            };
                            _context.ProductEmbeddings.Add(newEmbedding);
                        }

                        result.NewlyGenerated++;
                    }

                    await _context.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("Successfully processed batch {Page}: {Generated} new, {Skipped} skipped", page + 1, itemsToEmbed.Count, products.Count - itemsToEmbed.Count);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing batch {Page}", page + 1);
                    result.Failed += itemsToEmbed.Count;
                    result.Errors.Add($"Batch {page + 1}: {ex.Message}");
                }
            }

            page++;
        }

        return result;
    }

    public async Task<EmbeddingBatchResultDto> GenerateEmbeddingForProductAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        var result = new EmbeddingBatchResultDto();
        var modelName = _options.Model;
        var dimension = _options.Dimension;

        var product = await _context.Products
            .Include(p => p.Attributes)
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null)
        {
            result.Failed = 1;
            result.Errors.Add($"Product with ID '{productId}' was not found.");
            return result;
        }

        result.TotalProcessed = 1;
        var text = _textService.BuildProductEmbeddingText(product);
        var hash = _textService.ComputeContentHash(text);

        var existing = await _context.ProductEmbeddings
            .FirstOrDefaultAsync(e => e.ProductId == productId && e.EmbeddingType == EmbeddingType.Text && e.ModelName == modelName, cancellationToken);

        if (existing != null && existing.ContentHash == hash && existing.Vector != null && existing.Vector.Length == dimension)
        {
            result.SkippedUnchanged = 1;
            return result;
        }

        try
        {
            var vector = await _embeddingService.GenerateEmbeddingAsync(text, cancellationToken);

            if (existing != null)
            {
                existing.Vector = vector;
                existing.ContentHash = hash;
                existing.Dimension = dimension;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var newEmbedding = new ProductEmbedding
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    EmbeddingType = EmbeddingType.Text,
                    ModelName = modelName,
                    Dimension = dimension,
                    Vector = vector,
                    ContentHash = hash,
                    CreatedAt = DateTime.UtcNow
                };
                _context.ProductEmbeddings.Add(newEmbedding);
            }

            await _context.SaveChangesAsync(cancellationToken);
            result.NewlyGenerated = 1;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating embedding for product {ProductId}", productId);
            result.Failed = 1;
            result.Errors.Add(ex.Message);
        }

        return result;
    }
}
