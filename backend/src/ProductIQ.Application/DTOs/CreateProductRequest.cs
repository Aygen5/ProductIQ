namespace ProductIQ.Application.DTOs;

using System.ComponentModel.DataAnnotations;

public class CreateProductRequest
{
    [Required]
    [StringLength(500, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    public string? AmazonItemId { get; set; }
    public string? Brand { get; set; }
    public string? Category { get; set; }
    public string? ProductType { get; set; }
    public string? ModelName { get; set; }
    public string? ModelNumber { get; set; }
    public string? Color { get; set; }
    public string? Material { get; set; }

    [Range(0, 1000000)]
    public decimal? Price { get; set; }

    public string? Currency { get; set; } = "USD";
    public string? MainImageUrl { get; set; }
    public string? Description { get; set; }
}
