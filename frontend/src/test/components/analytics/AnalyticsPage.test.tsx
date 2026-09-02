import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnalyticsPage } from '../../../pages/Analytics/AnalyticsPage';
import { DashboardPage } from '../../../pages/Dashboard/DashboardPage';
import * as analyticsService from '../../../services/analyticsService';
import * as duplicateService from '../../../services/duplicateService';
import * as AuthContextModule from '../../../context/AuthContext';
import { renderWithProviders, mockStandardUser } from '../../test-utils';

vi.mock('../../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

vi.mock('../../../services/analyticsService');
vi.mock('../../../services/duplicateService');

const mockAnalyticsSummary = {
  catalog: {
    totalProducts: 9220,
    productsWithImages: 8500,
    productsWithAttributes: 7800,
    totalBrands: 450,
    totalCategories: 65,
  },
  duplicates: {
    totalCandidates: 250,
    pendingReviewCount: 180,
    confirmedCount: 50,
    rejectedCount: 20,
    autoMergedCount: 15,
    uniqueProductsInvolved: 400,
    duplicateRate: 0.027,
    duplicateRatePercent: 2.7,
    averageOverallScore: 0.76,
    minScore: 0.5,
    maxScore: 0.98,
    precision: 0.99,
    precisionPercent: 99.0,
    precisionAvailable: true,
    precisionExplanation: 'Evaluated on real ground truth benchmark',
    recall: 0.58,
    recallPercent: 58.0,
    recallAvailable: true,
    recallExplanation: 'Blocking rules candidate capture rate',
  },
  risk: {
    totalEvaluated: 9220,
    criticalRiskCount: 12,
    highRiskCount: 45,
    mediumRiskCount: 120,
    lowRiskCount: 9043,
    immediateReviewCount: 8,
    averageRiskScore: 14.5,
    topRiskSignals: { ConflictingBrand: 5, PriceAnomaly: 7 },
  },
  search: {
    totalSearches: 1540,
    zeroResultSearches: 32,
    zeroResultRate: 0.02,
    zeroResultRatePercent: 2.0,
    averageSearchRelevance: 0.88,
    averageSearchRelevancePercent: 88.0,
    averageExecutionTimeMs: 38.5,
    searchRelevanceAvailable: true,
    zeroResultRateAvailable: true,
    relevanceExplanation: 'Computed across hybrid queries',
    recentSearches: [],
  },
  generatedAt: '2026-01-01T00:00:00Z',
};

const mockCatalogHealth = {
  period: '30D',
  currentQualityScore: 94,
  totalDuplicatesDetected: 250,
  totalProducts: 9220,
  dataPoints: [
    { date: '2026-01-01', qualityScore: 90, duplicatesDetected: 10, totalProducts: 9100 },
    { date: '2026-01-15', qualityScore: 92, duplicatesDetected: 15, totalProducts: 9180 },
    { date: '2026-01-30', qualityScore: 94, duplicatesDetected: 8, totalProducts: 9220 },
  ],
};

describe('Analytics & Catalog Health Pages', () => {
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

    vi.mocked(analyticsService.getAnalyticsSummary).mockResolvedValue(mockAnalyticsSummary as any);
    vi.mocked(analyticsService.getCatalogHealth).mockResolvedValue(mockCatalogHealth as any);
    vi.mocked(duplicateService.fetchDuplicateCandidates).mockResolvedValue({
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 5,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    });
  });

  it('renders AnalyticsPage with catalog and duplicate metrics', async () => {
    renderWithProviders(<AnalyticsPage />, { withAuth: false });

    await waitFor(() => {
      expect(screen.getByText('Analytics & Intelligence')).toBeInTheDocument();
    });

    expect(screen.getByText('9220')).toBeInTheDocument();
    expect(screen.getByText(/2\.7/)).toBeInTheDocument();
  });

  it('renders error state on AnalyticsPage when service fails', async () => {
    vi.mocked(analyticsService.getAnalyticsSummary).mockRejectedValue(new Error('Analytics service down'));

    renderWithProviders(<AnalyticsPage />, { withAuth: false });

    await waitFor(() => {
      expect(screen.getByText(/Analytics service down/i)).toBeInTheDocument();
    });
  });

  it('renders DashboardPage with Catalog Health score and time-range toggles', async () => {
    renderWithProviders(<DashboardPage />, { withAuth: false });

    await waitFor(() => {
      expect(screen.getByText('Catalog Health')).toBeInTheDocument();
    });

    expect(screen.getByText('94% Score')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7D' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30D' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '90D' })).toBeInTheDocument();
  });

  it('switches time range on DashboardPage and calls getCatalogHealth with period', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />, { withAuth: false });

    await waitFor(() => {
      expect(screen.getByText('Catalog Health')).toBeInTheDocument();
    });

    const sevenDayBtn = screen.getByRole('button', { name: '7D' });
    await user.click(sevenDayBtn);

    expect(analyticsService.getCatalogHealth).toHaveBeenCalledWith('7D');
  });
});
