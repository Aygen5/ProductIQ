namespace ProductIQ.Infrastructure.Services;

using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ProductIQ.Application.DTOs;
using ProductIQ.Application.Interfaces;
using ProductIQ.Domain.Entities;

public class SettingsService : ISettingsService
{
    private readonly IProductIQDbContext _context;
    private readonly ILogger<SettingsService> _logger;

    private static readonly SemaphoreSlim Lock = new(1, 1);
    private static volatile SystemSettingsDto? _cachedSettings;

    private const string KeySimCandidate = "Similarity.CandidateThreshold";
    private const string KeySimAutoMerge = "Similarity.AutoMergeThreshold";
    private const string KeyRiskCritical = "Risk.CriticalThreshold";
    private const string KeyRiskHigh = "Risk.HighThreshold";
    private const string KeyRiskMedium = "Risk.MediumThreshold";
    private const string KeyRiskImmediate = "Risk.ImmediateReviewThreshold";
    private const string KeyAiEnable = "Ai.EnableExplanations";
    private const string KeyAiModel = "Ai.Model";
    private const string KeyAiTemperature = "Ai.Temperature";
    private const string KeyNotifEmail = "Notification.EnableEmail";
    private const string KeyNotifSlack = "Notification.EnableSlack";
    private const string KeyNotifCritical = "Notification.NotifyOnCriticalRisk";
    private const string KeyNotifHigh = "Notification.NotifyOnHighRisk";
    private const string KeyNotifAddress = "Notification.NotificationEmail";

    public SettingsService(
        IProductIQDbContext context,
        ILogger<SettingsService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<SystemSettingsDto> GetSettingsAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedSettings != null)
        {
            return Clone(_cachedSettings);
        }

        await Lock.WaitAsync(cancellationToken);
        try
        {
            if (_cachedSettings != null)
            {
                return Clone(_cachedSettings);
            }

            var settingsList = await _context.SystemSettings.ToListAsync(cancellationToken);
            var isDirty = false;

            var settingsDict = settingsList.ToDictionary(s => s.Key, s => s);

            void EnsureSetting(string key, string defaultValue, string description, string category)
            {
                if (!settingsDict.ContainsKey(key))
                {
                    var entity = new SystemSetting
                    {
                        Key = key,
                        Value = defaultValue,
                        Description = description,
                        Category = category,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.SystemSettings.Add(entity);
                    settingsDict[key] = entity;
                    isDirty = true;
                }
            }

            EnsureSetting(KeySimCandidate, "0.50", "Minimum similarity score required to classify a pair as duplicate candidate", "Similarity");
            EnsureSetting(KeySimAutoMerge, "0.90", "Similarity score threshold above which automated merge is recommended", "Similarity");

            EnsureSetting(KeyRiskCritical, "75", "Risk score threshold for Critical danger level", "Risk");
            EnsureSetting(KeyRiskHigh, "50", "Risk score threshold for High danger level", "Risk");
            EnsureSetting(KeyRiskMedium, "25", "Risk score threshold for Medium danger level", "Risk");
            EnsureSetting(KeyRiskImmediate, "50", "Risk score threshold requiring mandatory immediate human review", "Risk");

            EnsureSetting(KeyAiEnable, "true", "Enable or disable LLM-powered natural language explanations", "AI");
            EnsureSetting(KeyAiModel, "gpt-4o-mini", "OpenAI model identifier used for explanations", "AI");
            EnsureSetting(KeyAiTemperature, "0.2", "Sampling temperature for explanation generation", "AI");

            EnsureSetting(KeyNotifEmail, "false", "Send automated email notifications on risk detection", "Notification");
            EnsureSetting(KeyNotifSlack, "false", "Send webhook notifications to Slack on risk detection", "Notification");
            EnsureSetting(KeyNotifCritical, "true", "Trigger alert on Critical risk candidates", "Notification");
            EnsureSetting(KeyNotifHigh, "true", "Trigger alert on High risk candidates", "Notification");
            EnsureSetting(KeyNotifAddress, "alerts@productiq.internal", "Destination email address for system alerts", "Notification");

            if (isDirty)
            {
                await _context.SaveChangesAsync(cancellationToken);
            }

            var dto = MapToDto(settingsDict.Values);
            _cachedSettings = dto;
            return Clone(dto);
        }
        finally
        {
            Lock.Release();
        }
    }

