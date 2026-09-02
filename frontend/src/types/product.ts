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

export interface ProductImage {
  id: string;
  imageId: string;
  path: string | null;
  url: string | null;
  height: number | null;
  width: number | null;
  isMain: boolean;
}

export interface ProductAttribute {
  id: string;
  key: string;
  value: string;
  language: string | null;
}

export interface ItemDimensions {
  length: number | null;
  width: number | null;
  height: number | null;
  weight: number | null;
  dimensionUnit: string | null;
  weightUnit: string | null;
}

export interface ProductDetail {
  id: string;
  amazonItemId: string;
  name: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  nodeId: number | null;
  nodePath: string | null;
  productType: string | null;
  modelName: string | null;
  modelNumber: string | null;
  color: string | null;
  material: string | null;
  dimensions: ItemDimensions | null;
  price: number | null;
  currency: string | null;
  mainImageUrl: string | null;
  country: string | null;
  domainName: string | null;
  images: ProductImage[];
  attributes: ProductAttribute[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateProductPayload {
  name: string;
  amazonItemId?: string;
  brand?: string;
  category?: string;
  productType?: string;
  modelName?: string;
  modelNumber?: string;
  color?: string;
  material?: string;
  price?: number;
  currency?: string;
  mainImageUrl?: string;
  description?: string;
}

export interface ProductImportResult {
  success: boolean;
  importedCount: number;
  updatedCount: number;
  totalProductsNow: number;
  executionTimeMs: number;
  message: string;
}
