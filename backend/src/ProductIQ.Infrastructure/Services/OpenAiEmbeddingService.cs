namespace ProductIQ.Infrastructure.Services;

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ProductIQ.Application.Common.Configuration;
using ProductIQ.Application.Interfaces;

public class OpenAiEmbeddingService : IEmbeddingService
{
    private readonly HttpClient _httpClient;
    private readonly EmbeddingOptions _options;
    private readonly ILogger<OpenAiEmbeddingService> _logger;

    public OpenAiEmbeddingService(
        HttpClient httpClient,
        IOptions<EmbeddingOptions> options,
        ILogger<OpenAiEmbeddingService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken = default)
    {
        var result = await GenerateEmbeddingsAsync(new[] { text }, cancellationToken);
        return result[0];
    }

    public async Task<IReadOnlyList<float[]>> GenerateEmbeddingsAsync(IReadOnlyList<string> texts, CancellationToken cancellationToken = default)
    {
        if (texts == null || texts.Count == 0)
        {
            return Array.Empty<float[]>();
        }

        if (string.Equals(_options.Provider, "Mock", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation("Using deterministic Mock embedding generator for {Count} items (Dimension: {Dimension})", texts.Count, _options.Dimension);
            return texts.Select(t => GenerateDeterministicVector(t, _options.Dimension)).ToList();
        }

        var apiKey = GetApiKey();
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("OpenAI API key is missing. Please set the OPENAI_API_KEY environment variable or configure 'Embedding:ApiKey' in application configuration/User Secrets (or set 'Embedding:Provider': 'Mock' for offline testing).");
        }

        var maxRetries = Math.Max(1, _options.MaxRetries);
        var delay = TimeSpan.FromMilliseconds(500);

        for (var attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/embeddings");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                var payload = new
                {
                    model = _options.Model,
                    input = texts
                };

                request.Content = JsonContent.Create(payload);

                using var response = await _httpClient.SendAsync(request, cancellationToken);

                if (response.IsSuccessStatusCode)
                {
                    var responseBody = await response.Content.ReadFromJsonAsync<OpenAiEmbeddingResponse>(cancellationToken: cancellationToken);
                    if (responseBody?.Data == null || responseBody.Data.Count == 0)
                    {
                        throw new InvalidOperationException("OpenAI returned an empty embedding response.");
                    }

                    var orderedEmbeddings = responseBody.Data
                        .OrderBy(d => d.Index)
                        .Select(d => d.Embedding)
                        .ToList();

                    return orderedEmbeddings;
                }

                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);

                if (response.StatusCode == HttpStatusCode.TooManyRequests || (int)response.StatusCode >= 500)
                {
                    _logger.LogWarning("OpenAI Embeddings API returned status {StatusCode} (Attempt {Attempt}/{MaxRetries}): {Error}", response.StatusCode, attempt, maxRetries, errorContent);

                    if (attempt < maxRetries)
                    {
                        await Task.Delay(delay, cancellationToken);
                        delay = TimeSpan.FromMilliseconds(delay.TotalMilliseconds * 2);
                        continue;
                    }
                }

                throw new HttpRequestException($"OpenAI Embeddings API request failed with status {response.StatusCode}: {errorContent}");
            }
            catch (Exception ex) when (attempt < maxRetries && ex is not OperationCanceledException)
            {
                _logger.LogWarning(ex, "OpenAI API call failed on attempt {Attempt}/{MaxRetries}. Retrying in {Delay}ms...", attempt, maxRetries, delay.TotalMilliseconds);
                await Task.Delay(delay, cancellationToken);
                delay = TimeSpan.FromMilliseconds(delay.TotalMilliseconds * 2);
            }
        }

        throw new InvalidOperationException($"Failed to generate embeddings after {maxRetries} attempts.");
    }

    private static float[] GenerateDeterministicVector(string text, int dimension)
    {
        var vector = new float[dimension];
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(text));
        var seed = BitConverter.ToInt32(bytes, 0);
        var random = new Random(seed);
        double sumSquares = 0;

        for (var i = 0; i < dimension; i++)
        {
            var val = (float)(random.NextDouble() * 2.0 - 1.0);
            vector[i] = val;
            sumSquares += val * val;
        }

        var norm = (float)Math.Sqrt(sumSquares);
        if (norm > 0)
        {
            for (var i = 0; i < dimension; i++)
            {
                vector[i] /= norm;
            }
        }

        return vector;
    }

    private string? GetApiKey()
    {
        if (!string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            return _options.ApiKey.Trim();
        }

        var envKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (!string.IsNullOrWhiteSpace(envKey))
        {
            return envKey.Trim();
        }

        var altEnvKey = Environment.GetEnvironmentVariable("Embedding__ApiKey");
        if (!string.IsNullOrWhiteSpace(altEnvKey))
        {
            return altEnvKey.Trim();
        }

        return null;
    }

    private class OpenAiEmbeddingResponse
    {
        [JsonPropertyName("data")]
        public List<OpenAiEmbeddingData> Data { get; set; } = new();

        [JsonPropertyName("model")]
        public string? Model { get; set; }
    }

    private class OpenAiEmbeddingData
    {
        [JsonPropertyName("index")]
        public int Index { get; set; }

        [JsonPropertyName("embedding")]
        public float[] Embedding { get; set; } = Array.Empty<float>();
    }
}
