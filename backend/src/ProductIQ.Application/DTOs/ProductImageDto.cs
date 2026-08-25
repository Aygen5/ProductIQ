namespace ProductIQ.Application.DTOs;

public class ProductImageDto
{
    public Guid Id { get; set; }
    public required string ImageId { get; set; }
    public string? Path { get; set; }
    public string? Url { get; set; }
    public int? Height { get; set; }
    public int? Width { get; set; }
    public bool IsMain { get; set; }
}
