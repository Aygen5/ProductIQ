import type {
  DuplicateCandidateDetail,
  DuplicateCandidatesSummary,
  DuplicateQueryParams,
  PagedDuplicateResponse,
} from "../types/duplicate";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

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

  const response = await fetch(`${API_BASE_URL}/duplicate-candidates?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch duplicate candidates (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function fetchDuplicateCandidateById(id: string): Promise<DuplicateCandidateDetail> {
  const response = await fetch(`${API_BASE_URL}/duplicate-candidates/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 404) {
    const err = new Error(`Duplicate candidate with ID '${id}' was not found.`);
    (err as any).status = 404;
    throw err;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch duplicate candidate detail (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function fetchDuplicateSummary(): Promise<DuplicateCandidatesSummary> {
  const response = await fetch(`${API_BASE_URL}/duplicate-candidates/summary`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch duplicate summary (${response.status}): ${errorText}`);
  }

  return await response.json();
}
