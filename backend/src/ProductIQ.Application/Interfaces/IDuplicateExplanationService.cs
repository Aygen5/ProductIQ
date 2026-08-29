namespace ProductIQ.Application.Interfaces;

using ProductIQ.Application.DTOs;
using ProductIQ.Domain.Entities;

public interface IDuplicateExplanationService
{
    CandidateExplanationDto GenerateExplanation(
        Product productA,
        Product productB,
        decimal overallScore,
        decimal? textSimilarity,
        decimal? semanticSimilarity,
        decimal? attributeSimilarity,
        decimal? visualSimilarity,
        bool brandMatch,
        bool modelMatch,
        bool categoryMatch,
        Dictionary<string, object>? signals = null);
}
