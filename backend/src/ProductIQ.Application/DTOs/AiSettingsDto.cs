namespace ProductIQ.Application.DTOs;

public class AiSettingsDto
{
    public bool EnableAiExplanations { get; set; } = true;
    public string AiModel { get; set; } = "gpt-4o-mini";
    public double Temperature { get; set; } = 0.2;
}
