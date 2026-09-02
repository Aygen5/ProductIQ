import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchPlaygroundPage } from '../../../pages/Search/SearchPlaygroundPage';
import * as searchService from '../../../services/searchService';
import * as AuthContextModule from '../../../context/AuthContext';
import { renderWithProviders, mockStandardUser } from '../../test-utils';

vi.mock('../../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

vi.mock('../../../services/searchService');

const mockSearchResponse = {
  query: 'Rivet brick rug',
  mode: 'Hybrid',
  totalCount: 1,
  page: 1,
  pageSize: 10,
  executionTimeMs: 42,
  results: [
    {
      productId: 'prod-1',
      amazonItemId: 'B001RUG',
      name: 'Rivet Modern Geometric Brick Area Rug',
      brand: 'Rivet',
      category: 'Home & Kitchen/Rugs',
      productType: 'Rug',
      modelName: null,
      modelNumber: null,
      price: 129.99,
      currency: 'USD',
      mainImageUrl: 'https://example.com/rug.jpg',
      relevanceScore: 0.945,
      relevancePercent: 95,
      keywordScore: 0.9,
      semanticScore: 0.95,
      matchedFields: ['name', 'brand'],
      explanation: 'Matches brand Rivet and rug category',
    },
  ],
  queryAnalysis: {
    rawQuery: 'Rivet brick rug',
    normalizedQuery: 'rivet brick rug',
    detectedBrand: 'Rivet',
    detectedCategory: 'Rugs',
    detectedModel: null,
    searchIntent: 'ProductSearch',
    keyTerms: ['rivet', 'brick', 'rug'],
    hasVisualAdjectives: true,
  },
};

describe('SearchPlaygroundPage Component', () => {
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

  it('renders search input with query and displays search result items', async () => {
    vi.mocked(searchService.searchProducts).mockResolvedValue(mockSearchResponse as any);

    renderWithProviders(<SearchPlaygroundPage />, { withAuth: false });

    await waitFor(() => {
      expect(screen.getByText('Rivet Modern Geometric Brick Area Rug')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Rivet').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/42ms/i)).toBeInTheDocument();
  });

  it('switches search mode between Keyword, Semantic, and Hybrid', async () => {
    const user = userEvent.setup();
    vi.mocked(searchService.searchProducts).mockResolvedValue(mockSearchResponse as any);

    renderWithProviders(<SearchPlaygroundPage />, { withAuth: false });

    await waitFor(() => {
      expect(screen.getByText('Rivet Modern Geometric Brick Area Rug')).toBeInTheDocument();
    });

    const semanticButton = screen.getByRole('button', { name: /Semantic/i });
    await user.click(semanticButton);

    expect(searchService.searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'Semantic' })
    );
  });

  it('renders error alert when search query fails', async () => {
    vi.mocked(searchService.searchProducts).mockRejectedValue(new Error('Semantic vector search unavailable'));

    renderWithProviders(<SearchPlaygroundPage />, { withAuth: false });

    await waitFor(() => {
      expect(screen.getByText(/Semantic vector search unavailable/i)).toBeInTheDocument();
    });
  });
});
