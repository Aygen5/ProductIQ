import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../services/apiClient';
import * as tokenStorage from '../../services/tokenStorage';
import { createMockJwt } from '../test-utils';

describe('apiClient Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('attaches Bearer token to request headers when token is stored', async () => {
    const mockToken = createMockJwt();
    tokenStorage.setToken(mockToken);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await apiClient<{ success: boolean }>('/products');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/products');
    expect(options.headers['Authorization']).toBe(`Bearer ${mockToken}`);
    expect(result).toEqual({ success: true });
  });

  it('omits Authorization header when no token is in storage', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await apiClient<{ success: boolean }>('/products');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Authorization']).toBeUndefined();
  });

  it('returns null on 204 No Content status', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await apiClient<void>('/items/1', { method: 'DELETE' });
    expect(result).toBeNull();
  });

  it('handles 401 Unauthorized on protected routes by removing token and dispatching window event', async () => {
    tokenStorage.setToken(createMockJwt());

    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ detail: 'Token has expired.' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(apiClient('/protected-data')).rejects.toThrow('Token has expired.');

    expect(tokenStorage.getToken()).toBeNull();
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth:unauthorized' }));
  });

  it('does not dispatch auth:unauthorized event on 401 for /auth/login', async () => {
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ detail: 'Invalid credentials.' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(apiClient('/auth/login', { method: 'POST' })).rejects.toThrow('Invalid credentials.');

    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  it('parses RFC 7807 ProblemDetails error responses with status code attached', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => JSON.stringify({
        title: 'Forbidden',
        detail: 'Admin privileges are required.',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    let caughtError: any;
    try {
      await apiClient('/admin/action');
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError).toBeDefined();
    expect(caughtError.message).toBe('Admin privileges are required.');
    expect(caughtError.status).toBe(403);
  });

  it('parses plain text error body when JSON parse fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Database connection timeout',
    });
    vi.stubGlobal('fetch', mockFetch);

    let caughtError: any;
    try {
      await apiClient('/data');
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError.message).toBe('Database connection timeout');
    expect(caughtError.status).toBe(500);
  });
});
