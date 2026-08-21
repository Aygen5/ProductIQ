using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ProductIQ.DataImporter.Configuration;
using ProductIQ.DataImporter.Services;
using ProductIQ.Infrastructure.Persistence;

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

    var connectionString = hostContext.Configuration.GetConnectionString("DefaultConnection")
        ?? "Host=127.0.0.1;Port=5432;Database=productiq_db;Username=postgres;Password=postgres";

    services.AddDbContext<ProductIQDbContext>(options =>
    {
        options.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.MigrationsAssembly(typeof(ProductIQDbContext).Assembly.FullName);
        });
    });

    services.AddHttpClient<IAboDownloader, AboDownloader>(client =>
    {
        client.Timeout = TimeSpan.FromMinutes(10);
    });

    services.AddSingleton<IAboImageCatalogService, AboImageCatalogService>();
    services.AddSingleton<IAboStreamingParser, AboStreamingParser>();
    services.AddScoped<IAboDatabaseWriter, AboDatabaseWriter>();
    services.AddScoped<IAboImportPipeline, AboImportPipeline>();
});

var host = builder.Build();

using (var scope = host.Services.CreateScope())
{
    var pipeline = scope.ServiceProvider.GetRequiredService<IAboImportPipeline>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    bool isDryRun = args.Contains("--dry-run", StringComparer.OrdinalIgnoreCase);
    int limit = 100;

    for (int i = 0; i < args.Length; i++)
    {
        if (int.TryParse(args[i], out var parsedLimit))
        {
            limit = parsedLimit;
        }
    }

    if (args.Contains("--full", StringComparer.OrdinalIgnoreCase))
    {
        limit = int.MaxValue;
    }

    if (isDryRun)
    {
        logger.LogInformation("Running Dry-Run Validation (Limit: {Limit})...", limit);
        await pipeline.RunValidationAsync(limit);
    }
    else
    {
        logger.LogInformation("Running PostgreSQL Database Import (Limit: {Limit})...", limit);
        await pipeline.RunDatabaseImportAsync(limit);
    }

    logger.LogInformation("Execution finished successfully.");
}
