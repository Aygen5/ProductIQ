namespace ProductIQ.Application.Interfaces;

using ProductIQ.Application.DTOs;

public interface ISimilaritySearchService
{
    Task<IReadOnlyList<SimilarProductDto>> FindSimilarProductsAsync(Guid productId, int limit = 10, double? minSimilarity = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SimilarProductDto>> FindSimilarByVectorAsync(float[] vector, int limit = 10, double? minSimilarity = null, CancellationToken cancellationToken = default);
}
