import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterPage } from '../../../pages/Auth/RegisterPage';
import * as AuthContextModule from '../../../context/AuthContext';
import { renderWithProviders } from '../../test-utils';

vi.mock('../../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('RegisterPage Component', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isUser: false,
      isLoading: false,
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
  });

  it('renders register form with inputs and link to login', () => {
    const { container } = renderWithProviders(<RegisterPage />, { withAuth: false });

    expect(screen.getByText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Work Email/i)).toBeInTheDocument();
    expect(screen.getByText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirm Password/i)).toBeInTheDocument();
    expect(container.querySelector('input[name="firstName"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="lastName"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="email"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="password"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="confirmPassword"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign in/i })).toBeInTheDocument();
  });

  it('validates password mismatch and rejects submission', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<RegisterPage />, { withAuth: false });

    await user.type(container.querySelector('input[name="firstName"]')!, 'John');
    await user.type(container.querySelector('input[name="lastName"]')!, 'Doe');
    await user.type(container.querySelector('input[name="email"]')!, 'john@example.com');
    await user.type(container.querySelector('input[name="password"]')!, 'Password123!');
    await user.type(container.querySelector('input[name="confirmPassword"]')!, 'DifferentPass123!');
    await user.click(container.querySelector('input[type="checkbox"]')!);

    await user.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(screen.getAllByText(/Passwords do not match/i).length).toBeGreaterThanOrEqual(1);
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('validates password length under 8 characters', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<RegisterPage />, { withAuth: false });

    await user.type(container.querySelector('input[name="firstName"]')!, 'John');
    await user.type(container.querySelector('input[name="lastName"]')!, 'Doe');
    await user.type(container.querySelector('input[name="email"]')!, 'john@example.com');
    await user.type(container.querySelector('input[name="password"]')!, 'Pass1!');
    await user.type(container.querySelector('input[name="confirmPassword"]')!, 'Pass1!');
    await user.click(container.querySelector('input[type="checkbox"]')!);

    await user.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('submits form and calls register on valid submission', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce({
      token: 'jwt.token.here',
      user: { id: '1', email: 'john@example.com', firstName: 'John', lastName: 'Doe', role: 'User', isActive: true, createdAt: '' },
    });

    const { container } = renderWithProviders(<RegisterPage />, { withAuth: false });

    await user.type(container.querySelector('input[name="firstName"]')!, 'John');
    await user.type(container.querySelector('input[name="lastName"]')!, 'Doe');
    await user.type(container.querySelector('input[name="email"]')!, 'john@example.com');
    await user.type(container.querySelector('input[name="password"]')!, 'Password123!');
    await user.type(container.querySelector('input[name="confirmPassword"]')!, 'Password123!');
    await user.click(container.querySelector('input[type="checkbox"]')!);

    await user.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(mockRegister).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('displays API error banner when register service rejects', async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValueOnce(new Error('User already exists with this email address'));

    const { container } = renderWithProviders(<RegisterPage />, { withAuth: false });

    await user.type(container.querySelector('input[name="firstName"]')!, 'John');
    await user.type(container.querySelector('input[name="lastName"]')!, 'Doe');
    await user.type(container.querySelector('input[name="email"]')!, 'existing@example.com');
    await user.type(container.querySelector('input[name="password"]')!, 'Password123!');
    await user.type(container.querySelector('input[name="confirmPassword"]')!, 'Password123!');
    await user.click(container.querySelector('input[type="checkbox"]')!);

    await user.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/User already exists with this email address/i)).toBeInTheDocument();
    });
  });
});
