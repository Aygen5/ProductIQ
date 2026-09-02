import React, { useState } from "react";
import { importProducts } from "../../services/productService";
import type { ProductImportResult } from "../../types/product";

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: ProductImportResult) => void;
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [batchSize, setBatchSize] = useState<number>(25);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartImport = async () => {
    setIsImporting(true);
    setError(null);

    try {
      const result = await importProducts(batchSize);
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to import products from ABO dataset.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-surface-container rounded-[24px] border border-outline-variant/20 shadow-2xl p-xl flex flex-col gap-lg">
        <div className="flex items-center justify-between pb-sm border-b border-outline-variant/10">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">cloud_download</span>
            </div>
            <div>
              <h2 className="font-title-lg text-title-lg text-on-background font-bold">Import Dataset</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Amazon Berkeley Objects (ABO) Pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isImporting}
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

        <div className="flex flex-col gap-md">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Ingest normalized product records from the ABO gzip archive (<code className="text-primary font-mono text-xs">listings_0.json.gz</code> &amp; <code className="text-primary font-mono text-xs">images.csv.gz</code>) directly into PostgreSQL. Existing catalog items are preserved.
          </p>

          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-outline font-semibold">
              Batch Size (New Products)
            </label>
            <div className="grid grid-cols-3 gap-sm">
              {[25, 50, 100].map((size) => (
                <button
                  key={size}
                  type="button"
                  disabled={isImporting}
                  onClick={() => setBatchSize(size)}
                  className={`py-2 px-md rounded-xl border text-label-md font-label-md font-bold transition-all ${
                    batchSize === size
                      ? "bg-primary text-on-primary border-primary shadow-sm"
                      : "bg-surface-container-low border-outline-variant/20 text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  +{size} Products
                </button>
              ))}
            </div>
          </div>

          <div className="p-md rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-xs text-[12px] text-on-surface-variant">
            <div className="flex justify-between">
              <span>Source Dataset:</span>
              <span className="text-on-surface font-semibold">Amazon Berkeley Objects</span>
            </div>
            <div className="flex justify-between">
              <span>Domain Filter:</span>
              <span className="text-on-surface font-semibold">amazon.com</span>
            </div>
            <div className="flex justify-between">
              <span>Normalization:</span>
              <span className="text-on-surface font-semibold">Images, Attributes, Dimensions</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-sm pt-xs">
          <button
            type="button"
            disabled={isImporting}
            onClick={onClose}
            className="px-md py-2 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface font-label-md text-label-md font-bold hover:bg-surface-variant transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isImporting}
            onClick={handleStartImport}
            className="px-xl py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold shadow-md hover:bg-primary-fixed hover:text-on-primary-fixed transition-all flex items-center gap-xs disabled:opacity-60"
          >
            {isImporting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Importing records...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">upload</span>
                <span>Start Import</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
