namespace ProductIQ.Application.Interfaces;

using System.Threading;
using System.Threading.Tasks;
using ProductIQ.Application.DTOs;

public interface ISearchService
{
    Task<SearchResponseDto> SearchAsync(SearchRequestDto request, CancellationToken cancellationToken = default);
    QueryAnalysisDto AnalyzeQuery(string query);
}
