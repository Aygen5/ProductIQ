import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchDuplicateCandidates,
  fetchDuplicateSummary,
  confirmDuplicateCandidate,
  rejectDuplicateCandidate,
} from "../../services/duplicateService";
import type {
  DuplicateCandidateSummary,
  DuplicateCandidatesSummary,
  DuplicateStatus,
} from "../../types/duplicate";

export const DuplicateQueuePage: React.FC = () => {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState<DuplicateCandidateSummary[]>([]);
  const [summary, setSummary] = useState<DuplicateCandidatesSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [statusFilter, setStatusFilter] = useState<DuplicateStatus | undefined>(undefined);
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
        status: statusFilter,
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
  }, [page, pageSize, statusFilter, minScore, search, brandFilter]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const handleQuickConfirm = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionLoadingId(id);
    try {
      await confirmDuplicateCandidate(id);
      await Promise.all([loadCandidates(), loadSummary()]);
    } catch (err: any) {
      setError(err.message || "Failed to confirm duplicate.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleQuickReject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionLoadingId(id);
    try {
      await rejectDuplicateCandidate(id);
      await Promise.all([loadCandidates(), loadSummary()]);
    } catch (err: any) {
      setError(err.message || "Failed to reject duplicate.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const parseSignals = (matchSignals: string | null) => {
    if (!matchSignals) return null;
    try {
      return JSON.parse(matchSignals);
    } catch {
      return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.55) return "text-primary stroke-primary";
    if (score >= 0.45) return "text-tertiary stroke-tertiary";
    return "text-secondary stroke-secondary";
  };

  const renderStatusBadge = (status: DuplicateStatus) => {
    switch (status) {
      case 1:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[11px] font-semibold gap-xs">
            <span className="material-symbols-outlined text-[14px]">check_circle</span> Confirmed
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-error-container/20 text-error font-label-sm text-[11px] font-semibold gap-xs border border-error/20">
            <span className="material-symbols-outlined text-[14px]">cancel</span> Rejected
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-[11px] font-semibold gap-xs">
            <span className="material-symbols-outlined text-[14px]">merge_type</span> Merged
          </span>
        );
      case 0:
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-tertiary-container/30 text-on-tertiary-container font-label-sm text-[11px] font-semibold gap-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: "8s" }}></div>

      <div className="flex flex-col gap-lg z-10">
        <header className="flex flex-col gap-xs mb-md">
          <h1 className="font-headline-xl text-headline-xl text-on-background tracking-tight">Duplicate Review Queue</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Review, confirm, or reject potential duplicate product pairs detected by the automated matching pipeline.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-md">
          <div
            onClick={() => {
              setStatusFilter(0);
              setPage(1);
            }}
            className={`flex flex-col p-md rounded-2xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden group ${statusFilter === 0 ? "bg-tertiary-container/30 ring-2 ring-tertiary" : "bg-surface-container"}`}
          >
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Pending Review</span>
              <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-tertiary-container text-[18px]">find_in_page</span>
              </div>
            </div>
            <span className="font-headline-xl text-headline-xl text-on-surface">
              {summary ? summary.potentialCount.toLocaleString() : "--"}
            </span>
            <div className="mt-xs font-body-sm text-body-sm text-tertiary">
              Awaiting operator decision
            </div>
          </div>

          <div
            onClick={() => {
              setStatusFilter(1);
              setPage(1);
            }}
            className={`flex flex-col p-md rounded-2xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden group ${statusFilter === 1 ? "bg-secondary-container/30 ring-2 ring-secondary" : "bg-surface-container"}`}
          >
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Confirmed</span>
              <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container text-[18px]">check_circle</span>
              </div>
            </div>
            <span className="font-headline-xl text-headline-xl text-on-surface">
              {summary ? summary.confirmedCount.toLocaleString() : "--"}
            </span>
            <div className="mt-xs font-body-sm text-body-sm text-secondary">
              Verified duplicate pairs
            </div>
          </div>

          <div
            onClick={() => {
              setStatusFilter(2);
              setPage(1);
            }}
            className={`flex flex-col p-md rounded-2xl shadow-sm hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden group ${statusFilter === 2 ? "bg-error-container/20 ring-2 ring-error" : "bg-surface-container"}`}
          >
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Rejected</span>
              <div className="w-8 h-8 rounded-full bg-error-container/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-[18px]">cancel</span>
              </div>
            </div>
            <span className="font-headline-xl text-headline-xl text-on-surface">
              {summary ? summary.rejectedCount.toLocaleString() : "--"}
            </span>
            <div className="mt-xs font-body-sm text-body-sm text-on-surface-variant">
              Dismissed as non-duplicates
            </div>
          </div>

          <div
            onClick={() => {
              setStatusFilter(undefined);
              setPage(1);
            }}
            className={`flex flex-col p-md rounded-2xl shadow-md hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden group ${statusFilter === undefined ? "bg-primary-container ring-2 ring-primary" : "bg-primary-container/70"}`}
          >
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-sm text-label-sm text-on-primary-container uppercase tracking-widest">Total / Avg Score</span>
              <div className="w-8 h-8 rounded-full bg-on-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container text-[18px]">analytics</span>
              </div>
            </div>
            <div className="flex items-baseline gap-sm">
              <span className="font-headline-xl text-headline-xl text-on-primary-container">
                {summary ? summary.totalCandidates.toLocaleString() : "--"}
              </span>
              <span className="font-headline-sm text-on-primary-container/80">
                ({summary ? `${(summary.averageOverallScore * 100).toFixed(1)}%` : "--"})
              </span>
            </div>
            <div className="mt-xs font-body-sm text-body-sm text-on-primary-container/80">
              {summary ? `${summary.highConfidenceCount} high, ${summary.mediumConfidenceCount} med` : ""}
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

              <div className="flex flex-wrap items-center gap-sm">
                <select
                  value={statusFilter !== undefined ? statusFilter.toString() : ""}
                  onChange={(e) => {
                    const val = e.target.value !== "" ? (parseInt(e.target.value, 10) as DuplicateStatus) : undefined;
                    setStatusFilter(val);
                    setPage(1);
                  }}
                  className="bg-surface px-sm py-2 rounded-xl font-label-sm text-label-sm text-on-surface border border-outline-variant/20 focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="0">Pending Review</option>
                  <option value="1">Confirmed</option>
                  <option value="2">Rejected</option>
                </select>

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
                    <th className="p-md font-label-sm text-label-sm text-on-surface-variant font-semibold text-right">Quick Decision</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-xl text-center text-on-surface-variant">
                        <div className="flex flex-col items-center justify-center gap-sm">
                          <span className="material-symbols-outlined text-[32px] animate-spin text-primary">progress_activity</span>
                          <span>Loading duplicate review queue...</span>
                        </div>
                      </td>
                    </tr>
                  ) : candidates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-xl text-center text-on-surface-variant">
                        <div className="flex flex-col items-center justify-center gap-sm">
                          <span className="material-symbols-outlined text-[48px] text-outline">search_off</span>
                          <span className="font-headline-sm text-on-surface">No candidate pairs found</span>
                          <span className="text-body-sm max-w-sm">No duplicates match the selected status or filters.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    candidates.map((c) => {
                      const signals = parseSignals(c.matchSignals);
                      const pct = Math.round(c.overallScore * 100);
                      const strokeDash = 125.6;
                      const strokeOffset = strokeDash - (strokeDash * pct) / 100;
                      const isActionLoading = actionLoadingId === c.id;

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
                              {(signals?.image_similarity !== undefined || c.visualSimilarity != null) && (
                                <span className="bg-secondary-container/20 text-on-secondary-container border border-secondary/20 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-[2px]">
                                  <span className="material-symbols-outlined text-[11px]">image</span>
                                  CLIP: {Math.round(((signals?.image_similarity ?? c.visualSimilarity) as number) * 100)}%
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-md">
                            {renderStatusBadge(c.status)}
                          </td>

                          <td className="p-md text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-xs">
                              {isActionLoading ? (
                                <span className="material-symbols-outlined text-[18px] animate-spin text-primary mr-sm">progress_activity</span>
                              ) : (
                                <>
                                  {c.status !== 1 && (
                                    <button
                                      onClick={(e) => handleQuickConfirm(e, c.id)}
                                      className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary flex items-center justify-center transition-colors shadow-sm"
                                      title="Confirm Duplicate"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">check</span>
                                    </button>
                                  )}
                                  {c.status !== 2 && (
                                    <button
                                      onClick={(e) => handleQuickReject(e, c.id)}
                                      className="w-8 h-8 rounded-full bg-error-container/30 text-error hover:bg-error hover:text-on-error flex items-center justify-center transition-colors shadow-sm border border-error/20"
                                      title="Reject (Not a Duplicate)"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">close</span>
                                    </button>
                                  )}
                                </>
                              )}
                              <button
                                onClick={() => navigate(`/duplicates/${c.id}`)}
                                className="px-sm py-1.5 rounded-xl bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-sm text-label-sm transition-colors flex items-center gap-xs ml-xs shadow-sm"
                              >
                                <span>Detail</span>
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                              </button>
                            </div>
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
