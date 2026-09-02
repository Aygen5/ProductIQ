import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsPage } from '../../../pages/Settings/SettingsPage';
import * as settingsService from '../../../services/settingsService';
import * as AuthContextModule from '../../../context/AuthContext';
import { renderWithProviders, mockAdminUser, mockStandardUser } from '../../test-utils';

vi.mock('../../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

vi.mock('../../../services/settingsService');

const mockSettings = {
  similarity: {
    candidateThreshold: 0.5,
    autoMergeThreshold: 0.9,
    brandWeight: 0.15,
    categoryWeight: 0.15,
    modelWeight: 0.15,
    textWeight: 0.15,
    semanticWeight: 0.15,
    attributeWeight: 0.1,
    imageWeight: 0.15,
  },
  risk: {
    criticalThreshold: 75,
    highThreshold: 50,
    mediumThreshold: 25,
    immediateReviewThreshold: 50,
  },
  ai: {
    enabled: true,
    provider: 'OpenAI',
    model: 'gpt-4o-mini',
    confidenceThreshold: 0.8,
  },
  notification: {
    emailAlerts: true,
    criticalRiskImmediate: true,
    weeklyReport: false,
    alertRecipients: 'admin@productiq.internal',
  },
};

describe('SettingsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(settingsService.getSettings).mockResolvedValue(mockSettings as any);
  });

  it('renders settings navigation tabs and similarity thresholds by default', async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: mockAdminUser,
      token: 'admin.token',
      isAuthenticated: true,
      isAdmin: true,
      isUser: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithProviders(<SettingsPage />, { withAuth: false });

    await waitFor(() => {
      expect(screen.getByText('System Settings')).toBeInTheDocument();
    });

    expect(screen.getByText('Duplicate Similarity Thresholds')).toBeInTheDocument();
    expect(screen.getByText('Risk & Safety')).toBeInTheDocument();
    expect(screen.getByText('AI Explanations')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('switches to Risk & Safety tab when clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: mockAdminUser,
      token: 'admin.token',
      isAuthenticated: true,
      isAdmin: true,
      isUser: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithProviders(<SettingsPage />, { withAuth: false });

    await waitFor(() => {
      expect(screen.getByText('Duplicate Similarity Thresholds')).toBeInTheDocument();
    });

    const riskTab = screen.getByRole('button', { name: /Risk & Safety/i });
    await user.click(riskTab);

    expect(screen.getByText(/Risk & Safety Thresholds/i)).toBeInTheDocument();
  });

  it('invokes resetSettings when Admin clicks Reset Defaults button', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: mockAdminUser,
      token: 'admin.token',
      isAuthenticated: true,
      isAdmin: true,
      isUser: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    vi.mocked(settingsService.resetSettings).mockResolvedValue(mockSettings as any);

    renderWithProviders(<SettingsPage />, { withAuth: false });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Reset Defaults/i })).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole('button', { name: /Reset Defaults/i });
    await user.click(resetBtn);

    expect(settingsService.resetSettings).toHaveBeenCalled();
  });

  it('displays Read-Only mode for standard user and disables input controls', async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: mockStandardUser,
      token: 'user.token',
      isAuthenticated: true,
      isAdmin: false,
      isUser: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithProviders(<SettingsPage />, { withAuth: false });

    await waitFor(() => {
      expect(screen.getByText(/Read-Only Mode/i)).toBeInTheDocument();
    });

    const sliders = screen.getAllByRole('slider');
    expect(sliders[0]).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Reset Defaults/i })).not.toBeInTheDocument();
  });
});
