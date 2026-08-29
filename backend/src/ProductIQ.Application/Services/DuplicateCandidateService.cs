namespace ProductIQ.Application.Services;

using System.Diagnostics;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ProductIQ.Application.Common.Configuration;
using ProductIQ.Application.Common.Models;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Entities;
using ProductIQ.Domain.Enums;

public class DuplicateCandidateService : IDuplicateCandidateService
{
    private readonly IProductIQDbContext _context;
    private readonly IDuplicateExplanationService _explanationService;
    private readonly IImageSimilarityService _imageSimilarityService;
    private readonly CandidateDetectionOptions _options;
    private readonly ILogger<DuplicateCandidateService> _logger;

    public DuplicateCandidateService(
        IProductIQDbContext context,
        IDuplicateExplanationService explanationService,
        IImageSimilarityService imageSimilarityService,
        IOptions<CandidateDetectionOptions> options,
        ILogger<DuplicateCandidateService> logger)
    {
        _context = context;
        _explanationService = explanationService;
        _imageSimilarityService = imageSimilarityService;
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
            .OrderByDescending(d => d.OverallScore)
            .ThenByDescending(d => d.CreatedAt)
            .Skip((Math.Max(1, page) - 1) * Math.Clamp(pageSize, 1, 100))
            .Take(Math.Clamp(pageSize, 1, 100))
            .ToListAsync(cancellationToken);

        return candidates.Select(MapToSummaryDto).ToList();
    }

    public async Task<PagedResponse<DuplicateCandidateSummaryDto>> GetPagedCandidatesAsync(DuplicateCandidateQueryParameters parameters, CancellationToken cancellationToken = default)
    {
        var page = Math.Max(1, parameters.Page);
        var pageSize = Math.Clamp(parameters.PageSize, 1, 100);

        var query = _context.DuplicateCandidates
            .AsNoTracking()
            .Include(d => d.ProductA)
            .Include(d => d.ProductB)
            .AsQueryable();

        if (parameters.Status.HasValue)
        {
            query = query.Where(d => d.Status == parameters.Status.Value);
        }

        if (parameters.MinScore.HasValue)
        {
            query = query.Where(d => d.OverallScore >= parameters.MinScore.Value);
        }

        if (parameters.MaxScore.HasValue)
        {
            query = query.Where(d => d.OverallScore <= parameters.MaxScore.Value);
        }

        if (!string.IsNullOrWhiteSpace(parameters.Brand))
        {
            var brandQuery = parameters.Brand.Trim().ToLowerInvariant();
            query = query.Where(d => (d.ProductA.Brand != null && d.ProductA.Brand.ToLower().Contains(brandQuery)) ||
                                     (d.ProductB.Brand != null && d.ProductB.Brand.ToLower().Contains(brandQuery)));
        }

        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var search = parameters.Search.Trim().ToLowerInvariant();
            query = query.Where(d => d.ProductA.Name.ToLower().Contains(search) ||
                                     d.ProductB.Name.ToLower().Contains(search) ||
                                     d.ProductA.AmazonItemId.ToLower().Contains(search) ||
                                     d.ProductB.AmazonItemId.ToLower().Contains(search));
        }

