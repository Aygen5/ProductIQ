using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
            var connection = dbContext.Database.GetDbConnection();
            await connection.OpenAsync();
            await connection.CloseAsync();
            canConnect = true;
            dbStatus = "Connected";
        }
        catch (Exception ex)
        {
            canConnect = false;
            dbStatus = $"Error: {ex.Message}";
        }

        return Ok(new
        {
            status = canConnect ? "Healthy" : "Degraded",
            service = "ProductIQ.API",
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
            version = "1.0.2",
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
