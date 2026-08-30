import type { SearchRequest, SearchResponse, QueryAnalysis } from "../types/search";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function searchProducts(request: SearchRequest): Promise<SearchResponse> {
  const queryParams = new URLSearchParams();

  if (request.query && request.query.trim() !== "") {
    queryParams.append("q", request.query.trim());
  }

  if (request.mode) {
    queryParams.append("mode", request.mode);
  }

  if (request.brand && request.brand.trim() !== "") {
    queryParams.append("brand", request.brand.trim());
  }

  if (request.category && request.category.trim() !== "") {
    queryParams.append("category", request.category.trim());
  }

  if (request.minScore !== undefined) {
    queryParams.append("minScore", request.minScore.toString());
  }

  if (request.page !== undefined) {
    queryParams.append("page", request.page.toString());
  }

  if (request.pageSize !== undefined) {
    queryParams.append("pageSize", request.pageSize.toString());
  }

  const response = await fetch(`${API_BASE_URL}/search?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Search request failed (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function analyzeQuery(query: string): Promise<QueryAnalysis> {
  const queryParams = new URLSearchParams();
  if (query && query.trim() !== "") {
    queryParams.append("q", query.trim());
  }

  const response = await fetch(`${API_BASE_URL}/search/analyze?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Query analysis failed (${response.status}): ${errorText}`);
  }

  return await response.json();
}
