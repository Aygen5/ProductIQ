namespace ProductIQ.Application.DTOs;

public class EmbeddingBatchResultDto
{
    public int TotalProcessed { get; set; }
    public int NewlyGenerated { get; set; }
    public int SkippedUnchanged { get; set; }
    public int Failed { get; set; }
    public List<string> Errors { get; set; } = new();
}
