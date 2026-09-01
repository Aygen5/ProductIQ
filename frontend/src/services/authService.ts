import { apiClient } from "./apiClient";
import { removeToken, setToken } from "./tokenStorage";
import type { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from "../types/auth";

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (response?.token) {
    setToken(response.token);
  }

  return response;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (response?.token) {
    setToken(response.token);
  }

  return response;
}

export async function getCurrentUser(): Promise<UserProfile> {
  return await apiClient<UserProfile>("/auth/me", {
    method: "GET",
  });
}

export function logout(): void {
  removeToken();
}
