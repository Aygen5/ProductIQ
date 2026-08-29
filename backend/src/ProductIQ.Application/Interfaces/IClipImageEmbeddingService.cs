namespace ProductIQ.Application.Interfaces;

public interface IClipImageEmbeddingService
{
    Task<float[]> GenerateImageEmbeddingAsync(byte[] imageBytes, CancellationToken cancellationToken = default);
    Task<float[]> GenerateImageEmbeddingFromUrlAsync(string imageUrl, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<float[]>> GenerateImageEmbeddingsBatchAsync(IReadOnlyList<byte[]> imageBytesList, CancellationToken cancellationToken = default);
}
