namespace ProductIQ.Application.Services;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Common.ValueObjects;
using ProductIQ.Domain.Entities;
using ProductIQ.Domain.Enums;

public class RiskDetectionService : IRiskDetectionService
{
    public RiskAssessmentDto AssessCandidateRisk(Product productA, Product productB, DuplicateCandidate candidate, decimal? visualSimilarity = null)
    {
        var signals = new List<RiskSignalDto>();
        var effectiveVisualSim = visualSimilarity ?? candidate.VisualSimilarity;

        var hasModelA = !string.IsNullOrWhiteSpace(productA.ModelNumber) || !string.IsNullOrWhiteSpace(productA.ModelName);
        var hasModelB = !string.IsNullOrWhiteSpace(productB.ModelNumber) || !string.IsNullOrWhiteSpace(productB.ModelName);

        if (hasModelA && hasModelB)
        {
            var valA = Normalize(productA.ModelNumber ?? productA.ModelName);
            var valB = Normalize(productB.ModelNumber ?? productB.ModelName);

            if (!string.IsNullOrWhiteSpace(valA) && !string.IsNullOrWhiteSpace(valB) && valA != valB && !valA.Contains(valB) && !valB.Contains(valA))
            {
                signals.Add(new RiskSignalDto
                {
                    Code = "RSK_MODEL_CONFLICT",
                    Name = "Model Identifier Conflict",
                    Category = nameof(RiskSignalCategory.ConflictingData),
                    Severity = nameof(RiskLevel.High),
                    ScoreContribution = 25,
                    Description = "Both catalog listings define explicit model numbers or names that are conflicting.",
                    Evidence = $"Product A ('{productA.ModelNumber ?? productA.ModelName}') vs Product B ('{productB.ModelNumber ?? productB.ModelName}')"
                });
            }
        }
        else
        {
            signals.Add(new RiskSignalDto
            {
                Code = "RSK_MISSING_MODEL_METADATA",
                Name = "Incomplete Model Metadata",
                Category = nameof(RiskSignalCategory.DataQuality),
                Severity = nameof(RiskLevel.Low),
                ScoreContribution = 10,
                Description = "One or both listings lack explicit manufacturer model identifiers in the catalog.",
                Evidence = $"Model identifier missing on {(!hasModelA && !hasModelB ? "both listings" : !hasModelA ? "Product A" : "Product B")}"
            });
        }

        var catA = productA.Category ?? productA.NodePath;
        var catB = productB.Category ?? productB.NodePath;
        if (!string.IsNullOrWhiteSpace(catA) && !string.IsNullOrWhiteSpace(catB))
        {
            var normCatA = Normalize(catA);
            var normCatB = Normalize(catB);
            if (normCatA != normCatB && !normCatA.Contains(normCatB) && !normCatB.Contains(normCatA))
            {
                signals.Add(new RiskSignalDto
                {
                    Code = "RSK_CATEGORY_MISMATCH",
                    Name = "Taxonomy Hierarchy Mismatch",
                    Category = nameof(RiskSignalCategory.ConflictingData),
                    Severity = nameof(RiskLevel.High),
                    ScoreContribution = 20,
                    Description = "Products belong to distinct catalog taxonomy category branches.",
                    Evidence = $"Product A ('{catA}') vs Product B ('{catB}')"
                });
            }
        }

        if (effectiveVisualSim.HasValue && candidate.TextSimilarity.HasValue)
        {
            var vSim = effectiveVisualSim.Value;
            var tSim = candidate.TextSimilarity.Value;

            if (vSim >= 0.85m && tSim < 0.50m)
            {
                signals.Add(new RiskSignalDto
                {
                    Code = "RSK_VISUAL_TEXT_MISMATCH",
                    Name = "Visual & Textual Inconsistency",
                    Category = nameof(RiskSignalCategory.Inconsistency),
                    Severity = nameof(RiskLevel.High),
                    ScoreContribution = 20,
                    Description = "Strong visual appearance match contrasts with low title and description token similarity.",
                    Evidence = $"CLIP Visual Match: {vSim:P0} vs Text Token Similarity: {tSim:P0}"
                });
            }
            else if (tSim >= 0.80m && vSim < 0.40m)
            {
                signals.Add(new RiskSignalDto
                {
                    Code = "RSK_TEXT_VISUAL_MISMATCH",
                    Name = "Textual & Visual Inconsistency",
                    Category = nameof(RiskSignalCategory.Inconsistency),
                    Severity = nameof(RiskLevel.Medium),
                    ScoreContribution = 15,
                    Description = "High textual similarity contrasts with low visual image match.",
                    Evidence = $"Text Token Similarity: {tSim:P0} vs CLIP Visual Match: {vSim:P0}"
                });
            }
        }

        if (productA.Price.HasValue && productB.Price.HasValue)
        {
            var pA = productA.Price.Value;
            var pB = productB.Price.Value;
            var maxP = Math.Max(pA, pB);
            if (maxP > 0)
            {
                var diff = Math.Abs(pA - pB);
                var variance = diff / maxP;
                if (variance >= 0.30m)
                {
                    signals.Add(new RiskSignalDto
                    {
                        Code = "RSK_PRICE_DIVERGENCE",
                        Name = "Significant Price Divergence",
                        Category = nameof(RiskSignalCategory.ConflictingData),
                        Severity = nameof(RiskLevel.Medium),
                        ScoreContribution = 15,
                        Description = "Substantial price discrepancy between candidate listings indicating potential variant or package difference.",
                        Evidence = $"${pA:F2} vs ${pB:F2} ({variance:P0} price divergence)"
                    });
                }
            }
        }

        if (productA.Dimensions != null && productB.Dimensions != null)
        {
            var dimMismatch = false;
            var dimDiffs = new List<string>();

            if (productA.Dimensions.Length.HasValue && productB.Dimensions.Length.HasValue)
            {
                var diffL = Math.Abs(productA.Dimensions.Length.Value - productB.Dimensions.Length.Value);
                var maxL = Math.Max(productA.Dimensions.Length.Value, productB.Dimensions.Length.Value);
                if (maxL > 0 && diffL / maxL > 0.10)
                {
                    dimMismatch = true;
                    dimDiffs.Add($"Length: {productA.Dimensions.Length.Value:F1} vs {productB.Dimensions.Length.Value:F1}");
                }
            }

            if (productA.Dimensions.Width.HasValue && productB.Dimensions.Width.HasValue)
            {
                var diffW = Math.Abs(productA.Dimensions.Width.Value - productB.Dimensions.Width.Value);
                var maxW = Math.Max(productA.Dimensions.Width.Value, productB.Dimensions.Width.Value);
                if (maxW > 0 && diffW / maxW > 0.10)
                {
                    dimMismatch = true;
                    dimDiffs.Add($"Width: {productA.Dimensions.Width.Value:F1} vs {productB.Dimensions.Width.Value:F1}");
                }
            }

            if (dimMismatch)
            {
                signals.Add(new RiskSignalDto
                {
                    Code = "RSK_DIMENSION_MISMATCH",
                    Name = "Physical Dimension Discrepancy",
                    Category = nameof(RiskSignalCategory.ConflictingData),
                    Severity = nameof(RiskLevel.Medium),
                    ScoreContribution = 15,
                    Description = "Physical dimensions diverge significantly beyond standard measurement tolerance.",
                    Evidence = string.Join(", ", dimDiffs)
                });
            }
        }

        var hasConflictSignal = signals.Any(s => s.Category == nameof(RiskSignalCategory.ConflictingData));
        if (candidate.OverallScore >= 0.58m && hasConflictSignal)
        {
            signals.Add(new RiskSignalDto
            {
                Code = "RSK_HIGH_SIMILARITY_CONFLICT_HAZARD",
                Name = "High Duplicate Similarity with Specification Conflict",
                Category = nameof(RiskSignalCategory.OperationalHazard),
                Severity = nameof(RiskLevel.Critical),
                ScoreContribution = 20,
                Description = "High duplicate likelihood combined with unresolved technical conflicts poses catalog merge corruption hazard.",
                Evidence = $"Composite duplicate score is {candidate.OverallScore:P1} despite conflicting metadata"
            });
        }
        else if (candidate.OverallScore >= 0.38m && candidate.OverallScore < 0.55m)
        {
            signals.Add(new RiskSignalDto
            {
                Code = "RSK_BORDERLINE_AMBIGUITY",
                Name = "Borderline Confidence Ambiguity",
                Category = nameof(RiskSignalCategory.OperationalHazard),
                Severity = nameof(RiskLevel.Low),
                ScoreContribution = 10,
                Description = "Candidate resides in the borderline confidence zone where subtle variations require operator verification.",
                Evidence = $"Composite duplicate score is {candidate.OverallScore:P1}"
            });
        }

        var rawScore = signals.Sum(s => s.ScoreContribution);
        var finalScore = Math.Clamp(rawScore, 0, 100);

        var riskLevel = finalScore switch
        {
            >= 75 => nameof(RiskLevel.Critical),
            >= 50 => nameof(RiskLevel.High),
            >= 25 => nameof(RiskLevel.Medium),
            _ => nameof(RiskLevel.Low)
        };

        var conflictingCount = signals.Count(s => s.Category == nameof(RiskSignalCategory.ConflictingData) || s.Category == nameof(RiskSignalCategory.Inconsistency));
        var dataQualityCount = signals.Count(s => s.Category == nameof(RiskSignalCategory.DataQuality));

        var sb = new StringBuilder();
        sb.Append($"Catalog risk evaluated at {finalScore}/100 ({riskLevel} Risk). ");
        if (riskLevel == nameof(RiskLevel.Critical) || riskLevel == nameof(RiskLevel.High))
        {
            sb.Append($"Identified {signals.Count} risk factors including {conflictingCount} data/consistency conflicts. Manual operator inspection is strongly recommended before performing catalog deduplication.");
        }
        else if (riskLevel == nameof(RiskLevel.Medium))
        {
            sb.Append($"Identified {signals.Count} moderate risk factors. Review model identifiers and dimensions during routine processing.");
        }
        else
        {
            sb.Append("No severe data discrepancies or operational hazards detected.");
        }

        return new RiskAssessmentDto
        {
            RiskScore = finalScore,
            RiskLevel = riskLevel,
            Summary = sb.ToString(),
            RiskSignals = signals,
            ConflictingSignalsCount = conflictingCount,
            DataQualityIssuesCount = dataQualityCount,
            RequiresImmediateReview = finalScore >= 50
        };
    }

