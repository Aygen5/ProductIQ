using Microsoft.AspNetCore.Mvc;

namespace ProductIQ.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Check()
    {
        return Ok(new
        {
            status = "Healthy",
            service = "ProductIQ.API",
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
            version = "1.0.0",
            timestamp = DateTime.UtcNow
        });
    }
}
