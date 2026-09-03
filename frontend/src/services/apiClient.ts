import { getToken, removeToken } from "./tokenStorage";

function getBaseApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.trim() === "" || envUrl === "/api") {
    return "/api";
  }
  const trimmed = envUrl.trim().replace(/\/+$/, "");
  if (trimmed.startsWith("http") && !trimmed.endsWith("/api")) {
    return `${trimmed}/api`;
  }
  return trimmed;
}

const API_BASE_URL = getBaseApiUrl();

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (API_BASE_URL.endsWith("/api") && cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = cleanEndpoint.substring(4);
  }
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (
    response.status === 401 &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/register")
  ) {
    removeToken();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const rawText = await response.text();
      if (rawText) {
        try {
          const errorJson = JSON.parse(rawText);
          errorMessage = errorJson.detail || errorJson.title || errorJson.message || errorMessage;
        } catch {
          errorMessage = rawText;
        }
      }
    } catch {}
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null as T;
  }

  return await response.json();
}
