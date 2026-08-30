namespace ProductIQ.Application.DTOs.Auth;

using System;

public class AuthResponseDto
{
    public required string Token { get; set; }
    public DateTime ExpiresAt { get; set; }
    public required UserProfileDto User { get; set; }
}
