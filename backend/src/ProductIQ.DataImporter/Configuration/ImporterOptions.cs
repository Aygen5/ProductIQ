namespace ProductIQ.DataImporter.Configuration;

public class ImporterOptions
{
    public string DataDirectory { get; set; } = "data/abo";
    public string ListingsBaseUrl { get; set; } = "https://amazon-berkeley-objects.s3.amazonaws.com/listings/metadata/";
    public string ImagesBaseUrl { get; set; } = "https://amazon-berkeley-objects.s3.amazonaws.com/images/metadata/";
    public string ImageCdnBaseUrl { get; set; } = "https://amazon-berkeley-objects.s3.amazonaws.com/images/small/";
    public string ListingsFileName { get; set; } = "listings_0.json.gz";
    public string ImagesFileName { get; set; } = "images.csv.gz";
    public string TargetDomain { get; set; } = "amazon.com";
    public bool RequireMainImage { get; set; } = true;
    public string PreferredLanguage { get; set; } = "en_US";
    public int BatchSize { get; set; } = 1000;
}
