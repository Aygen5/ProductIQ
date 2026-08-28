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

    if (args.Contains("--detect-candidates", StringComparer.OrdinalIgnoreCase))
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
            logger.LogInformation("{Idx}. [{AsinA}] {NameA} <===> [{AsinB}] {NameB} | BrandMatch: {BM}, ModelMatch: {MM}, Signals: {Signals}",
                idx++,
                c.ProductA?.AmazonItemId,
                c.ProductA?.Name,
                c.ProductB?.AmazonItemId,
                c.ProductB?.Name,
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
