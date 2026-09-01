import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as authService from "../services/authService";
import { getToken, isTokenExpired, removeToken } from "../services/tokenStorage";
import type { AuthContextType, AuthResponse, LoginRequest, RegisterRequest, UserProfile } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = useCallback(async () => {
    const existingToken = getToken();

    if (!existingToken || isTokenExpired(existingToken)) {
      removeToken();
      setUser(null);
      setTokenState(null);
      setIsLoading(false);
      return;
    }

    try {
      setTokenState(existingToken);
      const profile = await authService.getCurrentUser();
      setUser(profile);
    } catch {
      removeToken();
      setUser(null);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();

    const handleUnauthorized = () => {
      removeToken();
      setUser(null);
      setTokenState(null);
      setIsLoading(false);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [initAuth]);

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await authService.login(credentials);
    setTokenState(response.token);
    setUser(response.user);
    return response;
  };

  const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await authService.register(data);
    setTokenState(response.token);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setTokenState(null);
  };

  const refreshUser = async (): Promise<UserProfile | null> => {
    try {
      const profile = await authService.getCurrentUser();
      setUser(profile);
      return profile;
    } catch {
      logout();
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
