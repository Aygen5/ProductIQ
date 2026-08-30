namespace ProductIQ.Application.Interfaces;

using System.Threading;
using System.Threading.Tasks;
using ProductIQ.Application.DTOs;

public interface IAnalyticsService
{
    Task<AnalyticsSummaryDto> GetAnalyticsSummaryAsync(CancellationToken cancellationToken = default);
    Task<CatalogAnalyticsDto> GetCatalogAnalyticsAsync(CancellationToken cancellationToken = default);
    Task<DuplicateAnalyticsDto> GetDuplicateAnalyticsAsync(CancellationToken cancellationToken = default);
    Task<RiskAnalyticsDto> GetRiskAnalyticsAsync(CancellationToken cancellationToken = default);
    Task<SearchAnalyticsDto> GetSearchAnalyticsAsync(CancellationToken cancellationToken = default);
}
