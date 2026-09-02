import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { HelpModal } from "./HelpModal";

export const Header: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const toggleNotifications = () => {
    setIsHelpOpen(false);
    setIsNotificationsOpen((prev) => !prev);
  };

  const toggleHelp = () => {
    setIsNotificationsOpen(false);
    setIsHelpOpen((prev) => !prev);
  };

  const getBreadcrumb = () => {
    if (path.startsWith("/products/")) {
      return (
        <>
          <Link to="/products" className="hover:text-on-surface cursor-pointer">Products</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-on-surface">Product Detail</span>
        </>
      );
    }
    if (path.startsWith("/duplicates/")) {
      return (
        <>
          <Link to="/duplicates" className="hover:text-on-surface cursor-pointer">Duplicates</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-on-surface">Duplicate Analysis</span>
        </>
      );
    }
    switch (path) {
      case "/products":
        return <span className="text-on-surface">Products</span>;
      case "/duplicates":
        return <span className="text-on-surface">Duplicates</span>;
      case "/risk":
        return <span className="text-on-surface">Risk Detection</span>;
      case "/search":
        return <span className="text-on-surface">Search Playground</span>;
      case "/analytics":
        return <span className="text-on-surface">Analytics</span>;
      case "/settings":
        return <span className="text-on-surface">Settings</span>;
      case "/dashboard":
      default:
        return <span className="text-on-surface">Dashboard</span>;
    }
  };

  return (
    <>
      <header className="fixed top-0 left-72 right-0 h-20 bg-background/80 backdrop-blur-xl z-40 border-b border-outline-variant/10 flex items-center px-xl justify-between">
        <div className="flex items-center gap-sm font-label-md text-label-md text-outline">
          <Link to="/dashboard" className="hover:text-on-surface cursor-pointer">
            Platform
          </Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          {getBreadcrumb()}
        </div>
        <div className="flex items-center gap-md">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/10 text-xs">
              <span className={`w-2 h-2 rounded-full ${isAdmin ? "bg-primary animate-pulse" : "bg-secondary"}`} />
              <span className="font-medium text-on-surface">{user.firstName} {user.lastName}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isAdmin ? "bg-primary/20 text-primary border border-primary/30" : "bg-surface-container-highest text-outline"}`}>
                {user.role}
              </span>
            </div>
          )}

          <div className="relative">
            <button
              onClick={toggleNotifications}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                isNotificationsOpen
                  ? "bg-surface-container-high text-primary ring-2 ring-primary/20"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <NotificationsDropdown
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>

          <button
            onClick={toggleHelp}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
              isHelpOpen
                ? "bg-surface-container-high text-primary ring-2 ring-primary/20"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
            aria-label="Help"
          >
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
      </header>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
};
