namespace ProductIQ.Application.DTOs;

public class NotificationSettingsDto
{
    public bool EnableEmailNotifications { get; set; } = false;
    public bool EnableSlackNotifications { get; set; } = false;
    public bool NotifyOnCriticalRisk { get; set; } = true;
    public bool NotifyOnHighRisk { get; set; } = true;
    public string? NotificationEmail { get; set; } = "alerts@productiq.internal";
}
