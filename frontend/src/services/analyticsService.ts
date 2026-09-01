import { apiClient } from "./apiClient";
import type {
  AnalyticsSummary,
  CatalogAnalytics,
  DuplicateAnalytics,
  RiskAnalytics,
  SearchAnalytics,
} from "../types/analytics";

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return await apiClient<AnalyticsSummary>("/analytics", {
    method: "GET",
  });
}

export async function getCatalogAnalytics(): Promise<CatalogAnalytics> {
  return await apiClient<CatalogAnalytics>("/analytics/catalog", {
    method: "GET",
  });
}

export async function getDuplicateAnalytics(): Promise<DuplicateAnalytics> {
  return await apiClient<DuplicateAnalytics>("/analytics/duplicates", {
    method: "GET",
  });
}

export async function getRiskAnalytics(): Promise<RiskAnalytics> {
  return await apiClient<RiskAnalytics>("/analytics/risk", {
    method: "GET",
  });
}

export async function getSearchAnalytics(): Promise<SearchAnalytics> {
  return await apiClient<SearchAnalytics>("/analytics/search", {
    method: "GET",
  });
}
