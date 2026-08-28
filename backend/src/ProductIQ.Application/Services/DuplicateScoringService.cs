namespace ProductIQ.Application.Services;

using System.Diagnostics;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ProductIQ.Application.Common.Configuration;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Entities;
using ProductIQ.Domain.Enums;

public class DuplicateScoringService : IDuplicateScoringService
{
    private readonly IProductIQDbContext _context;
    private readonly IProductEmbeddingService _textService;
    private readonly DuplicateScoringOptions _options;
    private readonly ILogger<DuplicateScoringService> _logger;

    public DuplicateScoringService(
        IProductIQDbContext context,
        IProductEmbeddingService textService,
        IOptions<DuplicateScoringOptions> options,
        ILogger<DuplicateScoringService> logger)
    {
        _context = context;
        _textService = textService;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<BatchScoringResultDto> ScoreAllCandidatesAsync(CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var result = new BatchScoringResultDto();

        var candidates = await _context.DuplicateCandidates
            .Include(d => d.ProductA)
                .ThenInclude(p => p.Attributes)
            .Include(d => d.ProductB)
                .ThenInclude(p => p.Attributes)
            .ToListAsync(cancellationToken);

        result.TotalCandidatesEvaluated = candidates.Count;

        if (candidates.Count == 0)
        {
            stopwatch.Stop();
            result.ExecutionDuration = stopwatch.Elapsed;
            return result;
        }

        var productIds = candidates
            .SelectMany(c => new[] { c.ProductAId, c.ProductBId })
            .Distinct()
            .ToList();

        var embeddings = await _context.ProductEmbeddings
            .AsNoTracking()
            .Where(e => productIds.Contains(e.ProductId) && e.EmbeddingType == EmbeddingType.Text && e.Vector != null)
            .ToListAsync(cancellationToken);

        var embeddingMap = embeddings
            .GroupBy(e => e.ProductId)
            .ToDictionary(g => g.Key, g => g.First().Vector);

        var scoredList = new List<CandidateScoringResultDto>();
        decimal sumScores = 0;
        decimal minScore = 1.0m;
        decimal maxScore = 0.0m;

        foreach (var candidate in candidates)
        {
            embeddingMap.TryGetValue(candidate.ProductAId, out var vecA);
            embeddingMap.TryGetValue(candidate.ProductBId, out var vecB);

            var breakdown = CalculateScore(candidate.ProductA, candidate.ProductB, vecA, vecB);

            candidate.OverallScore = breakdown.OverallScore;
            candidate.TextSimilarity = breakdown.TextSimilarity;
            candidate.SemanticSimilarity = breakdown.SemanticSimilarity;
            candidate.AttributeSimilarity = breakdown.AttributeSimilarity;
            candidate.BrandMatch = breakdown.BrandMatch;
            candidate.ModelMatch = breakdown.ModelMatch;
            candidate.MatchSignals = JsonSerializer.Serialize(breakdown.Signals);
            candidate.UpdatedAt = DateTime.UtcNow;

            sumScores += breakdown.OverallScore;
            if (breakdown.OverallScore < minScore) minScore = breakdown.OverallScore;
            if (breakdown.OverallScore > maxScore) maxScore = breakdown.OverallScore;

            scoredList.Add(new CandidateScoringResultDto
            {
                CandidateId = candidate.Id,
                ProductAId = candidate.ProductAId,
                ProductBId = candidate.ProductBId,
                ProductAAsin = candidate.ProductA.AmazonItemId,
                ProductBAsin = candidate.ProductB.AmazonItemId,
                ProductAName = candidate.ProductA.Name,
                ProductBName = candidate.ProductB.Name,
                ScoreBreakdown = breakdown
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        stopwatch.Stop();
        result.ExecutionDuration = stopwatch.Elapsed;
        result.TotalCandidatesScored = scoredList.Count;
        result.AverageOverallScore = scoredList.Count > 0 ? Math.Round(sumScores / scoredList.Count, 4) : 0;
        result.LowestScore = scoredList.Count > 0 ? minScore : 0;
        result.HighestScore = scoredList.Count > 0 ? maxScore : 0;
        result.ScoredCandidates = scoredList.OrderByDescending(s => s.ScoreBreakdown.OverallScore).ToList();

        _logger.LogInformation("Batch scoring completed for {Total} candidates in {Duration}ms. Avg Score: {Avg}, Min: {Min}, Max: {Max}",
            result.TotalCandidatesScored, result.ExecutionDuration.TotalMilliseconds, result.AverageOverallScore, result.LowestScore, result.HighestScore);

        return result;
    }

    public async Task<CandidateScoringResultDto> ScoreCandidateAsync(Guid candidateId, CancellationToken cancellationToken = default)
    {
        var candidate = await _context.DuplicateCandidates
            .Include(d => d.ProductA)
                .ThenInclude(p => p.Attributes)
            .Include(d => d.ProductB)
                .ThenInclude(p => p.Attributes)
            .FirstOrDefaultAsync(d => d.Id == candidateId, cancellationToken);

        if (candidate == null)
        {
            throw new KeyNotFoundException($"Duplicate candidate with ID '{candidateId}' was not found.");
        }

        var vecA = await _context.ProductEmbeddings
            .AsNoTracking()
            .Where(e => e.ProductId == candidate.ProductAId && e.EmbeddingType == EmbeddingType.Text && e.Vector != null)
            .Select(e => e.Vector)
            .FirstOrDefaultAsync(cancellationToken);

        var vecB = await _context.ProductEmbeddings
            .AsNoTracking()
            .Where(e => e.ProductId == candidate.ProductBId && e.EmbeddingType == EmbeddingType.Text && e.Vector != null)
            .Select(e => e.Vector)
            .FirstOrDefaultAsync(cancellationToken);

        var breakdown = CalculateScore(candidate.ProductA, candidate.ProductB, vecA, vecB);

        candidate.OverallScore = breakdown.OverallScore;
        candidate.TextSimilarity = breakdown.TextSimilarity;
        candidate.SemanticSimilarity = breakdown.SemanticSimilarity;
        candidate.AttributeSimilarity = breakdown.AttributeSimilarity;
        candidate.BrandMatch = breakdown.BrandMatch;
        candidate.ModelMatch = breakdown.ModelMatch;
        candidate.MatchSignals = JsonSerializer.Serialize(breakdown.Signals);
        candidate.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new CandidateScoringResultDto
        {
            CandidateId = candidate.Id,
            ProductAId = candidate.ProductAId,
            ProductBId = candidate.ProductBId,
            ProductAAsin = candidate.ProductA.AmazonItemId,
            ProductBAsin = candidate.ProductB.AmazonItemId,
            ProductAName = candidate.ProductA.Name,
            ProductBName = candidate.ProductB.Name,
            ScoreBreakdown = breakdown
        };
    }

    public DuplicateScoreBreakdownDto CalculateScore(
        Product productA,
        Product productB,
        float[]? vectorA,
        float[]? vectorB)
    {
        var brandScore = CalculateBrandScore(productA.Brand, productB.Brand);
        var categoryScore = CalculateCategoryScore(productA.Category, productB.Category, productA.NodePath, productB.NodePath);
        var modelScore = CalculateModelScore(productA.ModelName, productA.ModelNumber, productB.ModelName, productB.ModelNumber);
        var textScore = CalculateTextSimilarity(productA, productB);
        var semanticScore = CalculateSemanticSimilarity(vectorA, vectorB, textScore);
        var attributeScore = CalculateAttributeSimilarity(productA, productB);

        var totalWeight = _options.BrandWeight + _options.CategoryWeight + _options.ModelWeight + _options.TextWeight + _options.SemanticWeight + _options.AttributeWeight;
        if (totalWeight <= 0)
        {
            totalWeight = 1.0m;
        }

        var weightedSum = (brandScore * _options.BrandWeight)
                        + (categoryScore * _options.CategoryWeight)
                        + (modelScore * _options.ModelWeight)
                        + (textScore * _options.TextWeight)
                        + (semanticScore * _options.SemanticWeight)
                        + (attributeScore * _options.AttributeWeight);

        var overallScore = Math.Clamp(Math.Round(weightedSum / totalWeight, 4), 0.0000m, 1.0000m);

        var signals = new Dictionary<string, object>
        {
            { "brand_score", brandScore },
            { "category_score", categoryScore },
            { "model_score", modelScore },
            { "text_similarity", textScore },
            { "semantic_similarity", semanticScore },
            { "attribute_similarity", attributeScore },
            { "overall_score", overallScore },
            { "weights", new {
                brand = _options.BrandWeight,
                category = _options.CategoryWeight,
                model = _options.ModelWeight,
                text = _options.TextWeight,
                semantic = _options.SemanticWeight,
                attribute = _options.AttributeWeight
            }}
        };

        return new DuplicateScoreBreakdownDto
        {
            BrandScore = brandScore,
            CategoryScore = categoryScore,
            ModelScore = modelScore,
            TextSimilarity = textScore,
            SemanticSimilarity = semanticScore,
            AttributeSimilarity = attributeScore,
            OverallScore = overallScore,
            BrandMatch = brandScore >= 0.8m,
            ModelMatch = modelScore >= 0.5m,
            CategoryMatch = categoryScore >= 0.5m,
            Signals = signals
        };
    }

    private static decimal CalculateBrandScore(string? brandA, string? brandB)
    {
        if (string.IsNullOrWhiteSpace(brandA) || string.IsNullOrWhiteSpace(brandB))
        {
            return 0.0m;
        }

        var normA = Normalize(brandA);
        var normB = Normalize(brandB);

        if (normA == normB)
        {
            return 1.0m;
        }

        if (normA.Contains(normB) || normB.Contains(normA))
        {
            return 0.8m;
        }

        return 0.0m;
    }

    private static decimal CalculateCategoryScore(string? catA, string? catB, string? nodeA, string? nodeB)
    {
        var effectiveA = catA ?? nodeA;
        var effectiveB = catB ?? nodeB;

        if (string.IsNullOrWhiteSpace(effectiveA) || string.IsNullOrWhiteSpace(effectiveB))
        {
            return 0.0m;
        }

        var normA = Normalize(effectiveA);
        var normB = Normalize(effectiveB);

        if (normA == normB)
        {
            return 1.0m;
        }

        var segmentsA = effectiveA.Split(new[] { '/', '>', '|', '\\' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var segmentsB = effectiveB.Split(new[] { '/', '>', '|', '\\' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        if (segmentsA.Length > 0 && segmentsB.Length > 0)
        {
            var matchCount = 0;
            var minLen = Math.Min(segmentsA.Length, segmentsB.Length);
            for (var i = 0; i < minLen; i++)
            {
                if (string.Equals(Normalize(segmentsA[i]), Normalize(segmentsB[i]), StringComparison.OrdinalIgnoreCase))
                {
                    matchCount++;
                }
                else
                {
                    break;
                }
            }

            if (matchCount > 0)
            {
                var maxLen = Math.Max(segmentsA.Length, segmentsB.Length);
                return Math.Round((decimal)matchCount / maxLen, 4);
            }
        }

        return 0.0m;
    }

    private static decimal CalculateModelScore(string? modelNameA, string? modelNumberA, string? modelNameB, string? modelNumberB)
    {
        var hasModelNumA = !string.IsNullOrWhiteSpace(modelNumberA);
        var hasModelNumB = !string.IsNullOrWhiteSpace(modelNumberB);
        var hasModelNameA = !string.IsNullOrWhiteSpace(modelNameA);
        var hasModelNameB = !string.IsNullOrWhiteSpace(modelNameB);

        if (hasModelNumA && hasModelNumB)
        {
            var normNumA = Normalize(modelNumberA);
            var normNumB = Normalize(modelNumberB);
            if (normNumA == normNumB)
            {
                return 1.0m;
            }
            if (normNumA.Contains(normNumB) || normNumB.Contains(normNumA))
            {
                return 0.75m;
            }
        }

        if (hasModelNameA && hasModelNameB)
        {
            var normNameA = Normalize(modelNameA);
            var normNameB = Normalize(modelNameB);
            if (normNameA == normNameB)
            {
                return 0.9m;
            }
            var dice = CalculateDiceCoefficient(normNameA, normNameB);
            if (dice >= 0.5m)
            {
                return Math.Round(dice * 0.9m, 4);
            }
        }

        return 0.0m;
    }

    private decimal CalculateTextSimilarity(Product a, Product b)
    {
        var textA = _textService.BuildProductEmbeddingText(a);
        var textB = _textService.BuildProductEmbeddingText(b);
        return CalculateDiceCoefficient(textA, textB);
    }

    private static decimal CalculateDiceCoefficient(string textA, string textB)
    {
        if (string.IsNullOrWhiteSpace(textA) || string.IsNullOrWhiteSpace(textB))
        {
            return 0.0m;
        }

        var tokensA = Tokenize(textA);
        var tokensB = Tokenize(textB);

        if (tokensA.Count == 0 || tokensB.Count == 0)
        {
            return 0.0m;
        }

        var intersection = tokensA.Intersect(tokensB).Count();
        var total = tokensA.Count + tokensB.Count;

        return Math.Round((2.0m * intersection) / total, 4);
    }

    private static HashSet<string> Tokenize(string text)
    {
        var words = text.ToLowerInvariant().Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var set = new HashSet<string>(words);
        for (var i = 0; i < words.Length - 1; i++)
        {
            set.Add($"{words[i]}_{words[i + 1]}");
        }
        return set;
    }

    private static decimal CalculateSemanticSimilarity(float[]? vecA, float[]? vecB, decimal fallbackTextSimilarity)
    {
        if (vecA == null || vecB == null || vecA.Length == 0 || vecB.Length == 0 || vecA.Length != vecB.Length)
        {
            return fallbackTextSimilarity;
        }

        double dotProduct = 0;
        double normA = 0;
        double normB = 0;

        for (var i = 0; i < vecA.Length; i++)
        {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        var denom = Math.Sqrt(normA) * Math.Sqrt(normB);
        if (denom <= 0)
        {
            return 0.0m;
        }

        var cosine = dotProduct / denom;
        var normalizedCosine = Math.Clamp((cosine + 1.0) / 2.0, 0.0, 1.0);
        return Math.Round((decimal)normalizedCosine, 4);
    }

    private static decimal CalculateAttributeSimilarity(Product a, Product b)
    {
        var attrsA = a.Attributes?
            .Where(x => !string.IsNullOrWhiteSpace(x.Key) && !string.IsNullOrWhiteSpace(x.Value))
            .ToDictionary(x => Normalize(x.Key), x => Normalize(x.Value)) ?? new();

        var attrsB = b.Attributes?
            .Where(x => !string.IsNullOrWhiteSpace(x.Key) && !string.IsNullOrWhiteSpace(x.Value))
            .ToDictionary(x => Normalize(x.Key), x => Normalize(x.Value)) ?? new();

        if (attrsA.Count == 0 && attrsB.Count == 0)
        {
            return 0.0m;
        }

        var allKeys = attrsA.Keys.Union(attrsB.Keys).ToList();
        var matchScore = 0.0m;

        foreach (var key in allKeys)
        {
            if (attrsA.TryGetValue(key, out var valA) && attrsB.TryGetValue(key, out var valB))
            {
                if (valA == valB)
                {
                    matchScore += 1.0m;
                }
                else if (valA.Contains(valB) || valB.Contains(valA))
                {
                    matchScore += 0.5m;
                }
            }
        }

        var attributeRatio = matchScore / allKeys.Count;

        if (a.Dimensions != null && b.Dimensions != null)
        {
            var dimScore = 0.0m;
            var dimCount = 0;

            if (a.Dimensions.Length.HasValue && b.Dimensions.Length.HasValue)
            {
                dimCount++;
                dimScore += IsClose(a.Dimensions.Length.Value, b.Dimensions.Length.Value) ? 1.0m : 0.0m;
            }
            if (a.Dimensions.Width.HasValue && b.Dimensions.Width.HasValue)
            {
                dimCount++;
                dimScore += IsClose(a.Dimensions.Width.Value, b.Dimensions.Width.Value) ? 1.0m : 0.0m;
            }
            if (a.Dimensions.Height.HasValue && b.Dimensions.Height.HasValue)
            {
                dimCount++;
                dimScore += IsClose(a.Dimensions.Height.Value, b.Dimensions.Height.Value) ? 1.0m : 0.0m;
            }

            if (dimCount > 0)
            {
                attributeRatio = (attributeRatio + (dimScore / dimCount)) / 2.0m;
            }
        }

        return Math.Round(attributeRatio, 4);
    }

    private static bool IsClose(double a, double b)
    {
        if (a == b) return true;
        var max = Math.Max(Math.Abs(a), Math.Abs(b));
        if (max == 0) return true;
        return Math.Abs(a - b) / max <= 0.05;
    }

    private static string Normalize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        return string.Join(" ", value.Trim().Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)).ToLowerInvariant();
    }
}
