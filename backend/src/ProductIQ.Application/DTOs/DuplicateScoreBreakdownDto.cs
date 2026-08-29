namespace ProductIQ.Application.DTOs;

public class DuplicateScoreBreakdownDto
{
    public decimal BrandScore { get; set; }
    public decimal CategoryScore { get; set; }
    public decimal ModelScore { get; set; }
    public decimal TextSimilarity { get; set; }
    public decimal SemanticSimilarity { get; set; }
    public decimal AttributeSimilarity { get; set; }
    public decimal? ImageSimilarity { get; set; }
    public decimal OverallScore { get; set; }
    public bool BrandMatch { get; set; }
    public bool ModelMatch { get; set; }
    public bool CategoryMatch { get; set; }
    public Dictionary<string, object> Signals { get; set; } = new();
}
