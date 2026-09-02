using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ProductIQ.Application;
using ProductIQ.Application.Interfaces;
using ProductIQ.DataImporter.Configuration;
using ProductIQ.DataImporter.Services;
using ProductIQ.Infrastructure;

var builder = Host.CreateDefaultBuilder(args);

builder.ConfigureAppConfiguration((hostingContext, config) =>
{
    config.SetBasePath(AppContext.BaseDirectory)
          .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
          .AddEnvironmentVariables();
});

builder.ConfigureServices((hostContext, services) =>
{
    var importerOptions = hostContext.Configuration.GetSection("Importer").Get<ImporterOptions>() 
                          ?? new ImporterOptions();
    services.AddSingleton(importerOptions);

    services.AddInfrastructureServices(hostContext.Configuration);
    services.AddApplicationServices();

    services.AddHttpClient<IAboDownloader, AboDownloader>(client =>
    {
        client.Timeout = TimeSpan.FromMinutes(10);
    });

    services.AddSingleton<IAboImageCatalogService, AboImageCatalogService>();
    services.AddSingleton<IAboStreamingParser, AboStreamingParser>();
    services.AddScoped<IAboDatabaseWriter, AboDatabaseWriter>();
    services.AddScoped<IAboImportPipeline, AboImportPipeline>();
});

var host = builder.Build();

