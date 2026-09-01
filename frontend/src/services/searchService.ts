import { apiClient } from "./apiClient";
import type { SearchRequest, SearchResponse, QueryAnalysis } from "../types/search";

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

  return await apiClient<SearchResponse>(`/search?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function analyzeQuery(query: string): Promise<QueryAnalysis> {
  const queryParams = new URLSearchParams();
  if (query && query.trim() !== "") {
    queryParams.append("q", query.trim());
  }

  return await apiClient<QueryAnalysis>(`/search/analyze?${queryParams.toString()}`, {
    method: "GET",
  });
}
