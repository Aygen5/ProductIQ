namespace ProductIQ.Application.Services;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;

public class ImageSimilarityService : IImageSimilarityService
{
    private readonly IProductIQDbContext _context;

    public ImageSimilarityService(IProductIQDbContext context)
    {
        _context = context;
    }

    public async Task<ImageSimilarityResultDto> ComputeImageSimilarityAsync(Guid productAId, Guid productBId, CancellationToken cancellationToken = default)
    {
        var embeddingsA = await _context.ProductImageEmbeddings
            .AsNoTracking()
            .Where(e => e.ProductId == productAId && e.Vector != null)
            .Select(e => e.Vector)
            .ToListAsync(cancellationToken);

        var embeddingsB = await _context.ProductImageEmbeddings
            .AsNoTracking()
            .Where(e => e.ProductId == productBId && e.Vector != null)
            .Select(e => e.Vector)
            .ToListAsync(cancellationToken);

        if (embeddingsA.Count == 0 || embeddingsB.Count == 0)
        {
            return new ImageSimilarityResultDto
            {
                IsAvailable = false,
                SimilarityScore = null,
                StatusMessage = "No CLIP image embeddings available for one or both products."
            };
        }

        var maxSimilarity = 0.0;

        foreach (var vecA in embeddingsA)
        {
            if (vecA == null || vecA.Length == 0) continue;

            foreach (var vecB in embeddingsB)
            {
                if (vecB == null || vecB.Length == 0 || vecA.Length != vecB.Length) continue;

                var sim = ComputeCosineSimilarity(vecA, vecB);
                if (sim > maxSimilarity)
                {
                    maxSimilarity = sim;
                }
            }
        }

        var clampedScore = Math.Clamp(Math.Round((decimal)maxSimilarity, 4), 0.0000m, 1.0000m);

        return new ImageSimilarityResultDto
        {
            IsAvailable = true,
            SimilarityScore = clampedScore,
            StatusMessage = $"CLIP visual similarity computed from {embeddingsA.Count}x{embeddingsB.Count} image embeddings (best pairwise match: {clampedScore:P1})."
        };
    }

    private static double ComputeCosineSimilarity(float[] vecA, float[] vecB)
    {
        double dotProduct = 0;
        double normA = 0;
        double normB = 0;

        for (var i = 0; i < vecA.Length; i++)
        {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        var denom = Math.Sqrt(normA) * Math.Sqrt(normB);
        if (denom <= 0)
        {
            return 0.0;
        }

        var cosine = dotProduct / denom;
        return Math.Clamp((cosine + 1.0) / 2.0, 0.0, 1.0);
    }
}
