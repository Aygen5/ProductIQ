import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { MainLayout } from '../../components/layout/MainLayout';
import { LoginPage } from '../../pages/Auth/LoginPage';
import { RegisterPage } from '../../pages/Auth/RegisterPage';
import { DashboardPage } from '../../pages/Dashboard/DashboardPage';
import { ProductCatalogPage } from '../../pages/Products/ProductCatalogPage';
import { ProductDetailPage } from '../../pages/Products/ProductDetailPage';
import { DuplicateQueuePage } from '../../pages/Duplicates/DuplicateQueuePage';
import { DuplicateDetailPage } from '../../pages/Duplicates/DuplicateDetailPage';
import { SearchPlaygroundPage } from '../../pages/Search/SearchPlaygroundPage';
import { SettingsPage } from '../../pages/Settings/SettingsPage';
import * as authService from '../../services/authService';
import * as tokenStorage from '../../services/tokenStorage';
import * as productService from '../../services/productService';
import * as duplicateService from '../../services/duplicateService';
import * as analyticsService from '../../services/analyticsService';
import * as searchService from '../../services/searchService';
import { createMockJwt, mockAdminUser, mockStandardUser } from '../test-utils';

vi.mock('../../services/authService');
vi.mock('../../services/productService');
vi.mock('../../services/duplicateService');
vi.mock('../../services/analyticsService');
vi.mock('../../services/searchService');
vi.mock('../../services/settingsService');

