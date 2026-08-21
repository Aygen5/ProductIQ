using System.Diagnostics;
using Microsoft.Extensions.Logging;
using ProductIQ.DataImporter.Configuration;
using ProductIQ.DataImporter.Models;
using ProductIQ.DataImporter.Models.Normalized;

namespace ProductIQ.DataImporter.Services;

public interface IAboImportPipeline
{
    Task<ImportStatistics> RunValidationAsync(int sampleSize = 100, CancellationToken ct = default);
    Task<ImportStatistics> RunFullDryRunAsync(CancellationToken ct = default);
}

public class AboImportPipeline(
    ILogger<AboImportPipeline> logger,
    ImporterOptions options,
    IAboDownloader downloader,
    IAboImageCatalogService imageCatalog,
    IAboStreamingParser streamingParser) : IAboImportPipeline
{
    public async Task<ImportStatistics> RunValidationAsync(int sampleSize = 100, CancellationToken ct = default)
    {
        logger.LogInformation("=========================================================");
        logger.LogInformation("ProductIQ — ABO Data Import Pipeline (Validation / Dry-Run)");
        logger.LogInformation("Sample size: {Sample:N0} records", sampleSize);
        logger.LogInformation("=========================================================");

        var stopwatch = Stopwatch.StartNew();
        var stats = new ImportStatistics();

        // 1. Download datasets if not already present
        await downloader.EnsureDatasetsDownloadedAsync(options, ct);

        // 2. Load images catalog
        var imagesPath = Path.Combine(options.DataDirectory, options.ImagesFileName);
        await imageCatalog.LoadImageCatalogAsync(imagesPath, ct);
        stats.ImagesCatalogCount = imageCatalog.LoadedCount;

        // 3. Stream and normalize listings
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

        // 4. Print sample records
        PrintSampleProducts(samples);

        // 5. Print Statistics
        PrintReport(stats);

        return stats;
    }

    public async Task<ImportStatistics> RunFullDryRunAsync(CancellationToken ct = default)
    {
        logger.LogInformation("=========================================================");
        logger.LogInformation("ProductIQ — ABO Data Import Pipeline (Full File Dry-Run)");
        logger.LogInformation("=========================================================");

        var stopwatch = Stopwatch.StartNew();
        var stats = new ImportStatistics();

        await downloader.EnsureDatasetsDownloadedAsync(options, ct);

        var imagesPath = Path.Combine(options.DataDirectory, options.ImagesFileName);
        await imageCatalog.LoadImageCatalogAsync(imagesPath, ct);
        stats.ImagesCatalogCount = imageCatalog.LoadedCount;

        var listingsPath = Path.Combine(options.DataDirectory, options.ListingsFileName);
        long counter = 0;

        await foreach (var _ in streamingParser.StreamAndNormalizeAsync(listingsPath, imageCatalog, options, stats, null, ct))
        {
            counter++;
            if (counter % 5000 == 0)
            {
                logger.LogInformation("Processed {Count:N0} listings so far...", counter);
            }
        }

        stopwatch.Stop();
        stats.ElapsedTime = stopwatch.Elapsed;

        PrintReport(stats);
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
            logger.LogInformation("  Color/Mat:   {Color} / {Material}", p.Color ?? "-", p.Material ?? "-");
            logger.LogInformation("  Dimensions:  {Dim}", p.Dimensions != null 
                ? $"L:{p.Dimensions.Length} W:{p.Dimensions.Width} H:{p.Dimensions.Height} {p.Dimensions.DimensionUnit}, Wt:{p.Dimensions.Weight} {p.Dimensions.WeightUnit}"
                : "(null)");
            logger.LogInformation("  Main Image:  {MainImage}", p.MainImageUrl ?? "(null)");
            logger.LogInformation("  Images:      {ImgCount} images mapped", p.Images.Count);
            logger.LogInformation("  Attributes:  {AttrCount} attributes extracted", p.Attributes.Count);
            logger.LogInformation("  Raw JSON:    {Bytes} chars preserved", p.RawMetadata?.Length ?? 0);
        }
    }

    private void PrintReport(ImportStatistics s)
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
        logger.LogInformation("Elapsed Time:                  {Time:g} ({Ms:N0} ms)", s.ElapsedTime, s.ElapsedTime.TotalMilliseconds);
        logger.LogInformation("Database Writes:               0 (Validation / Dry-Run Mode)");
        logger.LogInformation("=========================================================\n");
    }
}
