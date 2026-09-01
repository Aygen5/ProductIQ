namespace ProductIQ.API.Controllers;

using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;

[ApiController]
[Route("api/analytics")]
[Produces("application/json")]
[Authorize]
public class AnalyticsController(IAnalyticsService analyticsService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(AnalyticsSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AnalyticsSummaryDto>> GetAnalyticsSummary(CancellationToken cancellationToken = default)
    {
        var summary = await analyticsService.GetAnalyticsSummaryAsync(cancellationToken);
        return Ok(summary);
    }

    [HttpGet("catalog")]
    [ProducesResponseType(typeof(CatalogAnalyticsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<CatalogAnalyticsDto>> GetCatalogAnalytics(CancellationToken cancellationToken = default)
    {
        var catalog = await analyticsService.GetCatalogAnalyticsAsync(cancellationToken);
        return Ok(catalog);
    }

    [HttpGet("duplicates")]
    [ProducesResponseType(typeof(DuplicateAnalyticsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<DuplicateAnalyticsDto>> GetDuplicateAnalytics(CancellationToken cancellationToken = default)
    {
        var duplicates = await analyticsService.GetDuplicateAnalyticsAsync(cancellationToken);
        return Ok(duplicates);
    }

    [HttpGet("risk")]
    [ProducesResponseType(typeof(RiskAnalyticsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<RiskAnalyticsDto>> GetRiskAnalytics(CancellationToken cancellationToken = default)
    {
        var risk = await analyticsService.GetRiskAnalyticsAsync(cancellationToken);
        return Ok(risk);
    }

    [HttpGet("search")]
    [ProducesResponseType(typeof(SearchAnalyticsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SearchAnalyticsDto>> GetSearchAnalytics(CancellationToken cancellationToken = default)
    {
        var search = await analyticsService.GetSearchAnalyticsAsync(cancellationToken);
        return Ok(search);
    }
}
