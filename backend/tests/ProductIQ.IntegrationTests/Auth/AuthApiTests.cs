namespace ProductIQ.IntegrationTests.Auth;

using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ProductIQ.Application.DTOs.Auth;
using ProductIQ.Domain.Enums;
using ProductIQ.IntegrationTests.Infrastructure;
using Xunit;

public class AuthApiTests(ProductIQApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task Register_WithValidInput_Returns201Created_AndReturnsValidJwt()
    {
        var client = CreateAnonymousClient();
        var request = new RegisterRequestDto
        {
            Email = "newuser@productiq.internal",
            Password = "Password123!*",
            FirstName = "Jane",
            LastName = "Doe"
        };

        var response = await client.PostAsJsonAsync("api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        authResponse.Should().NotBeNull();
        authResponse!.Token.Should().NotBeNullOrWhiteSpace();
        authResponse.User.Should().NotBeNull();
        authResponse.User.Email.Should().Be("newuser@productiq.internal");
        authResponse.User.Role.Should().Be("User");
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_Returns400BadRequest()
    {
        var client = CreateAnonymousClient();
        var request = new RegisterRequestDto
        {
            Email = "user@productiq.internal",
            Password = "Password123!*",
            FirstName = "Existing",
            LastName = "User"
        };

        var response = await client.PostAsJsonAsync("api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_PasswordIsHashed_AndNeverStoredInPlaintext()
    {
        var client = CreateAnonymousClient();
        var plainPassword = "SuperSecurePassword123!*";
        var request = new RegisterRequestDto
        {
            Email = "security.check@productiq.internal",
            Password = plainPassword,
            FirstName = "Security",
            LastName = "Check"
        };

        var response = await client.PostAsJsonAsync("api/auth/register", request);
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var userInDb = await ExecuteDbContextAsync(async context =>
            await context.Users.AsNoTracking().FirstAsync(u => u.Email == "security.check@productiq.internal"));

        userInDb.PasswordHash.Should().NotBe(plainPassword);
        userInDb.PasswordHash.Should().Contain(".");
    }

    [Fact]
    public async Task Register_AlwaysAssignsUserRole_CannotEscalateToAdmin()
    {
        var client = CreateAnonymousClient();
        var request = new RegisterRequestDto
        {
            Email = "rolecheck@productiq.internal",
            Password = "Password123!*",
            FirstName = "Attacker",
            LastName = "AttemptingAdmin"
        };

        var response = await client.PostAsJsonAsync("api/auth/register", request);
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var userInDb = await ExecuteDbContextAsync(async context =>
            await context.Users.AsNoTracking().FirstAsync(u => u.Email == "rolecheck@productiq.internal"));

        userInDb.Role.Should().Be(UserRole.User);
    }

    [Fact]
    public async Task Register_WithInvalidInput_Returns400BadRequest()
    {
        var client = CreateAnonymousClient();
        var request = new RegisterRequestDto
        {
            Email = "invalid-email-format",
            Password = "123",
            FirstName = "",
            LastName = ""
        };

        var response = await client.PostAsJsonAsync("api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithCorrectCredentials_Returns200OK_AndValidJwt()
    {
        var client = CreateAnonymousClient();
        var request = new LoginRequestDto
        {
            Email = "admin@productiq.internal",
            Password = "Admin123!*"
        };

        var response = await client.PostAsJsonAsync("api/auth/login", request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        authResponse.Should().NotBeNull();
        authResponse!.Token.Should().NotBeNullOrWhiteSpace();
        authResponse.User.Role.Should().Be("Admin");
    }

    [Fact]
    public async Task Login_WithWrongPassword_Returns401Unauthorized()
    {
        var client = CreateAnonymousClient();
        var request = new LoginRequestDto
        {
            Email = "admin@productiq.internal",
            Password = "WrongPassword999!"
        };

        var response = await client.PostAsJsonAsync("api/auth/login", request);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithNonExistentEmail_Returns401Unauthorized()
    {
        var client = CreateAnonymousClient();
        var request = new LoginRequestDto
        {
            Email = "nonexistent.user@productiq.internal",
            Password = "SomePassword123!"
        };

        var response = await client.PostAsJsonAsync("api/auth/login", request);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithInactiveUser_Returns403Forbidden()
    {
        var client = CreateAnonymousClient();
        var request = new LoginRequestDto
        {
            Email = "inactive@productiq.internal",
            Password = "Inactive123!*"
        };

        var response = await client.PostAsJsonAsync("api/auth/login", request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Login_Success_UpdatesLastLoginAtInDatabase()
    {
        var client = CreateAnonymousClient();
        var beforeLogin = DateTime.UtcNow;

        var request = new LoginRequestDto
        {
            Email = "user@productiq.internal",
            Password = "User123!*"
        };

        var response = await client.PostAsJsonAsync("api/auth/login", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var userInDb = await ExecuteDbContextAsync(async context =>
            await context.Users.AsNoTracking().FirstAsync(u => u.Email == "user@productiq.internal"));

        userInDb.LastLoginAt.Should().NotBeNull();
        userInDb.LastLoginAt.Should().BeOnOrAfter(beforeLogin.AddSeconds(-2));
    }
}
