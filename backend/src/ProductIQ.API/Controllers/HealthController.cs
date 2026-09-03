using Microsoft.AspNetCore.Mvc;
using ProductIQ.Infrastructure.Persistence;

namespace ProductIQ.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class HealthController(ProductIQDbContext dbContext) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Check()
    {
        bool canConnect = false;
        string dbStatus = "Unknown";

        try
        {
            canConnect = await dbContext.Database.CanConnectAsync();
            dbStatus = canConnect ? "Connected" : "Unreachable";
        }
        catch (Exception ex)
        {
            dbStatus = $"Error: {ex.Message}";
        }

        return Ok(new
        {
            status = "Healthy",
            service = "ProductIQ.API",
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
            version = "1.0.0",
            database = new
            {
                provider = "PostgreSQL",
                canConnect,
                status = dbStatus
            },
            timestamp = DateTime.UtcNow
        });
    }
}
