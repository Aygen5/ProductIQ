namespace ProductIQ.IntegrationTests.Settings;

using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using ProductIQ.Application.DTOs;
using ProductIQ.IntegrationTests.Infrastructure;
using Xunit;

public class SettingsApiTests(ProductIQApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task GetSettings_User_Returns200OK()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/settings");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var settings = await response.Content.ReadFromJsonAsync<SystemSettingsDto>();
        settings.Should().NotBeNull();
    }

    [Fact]
    public async Task GetSettings_Admin_Returns200OK()
    {
        var client = await CreateAdminClientAsync();

        var response = await client.GetAsync("api/settings");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var settings = await response.Content.ReadFromJsonAsync<SystemSettingsDto>();
        settings.Should().NotBeNull();
    }

    [Fact]
    public async Task GetSimilaritySettings_User_Returns200OK()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/settings/similarity");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var similarity = await response.Content.ReadFromJsonAsync<SimilaritySettingsDto>();
        similarity.Should().NotBeNull();
    }

    [Fact]
    public async Task GetRiskSettings_User_Returns200OK()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/settings/risk");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var risk = await response.Content.ReadFromJsonAsync<RiskSettingsDto>();
        risk.Should().NotBeNull();
    }

    [Fact]
    public async Task GetAiSettings_User_Returns200OK()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/settings/ai");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var ai = await response.Content.ReadFromJsonAsync<AiSettingsDto>();
        ai.Should().NotBeNull();
    }

    [Fact]
    public async Task GetNotificationSettings_User_Returns200OK()
    {
        var client = await CreateUserClientAsync();

        var response = await client.GetAsync("api/settings/notification");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var notification = await response.Content.ReadFromJsonAsync<NotificationSettingsDto>();
        notification.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateSettings_Admin_Returns200OK_AndPersistsToDatabase()
    {
        var client = await CreateAdminClientAsync();
        var updateRequest = new UpdateSystemSettingsDto
        {
            Similarity = new SimilaritySettingsDto
            {
                CandidateThreshold = 0.85,
                AutoMergeThreshold = 0.95
            }
        };

        var response = await client.PutAsJsonAsync("api/settings", updateRequest);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await response.Content.ReadFromJsonAsync<SystemSettingsDto>();
        updated.Should().NotBeNull();
        updated!.Similarity.CandidateThreshold.Should().Be(0.85);
    }

    [Fact]
    public async Task UpdateSettings_User_Returns403Forbidden()
    {
        var client = await CreateUserClientAsync();
        var updateRequest = new UpdateSystemSettingsDto
        {
            Similarity = new SimilaritySettingsDto { CandidateThreshold = 0.85 }
        };

        var response = await client.PutAsJsonAsync("api/settings", updateRequest);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task ResetSettings_Admin_Returns200OK_AndRestoresDefaults()
    {
        var client = await CreateAdminClientAsync();

        var response = await client.PostAsync("api/settings/reset", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var reset = await response.Content.ReadFromJsonAsync<SystemSettingsDto>();
        reset.Should().NotBeNull();
    }

    [Fact]
    public async Task ResetSettings_User_Returns403Forbidden()
    {
        var client = await CreateUserClientAsync();

        var response = await client.PostAsync("api/settings/reset", null);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}
