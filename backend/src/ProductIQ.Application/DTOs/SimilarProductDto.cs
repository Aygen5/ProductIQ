namespace ProductIQ.Application.DTOs;

public class SimilarProductDto
{
    public Guid ProductId { get; set; }
    public required string AmazonItemId { get; set; }
    public required string Name { get; set; }
    public string? Brand { get; set; }
    public string? Category { get; set; }
    public string? MainImageUrl { get; set; }
    public double SimilarityScore { get; set; }
    public double CosineDistance { get; set; }
}
