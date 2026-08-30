namespace ProductIQ.Infrastructure.Persistence;

using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Entities;
using ProductIQ.Domain.Enums;

public class UserSeeder
{
    private readonly IProductIQDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IConfiguration _configuration;
    private readonly ILogger<UserSeeder> _logger;

    public UserSeeder(
        IProductIQDbContext context,
        IPasswordHasher passwordHasher,
        IConfiguration configuration,
        ILogger<UserSeeder> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SeedDefaultUsersAsync(CancellationToken cancellationToken = default)
    {
        var adminEmail = _configuration["Auth:Seed:AdminEmail"] ?? "admin@productiq.internal";
        var adminPassword = _configuration["Auth:Seed:AdminPassword"] ?? "Admin123!*";
        var adminFirstName = _configuration["Auth:Seed:AdminFirstName"] ?? "System";
        var adminLastName = _configuration["Auth:Seed:AdminLastName"] ?? "Administrator";

        var userEmail = _configuration["Auth:Seed:UserEmail"] ?? "user@productiq.internal";
        var userPassword = _configuration["Auth:Seed:UserPassword"] ?? "User123!*";
        var userFirstName = _configuration["Auth:Seed:UserFirstName"] ?? "Platform";
        var userLastName = _configuration["Auth:Seed:UserLastName"] ?? "Operator";

        var normalizedAdminEmail = adminEmail.Trim().ToLowerInvariant();
        var normalizedUserEmail = userEmail.Trim().ToLowerInvariant();

        var existingAdmin = await _context.Users.AnyAsync(u => u.Email == normalizedAdminEmail, cancellationToken);
        if (!existingAdmin)
        {
            var adminUser = new User
            {
                Email = normalizedAdminEmail,
                PasswordHash = _passwordHasher.HashPassword(adminPassword),
                FirstName = adminFirstName,
                LastName = adminLastName,
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.Users.Add(adminUser);
            _logger.LogInformation("Seeded default Admin user: {Email}", normalizedAdminEmail);
        }

        var existingUser = await _context.Users.AnyAsync(u => u.Email == normalizedUserEmail, cancellationToken);
        if (!existingUser)
        {
            var standardUser = new User
            {
                Email = normalizedUserEmail,
                PasswordHash = _passwordHasher.HashPassword(userPassword),
                FirstName = userFirstName,
                LastName = userLastName,
                Role = UserRole.User,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.Users.Add(standardUser);
            _logger.LogInformation("Seeded default Standard user: {Email}", normalizedUserEmail);
        }

        if (!existingAdmin || !existingUser)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
