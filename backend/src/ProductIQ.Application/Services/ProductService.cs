using Microsoft.EntityFrameworkCore;
using ProductIQ.Application.Common.Models;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Entities;

namespace ProductIQ.Application.Services;

public class ProductService(IProductIQDbContext context) : IProductService
{
    public async Task<PagedResponse<ProductSummaryDto>> GetProductsAsync(ProductQueryParameters parameters, CancellationToken cancellationToken = default)
    {
        var query = context.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var searchLower = parameters.Search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(searchLower) ||
                (p.Brand != null && p.Brand.ToLower().Contains(searchLower)) ||
                p.AmazonItemId.ToLower().Contains(searchLower));
        }

        if (!string.IsNullOrWhiteSpace(parameters.Brand))
        {
            var brandLower = parameters.Brand.Trim().ToLower();
            query = query.Where(p => p.Brand != null && p.Brand.ToLower() == brandLower);
        }

        if (!string.IsNullOrWhiteSpace(parameters.Category))
        {
            var categoryLower = parameters.Category.Trim().ToLower();
            query = query.Where(p =>
                (p.Category != null && p.Category.ToLower().Contains(categoryLower)) ||
                (p.NodePath != null && p.NodePath.ToLower().Contains(categoryLower)));
        }

        if (!string.IsNullOrWhiteSpace(parameters.ProductType))
        {
            var typeLower = parameters.ProductType.Trim().ToLower();
            query = query.Where(p => p.ProductType != null && p.ProductType.ToLower() == typeLower);
        }

        query = ApplySorting(query, parameters.SortBy, parameters.SortDescending);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .Select(p => new ProductSummaryDto
            {
                Id = p.Id,
                AmazonItemId = p.AmazonItemId,
                Name = p.Name,
                Brand = p.Brand,
                Category = p.Category,
                NodePath = p.NodePath,
                ProductType = p.ProductType,
                MainImageUrl = p.MainImageUrl,
                Price = p.Price,
                Currency = p.Currency,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResponse<ProductSummaryDto>(items, totalCount, parameters.Page, parameters.PageSize);
    }

    public async Task<ProductDetailDto?> GetProductByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await context.Products
            .AsNoTracking()
            .Include(p => p.Images)
            .Include(p => p.Attributes)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        return product == null ? null : MapToDetailDto(product);
    }

    public async Task<ProductDetailDto?> GetProductByAmazonItemIdAsync(string amazonItemId, CancellationToken cancellationToken = default)
    {
        var product = await context.Products
            .AsNoTracking()
            .Include(p => p.Images)
            .Include(p => p.Attributes)
            .FirstOrDefaultAsync(p => p.AmazonItemId == amazonItemId, cancellationToken);

        return product == null ? null : MapToDetailDto(product);
    }

    private static IQueryable<Product> ApplySorting(IQueryable<Product> query, string? sortBy, bool sortDescending)
    {
        return (sortBy?.ToLowerInvariant(), sortDescending) switch
        {
            ("name", false) => query.OrderBy(p => p.Name),
            ("name", true) => query.OrderByDescending(p => p.Name),
            ("brand", false) => query.OrderBy(p => p.Brand),
            ("brand", true) => query.OrderByDescending(p => p.Brand),
            ("category", false) => query.OrderBy(p => p.Category),
            ("category", true) => query.OrderByDescending(p => p.Category),
            ("producttype", false) => query.OrderBy(p => p.ProductType),
            ("producttype", true) => query.OrderByDescending(p => p.ProductType),
            ("price", false) => query.OrderBy(p => p.Price),
            ("price", true) => query.OrderByDescending(p => p.Price),
            ("createdat", false) => query.OrderBy(p => p.CreatedAt),
            ("createdat", true) => query.OrderByDescending(p => p.CreatedAt),
            (_, true) => query.OrderByDescending(p => p.CreatedAt),
            _ => query.OrderBy(p => p.CreatedAt)
        };
    }

    private static ProductDetailDto MapToDetailDto(Product product)
    {
        return new ProductDetailDto
        {
            Id = product.Id,
            AmazonItemId = product.AmazonItemId,
            Name = product.Name,
            Description = product.Description,
            Brand = product.Brand,
            Category = product.Category,
            NodeId = product.NodeId,
            NodePath = product.NodePath,
            ProductType = product.ProductType,
            ModelName = product.ModelName,
            ModelNumber = product.ModelNumber,
            Color = product.Color,
            Material = product.Material,
            Dimensions = product.Dimensions == null ? null : new ItemDimensionsDto
            {
                Length = product.Dimensions.Length,
                Width = product.Dimensions.Width,
                Height = product.Dimensions.Height,
                Weight = product.Dimensions.Weight,
                DimensionUnit = product.Dimensions.DimensionUnit,
                WeightUnit = product.Dimensions.WeightUnit
            },
            Price = product.Price,
            Currency = product.Currency,
            MainImageUrl = product.MainImageUrl,
            Country = product.Country,
            DomainName = product.DomainName,
            Images = product.Images
                .OrderByDescending(i => i.IsMain)
                .Select(i => new ProductImageDto
                {
                    Id = i.Id,
                    ImageId = i.ImageId,
                    Path = i.Path,
                    Url = i.Url,
                    Height = i.Height,
                    Width = i.Width,
                    IsMain = i.IsMain
                })
                .ToList(),
            Attributes = product.Attributes
                .Select(a => new ProductAttributeDto
                {
                    Id = a.Id,
                    Key = a.Key,
                    Value = a.Value,
                    Language = a.Language
                })
                .ToList(),
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        };
    }
}
