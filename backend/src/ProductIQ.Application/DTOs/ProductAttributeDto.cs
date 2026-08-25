namespace ProductIQ.Application.DTOs;

public class ProductAttributeDto
{
    public Guid Id { get; set; }
    public required string Key { get; set; }
    public required string Value { get; set; }
    public string? Language { get; set; }
}
