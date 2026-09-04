namespace ProductIQ.API.Controllers;

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProductIQ.Application.Common.Constants;
using ProductIQ.Application.Common.Models;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Enums;

using Microsoft.Extensions.Logging;

[ApiController]
[Route("api/duplicate-candidates")]
[Produces("application/json")]
[Authorize]
public class DuplicateCandidatesController(
    IDuplicateCandidateService duplicateCandidateService,
    IDuplicateScoringService duplicateScoringService,
    ILogger<DuplicateCandidatesController> logger) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<DuplicateCandidateSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
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
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DuplicateCandidatesSummaryDto>> GetSummary(CancellationToken cancellationToken)
    {
        var summary = await duplicateCandidateService.GetSummaryAsync(cancellationToken);
        return Ok(summary);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(DuplicateCandidateDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
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

    [HttpGet("{id:guid}/risk")]
    [ProducesResponseType(typeof(RiskAssessmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<RiskAssessmentDto>> GetRiskAssessment(
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

        return Ok(candidate.RiskAssessment);
    }

    [HttpPost("detect")]
    [Authorize(Policy = AuthorizationConstants.Policies.AdminOnly)]
    [ProducesResponseType(typeof(CandidateDetectionResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<CandidateDetectionResultDto>> RunDetection(CancellationToken cancellationToken)
    {
        var result = await duplicateCandidateService.RunCandidateDetectionAsync(cancellationToken);

        try
        {
            var scoringResult = await duplicateScoringService.ScoreAllCandidatesAsync(cancellationToken);
            logger.LogInformation("Automatic scoring completed after detection: {Count} candidates evaluated, avg score: {Avg:F4}",
                scoringResult.TotalCandidatesScored, scoringResult.AverageOverallScore);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Candidate detection completed, but batch similarity scoring encountered an issue.");
        }

        return Ok(result);
    }

    [HttpPost("score")]
    [Authorize(Policy = AuthorizationConstants.Policies.AdminOnly)]
    [ProducesResponseType(typeof(BatchScoringResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BatchScoringResultDto>> ScoreCandidates(CancellationToken cancellationToken)
    {
        var result = await duplicateScoringService.ScoreAllCandidatesAsync(cancellationToken);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/confirm")]
    [HttpPost("{id:guid}/confirm")]
    [ProducesResponseType(typeof(DuplicateCandidateDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DuplicateCandidateDetailDto>> ConfirmCandidate(
        Guid id,
        [FromBody] UpdateCandidateStatusRequest? request,
        CancellationToken cancellationToken)
    {
        try
        {
            var updated = await duplicateCandidateService.ConfirmCandidateAsync(id, request?.ResolutionNotes, cancellationToken);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Duplicate Candidate Not Found",
                Detail = $"Duplicate candidate with identifier '{id}' was not found.",
                Instance = HttpContext.Request.Path
            });
        }
    }

    [HttpPatch("{id:guid}/reject")]
    [HttpPost("{id:guid}/reject")]
    [ProducesResponseType(typeof(DuplicateCandidateDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DuplicateCandidateDetailDto>> RejectCandidate(
        Guid id,
        [FromBody] UpdateCandidateStatusRequest? request,
        CancellationToken cancellationToken)
    {
        try
        {
            var updated = await duplicateCandidateService.RejectCandidateAsync(id, request?.ResolutionNotes, cancellationToken);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Duplicate Candidate Not Found",
                Detail = $"Duplicate candidate with identifier '{id}' was not found.",
                Instance = HttpContext.Request.Path
            });
        }
    }

    [HttpPatch("{id:guid}/reopen")]
    [HttpPost("{id:guid}/reopen")]
    [ProducesResponseType(typeof(DuplicateCandidateDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DuplicateCandidateDetailDto>> ReopenCandidate(
        Guid id,
        [FromBody] UpdateCandidateStatusRequest? request,
        CancellationToken cancellationToken)
    {
        try
        {
            var updated = await duplicateCandidateService.UpdateCandidateStatusAsync(id, DuplicateStatus.Potential, request?.ResolutionNotes, cancellationToken);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Duplicate Candidate Not Found",
                Detail = $"Duplicate candidate with identifier '{id}' was not found.",
                Instance = HttpContext.Request.Path
            });
        }
    }

    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(typeof(DuplicateCandidateDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<DuplicateCandidateDetailDto>> UpdateStatus(
        Guid id,
        [FromBody] UpdateCandidateStatusRequest request,
        CancellationToken cancellationToken)
    {
        if (!Enum.IsDefined(typeof(DuplicateStatus), request.Status))
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid Status",
                Detail = $"The status '{request.Status}' is invalid.",
                Instance = HttpContext.Request.Path
            });
        }

        try
        {
            var updated = await duplicateCandidateService.UpdateCandidateStatusAsync(id, request.Status, request.ResolutionNotes, cancellationToken);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Duplicate Candidate Not Found",
                Detail = $"Duplicate candidate with identifier '{id}' was not found.",
                Instance = HttpContext.Request.Path
            });
        }
    }
}
