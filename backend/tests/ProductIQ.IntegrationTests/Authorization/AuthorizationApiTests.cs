namespace ProductIQ.IntegrationTests.Authorization;

using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using ProductIQ.Application.DTOs;
using ProductIQ.IntegrationTests.Infrastructure;
using Xunit;

public class AuthorizationApiTests(ProductIQApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task User_CanAccess_Products_Returns200OK()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/products");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task User_CanAccess_DuplicateCandidates_Returns200OK()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/duplicate-candidates");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task User_CanAccess_SettingsGet_Returns200OK()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/settings");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task User_CanAccess_Analytics_Returns200OK()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/analytics");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Admin_CanTrigger_DuplicateDetection_Returns200OK()
    {
        var client = await CreateAdminClientAsync();

        var response = await client.PostAsync("api/duplicate-candidates/detect", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Admin_CanUpdate_Settings_Returns200OK()
    {
        var client = await CreateAdminClientAsync();
        var updateRequest = new UpdateSystemSettingsDto
        {
            Similarity = new SimilaritySettingsDto
            {
                CandidateThreshold = 0.82,
                AutoMergeThreshold = 0.95
            }
        };

        var response = await client.PutAsJsonAsync("api/settings", updateRequest);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Admin_CanReset_Settings_Returns200OK()
    {
        var client = await CreateAdminClientAsync();

        var response = await client.PostAsync("api/settings/reset", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task User_Attempting_DuplicateDetection_Returns403Forbidden()
    {
        var client = await CreateUserClientAsync();

        var response = await client.PostAsync("api/duplicate-candidates/detect", null);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task User_Attempting_SettingsUpdate_Returns403Forbidden()
    {
        var client = await CreateUserClientAsync();
        var updateRequest = new UpdateSystemSettingsDto
        {
            Similarity = new SimilaritySettingsDto { CandidateThreshold = 0.80 }
        };

        var response = await client.PutAsJsonAsync("api/settings", updateRequest);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task User_Attempting_SettingsReset_Returns403Forbidden()
    {
        var client = await CreateUserClientAsync();

        var response = await client.PostAsync("api/settings/reset", null);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Anonymous_Attempting_DuplicateDetection_Returns401Unauthorized()
    {
        var client = CreateAnonymousClient();

        var response = await client.PostAsync("api/duplicate-candidates/detect", null);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Anonymous_Attempting_SettingsUpdate_Returns401Unauthorized()
    {
        var client = CreateAnonymousClient();
        var updateRequest = new UpdateSystemSettingsDto
        {
            Similarity = new SimilaritySettingsDto { CandidateThreshold = 0.80 }
        };

        var response = await client.PutAsJsonAsync("api/settings", updateRequest);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Anonymous_Attempting_SettingsReset_Returns401Unauthorized()
    {
        var client = CreateAnonymousClient();

        var response = await client.PostAsync("api/settings/reset", null);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
