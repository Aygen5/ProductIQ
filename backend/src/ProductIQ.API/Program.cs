using Microsoft.OpenApi;
using ProductIQ.API.Middleware;
using ProductIQ.Application;
using ProductIQ.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// 1. Clean Architecture Layers DI
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// 2. Exception Handling & ProblemDetails
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// 3. Controllers & Routing
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 4. Swagger / OpenAPI Configuration
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ProductIQ API",
        Version = "v1",
        Description = "Product Intelligence & Duplicate Detection Platform API"
    });
});

// 5. CORS Configuration
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
                     ?? ["http://localhost:5173", "http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("ProductIQCorsPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// 6. Middleware Pipeline
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ProductIQ API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseCors("ProductIQCorsPolicy");
app.UseAuthorization();

app.MapControllers();

app.Run();
