using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ProductIQ.DataImporter.Configuration;
using ProductIQ.DataImporter.Services;

var builder = Host.CreateDefaultBuilder(args);

builder.ConfigureAppConfiguration((hostingContext, config) =>
{
    config.SetBasePath(AppContext.BaseDirectory)
          .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
          .AddEnvironmentVariables();
});

builder.ConfigureServices((hostContext, services) =>
{
    var importerOptions = hostContext.Configuration.GetSection("Importer").Get<ImporterOptions>() 
                          ?? new ImporterOptions();

    services.AddSingleton(importerOptions);
    services.AddHttpClient<IAboDownloader, AboDownloader>(client =>
    {
        client.Timeout = TimeSpan.FromMinutes(10);
    });

    services.AddSingleton<IAboImageCatalogService, AboImageCatalogService>();
    services.AddSingleton<IAboStreamingParser, AboStreamingParser>();
    services.AddSingleton<IAboImportPipeline, AboImportPipeline>();
});

var host = builder.Build();

var pipeline = host.Services.GetRequiredService<IAboImportPipeline>();
var logger = host.Services.GetRequiredService<ILogger<Program>>();

int sampleLimit = 100;
if (args.Length > 0 && int.TryParse(args[0], out var customLimit))
{
    sampleLimit = customLimit;
}

logger.LogInformation("Launching ABO Data Importer Validation with sample limit: {Limit}...", sampleLimit);
var stats = await pipeline.RunValidationAsync(sampleLimit);

logger.LogInformation("Pipeline execution finished successfully.");
