import type {
  SystemSettings,
  UpdateSystemSettings,
  SimilaritySettings,
  RiskSettings,
  AiSettings,
  NotificationSettings,
} from "../types/settings";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function getSettings(): Promise<SystemSettings> {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch system settings (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function updateSettings(request: UpdateSystemSettings): Promise<SystemSettings> {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorDetail = `Status ${response.status}`;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.title || errorDetail;
    } catch {
      const rawText = await response.text();
      if (rawText) errorDetail = rawText;
    }
    throw new Error(errorDetail);
  }

  return await response.json();
}

export async function getSimilaritySettings(): Promise<SimilaritySettings> {
  const response = await fetch(`${API_BASE_URL}/settings/similarity`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch similarity settings (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function getRiskSettings(): Promise<RiskSettings> {
  const response = await fetch(`${API_BASE_URL}/settings/risk`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch risk settings (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function getAiSettings(): Promise<AiSettings> {
  const response = await fetch(`${API_BASE_URL}/settings/ai`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch AI settings (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const response = await fetch(`${API_BASE_URL}/settings/notification`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch notification settings (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function resetSettings(): Promise<SystemSettings> {
  const response = await fetch(`${API_BASE_URL}/settings/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to reset settings (${response.status}): ${errorText}`);
  }

  return await response.json();
}
