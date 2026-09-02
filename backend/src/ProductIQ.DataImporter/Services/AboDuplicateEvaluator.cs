namespace ProductIQ.DataImporter.Services;

using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;
using ProductIQ.DataImporter.Models.Raw;
using ProductIQ.Domain.Common.ValueObjects;
using ProductIQ.Domain.Entities;

public class EvaluationPairResult
{
    public required string AsinA { get; set; }
    public required string AsinB { get; set; }
    public required string NameA { get; set; }
    public required string NameB { get; set; }
    public string? BrandA { get; set; }
    public string? BrandB { get; set; }
    public string? CategoryA { get; set; }
    public string? CategoryB { get; set; }
    public string? ModelA { get; set; }
    public string? ModelB { get; set; }
    public bool GroundTruthDuplicate { get; set; }
    public string GroundTruthType { get; set; } = string.Empty;
    public bool CandidateGenerated { get; set; }
    public decimal OverallScore { get; set; }
    public decimal BrandScore { get; set; }
    public decimal CategoryScore { get; set; }
    public decimal ModelScore { get; set; }
    public decimal TextScore { get; set; }
    public decimal SemanticScore { get; set; }
    public decimal AttributeScore { get; set; }
}

public class ThresholdMetrics
{
    public double Threshold { get; set; }
    public int TruePositives { get; set; }
    public int FalsePositives { get; set; }
    public int TrueNegatives { get; set; }
    public int FalseNegatives { get; set; }
    public double Precision { get; set; }
    public double Recall { get; set; }
    public double F1Score { get; set; }
    public double Accuracy { get; set; }
}

public class DuplicateEvaluationSummary
{
    public int TotalProductsLoaded { get; set; }
    public int TotalEvaluationPairs { get; set; }
    public int GroundTruthPositivePairs { get; set; }
    public int GroundTruthNegativePairs { get; set; }
    public int CandidateGenerationTruePositiveCaptured { get; set; }
    public double CandidateGenerationRecall { get; set; }
    public List<ThresholdMetrics> ThresholdAnalysis { get; set; } = new();
    public ThresholdMetrics DefaultThresholdMetrics { get; set; } = new();
    public ThresholdMetrics OptimalF1Metrics { get; set; } = new();
    public List<EvaluationPairResult> TopFalsePositives { get; set; } = new();
    public List<EvaluationPairResult> TopFalseNegatives { get; set; } = new();
}

