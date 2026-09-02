import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { ProductCatalogPage } from '../../../pages/Products/ProductCatalogPage';
import * as productService from '../../../services/productService';
import * as AuthContextModule from '../../../context/AuthContext';
import { renderWithProviders, mockStandardUser } from '../../test-utils';

vi.mock('../../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

vi.mock('../../../services/productService');

const mockProductsResponse = {
  items: [
    {
      id: 'prod-1',
      amazonItemId: 'B001',
      name: 'Ergonomic Wireless Mouse',
      title: 'Ergonomic Wireless Mouse',
      brand: 'Logitech',
      category: 'Electronics',
      productType: 'Mouse',
      price: 49.99,
      currency: 'USD',
      itemPageUrl: 'https://example.com/1',
      mainImageUrl: 'https://example.com/1.jpg',
      riskScore: 10,
      hasEmbedding: true,
      hasImageEmbedding: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'prod-2',
      amazonItemId: 'B002',
      name: 'Mechanical Gaming Keyboard',
      title: 'Mechanical Gaming Keyboard',
      brand: 'Corsair',
      category: 'Electronics',
      productType: 'Keyboard',
      price: 89.99,
      currency: 'USD',
      itemPageUrl: 'https://example.com/2',
      mainImageUrl: 'https://example.com/2.jpg',
      riskScore: 25,
      hasEmbedding: true,
      hasImageEmbedding: false,
      createdAt: '2026-01-02T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    },
  ],
  totalCount: 2,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

describe('ProductCatalogPage Component', () => {
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

  it('renders product catalog table with products, brands, and categories', async () => {
    vi.mocked(productService.fetchProducts).mockResolvedValue(mockProductsResponse as any);

    renderWithProviders(<ProductCatalogPage />, { withAuth: false });

    await waitFor(() => {
      expect(screen.getByText('Ergonomic Wireless Mouse')).toBeInTheDocument();
      expect(screen.getByText('Mechanical Gaming Keyboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Logitech')).toBeInTheDocument();
    expect(screen.getByText('Corsair')).toBeInTheDocument();
  });

  it('renders empty state when no products are found in the catalog', async () => {
    vi.mocked(productService.fetchProducts).mockResolvedValue({
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    } as any);

    renderWithProviders(<ProductCatalogPage />, { withAuth: false });

    await waitFor(() => {
      expect(screen.getByText(/No products found/i)).toBeInTheDocument();
    });
  });

  it('renders error alert when product service call fails', async () => {
    vi.mocked(productService.fetchProducts).mockRejectedValue(new Error('Database unavailable'));

    renderWithProviders(<ProductCatalogPage />, { withAuth: false });

    await waitFor(() => {
      expect(screen.getByText(/Database unavailable/i)).toBeInTheDocument();
    });
  });
});
