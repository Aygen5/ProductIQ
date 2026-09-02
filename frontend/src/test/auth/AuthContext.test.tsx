import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import * as authService from '../../services/authService';
import * as tokenStorage from '../../services/tokenStorage';
import { createMockJwt, mockAdminUser, mockStandardUser } from '../test-utils';

vi.mock('../../services/authService');

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('throws an error if useAuth is called outside of AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
  });

  it('initializes with unauthenticated state when no token in localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isUser).toBe(false);
  });

  it('restores user session on mount when valid token exists in storage', async () => {
    const validToken = createMockJwt({ expMinutes: 60 });
    tokenStorage.setToken(validToken);
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockAdminUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockAdminUser);
    expect(result.current.token).toBe(validToken);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isUser).toBe(false);
  });

  it('clears token and remains unauthenticated on mount when token is expired', async () => {
    const expiredToken = createMockJwt({ expMinutes: -10 });
    tokenStorage.setToken(expiredToken);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(tokenStorage.getToken()).toBeNull();
  });

  it('clears session on mount if getCurrentUser fails', async () => {
    const validToken = createMockJwt({ expMinutes: 60 });
    tokenStorage.setToken(validToken);
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(tokenStorage.getToken()).toBeNull();
  });

  it('updates session correctly on successful login', async () => {
    const token = createMockJwt();
    vi.mocked(authService.login).mockResolvedValue({
      token,
      expiresAt: '2099-01-01T00:00:00Z',
      user: mockStandardUser,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login({ email: 'user@productiq.internal', password: 'Password123!' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockStandardUser);
    expect(result.current.token).toBe(token);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isUser).toBe(true);
  });

  it('updates session correctly on successful register', async () => {
    const token = createMockJwt();
    vi.mocked(authService.register).mockResolvedValue({
      token,
      expiresAt: '2099-01-01T00:00:00Z',
      user: mockStandardUser,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register({
        email: 'newuser@productiq.internal',
        password: 'Password123!',
        firstName: 'Standard',
        lastName: 'User',
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockStandardUser);
    expect(result.current.token).toBe(token);
  });

  it('clears session and invokes authService.logout on logout', async () => {
    const token = createMockJwt();
    vi.mocked(authService.login).mockResolvedValue({
      token,
      expiresAt: '2099-01-01T00:00:00Z',
      user: mockStandardUser,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login({ email: 'user@productiq.internal', password: 'Password123!' });
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('handles auth:unauthorized window event by clearing session', async () => {
    const validToken = createMockJwt();
    tokenStorage.setToken(validToken);
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockAdminUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    act(() => {
      window.dispatchEvent(new Event('auth:unauthorized'));
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });
});
