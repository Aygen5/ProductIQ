namespace ProductIQ.Infrastructure.Services.DataImport;

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Common.ValueObjects;
using ProductIQ.Domain.Entities;
using ProductIQ.Infrastructure.Persistence;

public class RawAboLocalizedValue
{
    [JsonPropertyName("language_tag")]
    public string? LanguageTag { get; set; }

    [JsonPropertyName("value")]
    public string? Value { get; set; }
}

public class RawAboNode
{
    [JsonPropertyName("node_id")]
    public long? NodeId { get; set; }

    [JsonPropertyName("node_name")]
    public string? NodeName { get; set; }
}

public class RawAboNormalizedValue
{
    [JsonPropertyName("unit")]
    public string? Unit { get; set; }

    [JsonPropertyName("value")]
    public double? Value { get; set; }
}

public class RawAboDimensionMetric
{
    [JsonPropertyName("normalized_value")]
    public RawAboNormalizedValue? NormalizedValue { get; set; }

    [JsonPropertyName("unit")]
    public string? Unit { get; set; }

    [JsonPropertyName("value")]
    public double? Value { get; set; }

    public double? GetBestValue() => NormalizedValue?.Value ?? Value;
    public string? GetBestUnit() => NormalizedValue?.Unit ?? Unit;
}

public class RawAboItemDimensions
{
    [JsonPropertyName("height")]
    public RawAboDimensionMetric? Height { get; set; }

    [JsonPropertyName("length")]
    public RawAboDimensionMetric? Length { get; set; }

    [JsonPropertyName("width")]
    public RawAboDimensionMetric? Width { get; set; }

    [JsonPropertyName("weight")]
    public RawAboDimensionMetric? Weight { get; set; }
}

public class RawAboListing
{
    [JsonPropertyName("item_id")]
    public string? ItemId { get; set; }

    [JsonPropertyName("brand")]
    public List<RawAboLocalizedValue>? Brand { get; set; }

    [JsonPropertyName("item_name")]
    public List<RawAboLocalizedValue>? ItemName { get; set; }

    [JsonPropertyName("bullet_point")]
    public List<RawAboLocalizedValue>? BulletPoint { get; set; }

    [JsonPropertyName("product_type")]
    public List<RawAboLocalizedValue>? ProductType { get; set; }

    [JsonPropertyName("node")]
    public List<RawAboNode>? Node { get; set; }

    [JsonPropertyName("color")]
    public List<RawAboLocalizedValue>? Color { get; set; }

    [JsonPropertyName("material")]
    public List<RawAboLocalizedValue>? Material { get; set; }

    [JsonPropertyName("model_name")]
    public List<RawAboLocalizedValue>? ModelName { get; set; }

    [JsonPropertyName("model_number")]
    public List<RawAboLocalizedValue>? ModelNumber { get; set; }

    [JsonPropertyName("item_dimensions")]
    public RawAboItemDimensions? ItemDimensions { get; set; }

    [JsonPropertyName("main_image_id")]
    public string? MainImageId { get; set; }

    [JsonPropertyName("other_image_id")]
    public List<string>? OtherImageId { get; set; }

    [JsonPropertyName("domain_name")]
    public string? DomainName { get; set; }

    [JsonPropertyName("country")]
    public string? Country { get; set; }

    public string? GetEnUsValue(List<RawAboLocalizedValue>? list, string preferredLang = "en_US")
    {
        if (list == null || list.Count == 0) return null;
        var preferred = list.FirstOrDefault(x => string.Equals(x.LanguageTag, preferredLang, StringComparison.OrdinalIgnoreCase));
        return preferred?.Value ?? list.FirstOrDefault(x => !string.IsNullOrWhiteSpace(x.Value))?.Value;
    }

    public List<string> GetAllEnUsValues(List<RawAboLocalizedValue>? list, string preferredLang = "en_US")
    {
        if (list == null || list.Count == 0) return new List<string>();
        return list.Where(x => string.Equals(x.LanguageTag, preferredLang, StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(x.Value))
                   .Select(x => x.Value!)
                   .ToList();
    }
}

public class ProductImportService : IProductImportService
{
    private readonly ProductIQDbContext _context;
    private readonly ILogger<ProductImportService> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };
    private static readonly Dictionary<string, (string Path, int? Height, int? Width)> ImageCatalogCache = new(StringComparer.Ordinal);
    private static readonly object ImageCatalogLock = new();

