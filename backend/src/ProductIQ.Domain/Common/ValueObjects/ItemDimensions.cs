namespace ProductIQ.Domain.Common.ValueObjects;

public record ItemDimensions
{
    public double? Length { get; init; }
    public double? Width { get; init; }
    public double? Height { get; init; }
    public double? Weight { get; init; }
    public string? DimensionUnit { get; init; }
    public string? WeightUnit { get; init; }

    public ItemDimensions() { }

    public ItemDimensions(double? length, double? width, double? height, double? weight, string? dimensionUnit = null, string? weightUnit = null)
    {
        Length = length;
        Width = width;
        Height = height;
        Weight = weight;
        DimensionUnit = dimensionUnit;
        WeightUnit = weightUnit;
    }
}
