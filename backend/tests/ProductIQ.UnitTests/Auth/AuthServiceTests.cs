namespace ProductIQ.UnitTests.Auth;

using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using ProductIQ.Application.DTOs.Auth;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Entities;
using ProductIQ.Domain.Enums;
using ProductIQ.Infrastructure.Services.Auth;
using ProductIQ.UnitTests.Common;
using Xunit;

public class AuthServiceTests
{
    private readonly Mock<IPasswordHasher> _passwordHasherMock = new();
    private readonly Mock<IJwtTokenGenerator> _jwtTokenGeneratorMock = new();
    private readonly Mock<ILogger<AuthService>> _loggerMock = new();

    [Fact]
    public async Task RegisterAsync_WithValidData_ShouldCreateUserWithHashedPasswordAndUserRole()
    {
        using var context = TestDbContextFactory.Create();
        var sut = new AuthService(context, _passwordHasherMock.Object, _jwtTokenGeneratorMock.Object, _loggerMock.Object);

        _passwordHasherMock
            .Setup(h => h.HashPassword("SecretPassword123!"))
            .Returns("100000.salt.hashedkey");

        _jwtTokenGeneratorMock
            .Setup(g => g.GenerateToken(It.IsAny<User>()))
            .Returns(("jwt-token-xyz", DateTime.UtcNow.AddHours(24)));

        var request = new RegisterRequestDto
        {
            Email = "newuser@productiq.internal",
            Password = "SecretPassword123!",
            FirstName = "John",
            LastName = "Doe"
        };

        var response = await sut.RegisterAsync(request);

        response.Should().NotBeNull();
        response.Token.Should().Be("jwt-token-xyz");
        response.User.Email.Should().Be("newuser@productiq.internal");
        response.User.Role.Should().Be(nameof(UserRole.User));

        var savedUser = await context.Users.FindAsync(response.User.Id);
        savedUser.Should().NotBeNull();
        savedUser!.Role.Should().Be(UserRole.User);
        savedUser.PasswordHash.Should().Be("100000.salt.hashedkey");
        savedUser.PasswordHash.Should().NotBe(request.Password);
        savedUser.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ShouldThrowInvalidOperationException()
    {
        using var context = TestDbContextFactory.Create();
        context.Users.Add(new User
        {
            Email = "existing@productiq.internal",
            PasswordHash = "hash",
            FirstName = "Existing",
            LastName = "User",
            Role = UserRole.User
        });
        await context.SaveChangesAsync();

        var sut = new AuthService(context, _passwordHasherMock.Object, _jwtTokenGeneratorMock.Object, _loggerMock.Object);

        var request = new RegisterRequestDto
        {
            Email = "EXISTING@productiq.internal",
            Password = "AnotherPassword123!",
            FirstName = "Duplicate",
            LastName = "Attempt"
        };

        var act = async () => await sut.RegisterAsync(request);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("An account with this email address already exists.");
    }

    [Fact]
    public async Task RegisterAsync_WithMixedCaseEmail_ShouldNormalizeEmail()
    {
        using var context = TestDbContextFactory.Create();
        var sut = new AuthService(context, _passwordHasherMock.Object, _jwtTokenGeneratorMock.Object, _loggerMock.Object);

        _passwordHasherMock
            .Setup(h => h.HashPassword(It.IsAny<string>()))
            .Returns("hash");

        _jwtTokenGeneratorMock
            .Setup(g => g.GenerateToken(It.IsAny<User>()))
            .Returns(("token", DateTime.UtcNow.AddHours(24)));

        var request = new RegisterRequestDto
        {
            Email = "   MixedCase.User@ProductIQ.INTERNAL   ",
            Password = "Password123!",
            FirstName = "Jane",
            LastName = "Smith"
        };

        var response = await sut.RegisterAsync(request);

        response.User.Email.Should().Be("mixedcase.user@productiq.internal");
        var savedUser = await context.Users.FindAsync(response.User.Id);
        savedUser!.Email.Should().Be("mixedcase.user@productiq.internal");
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldUpdateLastLoginAndReturnToken()
    {
        using var context = TestDbContextFactory.Create();
        var user = new User
        {
            Email = "login@productiq.internal",
            PasswordHash = "hashed-secret",
            FirstName = "Login",
            LastName = "User",
            Role = UserRole.User,
            IsActive = true,
            LastLoginAt = null
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        _passwordHasherMock
            .Setup(h => h.VerifyPassword("hashed-secret", "ValidPassword123!"))
            .Returns(true);

        _jwtTokenGeneratorMock
            .Setup(g => g.GenerateToken(It.IsAny<User>()))
            .Returns(("login-jwt-token", DateTime.UtcNow.AddHours(24)));

        var sut = new AuthService(context, _passwordHasherMock.Object, _jwtTokenGeneratorMock.Object, _loggerMock.Object);

        var request = new LoginRequestDto
        {
            Email = "LOGIN@productiq.internal",
            Password = "ValidPassword123!"
        };

        var response = await sut.LoginAsync(request);

        response.Should().NotBeNull();
        response.Token.Should().Be("login-jwt-token");
        response.User.Email.Should().Be("login@productiq.internal");

        var updatedUser = await context.Users.FindAsync(user.Id);
        updatedUser!.LastLoginAt.Should().NotBeNull();
        updatedUser.LastLoginAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task LoginAsync_WithWrongPassword_ShouldThrowUnauthorizedAccessException()
    {
        using var context = TestDbContextFactory.Create();
        context.Users.Add(new User
        {
            Email = "user@productiq.internal",
            PasswordHash = "correct-hash",
            FirstName = "User",
            LastName = "Test",
            Role = UserRole.User,
            IsActive = true
        });
        await context.SaveChangesAsync();

        _passwordHasherMock
            .Setup(h => h.VerifyPassword("correct-hash", "WrongPassword!"))
            .Returns(false);

        var sut = new AuthService(context, _passwordHasherMock.Object, _jwtTokenGeneratorMock.Object, _loggerMock.Object);

        var request = new LoginRequestDto
        {
            Email = "user@productiq.internal",
            Password = "WrongPassword!"
        };

        var act = async () => await sut.LoginAsync(request);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid email or password.");
    }

    [Fact]
    public async Task LoginAsync_WithNonExistentEmail_ShouldThrowUnauthorizedAccessException()
    {
        using var context = TestDbContextFactory.Create();
        var sut = new AuthService(context, _passwordHasherMock.Object, _jwtTokenGeneratorMock.Object, _loggerMock.Object);

        var request = new LoginRequestDto
        {
            Email = "nonexistent@productiq.internal",
            Password = "AnyPassword123!"
        };

        var act = async () => await sut.LoginAsync(request);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid email or password.");
    }

    [Fact]
    public async Task LoginAsync_WithDeactivatedUser_ShouldThrowInvalidOperationException()
    {
        using var context = TestDbContextFactory.Create();
        context.Users.Add(new User
        {
            Email = "inactive@productiq.internal",
            PasswordHash = "valid-hash",
            FirstName = "Inactive",
            LastName = "User",
            Role = UserRole.User,
            IsActive = false
        });
        await context.SaveChangesAsync();

        _passwordHasherMock
            .Setup(h => h.VerifyPassword("valid-hash", "ValidPassword123!"))
            .Returns(true);

        var sut = new AuthService(context, _passwordHasherMock.Object, _jwtTokenGeneratorMock.Object, _loggerMock.Object);

        var request = new LoginRequestDto
        {
            Email = "inactive@productiq.internal",
            Password = "ValidPassword123!"
        };

        var act = async () => await sut.LoginAsync(request);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Account has been deactivated. Please contact an administrator.");
    }

    [Fact]
    public async Task GetCurrentUserAsync_WithExistingUser_ShouldReturnProfile()
    {
        using var context = TestDbContextFactory.Create();
        var user = new User
        {
            Email = "profile@productiq.internal",
            PasswordHash = "hash",
            FirstName = "Profile",
            LastName = "User",
            Role = UserRole.Admin,
            IsActive = true
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var sut = new AuthService(context, _passwordHasherMock.Object, _jwtTokenGeneratorMock.Object, _loggerMock.Object);

        var profile = await sut.GetCurrentUserProfileAsync(user.Id);

        profile.Should().NotBeNull();
        profile.Id.Should().Be(user.Id);
        profile.Email.Should().Be(user.Email);
        profile.Role.Should().Be(nameof(UserRole.Admin));
    }

    [Fact]
    public async Task GetCurrentUserAsync_WithNonExistentUser_ShouldThrowKeyNotFoundException()
    {
        using var context = TestDbContextFactory.Create();
        var sut = new AuthService(context, _passwordHasherMock.Object, _jwtTokenGeneratorMock.Object, _loggerMock.Object);

        var nonExistentId = Guid.NewGuid();
        var act = async () => await sut.GetCurrentUserProfileAsync(nonExistentId);

        await act.Should().ThrowAsync<System.Collections.Generic.KeyNotFoundException>()
            .WithMessage("User not found or account is deactivated.");
    }
}
