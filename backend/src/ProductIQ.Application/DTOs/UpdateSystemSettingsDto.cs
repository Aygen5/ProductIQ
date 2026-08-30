namespace ProductIQ.Application.DTOs;

public class UpdateSystemSettingsDto
{
    public SimilaritySettingsDto? Similarity { get; set; }
    public RiskSettingsDto? Risk { get; set; }
    public AiSettingsDto? Ai { get; set; }
    public NotificationSettingsDto? Notification { get; set; }
}