using (var scope = host.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    if (args.Contains("--score-candidates", StringComparer.OrdinalIgnoreCase))
    {
        var scoringService = scope.ServiceProvider.GetRequiredService<IDuplicateScoringService>();
        logger.LogInformation("Starting Duplicate Scoring Engine for all candidates in database...");

        var result = await scoringService.ScoreAllCandidatesAsync();

        logger.LogInformation("Scoring Summary: Evaluated: {Evaluated}, Scored: {Scored}, Avg Score: {Avg:F4}, Min: {Min:F4}, Max: {Max:F4} in {Elapsed}ms",
            result.TotalCandidatesEvaluated, result.TotalCandidatesScored, result.AverageOverallScore, result.LowestScore, result.HighestScore, result.ExecutionDuration.TotalMilliseconds);

        logger.LogInformation("Top 5 Highest Scored Candidates:");
        var topCandidates = result.ScoredCandidates.Take(5);
        var rank = 1;
        foreach (var sc in topCandidates)
        {
            var b = sc.ScoreBreakdown;
            var imgStr = b.ImageSimilarity.HasValue ? $"{b.ImageSimilarity.Value:P0}" : "N/A";
            logger.LogInformation("{Rank}. [{AsinA}] {NameA} <===> [{AsinB}] {NameB} | Overall: {Overall:P2} (Brand: {Brand:P0}, Cat: {Cat:P0}, Model: {Model:P0}, Text: {Text:P0}, Sem: {Sem:P0}, Attr: {Attr:P0}, Img: {Img})",
                rank++,
                sc.ProductAAsin,
                sc.ProductAName,
                sc.ProductBAsin,
                sc.ProductBName,
                b.OverallScore,
                b.BrandScore,
                b.CategoryScore,
                b.ModelScore,
                b.TextSimilarity,
                b.SemanticSimilarity,
                b.AttributeSimilarity,
                imgStr);
        }
    }
    else if (args.Contains("--detect-candidates", StringComparer.OrdinalIgnoreCase))
    {
        var candidateService = scope.ServiceProvider.GetRequiredService<IDuplicateCandidateService>();
        logger.LogInformation("Starting Duplicate Candidate Detection pipeline for all products in database...");

        var result = await candidateService.RunCandidateDetectionAsync();

        logger.LogInformation("Candidate Detection Summary: Products Evaluated: {Products}, Candidate Pairs Found: {Found}, Newly Saved: {Saved}, Skipped (Existing): {Skipped} in {Elapsed}ms",
            result.TotalProductsEvaluated, result.TotalCandidatePairsFound, result.NewlySavedCandidates, result.SkippedExistingCandidates, result.ExecutionDuration.TotalMilliseconds);

        foreach (var rule in result.RuleMatchCounts)
        {
            logger.LogInformation(" - Rule [{Rule}]: {Count} matches", rule.Key, rule.Value);
        }
    }
    else if (args.Contains("--list-candidates", StringComparer.OrdinalIgnoreCase))
    {
        var candidateService = scope.ServiceProvider.GetRequiredService<IDuplicateCandidateService>();
        var candidates = await candidateService.GetCandidatesAsync(page: 1, pageSize: 20);
        var totalCount = await candidateService.GetCandidatesCountAsync();

        logger.LogInformation("Total Duplicate Candidates in Database: {Total}. Showing first {Count}:", totalCount, candidates.Count);

        var idx = 1;
        foreach (var c in candidates)
        {
            logger.LogInformation("{Idx}. [{AsinA}] {NameA} <===> [{AsinB}] {NameB} | Overall: {Overall:P2}, BrandMatch: {BM}, ModelMatch: {MM}, Signals: {Signals}",
                idx++,
                c.ProductA?.AmazonItemId,
                c.ProductA?.Name,
                c.ProductB?.AmazonItemId,
                c.ProductB?.Name,
                c.OverallScore,
                c.BrandMatch,
                c.ModelMatch,
                c.MatchSignals);
        }
    }
    else if (args.Contains("--generate-embeddings", StringComparer.OrdinalIgnoreCase))
    {
        var embeddingBatchService = scope.ServiceProvider.GetRequiredService<IProductEmbeddingBatchService>();
        logger.LogInformation("Starting embedding generation pipeline for all products in database...");

        var result = await embeddingBatchService.GenerateEmbeddingsForAllProductsAsync();

        logger.LogInformation("Embedding Generation Summary: Total Processed: {Total}, Newly Generated: {New}, Skipped (Unchanged): {Skipped}, Failed: {Failed}",
            result.TotalProcessed, result.NewlyGenerated, result.SkippedUnchanged, result.Failed);

        if (result.Errors.Count > 0)
        {
            foreach (var err in result.Errors)
            {
                logger.LogError("Embedding Error: {Error}", err);
            }
        }
    }
    else if (args.Contains("--generate-image-embeddings", StringComparer.OrdinalIgnoreCase))
    {
        var imageEmbeddingBatchService = scope.ServiceProvider.GetRequiredService<IProductImageEmbeddingBatchService>();
        logger.LogInformation("Starting CLIP image embedding generation pipeline for all product images in database...");

        var result = await imageEmbeddingBatchService.GenerateImageEmbeddingsForAllProductImagesAsync();

        logger.LogInformation("CLIP Image Embedding Summary: Products Evaluated: {Products}, Images Evaluated: {Images}, Embeddings Created: {Created}, Embeddings Skipped: {Skipped}, Failed Images: {Failed} in {Elapsed}ms",
            result.TotalProductsEvaluated, result.TotalImagesEvaluated, result.EmbeddingsCreated, result.EmbeddingsSkipped, result.FailedImages, result.ExecutionDuration.TotalMilliseconds);

        if (result.Errors.Count > 0)
        {
            logger.LogWarning("CLIP Pipeline encountered {Count} image errors during execution. First few errors:", result.Errors.Count);
            foreach (var err in result.Errors.Take(10))
            {
                logger.LogWarning(" - {Error}", err);
            }
        }
    }
    else if (args.Contains("--similarity-search", StringComparer.OrdinalIgnoreCase))
    {
        var searchIndex = Array.FindIndex(args, a => string.Equals(a, "--similarity-search", StringComparison.OrdinalIgnoreCase));
        var targetArg = searchIndex >= 0 && searchIndex + 1 < args.Length ? args[searchIndex + 1] : null;

        var similarityService = scope.ServiceProvider.GetRequiredService<ISimilaritySearchService>();
        var dbContext = scope.ServiceProvider.GetRequiredService<IProductIQDbContext>();

        Guid targetId = Guid.Empty;
        if (!string.IsNullOrWhiteSpace(targetArg))
        {
            if (Guid.TryParse(targetArg, out var parsedGuid))
            {
                targetId = parsedGuid;
            }
            else
            {
                var prod = await dbContext.Products.FirstOrDefaultAsync(p => p.AmazonItemId == targetArg);
                if (prod != null)
                {
                    targetId = prod.Id;
                }
            }
        }

        if (targetId == Guid.Empty)
        {
            var firstProduct = await dbContext.Products.FirstOrDefaultAsync();
            if (firstProduct != null)
            {
                targetId = firstProduct.Id;
            }
        }

        if (targetId == Guid.Empty)
        {
            logger.LogWarning("No products found in database for similarity search.");
        }
        else
        {
            var targetProduct = await dbContext.Products.FirstOrDefaultAsync(p => p.Id == targetId);
            logger.LogInformation("Running Vector Similarity Search for Product: [{Asin}] {Name} (ID: {Id})...", targetProduct?.AmazonItemId, targetProduct?.Name, targetId);

            var similarProducts = await similarityService.FindSimilarProductsAsync(targetId, limit: 5, minSimilarity: null);

            logger.LogInformation("Found {Count} similar products:", similarProducts.Count);
            foreach (var item in similarProducts)
            {
                logger.LogInformation(" -> [{Asin}] {Name} | Brand: {Brand} | Similarity: {Sim:P2} (Cosine Dist: {Dist:F4})",
                    item.AmazonItemId, item.Name, item.Brand ?? "N/A", item.SimilarityScore, item.CosineDistance);
            }
        }
    }
    else if (args.Contains("--evaluate-duplicates", StringComparer.OrdinalIgnoreCase))
    {
        var scoringService = scope.ServiceProvider.GetRequiredService<IDuplicateScoringService>();
        var evaluator = new AboDuplicateEvaluator();
        var dataPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "data", "abo", "listings_0.json.gz");
        if (!File.Exists(dataPath))
        {
            dataPath = Path.GetFullPath("data/abo/listings_0.json.gz");
        }
        if (!File.Exists(dataPath))
        {
            dataPath = Path.GetFullPath("../data/abo/listings_0.json.gz");
        }

        var report = await evaluator.RunEvaluationAsync(dataPath, scoringService, logger);

        var outPath = Path.Combine(Path.GetDirectoryName(dataPath)!, "duplicate_evaluation_result.json");
        var json = System.Text.Json.JsonSerializer.Serialize(report, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
        await File.WriteAllTextAsync(outPath, json);

        Console.WriteLine("\n========================================================");
        Console.WriteLine("PRODUCTIQ — DUPLICATE DETECTION EVALUATION REPORT");
        Console.WriteLine("========================================================");
        Console.WriteLine($"Total Products Loaded: {report.TotalProductsLoaded}");
        Console.WriteLine($"Evaluation Pairs: {report.TotalEvaluationPairs} (Positives: {report.GroundTruthPositivePairs}, Negatives: {report.GroundTruthNegativePairs})");
        Console.WriteLine($"Candidate Generation Captured: {report.CandidateGenerationTruePositiveCaptured}/{report.GroundTruthPositivePairs} (Recall: {report.CandidateGenerationRecall:P2})");
        Console.WriteLine("--------------------------------------------------------");
        Console.WriteLine("THRESHOLD ANALYSIS (Precision, Recall, F1)");
        Console.WriteLine("--------------------------------------------------------");
        Console.WriteLine("Thresh | TP  | FP  | TN  | FN  | Precision | Recall  | F1 Score");
        Console.WriteLine("-------|-----|-----|-----|-----|-----------|---------|---------");
        foreach (var t in report.ThresholdAnalysis)
        {
            Console.WriteLine($"{t.Threshold:F2}   | {t.TruePositives,-3} | {t.FalsePositives,-3} | {t.TrueNegatives,-3} | {t.FalseNegatives,-3} | {t.Precision,-9:P2} | {t.Recall,-7:P2} | {t.F1Score,-7:P2}");
        }
        Console.WriteLine("--------------------------------------------------------");
        Console.WriteLine($"Default Threshold ({report.DefaultThresholdMetrics.Threshold:F2}): Precision={report.DefaultThresholdMetrics.Precision:P2}, Recall={report.DefaultThresholdMetrics.Recall:P2}, F1={report.DefaultThresholdMetrics.F1Score:P2}");
        Console.WriteLine($"Optimal F1 Threshold ({report.OptimalF1Metrics.Threshold:F2}): Precision={report.OptimalF1Metrics.Precision:P2}, Recall={report.OptimalF1Metrics.Recall:P2}, F1={report.OptimalF1Metrics.F1Score:P2}");
        Console.WriteLine("========================================================\n");
    }
    else
    {
        var pipeline = scope.ServiceProvider.GetRequiredService<IAboImportPipeline>();

        bool isDryRun = args.Contains("--dry-run", StringComparer.OrdinalIgnoreCase);
        int limit = 100;

        for (int i = 0; i < args.Length; i++)
        {
            if (int.TryParse(args[i], out var parsedLimit))
            {
                limit = parsedLimit;
            }
        }

        if (args.Contains("--full", StringComparer.OrdinalIgnoreCase))
        {
            limit = int.MaxValue;
        }

        if (isDryRun)
        {
            logger.LogInformation("Running Dry-Run Validation (Limit: {Limit})...", limit);
            await pipeline.RunValidationAsync(limit);
        }
        else
        {
            logger.LogInformation("Running PostgreSQL Database Import (Limit: {Limit})...", limit);
            await pipeline.RunDatabaseImportAsync(limit);
        }
    }

    logger.LogInformation("Execution finished successfully.");
}