    public async Task<SystemSettingsDto> UpdateSettingsAsync(UpdateSystemSettingsDto updateDto, CancellationToken cancellationToken = default)
    {
        ValidateUpdate(updateDto);

        await Lock.WaitAsync(cancellationToken);
        try
        {
            var existingEntities = await _context.SystemSettings.ToListAsync(cancellationToken);
            var dict = existingEntities.ToDictionary(s => s.Key, s => s);

            void UpdateKey(string key, string value, string description, string category)
            {
                if (dict.TryGetValue(key, out var entity))
                {
                    entity.Value = value;
                    entity.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    var newEntity = new SystemSetting
                    {
                        Key = key,
                        Value = value,
                        Description = description,
                        Category = category,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.SystemSettings.Add(newEntity);
                    dict[key] = newEntity;
                }
            }

            if (updateDto.Similarity != null)
            {
                UpdateKey(KeySimCandidate, updateDto.Similarity.CandidateThreshold.ToString("F2", CultureInfo.InvariantCulture), "Minimum similarity score required to classify a pair as duplicate candidate", "Similarity");
                UpdateKey(KeySimAutoMerge, updateDto.Similarity.AutoMergeThreshold.ToString("F2", CultureInfo.InvariantCulture), "Similarity score threshold above which automated merge is recommended", "Similarity");
            }

            if (updateDto.Risk != null)
            {
                UpdateKey(KeyRiskCritical, updateDto.Risk.CriticalThreshold.ToString(), "Risk score threshold for Critical danger level", "Risk");
                UpdateKey(KeyRiskHigh, updateDto.Risk.HighThreshold.ToString(), "Risk score threshold for High danger level", "Risk");
                UpdateKey(KeyRiskMedium, updateDto.Risk.MediumThreshold.ToString(), "Risk score threshold for Medium danger level", "Risk");
                UpdateKey(KeyRiskImmediate, updateDto.Risk.ImmediateReviewThreshold.ToString(), "Risk score threshold requiring mandatory immediate human review", "Risk");
            }

            if (updateDto.Ai != null)
            {
                UpdateKey(KeyAiEnable, updateDto.Ai.EnableAiExplanations.ToString().ToLowerInvariant(), "Enable or disable LLM-powered natural language explanations", "AI");
                UpdateKey(KeyAiModel, updateDto.Ai.AiModel.Trim(), "OpenAI model identifier used for explanations", "AI");
                UpdateKey(KeyAiTemperature, updateDto.Ai.Temperature.ToString("F2", CultureInfo.InvariantCulture), "Sampling temperature for explanation generation", "AI");
            }

            if (updateDto.Notification != null)
            {
                UpdateKey(KeyNotifEmail, updateDto.Notification.EnableEmailNotifications.ToString().ToLowerInvariant(), "Send automated email notifications on risk detection", "Notification");
                UpdateKey(KeyNotifSlack, updateDto.Notification.EnableSlackNotifications.ToString().ToLowerInvariant(), "Send webhook notifications to Slack on risk detection", "Notification");
                UpdateKey(KeyNotifCritical, updateDto.Notification.NotifyOnCriticalRisk.ToString().ToLowerInvariant(), "Trigger alert on Critical risk candidates", "Notification");
                UpdateKey(KeyNotifHigh, updateDto.Notification.NotifyOnHighRisk.ToString().ToLowerInvariant(), "Trigger alert on High risk candidates", "Notification");
                UpdateKey(KeyNotifAddress, updateDto.Notification.NotificationEmail?.Trim() ?? string.Empty, "Destination email address for system alerts", "Notification");
            }

            await _context.SaveChangesAsync(cancellationToken);

            var updatedDto = MapToDto(dict.Values);
            _cachedSettings = updatedDto;
            _logger.LogInformation("System settings successfully updated in database");
            return Clone(updatedDto);
        }
        finally
        {
            Lock.Release();
        }
    }

    public async Task<SimilaritySettingsDto> GetSimilaritySettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await GetSettingsAsync(cancellationToken);
        return settings.Similarity;
    }

