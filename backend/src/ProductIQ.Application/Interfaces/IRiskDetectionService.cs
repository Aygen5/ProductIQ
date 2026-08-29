namespace ProductIQ.Application.Interfaces;

using ProductIQ.Application.DTOs;
using ProductIQ.Domain.Entities;

public interface IRiskDetectionService
{
    RiskAssessmentDto AssessCandidateRisk(Product productA, Product productB, DuplicateCandidate candidate, decimal? visualSimilarity = null);
    RiskAssessmentDto AssessCandidateRisk(DuplicateCandidateDetailDto detailDto);
    (int RiskScore, string RiskLevel) CalculateQuickRisk(DuplicateCandidate candidate, Product? productA = null, Product? productB = null);
}
