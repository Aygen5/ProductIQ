import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProductById } from "../../services/productService";
import type { ProductDetail } from "../../types/product";

export const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [showReasoning, setShowReasoning] = useState<boolean>(false);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  useEffect(() => {
    if (!id) return;

    let isCancelled = false;

    fetchProductById(id)
      .then((data) => {
        if (!isCancelled) {
          setProduct(data);
          setIsLoading(false);
          setActiveImageIndex(0);
        }
      })
      .catch((err: any) => {
        if (!isCancelled) {
          if (err.status === 404) {
            setIsNotFound(true);
          } else {
            setError(err.message || "Failed to load product detail.");
          }
          setProduct(null);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [id, reloadTrigger]);

  const handleRetry = () => {
    setIsLoading(true);
    setIsNotFound(false);
    setError(null);
    setReloadTrigger((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col w-full gap-lg animate-pulse" id="product-detail-loading">
        <div className="flex flex-col gap-xs">
          <div className="h-4 bg-surface-container-highest rounded w-48 mb-xs"></div>
          <div className="h-8 bg-surface-container-highest rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <div className="col-span-1 md:col-span-4 bg-surface-container rounded-xl h-96"></div>
          <div className="col-span-1 md:col-span-4 bg-surface-container rounded-xl h-96 p-md flex flex-col gap-md">
            <div className="h-4 bg-surface-container-highest rounded w-1/3"></div>
            <div className="h-4 bg-surface-container-highest rounded w-full"></div>
            <div className="h-4 bg-surface-container-highest rounded w-full"></div>
            <div className="h-4 bg-surface-container-highest rounded w-full"></div>
          </div>
          <div className="col-span-1 md:col-span-4 bg-surface-container rounded-xl h-96"></div>
        </div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-xl text-center" id="product-not-found">
        <div className="bg-surface-container rounded-2xl p-xl max-w-lg border border-outline-variant/30 flex flex-col items-center gap-md shadow-md">
          <span className="material-symbols-outlined text-[64px] text-outline">search_off</span>
          <h2 className="font-headline-md text-headline-md text-on-surface m-0">Product Not Found</h2>
          <p className="font-body-md text-body-md text-on-surface-variant m-0">
            Product with identifier <span className="font-mono text-primary font-semibold">{id}</span> could not be found in the ABO database.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="mt-sm px-md py-sm bg-primary text-on-primary font-label-md text-label-md rounded-xl hover:bg-primary-fixed transition-colors shadow-sm cursor-pointer"
          >
            Back to Product Catalog
          </button>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-xl text-center" id="product-detail-error">
        <div className="bg-surface-container rounded-2xl p-xl max-w-lg border border-error/30 flex flex-col items-center gap-md shadow-md">
          <span className="material-symbols-outlined text-[64px] text-error">error_outline</span>
          <h2 className="font-headline-md text-headline-md text-on-surface m-0">Failed to Load Product</h2>
          <p className="font-body-md text-body-sm text-on-surface-variant m-0">{error || "An unexpected error occurred."}</p>
          <div className="flex items-center gap-md mt-sm">
            <button
              onClick={handleRetry}
              className="px-md py-sm bg-primary text-on-primary font-label-md text-label-md rounded-xl hover:bg-primary-fixed transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
            <button
              onClick={() => navigate("/products")}
              className="px-md py-sm bg-surface-container-high text-on-surface font-label-md text-label-md rounded-xl hover:bg-surface-container-highest transition-colors border border-outline-variant/30 cursor-pointer"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const imagesList = product.images.length > 0
    ? product.images
    : product.mainImageUrl
      ? [{ id: "main", imageId: "main", url: product.mainImageUrl, isMain: true, path: null, height: null, width: null }]
      : [];

  const currentImage = imagesList[activeImageIndex]?.url || product.mainImageUrl;
  const displayCategory = product.category || product.nodePath || "Uncategorized";

  return (
    <div className="flex flex-col w-full" id="product-detail-page">
      <div className="flex flex-col gap-lg mb-lg">
        <div className="flex flex-col gap-sm relative group overflow-hidden">
          <div className="flex items-center gap-xs font-label-sm text-label-sm text-outline uppercase tracking-[0.1em] mb-xs">
            <span onClick={() => navigate("/products")} className="hover:text-on-background transition-colors cursor-pointer">
              Products
            </span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            <span className="text-primary font-bold">{product.amazonItemId}</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-background m-0 leading-tight">{product.name}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <div className="col-span-1 md:col-span-4 bg-surface-container rounded-xl overflow-hidden shadow-sm relative group h-96 flex flex-col">
            <div className="relative w-full h-80 bg-surface-container-highest flex items-center justify-center overflow-hidden">
              {currentImage ? (
                <img
                  className="w-full h-full object-contain p-sm transition-transform duration-700 group-hover:scale-105"
                  alt={product.name}
                  src={currentImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=No+Image";
                  }}
                />
              ) : (
                <span className="material-symbols-outlined text-[64px] text-outline">image_not_supported</span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent pointer-events-none"></div>
            </div>

            {imagesList.length > 1 && (
              <div className="flex items-center gap-xs p-xs bg-surface-container-high overflow-x-auto scrollbar-hide border-t border-outline-variant/20">
                {imagesList.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border shrink-0 transition-all ${
                      activeImageIndex === idx ? "border-primary ring-2 ring-primary/30" : "border-outline-variant/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img className="w-full h-full object-cover" alt="" src={img.url || ""} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-1 md:col-span-4 bg-surface-container rounded-xl p-md shadow-sm flex flex-col justify-between">
            <div className="flex flex-col gap-xs">
              <div className="flex items-center gap-xs text-outline font-label-md text-label-md uppercase tracking-wider mb-sm">
                <span className="material-symbols-outlined text-[16px]">info</span> Core Metadata
              </div>
              <div className="flex justify-between items-center py-xs border-b border-outline-variant/20">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Brand</span>
                <span className="font-body-md text-body-md text-on-surface font-medium">{product.brand || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-xs border-b border-outline-variant/20">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Domain / Country</span>
                <span className="font-body-md text-body-md text-on-surface font-medium">
                  {product.domainName || "amazon.com"} ({product.country || "US"})
                </span>
              </div>
              <div className="flex justify-between items-center py-xs border-b border-outline-variant/20">
                <span className="font-body-sm text-body-sm text-on-surface-variant">ASIN / SKU</span>
                <span className="font-body-md text-body-md text-on-surface font-mono">{product.amazonItemId}</span>
              </div>
              <div className="flex justify-between items-center py-xs border-b border-outline-variant/20">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Product Type</span>
                <span className="font-body-md text-body-md text-on-surface font-medium">{product.productType || "Standard"}</span>
              </div>
              <div className="flex justify-between items-center py-xs border-b border-outline-variant/20">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Model Name</span>
                <span className="font-body-md text-body-md text-on-surface">{product.modelName || "-"}</span>
              </div>
              <div className="flex justify-between items-center py-xs border-b border-outline-variant/20">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Model Number</span>
                <span className="font-body-md text-body-md text-on-surface font-mono">{product.modelNumber || "-"}</span>
              </div>
            </div>
            <div className="mt-md bg-surface p-sm rounded-lg flex justify-between items-center">
              <span className="font-label-md text-label-md text-outline">Listed Price</span>
              <span className="font-headline-lg text-headline-lg text-primary">
                {product.price !== null ? `$${product.price.toFixed(2)} ${product.currency || ""}` : "Price unavailable"}
              </span>
            </div>
          </div>

          <div className="col-span-1 md:col-span-4 bg-surface-container rounded-xl p-md shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="flex items-center gap-xs text-secondary font-label-md text-label-md uppercase tracking-wider mb-md">
              <span className="material-symbols-outlined text-[16px]">psychology</span> Intelligence Summary
            </div>
            <div className="flex flex-col gap-md flex-1">
              <div className="flex flex-col gap-xs">
                <div className="flex justify-between items-end">
                  <span className="font-label-md text-label-md text-on-surface-variant">Listing Quality</span>
                  <span className="font-headline-md text-headline-md text-outline">
                    N/A <span className="text-outline text-body-sm">(Pending)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-outline-variant/30 w-[100%] rounded-full"></div>
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <div className="flex justify-between items-end">
                  <span className="font-label-md text-label-md text-on-surface-variant">Uniqueness Score</span>
                  <span className="font-headline-md text-headline-md text-outline">N/A</span>
                </div>
                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-outline-variant/30 w-[100%] rounded-full"></div>
                </div>
              </div>

              <div className="mt-auto flex justify-between items-center p-sm bg-surface rounded-lg">
                <span className="font-label-md text-label-md text-on-surface-variant">Intelligence Status</span>
                <span className="px-sm py-xs bg-surface-container-highest text-on-surface-variant font-label-sm text-[11px] rounded-full flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">schedule</span> Phase 7+ Pipeline
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
        <div className="col-span-1 lg:col-span-7 flex flex-col gap-lg">
          <section>
            <h2 className="font-headline-md text-headline-md text-on-background mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">list_alt</span> Detailed Specifications
            </h2>
            <div className="bg-surface-container rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {product.color && (
                    <tr className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                      <td className="p-sm font-label-md text-label-md text-on-surface-variant w-1/3">Color</td>
                      <td className="p-sm font-body-md text-body-md text-on-surface">{product.color}</td>
                    </tr>
                  )}
                  {product.material && (
                    <tr className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                      <td className="p-sm font-label-md text-label-md text-on-surface-variant">Material</td>
                      <td className="p-sm font-body-md text-body-md text-on-surface">{product.material}</td>
                    </tr>
                  )}
                  {product.dimensions && (
                    <tr className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                      <td className="p-sm font-label-md text-label-md text-on-surface-variant">Dimensions & Weight</td>
                      <td className="p-sm font-body-md text-body-md text-on-surface">
                        {product.dimensions.length && `L:${product.dimensions.length} `}
                        {product.dimensions.width && `W:${product.dimensions.width} `}
                        {product.dimensions.height && `H:${product.dimensions.height} `}
                        {product.dimensions.dimensionUnit || ""}
                        {product.dimensions.weight && `, Weight: ${product.dimensions.weight} ${product.dimensions.weightUnit || ""}`}
                      </td>
                    </tr>
                  )}
                  {product.attributes.map((attr) => (
                    <tr key={attr.id} className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                      <td className="p-sm font-label-md text-label-md text-on-surface-variant capitalize">{attr.key}</td>
                      <td className="p-sm font-body-md text-body-md text-on-surface">{attr.value}</td>
                    </tr>
                  ))}
                  {product.attributes.length === 0 && !product.color && !product.material && !product.dimensions && (
                    <tr>
                      <td colSpan={2} className="p-md text-center font-body-sm text-outline italic">
                        No additional specifications provided for this product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md text-on-background mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-outline">description</span> Description
            </h2>
            <div className="bg-surface-container p-md rounded-xl shadow-sm">
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
                {product.description || "No product description provided."}
              </p>
            </div>
          </section>
        </div>

        <div className="col-span-1 lg:col-span-5 flex flex-col gap-lg">
          <section className="relative bg-surface-container rounded-xl p-md shadow-sm overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex justify-between items-center mb-md relative z-10">
              <h2 className="font-headline-md text-headline-md text-on-background flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">auto_awesome</span> AI Analysis & Classification
              </h2>
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="flex items-center gap-xs px-sm py-xs bg-primary text-on-primary font-label-sm text-label-sm rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                {showReasoning ? "Hide Reasoning" : "View Reasoning"}
              </button>
            </div>

            {showReasoning && (
              <div className="mb-md p-sm bg-surface-container-high rounded-lg border border-primary/20 text-body-sm text-on-surface-variant relative z-10">
                <p className="font-label-sm text-primary uppercase tracking-wider mb-xs">Reasoning Graph</p>
                <p>Listing mapped to node ID {product.nodeId || "N/A"} in Amazon taxonomy tree ({displayCategory}). Attribute extraction verified {product.attributes.length} key specs.</p>
              </div>
            )}

            <div className="flex flex-col gap-md relative z-10 flex-1">
              <div>
                <h3 className="font-label-sm text-label-sm text-outline uppercase tracking-widest mb-sm">Extracted Attributes</h3>
                <div className="flex flex-wrap gap-sm">
                  {product.attributes.length > 0 ? (
                    product.attributes.map((attr) => (
                      <span key={attr.id} className="px-sm py-xs bg-surface text-on-surface font-body-sm text-body-sm rounded-md border border-outline-variant/30 flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[14px] text-primary">check</span>
                        {attr.key}: {attr.value}
                      </span>
                    ))
                  ) : (
                    <span className="text-outline font-body-sm italic">No extracted key-value tags available.</span>
                  )}
                </div>
              </div>

              <div className="mt-auto">
                <h3 className="font-label-sm text-label-sm text-outline uppercase tracking-widest mb-sm">Semantic Classification</h3>
                <div className="bg-surface p-sm rounded-lg border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-xs">
                    <span className="font-body-sm text-body-sm text-on-surface">Category Taxonomy</span>
                    <span className="font-label-sm text-label-sm text-secondary">Verified</span>
                  </div>
                  <div className="flex items-center gap-xs font-mono text-[11px] text-on-surface-variant overflow-hidden whitespace-nowrap">
                    <span className="text-primary truncate">{displayCategory}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="mt-xl">
        <h2 className="font-headline-md text-headline-md text-on-background mb-lg flex items-center gap-sm">
          <span className="material-symbols-outlined text-outline">join_inner</span> Similar Products (Potential Duplicates)
        </h2>
        <div className="bg-surface-container rounded-xl p-lg border border-outline-variant/20 text-center flex flex-col items-center gap-sm shadow-sm">
          <span className="material-symbols-outlined text-[40px] text-outline">hub</span>
          <h3 className="font-title-md text-title-md text-on-surface m-0">Duplicate Detection Engine Pending</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md m-0">
            Vector embeddings and similarity scoring will be computed in Phase 7 & Phase 8. Real duplicate candidates will appear here automatically.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
