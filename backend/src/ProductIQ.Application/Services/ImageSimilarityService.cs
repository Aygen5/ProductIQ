namespace ProductIQ.Application.Services;

using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;

public class ImageSimilarityService : IImageSimilarityService
{
    public Task<ImageSimilarityResultDto> ComputeImageSimilarityAsync(Guid productAId, Guid productBId, CancellationToken cancellationToken = default)
    {
        var result = new ImageSimilarityResultDto
        {
            IsAvailable = false,
            SimilarityScore = null,
            StatusMessage = "Visual embedding analysis (CLIP/Vision) will be enabled in Phase 12."
        };

        return Task.FromResult(result);
    }
}
