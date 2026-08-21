using System.IO.Compression;
using System.Runtime.CompilerServices;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using ProductIQ.DataImporter.Configuration;
using ProductIQ.DataImporter.Models;
using ProductIQ.DataImporter.Models.Normalized;
using ProductIQ.DataImporter.Models.Raw;
using ProductIQ.Domain.Common.ValueObjects;

namespace ProductIQ.DataImporter.Services;

public interface IAboStreamingParser
{
    IAsyncEnumerable<NormalizedProductImport> StreamAndNormalizeAsync(
        string listingsGzPath,
        IAboImageCatalogService imageCatalog,
        ImporterOptions options,
        ImportStatistics stats,
        int? maxRecords = null,
        CancellationToken ct = default);
}

public class AboStreamingParser(ILogger<AboStreamingParser> logger) : IAboStreamingParser
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async IAsyncEnumerable<NormalizedProductImport> StreamAndNormalizeAsync(
        string listingsGzPath,
        IAboImageCatalogService imageCatalog,
        ImporterOptions options,
        ImportStatistics stats,
        int? maxRecords = null,
        [EnumeratorCancellation] CancellationToken ct = default)
    {
        if (!File.Exists(listingsGzPath))
        {
            throw new FileNotFoundException($"Listings archive not found: {listingsGzPath}");
        }

        logger.LogInformation("Starting streaming parser on: {Path}", listingsGzPath);

        await using var fileStream = new FileStream(listingsGzPath, FileMode.Open, FileAccess.Read, FileShare.Read, 65536, true);
        await using var gzipStream = new GZipStream(fileStream, CompressionMode.Decompress);
        using var reader = new StreamReader(gzipStream);

        long yieldedCount = 0;

        while (await reader.ReadLineAsync(ct) is { } line)
        {
            if (maxRecords.HasValue && yieldedCount >= maxRecords.Value)
            {
                logger.LogInformation("Reached max record limit of {Limit:N0}.", maxRecords.Value);
                break;
            }

            if (string.IsNullOrWhiteSpace(line)) continue;

            stats.TotalLinesRead++;

            RawAboListing? rawListing;
            try
            {
                rawListing = JsonSerializer.Deserialize<RawAboListing>(line, JsonOptions);
                if (rawListing == null || string.IsNullOrWhiteSpace(rawListing.ItemId))
                {
                    stats.MalformedLinesCount++;
                    continue;
                }
                stats.ParsedCount++;
            }
            catch (Exception ex)
            {
                stats.MalformedLinesCount++;
                logger.LogDebug(ex, "Failed to parse JSON line {LineIndex}", stats.TotalLinesRead);
                continue;
            }

            // 1. Filter by target domain (default: amazon.com)
            if (!string.IsNullOrWhiteSpace(options.TargetDomain) &&
                !string.Equals(rawListing.DomainName, options.TargetDomain, StringComparison.OrdinalIgnoreCase))
            {
                stats.FilteredByDomainCount++;
                continue;
            }

            // 2. Filter by Main Image if required
            if (options.RequireMainImage && string.IsNullOrWhiteSpace(rawListing.MainImageId))
            {
                stats.FilteredByNoMainImageCount++;
                continue;
            }

            // 3. Extract Name (en_US preferred)
            var name = rawListing.GetEnUsValue(rawListing.ItemName, options.PreferredLanguage);
            if (string.IsNullOrWhiteSpace(name))
            {
                stats.FilteredByMissingNameCount++;
                continue;
            }

            // 4. Normalize Description from Bullet Points
            var bulletPoints = rawListing.GetAllEnUsValues(rawListing.BulletPoint, options.PreferredLanguage);
            string? description = null;
            if (bulletPoints.Count > 0)
            {
                description = string.Join("\n• ", bulletPoints);
                if (bulletPoints.Count > 1)
                {
                    description = "• " + description;
                }
            }

            // 5. Category & Hierarchy
            var firstNode = rawListing.Node?.FirstOrDefault();
            var nodePath = firstNode?.NodeName;
            var productType = rawListing.GetEnUsValue(rawListing.ProductType, options.PreferredLanguage);
            var category = nodePath ?? productType;

            // 6. Dimensions
            ItemDimensions? dimensions = null;
            if (rawListing.ItemDimensions != null)
            {
                var length = rawListing.ItemDimensions.Length?.GetBestValue();
                var width = rawListing.ItemDimensions.Width?.GetBestValue();
                var height = rawListing.ItemDimensions.Height?.GetBestValue();
                var weight = rawListing.ItemDimensions.Weight?.GetBestValue();

                var dimUnit = rawListing.ItemDimensions.Length?.GetBestUnit() 
                           ?? rawListing.ItemDimensions.Height?.GetBestUnit() 
                           ?? rawListing.ItemDimensions.Width?.GetBestUnit();

                var weightUnit = rawListing.ItemDimensions.Weight?.GetBestUnit();

                if (length.HasValue || width.HasValue || height.HasValue || weight.HasValue)
                {
                    dimensions = new ItemDimensions(length, width, height, weight, dimUnit, weightUnit);
                }
            }

            // 7. Create Normalized Product Import Model
            var brand = rawListing.GetEnUsValue(rawListing.Brand, options.PreferredLanguage);
            var color = rawListing.GetEnUsValue(rawListing.Color, options.PreferredLanguage);
            var material = rawListing.GetEnUsValue(rawListing.Material, options.PreferredLanguage);
            var modelName = rawListing.GetEnUsValue(rawListing.ModelName, options.PreferredLanguage);
            var modelNumber = rawListing.GetEnUsValue(rawListing.ModelNumber, options.PreferredLanguage);

            var normalized = new NormalizedProductImport
            {
                AmazonItemId = rawListing.ItemId,
                Name = name,
                Description = description,
                Brand = brand,
                Category = category,
                NodeId = firstNode?.NodeId,
                NodePath = nodePath,
                ProductType = productType,
                ModelName = modelName,
                ModelNumber = modelNumber,
                Color = color,
                Material = material,
                Price = null,
                Currency = null,
                Country = rawListing.Country,
                DomainName = rawListing.DomainName,
                RawMetadata = line, // Zero data loss: store exact original JSON
                Dimensions = dimensions
            };

            // 8. Image Resolution & Mapping
            if (!string.IsNullOrWhiteSpace(rawListing.MainImageId))
            {
                if (imageCatalog.TryGetImage(rawListing.MainImageId, out var mainImageMeta) && mainImageMeta != null)
                {
                    stats.ImageLookupHits++;
                    var mainUrl = imageCatalog.BuildImageUrl(mainImageMeta.Path);
                    normalized.MainImageUrl = mainUrl;
                    normalized.Images.Add(new NormalizedProductImageImport
                    {
                        ImageId = rawListing.MainImageId,
                        Path = mainImageMeta.Path,
                        Url = mainUrl,
                        Height = mainImageMeta.Height,
                        Width = mainImageMeta.Width,
                        IsMain = true
                    });
                }
                else
                {
                    stats.ImageLookupMisses++;
                    normalized.Images.Add(new NormalizedProductImageImport
                    {
                        ImageId = rawListing.MainImageId,
                        IsMain = true
                    });
                }
            }

            if (rawListing.OtherImageId != null)
            {
                foreach (var otherImageId in rawListing.OtherImageId)
                {
                    if (string.IsNullOrWhiteSpace(otherImageId)) continue;

                    if (imageCatalog.TryGetImage(otherImageId, out var otherMeta) && otherMeta != null)
                    {
                        stats.ImageLookupHits++;
                        var otherUrl = imageCatalog.BuildImageUrl(otherMeta.Path);
                        normalized.Images.Add(new NormalizedProductImageImport
                        {
                            ImageId = otherImageId,
                            Path = otherMeta.Path,
                            Url = otherUrl,
                            Height = otherMeta.Height,
                            Width = otherMeta.Width,
                            IsMain = false
                        });
                    }
                    else
                    {
                        stats.ImageLookupMisses++;
                        normalized.Images.Add(new NormalizedProductImageImport
                        {
                            ImageId = otherImageId,
                            IsMain = false
                        });
                    }
                }
            }

            // 9. Attribute Normalization
            if (!string.IsNullOrWhiteSpace(color))
            {
                normalized.Attributes.Add(new NormalizedProductAttributeImport { Key = "color", Value = color, Language = options.PreferredLanguage });
            }
            if (!string.IsNullOrWhiteSpace(material))
            {
                normalized.Attributes.Add(new NormalizedProductAttributeImport { Key = "material", Value = material, Language = options.PreferredLanguage });
            }
            if (!string.IsNullOrWhiteSpace(modelNumber))
            {
                normalized.Attributes.Add(new NormalizedProductAttributeImport { Key = "model_number", Value = modelNumber, Language = options.PreferredLanguage });
            }
            if (!string.IsNullOrWhiteSpace(modelName))
            {
                normalized.Attributes.Add(new NormalizedProductAttributeImport { Key = "model_name", Value = modelName, Language = options.PreferredLanguage });
            }

            stats.SuccessfullyNormalizedCount++;
            yieldedCount++;

            yield return normalized;
        }

        logger.LogInformation("Streaming finished. Total processed: {Yielded:N0} listings.", yieldedCount);
    }
}
