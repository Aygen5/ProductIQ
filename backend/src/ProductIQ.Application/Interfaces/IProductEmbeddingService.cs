namespace ProductIQ.Application.Interfaces;

using ProductIQ.Domain.Entities;

public interface IProductEmbeddingService
{
    string BuildProductEmbeddingText(Product product);
}