        var isDesc = string.Equals(parameters.SortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = parameters.SortBy?.ToLowerInvariant() switch
        {
            "date" or "createdat" => isDesc ? query.OrderByDescending(d => d.CreatedAt) : query.OrderBy(d => d.CreatedAt),
            "text" or "textsimilarity" => isDesc ? query.OrderByDescending(d => d.TextSimilarity) : query.OrderBy(d => d.TextSimilarity),
            "semantic" or "semanticsimilarity" => isDesc ? query.OrderByDescending(d => d.SemanticSimilarity) : query.OrderBy(d => d.SemanticSimilarity),
            "attribute" or "attributesimilarity" => isDesc ? query.OrderByDescending(d => d.AttributeSimilarity) : query.OrderBy(d => d.AttributeSimilarity),
            _ => isDesc ? query.OrderByDescending(d => d.OverallScore).ThenByDescending(d => d.CreatedAt) : query.OrderBy(d => d.OverallScore).ThenBy(d => d.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var candidates = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = candidates.Select(MapToSummaryDto).ToList();

        return new PagedResponse<DuplicateCandidateSummaryDto>(items, totalCount, page, pageSize);
    }

    public async Task<DuplicateCandidateDetailDto?> GetCandidateDetailByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var candidate = await _context.DuplicateCandidates
            .AsNoTracking()
            .Include(d => d.ProductA)
                .ThenInclude(p => p.Images)
            .Include(d => d.ProductA)
                .ThenInclude(p => p.Attributes)
            .Include(d => d.ProductB)
                .ThenInclude(p => p.Images)
            .Include(d => d.ProductB)
                .ThenInclude(p => p.Attributes)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        if (candidate == null)
        {
            return null;
        }

        var imageSimilarity = await _imageSimilarityService.ComputeImageSimilarityAsync(candidate.ProductAId, candidate.ProductBId, cancellationToken);
        return MapToCandidateDetailDto(candidate, imageSimilarity);
    }

    public async Task<DuplicateCandidateDetailDto> ConfirmCandidateAsync(Guid candidateId, string? resolutionNotes = null, CancellationToken cancellationToken = default)
    {
        return await UpdateCandidateStatusAsync(candidateId, DuplicateStatus.Confirmed, resolutionNotes, cancellationToken);
    }

    public async Task<DuplicateCandidateDetailDto> RejectCandidateAsync(Guid candidateId, string? resolutionNotes = null, CancellationToken cancellationToken = default)
    {
        return await UpdateCandidateStatusAsync(candidateId, DuplicateStatus.Rejected, resolutionNotes, cancellationToken);
    }

    public async Task<DuplicateCandidateDetailDto> UpdateCandidateStatusAsync(Guid candidateId, DuplicateStatus status, string? resolutionNotes = null, CancellationToken cancellationToken = default)
    {
        var candidate = await _context.DuplicateCandidates
            .Include(d => d.ProductA)
                .ThenInclude(p => p.Images)
            .Include(d => d.ProductA)
                .ThenInclude(p => p.Attributes)
            .Include(d => d.ProductB)
                .ThenInclude(p => p.Images)
            .Include(d => d.ProductB)
                .ThenInclude(p => p.Attributes)
            .FirstOrDefaultAsync(d => d.Id == candidateId, cancellationToken);

        if (candidate == null)
        {
            throw new KeyNotFoundException($"Duplicate candidate with ID '{candidateId}' was not found.");
        }

        candidate.Status = status;
        candidate.ReviewedAt = DateTime.UtcNow;
        candidate.UpdatedAt = DateTime.UtcNow;

        if (resolutionNotes != null)
        {
            candidate.ResolutionNotes = resolutionNotes;
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Candidate {CandidateId} status updated to {Status}", candidateId, status);

        var imageSimilarity = await _imageSimilarityService.ComputeImageSimilarityAsync(candidate.ProductAId, candidate.ProductBId, cancellationToken);
        return MapToCandidateDetailDto(candidate, imageSimilarity);
    }

    public async Task<DuplicateCandidatesSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        var candidates = await _context.DuplicateCandidates
            .AsNoTracking()
            .Select(d => new { d.Status, d.OverallScore })
            .ToListAsync(cancellationToken);

        var total = candidates.Count;
        var scored = candidates.Count(c => c.OverallScore > 0);

        var potential = candidates.Count(c => c.Status == DuplicateStatus.Potential);
        var confirmed = candidates.Count(c => c.Status == DuplicateStatus.Confirmed);
        var rejected = candidates.Count(c => c.Status == DuplicateStatus.Rejected);

        var high = candidates.Count(c => c.OverallScore >= 0.55m);
        var medium = candidates.Count(c => c.OverallScore >= 0.40m && c.OverallScore < 0.55m);
        var low = candidates.Count(c => c.OverallScore < 0.40m);

        var avg = scored > 0 ? Math.Round(candidates.Where(c => c.OverallScore > 0).Average(c => c.OverallScore), 4) : 0;
        var min = scored > 0 ? candidates.Where(c => c.OverallScore > 0).Min(c => c.OverallScore) : 0;
        var max = scored > 0 ? candidates.Where(c => c.OverallScore > 0).Max(c => c.OverallScore) : 0;

        return new DuplicateCandidatesSummaryDto
        {
            TotalCandidates = total,
            ScoredCandidates = scored,
            PotentialCount = potential,
            ConfirmedCount = confirmed,
            RejectedCount = rejected,
            HighConfidenceCount = high,
            MediumConfidenceCount = medium,
            LowConfidenceCount = low,
            AverageOverallScore = avg,
            MinimumScore = min,
            MaximumScore = max
        };
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
            TextSimilarity = c.TextSimilarity,
            SemanticSimilarity = c.SemanticSimilarity,
            AttributeSimilarity = c.AttributeSimilarity,
            VisualSimilarity = c.VisualSimilarity,
            BrandMatch = c.BrandMatch,
            ModelMatch = c.ModelMatch,
            CategoryMatch = IsValidMatch(c.ProductA?.Category ?? c.ProductA?.NodePath, c.ProductB?.Category ?? c.ProductB?.NodePath),
            Status = c.Status,
            MatchSignals = c.MatchSignals,
            CreatedAt = c.CreatedAt
        };
    }

