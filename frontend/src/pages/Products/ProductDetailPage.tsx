import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [showReasoning, setShowReasoning] = useState(false);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-lg mb-lg">
        {/* Header */}
        <div className="flex flex-col gap-sm relative group overflow-hidden">
          <div className="flex items-center gap-xs font-label-sm text-label-sm text-outline uppercase tracking-[0.1em] mb-xs">
            <span onClick={() => navigate("/products")} className="hover:text-on-background transition-colors cursor-pointer">
              Products
            </span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            <span className="text-primary font-bold">APP-IP15PM-256-NT</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-background m-0">Apple iPhone 15 Pro Max</h1>
        </div>

        {/* Hero Section: Image, Info, Intelligence */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Product Image */}
          <div className="col-span-1 md:col-span-4 bg-surface-container rounded-xl overflow-hidden shadow-sm relative group h-96">
            <div
              className="bg-cover bg-center w-full h-full transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDaTkgkgRfs2lf0ZNmDeOtKEwcU5GdZ-jXvT9YSb2kfK3jxdsjcG4FgcNVDA1dJSf0158SuX4IfeHHVBdE4poDHErUVt2s6yjf0QL8MEyOQnaHfXde6eLdwaZE3_0woknkY2LNxBQuqh5JtenkMCBCMnTnGBY66GKpt2ceWZdM3OcDFDhBtz5vwN9xp2Zgrmk9bRjN8gxfUOMdRaLkPGjDZJoyXkUmZWfrwKq7Mgs2Ul16CsHf5i6Q0')",
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
          </div>

          {/* Info Card */}
          <div className="col-span-1 md:col-span-4 bg-surface-container rounded-xl p-md shadow-sm flex flex-col justify-between">
            <div className="flex flex-col gap-sm">
              <div className="flex items-center gap-xs text-outline font-label-md text-label-md uppercase tracking-wider mb-sm">
                <span className="material-symbols-outlined text-[16px]">info</span> Core Metadata
              </div>
              <div className="flex justify-between items-center py-sm border-b border-outline-variant/20">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Brand</span>
                <span className="font-body-md text-body-md text-on-surface font-medium">Apple</span>
              </div>
              <div className="flex justify-between items-center py-sm border-b border-outline-variant/20">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Seller</span>
                <span className="font-body-md text-body-md text-on-surface font-medium">TechNova Electronics</span>
              </div>
              <div className="flex justify-between items-center py-sm border-b border-outline-variant/20">
                <span className="font-body-sm text-body-sm text-on-surface-variant">SKU</span>
                <span className="font-body-md text-body-md text-on-surface font-mono">APP-IP15PM-256-NT</span>
              </div>
            </div>
            <div className="mt-md bg-surface p-sm rounded-lg flex justify-between items-center">
              <span className="font-label-md text-label-md text-outline">Listed Price</span>
              <span className="font-headline-lg text-headline-lg text-primary">$1,199.00</span>
            </div>
          </div>

          {/* Intelligence Summary Card */}
          <div className="col-span-1 md:col-span-4 bg-surface-container rounded-xl p-md shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="flex items-center gap-xs text-secondary font-label-md text-label-md uppercase tracking-wider mb-md">
              <span className="material-symbols-outlined text-[16px]">psychology</span> Intelligence Summary
            </div>
            <div className="flex flex-col gap-md flex-1">
              {/* Quality Score */}
              <div className="flex flex-col gap-xs">
                <div className="flex justify-between items-end">
                  <span className="font-label-md text-label-md text-on-surface-variant">Listing Quality</span>
                  <span className="font-headline-md text-headline-md text-on-surface">
                    92<span className="text-outline text-body-sm">/100</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[92%] rounded-full shadow-[0_0_10px_rgba(78,222,163,0.5)]"></div>
                </div>
              </div>
              {/* Duplicate Risk */}
              <div className="flex flex-col gap-xs">
                <div className="flex justify-between items-end">
                  <span className="font-label-md text-label-md text-on-surface-variant">Uniqueness Score</span>
                  <span className="font-headline-md text-headline-md text-on-surface">96%</span>
                </div>
                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[96%] rounded-full shadow-[0_0_10px_rgba(195,192,255,0.5)]"></div>
                </div>
              </div>
              {/* Risk Level */}
              <div className="mt-auto flex justify-between items-center p-sm bg-surface rounded-lg">
                <span className="font-label-md text-label-md text-on-surface-variant">Overall Risk</span>
                <span className="px-sm py-xs bg-secondary-container/20 text-secondary font-label-sm text-label-sm rounded-full flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Low Risk
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
        {/* Left Column: Specs & Description */}
        <div className="col-span-1 lg:col-span-7 flex flex-col gap-lg">
          {/* Detailed Specs */}
          <section>
            <h2 className="font-headline-md text-headline-md text-on-background mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">list_alt</span> Detailed Specifications
            </h2>
            <div className="bg-surface-container rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                    <td className="p-sm font-label-md text-label-md text-on-surface-variant w-1/3">Storage Capacity</td>
                    <td className="p-sm font-body-md text-body-md text-on-surface">256 GB</td>
                  </tr>
                  <tr className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                    <td className="p-sm font-label-md text-label-md text-on-surface-variant">Color</td>
                    <td className="p-sm font-body-md text-body-md text-on-surface flex items-center gap-sm">
                      <div className="w-4 h-4 rounded-full bg-[#e3e4e5] border border-outline-variant"></div> Natural Titanium
                    </td>
                  </tr>
                  <tr className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                    <td className="p-sm font-label-md text-label-md text-on-surface-variant">Display</td>
                    <td className="p-sm font-body-md text-body-md text-on-surface">6.7-inch Super Retina XDR OLED</td>
                  </tr>
                  <tr className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                    <td className="p-sm font-label-md text-label-md text-on-surface-variant">Processor</td>
                    <td className="p-sm font-body-md text-body-md text-on-surface">A17 Pro chip</td>
                  </tr>
                  <tr className="hover:bg-surface-container-high transition-colors">
                    <td className="p-sm font-label-md text-label-md text-on-surface-variant">Operating System</td>
                    <td className="p-sm font-body-md text-body-md text-on-surface">iOS 17</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Description (Raw) */}
          <section>
            <h2 className="font-headline-md text-headline-md text-on-background mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-outline">description</span> Raw Description
            </h2>
            <div className="bg-surface-container p-md rounded-xl shadow-sm">
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed line-clamp-4">
                The iPhone 15 Pro Max is forged in titanium and features the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever. Experience incredible detail with the 48MP Main camera and get closer than ever with the 5x Telephoto lens. USB-C support brings faster transfer speeds and universal compatibility.
              </p>
            </div>
          </section>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="col-span-1 lg:col-span-5 flex flex-col gap-lg">
          <section className="relative bg-surface-container rounded-xl p-md shadow-sm overflow-hidden h-full flex flex-col">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex justify-between items-center mb-md relative z-10">
              <h2 className="font-headline-md text-headline-md text-on-background flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">auto_awesome</span> AI Analysis
              </h2>
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="flex items-center gap-xs px-sm py-xs bg-primary text-on-primary font-label-sm text-label-sm rounded-lg hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                {showReasoning ? "Hide Reasoning" : "View Reasoning"}
              </button>
            </div>

            {showReasoning && (
              <div className="mb-md p-sm bg-surface-container-high rounded-lg border border-primary/20 text-body-sm text-on-surface-variant relative z-10">
                <p className="font-label-sm text-primary uppercase tracking-wider mb-xs">Reasoning Graph</p>
                <p>Listing verified against Apple manufacturer catalog. High fidelity matches on titanium composition, 256GB storage SKU mapping, and authorized reseller profile.</p>
              </div>
            )}

            <div className="flex flex-col gap-md relative z-10 flex-1">
              {/* Extracted Attributes */}
              <div>
                <h3 className="font-label-sm text-label-sm text-outline uppercase tracking-widest mb-sm">Extracted Attributes</h3>
                <div className="flex flex-wrap gap-sm">
                  <span className="px-sm py-xs bg-surface text-on-surface font-body-sm text-body-sm rounded-md border border-outline-variant/30 flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px] text-primary">check</span> 5x Telephoto
                  </span>
                  <span className="px-sm py-xs bg-surface text-on-surface font-body-sm text-body-sm rounded-md border border-outline-variant/30 flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px] text-primary">check</span> Titanium Frame
                  </span>
                  <span className="px-sm py-xs bg-surface text-on-surface font-body-sm text-body-sm rounded-md border border-outline-variant/30 flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px] text-primary">check</span> USB-C
                  </span>
                  <span className="px-sm py-xs bg-surface text-on-surface font-body-sm text-body-sm rounded-md border border-outline-variant/30 flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px] text-primary">check</span> Action Button
                  </span>
                </div>
              </div>
              {/* Semantic Understanding */}
              <div className="mt-auto">
                <h3 className="font-label-sm text-label-sm text-outline uppercase tracking-widest mb-sm">Semantic Classification</h3>
                <div className="bg-surface p-sm rounded-lg border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-xs">
                    <span className="font-body-sm text-body-sm text-on-surface">Category Map</span>
                    <span className="font-label-sm text-label-sm text-secondary">99% Confidence</span>
                  </div>
                  <div className="flex items-center gap-xs font-mono text-[11px] text-on-surface-variant overflow-hidden whitespace-nowrap">
                    <span className="text-primary">Electronics</span> <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    <span>Mobile Phones</span> <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    <span className="text-on-surface font-semibold bg-surface-container-highest px-1 rounded truncate">Smartphones (Flagship)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Similar Products */}
      <section className="mt-xl">
        <h2 className="font-headline-md text-headline-md text-on-background mb-lg flex items-center gap-sm">
          <span className="material-symbols-outlined text-outline">join_inner</span> Similar Products (Potential Duplicates)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {/* Card 1 */}
          <div className="bg-surface-container rounded-xl p-sm shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <div className="flex gap-sm mb-sm">
              <div className="w-16 h-16 rounded-lg bg-surface flex-shrink-0 overflow-hidden">
                <div
                  className="bg-cover bg-center w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD1gSrBxcTeNhHFlnNkUF4BIUne3j468KjAFlmJk9DduLTQQ89LHeMMSoIM3-dXFQAqTDZZYyYKj3F8GSlIem3UO-WJSa8_CPFpbe1CAWn4Bhr2GRxNkC5HCHpqoBgRdlsibd43vIrRiaeaWfGKXGo11jP1B9AOeTEiX9RWrGgpPbKUHcH2UO-jlY5gymHPBA-SrWxleS2Yl0bgAGU0LgIXAxjXRlrquLD0lJeQivDYLXzDmENO28fu')",
                  }}
                ></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-label-md text-label-md text-on-surface truncate">iPhone 15 Pro Max 256GB - Nat Titanium</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">Global Tech Store</p>
                <p className="font-body-sm text-body-sm text-outline font-mono mt-xs text-[10px]">SKU: AP-15PM-256-NT</p>
              </div>
            </div>
            <div className="mt-auto pt-sm border-t border-outline-variant/10 flex items-center justify-between">
              <div className="flex items-center gap-xs">
                <span className="px-xs py-[2px] bg-error-container/20 text-error font-label-sm text-[10px] rounded">98% Match</span>
              </div>
              <button
                onClick={() => navigate("/duplicates/1")}
                className="text-primary font-label-sm text-label-sm hover:text-primary-fixed transition-colors"
              >
                Compare
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface-container rounded-xl p-sm shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <div className="flex gap-sm mb-sm">
              <div className="w-16 h-16 rounded-lg bg-surface flex-shrink-0 overflow-hidden">
                <div
                  className="bg-cover bg-center w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDN9t8jQIvLlR7WsDJgGF69sIay7cT12sLlerqoq-Jo3xAwHUafIuAbPy8qSvFwGbBFyVTRMezMmUuL9sUJIQCsQ1p4HfdquG1lisd7ELuD8vqDuZpuKfAUawxAgm7sm9vWF9setOF7xbzU4el9AmmbAbZLkoqonhz1h1IZ01YM6-mUQuhS09o60mRBcObWb7ItxQnSUeTNWQDWQb84oppZ3ZiRY0ars1_kjvN7nZLSd_qsDWWxkgEw')",
                  }}
                ></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-label-md text-label-md text-on-surface truncate">Apple iPhone 15 Pro Max (256GB, Titanium)</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">MegaMart Electronics</p>
                <p className="font-body-sm text-body-sm text-outline font-mono mt-xs text-[10px]">SKU: 885909951234</p>
              </div>
            </div>
            <div className="mt-auto pt-sm border-t border-outline-variant/10 flex items-center justify-between">
              <div className="flex items-center gap-xs">
                <span className="px-xs py-[2px] bg-tertiary-container/20 text-tertiary font-label-sm text-[10px] rounded">85% Match</span>
              </div>
              <button
                onClick={() => navigate("/duplicates/1")}
                className="text-primary font-label-sm text-label-sm hover:text-primary-fixed transition-colors"
              >
                Compare
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-container rounded-xl p-sm shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <div className="flex gap-sm mb-sm">
              <div className="w-16 h-16 rounded-lg bg-surface flex-shrink-0 overflow-hidden flex items-center justify-center">
                <span className="material-symbols-outlined text-outline text-[24px]">image_not_supported</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-label-md text-label-md text-on-surface truncate">iPhone 15 Pro 256GB Natural</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">QuickShip Goods</p>
                <p className="font-body-sm text-body-sm text-outline font-mono mt-xs text-[10px]">SKU: IP15P-256</p>
              </div>
            </div>
            <div className="mt-auto pt-sm border-t border-outline-variant/10 flex items-center justify-between">
              <div className="flex items-center gap-xs">
                <span className="px-xs py-[2px] bg-secondary-container/20 text-secondary font-label-sm text-[10px] rounded">42% Match</span>
              </div>
              <button
                onClick={() => navigate("/duplicates/1")}
                className="text-primary font-label-sm text-label-sm hover:text-primary-fixed transition-colors"
              >
                Compare
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
