import type { PagedResponse, ProductQueryParams, ProductSummary } from "../types/product";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

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

  const response = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch products (${response.status}): ${errorText}`);
  }

  return await response.json();
}
