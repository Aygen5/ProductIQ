import { apiClient } from "./apiClient";
import type { PagedResponse, ProductDetail, ProductQueryParams, ProductSummary } from "../types/product";

export async function fetchProducts(params: ProductQueryParams): Promise<PagedResponse<ProductSummary>> {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined) {
    queryParams.append("page", params.page.toString());
  }
  if (params.pageSize !== undefined) {
    queryParams.append("pageSize", params.pageSize.toString());
  }
  if (params.search && params.search.trim() !== "") {
    queryParams.append("search", params.search.trim());
  }
  if (params.brand && params.brand.trim() !== "") {
    queryParams.append("brand", params.brand.trim());
  }
  if (params.category && params.category.trim() !== "") {
    queryParams.append("category", params.category.trim());
  }
  if (params.productType && params.productType.trim() !== "") {
    queryParams.append("productType", params.productType.trim());
  }
  if (params.sortBy && params.sortBy.trim() !== "") {
    queryParams.append("sortBy", params.sortBy.trim());
  }
  if (params.sortDirection) {
    queryParams.append("sortDirection", params.sortDirection);
  }

  return await apiClient<PagedResponse<ProductSummary>>(`/products?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function fetchProductById(id: string): Promise<ProductDetail> {
  return await apiClient<ProductDetail>(`/products/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}
