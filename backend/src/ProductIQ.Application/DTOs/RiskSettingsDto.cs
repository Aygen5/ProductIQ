namespace ProductIQ.Application.DTOs;

public class RiskSettingsDto
{
    public int CriticalThreshold { get; set; } = 75;
    public int HighThreshold { get; set; } = 50;
    public int MediumThreshold { get; set; } = 25;
    public int ImmediateReviewThreshold { get; set; } = 50;
}
