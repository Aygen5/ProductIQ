import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Sidebar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-md py-sm rounded-xl transition-all group ${
      isActive
        ? "bg-primary-container text-on-primary-container font-semibold"
        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
    }`;

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "U";
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email || "User";

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
        <div className="flex items-center justify-between p-sm rounded-xl bg-surface-container-low mt-xs border border-outline-variant/10">
          <div className="flex items-center gap-md overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 font-bold text-xs tracking-wider">
              {initials}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <p className="font-label-sm text-label-sm text-on-surface truncate font-semibold" title={fullName}>
                  {fullName}
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isAdmin ? (
                  <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold uppercase tracking-wider">
                    Admin
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-outline text-[9px] font-semibold uppercase tracking-wider">
                    User
                  </span>
                )}
                <span className="text-[10px] text-outline truncate" title={user?.email}>
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-8 h-8 flex items-center justify-center text-outline hover:text-error hover:bg-error-container/20 rounded-lg transition-colors flex-shrink-0 ml-1"
            title="Sign out of ProductIQ"
            aria-label="Logout"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
