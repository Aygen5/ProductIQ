namespace ProductIQ.Application.Interfaces;

using System.Threading;
using System.Threading.Tasks;
using ProductIQ.Application.DTOs;

public interface IProductImportService
{
    Task<ProductImportResultDto> ImportAboProductsAsync(int batchSize = 25, CancellationToken cancellationToken = default);
}
