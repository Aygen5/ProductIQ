namespace ProductIQ.Application.Common.Configuration;

public class DuplicateScoringOptions
{
    public const string SectionName = "DuplicateScoring";

    public decimal BrandWeight { get; set; } = 0.15m;
    public decimal CategoryWeight { get; set; } = 0.15m;
    public decimal ModelWeight { get; set; } = 0.15m;
    public decimal TextWeight { get; set; } = 0.15m;
    public decimal SemanticWeight { get; set; } = 0.15m;
    public decimal AttributeWeight { get; set; } = 0.10m;
    public decimal ImageWeight { get; set; } = 0.15m;
}
