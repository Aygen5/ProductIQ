namespace ProductIQ.Application.Services;

using System.Text;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Entities;

public class DuplicateExplanationService : IDuplicateExplanationService
{
    public CandidateExplanationDto GenerateExplanation(
        Product productA,
        Product productB,
        decimal overallScore,
        decimal? textSimilarity,
        decimal? semanticSimilarity,
        decimal? attributeSimilarity,
        bool brandMatch,
        bool modelMatch,
        bool categoryMatch,
        Dictionary<string, object>? signals = null)
    {
        var keyMatches = new List<string>();
        var keyDifferences = new List<string>();

        var confidenceLevel = overallScore switch
        {
            >= 0.55m => "High Confidence",
            >= 0.40m => "Moderate Confidence",
            _ => "Low Confidence"
        };

        if (brandMatch || (!string.IsNullOrWhiteSpace(productA.Brand) && string.Equals(productA.Brand, productB.Brand, StringComparison.OrdinalIgnoreCase)))
        {
            keyMatches.Add($"Brand match confirmed: Both listings are marketed under '{productA.Brand}'.");
        }
        else if (!string.IsNullOrWhiteSpace(productA.Brand) && !string.IsNullOrWhiteSpace(productB.Brand))
        {
            keyDifferences.Add($"Brand names differ: '{productA.Brand}' vs '{productB.Brand}'.");
        }

        var catA = productA.Category ?? productA.NodePath;
        var catB = productB.Category ?? productB.NodePath;

        if (categoryMatch || (!string.IsNullOrWhiteSpace(catA) && string.Equals(catA, catB, StringComparison.OrdinalIgnoreCase)))
        {
            keyMatches.Add($"Category taxonomy aligns: Both products belong to '{catA}'.");
        }
        else if (!string.IsNullOrWhiteSpace(catA) && !string.IsNullOrWhiteSpace(catB))
        {
            keyDifferences.Add($"Category paths differ: '{catA}' vs '{catB}'.");
        }

        if (modelMatch)
        {
            var modelVal = productA.ModelNumber ?? productA.ModelName ?? productB.ModelNumber ?? productB.ModelName;
            keyMatches.Add($"Model designation overlap detected ('{modelVal}').");
        }
        else if (!string.IsNullOrWhiteSpace(productA.ModelNumber) && !string.IsNullOrWhiteSpace(productB.ModelNumber))
        {
            keyDifferences.Add($"Distinct model numbers specified ('{productA.ModelNumber}' vs '{productB.ModelNumber}').");
        }

        if (textSimilarity.HasValue && textSimilarity.Value >= 0.60m)
        {
            keyMatches.Add($"High text and title resemblance ({textSimilarity.Value:P0} token overlap).");
        }
        else if (textSimilarity.HasValue && textSimilarity.Value < 0.35m)
        {
            keyDifferences.Add($"Low title word overlap ({textSimilarity.Value:P0}).");
        }

        if (semanticSimilarity.HasValue && semanticSimilarity.Value >= 0.50m)
        {
            keyMatches.Add($"Strong conceptual embedding similarity ({semanticSimilarity.Value:P0} cosine similarity in vector space).");
        }

        if (attributeSimilarity.HasValue && attributeSimilarity.Value >= 0.30m)
        {
            keyMatches.Add($"Shared product attributes and dimension profiles ({attributeSimilarity.Value:P0} attribute match).");
        }

        if (productA.Price.HasValue && productB.Price.HasValue)
        {
            var priceDiff = Math.Abs(productA.Price.Value - productB.Price.Value);
            var maxPrice = Math.Max(productA.Price.Value, productB.Price.Value);
            if (maxPrice > 0 && (priceDiff / maxPrice) > 0.30m)
            {
                keyDifferences.Add($"Noticeable price variance: ${productA.Price.Value:F2} vs ${productB.Price.Value:F2}.");
            }
        }

        var sb = new StringBuilder();
        if (overallScore >= 0.55m)
        {
            sb.Append($"These products have a high duplicate likelihood (composite score: {overallScore:P1}). ");
            if (brandMatch && categoryMatch)
            {
                sb.Append($"They share the same brand ('{productA.Brand}') and catalog taxonomy category, with high title and vector embedding similarity. ");
            }
            else
            {
                sb.Append("Multiple similarity signals strongly indicate these listings represent the same physical catalog entity. ");
            }
        }
        else if (overallScore >= 0.40m)
        {
            sb.Append($"These products exhibit moderate duplicate characteristics (composite score: {overallScore:P1}). ");
            if (brandMatch)
            {
                sb.Append($"While both items share the '{productA.Brand}' brand, differences in model designation, attributes, or wording require operator review. ");
            }
            else
            {
                sb.Append("They share significant text and category patterns, but may represent related product variants rather than exact duplicates. ");
            }
        }
        else
        {
            sb.Append($"These products show low overall duplicate confidence (composite score: {overallScore:P1}). ");
            sb.Append("Significant divergence in model attributes, catalog metadata, or wording indicates they are likely distinct catalog items. ");
        }

        var recommendation = overallScore switch
        {
            >= 0.55m => "Recommended for operator confirmation or catalog deduplication merge.",
            >= 0.40m => "Recommended for manual inspection of image and dimension differences before deciding.",
            _ => "Recommended to reject as non-duplicate or separate product variation."
        };

        return new CandidateExplanationDto
        {
            Summary = sb.ToString().Trim(),
            ConfidenceLevel = confidenceLevel,
            KeyMatches = keyMatches,
            KeyDifferences = keyDifferences,
            Recommendation = recommendation
        };
    }
}
