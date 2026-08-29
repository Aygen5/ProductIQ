namespace ProductIQ.Application.Interfaces;

using System.Threading;
using System.Threading.Tasks;
using ProductIQ.Application.DTOs;

public interface IExplanationLlmService
{
    Task<CandidateAiExplanationDto> GenerateExplanationAsync(ExplanationPromptContextDto context, CancellationToken cancellationToken = default);
    Task<CandidateAiRiskExplanationDto> GenerateRiskExplanationAsync(RiskPromptContextDto context, CancellationToken cancellationToken = default);
}
