namespace ProductIQ.Application.DTOs;

public class SimilaritySettingsDto
{
    public double CandidateThreshold { get; set; } = 0.50;
    public double AutoMergeThreshold { get; set; } = 0.90;
}
