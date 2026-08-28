namespace ProductIQ.Application.Interfaces;

using ProductIQ.Application.DTOs;
using ProductIQ.Domain.Entities;

public interface IDuplicateScoringService
{
    Task<BatchScoringResultDto> ScoreAllCandidatesAsync(CancellationToken cancellationToken = default);
    Task<CandidateScoringResultDto> ScoreCandidateAsync(Guid candidateId, CancellationToken cancellationToken = default);
    DuplicateScoreBreakdownDto CalculateScore(
        Product productA,
        Product productB,
        float[]? vectorA,
        float[]? vectorB);
}
