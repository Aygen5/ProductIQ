import React, { useEffect } from "react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-surface-container rounded-[28px] border border-outline-variant/20 shadow-2xl p-xl flex flex-col gap-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-sm border-b border-outline-variant/10">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">help</span>
            </div>
            <div>
              <h2 className="font-title-lg text-title-lg text-on-background font-bold">
                ProductIQ Help &amp; Reference
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Platform features, workflows, and role permissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-outline transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-md">
          <div className="p-md rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-xs">
            <div className="flex items-center gap-xs text-primary font-bold text-body-md">
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              <span>Product Catalog</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Unified product repository based on the Amazon Berkeley Objects (ABO) dataset. Supports full-text search, brand and category filtering, pagination, manual product creation, and streaming batch data ingestion.
            </p>
          </div>

          <div className="p-md rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-xs">
            <div className="flex items-center gap-xs text-tertiary font-bold text-body-md">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
              <span>Duplicate Detection &amp; Candidate Reviews</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              7-signal multi-modal duplicate detection combining text embeddings, CLIP visual image vectors, and attribute matching. Reviewers can inspect side-by-side product comparisons and assign resolution decisions (Confirm Duplicate, Dismiss, or Resolve).
            </p>
          </div>

          <div className="p-md rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-xs">
            <div className="flex items-center gap-xs text-secondary font-bold text-body-md">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
              <span>Search Playground</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Interactive testbed evaluating search relevance by comparing dense vector semantic retrieval with traditional keyword lexical ranking across catalog items.
            </p>
          </div>

          <div className="p-md rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-xs">
            <div className="flex items-center gap-xs text-error font-bold text-body-md">
              <span className="material-symbols-outlined text-[20px]">gpp_maybe</span>
              <span>Risk Signals</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Catalog anomaly detection highlighting pricing inconsistencies, missing critical attributes, and high-risk product listings requiring operational review.
            </p>
          </div>

          <div className="p-md rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-xs">
            <div className="flex items-center gap-xs text-primary font-bold text-body-md">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
              <span>Catalog Health &amp; Analytics</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Real-time catalog quality score monitoring and historical time-series analytics (7D, 30D, 90D) calculated directly from live PostgreSQL database records.
            </p>
          </div>

          <div className="p-md rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-xs">
            <div className="flex items-center gap-xs text-on-surface font-bold text-body-md">
              <span className="material-symbols-outlined text-[20px]">badge</span>
              <span>Roles &amp; Permissions</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm mt-xs text-body-sm">
              <div className="p-sm rounded-xl bg-surface-container-high/40 border border-outline-variant/10">
                <span className="font-bold text-secondary text-xs uppercase tracking-wider block mb-1">
                  User Role
                </span>
                <span className="text-on-surface-variant text-xs leading-relaxed">
                  Browse catalog, create products, import ABO datasets, inspect duplicates, run search queries, and view analytics.
                </span>
              </div>
              <div className="p-sm rounded-xl bg-surface-container-high/40 border border-outline-variant/10">
                <span className="font-bold text-primary text-xs uppercase tracking-wider block mb-1">
                  Admin Role
                </span>
                <span className="text-on-surface-variant text-xs leading-relaxed">
                  All User capabilities plus System Settings management, detection thresholds tuning, and notification configuration.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-sm border-t border-outline-variant/10">
          <div className="flex items-center gap-1.5 text-outline text-[12px]">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span>ProductIQ Enterprise v1.0</span>
          </div>
          <button
            onClick={onClose}
            className="px-xl py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold shadow-md hover:bg-primary-fixed hover:text-on-primary-fixed transition-all cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
