import React from "react";
import { useLocation, Link } from "react-router-dom";

export const Header: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

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
    <header className="fixed top-0 left-72 right-0 h-20 bg-background/80 backdrop-blur-xl z-40 border-b border-outline-variant/10 flex items-center px-xl justify-between">
      <div className="flex items-center gap-sm font-label-md text-label-md text-outline">
        <Link to="/dashboard" className="hover:text-on-surface cursor-pointer">
          Platform
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        {getBreadcrumb()}
      </div>
      <div className="flex items-center gap-md">
        <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors" aria-label="Help">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
      </div>
    </header>
  );
};
