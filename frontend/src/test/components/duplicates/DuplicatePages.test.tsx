import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DuplicateQueuePage } from '../../../pages/Duplicates/DuplicateQueuePage';
import { DuplicateDetailPage } from '../../../pages/Duplicates/DuplicateDetailPage';
import * as duplicateService from '../../../services/duplicateService';
import * as AuthContextModule from '../../../context/AuthContext';
import { renderWithProviders, mockStandardUser } from '../../test-utils';
import { Route, Routes } from 'react-router-dom';

vi.mock('../../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

vi.mock('../../../services/duplicateService');

const mockCandidateSummary = {
  id: 'cand-1',
  productAId: 'prod-1',
  productBId: 'prod-2',
  productA: {
    id: 'prod-1',
    name: 'Logitech MX Master 3S',
    brand: 'Logitech',
    amazonItemId: 'B001',
    mainImageUrl: '',
  },
  productB: {
    id: 'prod-2',
    name: 'Logitech MX Master 3S Wireless Mouse',
    brand: 'Logitech',
    amazonItemId: 'B002',
    mainImageUrl: '',
  },
  overallScore: 0.885,
  status: 'Potential' as const,
  matchSignals: JSON.stringify({
    brand_match: 1.0,
    category_match: 1.0,
    model_match: 0.9,
    text_similarity: 0.85,
    semantic_similarity: 0.88,
    attribute_similarity: 0.75,
  }),
  createdAt: '2026-01-01T00:00:00Z',
};

const mockCandidateDetail = {
  id: 'cand-1',
  overallScore: 0.885,
  status: 'Potential' as const,
  matchReason: 'High brand, model and semantic vector similarity match.',
  matchSignals: JSON.stringify({
    brand_match: 1.0,
    category_match: 1.0,
    model_match: 0.9,
    text_similarity: 0.85,
    semantic_similarity: 0.88,
    attribute_similarity: 0.75,
    image_similarity: 0.8,
  }),
  productA: {
    id: 'prod-1',
    amazonItemId: 'B001',
    name: 'Logitech MX Master 3S',
    brand: 'Logitech',
    category: 'Electronics/Mice',
    modelName: 'MX Master 3S',
    modelNumber: '910-006556',
    price: 99.99,
    currency: 'USD',
    mainImageUrl: 'https://example.com/a.jpg',
    images: [],
    attributes: [],
  },
  productB: {
    id: 'prod-2',
    amazonItemId: 'B002',
    name: 'Logitech MX Master 3S Wireless Mouse',
    brand: 'Logitech',
    category: 'Electronics/Mice',
    modelName: 'MX Master 3S',
    modelNumber: '910-006556',
    price: 99.99,
    currency: 'USD',
    mainImageUrl: 'https://example.com/b.jpg',
    images: [],
    attributes: [],
  },
  createdAt: '2026-01-01T00:00:00Z',
};

describe('Duplicate Queue & Detail Pages', () => {
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

  describe('DuplicateQueuePage', () => {
    it('renders duplicate candidate list with confidence score and products', async () => {
      vi.mocked(duplicateService.fetchDuplicateCandidates).mockResolvedValue({
        items: [mockCandidateSummary],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      } as any);

      vi.mocked(duplicateService.fetchDuplicateSummary).mockResolvedValue({
        totalCandidates: 1,
        scoredCandidates: 1,
        potentialCount: 1,
        confirmedCount: 0,
        rejectedCount: 0,
        highConfidenceCount: 1,
        mediumConfidenceCount: 0,
        lowConfidenceCount: 0,
        averageOverallScore: 0.885,
        minimumScore: 0.5,
        maximumScore: 0.95,
      });

      renderWithProviders(<DuplicateQueuePage />, { withAuth: false });

      await waitFor(() => {
        expect(screen.getByText('Logitech MX Master 3S')).toBeInTheDocument();
        expect(screen.getByText('Logitech MX Master 3S Wireless Mouse')).toBeInTheDocument();
      });

      expect(screen.getByText(/89%/)).toBeInTheDocument();
    });

    it('invokes confirmDuplicateCandidate when Confirm button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(duplicateService.fetchDuplicateCandidates).mockResolvedValue({
        items: [mockCandidateSummary],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      } as any);

      vi.mocked(duplicateService.fetchDuplicateSummary).mockResolvedValue({
        totalCandidates: 1,
        scoredCandidates: 1,
        potentialCount: 1,
        confirmedCount: 0,
        rejectedCount: 0,
        highConfidenceCount: 1,
        mediumConfidenceCount: 0,
        lowConfidenceCount: 0,
        averageOverallScore: 0.885,
        minimumScore: 0.5,
        maximumScore: 0.95,
      });

      vi.mocked(duplicateService.confirmDuplicateCandidate).mockResolvedValue({
        id: 'cand-1',
        status: 'Confirmed',
      } as any);

      renderWithProviders(<DuplicateQueuePage />, { withAuth: false });

      await waitFor(() => {
        expect(screen.getByText('Logitech MX Master 3S')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTitle('Confirm Duplicate');
      await user.click(confirmButton);

      expect(duplicateService.confirmDuplicateCandidate).toHaveBeenCalledWith('cand-1');
    });
  });

  describe('DuplicateDetailPage', () => {
    it('renders side-by-side Product A and Product B comparison', async () => {
      vi.mocked(duplicateService.fetchDuplicateCandidateById).mockResolvedValue(mockCandidateDetail as any);

      renderWithProviders(
        <Routes>
          <Route path="/duplicates/:id" element={<DuplicateDetailPage />} />
        </Routes>,
        { initialEntries: ['/duplicates/cand-1'], withAuth: false }
      );

      await waitFor(() => {
        expect(screen.getByText('Logitech MX Master 3S')).toBeInTheDocument();
        expect(screen.getByText('Logitech MX Master 3S Wireless Mouse')).toBeInTheDocument();
      });

      expect(screen.getAllByText('910-006556').length).toBe(2);
    });

    it('renders error state when candidate cannot be found', async () => {
      vi.mocked(duplicateService.fetchDuplicateCandidateById).mockRejectedValue(new Error('Candidate not found'));

      renderWithProviders(
        <Routes>
          <Route path="/duplicates/:id" element={<DuplicateDetailPage />} />
        </Routes>,
        { initialEntries: ['/duplicates/invalid-id'], withAuth: false }
      );

      await waitFor(() => {
        expect(screen.getAllByText(/Candidate not found/i).length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