    public ProductImportService(ProductIQDbContext context, ILogger<ProductImportService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ProductImportResultDto> ImportAboProductsAsync(int batchSize = 25, CancellationToken cancellationToken = default)
    {
        var targetCount = Math.Clamp(batchSize, 1, 100);
        var stopwatch = Stopwatch.StartNew();

        var (listingsPath, imagesPath) = ResolveDataPaths();

        if (!File.Exists(listingsPath))
        {
            return new ProductImportResultDto
            {
                Success = false,
                Message = $"Listings dataset file not found at: {listingsPath}"
            };
        }

        EnsureImageCatalogLoaded(imagesPath, cancellationToken);

        var existingItemIds = await _context.Products
            .Select(p => p.AmazonItemId)
            .ToHashSetAsync(StringComparer.Ordinal, cancellationToken);

        var newProducts = new List<Product>();

        await using var fileStream = new FileStream(listingsPath, FileMode.Open, FileAccess.Read, FileShare.Read, 65536, true);
        await using var gzipStream = new GZipStream(fileStream, CompressionMode.Decompress);
        using var reader = new StreamReader(gzipStream);

        while (await reader.ReadLineAsync(cancellationToken) is { } line)
        {
            if (newProducts.Count >= targetCount)
            {
                break;
            }

            if (string.IsNullOrWhiteSpace(line)) continue;

            RawAboListing? raw;
            try
            {
                raw = JsonSerializer.Deserialize<RawAboListing>(line, JsonOptions);
            }
            catch
            {
                continue;
            }

            if (raw == null || string.IsNullOrWhiteSpace(raw.ItemId)) continue;

            if (!string.Equals(raw.DomainName, "amazon.com", StringComparison.OrdinalIgnoreCase)) continue;

            if (string.IsNullOrWhiteSpace(raw.MainImageId)) continue;

            var name = raw.GetEnUsValue(raw.ItemName);
            if (string.IsNullOrWhiteSpace(name)) continue;

            if (existingItemIds.Contains(raw.ItemId)) continue;

            var brand = raw.GetEnUsValue(raw.Brand);
            var color = raw.GetEnUsValue(raw.Color);
            var material = raw.GetEnUsValue(raw.Material);
            var productType = raw.GetEnUsValue(raw.ProductType);
            var modelName = raw.GetEnUsValue(raw.ModelName);
            var modelNumber = raw.GetEnUsValue(raw.ModelNumber);
            var bulletPoints = raw.GetAllEnUsValues(raw.BulletPoint);
            var description = bulletPoints.Count > 0 ? string.Join("\n• ", bulletPoints) : null;

            string? category = null;
            long? nodeId = null;
            string? nodePath = null;
            if (raw.Node != null && raw.Node.Count > 0)
            {
                var validNodes = raw.Node.Where(n => !string.IsNullOrWhiteSpace(n.NodeName)).ToList();
                if (validNodes.Count > 0)
                {
                    nodeId = validNodes[^1].NodeId;
                    nodePath = string.Join(" > ", validNodes.Select(n => n.NodeName));
                    category = validNodes[^1].NodeName;
                }
            }

            string? mainImageUrl = null;
            var productImages = new List<ProductImage>();

            if (TryResolveImageUrl(raw.MainImageId, out var mainPath, out var mainH, out var mainW))
            {
                mainImageUrl = BuildImageUrl(mainPath);
                productImages.Add(new ProductImage
                {
                    ImageId = raw.MainImageId,
                    Path = mainPath,
                    Url = mainImageUrl,
                    Height = mainH,
                    Width = mainW,
                    IsMain = true
                });
            }

            if (raw.OtherImageId != null)
            {
                foreach (var otherId in raw.OtherImageId.Take(5))
                {
                    if (otherId != raw.MainImageId && TryResolveImageUrl(otherId, out var oPath, out var oH, out var oW))
                    {
                        productImages.Add(new ProductImage
                        {
                            ImageId = otherId,
                            Path = oPath,
                            Url = BuildImageUrl(oPath),
                            Height = oH,
                            Width = oW,
                            IsMain = false
                        });
                    }
                }
            }

            var attributes = new List<ProductAttribute>();
            if (!string.IsNullOrWhiteSpace(brand)) attributes.Add(new ProductAttribute { Key = "Brand", Value = brand });
            if (!string.IsNullOrWhiteSpace(color)) attributes.Add(new ProductAttribute { Key = "Color", Value = color });
            if (!string.IsNullOrWhiteSpace(material)) attributes.Add(new ProductAttribute { Key = "Material", Value = material });
            if (!string.IsNullOrWhiteSpace(productType)) attributes.Add(new ProductAttribute { Key = "ProductType", Value = productType });
            if (!string.IsNullOrWhiteSpace(modelName)) attributes.Add(new ProductAttribute { Key = "ModelName", Value = modelName });
            if (!string.IsNullOrWhiteSpace(modelNumber)) attributes.Add(new ProductAttribute { Key = "ModelNumber", Value = modelNumber });

            ItemDimensions? dimensions = null;
            if (raw.ItemDimensions != null)
            {
                dimensions = new ItemDimensions
                {
                    Height = raw.ItemDimensions.Height?.GetBestValue(),
                    Length = raw.ItemDimensions.Length?.GetBestValue(),
                    Width = raw.ItemDimensions.Width?.GetBestValue(),
                    Weight = raw.ItemDimensions.Weight?.GetBestValue(),
                    DimensionUnit = raw.ItemDimensions.Height?.GetBestUnit() ?? raw.ItemDimensions.Length?.GetBestUnit(),
                    WeightUnit = raw.ItemDimensions.Weight?.GetBestUnit()
                };
            }

            var product = new Product
            {
                AmazonItemId = raw.ItemId,
                Name = name,
                Brand = brand,
                Description = description,
                Category = category,
                NodeId = nodeId,
                NodePath = nodePath,
                ProductType = productType,
                ModelName = modelName,
                ModelNumber = modelNumber,
                Color = color,
                Material = material,
                Price = null,
                Currency = "USD",
                MainImageUrl = mainImageUrl,
                Country = raw.Country ?? "US",
                DomainName = raw.DomainName ?? "amazon.com",
                RawMetadata = line,
                Dimensions = dimensions,
                Images = productImages,
                Attributes = attributes,
                CreatedAt = DateTime.UtcNow
            };

            newProducts.Add(product);
            existingItemIds.Add(raw.ItemId);
        }

        if (newProducts.Count > 0)
        {
            _context.Products.AddRange(newProducts);
            await _context.SaveChangesAsync(cancellationToken);
        }

        stopwatch.Stop();
        var totalNow = await _context.Products.CountAsync(cancellationToken);

        _logger.LogInformation("Imported {Count} products into database in {Elapsed}ms. Total products now: {Total}",
            newProducts.Count, stopwatch.ElapsedMilliseconds, totalNow);

        return new ProductImportResultDto
        {
            Success = true,
            ImportedCount = newProducts.Count,
            UpdatedCount = 0,
            TotalProductsNow = totalNow,
            ExecutionTimeMs = stopwatch.Elapsed.TotalMilliseconds,
            Message = $"Successfully imported {newProducts.Count} new ABO products into catalog."
        };
    }

    private static (string listingsPath, string imagesPath) ResolveDataPaths()
    {
        var searchRoots = new[]
        {
            AppContext.BaseDirectory,
            Directory.GetCurrentDirectory(),
            Path.Combine(Directory.GetCurrentDirectory(), ".."),
            Path.Combine(Directory.GetCurrentDirectory(), "..", ".."),
            @"c:\Projects\ProductIQ\backend"
        };

        foreach (var root in searchRoots)
        {
            var candidateListings = Path.Combine(root, "data", "abo", "listings_0.json.gz");
            var candidateImages = Path.Combine(root, "data", "abo", "images.csv.gz");
            if (File.Exists(candidateListings))
            {
                return (Path.GetFullPath(candidateListings), Path.GetFullPath(candidateImages));
            }
        }

        return (@"c:\Projects\ProductIQ\backend\data\abo\listings_0.json.gz", @"c:\Projects\ProductIQ\backend\data\abo\images.csv.gz");
    }

    private static void EnsureImageCatalogLoaded(string imagesGzPath, CancellationToken ct)
    {
        if (ImageCatalogCache.Count > 0 || !File.Exists(imagesGzPath)) return;

        lock (ImageCatalogLock)
        {
            if (ImageCatalogCache.Count > 0) return;

            using var fileStream = new FileStream(imagesGzPath, FileMode.Open, FileAccess.Read, FileShare.Read, 65536, false);
            using var gzipStream = new GZipStream(fileStream, CompressionMode.Decompress);
            using var reader = new StreamReader(gzipStream);

            reader.ReadLine();

            while (reader.ReadLine() is { } line)
            {
                if (string.IsNullOrWhiteSpace(line)) continue;
                var parts = line.Split(',');
                if (parts.Length < 4) continue;

                var imageId = parts[0].Trim();
                int.TryParse(parts[1].Trim(), out var height);
                int.TryParse(parts[2].Trim(), out var width);
                var path = parts[3].Trim();

                ImageCatalogCache[imageId] = (path, height > 0 ? height : null, width > 0 ? width : null);
            }
        }
    }

    private static bool TryResolveImageUrl(string imageId, out string path, out int? height, out int? width)
    {
        if (ImageCatalogCache.TryGetValue(imageId, out var entry))
        {
            path = entry.Path;
            height = entry.Height;
            width = entry.Width;
            return true;
        }

        path = string.Empty;
        height = null;
        width = null;
        return false;
    }

    private static string BuildImageUrl(string path)
    {
        return $"https://amazon-berkeley-objects.s3.amazonaws.com/images/small/{path.TrimStart('/')}";
    }
}
