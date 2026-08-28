namespace ProductIQ.Application.Interfaces;

using ProductIQ.Application.DTOs;
using ProductIQ.Domain.Enums;

public interface IDuplicateCandidateService
{
    Task<CandidateDetectionResultDto> RunCandidateDetectionAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DuplicateCandidateSummaryDto>> GetCandidatesAsync(int page = 1, int pageSize = 20, DuplicateStatus? status = null, CancellationToken cancellationToken = default);
    Task<int> GetCandidatesCountAsync(DuplicateStatus? status = null, CancellationToken cancellationToken = default);
}
