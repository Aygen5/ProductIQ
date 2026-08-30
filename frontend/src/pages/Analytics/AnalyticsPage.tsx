import React, { useState, useEffect } from "react";
import { getAnalyticsSummary } from "../../services/analyticsService";
import type { AnalyticsSummary } from "../../types/analytics";

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getAnalyticsSummary();
      setData(summary);
    } catch (err: any) {
      setError(err?.message || "Failed to load analytics. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen gap-xl pb-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
        <div className="flex items-center gap-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">analytics</span>
          </div>
          <div>
            <h1 className="font-headline-xl text-headline-xl text-on-background font-bold">Analytics & Intelligence</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Deterministic metrics aggregated from catalog data, duplicate detection, risk evaluation, and search logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-sm">
          <div className="flex items-center gap-xs px-sm py-1.5 rounded-xl bg-surface-container-high border border-outline-variant/10 text-[12px] text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>Live PostgreSQL</span>
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-md py-1.5 bg-surface-container border border-outline-variant/10 hover:bg-surface-container-high text-on-surface rounded-xl font-label-md text-label-md font-bold transition-all flex items-center gap-xs disabled:opacity-60"
          >
            <span className={`material-symbols-outlined text-[16px] ${loading ? "animate-spin" : ""}`}>refresh</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-md">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-lg rounded-[24px] bg-surface-container border border-outline-variant/10 animate-pulse h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
            <div className="p-xl rounded-[28px] bg-surface-container border border-outline-variant/10 animate-pulse h-96" />
            <div className="p-xl rounded-[28px] bg-surface-container border border-outline-variant/10 animate-pulse h-96" />
          </div>
        </div>
      ) : error ? (
        <div className="p-2xl rounded-[28px] bg-error/10 border border-error/20 text-error flex flex-col gap-md items-start">
          <div className="flex items-center gap-xs font-bold text-headline-sm">
            <span className="material-symbols-outlined text-[28px]">error</span>
            Analytics Data Unreachable
          </div>
          <p className="text-body-md text-on-surface max-w-xl">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-lg py-2 bg-error text-on-error rounded-xl font-label-md text-label-md font-bold shadow-md hover:bg-error/90 transition-all"
          >
            Retry Analytics Request
          </button>
        </div>
      ) : data ? (
        <div className="flex flex-col gap-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-md">
            <div className="p-lg rounded-[24px] bg-surface-container border border-outline-variant/10 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Total Products</span>
                <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
              </div>
              <div className="my-sm">
                <span className="font-headline-lg text-headline-lg font-extrabold text-on-background">
                  {data.catalog.totalProducts}
                </span>
              </div>
              <div className="text-[11px] text-on-surface-variant">
                {data.catalog.totalBrands} brands • {data.catalog.totalCategories} categories
              </div>
            </div>

            <div className="p-lg rounded-[24px] bg-surface-container border border-outline-variant/10 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Duplicate Rate</span>
                <span className="material-symbols-outlined text-tertiary text-[20px]">content_copy</span>
              </div>
              <div className="my-sm flex items-baseline gap-xs">
                <span className="font-headline-lg text-headline-lg font-extrabold text-tertiary">
                  {data.duplicates.duplicateRatePercent}%
                </span>
                <span className="text-[12px] text-outline font-medium">of catalog</span>
              </div>
              <div className="text-[11px] text-on-surface-variant">
                {data.duplicates.uniqueProductsInvolved} unique products in pairs
              </div>
            </div>

            <div className="p-lg rounded-[24px] bg-surface-container border border-outline-variant/10 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Human Reviews</span>
                <span className="material-symbols-outlined text-secondary text-[20px]">how_to_reg</span>
              </div>
              <div className="my-sm flex items-baseline gap-xs">
                <span className="font-headline-lg text-headline-lg font-extrabold text-secondary">
                  {data.duplicates.confirmedCount}
                </span>
                <span className="text-[12px] text-on-surface-variant">Confirmed</span>
                <span className="text-outline">/</span>
                <span className="text-headline-sm font-bold text-on-surface">{data.duplicates.rejectedCount}</span>
                <span className="text-[12px] text-on-surface-variant">Rejected</span>
              </div>
              <div className="text-[11px] text-on-surface-variant">
                {data.duplicates.pendingReviewCount} pending candidate reviews
              </div>
            </div>

            <div className="p-lg rounded-[24px] bg-surface-container border border-outline-variant/10 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Precision (TP/All)</span>
                <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
              </div>
              <div className="my-sm">
                {data.duplicates.precisionAvailable ? (
                  <span className="font-headline-lg text-headline-lg font-extrabold text-primary">
                    {data.duplicates.precisionPercent}%
                  </span>
                ) : (
                  <span className="font-headline-sm text-headline-sm font-bold text-outline">
                    N/A
                  </span>
                )}
              </div>
              <div className="text-[11px] text-on-surface-variant truncate" title={data.duplicates.precisionExplanation}>
                {data.duplicates.precisionAvailable ? "Operator verified" : "Requires review data"}
              </div>
            </div>

            <div className="p-lg rounded-[24px] bg-surface-container border border-outline-variant/10 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Recall (TP/FN)</span>
                <span className="material-symbols-outlined text-outline text-[20px]">help</span>
              </div>
              <div className="my-sm">
                <span className="font-headline-sm text-headline-sm font-bold text-outline">
                  N/A
                </span>
              </div>
              <div className="text-[11px] text-on-surface-variant" title={data.duplicates.recallExplanation}>
                Ground truth needed
              </div>
            </div>

            <div className="p-lg rounded-[24px] bg-surface-container border border-outline-variant/10 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Risk Alerts</span>
                <span className="material-symbols-outlined text-error text-[20px]">warning</span>
              </div>
              <div className="my-sm flex items-baseline gap-xs">
                <span className="font-headline-lg text-headline-lg font-extrabold text-error">
                  {data.risk.criticalRiskCount + data.risk.highRiskCount}
                </span>
                <span className="text-[12px] text-error font-medium">Critical / High</span>
              </div>
              <div className="text-[11px] text-on-surface-variant">
                {data.risk.immediateReviewCount} require immediate review
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
            <div className="bg-surface-container rounded-[28px] p-xl border border-outline-variant/10 shadow-sm flex flex-col gap-lg">
              <div className="flex items-center justify-between pb-sm border-b border-outline-variant/10">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary text-[22px]">hub</span>
                  <h2 className="font-title-lg text-title-lg text-on-background font-bold">Duplicate Detection Analytics</h2>
                </div>
                <span className="font-mono text-[11px] bg-surface-container-high px-sm py-0.5 rounded-md text-on-surface-variant">
                  {data.duplicates.totalCandidates} Total Pairs
                </span>
              </div>

              <div className="flex flex-col gap-md">
                <div className="flex justify-between items-center text-label-sm font-semibold">
                  <span className="text-on-surface">Candidate Review Distribution</span>
                  <span className="text-outline text-[11px]">Human Workflow Status</span>
                </div>

                <div className="w-full h-3.5 bg-surface-container-highest rounded-full overflow-hidden flex shadow-inner">
                  {data.duplicates.confirmedCount > 0 && (
                    <div
                      style={{ width: `${(data.duplicates.confirmedCount / data.duplicates.totalCandidates) * 100}%` }}
                      className="h-full bg-secondary transition-all"
                      title={`Confirmed: ${data.duplicates.confirmedCount}`}
                    />
                  )}
                  {data.duplicates.rejectedCount > 0 && (
                    <div
                      style={{ width: `${(data.duplicates.rejectedCount / data.duplicates.totalCandidates) * 100}%` }}
                      className="h-full bg-error transition-all"
                      title={`Rejected / False Positive: ${data.duplicates.rejectedCount}`}
                    />
                  )}
                  {data.duplicates.pendingReviewCount > 0 && (
                    <div
                      style={{ width: `${(data.duplicates.pendingReviewCount / data.duplicates.totalCandidates) * 100}%` }}
                      className="h-full bg-primary/60 transition-all"
                      title={`Pending: ${data.duplicates.pendingReviewCount}`}
                    />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-sm pt-xs">
                  <div className="p-sm rounded-xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-0.5">
                    <div className="flex items-center gap-xs">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      <span className="text-[11px] text-outline">Confirmed Dups</span>
                    </div>
                    <span className="font-title-md text-title-md font-bold text-secondary">
                      {data.duplicates.confirmedCount}
                    </span>
                  </div>

                  <div className="p-sm rounded-xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-0.5">
                    <div className="flex items-center gap-xs">
                      <span className="w-2 h-2 rounded-full bg-error"></span>
                      <span className="text-[11px] text-outline">False Positives</span>
                    </div>
                    <span className="font-title-md text-title-md font-bold text-error">
                      {data.duplicates.rejectedCount}
                    </span>
                  </div>

                  <div className="p-sm rounded-xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-0.5">
                    <div className="flex items-center gap-xs">
                      <span className="w-2 h-2 rounded-full bg-primary/60"></span>
                      <span className="text-[11px] text-outline">Pending Review</span>
                    </div>
                    <span className="font-title-md text-title-md font-bold text-on-surface">
                      {data.duplicates.pendingReviewCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-md rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-sm">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Similarity Score Distribution (7-Signal Algorithm)
                </span>
                <div className="grid grid-cols-3 gap-sm">
                  <div>
                    <span className="text-[11px] text-on-surface-variant block">Minimum Score</span>
                    <span className="font-mono text-label-lg text-label-lg font-bold text-on-surface">
                      {(data.duplicates.minScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-on-surface-variant block">Average Score</span>
                    <span className="font-mono text-label-lg text-label-lg font-bold text-primary">
                      {(data.duplicates.averageOverallScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-on-surface-variant block">Maximum Score</span>
                    <span className="font-mono text-label-lg text-label-lg font-bold text-secondary">
                      {(data.duplicates.maxScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-md rounded-2xl bg-surface-container-high/40 border border-outline-variant/10 flex flex-col gap-xs text-[12px] text-on-surface-variant leading-relaxed">
                <div className="flex items-center gap-xs font-bold text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                  Precision vs Recall Integrity
                </div>
                <div>
                  <strong>Precision:</strong> {data.duplicates.precisionExplanation}
                </div>
                <div>
                  <strong>Recall:</strong> {data.duplicates.recallExplanation}
                </div>
              </div>
            </div>

            <div className="bg-surface-container rounded-[28px] p-xl border border-outline-variant/10 shadow-sm flex flex-col gap-lg">
              <div className="flex items-center justify-between pb-sm border-b border-outline-variant/10">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-error text-[22px]">shield_with_heart</span>
                  <h2 className="font-title-lg text-title-lg text-on-background font-bold">Safety & Risk Detection Analytics</h2>
                </div>
                <span className="font-mono text-[11px] bg-error/10 text-error font-bold px-sm py-0.5 rounded-md">
                  Avg Risk: {data.risk.averageRiskScore}/100
                </span>
              </div>

              <div className="grid grid-cols-4 gap-sm">
                <div className="p-sm rounded-xl bg-error/10 border border-error/20 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-error font-semibold uppercase">Critical</span>
                  <span className="font-headline-md text-headline-md font-extrabold text-error">
                    {data.risk.criticalRiskCount}
                  </span>
                </div>

                <div className="p-sm rounded-xl bg-tertiary/10 border border-tertiary/20 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-tertiary font-semibold uppercase">High</span>
                  <span className="font-headline-md text-headline-md font-extrabold text-tertiary">
                    {data.risk.highRiskCount}
                  </span>
                </div>

                <div className="p-sm rounded-xl bg-surface-container-high border border-outline-variant/10 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-outline font-semibold uppercase">Medium</span>
                  <span className="font-headline-md text-headline-md font-extrabold text-on-surface">
                    {data.risk.mediumRiskCount}
                  </span>
                </div>

                <div className="p-sm rounded-xl bg-secondary/10 border border-secondary/20 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] text-secondary font-semibold uppercase">Low</span>
                  <span className="font-headline-md text-headline-md font-extrabold text-secondary">
                    {data.risk.lowRiskCount}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-sm">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Top Detected Conflict Signals Across Catalog
                </span>

                <div className="flex flex-col gap-xs max-h-56 overflow-y-auto pr-xs">
                  {Object.entries(data.risk.topRiskSignals).map(([code, count]) => {
                    const pct = Math.round((count / data.risk.totalEvaluated) * 100);
                    return (
                      <div key={code} className="flex flex-col gap-1 p-sm rounded-xl bg-surface-container-low border border-outline-variant/10">
                        <div className="flex justify-between items-center text-[12px]">
                          <span className="font-mono font-bold text-on-surface">{code}</span>
                          <span className="text-on-surface-variant font-medium">
                            {count} pairs ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-error rounded-full transition-all"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container rounded-[28px] p-xl border border-outline-variant/10 shadow-sm flex flex-col gap-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-sm border-b border-outline-variant/10 gap-sm">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[22px]">manage_search</span>
                <h2 className="font-title-lg text-title-lg text-on-background font-bold">Search Engine Performance & Query Quality</h2>
              </div>
              <span className="text-[12px] text-on-surface-variant">
                {data.search.totalSearches} queries recorded in search session log
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
              <div className="p-lg rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Total Searches</span>
                <span className="font-headline-lg text-headline-lg font-extrabold text-on-surface my-xs">
                  {data.search.totalSearches}
                </span>
                <span className="text-[11px] text-on-surface-variant">Logged user queries</span>
              </div>

              <div className="p-lg rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Zero-Result Rate</span>
                <span className="font-headline-lg text-headline-lg font-extrabold text-tertiary my-xs">
                  {data.search.zeroResultRatePercent}%
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  {data.search.zeroResultSearches} zero-result searches
                </span>
              </div>

              <div className="p-lg rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Avg Search Relevance</span>
                <span className="font-headline-lg text-headline-lg font-extrabold text-secondary my-xs">
                  {data.search.searchRelevanceAvailable && data.search.averageSearchRelevancePercent !== null
                    ? `${data.search.averageSearchRelevancePercent}%`
                    : "N/A"}
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  {data.search.searchRelevanceAvailable ? "System average proxy" : "Requires query logs"}
                </span>
              </div>

              <div className="p-lg rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Avg Query Latency</span>
                <span className="font-headline-lg text-headline-lg font-extrabold text-primary my-xs">
                  {data.search.averageExecutionTimeMs}ms
                </span>
                <span className="text-[11px] text-on-surface-variant">Hybrid + pgvector execution</span>
              </div>
            </div>

            <div className="flex flex-col gap-sm">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Recent Logged Search Queries
              </span>

              {data.search.recentSearches.length > 0 ? (
                <div className="w-full overflow-x-auto rounded-2xl border border-outline-variant/10 bg-surface-container-low">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="border-b border-outline-variant/10 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                        <th className="p-sm pl-md font-semibold">Query String</th>
                        <th className="p-sm font-semibold">Results Found</th>
                        <th className="p-sm font-semibold">Execution Latency</th>
                        <th className="p-sm font-semibold">Avg Relevance</th>
                        <th className="p-sm pr-md font-semibold text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-on-surface font-body-sm text-body-sm">
                      {data.search.recentSearches.map((s) => (
                        <tr key={s.id} className="hover:bg-surface-container-high/40 transition-colors">
                          <td className="p-sm pl-md font-mono text-primary font-bold">"{s.queryText}"</td>
                          <td className="p-sm">
                            <span
                              className={`px-sm py-0.5 rounded-md font-label-sm text-[11px] font-bold ${
                                s.totalResults === 0
                                  ? "bg-error/15 text-error"
                                  : "bg-surface-container-high text-on-surface"
                              }`}
                            >
                              {s.totalResults} items
                            </span>
                          </td>
                          <td className="p-sm font-mono text-[12px] text-on-surface-variant">{s.executionTimeMs}ms</td>
                          <td className="p-sm">
                            {s.avgRelevanceScore !== null ? (
                              <span className="font-mono font-bold text-secondary">
                                {(s.avgRelevanceScore * 100).toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-outline">N/A</span>
                            )}
                          </td>
                          <td className="p-sm pr-md text-right text-[11px] text-on-surface-variant">
                            {new Date(s.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-lg rounded-2xl bg-surface-container-low text-center text-on-surface-variant font-body-sm text-body-sm">
                  No search queries have been recorded yet. Test queries in the Search Playground to view real-time latency and relevance analytics.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
