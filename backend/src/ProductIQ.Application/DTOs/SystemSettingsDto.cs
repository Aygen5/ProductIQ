namespace ProductIQ.Application.DTOs;

using System;

public class SystemSettingsDto
{
    public SimilaritySettingsDto Similarity { get; set; } = new();
    public RiskSettingsDto Risk { get; set; } = new();
    public AiSettingsDto Ai { get; set; } = new();
    public NotificationSettingsDto Notification { get; set; } = new();
    public DateTime? UpdatedAt { get; set; }
}
