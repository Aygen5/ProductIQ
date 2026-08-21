using ProductIQ.Domain.Common.ValueObjects;

namespace ProductIQ.DataImporter.Models.Normalized;

public class NormalizedProductImport
{
    public required string AmazonItemId { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? Brand { get; set; }
    public string? Category { get; set; }
    public long? NodeId { get; set; }
    public string? NodePath { get; set; }
    public string? ProductType { get; set; }
    public string? ModelName { get; set; }
    public string? ModelNumber { get; set; }
    public string? Color { get; set; }
    public string? Material { get; set; }
    public decimal? Price { get; set; }
    public string? Currency { get; set; }
    public string? MainImageUrl { get; set; }
    public string? Country { get; set; }
    public string? DomainName { get; set; }
    public string? RawMetadata { get; set; }

    public ItemDimensions? Dimensions { get; set; }

    public List<NormalizedProductImageImport> Images { get; set; } = new();
    public List<NormalizedProductAttributeImport> Attributes { get; set; } = new();
}

public class NormalizedProductImageImport
{
    public required string ImageId { get; set; }
    public string? Path { get; set; }
    public string? Url { get; set; }
    public int? Height { get; set; }
    public int? Width { get; set; }
    public bool IsMain { get; set; }
}

public class NormalizedProductAttributeImport
{
    public required string Key { get; set; }
    public required string Value { get; set; }
    public string? Language { get; set; }
}
