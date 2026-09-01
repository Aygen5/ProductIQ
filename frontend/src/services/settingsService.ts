import { apiClient } from "./apiClient";
import type {
  SystemSettings,
  UpdateSystemSettings,
  SimilaritySettings,
  RiskSettings,
  AiSettings,
  NotificationSettings,
} from "../types/settings";

export async function getSettings(): Promise<SystemSettings> {
  return await apiClient<SystemSettings>("/settings", {
    method: "GET",
  });
}

export async function updateSettings(request: UpdateSystemSettings): Promise<SystemSettings> {
  return await apiClient<SystemSettings>("/settings", {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export async function getSimilaritySettings(): Promise<SimilaritySettings> {
  return await apiClient<SimilaritySettings>("/settings/similarity", {
    method: "GET",
  });
}

export async function getRiskSettings(): Promise<RiskSettings> {
  return await apiClient<RiskSettings>("/settings/risk", {
    method: "GET",
  });
}

export async function getAiSettings(): Promise<AiSettings> {
  return await apiClient<AiSettings>("/settings/ai", {
    method: "GET",
  });
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  return await apiClient<NotificationSettings>("/settings/notification", {
    method: "GET",
  });
}

export async function resetSettings(): Promise<SystemSettings> {
  return await apiClient<SystemSettings>("/settings/reset", {
    method: "POST",
  });
}
