namespace ProductIQ.Application.Interfaces;

using System;
using System.Threading;
using System.Threading.Tasks;
using ProductIQ.Application.DTOs.Auth;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
    Task<UserProfileDto> GetCurrentUserProfileAsync(Guid userId, CancellationToken cancellationToken = default);
}
