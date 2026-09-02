import React, { useState } from "react";
import { createProduct } from "../../services/productService";
import type { CreateProductPayload, ProductDetail } from "../../types/product";

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: ProductDetail) => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [productType, setProductType] = useState("");
  const [modelName, setModelName] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [color, setColor] = useState("");
  const [material, setMaterial] = useState("");
  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState("USD");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Product Name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: CreateProductPayload = {
      name: name.trim(),
      amazonItemId: sku.trim() || undefined,
      brand: brand.trim() || undefined,
      category: category.trim() || undefined,
      productType: productType.trim() || undefined,
      modelName: modelName.trim() || undefined,
      modelNumber: modelNumber.trim() || undefined,
      color: color.trim() || undefined,
      material: material.trim() || undefined,
      price: price ? parseFloat(price) : undefined,
      currency: currency.trim() || "USD",
      mainImageUrl: mainImageUrl.trim() || undefined,
      description: description.trim() || undefined,
    };

    try {
      const created = await createProduct(payload);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-surface-container rounded-[28px] border border-outline-variant/20 shadow-2xl p-xl flex flex-col gap-lg my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-sm border-b border-outline-variant/10">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">add_box</span>
            </div>
            <div>
              <h2 className="font-title-lg text-title-lg text-on-background font-bold">New Product</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Create and index a new product in the catalog
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-outline transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-md rounded-xl bg-error/15 border border-error/30 text-error font-body-sm text-body-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1">
              Product Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
              className="px-md py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface text-body-md focus:outline-none focus:border-primary transition-colors font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-outline font-semibold">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Sony"
                className="px-md py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface text-body-sm focus:outline-none focus:border-primary transition-colors font-medium"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-outline font-semibold">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Over-Ear Headphones"
                className="px-md py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface text-body-sm focus:outline-none focus:border-primary transition-colors font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-outline font-semibold">Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 349.99"
                className="px-md py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface text-body-sm focus:outline-none focus:border-primary transition-colors font-medium"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-outline font-semibold">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="USD"
                className="px-md py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface text-body-sm focus:outline-none focus:border-primary transition-colors font-medium uppercase"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-outline font-semibold">Product Type</label>
              <input
                type="text"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                placeholder="e.g. HEADPHONES"
                className="px-md py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface text-body-sm focus:outline-none focus:border-primary transition-colors font-medium uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-outline font-semibold">Model Name</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. WH-1000XM5"
                className="px-md py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface text-body-sm focus:outline-none focus:border-primary transition-colors font-medium"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-outline font-semibold">Model Number</label>
              <input
                type="text"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="e.g. WH1000XM5/B"
                className="px-md py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface text-body-sm focus:outline-none focus:border-primary transition-colors font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-outline font-semibold">Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Black"
                className="px-md py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface text-body-sm focus:outline-none focus:border-primary transition-colors font-medium"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-outline font-semibold">Material</label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. Leather / Plastic"
                className="px-md py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface text-body-sm focus:outline-none focus:border-primary transition-colors font-medium"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-outline font-semibold">SKU / Item ID (Optional)</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Auto-generated if blank"
                className="px-md py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface text-body-sm focus:outline-none focus:border-primary transition-colors font-mono uppercase"
              />
            </div>
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-outline font-semibold">Main Image URL</label>
            <input
              type="url"
              value={mainImageUrl}
              onChange={(e) => setMainImageUrl(e.target.value)}
              placeholder="https://images.example.com/product.jpg"
              className="px-md py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface text-body-sm focus:outline-none focus:border-primary transition-colors font-medium"
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-outline font-semibold">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description and key features..."
              className="px-md py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface text-body-sm focus:outline-none focus:border-primary transition-colors font-medium resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-sm pt-sm border-t border-outline-variant/10 mt-xs">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-md py-2 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface font-label-md text-label-md font-bold hover:bg-surface-variant transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-xl py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold shadow-md hover:bg-primary-fixed hover:text-on-primary-fixed transition-all flex items-center gap-xs disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>Creating product...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Create Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