    public async Task<RiskSettingsDto> GetRiskSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await GetSettingsAsync(cancellationToken);
        return settings.Risk;
    }

    public async Task<AiSettingsDto> GetAiSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await GetSettingsAsync(cancellationToken);
        return settings.Ai;
    }

    public async Task<NotificationSettingsDto> GetNotificationSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await GetSettingsAsync(cancellationToken);
        return settings.Notification;
    }

    public async Task<SystemSettingsDto> ResetToDefaultsAsync(CancellationToken cancellationToken = default)
    {
        var defaultDto = new UpdateSystemSettingsDto
        {
            Similarity = new SimilaritySettingsDto
            {
                CandidateThreshold = 0.50,
                AutoMergeThreshold = 0.90
            },
            Risk = new RiskSettingsDto
            {
                CriticalThreshold = 75,
                HighThreshold = 50,
                MediumThreshold = 25,
                ImmediateReviewThreshold = 50
            },
            Ai = new AiSettingsDto
            {
                EnableAiExplanations = true,
                AiModel = "gpt-4o-mini",
                Temperature = 0.2
            },
            Notification = new NotificationSettingsDto
            {
                EnableEmailNotifications = false,
                EnableSlackNotifications = false,
                NotifyOnCriticalRisk = true,
                NotifyOnHighRisk = true,
                NotificationEmail = "alerts@productiq.internal"
            }
        };

        return await UpdateSettingsAsync(defaultDto, cancellationToken);
    }

    private static void ValidateUpdate(UpdateSystemSettingsDto updateDto)
    {
        if (updateDto.Similarity != null)
        {
            var s = updateDto.Similarity;
            if (s.CandidateThreshold < 0.0 || s.CandidateThreshold > 1.0)
            {
                throw new ArgumentException($"Candidate similarity threshold must be between 0.0 and 1.0 (received {s.CandidateThreshold}).");
            }

            if (s.AutoMergeThreshold < 0.0 || s.AutoMergeThreshold > 1.0)
            {
                throw new ArgumentException($"Auto-merge similarity threshold must be between 0.0 and 1.0 (received {s.AutoMergeThreshold}).");
            }

            if (s.AutoMergeThreshold < s.CandidateThreshold)
            {
                throw new ArgumentException($"Auto-merge threshold ({s.AutoMergeThreshold}) cannot be lower than candidate similarity threshold ({s.CandidateThreshold}).");
            }
        }

        if (updateDto.Risk != null)
        {
            var r = updateDto.Risk;
            if (r.CriticalThreshold < 1 || r.CriticalThreshold > 100)
            {
                throw new ArgumentException($"Critical risk threshold must be between 1 and 100 (received {r.CriticalThreshold}).");
            }

            if (r.HighThreshold < 1 || r.HighThreshold > 100)
            {
                throw new ArgumentException($"High risk threshold must be between 1 and 100 (received {r.HighThreshold}).");
            }

            if (r.MediumThreshold < 1 || r.MediumThreshold > 100)
            {
                throw new ArgumentException($"Medium risk threshold must be between 1 and 100 (received {r.MediumThreshold}).");
            }

            if (r.ImmediateReviewThreshold < 1 || r.ImmediateReviewThreshold > 100)
            {
                throw new ArgumentException($"Immediate review threshold must be between 1 and 100 (received {r.ImmediateReviewThreshold}).");
            }

            if (r.CriticalThreshold <= r.HighThreshold)
            {
                throw new ArgumentException($"Critical risk threshold ({r.CriticalThreshold}) must be strictly greater than High risk threshold ({r.HighThreshold}).");
            }

            if (r.HighThreshold <= r.MediumThreshold)
            {
                throw new ArgumentException($"High risk threshold ({r.HighThreshold}) must be strictly greater than Medium risk threshold ({r.MediumThreshold}).");
            }
        }

        if (updateDto.Ai != null)
        {
            var a = updateDto.Ai;
            if (string.IsNullOrWhiteSpace(a.AiModel))
            {
                throw new ArgumentException("AI model name cannot be empty.");
            }

            if (a.Temperature < 0.0 || a.Temperature > 1.0)
            {
                throw new ArgumentException($"AI temperature must be between 0.0 and 1.0 (received {a.Temperature}).");
            }
        }

        if (updateDto.Notification != null)
        {
            var n = updateDto.Notification;
            if (n.EnableEmailNotifications && !string.IsNullOrWhiteSpace(n.NotificationEmail) && !n.NotificationEmail.Contains('@'))
            {
                throw new ArgumentException("A valid email address is required when email notifications are enabled.");
            }
        }
    }

    private static SystemSettingsDto MapToDto(IEnumerable<SystemSetting> entities)
    {
        var dict = entities.ToDictionary(e => e.Key, e => e.Value);
        DateTime? latestUpdate = null;

        foreach (var e in entities)
        {
            var dt = e.UpdatedAt ?? e.CreatedAt;
            if (!latestUpdate.HasValue || dt > latestUpdate.Value)
            {
                latestUpdate = dt;
            }
        }

        double ParseDouble(string key, double fallback)
        {
            return dict.TryGetValue(key, out var val) && double.TryParse(val, NumberStyles.Any, CultureInfo.InvariantCulture, out var parsed) ? parsed : fallback;
        }

        int ParseInt(string key, int fallback)
        {
            return dict.TryGetValue(key, out var val) && int.TryParse(val, out var parsed) ? parsed : fallback;
        }

        bool ParseBool(string key, bool fallback)
        {
            return dict.TryGetValue(key, out var val) && bool.TryParse(val, out var parsed) ? parsed : fallback;
        }

        string ParseString(string key, string fallback)
        {
            return dict.TryGetValue(key, out var val) && !string.IsNullOrWhiteSpace(val) ? val : fallback;
        }

        return new SystemSettingsDto
        {
            Similarity = new SimilaritySettingsDto
            {
                CandidateThreshold = ParseDouble(KeySimCandidate, 0.50),
                AutoMergeThreshold = ParseDouble(KeySimAutoMerge, 0.90)
            },
            Risk = new RiskSettingsDto
            {
                CriticalThreshold = ParseInt(KeyRiskCritical, 75),
                HighThreshold = ParseInt(KeyRiskHigh, 50),
                MediumThreshold = ParseInt(KeyRiskMedium, 25),
                ImmediateReviewThreshold = ParseInt(KeyRiskImmediate, 50)
            },
            Ai = new AiSettingsDto
            {
                EnableAiExplanations = ParseBool(KeyAiEnable, true),
                AiModel = ParseString(KeyAiModel, "gpt-4o-mini"),
                Temperature = ParseDouble(KeyAiTemperature, 0.2)
            },
            Notification = new NotificationSettingsDto
            {
                EnableEmailNotifications = ParseBool(KeyNotifEmail, false),
                EnableSlackNotifications = ParseBool(KeyNotifSlack, false),
                NotifyOnCriticalRisk = ParseBool(KeyNotifCritical, true),
                NotifyOnHighRisk = ParseBool(KeyNotifHigh, true),
                NotificationEmail = ParseString(KeyNotifAddress, "alerts@productiq.internal")
            },
            UpdatedAt = latestUpdate
        };
    }

    private static SystemSettingsDto Clone(SystemSettingsDto src)
    {
        return new SystemSettingsDto
        {
            Similarity = new SimilaritySettingsDto
            {
                CandidateThreshold = src.Similarity.CandidateThreshold,
                AutoMergeThreshold = src.Similarity.AutoMergeThreshold
            },
            Risk = new RiskSettingsDto
            {
                CriticalThreshold = src.Risk.CriticalThreshold,
                HighThreshold = src.Risk.HighThreshold,
                MediumThreshold = src.Risk.MediumThreshold,
                ImmediateReviewThreshold = src.Risk.ImmediateReviewThreshold
            },
            Ai = new AiSettingsDto
            {
                EnableAiExplanations = src.Ai.EnableAiExplanations,
                AiModel = src.Ai.AiModel,
                Temperature = src.Ai.Temperature
            },
            Notification = new NotificationSettingsDto
            {
                EnableEmailNotifications = src.Notification.EnableEmailNotifications,
                EnableSlackNotifications = src.Notification.EnableSlackNotifications,
                NotifyOnCriticalRisk = src.Notification.NotifyOnCriticalRisk,
                NotifyOnHighRisk = src.Notification.NotifyOnHighRisk,
                NotificationEmail = src.Notification.NotificationEmail
            },
            UpdatedAt = src.UpdatedAt
        };
    }
}
