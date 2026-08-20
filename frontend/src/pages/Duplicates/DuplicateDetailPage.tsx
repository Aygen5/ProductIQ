import React from "react";
import { useNavigate } from "react-router-dom";

export const DuplicateDetailPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full relative">
      <div className="absolute top-0 right-0 w-3/4 h-[800px] bg-gradient-radial from-primary/5 via-primary/[0.02] to-transparent pointer-events-none mix-blend-screen transform translate-x-1/4 -translate-y-1/4 z-0"></div>

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl relative z-10 w-full max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-xs">
          <div className="flex items-center gap-xs font-label-sm text-label-sm text-outline uppercase tracking-[0.1em]">
            <span onClick={() => navigate("/duplicates")} className="hover:text-on-background transition-colors cursor-pointer">
              Duplicates
            </span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            <span className="text-primary font-bold">Analysis</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-background tracking-tight">Duplicate Analysis</h1>
        </div>

        <div className="flex items-center gap-md">
          <button className="px-md py-sm rounded-xl font-label-md text-label-md border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center gap-base">
            <span className="material-symbols-outlined text-[18px]">history</span>
            View History
          </button>
          <div className="h-8 w-px bg-outline-variant/20"></div>
          <button className="px-md py-sm rounded-xl font-label-md text-label-md bg-error-container/20 text-error hover:bg-error-container/30 transition-colors border border-error/20 flex items-center gap-base">
            <span className="material-symbols-outlined text-[18px]">close</span>
            Not a Duplicate
          </button>
          <button className="px-md py-sm rounded-xl font-label-md text-label-md bg-secondary-container text-on-secondary-container hover:bg-secondary transition-colors shadow-lg shadow-secondary-container/20 flex items-center gap-base">
            <span className="material-symbols-outlined text-[18px]">check</span>
            Confirm Duplicate
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="w-full max-w-screen-2xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-lg relative z-10">
        {/* Left Column (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-lg">
          {/* Side by side comparison card */}
          <div className="bg-surface-container-low rounded-[24px] p-lg border border-outline-variant/10 shadow-2xl shadow-black/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-surface-container to-surface-container-lowest opacity-50 z-0"></div>

            {/* Central Score Badge */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-surface-container-lowest border border-outline-variant/20 shadow-2xl shadow-black flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer backdrop-blur-xl">
                <svg className="absolute inset-0 w-full h-full -rotate-90 z-0" viewBox="0 0 100 100">
                  <circle className="stroke-surface-container-high" cx="50" cy="50" fill="none" r="46" strokeWidth="4"></circle>
                  <circle
                    className="stroke-error drop-shadow-[0_0_8px_rgba(255,180,171,0.5)]"
                    cx="50"
                    cy="50"
                    fill="none"
                    r="46"
                    strokeDasharray="289"
                    strokeDashoffset="17.34"
                    strokeLinecap="round"
                    strokeWidth="4"
                  ></circle>
                </svg>
                <div className="relative z-10 flex flex-col items-center mt-xs">
                  <span className="font-headline-lg text-headline-lg text-error leading-none">
                    94<span className="text-[16px] text-error/70">%</span>
                  </span>
                </div>
              </div>
              <div className="mt-4 px-md py-xs rounded-full bg-error-container/20 border border-error/20 backdrop-blur-md">
                <span className="font-label-sm text-label-sm text-error uppercase tracking-widest">Potential Duplicate</span>
              </div>
            </div>

            {/* Product Comparison Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md relative z-10">
              {/* Product A */}
              <div className="flex flex-col gap-md bg-surface-container-lowest/50 rounded-2xl p-md border border-outline-variant/10 group hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="px-sm py-xs rounded-lg bg-surface-container font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    Product A
                  </div>
                  <span className="font-body-sm text-[12px] text-outline font-mono bg-surface p-xs rounded">SKU: NK-AM270-BLK</span>
                </div>
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-surface-container flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity z-0">
                    <span className="material-symbols-outlined text-outline text-[48px]">image</span>
                  </div>
                  <div
                    className="w-full h-full bg-cover bg-center mix-blend-luminosity hover:mix-blend-normal transition-all duration-500 scale-100 hover:scale-105 z-10 relative"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDd6KUBmSOBkZRxJoAG6yH7L60xgAEBP6aOhQ7JkZtV55Ia2NH0rg917GA20uuKcupYr7X6e6ikk9U6fqHP3S7EyIVHZ554oEU5V_OpM5myE6XXbQKGIvEeRlwe7iKgTbwe9-pVbkmP4PAkiUbvqHRBVno8yy66QcMXsTtPVwAcJHD12-RdqC0iIqFfYMidjynXF3QdywgoEcQiPXD2dJSqlYtWuKA6ky2jLr7Nai5pD7hxPVfYVXKb')",
                    }}
                  ></div>
                </div>
                <div className="flex flex-col gap-xs mt-sm">
                  <h3 className="font-headline-md text-headline-md text-on-background line-clamp-1">Nike Air Max 270 Men's Running Shoes</h3>
                  <div className="flex items-center gap-sm">
                    <span className="font-label-md text-label-md text-primary bg-primary/10 px-xs py-[2px] rounded">Nike</span>
                    <span className="font-body-sm text-body-sm text-outline-variant">•</span>
                    <span className="font-body-md text-body-md text-on-surface">$160.00</span>
                  </div>
                </div>
              </div>

              {/* Product B */}
              <div className="flex flex-col gap-md bg-surface-container-lowest/50 rounded-2xl p-md border border-outline-variant/10 group hover:border-error/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="px-sm py-xs rounded-lg bg-surface-container font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
                    Product B
                  </div>
                  <span className="font-body-sm text-[12px] text-error font-mono bg-error-container/10 p-xs rounded border border-error/20">
                    SKU: NK-270-AM-B
                  </span>
                </div>
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-surface-container flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity z-0">
                    <span className="material-symbols-outlined text-outline text-[48px]">image</span>
                  </div>
                  <div
                    className="w-full h-full bg-cover bg-center mix-blend-luminosity hover:mix-blend-normal transition-all duration-500 scale-100 hover:scale-105 z-10 relative"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA8jlOj1iGsE770Evlal91C_HIeLDMoEWavsAu26sX4bIimT-nkNJ1EQByolpBQckzTedqZHIgE5jRVE9ZAASD1t6aDazsaspUnQrlYE39K28lYpXIe6QmoYzJPQsGXSNMyZC3YTPDEzvcw2LEzts-JICnj0lyyIyiHyaXRM_w3_LPeMYio1HZ__K6zXHPWoth0SP7vf80et-jM2A8PJYITRtGQmRHySqREI2pJKGMa0CYEXeuoqcXN')",
                    }}
                  ></div>
                </div>
                <div className="flex flex-col gap-xs mt-sm">
                  <h3 className="font-headline-md text-headline-md text-on-background line-clamp-1">Nike Men's Air Max 270 Sneaker - Black</h3>
                  <div className="flex items-center gap-sm">
                    <span className="font-label-md text-label-md text-primary bg-primary/10 px-xs py-[2px] rounded">Nike</span>
                    <span className="font-body-sm text-body-sm text-outline-variant">•</span>
                    <span className="font-body-md text-body-md text-on-surface">$159.99</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similarity Breakdown Card */}
          <div className="bg-surface-container-low rounded-[24px] p-xl border border-outline-variant/10 flex flex-col gap-lg">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-[28px]">insights</span>
              <h2 className="font-headline-lg text-headline-lg text-on-background">Similarity Breakdown</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
              <div className="flex flex-col gap-md">
                <div className="flex justify-between items-end mb-xs">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-outline">match_word</span>
                    <span className="font-label-md text-label-md text-on-surface">Text Similarity</span>
                  </div>
                  <span className="font-label-md text-label-md text-tertiary">91%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full w-[91%] shadow-[0_0_10px_rgba(255,185,95,0.4)]"></div>
                </div>
                <p className="font-body-sm text-body-sm text-outline text-balance">High overlap in product titles and descriptions. Minor variations in wording.</p>
              </div>

              <div className="flex flex-col gap-md">
                <div className="flex justify-between items-end mb-xs">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-outline">psychology</span>
                    <span className="font-label-md text-label-md text-on-surface">Semantic Match</span>
                  </div>
                  <span className="font-label-md text-label-md text-error">96%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-error rounded-full w-[96%] shadow-[0_0_10px_rgba(255,180,171,0.4)]"></div>
                </div>
                <p className="font-body-sm text-body-sm text-outline text-balance">Core product meaning is nearly identical. AI interprets these as the same entity.</p>
              </div>

              <div className="flex flex-col gap-md">
                <div className="flex justify-between items-end mb-xs">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-outline">format_list_bulleted</span>
                    <span className="font-label-md text-label-md text-on-surface">Attribute Match</span>
                  </div>
                  <span className="font-label-md text-label-md text-error">94%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-error rounded-full w-[94%] shadow-[0_0_10px_rgba(255,180,171,0.4)]"></div>
                </div>
                <p className="font-body-sm text-body-sm text-outline text-balance">Brand, color, and category attributes align perfectly. Size arrays differ slightly.</p>
              </div>

              <div className="flex flex-col gap-md">
                <div className="flex justify-between items-end mb-xs">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-outline">image_search</span>
                    <span className="font-label-md text-label-md text-on-surface">Visual Similarity</span>
                  </div>
                  <span className="font-label-md text-label-md text-secondary">89%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full w-[89%] shadow-[0_0_10px_rgba(78,222,163,0.4)]"></div>
                </div>
                <p className="font-body-sm text-body-sm text-outline text-balance">Images share subject matter and composition. Possible resolution or crop differences.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-lg">
          {/* AI Synopsis Card */}
          <div className="bg-primary/5 rounded-[24px] p-lg border border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-lg opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <span className="material-symbols-outlined text-[120px] text-primary">smart_toy</span>
            </div>
            <div className="relative z-10 flex flex-col gap-md">
              <div className="flex items-center gap-sm mb-sm">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
                </div>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">AI Synopsis</span>
              </div>
              <p className="font-body-lg text-body-lg text-on-background leading-relaxed">
                These listings highly likely represent the exact same <strong className="text-primary font-medium">Nike Air Max 270</strong> model.
              </p>
              <p className="font-body-md text-body-md text-outline">
                The semantic engine detected intentional title variation typical of dropshippers or unauthorized resellers aiming to avoid direct SKU matching algorithms.
              </p>
              <div className="mt-md p-md bg-surface-container-lowest/50 rounded-xl border border-outline-variant/10 font-mono text-[12px] text-on-surface-variant flex flex-col gap-xs">
                <div className="flex justify-between">
                  <span>Confidence Score:</span> <span className="text-error font-bold">0.942</span>
                </div>
                <div className="flex justify-between">
                  <span>Anomaly Type:</span> <span>Title Obfuscation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Flagging Criteria Card */}
          <div className="bg-surface-container-low rounded-[24px] p-lg border border-outline-variant/10 flex flex-col gap-md">
            <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-sm">Flagging Criteria</h3>
            <div className="flex flex-col gap-0">
              <div className="flex items-start gap-md py-sm border-b border-outline-variant/10">
                <div className="w-6 h-6 rounded-full bg-error-container/30 flex items-center justify-center flex-shrink-0 mt-[2px]">
                  <span className="material-symbols-outlined text-error text-[14px]">priority_high</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">Exact Brand Match</span>
                  <span className="font-body-sm text-[12px] text-outline">Both explicitly claim 'Nike'</span>
                </div>
              </div>
              <div className="flex items-start gap-md py-sm border-b border-outline-variant/10">
                <div className="w-6 h-6 rounded-full bg-error-container/30 flex items-center justify-center flex-shrink-0 mt-[2px]">
                  <span className="material-symbols-outlined text-error text-[14px]">priority_high</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">Model Number Overlap</span>
                  <span className="font-body-sm text-[12px] text-outline">'270' found in unstructured text</span>
                </div>
              </div>
              <div className="flex items-start gap-md py-sm border-b border-outline-variant/10">
                <div className="w-6 h-6 rounded-full bg-error-container/30 flex items-center justify-center flex-shrink-0 mt-[2px]">
                  <span className="material-symbols-outlined text-error text-[14px]">priority_high</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">Image Hash Collision</span>
                  <span className="font-body-sm text-[12px] text-outline">Perceptual hash distance &lt; 5</span>
                </div>
              </div>
              <div className="flex items-start gap-md py-sm">
                <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 mt-[2px]">
                  <span className="material-symbols-outlined text-outline text-[14px]">check</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-outline">Price Variance</span>
                  <span className="font-body-sm text-[12px] text-outline-variant">Variance of 0.01% is negligible</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-lg flex flex-col gap-sm">
            <button className="w-full py-md rounded-xl font-label-md text-label-md text-on-surface-variant hover:text-on-surface border border-outline-variant/30 hover:bg-surface-container-high transition-colors flex items-center justify-center gap-sm">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
              Escalate to Legal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
