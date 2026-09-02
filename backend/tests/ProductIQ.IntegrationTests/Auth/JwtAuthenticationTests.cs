namespace ProductIQ.IntegrationTests.Auth;

using System;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.IdentityModel.Tokens;
using ProductIQ.Application.DTOs.Auth;
using ProductIQ.IntegrationTests.Infrastructure;
using Xunit;

public class JwtAuthenticationTests(ProductIQApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task ProtectedEndpoint_WithoutToken_Returns401Unauthorized()
    {
        var client = CreateAnonymousClient();

        var response = await client.GetAsync("api/products");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithInvalidToken_Returns401Unauthorized()
    {
        var client = CreateAnonymousClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "invalid.jwt.token12345");

        var response = await client.GetAsync("api/products");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithExpiredToken_Returns401Unauthorized()
    {
        var client = CreateAnonymousClient();
        var expiredToken = CreateTestToken(expiresIn: TimeSpan.FromMinutes(-10));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", expiredToken);

        var response = await client.GetAsync("api/products");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithValidToken_Returns200OK()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/products");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task PublicEndpoints_RegisterAndLogin_AccessibleAnonymously()
    {
        var client = CreateAnonymousClient();

        var regResponse = await client.PostAsJsonAsync("api/auth/register", new RegisterRequestDto
        {
            Email = "anon.register@productiq.internal",
            Password = "Password123!*",
            FirstName = "Anon",
            LastName = "User"
        });

        regResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var loginResponse = await client.PostAsJsonAsync("api/auth/login", new LoginRequestDto
        {
            Email = "anon.register@productiq.internal",
            Password = "Password123!*"
        });

        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task HealthEndpoint_AccessibleAnonymously()
    {
        var client = CreateAnonymousClient();

        var response = await client.GetAsync("api/health");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task MeEndpoint_WithoutToken_Returns401Unauthorized()
    {
        var client = CreateAnonymousClient();

        var response = await client.GetAsync("api/auth/me");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task MeEndpoint_WithValidToken_Returns200OK_AndUserProfile()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/auth/me");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var profile = await response.Content.ReadFromJsonAsync<UserProfileDto>();
        profile.Should().NotBeNull();
        profile!.Email.Should().Be("user@productiq.internal");
        profile.Role.Should().Be("User");
    }

    private static string CreateTestToken(TimeSpan expiresIn)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("ProductIQ_SuperSecret_Jwt_SigningKey_2026_Development_Min32Chars!"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Role, "User")
        };

        var token = new JwtSecurityToken(
            issuer: "ProductIQ.API",
            audience: "ProductIQ.Client",
            claims: claims,
            notBefore: DateTime.UtcNow.AddMinutes(-30),
            expires: DateTime.UtcNow.Add(expiresIn),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
