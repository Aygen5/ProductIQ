using System.Diagnostics;
using Microsoft.Extensions.Logging;
using ProductIQ.DataImporter.Configuration;
using ProductIQ.DataImporter.Models;
using ProductIQ.DataImporter.Models.Normalized;

namespace ProductIQ.DataImporter.Services;

public interface IAboImportPipeline
{
    Task<ImportStatistics> RunValidationAsync(int sampleSize = 100, CancellationToken ct = default);
    Task<ImportStatistics> RunDatabaseImportAsync(int? limit = null, CancellationToken ct = default);
}

public class AboImportPipeline(
    ILogger<AboImportPipeline> logger,
    ImporterOptions options,
    IAboDownloader downloader,
    IAboImageCatalogService imageCatalog,
    IAboStreamingParser streamingParser,
    IAboDatabaseWriter databaseWriter) : IAboImportPipeline
{
    public async Task<ImportStatistics> RunValidationAsync(int sampleSize = 100, CancellationToken ct = default)
    {
        logger.LogInformation("=========================================================");
        logger.LogInformation("ProductIQ — ABO Data Import Pipeline (Validation / Dry-Run)");
        logger.LogInformation("Sample size: {Sample:N0} records", sampleSize);
        logger.LogInformation("=========================================================");

        var stopwatch = Stopwatch.StartNew();
        var stats = new ImportStatistics();

        await downloader.EnsureDatasetsDownloadedAsync(options, ct);

        var imagesPath = Path.Combine(options.DataDirectory, options.ImagesFileName);
        await imageCatalog.LoadImageCatalogAsync(imagesPath, ct);
        stats.ImagesCatalogCount = imageCatalog.LoadedCount;

        var listingsPath = Path.Combine(options.DataDirectory, options.ListingsFileName);
        var samples = new List<NormalizedProductImport>();

        await foreach (var item in streamingParser.StreamAndNormalizeAsync(listingsPath, imageCatalog, options, stats, sampleSize, ct))
        {
            if (samples.Count < 5)
            {
                samples.Add(item);
            }
        }

        stopwatch.Stop();
        stats.ElapsedTime = stopwatch.Elapsed;

        PrintSampleProducts(samples);
        PrintReport(stats, isDatabaseImport: false);

        return stats;
    }

    public async Task<ImportStatistics> RunDatabaseImportAsync(int? limit = null, CancellationToken ct = default)
    {
        logger.LogInformation("=========================================================");
        logger.LogInformation("ProductIQ — ABO PostgreSQL Database Import (Batch Upsert)");
        logger.LogInformation("Limit: {Limit}", limit.HasValue ? $"{limit.Value:N0} records" : "ALL");
        logger.LogInformation("Batch Size: {BatchSize:N0}", options.BatchSize);
        logger.LogInformation("=========================================================");

        var stopwatch = Stopwatch.StartNew();
        var stats = new ImportStatistics();

        // 1. Download datasets
        await downloader.EnsureDatasetsDownloadedAsync(options, ct);

        // 2. Load images catalog
        var imagesPath = Path.Combine(options.DataDirectory, options.ImagesFileName);
        await imageCatalog.LoadImageCatalogAsync(imagesPath, ct);
        stats.ImagesCatalogCount = imageCatalog.LoadedCount;

        // 3. Stream, normalize, and write to PostgreSQL in batches
        var listingsPath = Path.Combine(options.DataDirectory, options.ListingsFileName);
        var batch = new List<NormalizedProductImport>(options.BatchSize);
        long processedSoFar = 0;

        await foreach (var item in streamingParser.StreamAndNormalizeAsync(listingsPath, imageCatalog, options, stats, limit, ct))
        {
            batch.Add(item);
            processedSoFar++;

            if (batch.Count >= options.BatchSize)
            {
                var batchResult = await databaseWriter.WriteBatchAsync(batch, ct);
                stats.InsertedProductsCount += batchResult.InsertedCount;
                stats.UpdatedProductsCount += batchResult.UpdatedCount;
                stats.TotalImagesSaved += batchResult.ImagesCount;
                stats.TotalAttributesSaved += batchResult.AttributesCount;

                logger.LogInformation("Batch saved: {BatchCount:N0} items | Inserts: {Ins:N0} | Updates: {Upd:N0} | Progress: {Total:N0}",
                    batch.Count, batchResult.InsertedCount, batchResult.UpdatedCount, processedSoFar);

                batch.Clear();
            }
        }

        // Process any remaining items in the last batch
        if (batch.Count > 0)
        {
            var batchResult = await databaseWriter.WriteBatchAsync(batch, ct);
            stats.InsertedProductsCount += batchResult.InsertedCount;
            stats.UpdatedProductsCount += batchResult.UpdatedCount;
            stats.TotalImagesSaved += batchResult.ImagesCount;
            stats.TotalAttributesSaved += batchResult.AttributesCount;

            logger.LogInformation("Final batch saved: {BatchCount:N0} items | Inserts: {Ins:N0} | Updates: {Upd:N0} | Total Processed: {Total:N0}",
                batch.Count, batchResult.InsertedCount, batchResult.UpdatedCount, processedSoFar);

            batch.Clear();
        }

        stopwatch.Stop();
        stats.ElapsedTime = stopwatch.Elapsed;

        PrintReport(stats, isDatabaseImport: true);
        return stats;
    }

    private void PrintSampleProducts(List<NormalizedProductImport> samples)
    {
        logger.LogInformation("\n--- SAMPLE NORMALIZED PRODUCTS ({Count}) ---", samples.Count);
        for (int i = 0; i < samples.Count; i++)
        {
            var p = samples[i];
            logger.LogInformation("\n[Sample #{Index}] ASIN: {Asin}", i + 1, p.AmazonItemId);
            logger.LogInformation("  Name:        {Name}", p.Name);
            logger.LogInformation("  Brand:       {Brand}", p.Brand ?? "(null)");
            logger.LogInformation("  Category:    {Category}", p.Category ?? "(null)");
            logger.LogInformation("  Node ID:     {NodeId}", p.NodeId?.ToString() ?? "(null)");
            logger.LogInformation("  Type:        {Type}", p.ProductType ?? "(null)");
            logger.LogInformation("  Dimensions:  {Dim}", p.Dimensions != null 
                ? $"L:{p.Dimensions.Length} W:{p.Dimensions.Width} H:{p.Dimensions.Height} {p.Dimensions.DimensionUnit}, Wt:{p.Dimensions.Weight} {p.Dimensions.WeightUnit}"
                : "(null)");
            logger.LogInformation("  Main Image:  {MainImage}", p.MainImageUrl ?? "(null)");
            logger.LogInformation("  Images:      {ImgCount} images mapped", p.Images.Count);
            logger.LogInformation("  Attributes:  {AttrCount} attributes extracted", p.Attributes.Count);
            logger.LogInformation("  Raw JSON:    {Bytes} chars preserved", p.RawMetadata?.Length ?? 0);
        }
    }

    private void PrintReport(ImportStatistics s, bool isDatabaseImport)
    {
        logger.LogInformation("\n=========================================================");
        logger.LogInformation("          ABO IMPORT PIPELINE REPORT SUMMARY             ");
        logger.LogInformation("=========================================================");
        logger.LogInformation("Total Lines Read:              {Total:N0}", s.TotalLinesRead);
        logger.LogInformation("Successfully Parsed JSON:      {Parsed:N0}", s.ParsedCount);
        logger.LogInformation("Malformed JSON Lines:          {Malformed:N0}", s.MalformedLinesCount);
        logger.LogInformation("Filtered (Not Target Domain):  {Domain:N0}", s.FilteredByDomainCount);
        logger.LogInformation("Filtered (No Main Image):      {NoImg:N0}", s.FilteredByNoMainImageCount);
        logger.LogInformation("Filtered (Missing Name):       {NoName:N0}", s.FilteredByMissingNameCount);
        logger.LogInformation("Successfully Normalized:       {Norm:N0}", s.SuccessfullyNormalizedCount);
        logger.LogInformation("---------------------------------------------------------");
        logger.LogInformation("Image Catalog Total Images:    {ImgCat:N0}", s.ImagesCatalogCount);
        logger.LogInformation("Image Lookup Hits:             {Hits:N0}", s.ImageLookupHits);
        logger.LogInformation("Image Lookup Misses:           {Miss:N0}", s.ImageLookupMisses);
        logger.LogInformation("---------------------------------------------------------");
        if (isDatabaseImport)
        {
            logger.LogInformation("Products Inserted:             {Ins:N0}", s.InsertedProductsCount);
            logger.LogInformation("Products Updated (Idempotent): {Upd:N0}", s.UpdatedProductsCount);
            logger.LogInformation("Total Product Images Saved:    {Imgs:N0}", s.TotalImagesSaved);
            logger.LogInformation("Total Attributes Saved:        {Attrs:N0}", s.TotalAttributesSaved);
        }
        else
        {
            logger.LogInformation("Database Writes:               0 (Validation Mode)");
        }
        logger.LogInformation("Elapsed Time:                  {Time:g} ({Ms:N0} ms)", s.ElapsedTime, s.ElapsedTime.TotalMilliseconds);
        logger.LogInformation("=========================================================\n");
    }
}
