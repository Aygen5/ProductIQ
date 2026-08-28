namespace ProductIQ.Application.Common.Configuration;

public class EmbeddingOptions
{
    public const string SectionName = "Embedding";

    public string Provider { get; set; } = "OpenAI";
    public string Model { get; set; } = "text-embedding-3-small";
    public int Dimension { get; set; } = 1536;
    public int BatchSize { get; set; } = 50;
    public int MaxRetries { get; set; } = 3;
    public string? ApiKey { get; set; }
}
