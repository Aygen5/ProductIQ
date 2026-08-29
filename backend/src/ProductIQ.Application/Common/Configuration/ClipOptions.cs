namespace ProductIQ.Application.Common.Configuration;

public class ClipOptions
{
    public const string SectionName = "Clip";

    public string ModelName { get; set; } = "clip-vit-base-patch32";
    public int Dimension { get; set; } = 512;
    public string ModelPath { get; set; } = string.Empty;
    public string ModelDownloadUrl { get; set; } = "https://huggingface.co/Xenova/clip-vit-base-patch32/resolve/main/onnx/vision_model_quantized.onnx";
    public string CacheDirectory { get; set; } = string.Empty;
    public int BatchSize { get; set; } = 20;
    public int TimeoutSeconds { get; set; } = 20;
    public int MaxDegreeOfParallelism { get; set; } = 4;
}
