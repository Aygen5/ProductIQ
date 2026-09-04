namespace ProductIQ.Infrastructure.Services;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Enums;

using Microsoft.Extensions.Caching.Memory;

public class AnalyticsService : IAnalyticsService
{
    private readonly IProductIQDbContext _context;
    private readonly IRiskDetectionService _riskDetectionService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<AnalyticsService> _logger;

    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);
    private const string AnalyticsSummaryCacheKey = "AnalyticsSummary_CacheKey";

    public AnalyticsService(
        IProductIQDbContext context,
        IRiskDetectionService riskDetectionService,
        IMemoryCache cache,
        ILogger<AnalyticsService> logger)
    {
        _context = context;
        _riskDetectionService = riskDetectionService;
        _cache = cache;
        _logger = logger;
    }

    public async Task<AnalyticsSummaryDto> GetAnalyticsSummaryAsync(CancellationToken cancellationToken = default)
    {
        if (_cache.TryGetValue(AnalyticsSummaryCacheKey, out AnalyticsSummaryDto? cachedSummary) && cachedSummary != null)
        {
            return cachedSummary;
        }

        var catalog = await GetCatalogAnalyticsAsync(cancellationToken);
        var duplicates = await GetDuplicateAnalyticsAsync(cancellationToken);
        var risk = await GetRiskAnalyticsAsync(cancellationToken);
        var search = await GetSearchAnalyticsAsync(cancellationToken);

        var summary = new AnalyticsSummaryDto
        {
            Catalog = catalog,
            Duplicates = duplicates,
            Risk = risk,
            Search = search,
            GeneratedAt = DateTime.UtcNow
        };

        _cache.Set(AnalyticsSummaryCacheKey, summary, CacheDuration);
        return summary;
    }

    public async Task<CatalogAnalyticsDto> GetCatalogAnalyticsAsync(CancellationToken cancellationToken = default)
    {
        var totalProducts = await _context.Products.CountAsync(cancellationToken);
        var withImages = await _context.Products.CountAsync(p => p.Images.Any(), cancellationToken);
        var withAttributes = await _context.Products.CountAsync(p => p.Attributes.Any(), cancellationToken);
        var totalBrands = await _context.Products.Where(p => p.Brand != null && p.Brand != "").Select(p => p.Brand).Distinct().CountAsync(cancellationToken);
        var totalCategories = await _context.Products.Where(p => p.Category != null && p.Category != "").Select(p => p.Category).Distinct().CountAsync(cancellationToken);

        return new CatalogAnalyticsDto
        {
            TotalProducts = totalProducts,
            ProductsWithImages = withImages,
            ProductsWithAttributes = withAttributes,
            TotalBrands = totalBrands,
            TotalCategories = totalCategories
        };
    }

    public async Task<DuplicateAnalyticsDto> GetDuplicateAnalyticsAsync(CancellationToken cancellationToken = default)
    {
        var totalCandidates = await _context.DuplicateCandidates.CountAsync(cancellationToken);
        var totalProducts = await _context.Products.CountAsync(cancellationToken);

        var statusGroups = await _context.DuplicateCandidates
            .GroupBy(d => d.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var pendingCount = statusGroups.FirstOrDefault(g => g.Status == DuplicateStatus.Potential)?.Count ?? 0;
        var confirmedCount = statusGroups.FirstOrDefault(g => g.Status == DuplicateStatus.Confirmed)?.Count ?? 0;
        var rejectedCount = statusGroups.FirstOrDefault(g => g.Status == DuplicateStatus.Rejected)?.Count ?? 0;
        var autoMergedCount = statusGroups.FirstOrDefault(g => g.Status == DuplicateStatus.AutoMerged)?.Count ?? 0;

        var prodAIds = await _context.DuplicateCandidates.Select(d => d.ProductAId).Distinct().ToListAsync(cancellationToken);
        var prodBIds = await _context.DuplicateCandidates.Select(d => d.ProductBId).Distinct().ToListAsync(cancellationToken);
        var uniqueProdsInvolved = prodAIds.Union(prodBIds).Count();

        var duplicateRate = totalProducts > 0 ? Math.Round((double)uniqueProdsInvolved / totalProducts, 4) : 0.0;
        var duplicateRatePercent = (int)Math.Round(duplicateRate * 100.0);

        double avgScore = 0.0;
        double minScore = 0.0;
        double maxScore = 0.0;

        if (totalCandidates > 0)
        {
            avgScore = Math.Round(await _context.DuplicateCandidates.AverageAsync(d => (double)d.OverallScore, cancellationToken), 4);
            minScore = Math.Round(await _context.DuplicateCandidates.MinAsync(d => (double)d.OverallScore, cancellationToken), 4);
            maxScore = Math.Round(await _context.DuplicateCandidates.MaxAsync(d => (double)d.OverallScore, cancellationToken), 4);
        }

        double? precision = null;
        int? precisionPercent = null;
        bool precisionAvailable = false;
        string precisionExplanation;

        var reviewedCount = confirmedCount + rejectedCount;
        if (reviewedCount > 0)
        {
            precision = Math.Round((double)confirmedCount / reviewedCount, 4);
            precisionPercent = (int)Math.Round(precision.Value * 100.0);
            precisionAvailable = true;
            precisionExplanation = $"Calculated from {reviewedCount} human operator reviews ({confirmedCount} confirmed duplicates / true positives, {rejectedCount} rejected / false positives).";
        }
        else
        {
            precisionExplanation = "Precision requires at least one operator review decision (Confirm Merge or Keep Distinct) to be recorded.";
        }

        return new DuplicateAnalyticsDto
        {
            TotalCandidates = totalCandidates,
            PendingReviewCount = pendingCount,
            ConfirmedCount = confirmedCount,
            RejectedCount = rejectedCount,
            AutoMergedCount = autoMergedCount,
            UniqueProductsInvolved = uniqueProdsInvolved,
            DuplicateRate = duplicateRate,
            DuplicateRatePercent = duplicateRatePercent,
            AverageOverallScore = avgScore,
            MinScore = minScore,
            MaxScore = maxScore,
            Precision = precision,
            PrecisionPercent = precisionPercent,
            PrecisionAvailable = precisionAvailable,
            PrecisionExplanation = precisionExplanation,
            Recall = null,
            RecallPercent = null,
            RecallAvailable = false,
            RecallExplanation = "Recall requires ground-truth false-negative duplicate labels across the entire catalog combinatorial space, which are not currently available in the dataset."
        };
    }

    public async Task<RiskAnalyticsDto> GetRiskAnalyticsAsync(CancellationToken cancellationToken = default)
    {
        var candidates = await _context.DuplicateCandidates
            .AsNoTracking()
            .AsSplitQuery()
            .Include(d => d.ProductA)
                .ThenInclude(p => p.Images)
            .Include(d => d.ProductA)
                .ThenInclude(p => p.Attributes)
            .Include(d => d.ProductB)
                .ThenInclude(p => p.Images)
            .Include(d => d.ProductB)
                .ThenInclude(p => p.Attributes)
            .ToListAsync(cancellationToken);

        var criticalCount = 0;
        var highCount = 0;
        var mediumCount = 0;
        var lowCount = 0;
        var immediateReviewCount = 0;
        var totalRiskScore = 0.0;
        var signalCounts = new Dictionary<string, int>();

        foreach (var c in candidates)
        {
            var risk = _riskDetectionService.AssessCandidateRisk(c.ProductA, c.ProductB, c, c.VisualSimilarity);

            totalRiskScore += risk.RiskScore;

            if (risk.RequiresImmediateReview)
            {
                immediateReviewCount++;
            }

            switch (risk.RiskLevel.ToLowerInvariant())
            {
                case "critical":
                    criticalCount++;
                    break;
                case "high":
                    highCount++;
                    break;
                case "medium":
                    mediumCount++;
                    break;
                case "low":
                default:
                    lowCount++;
                    break;
            }

            foreach (var sig in risk.RiskSignals)
            {
                signalCounts[sig.Code] = signalCounts.GetValueOrDefault(sig.Code) + 1;
            }
        }

        var avgRisk = candidates.Count > 0 ? Math.Round(totalRiskScore / candidates.Count, 2) : 0.0;

        return new RiskAnalyticsDto
        {
            TotalEvaluated = candidates.Count,
            CriticalRiskCount = criticalCount,
            HighRiskCount = highCount,
            MediumRiskCount = mediumCount,
            LowRiskCount = lowCount,
            ImmediateReviewCount = immediateReviewCount,
            AverageRiskScore = avgRisk,
            TopRiskSignals = signalCounts
        };
    }

    public async Task<SearchAnalyticsDto> GetSearchAnalyticsAsync(CancellationToken cancellationToken = default)
    {
        var totalSearches = await _context.SearchQueryLogs.CountAsync(cancellationToken);
        var zeroResults = await _context.SearchQueryLogs.CountAsync(l => l.TotalResults == 0, cancellationToken);

        var zeroRate = totalSearches > 0 ? Math.Round((double)zeroResults / totalSearches, 4) : 0.0;
        var zeroRatePercent = (int)Math.Round(zeroRate * 100.0);

        double? avgRelevance = null;
        int? avgRelevancePercent = null;
        double avgExecTime = 0.0;

        if (totalSearches > 0)
        {
            var avgRelNullable = await _context.SearchQueryLogs
                .Where(l => l.AvgRelevanceScore != null)
                .AverageAsync(l => (double?)l.AvgRelevanceScore, cancellationToken);

            if (avgRelNullable.HasValue)
            {
                avgRelevance = Math.Round(avgRelNullable.Value, 4);
                avgRelevancePercent = (int)Math.Round(avgRelevance.Value * 100.0);
            }

            avgExecTime = Math.Round(await _context.SearchQueryLogs.AverageAsync(l => (double)l.ExecutionTimeMs, cancellationToken), 2);
        }

        var recent = await _context.SearchQueryLogs
            .OrderByDescending(l => l.CreatedAt)
            .Take(10)
            .Select(l => new SearchQueryLogDto
            {
                Id = l.Id,
                QueryText = l.QueryText,
                ExecutionTimeMs = l.ExecutionTimeMs,
                TotalResults = l.TotalResults,
                AvgRelevanceScore = l.AvgRelevanceScore,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var explanation = totalSearches > 0
            ? $"Calculated from {totalSearches} logged search queries across user playground sessions."
            : "No search queries have been recorded yet.";

        return new SearchAnalyticsDto
        {
            TotalSearches = totalSearches,
            ZeroResultSearches = zeroResults,
            ZeroResultRate = zeroRate,
            ZeroResultRatePercent = zeroRatePercent,
            AverageSearchRelevance = avgRelevance,
            AverageSearchRelevancePercent = avgRelevancePercent,
            AverageExecutionTimeMs = avgExecTime,
            SearchRelevanceAvailable = totalSearches > 0,
            ZeroResultRateAvailable = totalSearches > 0,
            RelevanceExplanation = explanation,
            RecentSearches = recent
        };
    }

    public async Task<CatalogHealthDto> GetCatalogHealthAsync(string period = "30d", CancellationToken cancellationToken = default)
    {
        var normalizedPeriod = period?.Trim().ToUpperInvariant() switch
        {
            "7D" => "7D",
            "90D" => "90D",
            _ => "30D"
        };

        var cacheKey = $"CatalogHealth_{normalizedPeriod}";
        if (_cache.TryGetValue(cacheKey, out CatalogHealthDto? cachedHealth) && cachedHealth != null)
        {
            return cachedHealth;
        }

        var days = normalizedPeriod switch
        {
            "7D" => 7,
            "90D" => 90,
            _ => 30
        };

        var productDates = await _context.Products
            .Select(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

        var duplicateItems = await _context.DuplicateCandidates
            .Select(d => new { d.CreatedAt, d.Status })
            .ToListAsync(cancellationToken);

        var totalProducts = productDates.Count;
        var totalDuplicates = duplicateItems.Count;
        var withImages = await _context.Products.CountAsync(p => p.Images.Any(), cancellationToken);
        var withAttributes = await _context.Products.CountAsync(p => p.Attributes.Any(), cancellationToken);

        var completenessRatio = totalProducts > 0
            ? (double)(withImages + withAttributes) / (totalProducts * 2.0)
            : 0.85;

        var baseScore = 75.0 + (completenessRatio * 20.0);

        var today = DateTime.UtcNow.Date;
        var startDate = today.AddDays(-(days - 1));

        var stepDays = normalizedPeriod switch
        {
            "90D" => 3,
            _ => 1
        };

        var dataPoints = new List<CatalogHealthDataPointDto>();

        for (var date = startDate; date <= today; date = date.AddDays(stepDays))
        {
            var endOfDay = date.AddDays(1).AddTicks(-1);

            var prodsAtDate = productDates.Count(d => d <= endOfDay);
            var dupsAtDate = duplicateItems.Count(d => d.CreatedAt <= endOfDay);
            var resolvedDupsAtDate = duplicateItems.Count(d => d.CreatedAt <= endOfDay && d.Status != DuplicateStatus.Potential);

            double score;
            if (prodsAtDate == 0)
            {
                score = 80.0;
            }
            else
            {
                var dupRatio = (double)dupsAtDate / Math.Max(1, prodsAtDate);
                var resolvedRatio = dupsAtDate > 0 ? (double)resolvedDupsAtDate / dupsAtDate : 0.0;
                var penalty = dupRatio * 25.0;
                var resolutionBonus = resolvedRatio * 5.0;
                score = Math.Clamp(baseScore - penalty + resolutionBonus, 45.0, 98.0);
            }

            var dateLabel = normalizedPeriod == "7D"
                ? date.ToString("ddd, MMM d")
                : date.ToString("MMM d");

            dataPoints.Add(new CatalogHealthDataPointDto
            {
                Date = dateLabel,
                QualityScore = Math.Round(score, 1),
                DuplicatesDetected = dupsAtDate,
                TotalProducts = prodsAtDate
            });
        }

        var currentScore = dataPoints.Count > 0 ? dataPoints[^1].QualityScore : 85.0;

        var health = new CatalogHealthDto
        {
            Period = normalizedPeriod,
            CurrentQualityScore = currentScore,
            TotalDuplicatesDetected = totalDuplicates,
            TotalProducts = totalProducts,
            DataPoints = dataPoints
        };

        _cache.Set(cacheKey, health, CacheDuration);
        return health;
    }
}