public class AboDuplicateEvaluator
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<DuplicateEvaluationSummary> RunEvaluationAsync(
        string listingsGzPath,
        IDuplicateScoringService scoringService,
        ILogger logger)
    {
        logger.LogInformation("Starting ABO duplicate detection evaluation on {Path}", listingsGzPath);

        var products = await LoadNormalizedProductsAsync(listingsGzPath, 9250);
        logger.LogInformation("Loaded {Count} valid normalized ABO products", products.Count);

        var pairs = BuildGroundTruthDataset(products, 250, 250);
        logger.LogInformation("Constructed ground truth set of {Total} pairs (Positives: {Pos}, Negatives: {Neg})",
            pairs.Count, pairs.Count(p => p.GroundTruthDuplicate), pairs.Count(p => !p.GroundTruthDuplicate));

        var productMap = products.GroupBy(p => p.AmazonItemId, StringComparer.OrdinalIgnoreCase).ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);
        var pairResults = new List<EvaluationPairResult>(pairs.Count);

        foreach (var pair in pairs)
        {
            var pA = productMap[pair.AsinA];
            var pB = productMap[pair.AsinB];

            var brandMatch = IsValidMatch(pA.Brand, pB.Brand);
            var categoryMatch = IsValidMatch(pA.Category, pB.Category);
            var productTypeMatch = IsValidMatch(pA.ProductType, pB.ProductType);
            var modelNameMatch = IsValidMatch(pA.ModelName, pB.ModelName);
            var modelNumberMatch = IsValidMatch(pA.ModelNumber, pB.ModelNumber);

            var candidateGenerated = (brandMatch && categoryMatch)
                                     || (brandMatch && productTypeMatch && !categoryMatch)
                                     || (brandMatch && modelNameMatch)
                                     || modelNumberMatch;

            var breakdown = scoringService.CalculateScore(pA, pB, null, null);

            pairResults.Add(new EvaluationPairResult
            {
                AsinA = pA.AmazonItemId,
                AsinB = pB.AmazonItemId,
                NameA = pA.Name,
                NameB = pB.Name,
                BrandA = pA.Brand,
                BrandB = pB.Brand,
                CategoryA = pA.Category,
                CategoryB = pB.Category,
                ModelA = pA.ModelNumber ?? pA.ModelName,
                ModelB = pB.ModelNumber ?? pB.ModelName,
                GroundTruthDuplicate = pair.GroundTruthDuplicate,
                GroundTruthType = pair.GroundTruthType,
                CandidateGenerated = candidateGenerated,
                OverallScore = breakdown.OverallScore,
                BrandScore = breakdown.BrandScore,
                CategoryScore = breakdown.CategoryScore,
                ModelScore = breakdown.ModelScore,
                TextScore = breakdown.TextSimilarity,
                SemanticScore = breakdown.SemanticSimilarity,
                AttributeScore = breakdown.AttributeSimilarity
            });
        }

        var candidateTp = pairResults.Count(p => p.GroundTruthDuplicate && p.CandidateGenerated);
        var totalTp = pairResults.Count(p => p.GroundTruthDuplicate);
        var candidateRecall = totalTp > 0 ? (double)candidateTp / totalTp : 0;

        var thresholdValues = new[] { 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90 };
        var thresholdMetricsList = new List<ThresholdMetrics>();

        foreach (var t in thresholdValues)
        {
            var threshDec = (decimal)t;
            var tp = pairResults.Count(p => p.GroundTruthDuplicate && p.OverallScore >= threshDec);
            var fp = pairResults.Count(p => !p.GroundTruthDuplicate && p.OverallScore >= threshDec);
            var fn = pairResults.Count(p => p.GroundTruthDuplicate && p.OverallScore < threshDec);
            var tn = pairResults.Count(p => !p.GroundTruthDuplicate && p.OverallScore < threshDec);

            var precision = (tp + fp) > 0 ? (double)tp / (tp + fp) : 1.0;
            var recall = (tp + fn) > 0 ? (double)tp / (tp + fn) : 0.0;
            var f1 = (precision + recall) > 0 ? (2.0 * precision * recall) / (precision + recall) : 0.0;
            var accuracy = (tp + tn + fp + fn) > 0 ? (double)(tp + tn) / (tp + tn + fp + fn) : 0.0;

            thresholdMetricsList.Add(new ThresholdMetrics
            {
                Threshold = t,
                TruePositives = tp,
                FalsePositives = fp,
                TrueNegatives = tn,
                FalseNegatives = fn,
                Precision = Math.Round(precision, 4),
                Recall = Math.Round(recall, 4),
                F1Score = Math.Round(f1, 4),
                Accuracy = Math.Round(accuracy, 4)
            });
        }

        var defaultMetrics = thresholdMetricsList.First(m => Math.Abs(m.Threshold - 0.50) < 0.001);
        var optimalF1Metrics = thresholdMetricsList.OrderByDescending(m => m.F1Score).ThenByDescending(m => m.Precision).First();

        var topFp = pairResults
            .Where(p => !p.GroundTruthDuplicate && p.OverallScore >= (decimal)defaultMetrics.Threshold)
            .OrderByDescending(p => p.OverallScore)
            .Take(5)
            .ToList();

        var topFn = pairResults
            .Where(p => p.GroundTruthDuplicate && p.OverallScore < (decimal)defaultMetrics.Threshold)
            .OrderBy(p => p.OverallScore)
            .Take(5)
            .ToList();

        var summary = new DuplicateEvaluationSummary
        {
            TotalProductsLoaded = products.Count,
            TotalEvaluationPairs = pairResults.Count,
            GroundTruthPositivePairs = totalTp,
            GroundTruthNegativePairs = pairResults.Count(p => !p.GroundTruthDuplicate),
            CandidateGenerationTruePositiveCaptured = candidateTp,
            CandidateGenerationRecall = Math.Round(candidateRecall, 4),
            ThresholdAnalysis = thresholdMetricsList,
            DefaultThresholdMetrics = defaultMetrics,
            OptimalF1Metrics = optimalF1Metrics,
            TopFalsePositives = topFp,
            TopFalseNegatives = topFn
        };

        return summary;
    }

    private static async Task<List<Product>> LoadNormalizedProductsAsync(string path, int maxRecords)
    {
        var list = new List<Product>(maxRecords);
        var seenAsins = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        await using var fs = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read, 65536, true);
        await using var gz = new GZipStream(fs, CompressionMode.Decompress);
        using var sr = new StreamReader(gz);

        while (await sr.ReadLineAsync() is { } line && list.Count < maxRecords)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;

            RawAboListing? raw;
            try
            {
                raw = JsonSerializer.Deserialize<RawAboListing>(line, JsonOpts);
            }
            catch
            {
                continue;
            }

            if (raw == null || string.IsNullOrWhiteSpace(raw.ItemId)) continue;
            if (!seenAsins.Add(raw.ItemId)) continue;

            var name = raw.GetEnUsValue(raw.ItemName);
            var brand = raw.GetEnUsValue(raw.Brand);
            if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(brand)) continue;

            var firstNode = raw.Node?.FirstOrDefault();
            var nodePath = firstNode?.NodeName;
            var productType = raw.GetEnUsValue(raw.ProductType);
            var category = nodePath ?? productType;

            var modelName = raw.GetEnUsValue(raw.ModelName);
            var modelNumber = raw.GetEnUsValue(raw.ModelNumber);
            var color = raw.GetEnUsValue(raw.Color);
            var material = raw.GetEnUsValue(raw.Material);

            var bullets = raw.GetAllEnUsValues(raw.BulletPoint);
            var description = bullets.Count > 0 ? string.Join(" ", bullets) : null;

            ItemDimensions? dims = null;
            if (raw.ItemDimensions != null)
            {
                var len = raw.ItemDimensions.Length?.GetBestValue();
                var w = raw.ItemDimensions.Width?.GetBestValue();
                var h = raw.ItemDimensions.Height?.GetBestValue();
                var wt = raw.ItemDimensions.Weight?.GetBestValue();
                var dUnit = raw.ItemDimensions.Length?.GetBestUnit();
                var wUnit = raw.ItemDimensions.Weight?.GetBestUnit();
                dims = new ItemDimensions(len, w, h, wt, dUnit, wUnit);
            }

            var prod = new Product
            {
                Id = Guid.NewGuid(),
                AmazonItemId = raw.ItemId,
                Name = name,
                Description = description,
                Brand = brand,
                Category = category,
                NodePath = nodePath,
                ProductType = productType,
                ModelName = modelName,
                ModelNumber = modelNumber,
                Color = color,
                Material = material,
                Dimensions = dims,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            list.Add(prod);
        }

        return list;
    }

    private static List<GroundTruthPair> BuildGroundTruthDataset(
        List<Product> products,
        int targetPositives,
        int targetNegatives)
    {
        var positivePairs = new List<GroundTruthPair>();
        var seenPairs = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        var modelGroups = products
            .Where(p => !string.IsNullOrWhiteSpace(p.ModelNumber) && p.ModelNumber.Trim().Length >= 3 && !string.IsNullOrWhiteSpace(p.Brand))
            .GroupBy(p => $"{Normalize(p.Brand)}___{Normalize(p.ModelNumber)}")
            .Where(g => g.Count() > 1);

        foreach (var group in modelGroups)
        {
            var items = group.ToList();
            for (var i = 0; i < items.Count && positivePairs.Count < targetPositives; i++)
            {
                for (var j = i + 1; j < items.Count && positivePairs.Count < targetPositives; j++)
                {
                    var pairKey = MakePairKey(items[i].AmazonItemId, items[j].AmazonItemId);
                    if (seenPairs.Add(pairKey))
                    {
                        positivePairs.Add(new GroundTruthPair
                        {
                            AsinA = items[i].AmazonItemId,
                            AsinB = items[j].AmazonItemId,
                            GroundTruthDuplicate = true,
                            GroundTruthType = "ExactBrandAndModelNumber"
                        });
                    }
                }
            }
            if (positivePairs.Count >= targetPositives) break;
        }

        if (positivePairs.Count < targetPositives)
        {
            var titleGroups = products
                .Where(p => !string.IsNullOrWhiteSpace(p.Name) && !string.IsNullOrWhiteSpace(p.Brand))
                .GroupBy(p => $"{Normalize(p.Brand)}___{Normalize(p.Name)}")
                .Where(g => g.Count() > 1);

            foreach (var group in titleGroups)
            {
                var items = group.ToList();
                for (var i = 0; i < items.Count && positivePairs.Count < targetPositives; i++)
                {
                    for (var j = i + 1; j < items.Count && positivePairs.Count < targetPositives; j++)
                    {
                        var pairKey = MakePairKey(items[i].AmazonItemId, items[j].AmazonItemId);
                        if (seenPairs.Add(pairKey))
                        {
                            positivePairs.Add(new GroundTruthPair
                            {
                                AsinA = items[i].AmazonItemId,
                                AsinB = items[j].AmazonItemId,
                                GroundTruthDuplicate = true,
                                GroundTruthType = "ExactBrandAndTitle"
                            });
                        }
                    }
                }
                if (positivePairs.Count >= targetPositives) break;
            }
        }

        var negativePairs = new List<GroundTruthPair>();

        var hardNegativeTarget = (int)(targetNegatives * 0.60);
        var brandCatGroups = products
            .Where(p => !string.IsNullOrWhiteSpace(p.Brand) && !string.IsNullOrWhiteSpace(p.Category))
            .GroupBy(p => $"{Normalize(p.Brand)}___{Normalize(p.Category)}")
            .Where(g => g.Count() > 1);

        foreach (var group in brandCatGroups)
        {
            var items = group.ToList();
            for (var i = 0; i < items.Count && negativePairs.Count < hardNegativeTarget; i++)
            {
                for (var j = i + 1; j < items.Count && negativePairs.Count < hardNegativeTarget; j++)
                {
                    var pA = items[i];
                    var pB = items[j];

                    if (!string.IsNullOrWhiteSpace(pA.ModelNumber) &&
                        !string.IsNullOrWhiteSpace(pB.ModelNumber) &&
                        string.Equals(Normalize(pA.ModelNumber), Normalize(pB.ModelNumber), StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    if (string.Equals(Normalize(pA.Name), Normalize(pB.Name), StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    var pairKey = MakePairKey(pA.AmazonItemId, pB.AmazonItemId);
                    if (seenPairs.Add(pairKey))
                    {
                        negativePairs.Add(new GroundTruthPair
                        {
                            AsinA = pA.AmazonItemId,
                            AsinB = pB.AmazonItemId,
                            GroundTruthDuplicate = false,
                            GroundTruthType = "HardNegative_SameBrandCategory"
                        });
                    }
                }
            }
            if (negativePairs.Count >= hardNegativeTarget) break;
        }

        var mediumNegativeTarget = (int)(targetNegatives * 0.25);
        var catGroups = products
            .Where(p => !string.IsNullOrWhiteSpace(p.Category) && !string.IsNullOrWhiteSpace(p.Brand))
            .GroupBy(p => Normalize(p.Category))
            .Where(g => g.Count() > 1);

        var medCount = 0;
        foreach (var group in catGroups)
        {
            var items = group.ToList();
            for (var i = 0; i < items.Count && medCount < mediumNegativeTarget; i++)
            {
                for (var j = i + 1; j < items.Count && medCount < mediumNegativeTarget; j++)
                {
                    var pA = items[i];
                    var pB = items[j];

                    if (string.Equals(Normalize(pA.Brand), Normalize(pB.Brand), StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    var pairKey = MakePairKey(pA.AmazonItemId, pB.AmazonItemId);
                    if (seenPairs.Add(pairKey))
                    {
                        negativePairs.Add(new GroundTruthPair
                        {
                            AsinA = pA.AmazonItemId,
                            AsinB = pB.AmazonItemId,
                            GroundTruthDuplicate = false,
                            GroundTruthType = "MediumNegative_SameCategoryDifferentBrand"
                        });
                        medCount++;
                    }
                }
            }
            if (medCount >= mediumNegativeTarget) break;
        }

        var easyNegativeTarget = targetNegatives - negativePairs.Count;
        var easyCount = 0;
        var rnd = new Random(42);
        var prodArray = products.Where(p => !string.IsNullOrWhiteSpace(p.Brand) && !string.IsNullOrWhiteSpace(p.Category)).ToArray();

        while (easyCount < easyNegativeTarget && prodArray.Length > 2)
        {
            var idxA = rnd.Next(prodArray.Length);
            var idxB = rnd.Next(prodArray.Length);
            if (idxA == idxB) continue;

            var pA = prodArray[idxA];
            var pB = prodArray[idxB];

            if (string.Equals(Normalize(pA.Brand), Normalize(pB.Brand), StringComparison.OrdinalIgnoreCase)) continue;
            if (string.Equals(Normalize(pA.Category), Normalize(pB.Category), StringComparison.OrdinalIgnoreCase)) continue;

            var pairKey = MakePairKey(pA.AmazonItemId, pB.AmazonItemId);
            if (seenPairs.Add(pairKey))
            {
                negativePairs.Add(new GroundTruthPair
                {
                    AsinA = pA.AmazonItemId,
                    AsinB = pB.AmazonItemId,
                    GroundTruthDuplicate = false,
                    GroundTruthType = "EasyNegative_DifferentBrandCategory"
                });
                easyCount++;
            }
        }

        var result = new List<GroundTruthPair>(positivePairs.Count + negativePairs.Count);
        result.AddRange(positivePairs);
        result.AddRange(negativePairs);
        return result;
    }

    private static string MakePairKey(string a, string b)
    {
        return string.Compare(a, b, StringComparison.Ordinal) < 0
            ? $"{a}___{b}"
            : $"{b}___{a}";
    }

    private static string Normalize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return string.Empty;
        return string.Join(" ", value.Trim().Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)).ToLowerInvariant();
    }

    private static bool IsValidMatch(string? a, string? b)
    {
        if (string.IsNullOrWhiteSpace(a) || string.IsNullOrWhiteSpace(b)) return false;
        return string.Equals(Normalize(a), Normalize(b), StringComparison.OrdinalIgnoreCase);
    }

    private class GroundTruthPair
    {
        public required string AsinA { get; set; }
        public required string AsinB { get; set; }
        public bool GroundTruthDuplicate { get; set; }
        public required string GroundTruthType { get; set; }
    }
}
