import React, { useState, useEffect } from "react";
import { searchProducts } from "../../services/searchService";
import type {
  SearchMode,
  SearchResponse,
  QueryAnalysis,
} from "../../types/search";

const SUGGESTED_QUERIES = [
  "Rivet brick rug",
  "AmazonBasics glass drinkware set",
  "Stone & Beam blooming medallion dark grey",
  "large brick colored area rug",
  "palm frond wall art",
  "USB wired mouse",
];

export const SearchPlaygroundPage: React.FC = () => {
  const [query, setQuery] = useState("Rivet brick rug");
  const [mode, setMode] = useState<SearchMode>("Hybrid");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [minScore, setMinScore] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [viewMode, setViewMode] = useState<"details" | "json">("details");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);

  const executeSearch = async (
    targetQuery = query,
    targetMode = mode,
    targetPage = page,
    targetBrand = brandFilter,
    targetCategory = categoryFilter,
    targetMinScore = minScore
  ) => {
    if (!targetQuery.trim()) {
      setSearchResponse(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await searchProducts({
        query: targetQuery.trim(),
        mode: targetMode,
        brand: targetBrand.trim() || undefined,
        category: targetCategory.trim() || undefined,
        minScore: targetMinScore !== undefined ? targetMinScore : undefined,
        page: targetPage,
        pageSize,
      });
      setSearchResponse(res);
    } catch (err: any) {
      setError(err?.message || "Search request failed. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(query, mode, page, brandFilter, categoryFilter, minScore);
  }, [mode, page, brandFilter, categoryFilter, minScore]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    executeSearch(query, mode, 1, brandFilter, categoryFilter, minScore);
  };

  const handleSelectSuggested = (suggested: string) => {
    setQuery(suggested);
    setPage(1);
    executeSearch(suggested, mode, 1, brandFilter, categoryFilter, minScore);
  };

  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode);
    setPage(1);
  };

  const handleResetFilters = () => {
    setBrandFilter("");
    setCategoryFilter("");
    setMinScore(undefined);
    setPage(1);
  };

  const getRelevanceBadgeColor = (percent: number) => {
    if (percent >= 70) return "bg-secondary/15 text-secondary border-secondary/30";
    if (percent >= 40) return "bg-primary/15 text-primary border-primary/30";
    return "bg-outline/15 text-outline border-outline/30";
  };

  const queryAnalysis: QueryAnalysis | null = searchResponse?.queryAnalysis || null;

  return (
    <div className="flex flex-col w-full min-h-screen gap-xl pb-2xl">
      <div className="flex flex-col gap-xs">
        <div className="flex items-center gap-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">travel_explore</span>
          </div>
          <div>
            <h1 className="font-headline-xl text-headline-xl text-on-background font-bold">Search Playground</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Evaluate real-time lexical keyword matching, pgvector semantic similarity, and hybrid ranking on the ABO catalog.
            </p>
          </div>
        </div>
      </div>

      <section className="relative bg-surface-container rounded-[28px] p-xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col gap-md relative z-10">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-sm">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[24px]">search</span>
              <input
                type="text"
                placeholder="Search catalog by title, brand, category, or natural description..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-surface-container-high border border-outline-variant/20 rounded-2xl font-body-lg text-body-lg text-on-surface focus:outline-none focus:border-primary shadow-inner"
              />
            </div>

            <div className="flex items-center bg-surface-container-high p-1 rounded-2xl border border-outline-variant/10 self-center lg:self-auto shrink-0">
              {(["Hybrid", "Keyword", "Semantic"] as SearchMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleModeChange(m)}
                  className={`px-md py-2 rounded-xl font-label-md text-label-md font-bold transition-all ${
                    mode === m
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-xl py-3.5 bg-primary text-on-primary rounded-2xl font-label-lg text-label-lg font-bold shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-xs disabled:opacity-60"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">bolt</span>
              )}
              <span>Execute</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-xs pt-xs">
            <span className="font-label-sm text-label-sm text-outline font-medium mr-xs">Sample ABO Queries:</span>
            {SUGGESTED_QUERIES.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggested(sq)}
                className="px-sm py-1 rounded-lg bg-surface-container-high/80 border border-outline-variant/10 text-on-surface-variant font-label-sm text-label-sm hover:text-primary hover:border-primary/40 hover:bg-surface-container-highest transition-all"
              >
                "{sq}"
              </button>
            ))}
          </div>
        </form>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-xl items-start">
        <div className="xl:col-span-4 flex flex-col gap-lg">
          <div className="bg-surface-container rounded-[24px] p-lg border border-outline-variant/10 shadow-sm flex flex-col gap-md">
            <div className="flex items-center justify-between pb-sm border-b border-outline-variant/10">
              <div className="flex items-center gap-xs text-primary font-bold">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
                <h3 className="font-title-md text-title-md text-on-background">Query Intelligence</h3>
              </div>
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase font-mono bg-surface-container-high px-sm py-0.5 rounded-md">
                Deterministic
              </span>
            </div>

            {queryAnalysis ? (
              <div className="flex flex-col gap-md">
                <div className="flex flex-col gap-xs">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Search Intent</span>
                  <div className="inline-flex items-center gap-xs px-sm py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-label-md text-label-md font-bold self-start">
                    <span className="material-symbols-outlined text-[16px]">target</span>
                    {queryAnalysis.searchIntent}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-sm">
                  <div className="p-sm rounded-xl bg-surface-container-high border border-outline-variant/10 flex flex-col gap-0.5">
                    <span className="text-[11px] text-outline font-medium">Detected Brand</span>
                    <span className="font-label-md text-label-md text-on-surface font-bold truncate">
                      {queryAnalysis.detectedBrand || "None"}
                    </span>
                  </div>

                  <div className="p-sm rounded-xl bg-surface-container-high border border-outline-variant/10 flex flex-col gap-0.5">
                    <span className="text-[11px] text-outline font-medium">Detected Category</span>
                    <span className="font-label-md text-label-md text-on-surface font-bold truncate">
                      {queryAnalysis.detectedCategory || "None"}
                    </span>
                  </div>
                </div>

                {queryAnalysis.detectedModel && (
                  <div className="p-sm rounded-xl bg-surface-container-high border border-outline-variant/10 flex flex-col gap-0.5">
                    <span className="text-[11px] text-outline font-medium">Detected ASIN / Model</span>
                    <span className="font-mono text-label-md text-secondary font-bold">
                      {queryAnalysis.detectedModel}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-xs">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Extracted Keywords</span>
                  <div className="flex flex-wrap gap-xs">
                    {queryAnalysis.keyTerms.map((term, idx) => (
                      <span
                        key={idx}
                        className="px-sm py-0.5 rounded-md bg-surface-container-highest border border-outline-variant/10 text-on-surface font-mono text-[12px]"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-xs border-t border-outline-variant/10">
                  <span>Visual Adjectives Detected:</span>
                  <span className="font-bold text-on-surface">
                    {queryAnalysis.hasVisualAdjectives ? "Yes (Color / Texture)" : "No"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-md text-center text-on-surface-variant font-body-sm text-body-sm">
                Run a search query to inspect automatic query normalization and token extraction.
              </div>
            )}
          </div>

          <div className="bg-surface-container rounded-[24px] p-lg border border-outline-variant/10 shadow-sm flex flex-col gap-md">
            <div className="flex items-center justify-between pb-sm border-b border-outline-variant/10">
              <div className="flex items-center gap-xs font-bold text-on-surface">
                <span className="material-symbols-outlined text-[20px] text-outline">tune</span>
                <h3 className="font-title-md text-title-md">Search Filters</h3>
              </div>
              {(brandFilter || categoryFilter || minScore !== undefined) && (
                <button
                  onClick={handleResetFilters}
                  className="font-label-sm text-label-sm text-primary hover:underline font-bold"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="flex flex-col gap-sm">
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-outline">Brand Filter</label>
                <input
                  type="text"
                  placeholder="e.g. Rivet, AmazonBasics"
                  value={brandFilter}
                  onChange={(e) => {
                    setBrandFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-sm py-1.5 bg-surface-container-high border border-outline-variant/10 rounded-xl font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-outline">Category Filter</label>
                <input
                  type="text"
                  placeholder="e.g. RUG, PILLOW"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-sm py-1.5 bg-surface-container-high border border-outline-variant/10 rounded-xl font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-outline">
                  Min Relevance Threshold ({minScore !== undefined ? `${(minScore * 100).toFixed(0)}%` : "None"})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={minScore ?? 0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setMinScore(val > 0 ? val : undefined);
                    setPage(1);
                  }}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          </div>

          <div className="p-md rounded-2xl bg-surface-container-high/40 border border-outline-variant/10 flex flex-col gap-xs text-[12px] text-on-surface-variant leading-relaxed">
            <div className="flex items-center gap-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-primary">info</span>
              Mental Model Distinction
            </div>
            <div>
              <strong className="text-on-background">Relevance Score:</strong> Measures how closely a catalog listing satisfies the user's search query.
            </div>
            <div>
              <strong className="text-on-background">Duplicate Score:</strong> Measures similarity between two existing catalog items.
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 flex flex-col gap-md">
          <div className="flex flex-wrap items-center justify-between gap-sm p-sm px-md bg-surface-container rounded-2xl border border-outline-variant/10">
            <div className="flex items-center gap-sm">
              <span className="font-body-md text-body-md text-on-surface">
                {searchResponse ? (
                  <>
                    Showing <strong className="text-primary font-bold">{searchResponse.results.length}</strong> of{" "}
                    <strong className="font-bold">{searchResponse.totalCount}</strong> ranked results
                  </>
                ) : (
                  "Ready to search"
                )}
              </span>
              {searchResponse && (
                <span className="font-mono text-[11px] text-on-surface-variant bg-surface-container-high px-sm py-0.5 rounded-md">
                  {searchResponse.executionTimeMs}ms latency
                </span>
              )}
            </div>

            <div className="flex items-center gap-sm">
              <div className="flex items-center bg-surface-container-high p-0.5 rounded-xl border border-outline-variant/10 text-[12px]">
                <button
                  type="button"
                  onClick={() => setViewMode("details")}
                  className={`px-sm py-1 rounded-lg font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-xs ${
                    viewMode === "details" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">view_list</span> Ranked List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("json")}
                  className={`px-sm py-1 rounded-lg font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-xs ${
                    viewMode === "json" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">data_object</span> Raw JSON
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col gap-md">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-lg rounded-[24px] bg-surface-container border border-outline-variant/10 animate-pulse flex flex-col gap-md"
                >
                  <div className="flex items-start gap-md">
                    <div className="w-14 h-14 rounded-xl bg-surface-container-high" />
                    <div className="w-20 h-20 rounded-xl bg-surface-container-high shrink-0" />
                    <div className="flex-1 flex flex-col gap-sm">
                      <div className="w-3/4 h-5 bg-surface-container-high rounded" />
                      <div className="w-1/2 h-4 bg-surface-container-high rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-xl rounded-[24px] bg-error/10 border border-error/20 text-error flex flex-col gap-sm items-start">
              <div className="flex items-center gap-xs font-bold text-headline-sm">
                <span className="material-symbols-outlined text-[24px]">error</span>
                Search Execution Failed
              </div>
              <p className="text-body-md text-on-surface">{error}</p>
              <button
                onClick={() => executeSearch()}
                className="mt-xs px-md py-1.5 bg-error text-on-error rounded-xl font-label-md text-label-md font-bold"
              >
                Retry Search
              </button>
            </div>
          ) : !searchResponse || searchResponse.results.length === 0 ? (
            <div className="p-2xl rounded-[24px] bg-surface-container border border-outline-variant/10 text-center flex flex-col items-center gap-md text-on-surface-variant min-h-[350px] justify-center">
              <span className="material-symbols-outlined text-[48px] text-outline">search_off</span>
              <h3 className="font-headline-sm text-headline-sm text-on-background font-bold">No Products Matched Query</h3>
              <p className="font-body-md text-body-md max-w-md">
                Try switching search modes to <strong>Hybrid</strong> or <strong>Semantic</strong>, or test one of the sample ABO queries above.
              </p>
            </div>
          ) : viewMode === "json" ? (
            <div className="bg-surface-container rounded-[24px] border border-outline-variant/10 p-lg font-mono text-[12px] text-on-surface-variant overflow-x-auto max-h-[750px]">
              <pre>{JSON.stringify(searchResponse, null, 2)}</pre>
            </div>
          ) : (
            <div className="flex flex-col gap-md">
              {searchResponse.results.map((r, idx) => {
                const rankNumber = (page - 1) * pageSize + idx + 1;
                const isTopResult = rankNumber === 1;

                return (
                  <div
                    key={r.productId}
                    className={`p-lg rounded-[24px] bg-surface-container border transition-all flex flex-col gap-md relative overflow-hidden ${
                      isTopResult
                        ? "border-primary/40 shadow-md bg-gradient-to-r from-primary/5 via-surface-container to-surface-container"
                        : "border-outline-variant/10 hover:border-outline-variant/40"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-md">
                      <div className="flex items-center gap-md shrink-0">
                        <div
                          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold font-headline-sm shadow-sm ${
                            rankNumber === 1
                              ? "bg-primary text-on-primary"
                              : rankNumber <= 3
                              ? "bg-primary/15 text-primary border border-primary/30"
                              : "bg-surface-container-high text-on-surface-variant border border-outline-variant/10"
                          }`}
                        >
                          #{rankNumber}
                        </div>

                        <img
                          src={r.mainImageUrl || "https://images-na.ssl-images-amazon.com/images/I/01RmK%2BJNmNL.png"}
                          alt={r.name}
                          className="w-20 h-20 rounded-xl object-cover border border-outline-variant/10 bg-surface-container-highest shrink-0 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images-na.ssl-images-amazon.com/images/I/01RmK%2BJNmNL.png";
                          }}
                        />
                      </div>

                      <div className="flex-1 flex flex-col min-w-0 gap-xs">
                        <div className="flex flex-wrap items-center gap-xs">
                          <span className="font-mono text-[11px] font-bold text-outline px-sm py-0.5 bg-surface-container-high rounded-md">
                            {r.amazonItemId}
                          </span>
                          {r.brand && (
                            <span className="font-label-sm text-[11px] font-bold text-primary px-sm py-0.5 bg-primary/10 rounded-md">
                              {r.brand}
                            </span>
                          )}
                          {r.category && (
                            <span className="font-label-sm text-[11px] font-medium text-on-surface-variant px-sm py-0.5 bg-surface-container-high rounded-md">
                              {r.category}
                            </span>
                          )}
                          {r.price && (
                            <span className="font-mono text-[11px] font-bold text-secondary px-sm py-0.5 bg-secondary/10 rounded-md ml-auto">
                              ${r.price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <h3 className="font-title-md text-title-md text-on-surface font-bold leading-snug line-clamp-2">
                          {r.name}
                        </h3>

                        {r.modelNumber && (
                          <div className="text-[11px] text-on-surface-variant font-mono">
                            Model: <strong className="text-on-surface">{r.modelNumber}</strong>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end shrink-0 sm:ml-auto">
                        <div
                          className={`px-md py-1.5 rounded-xl font-headline-md text-headline-md font-extrabold border ${getRelevanceBadgeColor(
                            r.relevancePercent
                          )}`}
                        >
                          {r.relevancePercent}%
                        </div>
                        <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider mt-0.5">
                          Relevance Score
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-md p-sm px-md rounded-xl bg-surface-container-low border border-outline-variant/10">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between font-label-sm text-[11px] text-on-surface-variant">
                          <span>Keyword Match (Lexical)</span>
                          <span className="font-bold text-on-surface">{(r.keywordScore * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.max(3, r.keywordScore * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between font-label-sm text-[11px] text-on-surface-variant">
                          <span>Semantic Match (pgvector)</span>
                          <span className="font-bold text-on-surface">{(r.semanticScore * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary rounded-full transition-all"
                            style={{ width: `${Math.max(3, r.semanticScore * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-sm pt-xs border-t border-outline-variant/10">
                      <div className="flex items-center gap-xs font-body-sm text-[12px] text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                        <span>{r.explanation}</span>
                      </div>

                      {r.matchedFields && r.matchedFields.length > 0 && (
                        <div className="flex items-center gap-xs">
                          <span className="text-[10px] text-outline uppercase font-semibold">Matched:</span>
                          {r.matchedFields.map((f, i) => (
                            <span
                              key={i}
                              className="px-xs py-0.5 bg-surface-container-high text-on-surface font-label-sm text-[10px] rounded border border-outline-variant/10 font-medium"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {searchResponse.totalCount > pageSize && (
                <div className="flex items-center justify-between pt-md border-t border-outline-variant/10 font-label-sm text-label-sm text-on-surface-variant">
                  <span>
                    Page {searchResponse.page} of {Math.ceil(searchResponse.totalCount / pageSize)}
                  </span>
                  <div className="flex items-center gap-xs">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-md py-1.5 rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface hover:bg-surface-variant disabled:opacity-40 disabled:cursor-not-allowed font-bold"
                    >
                      Previous
                    </button>
                    <button
                      disabled={page * pageSize >= searchResponse.totalCount}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-md py-1.5 rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface hover:bg-surface-variant disabled:opacity-40 disabled:cursor-not-allowed font-bold"
                    >
                      Next
                    </button>
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
