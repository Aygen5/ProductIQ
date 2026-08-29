namespace ProductIQ.Application.Interfaces;

using ProductIQ.Application.DTOs;

public interface IImageSimilarityService
{
    Task<ImageSimilarityResultDto> ComputeImageSimilarityAsync(Guid productAId, Guid productBId, CancellationToken cancellationToken = default);
}