    private DuplicateCandidateDetailDto MapToCandidateDetailDto(DuplicateCandidate candidate, ImageSimilarityResultDto imageSimilarity)
    {
        var prodA = candidate.ProductA;
        var prodB = candidate.ProductB;

        var catA = prodA?.Category ?? prodA?.NodePath;
        var catB = prodB?.Category ?? prodB?.NodePath;
        var categoryMatch = IsValidMatch(catA, catB);

        var effectiveVisualSimilarity = candidate.VisualSimilarity ?? imageSimilarity.SimilarityScore;

        var explanation = (prodA != null && prodB != null)
            ? _explanationService.GenerateExplanation(
                prodA,
                prodB,
                candidate.OverallScore,
                candidate.TextSimilarity,
                candidate.SemanticSimilarity,
                candidate.AttributeSimilarity,
                effectiveVisualSimilarity,
                candidate.BrandMatch,
                candidate.ModelMatch,
                categoryMatch)
            : new CandidateExplanationDto();

        return new DuplicateCandidateDetailDto
        {
            Id = candidate.Id,
            ProductAId = candidate.ProductAId,
            ProductBId = candidate.ProductBId,
            ProductA = prodA != null ? MapToDetailDto(prodA) : null,
            ProductB = prodB != null ? MapToDetailDto(prodB) : null,
            OverallScore = candidate.OverallScore,
            TextSimilarity = candidate.TextSimilarity,
            SemanticSimilarity = candidate.SemanticSimilarity,
            AttributeSimilarity = candidate.AttributeSimilarity,
            VisualSimilarity = candidate.VisualSimilarity,
            BrandMatch = candidate.BrandMatch,
            ModelMatch = candidate.ModelMatch,
            CategoryMatch = categoryMatch,
            Status = candidate.Status,
            MatchSignals = candidate.MatchSignals,
            AiExplanation = candidate.AiExplanation,
            ResolutionNotes = candidate.ResolutionNotes,
            ReviewedAt = candidate.ReviewedAt,
            CreatedAt = candidate.CreatedAt,
            UpdatedAt = candidate.UpdatedAt,
            Explanation = explanation,
            ImageSimilarity = imageSimilarity
        };
    }

    private static ProductDetailDto MapToDetailDto(Product product)
    {
        return new ProductDetailDto
        {
            Id = product.Id,
            AmazonItemId = product.AmazonItemId,
            Name = product.Name,
            Description = product.Description,
            Brand = product.Brand,
            Category = product.Category,
            NodeId = product.NodeId,
            NodePath = product.NodePath,
            ProductType = product.ProductType,
            ModelName = product.ModelName,
            ModelNumber = product.ModelNumber,
            Color = product.Color,
            Material = product.Material,
            Dimensions = product.Dimensions == null ? null : new ItemDimensionsDto
            {
                Length = product.Dimensions.Length,
                Width = product.Dimensions.Width,
                Height = product.Dimensions.Height,
                Weight = product.Dimensions.Weight,
                DimensionUnit = product.Dimensions.DimensionUnit,
                WeightUnit = product.Dimensions.WeightUnit
            },
            Price = product.Price,
            Currency = product.Currency,
            MainImageUrl = product.MainImageUrl,
            Country = product.Country,
            DomainName = product.DomainName,
            Images = product.Images
                .OrderByDescending(i => i.IsMain)
                .Select(i => new ProductImageDto
                {
                    Id = i.Id,
                    ImageId = i.ImageId,
                    Path = i.Path,
                    Url = i.Url,
                    Width = i.Width,
                    Height = i.Height,
                    IsMain = i.IsMain
                }).ToList(),
            Attributes = product.Attributes
                .OrderBy(a => a.Key)
                .Select(a => new ProductAttributeDto
                {
                    Id = a.Id,
                    Key = a.Key,
                    Value = a.Value,
                    Language = a.Language
                }).ToList(),
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
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
