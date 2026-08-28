import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDuplicateCandidates, fetchDuplicateSummary } from "../../services/duplicateService";
import type { DuplicateCandidateSummary, DuplicateCandidatesSummary } from "../../types/duplicate";

export const DuplicateQueuePage: React.FC = () => {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<DuplicateCandidateSummary[]>([]);
  const [summary, setSummary] = useState<DuplicateCandidatesSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [minScore, setMinScore] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState<string>("");
  const [brandFilter, setBrandFilter] = useState<string>("");

  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchDuplicateSummary();
      setSummary(data);
    } catch {
    }
  }, []);

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDuplicateCandidates({
        page,
        pageSize,
        minScore,
        search: search.trim() || undefined,
        brand: brandFilter.trim() || undefined,
        sortBy: "score",
        sortDirection: "desc",
      });

      setCandidates(res.items);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to load duplicate candidates.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, minScore, search, brandFilter]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const parseSignals = (matchSignals: string | null) => {
    if (!matchSignals) return null;
    try {
      return JSON.parse(matchSignals);
    } catch {
      return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.55) return "text-primary stroke-primary bg-primary-container/20 text-on-primary-container";
    if (score >= 0.45) return "text-tertiary stroke-tertiary bg-tertiary-container/20 text-on-tertiary-container";
    return "text-secondary stroke-secondary bg-secondary-container/20 text-on-secondary-container";
  };

  return (
    <div className="flex flex-col w-full relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: "8s" }}></div>

      <div className="flex flex-col gap-lg z-10">
        <header className="flex flex-col gap-xs mb-md">
          <h1 className="font-headline-xl text-headline-xl text-on-background tracking-tight">Duplicate Detection</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Review product pairs detected by the automated matching pipeline with multi-signal similarity scores.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="flex flex-col p-md bg-surface-container rounded-2xl shadow-sm hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-tertiary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Total Candidates</span>
              <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-tertiary-container text-[18px]">find_in_page</span>
              </div>
            </div>
            <span className="font-headline-xl text-headline-xl text-on-surface">
              {summary ? summary.totalCandidates.toLocaleString() : "--"}
            </span>
            <div className="mt-xs font-body-sm text-body-sm text-tertiary">
              {summary ? `${summary.scoredCandidates} pairs scored` : "Scoring active"}
            </div>
          </div>

          <div className="flex flex-col p-md bg-surface-container rounded-2xl shadow-sm hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">High Confidence</span>
              <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container text-[18px]">auto_awesome</span>
              </div>
            </div>
            <span className="font-headline-xl text-headline-xl text-on-surface">
              {summary ? summary.highConfidenceCount.toLocaleString() : "--"}
            </span>
            <div className="mt-xs font-body-sm text-body-sm text-secondary">
              {summary ? `${summary.mediumConfidenceCount} medium, ${summary.lowConfidenceCount} low` : ""}
            </div>
          </div>

          <div className="flex flex-col p-md bg-primary-container rounded-2xl shadow-md hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-sm text-label-sm text-on-primary-container uppercase tracking-widest">Avg Confidence</span>
              <div className="w-8 h-8 rounded-full bg-on-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container text-[18px]">analytics</span>
              </div>
            </div>
            <span className="font-headline-xl text-headline-xl text-on-primary-container">
              {summary ? `${(summary.averageOverallScore * 100).toFixed(1)}%` : "--"}
            </span>
            <div className="mt-xs font-body-sm text-body-sm text-on-primary-container/80">
              {summary ? `Min: ${(summary.minimumScore * 100).toFixed(1)}% | Max: ${(summary.maximumScore * 100).toFixed(1)}%` : ""}
            </div>
          </div>
        </div>

        <section className="flex flex-col gap-sm mt-md">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between bg-surface-container p-md rounded-2xl shadow-sm gap-md">
            <div className="flex flex-wrap items-center gap-md flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Search by title or ASIN..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-surface pl-10 pr-4 py-2 rounded-xl text-body-sm text-on-surface placeholder:text-on-surface-variant/60 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex items-center gap-sm">
                <select
                  value={minScore !== undefined ? minScore.toString() : ""}
                  onChange={(e) => {
                    const val = e.target.value ? parseFloat(e.target.value) : undefined;
                    setMinScore(val);
                    setPage(1);
                  }}
                  className="bg-surface px-sm py-2 rounded-xl font-label-sm text-label-sm text-on-surface border border-outline-variant/20 focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">All Confidence Levels</option>
                  <option value="0.55">&gt; 55% High Confidence</option>
                  <option value="0.50">&gt; 50% Confidence</option>
                  <option value="0.40">&gt; 40% Confidence</option>
                </select>

                <select
                  value={brandFilter}
                  onChange={(e) => {
                    setBrandFilter(e.target.value);
                    setPage(1);
                  }}
                  className="bg-surface px-sm py-2 rounded-xl font-label-sm text-label-sm text-on-surface border border-outline-variant/20 focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">All Brands</option>
                  <option value="AmazonBasics">AmazonBasics</option>
                  <option value="Stone & Beam">Stone & Beam</option>
                  <option value="Rivet">Rivet</option>
                  <option value="Ravenna Home">Ravenna Home</option>
                  <option value="365 Everyday Value">365 Everyday Value</option>
                  <option value="Solimo">Solimo</option>
                  <option value="find.">find.</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-sm text-on-surface-variant font-label-sm text-label-sm">
              <span>Showing {candidates.length} of {totalCount} pairs</span>
            </div>
          </div>

          {error && (
            <div className="p-md bg-error-container/20 border border-error/30 text-error rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined">error</span>
                <span>{error}</span>
              </div>
              <button
                onClick={loadCandidates}
                className="px-sm py-1 rounded-lg bg-error text-on-error font-label-sm hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            </div>
          )}

          <div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high border-b border-surface-container-lowest">
                    <th className="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Product A</th>
                    <th className="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Product B</th>
                    <th className="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold text-center">Confidence</th>
                    <th className="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Match Signals</th>
                    <th className="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold">Status</th>
                    <th className="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-xl text-center text-on-surface-variant">
                        <div className="flex flex-col items-center justify-center gap-sm">
                          <span className="material-symbols-outlined text-[32px] animate-spin text-primary">progress_activity</span>
                          <span>Loading duplicate candidates...</span>
                        </div>
                      </td>
                    </tr>
                  ) : candidates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-xl text-center text-on-surface-variant">
                        <div className="flex flex-col items-center justify-center gap-sm">
                          <span className="material-symbols-outlined text-[48px] text-outline">search_off</span>
                          <span className="font-headline-sm text-on-surface">No duplicate candidates found</span>
                          <span className="text-body-sm max-w-sm">Try adjusting your filters or search term to view candidates.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    candidates.map((c) => {
                      const signals = parseSignals(c.matchSignals);
                      const pct = Math.round(c.overallScore * 100);
                      const strokeDash = 125.6;
                      const strokeOffset = strokeDash - (strokeDash * pct) / 100;

                      return (
                        <tr
                          key={c.id}
                          onClick={() => navigate(`/duplicates/${c.id}`)}
                          className="border-b border-surface-container-lowest hover:bg-surface transition-colors group cursor-pointer"
                        >
                          <td className="p-md">
                            <div className="flex items-center gap-sm">
                              <div
                                className="w-12 h-12 rounded-xl bg-surface flex-shrink-0 bg-contain bg-center bg-no-repeat border border-outline-variant/10"
                                style={{
                                  backgroundImage: c.productA?.mainImageUrl
                                    ? `url('${c.productA.mainImageUrl}')`
                                    : undefined,
                                }}
                              >
                                {!c.productA?.mainImageUrl && (
                                  <div className="w-full h-full flex items-center justify-center text-outline">
                                    <span className="material-symbols-outlined text-[20px]">image</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col max-w-[220px]">
                                <div className="font-label-md text-label-md text-on-surface truncate" title={c.productA?.name}>
                                  {c.productA?.name || "Unknown Product"}
                                </div>
                                <div className="text-on-surface-variant text-[12px] font-mono mt-xs flex items-center gap-xs">
                                  <span>{c.productA?.amazonItemId}</span>
                                  {c.productA?.brand && (
                                    <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-[10px] text-on-surface">
                                      {c.productA.brand}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-md">
                            <div className="flex items-center gap-sm">
                              <div
                                className="w-12 h-12 rounded-xl bg-surface flex-shrink-0 bg-contain bg-center bg-no-repeat border border-outline-variant/10"
                                style={{
                                  backgroundImage: c.productB?.mainImageUrl
                                    ? `url('${c.productB.mainImageUrl}')`
                                    : undefined,
                                }}
                              >
                                {!c.productB?.mainImageUrl && (
                                  <div className="w-full h-full flex items-center justify-center text-outline">
                                    <span className="material-symbols-outlined text-[20px]">image</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col max-w-[220px]">
                                <div className="font-label-md text-label-md text-on-surface truncate" title={c.productB?.name}>
                                  {c.productB?.name || "Unknown Product"}
                                </div>
                                <div className="text-on-surface-variant text-[12px] font-mono mt-xs flex items-center gap-xs">
                                  <span>{c.productB?.amazonItemId}</span>
                                  {c.productB?.brand && (
                                    <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-[10px] text-on-surface">
                                      {c.productB.brand}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-md text-center align-middle">
                            <div className="inline-flex items-center justify-center relative w-12 h-12">
                              <svg className="w-12 h-12 transform -rotate-90">
                                <circle className="text-surface-container-highest" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4"></circle>
                                <circle
                                  className={getScoreColor(c.overallScore)}
                                  cx="24"
                                  cy="24"
                                  fill="transparent"
                                  r="20"
                                  stroke="currentColor"
                                  strokeDasharray={strokeDash}
                                  strokeDashoffset={strokeOffset}
                                  strokeWidth="4"
                                ></circle>
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center font-label-sm text-label-sm font-bold text-on-surface">
                                {pct}%
                              </span>
                            </div>
                          </td>

                          <td className="p-md">
                            <div className="flex flex-wrap gap-xs max-w-xs">
                              {c.brandMatch && (
                                <span className="bg-primary-container/30 text-on-primary-container px-2 py-0.5 rounded text-[10px] font-label-sm flex items-center gap-[2px]">
                                  Brand <span className="material-symbols-outlined text-[12px]">check</span>
                                </span>
                              )}
                              {signals?.category_match && (
                                <span className="bg-secondary-container/30 text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-label-sm flex items-center gap-[2px]">
                                  Category <span className="material-symbols-outlined text-[12px]">check</span>
                                </span>
                              )}
                              {signals?.text_similarity !== undefined && (
                                <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded text-[10px] font-mono">
                                  Text: {Math.round(signals.text_similarity * 100)}%
                                </span>
                              )}
                              {signals?.semantic_similarity !== undefined && (
                                <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded text-[10px] font-mono">
                                  Sem: {Math.round(signals.semantic_similarity * 100)}%
                                </span>
                              )}
                              {signals?.attribute_similarity !== undefined && signals.attribute_similarity > 0 && (
                                <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded text-[10px] font-mono">
                                  Attr: {Math.round(signals.attribute_similarity * 100)}%
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-md">
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-tertiary-container/20 text-on-tertiary-container font-label-sm text-[11px] gap-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Potential
                            </span>
                          </td>

                          <td className="p-md text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/duplicates/${c.id}`);
                              }}
                              className="px-sm py-1.5 rounded-xl bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-sm text-label-sm transition-colors flex items-center gap-xs ml-auto shadow-sm"
                            >
                              <span>Analyze</span>
                              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-md flex items-center justify-between bg-surface-container-high border-t border-surface-container-lowest">
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Page {page} of {totalPages} ({totalCount} total candidates)
                </span>
                <div className="flex items-center gap-xs">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-sm py-1 rounded-lg bg-surface text-on-surface font-label-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-bright transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-sm py-1 rounded-lg bg-surface text-on-surface font-label-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-bright transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
