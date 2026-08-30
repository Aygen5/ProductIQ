import type {
  AnalyticsSummary,
  CatalogAnalytics,
  DuplicateAnalytics,
  RiskAnalytics,
  SearchAnalytics,
} from "../types/analytics";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const response = await fetch(`${API_BASE_URL}/analytics`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch analytics summary (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function getCatalogAnalytics(): Promise<CatalogAnalytics> {
  const response = await fetch(`${API_BASE_URL}/analytics/catalog`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch catalog analytics (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function getDuplicateAnalytics(): Promise<DuplicateAnalytics> {
  const response = await fetch(`${API_BASE_URL}/analytics/duplicates`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch duplicate analytics (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function getRiskAnalytics(): Promise<RiskAnalytics> {
  const response = await fetch(`${API_BASE_URL}/analytics/risk`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch risk analytics (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function getSearchAnalytics(): Promise<SearchAnalytics> {
  const response = await fetch(`${API_BASE_URL}/analytics/search`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch search analytics (${response.status}): ${errorText}`);
  }

  return await response.json();
}
