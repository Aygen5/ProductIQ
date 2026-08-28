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

public class DuplicateCandidateService : IDuplicateCandidateService
{
    private readonly IProductIQDbContext _context;
    private readonly CandidateDetectionOptions _options;
    private readonly ILogger<DuplicateCandidateService> _logger;

    public DuplicateCandidateService(
        IProductIQDbContext context,
        IOptions<CandidateDetectionOptions> options,
        ILogger<DuplicateCandidateService> logger)
    {
        _context = context;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<CandidateDetectionResultDto> RunCandidateDetectionAsync(CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var result = new CandidateDetectionResultDto();

        var products = await _context.Products
            .AsNoTracking()
            .Select(p => new
            {
                p.Id,
                p.AmazonItemId,
                p.Name,
                p.Brand,
                Category = p.Category ?? p.NodePath,
                p.ProductType,
                p.ModelName,
                p.ModelNumber
            })
            .ToListAsync(cancellationToken);

        result.TotalProductsEvaluated = products.Count;

        if (products.Count < 2)
        {
            stopwatch.Stop();
            result.ExecutionDuration = stopwatch.Elapsed;
            return result;
        }

        var candidateMap = new Dictionary<(Guid, Guid), DuplicateCandidate>();
        var ruleCounts = new Dictionary<string, int>
        {
            { "BrandAndCategory", 0 },
            { "BrandAndProductType", 0 },
            { "BrandAndModelName", 0 },
            { "ModelNumberMatch", 0 }
        };

        var brandBlocks = products
            .Where(p => !string.IsNullOrWhiteSpace(p.Brand))
            .GroupBy(p => Normalize(p.Brand))
            .Where(g => g.Count() > 1);

        foreach (var block in brandBlocks)
        {
            var blockItems = block.ToList();
            for (var i = 0; i < blockItems.Count; i++)
            {
                for (var j = i + 1; j < blockItems.Count; j++)
                {
                    var p1 = blockItems[i];
                    var p2 = blockItems[j];

                    if (p1.Id == p2.Id)
                    {
                        continue;
                    }

                    var isP1First = p1.Id.CompareTo(p2.Id) < 0;
                    var prodA = isP1First ? p1 : p2;
                    var prodB = isP1First ? p2 : p1;
                    var pairKey = (prodA.Id, prodB.Id);

                    var brandMatch = IsValidMatch(prodA.Brand, prodB.Brand);
                    var categoryMatch = IsValidMatch(prodA.Category, prodB.Category);
                    var productTypeMatch = IsValidMatch(prodA.ProductType, prodB.ProductType);
                    var modelNameMatch = IsValidMatch(prodA.ModelName, prodB.ModelName);
                    var modelNumberMatch = IsValidMatch(prodA.ModelNumber, prodB.ModelNumber);

                    var rulesTriggered = new List<string>();

                    if (_options.EnableBrandAndCategoryRule && brandMatch && categoryMatch)
                    {
                        rulesTriggered.Add("BrandAndCategory");
                        ruleCounts["BrandAndCategory"]++;
                    }

                    if (_options.EnableBrandAndProductTypeRule && brandMatch && productTypeMatch && !categoryMatch)
                    {
                        rulesTriggered.Add("BrandAndProductType");
                        ruleCounts["BrandAndProductType"]++;
                    }

                    if (_options.EnableBrandAndModelNameRule && brandMatch && modelNameMatch)
                    {
                        rulesTriggered.Add("BrandAndModelName");
                        ruleCounts["BrandAndModelName"]++;
                    }

                    if (_options.EnableModelNumberRule && modelNumberMatch)
                    {
                        rulesTriggered.Add("ModelNumberMatch");
                        ruleCounts["ModelNumberMatch"]++;
                    }

                    if (rulesTriggered.Count > 0)
                    {
                        if (!candidateMap.ContainsKey(pairKey))
                        {
                            var signalsObj = new
                            {
                                brand_match = brandMatch,
                                category_match = categoryMatch,
                                product_type_match = productTypeMatch,
                                model_name_match = modelNameMatch,
                                model_number_match = modelNumberMatch,
                                rules = rulesTriggered
                            };

                            candidateMap[pairKey] = new DuplicateCandidate
                            {
                                Id = Guid.NewGuid(),
                                ProductAId = prodA.Id,
                                ProductBId = prodB.Id,
                                BrandMatch = brandMatch,
                                ModelMatch = modelNameMatch || modelNumberMatch,
                                OverallScore = 0.0m,
                                Status = DuplicateStatus.Potential,
                                MatchSignals = JsonSerializer.Serialize(signalsObj),
                                CreatedAt = DateTime.UtcNow
                            };
                        }
                    }
                }
            }
        }

        var modelNumberBlocks = products
            .Where(p => !string.IsNullOrWhiteSpace(p.ModelNumber))
            .GroupBy(p => Normalize(p.ModelNumber))
            .Where(g => g.Count() > 1);

        foreach (var block in modelNumberBlocks)
        {
            var blockItems = block.ToList();
            for (var i = 0; i < blockItems.Count; i++)
            {
                for (var j = i + 1; j < blockItems.Count; j++)
                {
                    var p1 = blockItems[i];
                    var p2 = blockItems[j];

                    if (p1.Id == p2.Id)
                    {
                        continue;
                    }

                    var isP1First = p1.Id.CompareTo(p2.Id) < 0;
                    var prodA = isP1First ? p1 : p2;
                    var prodB = isP1First ? p2 : p1;
                    var pairKey = (prodA.Id, prodB.Id);

                    if (!candidateMap.ContainsKey(pairKey))
                    {
                        var brandMatch = IsValidMatch(prodA.Brand, prodB.Brand);
                        var categoryMatch = IsValidMatch(prodA.Category, prodB.Category);
                        var productTypeMatch = IsValidMatch(prodA.ProductType, prodB.ProductType);
                        var modelNameMatch = IsValidMatch(prodA.ModelName, prodB.ModelName);

                        var signalsObj = new
                        {
                            brand_match = brandMatch,
                            category_match = categoryMatch,
                            product_type_match = productTypeMatch,
                            model_name_match = modelNameMatch,
                            model_number_match = true,
                            rules = new[] { "ModelNumberMatch" }
                        };

                        ruleCounts["ModelNumberMatch"]++;

                        candidateMap[pairKey] = new DuplicateCandidate
                        {
                            Id = Guid.NewGuid(),
                            ProductAId = prodA.Id,
                            ProductBId = prodB.Id,
                            BrandMatch = brandMatch,
                            ModelMatch = true,
                            OverallScore = 0.0m,
                            Status = DuplicateStatus.Potential,
                            MatchSignals = JsonSerializer.Serialize(signalsObj),
                            CreatedAt = DateTime.UtcNow
                        };
                    }
                }
            }
        }

        result.TotalCandidatePairsFound = candidateMap.Count;
        result.RuleMatchCounts = ruleCounts;

        var existingPairs = await _context.DuplicateCandidates
            .AsNoTracking()
            .Select(d => new { d.ProductAId, d.ProductBId })
            .ToListAsync(cancellationToken);

        var existingSet = existingPairs.Select(p => (p.ProductAId, p.ProductBId)).ToHashSet();

        var newCandidates = new List<DuplicateCandidate>();
        foreach (var kvp in candidateMap)
        {
            if (existingSet.Contains(kvp.Key))
            {
                result.SkippedExistingCandidates++;
            }
            else
            {
                newCandidates.Add(kvp.Value);
            }
        }

        if (newCandidates.Count > 0)
        {
            _context.DuplicateCandidates.AddRange(newCandidates);
            await _context.SaveChangesAsync(cancellationToken);
            result.NewlySavedCandidates = newCandidates.Count;
        }

        stopwatch.Stop();
        result.ExecutionDuration = stopwatch.Elapsed;

        _logger.LogInformation("Candidate detection completed: Found {Found}, Newly Saved {Saved}, Skipped {Skipped} in {Elapsed}ms",
            result.TotalCandidatePairsFound, result.NewlySavedCandidates, result.SkippedExistingCandidates, result.ExecutionDuration.TotalMilliseconds);

        return result;
    }

    public async Task<IReadOnlyList<DuplicateCandidateSummaryDto>> GetCandidatesAsync(int page = 1, int pageSize = 20, DuplicateStatus? status = null, CancellationToken cancellationToken = default)
    {
        var query = _context.DuplicateCandidates
            .AsNoTracking()
            .Include(d => d.ProductA)
            .Include(d => d.ProductB)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(d => d.Status == status.Value);
        }

        var candidates = await query
            .OrderByDescending(d => d.CreatedAt)
            .Skip((Math.Max(1, page) - 1) * Math.Clamp(pageSize, 1, 100))
            .Take(Math.Clamp(pageSize, 1, 100))
            .ToListAsync(cancellationToken);

        return candidates.Select(MapToSummaryDto).ToList();
    }

