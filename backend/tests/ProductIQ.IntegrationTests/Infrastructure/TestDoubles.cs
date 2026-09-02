namespace ProductIQ.IntegrationTests.Infrastructure;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;

public class TestEmbeddingService : IEmbeddingService
{
    public Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken = default)
    {
        var vector = CreateDeterministicVector(text, 1536);
        return Task.FromResult(vector);
    }

    public Task<IReadOnlyList<float[]>> GenerateEmbeddingsAsync(IReadOnlyList<string> texts, CancellationToken cancellationToken = default)
    {
        IReadOnlyList<float[]> results = texts.Select(t => CreateDeterministicVector(t, 1536)).ToList();
        return Task.FromResult(results);
    }

    private static float[] CreateDeterministicVector(string input, int dimensions)
    {
        var vector = new float[dimensions];
        var seed = string.IsNullOrEmpty(input) ? 42 : Math.Abs(input.GetHashCode());
        var random = new Random(seed);
        double sumSquares = 0;

        for (var i = 0; i < dimensions; i++)
        {
            var val = (float)(random.NextDouble() * 2.0 - 1.0);
            vector[i] = val;
            sumSquares += val * val;
        }

        var norm = (float)Math.Sqrt(sumSquares);
        if (norm > 0)
        {
            for (var i = 0; i < dimensions; i++)
            {
                vector[i] /= norm;
            }
        }

        return vector;
    }
}

public class TestClipImageEmbeddingService : IClipImageEmbeddingService
{
    public Task<float[]> GenerateImageEmbeddingAsync(byte[] imageBytes, CancellationToken cancellationToken = default)
    {
        var vector = new float[512];
        for (var i = 0; i < 512; i++)
        {
            vector[i] = 1.0f / (float)Math.Sqrt(512);
        }
        return Task.FromResult(vector);
    }

    public Task<float[]> GenerateImageEmbeddingFromUrlAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        var vector = new float[512];
        for (var i = 0; i < 512; i++)
        {
            vector[i] = 1.0f / (float)Math.Sqrt(512);
        }
        return Task.FromResult(vector);
    }

    public Task<IReadOnlyList<float[]>> GenerateImageEmbeddingsBatchAsync(IReadOnlyList<byte[]> imageBytesList, CancellationToken cancellationToken = default)
    {
        var vector = new float[512];
        for (var i = 0; i < 512; i++)
        {
            vector[i] = 1.0f / (float)Math.Sqrt(512);
        }
        IReadOnlyList<float[]> list = imageBytesList.Select(_ => vector).ToList();
        return Task.FromResult(list);
    }
}

public class TestExplanationLlmService : IExplanationLlmService
{
    public Task<CandidateAiExplanationDto> GenerateExplanationAsync(ExplanationPromptContextDto context, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new CandidateAiExplanationDto
        {
            Summary = "Test summary for duplicate candidate.",
            Reasoning = "High similarity across all signals.",
            KeyMatches = new List<string> { "Brand match", "Model match" },
            KeyConflicts = new List<string>(),
            OperatorGuidance = "Safe to confirm.",
            Status = "Generated",
            GeneratedAt = DateTime.UtcNow,
            ModelUsed = "test-stub"
        });
    }

    public Task<CandidateAiRiskExplanationDto> GenerateRiskExplanationAsync(RiskPromptContextDto context, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new CandidateAiRiskExplanationDto
        {
            Summary = "Low operational risk detected.",
            Reasoning = "No critical discrepancies found.",
            KeyRisks = new List<string>(),
            OperatorGuidance = "Standard review.",
            Status = "Generated",
            GeneratedAt = DateTime.UtcNow,
            ModelUsed = "test-stub"
        });
    }
}
