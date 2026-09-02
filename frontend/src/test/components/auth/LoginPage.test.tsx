import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../../../pages/Auth/LoginPage';
import * as AuthContextModule from '../../../context/AuthContext';
import { renderWithProviders } from '../../test-utils';

vi.mock('../../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('LoginPage Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isUser: false,
      isLoading: false,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
  });

  it('renders login form with email, password, and submit controls', () => {
    const { container } = renderWithProviders(<LoginPage />, { withAuth: false });

    expect(screen.getByText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByText(/^Password/i)).toBeInTheDocument();
    expect(container.querySelector('input[type="email"], input[placeholder*="productiq"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="password"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Create an account/i })).toBeInTheDocument();
    expect(screen.getByText(/Quick Demo Login/i)).toBeInTheDocument();
  });

  it('toggles password visibility when the visibility button is clicked', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<LoginPage />, { withAuth: false });

    const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleButton = container.querySelector('button[title*="password"]') as HTMLButtonElement;
    await user.click(toggleButton);

    expect(passwordInput.type).toBe('text');

    await user.click(toggleButton);

    expect(passwordInput.type).toBe('password');
  });

  it('displays client-side error when submitted with empty fields', () => {
    const { container } = renderWithProviders(<LoginPage />, { withAuth: false });

    fireEvent.submit(container.querySelector('form')!);

    expect(screen.getByText(/Please provide both email and password/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('submits credentials and invokes login on valid form completion', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      token: 'jwt.token.here',
      user: { id: '1', email: 'test@example.com', firstName: 'A', lastName: 'B', role: 'User', isActive: true, createdAt: '' },
    });

    const { container } = renderWithProviders(<LoginPage />, { withAuth: false });

    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement;

    await user.type(emailInput, 'admin@productiq.internal');
    await user.type(passwordInput, 'Admin123!*');

    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'admin@productiq.internal',
      password: 'Admin123!*',
    });
  });

  it('renders API error message when login fails', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Invalid email or password'));

    const { container } = renderWithProviders(<LoginPage />, { withAuth: false });

    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement;

    await user.type(emailInput, 'wrong@productiq.internal');
    await user.type(passwordInput, 'WrongPass123!');

    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('populates fields when Quick Login Admin button is clicked', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<LoginPage />, { withAuth: false });

    const quickAdminButton = screen.getByRole('button', { name: /System Admin/i });
    await user.click(quickAdminButton);

    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement;

    expect(emailInput.value).toBe('admin@productiq.internal');
    expect(passwordInput.value).toBe('Admin123!*');
  });
});
