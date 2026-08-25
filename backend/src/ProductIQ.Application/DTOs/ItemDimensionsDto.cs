namespace ProductIQ.Application.DTOs;

public class ItemDimensionsDto
{
    public double? Length { get; set; }
    public double? Width { get; set; }
    public double? Height { get; set; }
    public double? Weight { get; set; }
    public string? DimensionUnit { get; set; }
    public string? WeightUnit { get; set; }
}
