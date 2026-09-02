namespace ProductIQ.UnitTests.Auth;

using System;
using FluentAssertions;
using ProductIQ.Infrastructure.Services.Auth;
using Xunit;

public class PasswordHasherTests
{
    private readonly PasswordHasher _sut = new();

    [Fact]
    public void HashPassword_WithValidPassword_ShouldReturnFormattedString()
    {
        var password = "SecurePassword123!";

        var hash = _sut.HashPassword(password);

        hash.Should().NotBeNullOrWhiteSpace();
        var parts = hash.Split('.');
        parts.Should().HaveCount(3);
        parts[0].Should().Be("100000");
        Convert.FromBase64String(parts[1]).Should().HaveCount(16);
        Convert.FromBase64String(parts[2]).Should().HaveCount(32);
    }

    [Fact]
    public void HashPassword_WithSamePassword_ShouldGenerateUniqueSaltsAndHashes()
    {
        var password = "IdenticalPassword2026!";

        var hash1 = _sut.HashPassword(password);
        var hash2 = _sut.HashPassword(password);

        hash1.Should().NotBe(hash2);

        var salt1 = hash1.Split('.')[1];
        var salt2 = hash2.Split('.')[1];
        salt1.Should().NotBe(salt2);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void HashPassword_WithNullOrEmptyPassword_ShouldThrowArgumentException(string? invalidPassword)
    {
        Action act = () => _sut.HashPassword(invalidPassword!);

        act.Should().Throw<ArgumentException>()
            .WithParameterName("password");
    }

    [Fact]
    public void VerifyPassword_WithCorrectPassword_ShouldReturnTrue()
    {
        var password = "CorrectPassword!*2026";
        var hash = _sut.HashPassword(password);

        var isValid = _sut.VerifyPassword(hash, password);

        isValid.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_WithWrongPassword_ShouldReturnFalse()
    {
        var password = "CorrectPassword!*2026";
        var hash = _sut.HashPassword(password);

        var isValid = _sut.VerifyPassword(hash, "WrongPassword!*2026");

        isValid.Should().BeFalse();
    }

    [Fact]
    public void VerifyPassword_WithCorruptedHashKey_ShouldReturnFalse()
    {
        var password = "SecurePassword";
        var hash = _sut.HashPassword(password);
        var parts = hash.Split('.');
        var corruptedHash = $"{parts[0]}.{parts[1]}.{Convert.ToBase64String(new byte[32])}";

        var isValid = _sut.VerifyPassword(corruptedHash, password);

        isValid.Should().BeFalse();
    }

    [Theory]
    [InlineData("singlepart")]
    [InlineData("part1.part2")]
    [InlineData("part1.part2.part3.part4")]
    public void VerifyPassword_WithInvalidPartsCount_ShouldReturnFalse(string malformedHash)
    {
        var isValid = _sut.VerifyPassword(malformedHash, "anyPassword");

        isValid.Should().BeFalse();
    }

    [Fact]
    public void VerifyPassword_WithInvalidIterations_ShouldReturnFalse()
    {
        var malformedHash = "notAnInt.c2FsdA==.a2V5";

        var isValid = _sut.VerifyPassword(malformedHash, "anyPassword");

        isValid.Should().BeFalse();
    }

    [Fact]
    public void VerifyPassword_WithInvalidBase64_ShouldReturnFalse()
    {
        var malformedHash = "100000.invalid_base64!.invalid_base64!";

        var isValid = _sut.VerifyPassword(malformedHash, "anyPassword");

        isValid.Should().BeFalse();
    }

    [Theory]
    [InlineData(null, "password")]
    [InlineData("", "password")]
    [InlineData("100000.salt.key", null)]
    [InlineData("100000.salt.key", "")]
    public void VerifyPassword_WithNullOrEmptyInputs_ShouldReturnFalse(string? hash, string? password)
    {
        var isValid = _sut.VerifyPassword(hash!, password!);

        isValid.Should().BeFalse();
    }
}
