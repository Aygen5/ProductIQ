namespace ProductIQ.Application.Common.Configuration;

public class OpenAiExplanationOptions
{
    public const string SectionName = "OpenAI";

    public string? ApiKey { get; set; }
    public string Model { get; set; } = "gpt-4o-mini";
    public bool Enabled { get; set; } = true;
    public int TimeoutSeconds { get; set; } = 15;
    public int MaxRetries { get; set; } = 2;
    public double Temperature { get; set; } = 0.2;
}
