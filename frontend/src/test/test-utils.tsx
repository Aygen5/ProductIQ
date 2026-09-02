import React from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import type { UserProfile } from '../types/auth';

export function createMockJwt(options?: {
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
  expMinutes?: number;
}): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const expSeconds = Math.floor(Date.now() / 1000) + (options?.expMinutes ?? 60) * 60;
  const payload = btoa(
    JSON.stringify({
      sub: options?.sub ?? '11111111-1111-1111-1111-111111111111',
      email: options?.email ?? 'test@productiq.internal',
      name: options?.name ?? 'Test User',
      role: options?.role ?? 'User',
      exp: expSeconds,
    })
  );
  return `${header}.${payload}.mockSignature123`;
}

export const mockAdminUser: UserProfile = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  email: 'admin@productiq.internal',
  firstName: 'Admin',
  lastName: 'User',
  role: 'Admin',
  createdAt: '2026-01-01T00:00:00Z',
};

export const mockStandardUser: UserProfile = {
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  email: 'user@productiq.internal',
  firstName: 'Standard',
  lastName: 'User',
  role: 'User',
  createdAt: '2026-01-01T00:00:00Z',
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  withAuth?: boolean;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { initialEntries = ['/'], withAuth = true, ...renderOptions } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const content = withAuth ? <AuthProvider>{children}</AuthProvider> : children;
    return <MemoryRouter initialEntries={initialEntries}>{content}</MemoryRouter>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
