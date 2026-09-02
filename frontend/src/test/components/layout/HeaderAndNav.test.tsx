import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../../../components/layout/Header';
import * as AuthContextModule from '../../../context/AuthContext';
import { renderWithProviders, mockStandardUser } from '../../test-utils';

vi.mock('../../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('Header & Navigation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: mockStandardUser,
      token: 'mock.token',
      isAuthenticated: true,
      isAdmin: false,
      isUser: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });
  });

  it('renders breadcrumbs, user info, notifications button, and help button', () => {
    renderWithProviders(<Header />, { initialEntries: ['/products'], withAuth: false });

    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText(`${mockStandardUser.firstName} ${mockStandardUser.lastName}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Help/i })).toBeInTheDocument();
  });

  it('opens and closes the Notifications dropdown when bell button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />, { withAuth: false });

    const notificationsBtn = screen.getByRole('button', { name: /Notifications/i });
    expect(screen.queryByText(/No New Notifications/i)).not.toBeInTheDocument();

    await user.click(notificationsBtn);
    expect(screen.getByText(/No New Notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/Catalog Monitor Active/i)).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText(/No New Notifications/i)).not.toBeInTheDocument();
  });

  it('opens and closes the Help modal when question mark button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />, { withAuth: false });

    const helpBtn = screen.getByRole('button', { name: /Help/i });
    expect(screen.queryByText(/ProductIQ Help & Reference/i)).not.toBeInTheDocument();

    await user.click(helpBtn);
    expect(screen.getByText(/ProductIQ Help & Reference/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close/i });
    await user.click(closeBtn);

    expect(screen.queryByText(/ProductIQ Help & Reference/i)).not.toBeInTheDocument();
  });
});
