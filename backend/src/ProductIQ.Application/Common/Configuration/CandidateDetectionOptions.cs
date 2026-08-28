namespace ProductIQ.Application.Common.Configuration;

public class CandidateDetectionOptions
{
    public const string SectionName = "CandidateDetection";

    public bool EnableBrandAndCategoryRule { get; set; } = true;
    public bool EnableBrandAndProductTypeRule { get; set; } = true;
    public bool EnableModelNumberRule { get; set; } = true;
    public bool EnableBrandAndModelNameRule { get; set; } = true;
    public int BatchSize { get; set; } = 100;
}
