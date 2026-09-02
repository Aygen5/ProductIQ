import { describe, it, expect, beforeEach } from 'vitest';
import {
  getToken,
  setToken,
  removeToken,
  isTokenExpired,
} from '../../services/tokenStorage';
import { createMockJwt } from '../test-utils';

describe('tokenStorage Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores, retrieves, and removes token in localStorage', () => {
    expect(getToken()).toBeNull();

    const sampleToken = 'header.payload.signature';
    setToken(sampleToken);
    expect(getToken()).toBe(sampleToken);

    removeToken();
    expect(getToken()).toBeNull();
  });

  it('returns false for valid future JWT token', () => {
    const validToken = createMockJwt({ expMinutes: 120 });
    expect(isTokenExpired(validToken)).toBe(false);
  });

  it('returns true for expired JWT token', () => {
    const expiredToken = createMockJwt({ expMinutes: -5 });
    expect(isTokenExpired(expiredToken)).toBe(true);
  });

  it('returns true when token is invalid or corrupted', () => {
    expect(isTokenExpired('not-a-token')).toBe(true);
    expect(isTokenExpired('')).toBe(true);
    expect(isTokenExpired('invalid.jwt.token')).toBe(true);
  });
});
