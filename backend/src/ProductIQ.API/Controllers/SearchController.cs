namespace ProductIQ.API.Controllers;

using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Enums;

[ApiController]
[Route("api/search")]
[Produces("application/json")]
[Authorize]
public class SearchController(ISearchService searchService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(SearchResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<SearchResponseDto>> Search(
        [FromQuery] string? q,
        [FromQuery] SearchMode mode = SearchMode.Hybrid,
        [FromQuery] string? brand = null,
        [FromQuery] string? category = null,
        [FromQuery] double? minScore = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        if (page < 1)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid Page",
                Detail = "Page must be greater than or equal to 1.",
                Instance = HttpContext.Request.Path
            });
        }

        if (pageSize < 1 || pageSize > 100)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid PageSize",
                Detail = "PageSize must be between 1 and 100.",
                Instance = HttpContext.Request.Path
            });
        }

        var request = new SearchRequestDto
        {
            Query = q ?? string.Empty,
            Mode = mode,
            Brand = brand,
            Category = category,
            MinScore = minScore,
            Page = page,
            PageSize = pageSize
        };

        var result = await searchService.SearchAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(SearchResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<SearchResponseDto>> SearchPost(
        [FromBody] SearchRequestDto request,
        CancellationToken cancellationToken = default)
    {
        if (request.Page < 1)
        {
            request.Page = 1;
        }

        if (request.PageSize < 1 || request.PageSize > 100)
        {
            request.PageSize = 20;
        }

        var result = await searchService.SearchAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("analyze")]
    [ProducesResponseType(typeof(QueryAnalysisDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public ActionResult<QueryAnalysisDto> AnalyzeQuery([FromQuery] string? q)
    {
        var analysis = searchService.AnalyzeQuery(q ?? string.Empty);
        return Ok(analysis);
    }
}