    public RiskAssessmentDto AssessCandidateRisk(DuplicateCandidateDetailDto detailDto)
    {
        var dummyProdA = new Product
        {
            Id = detailDto.ProductAId,
            AmazonItemId = detailDto.ProductA?.AmazonItemId ?? string.Empty,
            Name = detailDto.ProductA?.Name ?? string.Empty,
            Brand = detailDto.ProductA?.Brand,
            Category = detailDto.ProductA?.Category,
            NodePath = detailDto.ProductA?.NodePath,
            ProductType = detailDto.ProductA?.ProductType,
            ModelName = detailDto.ProductA?.ModelName,
            ModelNumber = detailDto.ProductA?.ModelNumber,
            Price = detailDto.ProductA?.Price,
            Dimensions = detailDto.ProductA?.Dimensions != null ? new ItemDimensions
            {
                Length = detailDto.ProductA.Dimensions.Length,
                Width = detailDto.ProductA.Dimensions.Width,
                Height = detailDto.ProductA.Dimensions.Height,
                Weight = detailDto.ProductA.Dimensions.Weight
            } : null
        };

        var dummyProdB = new Product
        {
            Id = detailDto.ProductBId,
            AmazonItemId = detailDto.ProductB?.AmazonItemId ?? string.Empty,
            Name = detailDto.ProductB?.Name ?? string.Empty,
            Brand = detailDto.ProductB?.Brand,
            Category = detailDto.ProductB?.Category,
            NodePath = detailDto.ProductB?.NodePath,
            ProductType = detailDto.ProductB?.ProductType,
            ModelName = detailDto.ProductB?.ModelName,
            ModelNumber = detailDto.ProductB?.ModelNumber,
            Price = detailDto.ProductB?.Price,
            Dimensions = detailDto.ProductB?.Dimensions != null ? new ItemDimensions
            {
                Length = detailDto.ProductB.Dimensions.Length,
                Width = detailDto.ProductB.Dimensions.Width,
                Height = detailDto.ProductB.Dimensions.Height,
                Weight = detailDto.ProductB.Dimensions.Weight
            } : null
        };

        var dummyCandidate = new DuplicateCandidate
        {
            Id = detailDto.Id,
            ProductAId = detailDto.ProductAId,
            ProductBId = detailDto.ProductBId,
            OverallScore = detailDto.OverallScore,
            TextSimilarity = detailDto.TextSimilarity,
            SemanticSimilarity = detailDto.SemanticSimilarity,
            AttributeSimilarity = detailDto.AttributeSimilarity,
            VisualSimilarity = detailDto.VisualSimilarity ?? detailDto.ImageSimilarity?.SimilarityScore,
            BrandMatch = detailDto.BrandMatch,
            ModelMatch = detailDto.ModelMatch
        };

        return AssessCandidateRisk(dummyProdA, dummyProdB, dummyCandidate, dummyCandidate.VisualSimilarity);
    }

