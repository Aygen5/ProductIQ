import React, { useState } from "react";

export const SearchPlaygroundPage: React.FC = () => {
  const [query, setQuery] = useState("black nike running shoes");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [viewMode, setViewMode] = useState<"details" | "json">("details");

  return (
    <div className="flex flex-col w-full gap-xl">
      <section className="flex flex-col gap-sm">
        <div className="flex flex-col">
          <h1 className="font-headline-xl text-headline-xl text-on-background">Search Playground</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-xs">
            Test product queries and understand why results are ranked in real-time.
          </p>
        </div>
      </section>

      {/* Query Section */}
      <section className="relative bg-surface-container-low rounded-3xl p-xl shadow-lg border border-outline-variant/20 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 transition-opacity duration-700 group-hover:opacity-100"></div>
        <div className="relative z-10 flex flex-col gap-lg items-center">
          <div className="w-full max-w-4xl relative">
            <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline text-[28px]">search</span>
            </div>
            <input
              className="w-full bg-surface-container h-20 pl-xl pr-md rounded-2xl font-body-lg text-body-lg text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline/50 shadow-inner"
              placeholder="Test a query..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-md flex items-center gap-sm">
              <button className="bg-primary/10 text-primary hover:bg-primary/20 px-sm py-xs rounded-lg font-label-md text-label-md transition-colors flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">tune</span> Adjust Weights
              </button>
              <button className="bg-primary text-on-primary px-lg py-sm rounded-xl font-label-md text-label-md shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95">
                Run Query
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-md font-body-sm text-body-sm text-outline">
            <span>Suggested:</span>
            <button
              onClick={() => setQuery("wireless noise cancelling headphones")}
              className="hover:text-primary transition-colors border border-outline-variant/30 rounded-full px-sm py-xs bg-surface-container-lowest"
            >
              "wireless noise cancelling headphones"
            </button>
            <button
              onClick={() => setQuery("ergonomic office chair")}
              className="hover:text-primary transition-colors border border-outline-variant/30 rounded-full px-sm py-xs bg-surface-container-lowest"
            >
              "ergonomic office chair"
            </button>
            <button
              onClick={() => setQuery("4k gaming monitor 144hz")}
              className="hover:text-primary transition-colors border border-outline-variant/30 rounded-full px-sm py-xs bg-surface-container-lowest"
            >
              "4k gaming monitor 144hz"
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Left column (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-md">
          <div className="bg-surface-container-lowest rounded-2xl p-md border border-outline-variant/10 shadow-sm sticky top-[100px]">
            <div className="flex items-center justify-between mb-sm">
              <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider text-outline">Ranking Controls</h3>
              <span className="material-symbols-outlined text-outline text-[18px]">sort</span>
            </div>
            <div className="flex flex-col gap-lg mt-md">
              <div className="flex flex-col gap-xs">
                <div className="flex justify-between font-label-sm text-label-sm">
                  <span className="text-on-surface">Relevance Weight</span>
                  <span className="text-primary">High (2x)</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden relative">
                  <div className="absolute left-0 top-0 h-full bg-primary w-[80%] rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                </div>
              </div>
              <div className="flex flex-col gap-xs">
                <div className="flex justify-between font-label-sm text-label-sm">
                  <span className="text-on-surface">Popularity (CTR)</span>
                  <span className="text-outline">Normal (1x)</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden relative">
                  <div className="absolute left-0 top-0 h-full bg-outline w-[50%] rounded-full"></div>
                </div>
              </div>
              <div className="flex flex-col gap-xs">
                <div className="flex justify-between font-label-sm text-label-sm">
                  <span className="text-on-surface">Rating Boost</span>
                  <span className="text-outline">Low (0.5x)</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden relative">
                  <div className="absolute left-0 top-0 h-full bg-outline w-[25%] rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="mt-xl pt-md border-t border-outline-variant/10">
              <div className="flex items-center gap-sm mb-sm text-outline">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span className="font-label-sm text-label-sm uppercase tracking-widest">Query Intent</span>
              </div>
              <div className="flex flex-wrap gap-xs">
                <span className="px-xs py-[2px] bg-secondary-container/20 text-secondary border border-secondary/30 rounded font-label-sm text-[10px] uppercase">
                  Category: Footwear
                </span>
                <span className="px-xs py-[2px] bg-tertiary-container/20 text-tertiary border border-tertiary/30 rounded font-label-sm text-[10px] uppercase">
                  Brand: Nike
                </span>
                <span className="px-xs py-[2px] bg-surface-container-high text-on-surface-variant border border-outline-variant/30 rounded font-label-sm text-[10px] uppercase">
                  Color: Black
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column (9 cols) */}
        <div className="lg:col-span-9 flex flex-col gap-md">
          <div className="flex items-center justify-between px-xs mb-xs">
            <span className="font-body-sm text-body-sm text-outline">
              Showing top results for <strong className="text-on-surface font-semibold">"{query}"</strong> (45ms)
            </span>
            <div className="flex items-center gap-sm font-label-sm text-label-sm text-outline">
              <span>View:</span>
              <button
                onClick={() => setViewMode("details")}
                className={`px-sm py-xs rounded flex items-center gap-xs transition-colors ${
                  viewMode === "details" ? "text-primary bg-primary/10 font-medium" : "hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">view_list</span> Details
              </button>
              <button
                onClick={() => setViewMode("json")}
                className={`px-sm py-xs rounded flex items-center gap-xs transition-colors ${
                  viewMode === "json" ? "text-primary bg-primary/10 font-medium" : "hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">data_object</span> JSON
              </button>
            </div>
          </div>

          {viewMode === "json" ? (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-md font-mono text-body-sm text-on-surface-variant overflow-x-auto">
              <pre>{JSON.stringify(
                {
                  query,
                  executionTimeMs: 45,
                  totalResults: 1,
                  results: [
                    {
                      rank: 1,
                      product: "Nike Air Zoom Pegasus 40",
                      matchScore: 0.98,
                      textRelevance: 0.99,
                      semanticMatch: 0.95,
                      popularity: "High",
                      signals: ["Brand: Nike", "Category: Footwear", "Color: Black"]
                    }
                  ]
                },
                null,
                2
              )}</pre>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl border border-primary/30 p-md shadow-[0_8px_32px_rgba(79,70,229,0.05)] relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              <div className="flex items-start gap-lg">
                {/* Rank badge */}
                <div className="w-16 h-16 rounded-xl bg-surface-container-high flex flex-col items-center justify-center border border-outline-variant/20 flex-shrink-0 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
                  <span className="font-headline-md text-headline-md text-primary font-bold">#1</span>
                  <span className="font-label-sm text-[10px] text-outline uppercase">Rank</span>
                </div>

                {/* Product image */}
                <div className="w-24 h-24 rounded-lg bg-surface-container border border-outline-variant/10 flex-shrink-0 overflow-hidden relative">
                  <img
                    className="w-full h-full object-cover"
                    alt="Nike Air Zoom Pegasus 40"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0JnvFO2jv1dDdQ6Zf5YWIdbbIo7-kjXTeBstrc1DjP7u5vatK2vXH5_orclKgpxXf60BBWmjPXu9Rro2aGlXrPgpU4F3PLVM3__5fMDsemtm-UK5jEN0wt2RUK-vSNJZcQJZN0JZPKnMXCIqHSiTMbttvHncnXI-P1DTcFV288GGW2eba8q7EiZdkgtmSyUR8FQ7UIvY2NxFlzINyHGtG37y-EU6TyK0cfobdmC1dpNkqGtKHdOM6"
                  />
                  <div className="absolute bottom-xs right-xs bg-secondary-container/90 backdrop-blur text-secondary px-xs py-[2px] rounded font-label-sm text-[9px] flex items-center gap-[2px]">
                    <span className="material-symbols-outlined text-[10px]">check_circle</span> In Stock
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col min-w-0 pr-md">
                      <h4 className="font-headline-md text-headline-md text-on-surface truncate">Nike Air Zoom Pegasus 40</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate mt-xs">
                        Men's Road Running Shoes - Black/Anthracite
                      </p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                        <span className="font-headline-lg text-headline-lg text-secondary">
                          98<span className="text-body-sm text-outline">%</span>
                        </span>
                      </div>
                      <span className="font-label-sm text-label-sm text-outline uppercase">Match Score</span>
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="mt-md flex items-center gap-md w-full">
                    <div className="flex-1 flex flex-col gap-xs">
                      <div className="flex justify-between font-label-sm text-[10px] text-outline uppercase">
                        <span>Text Relevance</span>
                        <span className="text-on-surface font-semibold">99%</span>
                      </div>
                      <div className="w-full h-[4px] bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[99%]"></div>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-xs">
                      <div className="flex justify-between font-label-sm text-[10px] text-outline uppercase">
                        <span>Semantic Match</span>
                        <span className="text-on-surface font-semibold">95%</span>
                      </div>
                      <div className="w-full h-[4px] bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-secondary w-[95%]"></div>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-xs">
                      <div className="flex justify-between font-label-sm text-[10px] text-outline uppercase">
                        <span>Popularity</span>
                        <span className="text-on-surface font-semibold">High</span>
                      </div>
                      <div className="w-full h-[4px] bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-tertiary w-[85%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Explanation trigger */}
                <button
                  onClick={() => setShowAiPanel(!showAiPanel)}
                  className="h-full px-sm flex flex-col items-center justify-center text-primary/70 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/20"
                >
                  <span className="material-symbols-outlined mb-xs text-[24px]">auto_awesome</span>
                  <span className="font-label-sm text-[10px] uppercase text-center w-16">
                    Why this<br />result?
                  </span>
                </button>
              </div>

              {/* Collapsible AI Explanation */}
              {showAiPanel && (
                <div className="mt-md pt-md border-t border-outline-variant/20 bg-surface-container/50 rounded-xl p-md">
                  <div className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-[2px]">psychology</span>
                    <div className="flex flex-col gap-sm flex-1">
                      <p className="font-label-md text-label-md text-on-surface">AI Explanation</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        This product ranked #1 because it perfectly matches the exact brand ("Nike") and category ("running shoes") while
                        possessing an overwhelmingly high semantic similarity for "black" via the color variant "Black/Anthracite". It also
                        receives a +15% boost from recent high CTR on this specific query.
                      </p>
                      <div className="flex flex-wrap gap-sm mt-xs">
                        <span className="inline-flex items-center gap-xs px-xs py-[2px] bg-surface-container-high rounded border border-outline-variant/30 font-label-sm text-[10px] text-outline">
                          <span className="material-symbols-outlined text-[12px] text-secondary">check</span> Exact Match: Brand
                        </span>
                        <span className="inline-flex items-center gap-xs px-xs py-[2px] bg-surface-container-high rounded border border-outline-variant/30 font-label-sm text-[10px] text-outline">
                          <span className="material-symbols-outlined text-[12px] text-secondary">check</span> Exact Match: Category
                        </span>
                        <span className="inline-flex items-center gap-xs px-xs py-[2px] bg-surface-container-high rounded border border-outline-variant/30 font-label-sm text-[10px] text-outline">
                          <span className="material-symbols-outlined text-[12px] text-tertiary">trending_up</span> Boost: Popularity
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
