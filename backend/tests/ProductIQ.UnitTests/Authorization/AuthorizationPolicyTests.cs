namespace ProductIQ.UnitTests.Authorization;

using FluentAssertions;
using ProductIQ.Application.Common.Constants;
using Xunit;

public class AuthorizationPolicyTests
{
    [Fact]
    public void Policies_ShouldDefineExpectedConstants()
    {
        AuthorizationConstants.Policies.AdminOnly.Should().Be("AdminOnly");
        AuthorizationConstants.Policies.AuthenticatedUser.Should().Be("AuthenticatedUser");
    }

    [Fact]
    public void Roles_ShouldDefineExpectedConstants()
    {
        AuthorizationConstants.Roles.Admin.Should().Be("Admin");
        AuthorizationConstants.Roles.User.Should().Be("User");
    }
}
