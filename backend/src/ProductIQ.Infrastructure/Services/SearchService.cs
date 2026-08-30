namespace ProductIQ.Infrastructure.Services;

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Pgvector;
using Pgvector.EntityFrameworkCore;
using ProductIQ.Application.Common.Configuration;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Entities;
using ProductIQ.Domain.Enums;

public class SearchService : ISearchService
{
    private static readonly HashSet<string> Stopwords = new(StringComparer.OrdinalIgnoreCase)
    {
        "a", "an", "the", "and", "or", "in", "on", "at", "for", "with", "by", "of", "to", "from", "is", "it"
    };

    private static readonly string[] KnownBrands = new[]
    {
        "Rivet", "AmazonBasics", "Stone & Beam", "Ravenna Home", "Pinzon", "Solimo", "Denali", "Now House by Jonathan Adler"
    };

    private static readonly string[] KnownCategories = new[]
    {
        "RUG", "PILLOW", "CHAIR", "DRINKWARE", "TABLE", "SOFA", "MATTRESS", "TOWEL", "SHEET", "BED", "BENCH", "OTTOMAN", "DESK", "LAMP", "CURTAIN", "MIRROR"
    };

    private static readonly string[] VisualAdjectives = new[]
    {
        "brick", "oatmeal", "blue", "navy", "grey", "gray", "black", "white", "gold", "sunshine", "dark", "rustic", "modern", "contemporary", "boho", "striped", "plaid", "leather", "wood", "glass", "velvet", "cotton", "wool"
    };

    private readonly IProductIQDbContext _context;
    private readonly IEmbeddingService _embeddingService;
    private readonly EmbeddingOptions _options;
    private readonly ILogger<SearchService> _logger;

    public SearchService(
        IProductIQDbContext context,
        IEmbeddingService embeddingService,
        IOptions<EmbeddingOptions> options,
        ILogger<SearchService> logger)
    {
        _context = context;
        _embeddingService = embeddingService;
        _options = options.Value;
        _logger = logger;
    }

    public QueryAnalysisDto AnalyzeQuery(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return new QueryAnalysisDto();
        }

        var raw = query.Trim();
        var normalized = Normalize(raw);
        var tokens = normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        string? detectedBrand = null;
        foreach (var brand in KnownBrands)
        {
            if (normalized.Contains(Normalize(brand), StringComparison.OrdinalIgnoreCase))
            {
                detectedBrand = brand;
                break;
            }
        }

        string? detectedCategory = null;
        foreach (var cat in KnownCategories)
        {
            if (tokens.Any(t => string.Equals(t, cat, StringComparison.OrdinalIgnoreCase) || t.StartsWith(cat.ToLowerInvariant(), StringComparison.OrdinalIgnoreCase)))
            {
                detectedCategory = cat;
                break;
            }
        }

        string? detectedModel = null;
        var asinRegex = new Regex(@"\b[B0-9][A-Z0-9]{8,11}\b", RegexOptions.IgnoreCase);
        var asinMatch = asinRegex.Match(raw);
        if (asinMatch.Success)
        {
            detectedModel = asinMatch.Value.ToUpperInvariant();
        }

        var hasVisualAdj = tokens.Any(t => VisualAdjectives.Contains(t, StringComparer.OrdinalIgnoreCase));
        var keyTerms = tokens.Where(t => !Stopwords.Contains(t)).ToList();

        var intent = "GeneralSearch";
        if (!string.IsNullOrWhiteSpace(detectedBrand) && !string.IsNullOrWhiteSpace(detectedCategory))
        {
            intent = "BrandCategorySearch";
        }
        else if (!string.IsNullOrWhiteSpace(detectedBrand))
        {
            intent = "BrandSearch";
        }
        else if (!string.IsNullOrWhiteSpace(detectedCategory))
        {
            intent = "CategorySearch";
        }
        else if (!string.IsNullOrWhiteSpace(detectedModel))
        {
            intent = "IdentifierSearch";
        }
        else if (hasVisualAdj)
        {
            intent = "AttributeSearch";
        }

