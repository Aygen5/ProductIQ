namespace ProductIQ.Application.Interfaces;

using ProductIQ.Application.DTOs;

public interface IProductImageEmbeddingBatchService
{
    Task<ImageEmbeddingBatchResultDto> GenerateImageEmbeddingsForAllProductImagesAsync(CancellationToken cancellationToken = default);
    Task<ImageEmbeddingBatchResultDto> GenerateImageEmbeddingsForProductAsync(Guid productId, CancellationToken cancellationToken = default);
}