const sampleProductSummary = {
  id: 'prod-mx3s',
  amazonItemId: 'B001MX3S',
  name: 'Logitech MX Master 3S',
  title: 'Logitech MX Master 3S',
  brand: 'Logitech',
  category: 'Electronics/Mice',
  productType: 'Mouse',
  price: 99.99,
  currency: 'USD',
  itemPageUrl: 'https://example.com/item',
  mainImageUrl: 'https://example.com/mouse.jpg',
  riskScore: 5,
  hasEmbedding: true,
  hasImageEmbedding: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const sampleProductDetail = {
  ...sampleProductSummary,
  modelName: 'MX Master 3S',
  modelNumber: '910-006556',
  description: 'Performance wireless ergonomic mouse',
  bulletPoints: ['8K DPI sensor', 'Quiet clicks'],
  images: [],
  attributes: [
    { key: 'Color', value: 'Graphite' },
    { key: 'Connectivity', value: 'Bluetooth & Logi Bolt' },
  ],
};

const sampleCandidateSummary = {
  id: 'cand-mx3s',
  productAId: 'prod-mx3s',
  productBId: 'prod-mx3s-alt',
  productA: {
    id: 'prod-mx3s',
    name: 'Logitech MX Master 3S',
    brand: 'Logitech',
    amazonItemId: 'B001MX3S',
    mainImageUrl: '',
  },
  productB: {
    id: 'prod-mx3s-alt',
    name: 'Logitech MX Master 3S Mouse',
    brand: 'Logitech',
    amazonItemId: 'B002MX3S',
    mainImageUrl: '',
  },
  overallScore: 0.92,
  status: 'Potential' as const,
  matchSignals: JSON.stringify({ brand_match: 1.0, model_match: 1.0 }),
  createdAt: '2026-01-01T00:00:00Z',
};

const sampleCandidateDetail = {
  id: 'cand-mx3s',
  overallScore: 0.92,
  status: 'Potential' as const,
  matchReason: 'Model and brand exact match',
  matchSignals: JSON.stringify({ brand_match: 1.0, model_match: 1.0 }),
  productA: sampleProductDetail,
  productB: {
    ...sampleProductDetail,
    id: 'prod-mx3s-alt',
    name: 'Logitech MX Master 3S Mouse',
    amazonItemId: 'B002MX3S',
  },
  createdAt: '2026-01-01T00:00:00Z',
};

function renderApp(initialEntries = ['/dashboard']) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductCatalogPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/duplicates" element={<DuplicateQueuePage />} />
              <Route path="/duplicates/:id" element={<DuplicateDetailPage />} />
              <Route path="/search" element={<SearchPlaygroundPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Critical Frontend User Flows', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    vi.mocked(analyticsService.getAnalyticsSummary).mockResolvedValue({
      catalog: { totalProducts: 100, productsWithImages: 90, productsWithAttributes: 80, totalBrands: 10, totalCategories: 5 },
      duplicates: { totalCandidates: 1, pendingReviewCount: 1, confirmedCount: 0, rejectedCount: 0, autoMergedCount: 0, uniqueProductsInvolved: 2, duplicateRate: 0.02, duplicateRatePercent: 2, averageOverallScore: 0.9, minScore: 0.5, maxScore: 0.95, precision: 1, precisionPercent: 100, precisionAvailable: true, precisionExplanation: '', recall: 1, recallPercent: 100, recallAvailable: true, recallExplanation: '' },
      risk: { totalEvaluated: 100, criticalRiskCount: 0, highRiskCount: 2, mediumRiskCount: 5, lowRiskCount: 93, immediateReviewCount: 0, averageRiskScore: 10, topRiskSignals: {} },
      search: { totalSearches: 50, zeroResultSearches: 0, zeroResultRate: 0, zeroResultRatePercent: 0, averageSearchRelevance: 0.9, averageSearchRelevancePercent: 90, averageExecutionTimeMs: 25, searchRelevanceAvailable: true, zeroResultRateAvailable: true, relevanceExplanation: '', recentSearches: [] },
      generatedAt: '2026-01-01T00:00:00Z',
    });

    vi.mocked(analyticsService.getCatalogHealth).mockResolvedValue({
      period: '30D',
      currentQualityScore: 95,
      totalDuplicatesDetected: 1,
      totalProducts: 100,
      dataPoints: [],
    });

    vi.mocked(duplicateService.fetchDuplicateCandidates).mockResolvedValue({
      items: [sampleCandidateSummary as any],
      totalCount: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });

    vi.mocked(duplicateService.fetchDuplicateSummary).mockResolvedValue({
      totalCandidates: 1,
      scoredCandidates: 1,
      potentialCount: 1,
      confirmedCount: 0,
      rejectedCount: 0,
      highConfidenceCount: 1,
      mediumConfidenceCount: 0,
      lowConfidenceCount: 0,
      averageOverallScore: 0.92,
      minimumScore: 0.5,
      maximumScore: 0.95,
    });

    vi.mocked(productService.fetchProducts).mockResolvedValue({
      items: [sampleProductSummary as any],
      totalCount: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });

    vi.mocked(productService.fetchProductById).mockResolvedValue(sampleProductDetail as any);
    vi.mocked(duplicateService.fetchDuplicateCandidateById).mockResolvedValue(sampleCandidateDetail as any);
  });

  it('Flow 1: Login -> Dashboard navigation', async () => {
    const user = userEvent.setup();
    const token = createMockJwt();
    vi.mocked(authService.login).mockResolvedValue({
      token,
      expiresAt: '2099-01-01T00:00:00Z',
      user: mockStandardUser,
    });

    const { container } = render(renderApp(['/login']));

    await user.type(container.querySelector('input[name="email"]')!, 'user@productiq.internal');
    await user.type(container.querySelector('input[name="password"]')!, 'Password123!');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText('Catalog Health')).toBeInTheDocument();
    });
  });

  it('Flow 2: Products -> Product Detail navigation', async () => {
    const user = userEvent.setup();
    const token = createMockJwt();
    tokenStorage.setToken(token);
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockStandardUser);

    render(renderApp(['/products']));

    await waitFor(() => {
      expect(screen.getByText('Logitech MX Master 3S')).toBeInTheDocument();
    });

    const productRow = screen.getByText('Logitech MX Master 3S');
    await user.click(productRow);

    await waitFor(() => {
      expect(screen.getByText('Performance wireless ergonomic mouse')).toBeInTheDocument();
    });
  });

  it('Flow 3: Dashboard -> Duplicate Candidate Detail navigation', async () => {
    const user = userEvent.setup();
    const token = createMockJwt();
    tokenStorage.setToken(token);
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockStandardUser);

    render(renderApp(['/dashboard']));

    await waitFor(() => {
      expect(screen.getByText('Logitech MX Master 3S')).toBeInTheDocument();
    });

    const candidateCard = screen.getByText('Logitech MX Master 3S');
    await user.click(candidateCard);

    await waitFor(() => {
      expect(screen.getByText(/Duplicate Technical Detail/i)).toBeInTheDocument();
    });
  });

  it('Flow 4: Search -> Search Results', async () => {
    const token = createMockJwt();
    tokenStorage.setToken(token);
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockStandardUser);

    vi.mocked(searchService.searchProducts).mockResolvedValue({
      query: 'MX Master',
      mode: 'Hybrid',
      totalCount: 1,
      page: 1,
      pageSize: 10,
      executionTimeMs: 22,
      results: [
        {
          productId: 'prod-mx3s',
          amazonItemId: 'B001MX3S',
          name: 'Logitech MX Master 3S',
          brand: 'Logitech',
          category: 'Mice',
          productType: 'Mouse',
          modelName: 'MX Master 3S',
          modelNumber: '910-006556',
          price: 99.99,
          currency: 'USD',
          mainImageUrl: '',
          relevanceScore: 0.98,
          relevancePercent: 98,
          keywordScore: 0.95,
          semanticScore: 0.99,
          matchedFields: ['name'],
          explanation: 'Exact match',
        },
      ],
      queryAnalysis: {
        rawQuery: 'MX Master',
        normalizedQuery: 'mx master',
        detectedBrand: 'Logitech',
        detectedCategory: 'Mice',
        detectedModel: 'MX Master 3S',
        searchIntent: 'ProductSearch',
        keyTerms: ['mx', 'master'],
        hasVisualAdjectives: false,
      },
    });

    render(renderApp(['/search']));

    await waitFor(() => {
      expect(screen.getByText('Logitech MX Master 3S')).toBeInTheDocument();
      expect(screen.getByText(/22ms/i)).toBeInTheDocument();
    });
  });

  it('Flow 5: Admin action -> Run Detection execution', async () => {
    const user = userEvent.setup();
    const token = createMockJwt({ role: 'Admin' });
    tokenStorage.setToken(token);
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockAdminUser);

    vi.mocked(duplicateService.detectDuplicates).mockResolvedValue({
      totalScanned: 50,
      pairsCompared: 100,
      detectedCandidatesCount: 2,
      autoMerged: 0,
      executionDurationMs: 350,
    } as any);

    render(renderApp(['/duplicates']));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Run Detection/i })).toBeInTheDocument();
    });

    const runDetectionBtn = screen.getByRole('button', { name: /Run Detection/i });
    await user.click(runDetectionBtn);

    expect(duplicateService.detectDuplicates).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText(/Batch duplicate detection completed/i)).toBeInTheDocument();
    });
  });

  it('Flow 6: Logout -> Redirect to /login', async () => {
    const user = userEvent.setup();
    const token = createMockJwt();
    tokenStorage.setToken(token);
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockStandardUser);

    render(renderApp(['/dashboard']));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
    });

    const logoutBtn = screen.getByRole('button', { name: /Logout/i });
    await user.click(logoutBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });
  });

  it('Flow 7: User vs Admin -> Role-based UI presentation', async () => {
    const userToken = createMockJwt({ role: 'User' });
    tokenStorage.setToken(userToken);
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockStandardUser);

    const { unmount } = render(renderApp(['/duplicates']));

    await waitFor(() => {
      expect(screen.getByText('Duplicate Review Queue')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /Run Detection/i })).not.toBeInTheDocument();
    unmount();

    const adminToken = createMockJwt({ role: 'Admin' });
    tokenStorage.setToken(adminToken);
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockAdminUser);

    render(renderApp(['/duplicates']));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Run Detection/i })).toBeInTheDocument();
    });
  });

  it('Flow 8: Register -> Auto-login -> Dashboard navigation', async () => {
    const user = userEvent.setup();
    const token = createMockJwt();
    vi.mocked(authService.register).mockResolvedValue({
      token,
      expiresAt: '2099-01-01T00:00:00Z',
      user: mockStandardUser,
    });

    const { container } = render(renderApp(['/register']));

    await user.type(container.querySelector('input[name="firstName"]')!, 'Standard');
    await user.type(container.querySelector('input[name="lastName"]')!, 'User');
    await user.type(container.querySelector('input[name="email"]')!, 'user@productiq.internal');
    await user.type(container.querySelector('input[name="password"]')!, 'Password123!');
    await user.type(container.querySelector('input[name="confirmPassword"]')!, 'Password123!');
    await user.click(container.querySelector('input[type="checkbox"]')!);
    await user.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText('Catalog Health')).toBeInTheDocument();
    });
  });

  it('Flow 9: Protected Route Guard -> Anonymous user is redirected to /login', async () => {
    render(renderApp(['/dashboard']));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });
  });

  it('Flow 10: 401 Unauthorized event -> Forces logout and redirects to /login', async () => {
    const token = createMockJwt();
    tokenStorage.setToken(token);
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockStandardUser);

    render(renderApp(['/dashboard']));

    await waitFor(() => {
      expect(screen.getByText('Catalog Health')).toBeInTheDocument();
    });

    window.dispatchEvent(new Event('auth:unauthorized'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });
    expect(tokenStorage.getToken()).toBeNull();
  });
});
