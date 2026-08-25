export interface ProductSummary {
  id: string;
  amazonItemId: string;
  name: string;
  brand: string | null;
  category: string | null;
  nodePath: string | null;
  productType: string | null;
  mainImageUrl: string | null;
  price: number | null;
  currency: string | null;
  createdAt: string;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ProductQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  brand?: string;
  category?: string;
  productType?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}
