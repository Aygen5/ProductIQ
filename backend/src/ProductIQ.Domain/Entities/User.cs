namespace ProductIQ.Domain.Entities;

using System;
using ProductIQ.Domain.Common;
using ProductIQ.Domain.Enums;

public class User : BaseEntity
{
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
}
