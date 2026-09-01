namespace ProductIQ.API.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProductIQ.Application.Common.Models;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class ProductsController(IProductService productService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<ProductSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResponse<ProductSummaryDto>>> GetProducts(
        [FromQuery] ProductQueryParameters parameters,
        CancellationToken cancellationToken)
    {
        if (parameters.Page < 1)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid Page",
                Detail = "Page must be greater than or equal to 1.",
                Instance = HttpContext.Request.Path
            });
        }

        if (parameters.PageSize < 1 || parameters.PageSize > 100)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid PageSize",
                Detail = "PageSize must be between 1 and 100.",
                Instance = HttpContext.Request.Path
            });
        }

        var result = await productService.GetProductsAsync(parameters, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProductDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ProductDetailDto>> GetProductById(
        string id,
        CancellationToken cancellationToken)
    {
        ProductDetailDto? product;

        if (Guid.TryParse(id, out var guidId))
        {
            product = await productService.GetProductByIdAsync(guidId, cancellationToken);
        }
        else
        {
            product = await productService.GetProductByAmazonItemIdAsync(id, cancellationToken);
        }

        if (product == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Product Not Found",
                Detail = $"Product with identifier '{id}' was not found.",
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(product);
    }
}
