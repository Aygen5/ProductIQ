namespace ProductIQ.Application.DTOs;

public class ImageEmbeddingBatchResultDto
{
    public int TotalProductsEvaluated { get; set; }
    public int TotalImagesEvaluated { get; set; }
    public int EmbeddingsCreated { get; set; }
    public int EmbeddingsSkipped { get; set; }
    public int FailedImages { get; set; }
    public TimeSpan ExecutionDuration { get; set; }
    public List<string> Errors { get; set; } = new();
}
