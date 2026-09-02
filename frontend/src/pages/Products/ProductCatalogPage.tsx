import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../../services/productService";
import type { ProductSummary } from "../../types/product";
import { ImportDataModal } from "../../components/products/ImportDataModal";
import { NewProductModal } from "../../components/products/NewProductModal";

export const ProductCatalogPage: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProductType, setSelectedProductType] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdat");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    fetchProducts({
      page,
      pageSize,
      search: debouncedSearch,
      brand: selectedBrand,
      category: selectedCategory,
      productType: selectedProductType,
      sortBy,
      sortDirection,
    })
      .then((response) => {
        if (!isCancelled) {
          setProducts(response.items);
          setTotalCount(response.totalCount);
          setTotalPages(response.totalPages);
          setHasPreviousPage(response.hasPreviousPage);
          setHasNextPage(response.hasNextPage);
          setIsLoading(false);
        }
      })
      .catch((err: any) => {
        if (!isCancelled) {
          setError(err.message || "Failed to load products from server.");
          setProducts([]);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [page, pageSize, debouncedSearch, selectedBrand, selectedCategory, selectedProductType, sortBy, sortDirection, reloadTrigger]);

  const handleSelectAll = () => {
    if (selectedRows.length === products.length && products.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(products.map((p) => p.id));
    }
  };

  const handleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedBrand("");
    setSelectedCategory("");
    setSelectedProductType("");
    setSortBy("createdat");
    setSortDirection("desc");
    setPage(1);
  };

  const handleRetry = () => {
    setReloadTrigger((prev) => prev + 1);
  };

  const hasActiveFilters = Boolean(
    debouncedSearch || selectedBrand || selectedCategory || selectedProductType || sortBy !== "createdat"
  );

  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col w-full h-full relative" id="products-catalog-page">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-1]">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-xl mb-xl relative z-10">
        <div className="flex flex-col gap-sm">
          <h1 className="font-headline-xl text-headline-xl text-on-background m-0 p-0 leading-tight">Product Catalog</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl m-0 p-0 leading-relaxed">
            Browse, search, and inspect the unified product index from Amazon Berkeley Objects dataset.
          </p>
        </div>
        <div className="flex items-center gap-md shrink-0">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-base px-md py-sm bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md rounded-xl transition-all outline-none border border-outline-variant/30 shadow-sm focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">upload</span>
            Import Data
          </button>
          <button
            onClick={() => setIsNewProductModalOpen(true)}
            className="flex items-center gap-base px-md py-sm bg-primary hover:bg-primary-fixed text-on-primary font-label-md text-label-md rounded-xl transition-all shadow-md outline-none focus:ring-4 focus:ring-primary/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Product
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`mb-md p-md rounded-2xl border flex items-center justify-between transition-all z-10 ${
            feedback.type === "success"
              ? "bg-secondary-container/20 border-secondary/30 text-on-surface"
              : "bg-error-container/20 border-error/30 text-error"
          }`}
        >
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-[20px]">
              {feedback.type === "success" ? "check_circle" : "error"}
            </span>
            <span className="font-body-md text-body-md font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      <div className="bg-surface-container-low rounded-xl mb-md p-md shadow-sm border border-outline-variant/20 flex flex-col gap-md relative z-10">
        <div className="flex flex-col lg:flex-row gap-md">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
              search
            </span>
            <input
              className="w-full bg-surface border border-outline-variant/30 rounded-xl py-sm pl-xl pr-md font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all shadow-sm"
              placeholder="Search by product name, brand, or ASIN..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-sm">
            <select
              className="bg-surface border border-outline-variant/30 text-on-surface font-label-sm text-label-sm rounded-xl px-sm py-sm focus:outline-none focus:border-primary cursor-pointer"
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Brand: All</option>
              <option value="AmazonBasics">AmazonBasics</option>
              <option value="Rivet">Rivet</option>
              <option value="365 Everyday Value">365 Everyday Value</option>
              <option value="Stone & Beam">Stone & Beam</option>
              <option value="The Fix">The Fix</option>
            </select>

            <select
              className="bg-surface border border-outline-variant/30 text-on-surface font-label-sm text-label-sm rounded-xl px-sm py-sm focus:outline-none focus:border-primary cursor-pointer"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Category: All</option>
              <option value="Kitchen">Kitchen & Dining</option>
              <option value="Home">Home & Décor</option>
              <option value="Beverages">Beverages</option>
              <option value="Furniture">Furniture</option>
              <option value="Electronics">Electronics</option>
            </select>

            <select
              className="bg-surface border border-outline-variant/30 text-on-surface font-label-sm text-label-sm rounded-xl px-sm py-sm focus:outline-none focus:border-primary cursor-pointer"
              value={`${sortBy}:${sortDirection}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split(":");
                setSortBy(sb);
                setSortDirection(sd as "asc" | "desc");
                setPage(1);
              }}
            >
              <option value="createdat:desc">Sort: Newest First</option>
              <option value="name:asc">Sort: Name (A-Z)</option>
              <option value="name:desc">Sort: Name (Z-A)</option>
              <option value="brand:asc">Sort: Brand (A-Z)</option>
              <option value="category:asc">Sort: Category (A-Z)</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-xs pt-xs border-t border-outline-variant/10">
            <span className="font-label-sm text-label-sm text-outline mr-sm">Active Filters:</span>
            {debouncedSearch && (
              <span className="flex items-center gap-xs bg-surface-variant text-on-surface font-body-sm text-[12px] px-sm py-[2px] rounded-full border border-outline-variant/30">
                Search: {debouncedSearch}
                <button onClick={() => setSearchTerm("")} className="material-symbols-outlined text-[14px] hover:text-error">close</button>
              </span>
            )}
            {selectedBrand && (
              <span className="flex items-center gap-xs bg-surface-variant text-on-surface font-body-sm text-[12px] px-sm py-[2px] rounded-full border border-outline-variant/30">
                Brand: {selectedBrand}
                <button onClick={() => setSelectedBrand("")} className="material-symbols-outlined text-[14px] hover:text-error">close</button>
              </span>
            )}
            {selectedCategory && (
              <span className="flex items-center gap-xs bg-surface-variant text-on-surface font-body-sm text-[12px] px-sm py-[2px] rounded-full border border-outline-variant/30">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("")} className="material-symbols-outlined text-[14px] hover:text-error">close</button>
              </span>
            )}
            <button onClick={handleClearFilters} className="text-primary font-label-sm text-label-sm hover:underline ml-xs">
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="bg-surface-container rounded-xl shadow-md border border-outline-variant/20 overflow-hidden flex-1 flex flex-col relative z-10">
        <div className="px-md py-sm bg-surface-container-high border-b border-outline-variant/20 flex justify-between items-center">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {isLoading ? "Loading products..." : `Showing ${startItem}-${endItem} of ${totalCount} items`}
          </span>
          {isLoading && (
            <div className="flex items-center gap-xs text-primary font-label-sm text-label-sm">
              <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
              Fetching API
            </div>
          )}
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-surface-container-lowest sticky top-0 z-20 shadow-sm border-b border-outline-variant/30">
              <tr>
                <th className="px-md py-sm font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold w-12 text-center">
                  <input
                    className="w-4 h-4 rounded border-outline-variant/50 text-primary focus:ring-primary/50 bg-surface cursor-pointer"
                    type="checkbox"
                    checked={selectedRows.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-md py-sm font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Product</th>
                <th className="px-md py-sm font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Brand</th>
                <th className="px-md py-sm font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Category</th>
                <th className="px-md py-sm font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Product Type</th>
                <th className="px-md py-sm font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold text-right">Price</th>
                <th className="px-md py-sm w-12"></th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant/10">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-md py-md text-center">
                      <div className="w-4 h-4 bg-surface-container-highest rounded mx-auto"></div>
                    </td>
                    <td className="px-md py-md">
                      <div className="flex items-center gap-md">
                        <div className="w-12 h-12 rounded-lg bg-surface-container-highest shrink-0"></div>
                        <div className="flex flex-col gap-xs flex-1">
                          <div className="h-4 bg-surface-container-highest rounded w-3/4"></div>
                          <div className="h-3 bg-surface-container-highest rounded w-1/4"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-md py-md">
                      <div className="h-4 bg-surface-container-highest rounded w-24"></div>
                    </td>
                    <td className="px-md py-md">
                      <div className="h-4 bg-surface-container-highest rounded w-32"></div>
                    </td>
                    <td className="px-md py-md">
                      <div className="h-4 bg-surface-container-highest rounded w-20"></div>
                    </td>
                    <td className="px-md py-md text-right">
                      <div className="h-4 bg-surface-container-highest rounded w-12 ml-auto"></div>
                    </td>
                    <td className="px-md py-md"></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-md py-xl text-center">
                    <div className="flex flex-col items-center justify-center gap-md max-w-md mx-auto py-lg">
                      <span className="material-symbols-outlined text-[48px] text-error">error_outline</span>
                      <h3 className="font-title-md text-title-md text-on-surface">Failed to Load Products</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant text-center">{error}</p>
                      <button
                        onClick={handleRetry}
                        className="px-md py-xs bg-primary text-on-primary font-label-md text-label-md rounded-xl hover:bg-primary-fixed transition-colors"
                      >
                        Retry Connection
                      </button>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-md py-xl text-center">
                    <div className="flex flex-col items-center justify-center gap-md max-w-md mx-auto py-lg">
                      <span className="material-symbols-outlined text-[48px] text-outline">inventory_2</span>
                      <h3 className="font-title-md text-title-md text-on-surface">No Products Found</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
                        No products match your active search filters or dataset range. Try clearing active filters.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleClearFilters}
                          className="px-md py-xs bg-surface-container-high text-on-surface font-label-md text-label-md rounded-xl hover:bg-surface-container-highest transition-colors border border-outline-variant/30"
                        >
                          Clear Active Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isSelected = selectedRows.includes(product.id);
                  const displayCategory = product.category || product.nodePath || "Uncategorized";

                  return (
                    <tr
                      key={product.id}
                      onClick={() => navigate(`/products/${product.id}`)}
                      className={`group hover:bg-surface-container-high transition-colors cursor-pointer ${
                        isSelected ? "bg-primary/5" : "bg-surface-container"
                      }`}
                    >
                      <td className="px-md py-md text-center align-middle" onClick={(e) => handleSelectRow(product.id, e)}>
                        <input
                          className="w-4 h-4 rounded border-outline-variant/50 text-primary focus:ring-primary/50 bg-surface cursor-pointer"
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                        />
                      </td>
                      <td className="px-md py-md">
                        <div className="flex items-center gap-md">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container-highest shrink-0 border border-outline-variant/20 relative group-hover:shadow-md transition-shadow flex items-center justify-center">
                            {product.mainImageUrl ? (
                              <img
                                className="w-full h-full object-cover"
                                alt={product.name}
                                src={product.mainImageUrl}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=No+Image";
                                }}
                              />
                            ) : (
                              <span className="material-symbols-outlined text-outline text-[24px]">image</span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-label-md text-label-md text-on-surface truncate group-hover:text-primary transition-colors max-w-lg">
                              {product.name}
                            </span>
                            <div className="flex items-center gap-xs mt-xs">
                              <span className="font-body-sm text-[11px] text-outline font-mono">ASIN: {product.amazonItemId}</span>
                              <span className="w-1 h-1 rounded-full bg-outline-variant/50"></span>
                              <span className="font-body-sm text-[11px] text-outline">
                                {new Date(product.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-md py-md">
                        <span className="font-label-md text-label-md text-on-surface">
                          {product.brand || "N/A"}
                        </span>
                      </td>
                      <td className="px-md py-md max-w-xs truncate">
                        <div className="inline-flex items-center gap-xs px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant text-[12px] border border-outline-variant/30 truncate">
                          {displayCategory}
                        </div>
                      </td>
                      <td className="px-md py-md">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-sm text-[11px] border border-outline-variant/30">
                          {product.productType || "Standard"}
                        </span>
                      </td>
                      <td className="px-md py-md text-right font-label-md text-label-md text-on-surface">
                        {product.price !== null ? `$${product.price.toFixed(2)}` : "N/A"}
                      </td>
                      <td className="px-md py-md text-center" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container-highest transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-md py-sm bg-surface-container-lowest border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-md">
          <div className="flex items-center gap-sm">
            <span className="font-body-sm text-body-sm text-outline">Rows per page:</span>
            <select
              className="bg-surface border border-outline-variant/30 text-on-surface font-label-sm text-label-sm rounded px-sm py-xs focus:outline-none focus:border-primary cursor-pointer"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-center gap-md">
            <span className="font-body-sm text-body-sm text-outline">
              {totalCount === 0 ? "0 of 0" : `${startItem}-${endItem} of ${totalCount}`}
            </span>
            <div className="flex items-center gap-xs">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-md text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                disabled={!hasPreviousPage || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <span className="font-label-sm text-label-sm text-on-surface px-xs">
                {page} / {totalPages || 1}
              </span>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-md text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                disabled={!hasNextPage || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={(result) => {
          setFeedback({ type: "success", message: result.message });
          setReloadTrigger((p) => p + 1);
          setTimeout(() => setFeedback(null), 6000);
        }}
      />

      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        onSuccess={(product) => {
          setFeedback({
            type: "success",
            message: `Product "${product.name}" created successfully (ID: ${product.amazonItemId}).`,
          });
          setReloadTrigger((p) => p + 1);
          setTimeout(() => setFeedback(null), 6000);
        }}
      />
    </div>
  );
};

export default ProductCatalogPage;
