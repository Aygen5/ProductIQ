namespace ProductIQ.Application.Interfaces;

using ProductIQ.Application.DTOs;

public interface IProductEmbeddingBatchService
{
    Task<EmbeddingBatchResultDto> GenerateEmbeddingsForAllProductsAsync(CancellationToken cancellationToken = default);
    Task<EmbeddingBatchResultDto> GenerateEmbeddingForProductAsync(Guid productId, CancellationToken cancellationToken = default);
}
