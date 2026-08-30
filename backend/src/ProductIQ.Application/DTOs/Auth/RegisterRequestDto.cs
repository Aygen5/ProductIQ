namespace ProductIQ.Application.DTOs.Auth;

using System.ComponentModel.DataAnnotations;

public class RegisterRequestDto
{
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public required string Email { get; set; }

    [Required]
    [MinLength(8)]
    [MaxLength(128)]
    public required string Password { get; set; }

    [Required]
    [MaxLength(100)]
    public required string FirstName { get; set; }

    [Required]
    [MaxLength(100)]
    public required string LastName { get; set; }
}
