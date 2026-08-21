using System.IO.Compression;
using Microsoft.Extensions.Logging;
using ProductIQ.DataImporter.Configuration;
using ProductIQ.DataImporter.Models.Raw;

namespace ProductIQ.DataImporter.Services;

public interface IAboImageCatalogService
{
    Task LoadImageCatalogAsync(string imagesGzPath, CancellationToken ct = default);
    bool TryGetImage(string imageId, out RawAboImageRow? image);
    string BuildImageUrl(string path, string? cdnBaseUrl = null);
    int LoadedCount { get; }
}

public class AboImageCatalogService(ILogger<AboImageCatalogService> logger, ImporterOptions options) : IAboImageCatalogService
{
    private readonly Dictionary<string, RawAboImageRow> _catalog = new(StringComparer.Ordinal);

    public int LoadedCount => _catalog.Count;

    public async Task LoadImageCatalogAsync(string imagesGzPath, CancellationToken ct = default)
    {
        if (_catalog.Count > 0)
        {
            logger.LogInformation("Image catalog already loaded ({Count:N0} images).", _catalog.Count);
            return;
        }

        if (!File.Exists(imagesGzPath))
        {
            throw new FileNotFoundException($"Images archive not found: {imagesGzPath}");
        }

        logger.LogInformation("Streaming and parsing image catalog from: {Path}", imagesGzPath);
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        await using var fileStream = new FileStream(imagesGzPath, FileMode.Open, FileAccess.Read, FileShare.Read, 65536, true);
        await using var gzipStream = new GZipStream(fileStream, CompressionMode.Decompress);
        using var reader = new StreamReader(gzipStream);

        string? headerLine = await reader.ReadLineAsync(ct);
        if (headerLine == null)
        {
            logger.LogWarning("images.csv.gz is empty.");
            return;
        }

        while (await reader.ReadLineAsync(ct) is { } line)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;

            var parts = line.Split(',');
            if (parts.Length < 4) continue;

            var imageId = parts[0].Trim();
            int.TryParse(parts[1].Trim(), out var height);
            int.TryParse(parts[2].Trim(), out var width);
            var path = parts[3].Trim();

            _catalog[imageId] = new RawAboImageRow
            {
                ImageId = imageId,
                Height = height > 0 ? height : null,
                Width = width > 0 ? width : null,
                Path = path
            };
        }

        stopwatch.Stop();
        logger.LogInformation("Image catalog loaded {Count:N0} images in {ElapsedMs:N0} ms.", _catalog.Count, stopwatch.ElapsedMilliseconds);
    }

    public bool TryGetImage(string imageId, out RawAboImageRow? image)
    {
        return _catalog.TryGetValue(imageId, out image);
    }

    public string BuildImageUrl(string path, string? cdnBaseUrl = null)
    {
        var baseUrl = cdnBaseUrl ?? options.ImageCdnBaseUrl;
        return $"{baseUrl.TrimEnd('/')}/{path.TrimStart('/')}";
    }
}
