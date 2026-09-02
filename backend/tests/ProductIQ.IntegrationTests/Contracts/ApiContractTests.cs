namespace ProductIQ.IntegrationTests.Contracts;

using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using ProductIQ.Application.DTOs.Auth;
using ProductIQ.IntegrationTests.Infrastructure;
using Xunit;

public class ApiContractTests(ProductIQApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task UserProfileDto_NeverExposes_PasswordHash()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/auth/me");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var rawJson = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(rawJson);

        doc.RootElement.TryGetProperty("passwordHash", out _).Should().BeFalse();
        doc.RootElement.TryGetProperty("PasswordHash", out _).Should().BeFalse();
        rawJson.ToLowerInvariant().Should().NotContain("passwordhash");
    }

    [Fact]
    public async Task AuthResponseDto_NeverExposes_PasswordHash()
    {
        var client = CreateAnonymousClient();
        var loginRequest = new LoginRequestDto
        {
            Email = "admin@productiq.internal",
            Password = "Admin123!*"
        };

        var response = await client.PostAsJsonAsync("api/auth/login", loginRequest);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var rawJson = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(rawJson);

        doc.RootElement.GetProperty("user").TryGetProperty("passwordHash", out _).Should().BeFalse();
        rawJson.ToLowerInvariant().Should().NotContain("passwordhash");
    }

    [Fact]
    public async Task ProblemDetails_ConformsToRFC7807_On400BadRequest()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/products?page=0");
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var rawJson = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(rawJson);

        doc.RootElement.TryGetProperty("status", out var statusProp).Should().BeTrue();
        statusProp.GetInt32().Should().Be(400);
        doc.RootElement.TryGetProperty("title", out _).Should().BeTrue();
    }

    [Fact]
    public async Task ProblemDetails_ConformsToRFC7807_On401Unauthorized_FromLogin()
    {
        var client = CreateAnonymousClient();
        var loginRequest = new LoginRequestDto
        {
            Email = "admin@productiq.internal",
            Password = "WrongPassword!"
        };

        var response = await client.PostAsJsonAsync("api/auth/login", loginRequest);
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var rawJson = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(rawJson);

        doc.RootElement.TryGetProperty("status", out var statusProp).Should().BeTrue();
        statusProp.GetInt32().Should().Be(401);
        doc.RootElement.TryGetProperty("title", out _).Should().BeTrue();
    }

    [Fact]
    public async Task JwtChallenge_Returns401_WithBearerHeader()
    {
        var client = CreateAnonymousClient();

        var response = await client.GetAsync("api/products");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        response.Headers.WwwAuthenticate.Should().NotBeEmpty();
    }

    [Fact]
    public async Task ProblemDetails_ConformsToRFC7807_On403Forbidden()
    {
        var client = await CreateUserClientAsync();

        var response = await client.PostAsync("api/duplicate-candidates/detect", null);
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task ProblemDetails_ConformsToRFC7807_On404NotFound()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync($"api/products/{System.Guid.NewGuid()}");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var rawJson = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(rawJson);

        doc.RootElement.TryGetProperty("status", out var statusProp).Should().BeTrue();
        statusProp.GetInt32().Should().Be(404);
        doc.RootElement.TryGetProperty("title", out _).Should().BeTrue();
    }

    [Fact]
    public async Task JwtClaims_ContainRequiredStandards()
    {
        var client = CreateAnonymousClient();
        var loginRequest = new LoginRequestDto
        {
            Email = "admin@productiq.internal",
            Password = "Admin123!*"
        };

        var response = await client.PostAsJsonAsync("api/auth/login", loginRequest);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        authResponse.Should().NotBeNull();

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(authResponse!.Token);

        jwt.Issuer.Should().Be("ProductIQ.API");
        jwt.Audiences.Should().Contain("ProductIQ.Client");
        jwt.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Sub);
        jwt.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Email && c.Value == "admin@productiq.internal");
        jwt.Claims.Should().Contain(c => c.Type == "role" && c.Value == "Admin");
    }
}