    public (int RiskScore, string RiskLevel) CalculateQuickRisk(DuplicateCandidate candidate, Product? productA = null, Product? productB = null)
    {
        var rawScore = 0;

        var prodA = productA ?? candidate.ProductA;
        var prodB = productB ?? candidate.ProductB;

        if (prodA != null && prodB != null)
        {
            var hasModelA = !string.IsNullOrWhiteSpace(prodA.ModelNumber) || !string.IsNullOrWhiteSpace(prodA.ModelName);
            var hasModelB = !string.IsNullOrWhiteSpace(prodB.ModelNumber) || !string.IsNullOrWhiteSpace(prodB.ModelName);

            if (hasModelA && hasModelB)
            {
                var valA = Normalize(prodA.ModelNumber ?? prodA.ModelName);
                var valB = Normalize(prodB.ModelNumber ?? prodB.ModelName);
                if (!string.IsNullOrWhiteSpace(valA) && !string.IsNullOrWhiteSpace(valB) && valA != valB && !valA.Contains(valB) && !valB.Contains(valA))
                {
                    rawScore += 25;
                }
            }
            else
            {
                rawScore += 10;
            }

            var catA = prodA.Category ?? prodA.NodePath;
            var catB = prodB.Category ?? prodB.NodePath;
            if (!string.IsNullOrWhiteSpace(catA) && !string.IsNullOrWhiteSpace(catB))
            {
                var normCatA = Normalize(catA);
                var normCatB = Normalize(catB);
                if (normCatA != normCatB && !normCatA.Contains(normCatB) && !normCatB.Contains(normCatA))
                {
                    rawScore += 20;
                }
            }

            if (prodA.Price.HasValue && prodB.Price.HasValue)
            {
                var maxP = Math.Max(prodA.Price.Value, prodB.Price.Value);
                if (maxP > 0 && Math.Abs(prodA.Price.Value - prodB.Price.Value) / maxP >= 0.30m)
                {
                    rawScore += 15;
                }
            }
        }
        else
        {
            if (!candidate.ModelMatch)
            {
                rawScore += 25;
            }
        }

        if (candidate.VisualSimilarity.HasValue && candidate.TextSimilarity.HasValue)
        {
            if (candidate.VisualSimilarity.Value >= 0.85m && candidate.TextSimilarity.Value < 0.50m)
            {
                rawScore += 20;
            }
        }

        if (candidate.OverallScore >= 0.58m && rawScore >= 20)
        {
            rawScore += 20;
        }
        else if (candidate.OverallScore >= 0.38m && candidate.OverallScore < 0.55m)
        {
            rawScore += 10;
        }

        var finalScore = Math.Clamp(rawScore, 0, 100);
        var level = finalScore switch
        {
            >= 75 => nameof(RiskLevel.Critical),
            >= 50 => nameof(RiskLevel.High),
            >= 25 => nameof(RiskLevel.Medium),
            _ => nameof(RiskLevel.Low)
        };

        return (finalScore, level);
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
