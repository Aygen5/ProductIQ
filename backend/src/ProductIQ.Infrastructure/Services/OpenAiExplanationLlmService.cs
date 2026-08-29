namespace ProductIQ.Infrastructure.Services;

using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ProductIQ.Application.Common.Configuration;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;

public class OpenAiExplanationLlmService : IExplanationLlmService
{
    private readonly HttpClient _httpClient;
    private readonly OpenAiExplanationOptions _options;
    private readonly ILogger<OpenAiExplanationLlmService> _logger;

    public OpenAiExplanationLlmService(
        HttpClient httpClient,
        IOptions<OpenAiExplanationOptions> options,
        ILogger<OpenAiExplanationLlmService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<CandidateAiExplanationDto> GenerateExplanationAsync(ExplanationPromptContextDto context, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            _logger.LogInformation("OpenAI Explanation Service is disabled via configuration. Using deterministic fallback.");
            return GenerateFallbackExplanation(context, "OpenAI explanation is disabled via configuration.");
        }

        var apiKey = GetApiKey();
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("OpenAI API key is missing. Using deterministic explanation fallback.");
            return GenerateFallbackExplanation(context, "OpenAI API key is not configured.");
        }

        var systemPrompt = BuildSystemPrompt();
        var userPrompt = BuildUserPrompt(context);

