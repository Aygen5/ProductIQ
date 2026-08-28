namespace ProductIQ.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using ProductIQ.Application.Common.Models;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;

[ApiController]
[Route("api/duplicate-candidates")]
[Produces("application/json")]
public class DuplicateCandidatesController(IDuplicateCandidateService duplicateCandidateService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<DuplicateCandidateSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResponse<DuplicateCandidateSummaryDto>>> GetDuplicateCandidates(
        [FromQuery] DuplicateCandidateQueryParameters parameters,
        CancellationToken cancellationToken)
    {
        if (parameters.Page < 1)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid Page",
                Detail = "Page must be greater than or equal to 1.",
                Instance = HttpContext.Request.Path
            });
        }

        if (parameters.PageSize < 1 || parameters.PageSize > 100)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid PageSize",
                Detail = "PageSize must be between 1 and 100.",
                Instance = HttpContext.Request.Path
            });
        }

        var result = await duplicateCandidateService.GetPagedCandidatesAsync(parameters, cancellationToken);
        return Ok(result);
    }

    [HttpGet("summary")]
    [ProducesResponseType(typeof(DuplicateCandidatesSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DuplicateCandidatesSummaryDto>> GetSummary(CancellationToken cancellationToken)
    {
        var summary = await duplicateCandidateService.GetSummaryAsync(cancellationToken);
        return Ok(summary);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(DuplicateCandidateDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DuplicateCandidateDetailDto>> GetCandidateById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var candidate = await duplicateCandidateService.GetCandidateDetailByIdAsync(id, cancellationToken);

        if (candidate == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Duplicate Candidate Not Found",
                Detail = $"Duplicate candidate with identifier '{id}' was not found.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(candidate);
    }
}
