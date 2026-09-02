namespace ProductIQ.UnitTests.Authorization;

using System;
using System.Security.Claims;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Moq;
using ProductIQ.Domain.Enums;
using ProductIQ.Infrastructure.Services;
using Xunit;

public class CurrentUserServiceTests
{
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock = new();

    private void SetUserContext(ClaimsPrincipal? principal)
    {
        var httpContext = new DefaultHttpContext();
        if (principal != null)
        {
            httpContext.User = principal;
        }
        _httpContextAccessorMock.Setup(a => a.HttpContext).Returns(principal != null ? httpContext : null);
    }

    [Fact]
    public void IsAuthenticated_WhenHttpContextIsNull_ShouldReturnFalse()
    {
        _httpContextAccessorMock.Setup(a => a.HttpContext).Returns((HttpContext?)null);
        var sut = new CurrentUserService(_httpContextAccessorMock.Object);

        sut.IsAuthenticated.Should().BeFalse();
        sut.UserId.Should().BeNull();
        sut.Email.Should().BeNull();
        sut.Role.Should().BeNull();
        sut.IsAdmin.Should().BeFalse();
    }

    [Fact]
    public void IsAuthenticated_WhenIdentityIsNotAuthenticated_ShouldReturnFalse()
    {
        var identity = new ClaimsIdentity();
        var principal = new ClaimsPrincipal(identity);
        SetUserContext(principal);

        var sut = new CurrentUserService(_httpContextAccessorMock.Object);

        sut.IsAuthenticated.Should().BeFalse();
    }

    [Fact]
    public void IsAuthenticated_WhenIdentityIsAuthenticated_ShouldReturnTrue()
    {
        var identity = new ClaimsIdentity("TestAuth");
        var principal = new ClaimsPrincipal(identity);
        SetUserContext(principal);

        var sut = new CurrentUserService(_httpContextAccessorMock.Object);

        sut.IsAuthenticated.Should().BeTrue();
    }

    [Fact]
    public void UserId_WithNameIdentifierClaim_ShouldReturnParsedGuid()
    {
        var expectedId = Guid.NewGuid();
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, expectedId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        SetUserContext(new ClaimsPrincipal(identity));

        var sut = new CurrentUserService(_httpContextAccessorMock.Object);

        sut.UserId.Should().Be(expectedId);
    }

    [Fact]
    public void UserId_WithSubClaim_ShouldReturnParsedGuid()
    {
        var expectedId = Guid.NewGuid();
        var claims = new[]
        {
            new Claim("sub", expectedId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        SetUserContext(new ClaimsPrincipal(identity));

        var sut = new CurrentUserService(_httpContextAccessorMock.Object);

        sut.UserId.Should().Be(expectedId);
    }

    [Fact]
    public void UserId_WithInvalidGuid_ShouldReturnNull()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "invalid-guid-value")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        SetUserContext(new ClaimsPrincipal(identity));

        var sut = new CurrentUserService(_httpContextAccessorMock.Object);

        sut.UserId.Should().BeNull();
    }

    [Fact]
    public void Email_WithEmailClaim_ShouldReturnEmail()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Email, "user@productiq.internal")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        SetUserContext(new ClaimsPrincipal(identity));

        var sut = new CurrentUserService(_httpContextAccessorMock.Object);

        sut.Email.Should().Be("user@productiq.internal");
    }

    [Fact]
    public void Role_WithRoleClaim_ShouldReturnRole()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Role, nameof(UserRole.User))
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        SetUserContext(new ClaimsPrincipal(identity));

        var sut = new CurrentUserService(_httpContextAccessorMock.Object);

        sut.Role.Should().Be("User");
    }

    [Fact]
    public void IsAdmin_WhenRoleIsAdmin_ShouldReturnTrue()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Role, "Admin")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        SetUserContext(new ClaimsPrincipal(identity));

        var sut = new CurrentUserService(_httpContextAccessorMock.Object);

        sut.IsAdmin.Should().BeTrue();
    }

    [Fact]
    public void IsAdmin_WhenRoleIsUser_ShouldReturnFalse()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Role, "User")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        SetUserContext(new ClaimsPrincipal(identity));

        var sut = new CurrentUserService(_httpContextAccessorMock.Object);

        sut.IsAdmin.Should().BeFalse();
    }

    [Fact]
    public void IsAdmin_WhenRoleHasDifferentCasing_ShouldReturnTrue()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Role, "ADMIN")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        SetUserContext(new ClaimsPrincipal(identity));

        var sut = new CurrentUserService(_httpContextAccessorMock.Object);

        sut.IsAdmin.Should().BeTrue();
    }
}