        var payload = new
        {
            model = _options.Model,
            temperature = _options.Temperature,
            response_format = new { type = "json_object" },
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userPrompt }
            }
        };

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(Math.Max(5, _options.TimeoutSeconds)));

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            request.Content = JsonContent.Create(payload);

            using var response = await _httpClient.SendAsync(request, cts.Token);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cts.Token);
                _logger.LogWarning("OpenAI Chat Completion failed for candidate {CandidateId} with status {StatusCode}: {Error}",
                    context.CandidateId, response.StatusCode, errorContent);
                return GenerateFallbackExplanation(context, $"OpenAI API returned status {response.StatusCode}.");
            }

            var responseBody = await response.Content.ReadFromJsonAsync<OpenAiChatResponse>(cancellationToken: cts.Token);
            var rawContent = responseBody?.Choices?.FirstOrDefault()?.Message?.Content;

            if (string.IsNullOrWhiteSpace(rawContent))
            {
                _logger.LogWarning("OpenAI returned an empty content message for candidate {CandidateId}.", context.CandidateId);
                return GenerateFallbackExplanation(context, "OpenAI returned empty message content.");
            }

            var parsedResult = JsonSerializer.Deserialize<OpenAiExplanationJsonPayload>(rawContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (parsedResult == null || string.IsNullOrWhiteSpace(parsedResult.Summary))
            {
                _logger.LogWarning("Failed to deserialize structured JSON explanation from OpenAI for candidate {CandidateId}.", context.CandidateId);
                return GenerateFallbackExplanation(context, "Failed to parse structured JSON explanation.");
            }

            return new CandidateAiExplanationDto
            {
                Summary = parsedResult.Summary.Trim(),
                Reasoning = parsedResult.Reasoning?.Trim() ?? string.Empty,
                KeyMatches = parsedResult.KeyMatches ?? new List<string>(),
                KeyConflicts = parsedResult.KeyConflicts ?? new List<string>(),
                OperatorGuidance = parsedResult.OperatorGuidance?.Trim() ?? string.Empty,
                Status = "Generated",
                GeneratedAt = DateTime.UtcNow,
                ModelUsed = _options.Model
            };
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException)
        {
            _logger.LogWarning(ex, "Exception occurred during OpenAI explanation generation for candidate {CandidateId}: {Message}",
                context.CandidateId, ex.Message);
            return GenerateFallbackExplanation(context, ex.Message);
        }
    }

    private static CandidateAiExplanationDto GenerateFallbackExplanation(ExplanationPromptContextDto context, string reason)
    {
        var summary = $"Automated duplicate score of {context.OverallScore:P1} calculated with {context.ConfidenceLevel}.";
        if (context.DeterministicMatches.Count > 0)
        {
            summary += $" Primary matching signals include {string.Join(", ", context.DeterministicMatches.Take(2))}.";
        }

        var reasoning = $"Scoring engine evaluated 7 distinct catalog and visual signals (Brand: {(context.BrandMatch ? "Match" : "Mismatch")}, Category: {(context.CategoryMatch ? "Match" : "Mismatch")}, Text: {context.TextSimilarity:P0}, Visual: {context.VisualSimilarity:P0}).";

        return new CandidateAiExplanationDto
        {
            Summary = summary,
            Reasoning = reasoning,
            KeyMatches = new List<string>(context.DeterministicMatches),
            KeyConflicts = new List<string>(context.DeterministicDifferences),
            OperatorGuidance = !string.IsNullOrWhiteSpace(context.DeterministicRecommendation)
                ? context.DeterministicRecommendation
                : "Inspect item attributes, images, and model numbers before deciding.",
            Status = "Fallback",
            GeneratedAt = DateTime.UtcNow,
            ModelUsed = "DeterministicFallback"
        };
    }

    private static string BuildSystemPrompt()
    {
        return @"You are an explanation assistant for an e-commerce duplicate detection system.
Your sole task is to generate a neutral, factual, and easy-to-read explanation of why the automated duplicate detection engine calculated a specific duplicate confidence score for this candidate pair.

CRITICAL RULES:
1. Do NOT make the final duplicate decision yourself. The decision rests entirely with the human operator.
2. Do NOT change, override, or alter the overall score, confidence level, or similarity signal percentages.
3. Do NOT invent or hallucinate facts, specifications, or attributes not present in the input.
4. Clearly explain which factors are matching and which factors are conflicting or divergent.
5. If there are conflicting signals (e.g. different model numbers, dimensions, colors, or low attribute match), highlight them explicitly in keyConflicts.
6. If the overall score is moderate or low, do not claim the items are duplicates merely because some signals match.
7. Provide objective guidance for the operator on which specific fields require visual or technical verification.
8. Output STRICTLY a valid JSON object with the following schema:
{
  ""summary"": ""Concise 1-2 sentence overview explaining why the system assigned this duplicate score."",
  ""reasoning"": ""2-3 sentences explaining how matching vs conflicting signals contributed to the confidence score."",
  ""keyMatches"": [""Plain language point explaining a matching signal"", ...],
  ""keyConflicts"": [""Plain language point explaining a conflicting or divergent signal"", ...],
  ""operatorGuidance"": ""Clear guidance on what technical differences or images the operator should check before deciding.""
}";
    }

    private static string BuildUserPrompt(ExplanationPromptContextDto context)
    {
        var inputData = new
        {
            candidateId = context.CandidateId,
            overallScore = context.OverallScore,
            overallScorePercent = $"{context.OverallScore:P1}",
            confidenceLevel = context.ConfidenceLevel,
            similaritySignals = new
            {
                brandMatch = context.BrandMatch,
                categoryMatch = context.CategoryMatch,
                modelMatch = context.ModelMatch,
                textSimilarity = context.TextSimilarity.HasValue ? $"{context.TextSimilarity.Value:P1}" : "N/A",
                semanticSimilarity = context.SemanticSimilarity.HasValue ? $"{context.SemanticSimilarity.Value:P1}" : "N/A",
                attributeSimilarity = context.AttributeSimilarity.HasValue ? $"{context.AttributeSimilarity.Value:P1}" : "N/A",
                visualSimilarity = context.VisualSimilarity.HasValue ? $"{context.VisualSimilarity.Value:P1}" : "N/A"
            },
            productA = new
            {
                asin = context.ProductA.AmazonItemId,
                name = context.ProductA.Name,
                brand = context.ProductA.Brand,
                category = context.ProductA.Category,
                modelName = context.ProductA.ModelName,
                modelNumber = context.ProductA.ModelNumber,
                dimensions = context.ProductA.Dimensions,
                price = context.ProductA.Price
            },
            productB = new
            {
                asin = context.ProductB.AmazonItemId,
                name = context.ProductB.Name,
                brand = context.ProductB.Brand,
                category = context.ProductB.Category,
                modelName = context.ProductB.ModelName,
                modelNumber = context.ProductB.ModelNumber,
                dimensions = context.ProductB.Dimensions,
                price = context.ProductB.Price
            },
            detectedMatchingSignals = context.DeterministicMatches,
            detectedConflictingSignals = context.DeterministicDifferences,
            initialRecommendation = context.DeterministicRecommendation
        };

        return JsonSerializer.Serialize(inputData, new JsonSerializerOptions { WriteIndented = true });
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

        var altEnvKey = Environment.GetEnvironmentVariable("OpenAI__ApiKey");
        if (!string.IsNullOrWhiteSpace(altEnvKey))
        {
            return altEnvKey.Trim();
        }

        return null;
    }

    private class OpenAiChatResponse
    {
        [JsonPropertyName("choices")]
        public List<OpenAiChatChoice>? Choices { get; set; }
    }

    private class OpenAiChatChoice
    {
        [JsonPropertyName("message")]
        public OpenAiChatMessage? Message { get; set; }
    }

    private class OpenAiChatMessage
    {
        [JsonPropertyName("content")]
        public string? Content { get; set; }
    }

    private class OpenAiExplanationJsonPayload
    {
        public string? Summary { get; set; }
        public string? Reasoning { get; set; }
        public List<string>? KeyMatches { get; set; }
        public List<string>? KeyConflicts { get; set; }
        public string? OperatorGuidance { get; set; }
    }
}
