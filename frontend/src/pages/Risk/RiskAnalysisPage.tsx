import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchDuplicateCandidates,
  fetchDuplicateCandidateById,
  updateCandidateStatus,
} from "../../services/duplicateService";
import type {
  DuplicateCandidateSummary,
  DuplicateCandidateDetail,
  DuplicateStatus,
} from "../../types/duplicate";

export const RiskAnalysisPage: React.FC = () => {
  const [candidates, setCandidates] = useState<DuplicateCandidateSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [filterLevel, setFilterLevel] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<DuplicateCandidateDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadCandidates = async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const res = await fetchDuplicateCandidates({
        page,
        pageSize,
        search: searchTerm.trim() || undefined,
      });
      setCandidates(res.items);
      setTotalCount(res.totalCount);

      if (res.items.length > 0 && !selectedId) {
        setSelectedId(res.items[0].id);
      }
    } catch (err: any) {
      setListError(err?.message || "Failed to load risk candidates.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [page, searchTerm]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedDetail(null);
      return;
    }

    let isMounted = true;
    const loadDetail = async () => {
      setLoadingDetail(true);
      setDetailError(null);
      try {
        const detail = await fetchDuplicateCandidateById(selectedId);
        if (isMounted) {
          setSelectedDetail(detail);
        }
      } catch (err: any) {
        if (isMounted) {
          setDetailError(err?.message || "Failed to load risk assessment detail.");
        }
      } finally {
        if (isMounted) {
          setLoadingDetail(false);
        }
      }
    };

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  const handleStatusUpdate = async (status: DuplicateStatus) => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      const updated = await updateCandidateStatus(selectedId, status);
      setSelectedDetail(updated);
      setCandidates((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, status: updated.status } : c))
      );
    } catch (err: any) {
      alert(`Failed to update status: ${err?.message || "Unknown error"}`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    if (filterLevel === "All") return true;
    return c.riskLevel?.toLowerCase() === filterLevel.toLowerCase();
  });

  const highRiskCount = candidates.filter(
    (c) => (c.riskScore ?? 0) >= 50
  ).length;
  const mediumRiskCount = candidates.filter(
    (c) => (c.riskScore ?? 0) >= 25 && (c.riskScore ?? 0) < 50
  ).length;
  const lowRiskCount = candidates.filter(
    (c) => (c.riskScore ?? 0) < 25
  ).length;

  const getRiskBadgeClasses = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "critical":
        return "bg-error text-on-error border-error";
      case "high":
        return "bg-error/15 text-error border-error/30";
      case "medium":
        return "bg-tertiary/15 text-tertiary border-tertiary/30";
      default:
        return "bg-secondary/15 text-secondary border-secondary/30";
    }
  };

  const getSeverityBadgeClasses = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-error text-on-error font-bold";
      case "high":
        return "bg-error/20 text-error font-bold";
      case "medium":
        return "bg-tertiary/20 text-tertiary font-semibold";
      default:
        return "bg-secondary/20 text-secondary font-medium";
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen gap-xl pb-2xl">
      <div className="flex flex-col lg:flex-row gap-lg justify-between items-start lg:items-center">
        <div className="flex flex-col gap-xs">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">shield_with_heart</span>
            </div>
            <div>
              <h1 className="font-headline-xl text-headline-xl text-on-background font-bold">Catalog Risk Detection</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Analyze operational conflicts, specification divergence, and catalog merge hazards.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-md">
          <div className="bg-surface-container rounded-2xl p-md flex items-center gap-md border border-outline-variant/10 shadow-sm min-w-[130px]">
            <div className="w-9 h-9 rounded-xl bg-error/15 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div>
              <div className="font-headline-md text-headline-md font-bold text-error">{highRiskCount}</div>
              <div className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">High / Critical</div>
            </div>
          </div>

          <div className="bg-surface-container rounded-2xl p-md flex items-center gap-md border border-outline-variant/10 shadow-sm min-w-[130px]">
            <div className="w-9 h-9 rounded-xl bg-tertiary/15 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">error_outline</span>
            </div>
            <div>
              <div className="font-headline-md text-headline-md font-bold text-tertiary">{mediumRiskCount}</div>
              <div className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Medium Risk</div>
            </div>
          </div>

          <div className="bg-surface-container rounded-2xl p-md flex items-center gap-md border border-outline-variant/10 shadow-sm min-w-[130px]">
            <div className="w-9 h-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <div>
              <div className="font-headline-md text-headline-md font-bold text-secondary">{lowRiskCount}</div>
              <div className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Low Risk</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-xl items-start">
        <div className="xl:col-span-5 flex flex-col gap-md bg-surface-container rounded-[24px] p-lg border border-outline-variant/10 shadow-sm">
          <div className="flex flex-col gap-sm pb-sm border-b border-outline-variant/10">
            <div className="flex items-center justify-between">
              <span className="font-title-md text-title-md font-bold text-on-background">Evaluated Pairs</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-sm py-0.5 rounded-full">
                {totalCount} Candidates
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-sm">
              <div className="relative flex-1 w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Search products or brand..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-sm py-1.5 bg-surface-container-high border border-outline-variant/10 rounded-xl font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-xs overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {["All", "High", "Medium", "Low"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setFilterLevel(lvl)}
                    className={`px-sm py-1 rounded-lg font-label-sm text-label-sm transition-all whitespace-nowrap ${
                      filterLevel === lvl
                        ? "bg-primary text-on-primary font-bold shadow-sm"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loadingList ? (
            <div className="flex flex-col gap-sm py-xl items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span>
              <span className="font-body-md text-body-md">Loading risk candidates...</span>
            </div>
          ) : listError ? (
            <div className="p-md rounded-xl bg-error/10 border border-error/20 text-error flex flex-col gap-sm">
              <div className="flex items-center gap-xs font-bold">
                <span className="material-symbols-outlined text-[18px]">error</span>
                Failed to load candidates
              </div>
              <p className="text-body-sm">{listError}</p>
              <button
                onClick={loadCandidates}
                className="self-start px-md py-1 bg-error text-on-error rounded-lg font-label-sm text-label-sm font-bold"
              >
                Retry
              </button>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="p-xl text-center text-on-surface-variant flex flex-col items-center gap-sm">
              <span className="material-symbols-outlined text-[36px] text-outline">search_off</span>
              <p className="font-body-md text-body-md">No candidates matched your filter.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-sm max-h-[720px] overflow-y-auto pr-1">
              {filteredCandidates.map((c) => {
                const isSelected = c.id === selectedId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`p-md rounded-2xl border transition-all cursor-pointer flex flex-col gap-sm ${
                      isSelected
                        ? "bg-surface-container-highest border-primary shadow-sm"
                        : "bg-surface-container-low border-outline-variant/10 hover:border-outline-variant hover:bg-surface-container-high/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-sm">
                      <div className="flex items-center gap-xs">
                        <span className={`px-sm py-0.5 rounded-md font-label-sm text-[11px] font-bold border ${getRiskBadgeClasses(c.riskLevel)}`}>
                          {c.riskLevel || "Low"} Risk
                        </span>
                        <span className="text-[12px] font-mono font-bold text-on-surface">
                          {c.riskScore ?? 0}/100
                        </span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant font-medium">
                        Similarity: <strong className="text-primary">{((c.overallScore || 0) * 100).toFixed(0)}%</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-md">
                      <div className="flex -space-x-3 shrink-0">
                        <img
                          src={c.productA?.mainImageUrl || "https://images-na.ssl-images-amazon.com/images/I/01RmK%2BJNmNL.png"}
                          alt={c.productA?.name || "Product A"}
                          className="w-10 h-10 rounded-lg object-cover border-2 border-surface-container bg-surface-container-highest shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images-na.ssl-images-amazon.com/images/I/01RmK%2BJNmNL.png";
                          }}
                        />
                        <img
                          src={c.productB?.mainImageUrl || "https://images-na.ssl-images-amazon.com/images/I/01RmK%2BJNmNL.png"}
                          alt={c.productB?.name || "Product B"}
                          className="w-10 h-10 rounded-lg object-cover border-2 border-surface-container bg-surface-container-highest shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images-na.ssl-images-amazon.com/images/I/01RmK%2BJNmNL.png";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-label-md text-label-md text-on-surface font-semibold truncate">
                          {c.productA?.name}
                        </p>
                        <p className="font-body-sm text-[12px] text-on-surface-variant truncate">
                          vs {c.productB?.name}
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (c.riskScore ?? 0) >= 50
                            ? "bg-error"
                            : (c.riskScore ?? 0) >= 25
                            ? "bg-tertiary"
                            : "bg-secondary"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, c.riskScore ?? 0))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-sm border-t border-outline-variant/10 font-label-sm text-label-sm text-on-surface-variant">
            <span>Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}</span>
            <div className="flex items-center gap-xs">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-sm py-1 rounded bg-surface-container-high text-on-surface hover:bg-surface-variant disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                disabled={page * pageSize >= totalCount}
                onClick={() => setPage((p) => p + 1)}
                className="px-sm py-1 rounded bg-surface-container-high text-on-surface hover:bg-surface-variant disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-7 flex flex-col gap-lg">
          {loadingDetail ? (
            <div className="bg-surface-container rounded-[24px] p-2xl border border-outline-variant/10 flex flex-col items-center justify-center gap-md min-h-[400px]">
              <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
              <span className="font-headline-sm text-headline-sm text-on-background">Evaluating Catalog Risk...</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Analyzing model numbers, dimensions, taxonomy, and CLIP image consistency</p>
            </div>
          ) : detailError ? (
            <div className="bg-surface-container rounded-[24px] p-xl border border-error/20 flex flex-col gap-md">
              <div className="flex items-center gap-xs font-bold text-error">
                <span className="material-symbols-outlined text-[24px]">error</span>
                <h3>Failed to load candidate risk details</h3>
              </div>
              <p className="text-body-md text-on-surface-variant">{detailError}</p>
            </div>
          ) : !selectedDetail ? (
            <div className="bg-surface-container rounded-[24px] p-2xl border border-outline-variant/10 text-center flex flex-col items-center gap-md text-on-surface-variant min-h-[400px] justify-center">
              <span className="material-symbols-outlined text-[48px] text-outline">touch_app</span>
              <p className="font-headline-sm text-headline-sm text-on-background">Select a candidate pair to view in-depth risk analysis</p>
            </div>
          ) : (
            <>
              <div className="bg-surface-container rounded-[24px] p-xl border border-outline-variant/10 shadow-sm flex flex-col gap-lg">
                <div className="flex flex-wrap items-center justify-between gap-md pb-md border-b border-outline-variant/10">
                  <div className="flex items-center gap-sm">
                    <span className={`px-md py-1 rounded-xl font-label-md text-label-md font-bold border ${getRiskBadgeClasses(selectedDetail.riskAssessment?.riskLevel)}`}>
                      {selectedDetail.riskAssessment?.riskLevel?.toUpperCase()} RISK ({selectedDetail.riskAssessment?.riskScore ?? 0}/100)
                    </span>
                    {selectedDetail.riskAssessment?.requiresImmediateReview && (
                      <span className="px-sm py-1 rounded-lg bg-error/10 text-error font-label-sm text-label-sm font-bold flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[14px]">priority_high</span>
                        Immediate Review Advised
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-sm">
                    <Link
                      to={`/duplicates/${selectedDetail.id}`}
                      className="px-md py-1.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary/90 transition-all flex items-center gap-xs shadow-sm"
                    >
                      <span>Full Candidate Detail</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="p-md rounded-2xl bg-surface-container-high/60 border border-primary/20 flex flex-col justify-between gap-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">Duplicate Likelihood</span>
                      <span className="material-symbols-outlined text-primary text-[20px]">content_copy</span>
                    </div>
                    <div className="font-headline-xl text-[32px] font-extrabold text-on-background">
                      {((selectedDetail.overallScore || 0) * 100).toFixed(1)}%
                    </div>
                    <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                      Measures catalog visual, semantic, brand, and text similarity between the listings.
                    </p>
                  </div>

                  <div className="p-md rounded-2xl bg-surface-container-high/60 border border-error/20 flex flex-col justify-between gap-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-error uppercase tracking-wider font-bold">Catalog Risk Score</span>
                      <span className="material-symbols-outlined text-error text-[20px]">gavel</span>
                    </div>
                    <div className="font-headline-xl text-[32px] font-extrabold text-on-background">
                      {selectedDetail.riskAssessment?.riskScore ?? 0} <span className="text-body-md text-on-surface-variant font-normal">/ 100</span>
                    </div>
                    <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
                      Measures conflicting specifications, model discrepancies, and catalog merge hazards.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md p-md rounded-2xl bg-surface-container-low border border-outline-variant/10">
                  <div className="flex items-start gap-md">
                    <img
                      src={selectedDetail.productA?.mainImageUrl || "https://images-na.ssl-images-amazon.com/images/I/01RmK%2BJNmNL.png"}
                      alt={selectedDetail.productA?.name || "Product A"}
                      className="w-14 h-14 rounded-xl object-cover border border-outline-variant/10 bg-surface-container-highest shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images-na.ssl-images-amazon.com/images/I/01RmK%2BJNmNL.png";
                      }}
                    />
                    <div className="min-w-0">
                      <div className="font-label-sm text-[10px] text-primary uppercase font-bold">Product A ({selectedDetail.productA?.amazonItemId})</div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold line-clamp-1">{selectedDetail.productA?.name}</p>
                      <div className="text-[11px] text-on-surface-variant">Model: <strong className="text-on-surface font-mono">{selectedDetail.productA?.modelNumber || "N/A"}</strong></div>
                      {selectedDetail.productA?.dimensions && (
                        <div className="text-[11px] text-on-surface-variant">Dims: {selectedDetail.productA.dimensions.length}x{selectedDetail.productA.dimensions.width}x{selectedDetail.productA.dimensions.height} {selectedDetail.productA.dimensions.dimensionUnit}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-md">
                    <img
                      src={selectedDetail.productB?.mainImageUrl || "https://images-na.ssl-images-amazon.com/images/I/01RmK%2BJNmNL.png"}
                      alt={selectedDetail.productB?.name || "Product B"}
                      className="w-14 h-14 rounded-xl object-cover border border-outline-variant/10 bg-surface-container-highest shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images-na.ssl-images-amazon.com/images/I/01RmK%2BJNmNL.png";
                      }}
                    />
                    <div className="min-w-0">
                      <div className="font-label-sm text-[10px] text-tertiary uppercase font-bold">Product B ({selectedDetail.productB?.amazonItemId})</div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold line-clamp-1">{selectedDetail.productB?.name}</p>
                      <div className="text-[11px] text-on-surface-variant">Model: <strong className="text-on-surface font-mono">{selectedDetail.productB?.modelNumber || "N/A"}</strong></div>
                      {selectedDetail.productB?.dimensions && (
                        <div className="text-[11px] text-on-surface-variant">Dims: {selectedDetail.productB.dimensions.length}x{selectedDetail.productB.dimensions.width}x{selectedDetail.productB.dimensions.height} {selectedDetail.productB.dimensions.dimensionUnit}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container rounded-[24px] p-xl border border-outline-variant/10 shadow-sm flex flex-col gap-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-error text-[24px]">flag</span>
                    <h3 className="font-headline-md text-headline-md text-on-background font-bold">Detected Risk Signals</h3>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-bold bg-surface-container-high px-sm py-0.5 rounded-lg">
                    {selectedDetail.riskAssessment?.riskSignals?.length || 0} Factors Found
                  </span>
                </div>

                {selectedDetail.riskAssessment?.riskSignals && selectedDetail.riskAssessment.riskSignals.length > 0 ? (
                  <div className="flex flex-col gap-sm">
                    {selectedDetail.riskAssessment.riskSignals.map((sig, idx) => (
                      <div
                        key={idx}
                        className="p-md rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-xs hover:bg-surface-container-high/40 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-xs">
                          <div className="flex items-center gap-xs">
                            <span className="material-symbols-outlined text-error text-[18px]">report_problem</span>
                            <span className="font-title-sm text-title-sm font-bold text-on-background">{sig.name}</span>
                          </div>
                          <div className="flex items-center gap-xs">
                            <span className={`px-sm py-0.5 rounded text-[10px] uppercase tracking-wider ${getSeverityBadgeClasses(sig.severity)}`}>
                              {sig.severity}
                            </span>
                            <span className="px-sm py-0.5 rounded bg-surface-container-highest text-on-surface font-mono font-bold text-[11px]">
                              +{sig.scoreContribution} pts
                            </span>
                          </div>
                        </div>

                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {sig.description}
                        </p>

                        {sig.evidence && (
                          <div className="p-xs px-sm rounded-lg bg-surface-container-lowest border border-outline-variant/10 font-mono text-[11px] text-on-surface mt-xs break-all">
                            <span className="text-outline select-none">Evidence: </span>
                            {sig.evidence}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-lg rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary flex items-center gap-sm">
                    <span className="material-symbols-outlined text-[24px]">check_circle</span>
                    <span className="font-body-md text-body-md font-medium">No severe catalog risk signals or specification conflicts were detected for this pair.</span>
                  </div>
                )}
              </div>

              <div className="bg-primary/5 rounded-[24px] p-xl border border-primary/20 flex flex-col gap-md relative overflow-hidden shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-sm">
                  <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-background font-bold">AI Risk Explanation</h3>
                  </div>

                  <span className="px-sm py-1 rounded-lg bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold flex items-center gap-xs shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    {selectedDetail.riskAssessment?.aiExplanation?.status === "Generated"
                      ? `AI Risk Assessment (${selectedDetail.riskAssessment.aiExplanation.modelUsed || "GPT-4o-mini"})`
                      : "System Risk Synthesis"}
                  </span>
                </div>

                <p className="font-body-lg text-body-lg text-on-background leading-relaxed">
                  {selectedDetail.riskAssessment?.aiExplanation?.summary || selectedDetail.riskAssessment?.summary}
                </p>

                {selectedDetail.riskAssessment?.aiExplanation?.reasoning && (
                  <div className="p-md rounded-2xl bg-surface-container-lowest/60 border border-outline-variant/10 font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    <div className="flex items-center gap-xs text-primary font-label-sm text-label-sm uppercase tracking-wider font-bold mb-xs">
                      <span className="material-symbols-outlined text-[16px]">insights</span>
                      Risk Synthesis & Reasoning
                    </div>
                    {selectedDetail.riskAssessment.aiExplanation.reasoning}
                  </div>
                )}

                {selectedDetail.riskAssessment?.aiExplanation?.keyRisks && selectedDetail.riskAssessment.aiExplanation.keyRisks.length > 0 && (
                  <div className="p-md rounded-2xl bg-surface-container-lowest/70 border border-outline-variant/10 flex flex-col gap-xs">
                    <div className="flex items-center gap-xs text-error font-label-md text-label-md font-bold mb-xs">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                      Key Catalog Hazards
                    </div>
                    <ul className="flex flex-col gap-xs text-body-sm text-on-surface">
                      {selectedDetail.riskAssessment.aiExplanation.keyRisks.map((kRisk, idx) => (
                        <li key={idx} className="flex items-start gap-xs">
                          <span className="material-symbols-outlined text-error text-[16px] mt-0.5">error</span>
                          <span>{kRisk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(selectedDetail.riskAssessment?.aiExplanation?.operatorGuidance || selectedDetail.explanation?.recommendation) && (
                  <div className="p-md rounded-xl bg-surface-container font-body-sm text-body-sm text-on-surface flex items-start gap-sm border border-outline-variant/10">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">lightbulb</span>
                    <div>
                      <strong className="text-on-background">Operator Guidance:</strong>{" "}
                      <span>{selectedDetail.riskAssessment?.aiExplanation?.operatorGuidance || selectedDetail.explanation.recommendation}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-xs text-[11px] text-outline mt-xs pt-xs border-t border-outline-variant/10">
                  <span className="material-symbols-outlined text-[14px]">shield</span>
                  <span>AI explains detected risk evidence; it does not make the final risk score or duplicate decision.</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-md p-md bg-surface-container rounded-2xl border border-outline-variant/10">
                <div className="text-[12px] text-on-surface-variant">
                  Current Status: <strong className="text-on-surface font-semibold">
                    {selectedDetail.status === 1 ? "Confirmed Duplicate" : selectedDetail.status === 2 ? "Rejected / Distinct" : "Pending Review"}
                  </strong>
                </div>

                <div className="flex items-center gap-sm">
                  {selectedDetail.status === 0 ? (
                    <>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleStatusUpdate(1)}
                        className="px-md py-1.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-bold hover:bg-secondary/90 transition-all flex items-center gap-xs disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[16px]">check</span>
                        Confirm Merge
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleStatusUpdate(2)}
                        className="px-md py-1.5 rounded-xl bg-error text-on-error font-label-md text-label-md font-bold hover:bg-error/90 transition-all flex items-center gap-xs disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                        Reject / Keep Distinct
                      </button>
                    </>
                  ) : (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleStatusUpdate(0)}
                      className="px-md py-1.5 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-variant transition-all flex items-center gap-xs disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">replay</span>
                      Re-open Investigation
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
