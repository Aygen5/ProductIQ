import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { DuplicateQueuePage } from '../../pages/Duplicates/DuplicateQueuePage';
import { SettingsPage } from '../../pages/Settings/SettingsPage';
import * as AuthContextModule from '../../context/AuthContext';
import * as duplicateService from '../../services/duplicateService';
import * as settingsService from '../../services/settingsService';
import { renderWithProviders, mockAdminUser, mockStandardUser } from '../test-utils';

vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

vi.mock('../../services/duplicateService');
vi.mock('../../services/settingsService');

const mockSystemSettings = {
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

describe('Role-Based Access Control UI (RBAC)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(duplicateService.fetchDuplicateCandidates).mockResolvedValue({
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    });
    vi.mocked(duplicateService.fetchDuplicateSummary).mockResolvedValue({
      totalCandidates: 0,
      scoredCandidates: 0,
      potentialCount: 0,
      confirmedCount: 0,
      rejectedCount: 0,
      highConfidenceCount: 0,
      mediumConfidenceCount: 0,
      lowConfidenceCount: 0,
      averageOverallScore: 0,
      minimumScore: 0,
      maximumScore: 0,
    });
    vi.mocked(settingsService.getSettings).mockResolvedValue(mockSystemSettings as any);
  });

  describe('Standard User Experience', () => {
    beforeEach(() => {
      vi.mocked(AuthContextModule.useAuth).mockReturnValue({
        user: mockStandardUser,
        token: 'user.mock.token',
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

    it('renders User badge in Header and Sidebar', () => {
      renderWithProviders(
        <>
          <Header />
          <Sidebar />
        </>,
        { withAuth: false }
      );

      const userBadges = screen.getAllByText(/^User$/i);
      expect(userBadges.length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText(/^Admin$/i)).not.toBeInTheDocument();
    });

    it('hides "Run Detection" action button on Duplicate Queue page for standard user', async () => {
      renderWithProviders(<DuplicateQueuePage />, { withAuth: false });

      await waitFor(() => {
        expect(screen.queryByText(/Loading duplicate candidates/i)).not.toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /Run Detection/i })).not.toBeInTheDocument();
    });

    it('renders Settings page in Read-Only mode with disabled inputs and hides Save/Reset buttons', async () => {
      renderWithProviders(<SettingsPage />, { withAuth: false });

      await waitFor(() => {
        expect(screen.getByText(/Read-Only Mode/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/Save Configuration/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Reset Defaults/i })).not.toBeInTheDocument();

      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toBeDisabled();
    });
  });

  describe('Admin Experience', () => {
    beforeEach(() => {
      vi.mocked(AuthContextModule.useAuth).mockReturnValue({
        user: mockAdminUser,
        token: 'admin.mock.token',
        isAuthenticated: true,
        isAdmin: true,
        isUser: false,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
      });
    });

    it('renders Admin badge in Header and Sidebar', () => {
      renderWithProviders(
        <>
          <Header />
          <Sidebar />
        </>,
        { withAuth: false }
      );

      const adminBadges = screen.getAllByText(/^Admin$/i);
      expect(adminBadges.length).toBeGreaterThanOrEqual(1);
    });

    it('renders "Run Detection" action button on Duplicate Queue page for admin', async () => {
      renderWithProviders(<DuplicateQueuePage />, { withAuth: false });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Run Detection/i })).toBeInTheDocument();
      });
    });

    it('renders Settings page in Admin mode with enabled inputs and renders Save/Reset buttons', async () => {
      renderWithProviders(<SettingsPage />, { withAuth: false });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reset Defaults/i })).toBeInTheDocument();
      });

      expect(screen.getByText(/Save Configuration/i)).toBeInTheDocument();
      expect(screen.queryByText(/Read-Only Mode/i)).not.toBeInTheDocument();

      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).not.toBeDisabled();
    });
  });
});