        return new QueryAnalysisDto
        {
            RawQuery = raw,
            NormalizedQuery = normalized,
            DetectedBrand = detectedBrand,
            DetectedCategory = detectedCategory,
            DetectedModel = detectedModel,
            SearchIntent = intent,
            KeyTerms = keyTerms,
            HasVisualAdjectives = hasVisualAdj
        };
    }

    public async Task<SearchResponseDto> SearchAsync(SearchRequestDto request, CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var queryAnalysis = AnalyzeQuery(request.Query);

        if (string.IsNullOrWhiteSpace(request.Query))
        {
            return new SearchResponseDto
            {
                Query = string.Empty,
                Mode = request.Mode.ToString(),
                TotalCount = 0,
                Page = request.Page,
                PageSize = request.PageSize,
                ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
                QueryAnalysis = queryAnalysis,
                Results = new List<SearchResultDto>()
            };
        }

        var productsQuery = _context.Products
            .AsNoTracking()
            .Include(p => p.Attributes)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Brand))
        {
            productsQuery = productsQuery.Where(p => p.Brand != null && p.Brand.ToLower() == request.Brand.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            productsQuery = productsQuery.Where(p => (p.Category != null && p.Category.ToLower() == request.Category.ToLower()) || (p.NodePath != null && p.NodePath.ToLower().Contains(request.Category.ToLower())));
        }

        var allProducts = await productsQuery.ToListAsync(cancellationToken);

        Dictionary<Guid, double> semanticDistances = new();
        if (request.Mode is SearchMode.Semantic or SearchMode.Hybrid)
        {
            try
            {
                var queryVector = await _embeddingService.GenerateEmbeddingAsync(request.Query, cancellationToken);
                var pgVector = new Vector(queryVector);
                var modelName = _options.Model;

                var vectorResults = await _context.ProductEmbeddings
                    .AsNoTracking()
                    .Where(e => e.EmbeddingType == EmbeddingType.Text && e.ModelName == modelName && e.Vector != null)
                    .Select(e => new
                    {
                        e.ProductId,
                        Distance = e.Vector!.CosineDistance(pgVector)
                    })
                    .ToListAsync(cancellationToken);

                foreach (var vr in vectorResults)
                {
                    semanticDistances[vr.ProductId] = vr.Distance;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to compute semantic vector search for query '{Query}'", request.Query);
            }
        }

        var evaluatedResults = new List<SearchResultDto>();

        foreach (var p in allProducts)
        {
            var keywordScore = CalculateKeywordScore(p, queryAnalysis, out var matchedFields);

            double semanticScore = 0.0;
            if (semanticDistances.TryGetValue(p.Id, out var distance))
            {
                semanticScore = Math.Clamp(1.0 - distance, 0.0, 1.0);
            }

            double relevanceScore;
            switch (request.Mode)
            {
                case SearchMode.Keyword:
                    relevanceScore = keywordScore;
                    break;
                case SearchMode.Semantic:
                    relevanceScore = semanticScore;
                    break;
                case SearchMode.Hybrid:
                default:
                    relevanceScore = 0.50 * keywordScore + 0.50 * semanticScore;
                    if (matchedFields.Contains("Brand") && matchedFields.Contains("Title"))
                    {
                        relevanceScore = Math.Min(1.0, relevanceScore + 0.05);
                    }
                    break;
            }

            relevanceScore = Math.Round(Math.Clamp(relevanceScore, 0.0, 1.0), 4);
            var relevancePercent = (int)Math.Round(relevanceScore * 100.0);

            if (request.MinScore.HasValue && relevanceScore < request.MinScore.Value)
            {
                continue;
            }

            var shouldInclude = request.Mode switch
            {
                SearchMode.Keyword => keywordScore > 0.05,
                SearchMode.Semantic => semanticDistances.ContainsKey(p.Id),
                _ => relevanceScore > 0.02 || keywordScore > 0.05
            };

            if (shouldInclude)
            {
                var explanation = BuildExplanation(request.Mode, keywordScore, semanticScore, matchedFields, p.Brand);

                evaluatedResults.Add(new SearchResultDto
                {
                    ProductId = p.Id,
                    AmazonItemId = p.AmazonItemId,
                    Name = p.Name,
                    Brand = p.Brand,
                    Category = p.Category ?? p.NodePath,
                    ProductType = p.ProductType,
                    ModelName = p.ModelName,
                    ModelNumber = p.ModelNumber,
                    Price = p.Price,
                    Currency = p.Currency,
                    MainImageUrl = p.MainImageUrl,
                    RelevanceScore = relevanceScore,
                    RelevancePercent = relevancePercent,
                    KeywordScore = Math.Round(keywordScore, 4),
                    SemanticScore = Math.Round(semanticScore, 4),
                    MatchedFields = matchedFields,
                    Explanation = explanation
                });
            }
        }

        var sorted = evaluatedResults
            .OrderByDescending(r => r.RelevanceScore)
            .ThenByDescending(r => r.KeywordScore)
            .ThenByDescending(r => r.SemanticScore)
            .ToList();

        var totalCount = sorted.Count;
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var pagedResults = sorted.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        stopwatch.Stop();

        try
        {
            var avgRel = sorted.Count > 0 ? (decimal?)Math.Round((decimal)sorted.Average(r => r.RelevanceScore), 4) : null;
            _context.SearchQueryLogs.Add(new SearchQueryLog
            {
                QueryText = request.Query,
                ExecutionTimeMs = (int)stopwatch.ElapsedMilliseconds,
                TotalResults = totalCount,
                AvgRelevanceScore = avgRel,
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to log search query analytics for '{Query}'", request.Query);
        }

        return new SearchResponseDto
        {
            Query = request.Query,
            Mode = request.Mode.ToString(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
            QueryAnalysis = queryAnalysis,
            Results = pagedResults
        };
    }

    private static double CalculateKeywordScore(Product product, QueryAnalysisDto analysis, out List<string> matchedFields)
    {
        matchedFields = new List<string>();
        var score = 0.0;

        var normName = Normalize(product.Name);
        var normBrand = Normalize(product.Brand);
        var normCat = Normalize(product.Category ?? product.NodePath);
        var normModel = Normalize($"{product.ModelName} {product.ModelNumber} {product.AmazonItemId}");
        var normDesc = Normalize(product.Description);

        if (!string.IsNullOrWhiteSpace(normName) && normName.Contains(analysis.NormalizedQuery))
        {
            score += 0.50;
            matchedFields.Add("TitleExact");
        }
        else if (analysis.KeyTerms.Count > 0)
        {
            var matchCount = analysis.KeyTerms.Count(t => normName.Contains(t));
            if (matchCount > 0)
            {
                var tokenRatio = (double)matchCount / analysis.KeyTerms.Count;
                score += 0.40 * tokenRatio;
                matchedFields.Add("Title");
            }
        }

        if (!string.IsNullOrWhiteSpace(normBrand))
        {
            if (!string.IsNullOrWhiteSpace(analysis.DetectedBrand) && string.Equals(analysis.DetectedBrand, product.Brand, StringComparison.OrdinalIgnoreCase))
            {
                score += 0.25;
                matchedFields.Add("Brand");
            }
            else if (analysis.KeyTerms.Any(t => normBrand.Contains(t)))
            {
                score += 0.15;
                matchedFields.Add("Brand");
            }
        }

        if (!string.IsNullOrWhiteSpace(normCat))
        {
            if (!string.IsNullOrWhiteSpace(analysis.DetectedCategory) && normCat.Contains(analysis.DetectedCategory, StringComparison.OrdinalIgnoreCase))
            {
                score += 0.15;
                matchedFields.Add("Category");
            }
            else if (analysis.KeyTerms.Any(t => normCat.Contains(t)))
            {
                score += 0.10;
                matchedFields.Add("Category");
            }
        }

        if (!string.IsNullOrWhiteSpace(normModel) && analysis.KeyTerms.Any(t => normModel.Contains(t)))
        {
            score += 0.10;
            matchedFields.Add("Model");
        }

        if (!string.IsNullOrWhiteSpace(normDesc) && analysis.KeyTerms.Any(t => normDesc.Contains(t)))
        {
            score += 0.05;
            matchedFields.Add("Description");
        }

        if (product.Attributes != null && product.Attributes.Count > 0)
        {
            var attrMatch = product.Attributes.Any(a =>
                (!string.IsNullOrWhiteSpace(a.Value) && analysis.KeyTerms.Any(t => a.Value.Contains(t, StringComparison.OrdinalIgnoreCase))));
            if (attrMatch)
            {
                score += 0.05;
                matchedFields.Add("Attributes");
            }
        }

        return Math.Clamp(score, 0.0, 1.0);
    }

    private static string BuildExplanation(SearchMode mode, double keywordScore, double semanticScore, List<string> matchedFields, string? brand)
    {
        var matchSummary = matchedFields.Count > 0 ? string.Join(", ", matchedFields) : "Low lexical overlap";

        return mode switch
        {
            SearchMode.Keyword => $"Lexical match on [{matchSummary}] with score {keywordScore:P0}.",
            SearchMode.Semantic => $"Semantic embedding similarity of {semanticScore:P0} across vector space.",
            _ => $"Hybrid fusion of lexical [{matchSummary}] ({keywordScore:P0}) and semantic conceptual match ({semanticScore:P0})."
        };
    }

    private static string Normalize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var cleaned = Regex.Replace(value.ToLowerInvariant(), @"[^\w\s]", " ");
        return string.Join(" ", cleaned.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
    }
}
