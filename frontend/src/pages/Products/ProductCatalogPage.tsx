import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const ProductCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSelectAll = () => {
    if (selectedRows.length === 3) {
      setSelectedRows([]);
    } else {
      setSelectedRows([1, 2, 3]);
    }
  };

  const toggleSelectRow = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col w-full h-full relative" id="products-catalog-page">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-1]">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-xl mb-xl relative z-10">
        <div className="flex flex-col gap-sm">
          <h1 className="font-headline-xl text-headline-xl text-on-background m-0 p-0 leading-tight">Product Catalog</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl m-0 p-0 leading-relaxed">
            Browse, search, and inspect the unified product index across all verified sellers and brands.
          </p>
        </div>
        <div className="flex items-center gap-md shrink-0">
          <button className="flex items-center gap-base px-md py-sm bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md rounded-xl transition-all outline-none border border-outline-variant/30 shadow-sm focus:ring-2 focus:ring-primary/20">
            <span className="material-symbols-outlined text-[18px]">upload</span>
            Import Data
          </button>
          <button className="flex items-center gap-base px-md py-sm bg-primary hover:bg-primary-fixed text-on-primary font-label-md text-label-md rounded-xl transition-all shadow-md outline-none focus:ring-4 focus:ring-primary/20">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Product
          </button>
        </div>
      </div>

      {/* Filters & Controls Section */}
      <div className="bg-surface-container-low rounded-xl mb-md p-md shadow-sm border border-outline-variant/20 flex flex-col gap-md relative z-10">
        <div className="flex flex-col lg:flex-row gap-md">
          {/* Search */}
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
              search
            </span>
            <input
              className="w-full bg-surface border border-outline-variant/30 rounded-xl py-sm pl-xl pr-md font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all shadow-sm"
              placeholder="Search by name, SKU, or brand..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-sm overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <button className="flex items-center gap-xs px-sm py-xs bg-surface-container-highest text-on-surface font-label-sm text-label-sm rounded-lg whitespace-nowrap border border-outline-variant/30 hover:bg-surface-variant transition-colors">
              Category: All
              <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
            </button>
            <button className="flex items-center gap-xs px-sm py-xs bg-surface-container-highest text-on-surface font-label-sm text-label-sm rounded-lg whitespace-nowrap border border-outline-variant/30 hover:bg-surface-variant transition-colors">
              Brand: All
              <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
            </button>
            <button className="flex items-center gap-xs px-sm py-xs bg-surface-container-highest text-on-surface font-label-sm text-label-sm rounded-lg whitespace-nowrap border border-outline-variant/30 hover:bg-surface-variant transition-colors">
              Seller: All
              <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
            </button>
            <button className="flex items-center gap-xs px-sm py-xs bg-surface-container-highest text-on-surface font-label-sm text-label-sm rounded-lg whitespace-nowrap border border-outline-variant/30 hover:bg-surface-variant transition-colors">
              Status: Active
              <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
            </button>
            <div className="w-px h-6 bg-outline-variant/30 mx-xs hidden lg:block"></div>
            <button className="flex items-center gap-xs px-sm py-xs text-on-surface-variant font-label-sm text-label-sm rounded-lg whitespace-nowrap hover:bg-surface-container-high transition-colors ml-auto lg:ml-0">
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              More Filters
            </button>
          </div>
        </div>

        {/* Active Filter Tags */}
        <div className="flex flex-wrap items-center gap-xs">
          <span className="font-label-sm text-label-sm text-outline mr-sm">Active Filters:</span>
          <div className="flex items-center gap-xs bg-surface-variant text-on-surface font-body-sm text-body-sm px-sm py-[2px] rounded-full border border-outline-variant/30">
            <span>Status: Active</span>
            <button className="material-symbols-outlined text-[14px] hover:text-error transition-colors rounded-full hover:bg-error/10 p-[1px]">
              close
            </button>
          </div>
          <button className="text-primary font-label-sm text-label-sm hover:underline ml-xs">Clear All</button>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-surface-container rounded-xl shadow-md border border-outline-variant/20 overflow-hidden flex-1 flex flex-col relative z-10">
        {/* Table Actions/Sorting Header */}
        <div className="px-md py-sm bg-surface-container-high border-b border-outline-variant/20 flex justify-between items-center">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Showing 1-10 of 12,403 items</span>
          <button className="flex items-center gap-xs text-on-surface font-label-sm text-label-sm hover:text-primary transition-colors">
            Sort by: Recently Updated
            <span className="material-symbols-outlined text-[16px]">sort</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-surface-container-lowest sticky top-0 z-20 shadow-sm border-b border-outline-variant/30">
              <tr>
                <th className="px-md py-sm font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold w-12 text-center">
                  <input
                    className="w-4 h-4 rounded border-outline-variant/50 text-primary focus:ring-primary/50 bg-surface cursor-pointer"
                    type="checkbox"
                    checked={selectedRows.length === 3}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-md py-sm font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold group cursor-pointer hover:text-on-surface transition-colors">
                  <div className="flex items-center gap-xs">
                    Product <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">arrow_downward</span>
                  </div>
                </th>
                <th className="px-md py-sm font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Brand / Seller</th>
                <th className="px-md py-sm font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Category</th>
                <th className="px-md py-sm font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold text-right">Price</th>
                <th className="px-md py-sm font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold text-right">Stock</th>
                <th className="px-md py-sm font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold text-center">Status</th>
                <th className="px-md py-sm font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold text-center group cursor-pointer hover:text-on-surface transition-colors">
                  <div className="flex items-center justify-center gap-xs">
                    Risk <span className="material-symbols-outlined text-[14px] text-primary">arrow_downward</span>
                  </div>
                </th>
                <th className="px-md py-sm w-12"></th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant/10">
              {/* Row 1 */}
              <tr
                onClick={() => navigate("/products/1")}
                className={`group hover:bg-surface-container-high transition-colors cursor-pointer ${
                  selectedRows.includes(1) ? "bg-primary/5" : "bg-surface-container"
                }`}
              >
                <td className="px-md py-md text-center align-middle" onClick={(e) => toggleSelectRow(1, e)}>
                  <input
                    className="w-4 h-4 rounded border-outline-variant/50 text-primary focus:ring-primary/50 bg-surface cursor-pointer"
                    type="checkbox"
                    checked={selectedRows.includes(1)}
                    onChange={() => {}}
                  />
                </td>
                <td className="px-md py-md">
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container-highest shrink-0 border border-outline-variant/20 relative group-hover:shadow-md transition-shadow">
                      <img
                        className="w-full h-full object-cover"
                        alt="AuraSync Pro Wireless Headphones"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6XjJ0TwtOG_-AWLkDHdQET4o2OOtjst6YWX4Eqb7p-JK64ZJRh4DSraHgzX7LACLyrVpup7da2TOBgTYDT44kb5p9P6txAHH9H0mxK7-q8sxd2jAk47rEmiPU_Qkv3rq_SFW5c4PxZMPMm7RrhqnRH-Jf7BchfpFakYcb5mdhIJEnPX480RtX2bszs3TRczfLyInrhrr9H75hYeJ7GnCX51hy7YGPyboPQUe0zGDFx2OXsNykTyNk"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-on-surface truncate group-hover:text-primary transition-colors">
                        AuraSync Pro Wireless Headphones
                      </span>
                      <div className="flex items-center gap-xs mt-xs">
                        <span className="font-body-sm text-[11px] text-outline font-mono">SKU: AS-PRO-BLK-01</span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant/50"></span>
                        <span className="font-body-sm text-[11px] text-outline">Upd: 2h ago</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-md py-md">
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface">SonicFlow Audio</span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[12px]">storefront</span> GlobalTech Retail
                    </span>
                  </div>
                </td>
                <td className="px-md py-md">
                  <div className="inline-flex items-center gap-xs px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant text-[12px] border border-outline-variant/30">
                    Electronics <span className="material-symbols-outlined text-[10px]">chevron_right</span> Audio
                  </div>
                </td>
                <td className="px-md py-md text-right font-label-md text-label-md text-on-surface">$299.00</td>
                <td className="px-md py-md text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-label-md text-label-md text-on-surface">1,240</span>
                    <span className="font-body-sm text-[11px] text-secondary">In Stock</span>
                  </div>
                </td>
                <td className="px-md py-md text-center">
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-secondary/10 text-secondary font-label-sm text-[11px] border border-secondary/20">
                    Active
                  </span>
                </td>
                <td className="px-md py-md">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-label-sm text-[11px] text-on-surface-variant">Low</span>
                    <div className="w-16 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-secondary w-[15%] rounded-full"></div>
                    </div>
                  </div>
                </td>
                <td className="px-md py-md text-center" onClick={(e) => e.stopPropagation()}>
                  <button className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container-highest transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </td>
              </tr>

              {/* Row 2 */}
              <tr
                onClick={() => navigate("/products/1")}
                className={`group hover:bg-surface-container-high transition-colors cursor-pointer ${
                  selectedRows.includes(2) ? "bg-primary/5" : "bg-surface-container"
                }`}
              >
                <td className="px-md py-md text-center align-middle" onClick={(e) => toggleSelectRow(2, e)}>
                  <input
                    className="w-4 h-4 rounded border-outline-variant/50 text-primary focus:ring-primary/50 bg-surface cursor-pointer"
                    type="checkbox"
                    checked={selectedRows.includes(2)}
                    onChange={() => {}}
                  />
                </td>
                <td className="px-md py-md">
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container-highest shrink-0 border border-outline-variant/20 relative group-hover:shadow-md transition-shadow">
                      <img
                        className="w-full h-full object-cover"
                        alt="EmberSmart Ceramic Mug V2"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYEAeds_3fNColpIC4afu6FRpXwvq442alOp9ZTepYpISWXB-9yC3bH160OxzSHiSSSYAaw5whjk-dALRPskdpLad5FiTNaHREdGQMhSmhuqvVSI0f-1lTEp4AwcyO8hwI8Q-D3rnrrJIri9zXd5cRt26BSPPPcYP3rg7U6Wnl8yZfSHQnrocmOWfdhM__iKE6PXiyfCAyaH6L6T8OMhkKVoXV4opfHMAirVyvNsb12D5SY45CdXF7"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-on-surface truncate group-hover:text-primary transition-colors">
                        EmberSmart Ceramic Mug V2
                      </span>
                      <div className="flex items-center gap-xs mt-xs">
                        <span className="font-body-sm text-[11px] text-outline font-mono">SKU: EMB-WHT-02</span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant/50"></span>
                        <span className="font-body-sm text-[11px] text-outline">Upd: 5h ago</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-md py-md">
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface">ThermoTech</span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[12px]">storefront</span> KitchenEssentials Ltd.
                    </span>
                  </div>
                </td>
                <td className="px-md py-md">
                  <div className="inline-flex items-center gap-xs px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant text-[12px] border border-outline-variant/30">
                    Home <span className="material-symbols-outlined text-[10px]">chevron_right</span> Kitchen
                  </div>
                </td>
                <td className="px-md py-md text-right font-label-md text-label-md text-on-surface">$129.50</td>
                <td className="px-md py-md text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-label-md text-label-md text-on-surface">42</span>
                    <span className="font-body-sm text-[11px] text-tertiary">Low Stock</span>
                  </div>
                </td>
                <td className="px-md py-md text-center">
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-[11px] border border-tertiary/20">
                    Pending Review
                  </span>
                </td>
                <td className="px-md py-md">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-label-sm text-[11px] text-on-surface-variant">Medium</span>
                    <div className="w-16 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-tertiary w-[65%] rounded-full"></div>
                    </div>
                  </div>
                </td>
                <td className="px-md py-md text-center" onClick={(e) => e.stopPropagation()}>
                  <button className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container-highest transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </td>
              </tr>

              {/* Row 3 */}
              <tr
                onClick={() => navigate("/products/1")}
                className={`group hover:bg-surface-container-high transition-colors cursor-pointer ${
                  selectedRows.includes(3) ? "bg-primary/5" : "bg-surface-container"
                }`}
              >
                <td className="px-md py-md text-center align-middle" onClick={(e) => toggleSelectRow(3, e)}>
                  <input
                    className="w-4 h-4 rounded border-outline-variant/50 text-primary focus:ring-primary/50 bg-surface cursor-pointer"
                    type="checkbox"
                    checked={selectedRows.includes(3)}
                    onChange={() => {}}
                  />
                </td>
                <td className="px-md py-md">
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container-highest shrink-0 border border-error/50 relative group-hover:shadow-md transition-shadow">
                      <div className="absolute inset-0 bg-error/10 mix-blend-overlay z-10 pointer-events-none"></div>
                      <img
                        className="w-full h-full object-cover"
                        alt="Generic FitBand Pro Max"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-kxwB_4s2aIFL1hNEhfzw7yQUmQ0kB1ASHxReYT6nKiJM1AUCp6eRgvrplr08YjYZT4tjuY1enpZ0KgsbmDDIl-6Zzf-qaiNAvUA56kTdP1E-HhcR8qGkd2GNUgPVEnRoxHHPvCxNEJaQpmyV5Dhz2wFxrvgvfBktKZm39BOIwHAfI7wiWBDfAR7FJ9TD3Kz0fNhl-8tMgn75oVsQ218OpFk1x0sl9RUbaQrDukYfXAwNC8TnH7-J"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-on-surface truncate group-hover:text-primary transition-colors flex items-center gap-xs">
                        Generic FitBand Pro Max
                        <span className="material-symbols-outlined text-[14px] text-error" title="Potential Counterfeit">
                          warning
                        </span>
                      </span>
                      <div className="flex items-center gap-xs mt-xs">
                        <span className="font-body-sm text-[11px] text-outline font-mono">SKU: GFB-PM-99</span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant/50"></span>
                        <span className="font-body-sm text-[11px] text-outline">Upd: 1d ago</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-md py-md">
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface text-outline italic">Unknown</span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[12px]">storefront</span> QuickDrop Ship LLC
                    </span>
                  </div>
                </td>
                <td className="px-md py-md">
                  <div className="inline-flex items-center gap-xs px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant text-[12px] border border-outline-variant/30">
                    Electronics <span className="material-symbols-outlined text-[10px]">chevron_right</span> Wearables
                  </div>
                </td>
                <td className="px-md py-md text-right font-label-md text-label-md text-on-surface">$14.99</td>
                <td className="px-md py-md text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-label-md text-label-md text-on-surface">5,000+</span>
                    <span className="font-body-sm text-[11px] text-secondary">In Stock</span>
                  </div>
                </td>
                <td className="px-md py-md text-center">
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-secondary/10 text-secondary font-label-sm text-[11px] border border-secondary/20">
                    Active
                  </span>
                </td>
                <td className="px-md py-md">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-label-sm text-[11px] text-error">High</span>
                    <div className="w-16 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-error w-[95%] rounded-full shadow-[0_0_8px_rgba(255,180,171,0.6)]"></div>
                    </div>
                  </div>
                </td>
                <td className="px-md py-md text-center" onClick={(e) => e.stopPropagation()}>
                  <button className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container-highest transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-md py-sm bg-surface-container-lowest border-t border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <span className="font-body-sm text-body-sm text-outline">Rows per page:</span>
            <button className="flex items-center gap-xs font-label-sm text-label-sm text-on-surface hover:bg-surface-container-high px-2 py-1 rounded transition-colors">
              10 <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
          </div>
          <div className="flex items-center gap-md">
            <span className="font-body-sm text-body-sm text-outline">1-10 of 12,403</span>
            <div className="flex items-center gap-xs">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-md text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                disabled
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
