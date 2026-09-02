import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import * as AuthContextModule from '../../context/AuthContext';
import { renderWithProviders, mockStandardUser } from '../test-utils';

vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('ProtectedRoute', () => {
  it('renders loading indicator without redirecting while auth state is loading', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isUser: false,
      isLoading: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { withAuth: false }
    );

    expect(screen.getByText('Verifying Platform Session...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders protected child component when user is authenticated', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: mockStandardUser,
      token: 'valid.mock.token',
      isAuthenticated: true,
      isAdmin: false,
      isUser: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Secret Dashboard</div>
      </ProtectedRoute>,
      { withAuth: false }
    );

    expect(screen.getByText('Protected Secret Dashboard')).toBeInTheDocument();
  });

  it('redirects unauthenticated user to /login with state', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isUser: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithProviders(
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Dashboard Page</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page Mock</div>} />
      </Routes>,
      { initialEntries: ['/dashboard'], withAuth: false }
    );

    expect(screen.getByText('Login Page Mock')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
  });
});
