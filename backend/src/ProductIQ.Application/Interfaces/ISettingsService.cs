namespace ProductIQ.Application.Interfaces;

using System.Threading;
using System.Threading.Tasks;
using ProductIQ.Application.DTOs;

public interface ISettingsService
{
    Task<SystemSettingsDto> GetSettingsAsync(CancellationToken cancellationToken = default);
    Task<SystemSettingsDto> UpdateSettingsAsync(UpdateSystemSettingsDto updateDto, CancellationToken cancellationToken = default);
    Task<SimilaritySettingsDto> GetSimilaritySettingsAsync(CancellationToken cancellationToken = default);
    Task<RiskSettingsDto> GetRiskSettingsAsync(CancellationToken cancellationToken = default);
    Task<AiSettingsDto> GetAiSettingsAsync(CancellationToken cancellationToken = default);
    Task<NotificationSettingsDto> GetNotificationSettingsAsync(CancellationToken cancellationToken = default);
    Task<SystemSettingsDto> ResetToDefaultsAsync(CancellationToken cancellationToken = default);
}
