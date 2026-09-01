namespace ProductIQ.API.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProductIQ.Application.Common.Constants;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;

[ApiController]
[Route("api/settings")]
[Produces("application/json")]
[Authorize]
public class SettingsController(ISettingsService settingsService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(SystemSettingsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<SystemSettingsDto>> GetSettings(CancellationToken cancellationToken = default)
    {
        var settings = await settingsService.GetSettingsAsync(cancellationToken);
        return Ok(settings);
    }

    [HttpPut]
    [Authorize(Policy = AuthorizationConstants.Policies.AdminOnly)]
    [ProducesResponseType(typeof(SystemSettingsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<SystemSettingsDto>> UpdateSettings([FromBody] UpdateSystemSettingsDto request, CancellationToken cancellationToken = default)
    {
        try
        {
            var updated = await settingsService.UpdateSettingsAsync(request, cancellationToken);
            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Validation Failed",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
    }

    [HttpGet("similarity")]
    [ProducesResponseType(typeof(SimilaritySettingsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SimilaritySettingsDto>> GetSimilaritySettings(CancellationToken cancellationToken = default)
    {
        var similarity = await settingsService.GetSimilaritySettingsAsync(cancellationToken);
        return Ok(similarity);
    }

    [HttpGet("risk")]
    [ProducesResponseType(typeof(RiskSettingsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<RiskSettingsDto>> GetRiskSettings(CancellationToken cancellationToken = default)
    {
        var risk = await settingsService.GetRiskSettingsAsync(cancellationToken);
        return Ok(risk);
    }

    [HttpGet("ai")]
    [ProducesResponseType(typeof(AiSettingsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AiSettingsDto>> GetAiSettings(CancellationToken cancellationToken = default)
    {
        var ai = await settingsService.GetAiSettingsAsync(cancellationToken);
        return Ok(ai);
    }

    [HttpGet("notification")]
    [ProducesResponseType(typeof(NotificationSettingsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<NotificationSettingsDto>> GetNotificationSettings(CancellationToken cancellationToken = default)
    {
        var notification = await settingsService.GetNotificationSettingsAsync(cancellationToken);
        return Ok(notification);
    }

    [HttpPost("reset")]
    [Authorize(Policy = AuthorizationConstants.Policies.AdminOnly)]
    [ProducesResponseType(typeof(SystemSettingsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<SystemSettingsDto>> ResetSettings(CancellationToken cancellationToken = default)
    {
        var reset = await settingsService.ResetToDefaultsAsync(cancellationToken);
        return Ok(reset);
    }
}
