namespace ProductIQ.Application.DTOs;

public class ImageSimilarityResultDto
{
    public bool IsAvailable { get; set; }
    public decimal? SimilarityScore { get; set; }
    public string StatusMessage { get; set; } = "Visual embedding analysis is scheduled for Phase 12.";
}
