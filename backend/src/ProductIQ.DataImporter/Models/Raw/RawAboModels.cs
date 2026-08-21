using System.Text.Json.Serialization;

namespace ProductIQ.DataImporter.Models.Raw;

public class RawAboLocalizedValue
{
    [JsonPropertyName("language_tag")]
    public string? LanguageTag { get; set; }

    [JsonPropertyName("value")]
    public string? Value { get; set; }
}

public class RawAboNode
{
    [JsonPropertyName("node_id")]
    public long? NodeId { get; set; }

    [JsonPropertyName("node_name")]
    public string? NodeName { get; set; }
}

public class RawAboNormalizedValue
{
    [JsonPropertyName("unit")]
    public string? Unit { get; set; }

    [JsonPropertyName("value")]
    public double? Value { get; set; }
}

public class RawAboDimensionMetric
{
    [JsonPropertyName("normalized_value")]
    public RawAboNormalizedValue? NormalizedValue { get; set; }

    [JsonPropertyName("unit")]
    public string? Unit { get; set; }

    [JsonPropertyName("value")]
    public double? Value { get; set; }

    public double? GetBestValue() => NormalizedValue?.Value ?? Value;
    public string? GetBestUnit() => NormalizedValue?.Unit ?? Unit;
}

public class RawAboItemDimensions
{
    [JsonPropertyName("height")]
    public RawAboDimensionMetric? Height { get; set; }

    [JsonPropertyName("length")]
    public RawAboDimensionMetric? Length { get; set; }

    [JsonPropertyName("width")]
    public RawAboDimensionMetric? Width { get; set; }

    [JsonPropertyName("weight")]
    public RawAboDimensionMetric? Weight { get; set; }
}

public class RawAboListing
{
    [JsonPropertyName("item_id")]
    public string? ItemId { get; set; }

    [JsonPropertyName("brand")]
    public List<RawAboLocalizedValue>? Brand { get; set; }

    [JsonPropertyName("item_name")]
    public List<RawAboLocalizedValue>? ItemName { get; set; }

    [JsonPropertyName("bullet_point")]
    public List<RawAboLocalizedValue>? BulletPoint { get; set; }

    [JsonPropertyName("product_type")]
    public List<RawAboLocalizedValue>? ProductType { get; set; }

    [JsonPropertyName("node")]
    public List<RawAboNode>? Node { get; set; }

    [JsonPropertyName("color")]
    public List<RawAboLocalizedValue>? Color { get; set; }

    [JsonPropertyName("material")]
    public List<RawAboLocalizedValue>? Material { get; set; }

    [JsonPropertyName("model_name")]
    public List<RawAboLocalizedValue>? ModelName { get; set; }

    [JsonPropertyName("model_number")]
    public List<RawAboLocalizedValue>? ModelNumber { get; set; }

    [JsonPropertyName("item_dimensions")]
    public RawAboItemDimensions? ItemDimensions { get; set; }

    [JsonPropertyName("main_image_id")]
    public string? MainImageId { get; set; }

    [JsonPropertyName("other_image_id")]
    public List<string>? OtherImageId { get; set; }

    [JsonPropertyName("domain_name")]
    public string? DomainName { get; set; }

    [JsonPropertyName("country")]
    public string? Country { get; set; }

    public string? GetEnUsValue(List<RawAboLocalizedValue>? list, string preferredLang = "en_US")
    {
        if (list == null || list.Count == 0) return null;
        var preferred = list.FirstOrDefault(x => string.Equals(x.LanguageTag, preferredLang, StringComparison.OrdinalIgnoreCase));
        return preferred?.Value ?? list.FirstOrDefault(x => !string.IsNullOrWhiteSpace(x.Value))?.Value;
    }

    public List<string> GetAllEnUsValues(List<RawAboLocalizedValue>? list, string preferredLang = "en_US")
    {
        if (list == null || list.Count == 0) return new List<string>();
        return list.Where(x => string.Equals(x.LanguageTag, preferredLang, StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(x.Value))
                   .Select(x => x.Value!)
                   .ToList();
    }
}

public class RawAboImageRow
{
    public required string ImageId { get; set; }
    public int? Height { get; set; }
    public int? Width { get; set; }
    public required string Path { get; set; }
}
