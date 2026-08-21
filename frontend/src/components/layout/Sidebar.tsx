import React from "react";
import { NavLink } from "react-router-dom";

export const Sidebar: React.FC = () => {
  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-md py-sm rounded-xl transition-all group ${
      isActive
        ? "bg-primary-container text-on-primary-container font-semibold"
        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
    }`;

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col border-r border-outline-variant/10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      <div className="px-md py-lg flex items-center gap-base">
        <span className="material-symbols-outlined text-primary text-[32px]">insights</span>
        <span className="font-headline-md text-headline-md text-on-surface tracking-tight">ProductIQ</span>
      </div>

      <nav className="flex-1 px-sm overflow-y-auto space-y-xs">
        <div className="px-md pt-md pb-xs font-label-sm text-label-sm text-outline uppercase tracking-widest">
          Overview
        </div>
        <NavLink to="/dashboard" className={navItemClass}>
          <span className="material-symbols-outlined mr-md group-hover:scale-110 transition-transform">dashboard</span>
          <span className="font-label-md text-label-md">Dashboard</span>
        </NavLink>

        <div className="px-md pt-md pb-xs font-label-sm text-label-sm text-outline uppercase tracking-widest">
          Catalog
        </div>
        <NavLink to="/products" className={navItemClass}>
          <span className="material-symbols-outlined mr-md group-hover:scale-110 transition-transform">inventory_2</span>
          <span className="font-label-md text-label-md">Products</span>
        </NavLink>

        <div className="px-md pt-md pb-xs font-label-sm text-label-sm text-outline uppercase tracking-widest">
          Intelligence
        </div>
        <NavLink to="/duplicates" className={navItemClass}>
          <span className="material-symbols-outlined mr-md group-hover:scale-110 transition-transform">content_copy</span>
          <span className="font-label-md text-label-md">Duplicates</span>
        </NavLink>
        <NavLink to="/risk" className={navItemClass}>
          <span className="material-symbols-outlined mr-md group-hover:scale-110 transition-transform">gpp_maybe</span>
          <span className="font-label-md text-label-md">Risk Detection</span>
        </NavLink>

        <div className="px-md pt-md pb-xs font-label-sm text-label-sm text-outline uppercase tracking-widest">
          Search
        </div>
        <NavLink to="/search" className={navItemClass}>
          <span className="material-symbols-outlined mr-md group-hover:scale-110 transition-transform">search_check</span>
          <span className="font-label-md text-label-md">Search Playground</span>
        </NavLink>

        <div className="px-md pt-md pb-xs font-label-sm text-label-sm text-outline uppercase tracking-widest">
          Analytics
        </div>
        <NavLink to="/analytics" className={navItemClass}>
          <span className="material-symbols-outlined mr-md group-hover:scale-110 transition-transform">bar_chart_4_bars</span>
          <span className="font-label-md text-label-md">Analytics</span>
        </NavLink>
      </nav>

      <div className="p-md mt-auto border-t border-outline-variant/10">
        <NavLink to="/settings" className={(props) => `${navItemClass(props)} mb-base`}>
          <span className="material-symbols-outlined mr-md">settings</span>
          <span className="font-label-md text-label-md">Settings</span>
        </NavLink>
        <div className="flex items-center gap-md p-sm rounded-xl bg-surface-container-low mt-xs">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
          <div className="overflow-hidden">
            <p className="font-label-sm text-label-sm text-on-surface truncate">Alex Chen</p>
            <p className="font-body-sm text-[10px] text-outline truncate">Lead Architect</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
