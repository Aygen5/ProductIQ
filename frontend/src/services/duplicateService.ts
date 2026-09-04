import { apiClient } from "./apiClient";
import type {
  DuplicateCandidateDetail,
  DuplicateCandidatesSummary,
  DuplicateQueryParams,
  DuplicateStatus,
  PagedDuplicateResponse,
} from "../types/duplicate";

export async function fetchDuplicateCandidates(
  params: DuplicateQueryParams = {}
): Promise<PagedDuplicateResponse> {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined) {
    queryParams.append("page", params.page.toString());
  }
  if (params.pageSize !== undefined) {
    queryParams.append("pageSize", params.pageSize.toString());
  }
  if (params.minScore !== undefined) {
    queryParams.append("minScore", params.minScore.toString());
  }
  if (params.maxScore !== undefined) {
    queryParams.append("maxScore", params.maxScore.toString());
  }
  if (params.status !== undefined) {
    queryParams.append("status", params.status.toString());
  }
  if (params.brand && params.brand.trim() !== "") {
    queryParams.append("brand", params.brand.trim());
  }
  if (params.search && params.search.trim() !== "") {
    queryParams.append("search", params.search.trim());
  }
  if (params.sortBy && params.sortBy.trim() !== "") {
    queryParams.append("sortBy", params.sortBy.trim());
  }
  if (params.sortDirection) {
    queryParams.append("sortDirection", params.sortDirection);
  }

  return await apiClient<PagedDuplicateResponse>(`/duplicate-candidates?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function fetchDuplicateCandidateById(id: string): Promise<DuplicateCandidateDetail> {
  return await apiClient<DuplicateCandidateDetail>(`/duplicate-candidates/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function fetchDuplicateSummary(): Promise<DuplicateCandidatesSummary> {
  return await apiClient<DuplicateCandidatesSummary>("/duplicate-candidates/summary", {
    method: "GET",
  });
}

export async function confirmDuplicateCandidate(
  id: string,
  resolutionNotes?: string
): Promise<DuplicateCandidateDetail> {
  return await apiClient<DuplicateCandidateDetail>(`/duplicate-candidates/${encodeURIComponent(id)}/confirm`, {
    method: "PATCH",
    body: JSON.stringify({ resolutionNotes }),
  });
}

export async function rejectDuplicateCandidate(
  id: string,
  resolutionNotes?: string
): Promise<DuplicateCandidateDetail> {
  return await apiClient<DuplicateCandidateDetail>(`/duplicate-candidates/${encodeURIComponent(id)}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ resolutionNotes }),
  });
}

export async function updateCandidateStatus(
  id: string,
  status: DuplicateStatus,
  resolutionNotes?: string
): Promise<DuplicateCandidateDetail> {
  return await apiClient<DuplicateCandidateDetail>(`/duplicate-candidates/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, resolutionNotes }),
  });
}

export async function fetchCandidateRiskAssessment(id: string) {
  return await apiClient(`/duplicate-candidates/${encodeURIComponent(id)}/risk`, {
    method: "GET",
  });
}

export async function detectDuplicates(candidateThreshold?: number): Promise<{ detectedCandidatesCount: number }> {
  const queryParams = new URLSearchParams();
  if (candidateThreshold !== undefined) {
    queryParams.append("candidateThreshold", candidateThreshold.toString());
  }
  return await apiClient<{ detectedCandidatesCount: number }>(`/duplicate-candidates/detect?${queryParams.toString()}`, {
    method: "POST",
  });
}

export async function scoreDuplicateCandidates(): Promise<{ totalCandidatesScored: number; averageOverallScore: number }> {
  return await apiClient<{ totalCandidatesScored: number; averageOverallScore: number }>("/duplicate-candidates/score", {
    method: "POST",
  });
}
