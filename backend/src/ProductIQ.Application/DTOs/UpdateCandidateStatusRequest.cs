namespace ProductIQ.Application.DTOs;

using ProductIQ.Domain.Enums;

public class UpdateCandidateStatusRequest
{
    public DuplicateStatus Status { get; set; }
    public string? ResolutionNotes { get; set; }
}