    public async Task<int> GetCandidatesCountAsync(DuplicateStatus? status = null, CancellationToken cancellationToken = default)
    {
        var query = _context.DuplicateCandidates.AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(d => d.Status == status.Value);
        }

        return await query.CountAsync(cancellationToken);
    }

    private static DuplicateCandidateSummaryDto MapToSummaryDto(DuplicateCandidate c)
    {
        return new DuplicateCandidateSummaryDto
        {
            Id = c.Id,
            ProductAId = c.ProductAId,
            ProductBId = c.ProductBId,
            ProductA = c.ProductA != null ? new ProductSummaryDto
            {
                Id = c.ProductA.Id,
                AmazonItemId = c.ProductA.AmazonItemId,
                Name = c.ProductA.Name,
                Brand = c.ProductA.Brand,
                Category = c.ProductA.Category,
                NodePath = c.ProductA.NodePath,
                ProductType = c.ProductA.ProductType,
                MainImageUrl = c.ProductA.MainImageUrl,
                Price = c.ProductA.Price,
                Currency = c.ProductA.Currency,
                CreatedAt = c.ProductA.CreatedAt
            } : null,
            ProductB = c.ProductB != null ? new ProductSummaryDto
            {
                Id = c.ProductB.Id,
                AmazonItemId = c.ProductB.AmazonItemId,
                Name = c.ProductB.Name,
                Brand = c.ProductB.Brand,
                Category = c.ProductB.Category,
                NodePath = c.ProductB.NodePath,
                ProductType = c.ProductB.ProductType,
                MainImageUrl = c.ProductB.MainImageUrl,
                Price = c.ProductB.Price,
                Currency = c.ProductB.Currency,
                CreatedAt = c.ProductB.CreatedAt
            } : null,
            OverallScore = c.OverallScore,
            BrandMatch = c.BrandMatch,
            ModelMatch = c.ModelMatch,
            Status = c.Status,
            MatchSignals = c.MatchSignals,
            CreatedAt = c.CreatedAt
        };
    }

    private static bool IsValidMatch(string? a, string? b)
    {
        if (string.IsNullOrWhiteSpace(a) || string.IsNullOrWhiteSpace(b))
        {
            return false;
        }

        return string.Equals(Normalize(a), Normalize(b), StringComparison.OrdinalIgnoreCase);
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
