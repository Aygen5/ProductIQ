namespace ProductIQ.Infrastructure.Services;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Numerics.Tensors;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using ProductIQ.Application.Common.Configuration;
using ProductIQ.Application.Interfaces;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

public class ClipImageEmbeddingService : IClipImageEmbeddingService, IDisposable
{
    private static readonly float[] Mean = [0.48145466f, 0.4578275f, 0.40821073f];
    private static readonly float[] Std = [0.26862954f, 0.26130258f, 0.27577711f];

    private readonly ClipOptions _options;
    private readonly HttpClient _httpClient;
    private readonly ILogger<ClipImageEmbeddingService> _logger;
    private readonly SemaphoreSlim _initLock = new(1, 1);

    private InferenceSession? _session;
    private string _inputName = "pixel_values";
    private string _outputName = "image_embeds";
    private bool _isInitialized;

    public ClipImageEmbeddingService(
        IOptions<ClipOptions> options,
        HttpClient httpClient,
        ILogger<ClipImageEmbeddingService> logger)
    {
        _options = options.Value;
        _httpClient = httpClient;
        _logger = logger;
    }

    private async Task EnsureInitializedAsync(CancellationToken cancellationToken)
    {
        if (_isInitialized && _session != null)
        {
            return;
        }

        await _initLock.WaitAsync(cancellationToken);
        try
        {
            if (_isInitialized && _session != null)
            {
                return;
            }

            var modelPath = _options.ModelPath;

            if (string.IsNullOrWhiteSpace(modelPath) || !File.Exists(modelPath))
            {
                var cacheDir = !string.IsNullOrWhiteSpace(_options.CacheDirectory)
                    ? _options.CacheDirectory
                    : Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".productiq", "models", "clip");

                Directory.CreateDirectory(cacheDir);
                modelPath = Path.Combine(cacheDir, "vision_model_quantized.onnx");

                if (!File.Exists(modelPath))
                {
                    _logger.LogInformation("Downloading CLIP visual ONNX model from {Url} to {Path}...", _options.ModelDownloadUrl, modelPath);
                    var tempFile = modelPath + ".tmp";
                    using (var response = await _httpClient.GetAsync(_options.ModelDownloadUrl, HttpCompletionOption.ResponseHeadersRead, cancellationToken))
                    {
                        response.EnsureSuccessStatusCode();
                        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
                        await using var fileStream = new FileStream(tempFile, FileMode.Create, FileAccess.Write, FileShare.None);
                        await stream.CopyToAsync(fileStream, cancellationToken);
                    }

                    if (File.Exists(modelPath))
                    {
                        File.Delete(modelPath);
                    }
                    File.Move(tempFile, modelPath);
                    _logger.LogInformation("CLIP visual ONNX model downloaded successfully.");
                }
            }

            var sessionOptions = new SessionOptions
            {
                GraphOptimizationLevel = GraphOptimizationLevel.ORT_ENABLE_ALL,
                ExecutionMode = ExecutionMode.ORT_SEQUENTIAL,
            };

            _session = new InferenceSession(modelPath, sessionOptions);

            _inputName = _session.InputMetadata.Keys.FirstOrDefault(k => k.Contains("pixel", StringComparison.OrdinalIgnoreCase))
                         ?? _session.InputMetadata.Keys.FirstOrDefault()
                         ?? "pixel_values";

            _outputName = _session.OutputMetadata.Keys.FirstOrDefault(k => k.Contains("embed", StringComparison.OrdinalIgnoreCase) || k.Contains("pooler", StringComparison.OrdinalIgnoreCase))
                          ?? _session.OutputMetadata.Keys.FirstOrDefault()
                          ?? "image_embeds";

            _isInitialized = true;
            _logger.LogInformation("CLIP ONNX session initialized with input '{Input}' and output '{Output}'.", _inputName, _outputName);
        }
        finally
        {
            _initLock.Release();
        }
    }

    public async Task<float[]> GenerateImageEmbeddingAsync(byte[] imageBytes, CancellationToken cancellationToken = default)
    {
        await EnsureInitializedAsync(cancellationToken);

        var tensor = PreprocessImage(imageBytes);

        var inputs = new List<NamedOnnxValue>
        {
            NamedOnnxValue.CreateFromTensor(_inputName, tensor)
        };

        using var results = _session!.Run(inputs);
        var outputTensor = results.First(r => r.Name == _outputName).AsTensor<float>();

        var vector = new float[_options.Dimension];
        for (var i = 0; i < _options.Dimension && i < outputTensor.Length; i++)
        {
            vector[i] = outputTensor.GetValue(i);
        }

        NormalizeVector(vector);
        return vector;
    }

    public async Task<float[]> GenerateImageEmbeddingFromUrlAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(_options.TimeoutSeconds));

        var imageBytes = await _httpClient.GetByteArrayAsync(imageUrl, cts.Token);
        return await GenerateImageEmbeddingAsync(imageBytes, cancellationToken);
    }

    public async Task<IReadOnlyList<float[]>> GenerateImageEmbeddingsBatchAsync(IReadOnlyList<byte[]> imageBytesList, CancellationToken cancellationToken = default)
    {
        var results = new List<float[]>(imageBytesList.Count);
        foreach (var bytes in imageBytesList)
        {
            var vector = await GenerateImageEmbeddingAsync(bytes, cancellationToken);
            results.Add(vector);
        }
        return results;
    }

    private static DenseTensor<float> PreprocessImage(byte[] imageBytes)
    {
        using var image = Image.Load<Rgb24>(imageBytes);

        image.Mutate(ctx => ctx.Resize(new ResizeOptions
        {
            Size = new Size(224, 224),
            Mode = ResizeMode.Crop,
            Sampler = KnownResamplers.Bicubic
        }));

        var tensor = new DenseTensor<float>([1, 3, 224, 224]);

        image.ProcessPixelRows(accessor =>
        {
            for (var y = 0; y < accessor.Height; y++)
            {
                var pixelRow = accessor.GetRowSpan(y);
                for (var x = 0; x < accessor.Width; x++)
                {
                    var pixel = pixelRow[x];
                    var rNorm = (pixel.R / 255.0f - Mean[0]) / Std[0];
                    var gNorm = (pixel.G / 255.0f - Mean[1]) / Std[1];
                    var bNorm = (pixel.B / 255.0f - Mean[2]) / Std[2];

                    tensor[0, 0, y, x] = rNorm;
                    tensor[0, 1, y, x] = gNorm;
                    tensor[0, 2, y, x] = bNorm;
                }
            }
        });

        return tensor;
    }

    private static void NormalizeVector(float[] vector)
    {
        var sumSquares = 0.0f;
        for (var i = 0; i < vector.Length; i++)
        {
            sumSquares += vector[i] * vector[i];
        }

        var norm = MathF.Sqrt(sumSquares);
        if (norm > 1e-12f)
        {
            for (var i = 0; i < vector.Length; i++)
            {
                vector[i] /= norm;
            }
        }
    }

    public void Dispose()
    {
        _session?.Dispose();
        _initLock.Dispose();
        GC.SuppressFinalize(this);
    }
}
