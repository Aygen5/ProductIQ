using Microsoft.Extensions.Logging;
using ProductIQ.DataImporter.Configuration;

namespace ProductIQ.DataImporter.Services;

public interface IAboDownloader
{
    Task EnsureDatasetsDownloadedAsync(ImporterOptions options, CancellationToken ct = default);
}

public class AboDownloader(ILogger<AboDownloader> logger, HttpClient httpClient) : IAboDownloader
{
    public async Task EnsureDatasetsDownloadedAsync(ImporterOptions options, CancellationToken ct = default)
    {
        var dataDir = Path.GetFullPath(options.DataDirectory);
        if (!Directory.Exists(dataDir))
        {
            Directory.CreateDirectory(dataDir);
            logger.LogInformation("Created data directory at: {Directory}", dataDir);
        }

        var listingsUrl = $"{options.ListingsBaseUrl.TrimEnd('/')}/{options.ListingsFileName}";
        var listingsPath = Path.Combine(dataDir, options.ListingsFileName);
        await DownloadFileIfNotExistsAsync(listingsUrl, listingsPath, ct);

        var imagesUrl = $"{options.ImagesBaseUrl.TrimEnd('/')}/{options.ImagesFileName}";
        var imagesPath = Path.Combine(dataDir, options.ImagesFileName);
        await DownloadFileIfNotExistsAsync(imagesUrl, imagesPath, ct);
    }

    private async Task DownloadFileIfNotExistsAsync(string url, string localPath, CancellationToken ct)
    {
        if (File.Exists(localPath))
        {
            var fileInfo = new FileInfo(localPath);
            if (fileInfo.Length > 0)
            {
                logger.LogInformation("File already exists locally ({SizeMB:F2} MB): {Path}", fileInfo.Length / (1024.0 * 1024.0), localPath);
                return;
            }
        }

        logger.LogInformation("Downloading dataset from: {Url} -> {Path}", url, localPath);
        var tempPath = localPath + ".tmp";

        try
        {
            using var response = await httpClient.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, ct);
            response.EnsureSuccessStatusCode();

            var totalBytes = response.Content.Headers.ContentLength ?? -1;
            logger.LogInformation("Download started. Total size: {SizeMB:F2} MB", totalBytes > 0 ? totalBytes / (1024.0 * 1024.0) : 0);

            await using (var remoteStream = await response.Content.ReadAsStreamAsync(ct))
            await using (var fileStream = new FileStream(tempPath, FileMode.Create, FileAccess.Write, FileShare.None, 81920, true))
            {
                var buffer = new byte[81920];
                long totalRead = 0;
                int bytesRead;
                var lastLog = DateTime.UtcNow;

                while ((bytesRead = await remoteStream.ReadAsync(buffer.AsMemory(0, buffer.Length), ct)) > 0)
                {
                    await fileStream.WriteAsync(buffer.AsMemory(0, bytesRead), ct);
                    totalRead += bytesRead;

                    if ((DateTime.UtcNow - lastLog).TotalSeconds >= 2)
                    {
                        lastLog = DateTime.UtcNow;
                        if (totalBytes > 0)
                        {
                            var percent = (double)totalRead / totalBytes * 100.0;
                            logger.LogInformation("Downloaded {ReadMB:F2} MB / {TotalMB:F2} MB ({Percent:F1}%)",
                                totalRead / (1024.0 * 1024.0), totalBytes / (1024.0 * 1024.0), percent);
                        }
                        else
                        {
                            logger.LogInformation("Downloaded {ReadMB:F2} MB...", totalRead / (1024.0 * 1024.0));
                        }
                    }
                }
            }

            if (File.Exists(localPath))
            {
                File.Delete(localPath);
            }
            File.Move(tempPath, localPath);
            logger.LogInformation("Download completed successfully: {Path}", localPath);
        }
        catch (Exception ex)
        {
            if (File.Exists(tempPath))
            {
                try { File.Delete(tempPath); } catch { /* ignore */ }
            }
            logger.LogError(ex, "Failed to download dataset from {Url}", url);
            throw;
        }
    }
}
