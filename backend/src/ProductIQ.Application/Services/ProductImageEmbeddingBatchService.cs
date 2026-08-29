namespace ProductIQ.Application.Services;

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ProductIQ.Application.Common.Configuration;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Entities;

public class ProductImageEmbeddingBatchService : IProductImageEmbeddingBatchService
{
    private readonly IProductIQDbContext _context;
    private readonly IClipImageEmbeddingService _clipService;
    private readonly ClipOptions _options;
    private readonly ILogger<ProductImageEmbeddingBatchService> _logger;

    public ProductImageEmbeddingBatchService(
        IProductIQDbContext context,
        IClipImageEmbeddingService clipService,
        IOptions<ClipOptions> options,
        ILogger<ProductImageEmbeddingBatchService> logger)
    {
        _context = context;
        _clipService = clipService;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<ImageEmbeddingBatchResultDto> GenerateImageEmbeddingsForAllProductImagesAsync(CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var result = new ImageEmbeddingBatchResultDto();
        var batchSize = Math.Max(1, _options.BatchSize);
        var modelName = _options.ModelName;
        var dimension = _options.Dimension;

        var totalImagesCount = await _context.ProductImages.CountAsync(cancellationToken);
        _logger.LogInformation("Starting CLIP image embedding generation for {Total} product images in batches of {BatchSize} using model {Model} ({Dimension}-dim)",
            totalImagesCount, batchSize, modelName, dimension);

        var page = 0;
        while (true)
        {
            var images = await _context.ProductImages
                .AsNoTracking()
                .Include(pi => pi.Product)
                .OrderBy(pi => pi.Id)
                .Skip(page * batchSize)
                .Take(batchSize)
                .ToListAsync(cancellationToken);

            if (images.Count == 0)
            {
                break;
            }

            var imageIds = images.Select(i => i.Id).ToList();
            var existingEmbeddings = await _context.ProductImageEmbeddings
                .Where(e => imageIds.Contains(e.ProductImageId) && e.ModelName == modelName && e.Dimension == dimension)
                .ToListAsync(cancellationToken);

            var existingMap = existingEmbeddings.ToDictionary(e => e.ProductImageId);
            var distinctProductIdsInBatch = new HashSet<Guid>();

            foreach (var img in images)
            {
                result.TotalImagesEvaluated++;
                distinctProductIdsInBatch.Add(img.ProductId);

                if (existingMap.TryGetValue(img.Id, out var existing) && existing.Vector != null && existing.Vector.Length == dimension)
                {
                    result.EmbeddingsSkipped++;
                    continue;
                }

                if (string.IsNullOrWhiteSpace(img.Url))
                {
                    result.FailedImages++;
                    result.Errors.Add($"Image ID {img.ImageId} on product {img.ProductId} has empty URL.");
                    continue;
                }

                try
                {
                    var vector = await _clipService.GenerateImageEmbeddingFromUrlAsync(img.Url, cancellationToken);
                    var hash = ComputeStringHash(img.Url);

                    var newEmbedding = new ProductImageEmbedding
                    {
                        Id = Guid.NewGuid(),
                        ProductImageId = img.Id,
                        ProductId = img.ProductId,
                        ModelName = modelName,
                        Dimension = dimension,
                        Vector = vector,
                        ContentHash = hash,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.ProductImageEmbeddings.Add(newEmbedding);
                    result.EmbeddingsCreated++;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to generate CLIP embedding for Image {ImageId} (URL: {Url}): {Message}", img.ImageId, img.Url, ex.Message);
                    result.FailedImages++;
                    result.Errors.Add($"Image {img.ImageId} ({img.Url}): {ex.Message}");
                }
            }

            result.TotalProductsEvaluated += distinctProductIdsInBatch.Count;

            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Processed batch {Page}: {Created} created, {Skipped} skipped, {Failed} failed",
                page + 1, result.EmbeddingsCreated, result.EmbeddingsSkipped, result.FailedImages);

            page++;
        }

        stopwatch.Stop();
        result.ExecutionDuration = stopwatch.Elapsed;
        _logger.LogInformation("Finished CLIP image embedding pipeline in {Elapsed}ms. Created: {Created}, Skipped: {Skipped}, Failed: {Failed}",
            result.ExecutionDuration.TotalMilliseconds, result.EmbeddingsCreated, result.EmbeddingsSkipped, result.FailedImages);

        return result;
    }

    public async Task<ImageEmbeddingBatchResultDto> GenerateImageEmbeddingsForProductAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var result = new ImageEmbeddingBatchResultDto();
        var modelName = _options.ModelName;
        var dimension = _options.Dimension;

        var product = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null)
        {
            result.Errors.Add($"Product with ID '{productId}' was not found.");
            return result;
        }

        result.TotalProductsEvaluated = 1;
        var images = product.Images.ToList();
        var imageIds = images.Select(i => i.Id).ToList();

        var existingEmbeddings = await _context.ProductImageEmbeddings
            .Where(e => imageIds.Contains(e.ProductImageId) && e.ModelName == modelName && e.Dimension == dimension)
            .ToListAsync(cancellationToken);

        var existingMap = existingEmbeddings.ToDictionary(e => e.ProductImageId);

        foreach (var img in images)
        {
            result.TotalImagesEvaluated++;

            if (existingMap.TryGetValue(img.Id, out var existing) && existing.Vector != null && existing.Vector.Length == dimension)
            {
                result.EmbeddingsSkipped++;
                continue;
            }

            if (string.IsNullOrWhiteSpace(img.Url))
            {
                result.FailedImages++;
                continue;
            }

            try
            {
                var vector = await _clipService.GenerateImageEmbeddingFromUrlAsync(img.Url, cancellationToken);
                var hash = ComputeStringHash(img.Url);

                var newEmbedding = new ProductImageEmbedding
                {
                    Id = Guid.NewGuid(),
                    ProductImageId = img.Id,
                    ProductId = img.ProductId,
                    ModelName = modelName,
                    Dimension = dimension,
                    Vector = vector,
                    ContentHash = hash,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ProductImageEmbeddings.Add(newEmbedding);
                result.EmbeddingsCreated++;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to generate CLIP embedding for Image {ImageId}: {Message}", img.ImageId, ex.Message);
                result.FailedImages++;
                result.Errors.Add($"Image {img.ImageId}: {ex.Message}");
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        stopwatch.Stop();
        result.ExecutionDuration = stopwatch.Elapsed;
        return result;
    }

    private static string ComputeStringHash(string input)
    {
        var bytes = System.Text.Encoding.UTF8.GetBytes(input);
        var hashBytes = SHA256.HashData(bytes);
        return Convert.ToHexStringLower(hashBytes);
    }
}
