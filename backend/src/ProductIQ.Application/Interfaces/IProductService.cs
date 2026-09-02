using ProductIQ.Application.Common.Models;
using ProductIQ.Application.DTOs;

namespace ProductIQ.Application.Interfaces;

public interface IProductService
{
    Task<PagedResponse<ProductSummaryDto>> GetProductsAsync(ProductQueryParameters parameters, CancellationToken cancellationToken = default);
    Task<ProductDetailDto?> GetProductByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProductDetailDto?> GetProductByAmazonItemIdAsync(string amazonItemId, CancellationToken cancellationToken = default);
    Task<ProductDetailDto> CreateProductAsync(CreateProductRequest request, CancellationToken cancellationToken = default);
}
