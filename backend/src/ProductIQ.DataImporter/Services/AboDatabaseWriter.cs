using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ProductIQ.DataImporter.Models.Normalized;
using ProductIQ.Domain.Entities;
using ProductIQ.Infrastructure.Persistence;

namespace ProductIQ.DataImporter.Services;

public class ImportBatchResult
{
    public int InsertedCount { get; set; }
    public int UpdatedCount { get; set; }
    public int ImagesCount { get; set; }
    public int AttributesCount { get; set; }
}

public interface IAboDatabaseWriter
{
    Task<ImportBatchResult> WriteBatchAsync(IReadOnlyList<NormalizedProductImport> items, CancellationToken ct = default);
}

public class AboDatabaseWriter(ILogger<AboDatabaseWriter> logger, ProductIQDbContext dbContext) : IAboDatabaseWriter
{
    public async Task<ImportBatchResult> WriteBatchAsync(IReadOnlyList<NormalizedProductImport> items, CancellationToken ct = default)
    {
        if (items.Count == 0) return new ImportBatchResult();

        var result = new ImportBatchResult();
        var itemIds = items.Select(x => x.AmazonItemId).Distinct().ToList();

        // 1. Query existing products in batch
        var existingProducts = await dbContext.Products
            .AsSplitQuery()
            .Include(p => p.Images)
            .Include(p => p.Attributes)
            .Where(p => itemIds.Contains(p.AmazonItemId))
            .ToDictionaryAsync(p => p.AmazonItemId, ct);

        foreach (var item in items)
        {
            if (existingProducts.TryGetValue(item.AmazonItemId, out var existing))
            {
                // UPDATE (Idempotent update)
                existing.Name = item.Name;
                existing.Description = item.Description;
                existing.Brand = item.Brand;
                existing.Category = item.Category;
                existing.NodeId = item.NodeId;
                existing.NodePath = item.NodePath;
                existing.ProductType = item.ProductType;
                existing.ModelName = item.ModelName;
                existing.ModelNumber = item.ModelNumber;
                existing.Color = item.Color;
                existing.Material = item.Material;
                existing.MainImageUrl = item.MainImageUrl;
                existing.Country = item.Country;
                existing.DomainName = item.DomainName;
                existing.RawMetadata = item.RawMetadata;
                existing.Dimensions = item.Dimensions;
                existing.UpdatedAt = DateTime.UtcNow;

                // Sync Images
                var newImageIds = item.Images.Select(x => x.ImageId).ToHashSet(StringComparer.Ordinal);
                var imagesToRemove = existing.Images.Where(img => !newImageIds.Contains(img.ImageId)).ToList();
                foreach (var img in imagesToRemove)
                {
                    existing.Images.Remove(img);
                }

                foreach (var img in item.Images)
                {
                    var existingImg = existing.Images.FirstOrDefault(x => x.ImageId == img.ImageId);
                    if (existingImg != null)
                    {
                        existingImg.Path = img.Path;
                        existingImg.Url = img.Url;
                        existingImg.Height = img.Height;
                        existingImg.Width = img.Width;
                        existingImg.IsMain = img.IsMain;
                    }
                    else
                    {
                        existing.Images.Add(new ProductImage
                        {
                            ImageId = img.ImageId,
                            Path = img.Path,
                            Url = img.Url,
                            Height = img.Height,
                            Width = img.Width,
                            IsMain = img.IsMain
                        });
                    }
                    result.ImagesCount++;
                }

                // Sync Attributes
                var newAttrKeys = item.Attributes.Select(x => x.Key).ToHashSet(StringComparer.Ordinal);
                var attrsToRemove = existing.Attributes.Where(a => !newAttrKeys.Contains(a.Key)).ToList();
                foreach (var attr in attrsToRemove)
                {
                    existing.Attributes.Remove(attr);
                }

                foreach (var attr in item.Attributes)
                {
                    var existingAttr = existing.Attributes.FirstOrDefault(x => x.Key == attr.Key);
                    if (existingAttr != null)
                    {
                        existingAttr.Value = attr.Value;
                        existingAttr.Language = attr.Language;
                    }
                    else
                    {
                        existing.Attributes.Add(new ProductAttribute
                        {
                            Key = attr.Key,
                            Value = attr.Value,
                            Language = attr.Language
                        });
                    }
                    result.AttributesCount++;
                }

                result.UpdatedCount++;
            }
            else
            {
                // INSERT
                var newProduct = new Product
                {
                    AmazonItemId = item.AmazonItemId,
                    Name = item.Name,
                    Description = item.Description,
                    Brand = item.Brand,
                    Category = item.Category,
                    NodeId = item.NodeId,
                    NodePath = item.NodePath,
                    ProductType = item.ProductType,
                    ModelName = item.ModelName,
                    ModelNumber = item.ModelNumber,
                    Color = item.Color,
                    Material = item.Material,
                    Price = null,
                    Currency = null,
                    MainImageUrl = item.MainImageUrl,
                    Country = item.Country,
                    DomainName = item.DomainName,
                    RawMetadata = item.RawMetadata,
                    Dimensions = item.Dimensions,
                    CreatedAt = DateTime.UtcNow
                };

                foreach (var img in item.Images)
                {
                    newProduct.Images.Add(new ProductImage
                    {
                        ImageId = img.ImageId,
                        Path = img.Path,
                        Url = img.Url,
                        Height = img.Height,
                        Width = img.Width,
                        IsMain = img.IsMain
                    });
                    result.ImagesCount++;
                }

                foreach (var attr in item.Attributes)
                {
                    newProduct.Attributes.Add(new ProductAttribute
                    {
                        Key = attr.Key,
                        Value = attr.Value,
                        Language = attr.Language
                    });
                    result.AttributesCount++;
                }

                dbContext.Products.Add(newProduct);
                result.InsertedCount++;
            }
        }

        await using var transaction = await dbContext.Database.BeginTransactionAsync(ct);
        try
        {
            await dbContext.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(ct);
            logger.LogError(ex, "Failed to save batch of {Count} items to database", items.Count);
            throw;
        }
        finally
        {
            dbContext.ChangeTracker.Clear();
        }

        return result;
    }
}
