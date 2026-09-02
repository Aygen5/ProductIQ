namespace ProductIQ.UnitTests.Auth;

using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using FluentAssertions;
using Microsoft.Extensions.Options;
using ProductIQ.Application.Common.Configuration;
using ProductIQ.Domain.Entities;
using ProductIQ.Domain.Enums;
using ProductIQ.Infrastructure.Services.Auth;
using Xunit;

public class JwtTokenGeneratorTests
{
    private readonly JwtOptions _options = new()
    {
        Key = "ProductIQ_SuperSecret_Jwt_SigningKey_2026_Min32Chars!",
        Issuer = "ProductIQ.API",
        Audience = "ProductIQ.Client",
        ExpirationHours = 12
    };

    [Fact]
    public void GenerateToken_WithValidUser_ShouldReturnJwtStringAndExpiry()
    {
        var sut = new JwtTokenGenerator(Options.Create(_options));
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "testuser@productiq.internal",
            PasswordHash = "hashed-secret",
            FirstName = "Test",
            LastName = "User",
            Role = UserRole.User,
            IsActive = true
        };

        var beforeGeneration = DateTime.UtcNow;
        var (token, expiresAt) = sut.GenerateToken(user);

        token.Should().NotBeNullOrWhiteSpace();
        token.Split('.').Should().HaveCount(3);
        expiresAt.Should().BeAfter(beforeGeneration.AddHours(11.9));
        expiresAt.Should().BeBefore(beforeGeneration.AddHours(12.1));
    }

    [Fact]
    public void GenerateToken_ShouldContainRequiredClaims()
    {
        var sut = new JwtTokenGenerator(Options.Create(_options));
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "admin@productiq.internal",
            PasswordHash = "hashed-secret",
            FirstName = "Admin",
            LastName = "System",
            Role = UserRole.Admin,
            IsActive = true
        };

        var (token, _) = sut.GenerateToken(user);

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        jwtToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Sub).Value.Should().Be(userId.ToString());
        jwtToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Email).Value.Should().Be(user.Email);
        jwtToken.Claims.First(c => c.Type == "role").Value.Should().Be(nameof(UserRole.Admin));
        jwtToken.Claims.Should().Contain(c => c.Value == "Admin System");
        jwtToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Jti);
        jwtToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Iat);
        jwtToken.Issuer.Should().Be(_options.Issuer);
        jwtToken.Audiences.Should().Contain(_options.Audience);
    }

    [Fact]
    public void GenerateToken_WithDefaultEmptyKey_ShouldUseFallbackKey()
    {
        var emptyKeyOptions = new JwtOptions { Key = "" };
        var sut = new JwtTokenGenerator(Options.Create(emptyKeyOptions));
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@productiq.internal",
            PasswordHash = "hashed-secret",
            FirstName = "Default",
            LastName = "Key",
            Role = UserRole.User
        };

        var (token, _) = sut.GenerateToken(user);

        token.Should().NotBeNullOrWhiteSpace();
        token.Split('.').Should().HaveCount(3);
    }
}
