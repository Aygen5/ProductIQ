import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-surface-container rounded-2xl border border-outline-variant/20 shadow-2xl z-50 flex flex-col overflow-hidden animate-fadeIn"
    >
      <div className="flex items-center justify-between p-md border-b border-outline-variant/10">
        <div className="flex items-center gap-xs">
          <span className="material-symbols-outlined text-primary text-[20px]">notifications</span>
          <h3 className="font-title-md text-title-md text-on-surface font-bold">Notifications</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-outline text-[11px] font-semibold">
          0 Unread
        </span>
      </div>

      <div className="p-xl flex flex-col items-center text-center gap-sm">
        <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-outline flex items-center justify-center">
          <span className="material-symbols-outlined text-[24px]">notifications_paused</span>
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            No New Notifications
          </h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs leading-relaxed">
            You are all caught up. Operational alerts, duplicate candidate reviews, and catalog signals will appear here when triggered.
          </p>
        </div>
      </div>

      <div className="px-md pb-md pt-xs border-t border-outline-variant/10 flex flex-col gap-xs">
        <span className="text-[11px] font-semibold text-outline uppercase tracking-wider px-xs">
          Quick Navigation
        </span>
        <div className="grid grid-cols-2 gap-xs">
          <Link
            to="/duplicates"
            onClick={onClose}
            className="flex items-center gap-xs p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors text-body-sm text-on-surface"
          >
            <span className="material-symbols-outlined text-tertiary text-[16px]">content_copy</span>
            <span>Duplicates</span>
          </Link>
          <Link
            to="/risk"
            onClick={onClose}
            className="flex items-center gap-xs p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors text-body-sm text-on-surface"
          >
            <span className="material-symbols-outlined text-error text-[16px]">gpp_maybe</span>
            <span>Risk Signals</span>
          </Link>
        </div>
      </div>

      <div className="px-md py-xs bg-surface-container-low border-t border-outline-variant/10 flex items-center justify-between text-[11px] text-outline">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          <span>Catalog Monitor Active</span>
        </div>
        <span>Live</span>
      </div>
    </div>
  );
};
