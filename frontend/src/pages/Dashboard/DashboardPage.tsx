import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAnalyticsSummary, getCatalogHealth } from "../../services/analyticsService";
import { fetchDuplicateCandidates } from "../../services/duplicateService";
import type { AnalyticsSummary, CatalogHealth } from "../../types/analytics";
import type { DuplicateCandidateSummary } from "../../types/duplicate";

export const DashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("30D");
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [catalogHealth, setCatalogHealth] = useState<CatalogHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);
  const [recentDuplicates, setRecentDuplicates] = useState<DuplicateCandidateSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [analyticsData, duplicateData] = await Promise.all([
          getAnalyticsSummary().catch(() => null),
          fetchDuplicateCandidates({ page: 1, pageSize: 5, sortBy: "score", sortDirection: "desc" }).catch(() => null),
        ]);

        if (isMounted) {
          if (analyticsData) setAnalytics(analyticsData);
          if (duplicateData?.items) setRecentDuplicates(duplicateData.items);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchHealth() {
      setHealthLoading(true);
      try {
        const data = await getCatalogHealth(timeRange);
        if (isMounted) {
          setCatalogHealth(data);
        }
      } catch {
      } finally {
        if (isMounted) {
          setHealthLoading(false);
        }
      }
    }

    fetchHealth();

    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  const totalProducts = analytics ? analytics.catalog.totalProducts.toLocaleString() : null;
  const potentialDuplicates = analytics ? analytics.duplicates.totalCandidates.toLocaleString() : null;
  const riskAlerts = analytics ? (analytics.risk.criticalRiskCount + analytics.risk.highRiskCount).toLocaleString() : null;
  const searchQuality = analytics?.search?.averageSearchRelevancePercent != null
    ? `${analytics.search.averageSearchRelevancePercent}%`
    : null;

  const pendingCount = analytics ? analytics.duplicates.pendingReviewCount : 0;
  const confirmedCount = analytics ? analytics.duplicates.confirmedCount : 0;
  const rejectedCount = analytics ? analytics.duplicates.rejectedCount : 0;
  const totalFlags = analytics ? analytics.duplicates.totalCandidates : 0;

  const pendingPct = Math.round((pendingCount / (totalFlags || 1)) * 100);
  const confirmedPct = Math.round((confirmedCount / (totalFlags || 1)) * 100);
  const rejectedPct = Math.round((rejectedCount / (totalFlags || 1)) * 100);

  const renderStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary/10 text-secondary font-label-sm text-[11px] font-semibold">
            Confirmed
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-sm text-[11px] font-semibold">
            Rejected
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-[11px] font-semibold">
            Merged
          </span>
        );
      case 0:
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-[11px] font-semibold">
            Review
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.55) return "bg-primary";
    if (score >= 0.45) return "bg-tertiary";
    return "bg-secondary";
  };

  const healthPoints = catalogHealth?.dataPoints || [];
  const hpCount = healthPoints.length;
  const maxDupsInPeriod = Math.max(1, ...(healthPoints.map((p) => p.duplicatesDetected)));

  const qualityScoreCoords = hpCount > 1
    ? healthPoints.map((p, i) => ({
        x: Math.round(30 + (i / (hpCount - 1)) * 940),
        y: Math.round(250 - ((p.qualityScore - 40) / 60) * 210),
      }))
    : [
        { x: 30, y: 150 },
        { x: 970, y: 150 },
      ];

  const duplicatesCoords = hpCount > 1
    ? healthPoints.map((p, i) => ({
        x: Math.round(30 + (i / (hpCount - 1)) * 940),
        y: Math.round(260 - (p.duplicatesDetected / maxDupsInPeriod) * 170),
      }))
    : [
        { x: 30, y: 220 },
        { x: 970, y: 220 },
      ];

  const qualityPath = qualityScoreCoords.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x},${pt.y}`).join(" ");
  const qualityArea = `${qualityPath} L970,280 L30,280 Z`;
  const duplicatesPath = duplicatesCoords.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x},${pt.y}`).join(" ");

  const sampleIndices = hpCount > 4
    ? [0, Math.floor(hpCount * 0.25), Math.floor(hpCount * 0.5), Math.floor(hpCount * 0.75), hpCount - 1]
    : hpCount > 0
    ? healthPoints.map((_, i) => i)
    : [];

  const displayDates = sampleIndices.map((idx) => healthPoints[idx]?.date).filter(Boolean);

  return (
    <div className="flex flex-col w-full gap-lg">
      <div className="flex flex-col gap-xs mb-sm">
        <h1 className="font-headline-xl text-headline-xl text-on-surface">Product Intelligence Overview</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
          Monitor catalog quality, duplicate detection, search relevance, and risk signals across the entire product ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <div
          onClick={() => navigate("/products")}
          className="bg-surface-container-low rounded-xl p-md flex flex-col gap-sm relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex justify-between items-start z-10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Products</span>
            <span className="material-symbols-outlined text-outline text-[20px]">inventory_2</span>
          </div>
          <div className="flex items-end gap-sm z-10 mt-xs">
            {loading || totalProducts === null ? (
              <div className="h-9 w-24 bg-surface-container-highest animate-pulse rounded-lg" />
            ) : (
              <span className="font-headline-lg text-headline-lg text-on-surface">{totalProducts}</span>
            )}
            <div className="flex items-center text-secondary mb-xs bg-secondary/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">inventory</span>
              <span className="font-label-sm text-label-sm ml-1">Live ABO</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate("/duplicates")}
          className="bg-surface-container-low rounded-xl p-md flex flex-col gap-sm relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex justify-between items-start z-10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Potential Duplicates</span>
            <span className="material-symbols-outlined text-outline text-[20px]">content_copy</span>
          </div>
          <div className="flex items-end gap-sm z-10 mt-xs">
            {loading || potentialDuplicates === null ? (
              <div className="h-9 w-16 bg-surface-container-highest animate-pulse rounded-lg" />
            ) : (
              <span className="font-headline-lg text-headline-lg text-on-surface">{potentialDuplicates}</span>
            )}
            <div className="flex items-center text-tertiary mb-xs bg-tertiary/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              <span className="font-label-sm text-label-sm ml-1">7-Signal</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate("/risk")}
          className="bg-surface-container-low rounded-xl p-md flex flex-col gap-sm relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-error/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex justify-between items-start z-10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">High / Critical Risks</span>
            <span className="material-symbols-outlined text-outline text-[20px]">gpp_maybe</span>
          </div>
          <div className="flex items-end gap-sm z-10 mt-xs">
            {loading || riskAlerts === null ? (
              <div className="h-9 w-16 bg-surface-container-highest animate-pulse rounded-lg" />
            ) : (
              <span className="font-headline-lg text-headline-lg text-on-surface">{riskAlerts}</span>
            )}
            <div className="flex items-center text-error mb-xs bg-error/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              <span className="font-label-sm text-label-sm ml-1">Requires Review</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate("/search")}
          className="bg-surface-container-low rounded-xl p-md flex flex-col gap-sm relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex justify-between items-start z-10">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Search Relevance</span>
            <span className="material-symbols-outlined text-outline text-[20px]">search_check</span>
          </div>
          <div className="flex items-end gap-sm z-10 mt-xs">
            {loading || searchQuality === null ? (
              <div className="h-9 w-20 bg-surface-container-highest animate-pulse rounded-lg" />
            ) : (
              <span className="font-headline-lg text-headline-lg text-on-surface">{searchQuality}</span>
            )}
            <div className="flex items-center text-secondary mb-xs bg-secondary/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <span className="font-label-sm text-label-sm ml-1">Hybrid Vector</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        <div className="lg:col-span-2 bg-surface-container-low rounded-xl p-md flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-md">
            <div className="flex items-center gap-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">Catalog Health</h2>
              {catalogHealth && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[11px] font-bold">
                  {catalogHealth.currentQualityScore}% Score
                </span>
              )}
              {healthLoading && (
                <span className="material-symbols-outlined text-primary text-[18px] animate-spin">
                  progress_activity
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange("7D")}
                className={`px-3 py-1 rounded-full text-label-sm font-label-sm transition-colors cursor-pointer ${
                  timeRange === "7D" ? "bg-primary text-on-primary shadow-md" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setTimeRange("30D")}
                className={`px-3 py-1 rounded-full text-label-sm font-label-sm transition-colors cursor-pointer ${
                  timeRange === "30D" ? "bg-primary text-on-primary shadow-md" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                30D
              </button>
              <button
                onClick={() => setTimeRange("90D")}
                className={`px-3 py-1 rounded-full text-label-sm font-label-sm transition-colors cursor-pointer ${
                  timeRange === "90D" ? "bg-primary text-on-primary shadow-md" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                90D
              </button>
            </div>
          </div>
          <div className="flex-1 relative w-full h-full min-h-[250px]">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
              <line className="text-outline" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" x1="0" x2="1000" y1="50" y2="50" />
              <line className="text-outline" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" x1="0" x2="1000" y1="125" y2="125" />
              <line className="text-outline" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" x1="0" x2="1000" y1="200" y2="200" />
              <line className="text-outline" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" x1="0" x2="1000" y1="275" y2="275" />

              <path
                d={qualityArea}
                fill="url(#gradientPrimary)"
                opacity="0.1"
              />

              <path
                className="text-primary transition-all duration-500"
                d={qualityPath}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />

              <path
                className="text-tertiary opacity-70 transition-all duration-500"
                d={duplicatesPath}
                fill="none"
                stroke="currentColor"
                strokeDasharray="4,4"
                strokeWidth="2"
              />

              {hpCount <= 10 && qualityScoreCoords.map((pt, i) => (
                <circle
                  key={`q-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  className="fill-primary"
                />
              ))}

              <defs>
                <linearGradient id="gradientPrimary" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop className="text-primary" offset="0%" stopColor="currentColor" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {displayDates.length > 0 && (
            <div className="flex justify-between text-[11px] text-outline px-sm pt-xs border-t border-outline-variant/10">
              {displayDates.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-xl mt-md">
            <div className="flex items-center gap-xs">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-body-sm font-body-sm text-on-surface-variant">
                Overall Quality Score {catalogHealth ? `(${catalogHealth.currentQualityScore}%)` : ""}
              </span>
            </div>
            <div className="flex items-center gap-xs">
              <div className="w-3 h-3 rounded-full bg-tertiary opacity-70"></div>
              <span className="text-body-sm font-body-sm text-on-surface-variant">
                Duplicates Detected {catalogHealth ? `(${catalogHealth.totalDuplicatesDetected})` : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-md flex flex-col">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-xl">Detection Summary</h2>
          <div className="relative w-48 h-48 mx-auto mb-lg flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle className="text-surface-container-highest" cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeWidth="12" />
              <circle
                className="text-surface-variant"
                cx="50"
                cy="50"
                fill="none"
                r="40"
                stroke="currentColor"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * rejectedPct) / 100}
                strokeWidth="12"
              />
              <circle
                className="text-secondary"
                cx="50"
                cy="50"
                fill="none"
                r="40"
                stroke="currentColor"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * confirmedPct) / 100}
                strokeWidth="12"
                style={{ transformOrigin: "50px 50px", transform: `rotate(${(rejectedPct * 3.6)}deg)` }}
              />
              <circle
                className="text-primary"
                cx="50"
                cy="50"
                fill="none"
                r="40"
                stroke="currentColor"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * pendingPct) / 100}
                strokeWidth="12"
                style={{ transformOrigin: "50px 50px", transform: `rotate(${((rejectedPct + confirmedPct) * 3.6)}deg)` }}
              />
            </svg>
            <div className="flex flex-col items-center z-10">
              {loading || !analytics ? (
                <div className="h-8 w-12 bg-surface-container-highest animate-pulse rounded-md mb-1" />
              ) : (
                <span className="font-headline-xl text-headline-xl text-on-surface">{totalFlags}</span>
              )}
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Total Flags</span>
            </div>
          </div>
          <div className="flex flex-col gap-sm mt-auto">
            <div className="flex justify-between items-center p-sm rounded-lg hover:bg-surface-container-high transition-colors">
              <div className="flex items-center gap-sm">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-body-md font-body-md text-on-surface">Potential</span>
              </div>
              <span className="text-body-md font-body-md text-on-surface-variant">
                {loading || !analytics ? "—" : `${pendingCount} (${pendingPct}%)`}
              </span>
            </div>
            <div className="flex justify-between items-center p-sm rounded-lg hover:bg-surface-container-high transition-colors">
              <div className="flex items-center gap-sm">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="text-body-md font-body-md text-on-surface">Confirmed</span>
              </div>
              <span className="text-body-md font-body-md text-on-surface-variant">
                {loading || !analytics ? "—" : `${confirmedCount} (${confirmedPct}%)`}
              </span>
            </div>
            <div className="flex justify-between items-center p-sm rounded-lg hover:bg-surface-container-high transition-colors">
              <div className="flex items-center gap-sm">
                <div className="w-3 h-3 rounded-full bg-surface-variant"></div>
                <span className="text-body-md font-body-md text-on-surface">Rejected</span>
              </div>
              <span className="text-body-md font-body-md text-on-surface-variant">
                {loading || !analytics ? "—" : `${rejectedCount} (${rejectedPct}%)`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <div className="bg-surface-container-low rounded-xl p-md flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">Recent Duplicate Reviews</h3>
            <Link to="/duplicates" className="text-primary hover:text-primary-fixed transition-colors text-label-md font-label-md flex items-center gap-xs">
              View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="py-sm px-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Product</th>
                  <th className="py-sm px-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Similarity</th>
                  <th className="py-sm px-xs font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="text-body-sm font-body-sm">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-xl text-center text-outline">
                      <div className="flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-[20px] text-primary">progress_activity</span>
                        <span>Loading duplicate reviews...</span>
                      </div>
                    </td>
                  </tr>
                ) : recentDuplicates.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-xl text-center text-outline">
                      No recent duplicate candidates found.
                    </td>
                  </tr>
                ) : (
                  recentDuplicates.map((c) => {
                    const scorePct = Math.round(c.overallScore * 100);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => navigate(`/duplicates/${c.id}`)}
                        className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors group cursor-pointer"
                      >
                        <td className="py-md px-xs">
                          <div className="flex items-center gap-sm">
                            <div
                              className="w-10 h-10 rounded bg-surface-container-highest flex-shrink-0 bg-cover bg-center"
                              style={{
                                backgroundImage: c.productA?.mainImageUrl
                                  ? `url('${c.productA.mainImageUrl}')`
                                  : undefined,
                              }}
                            >
                              {!c.productA?.mainImageUrl && (
                                <div className="w-full h-full flex items-center justify-center text-outline">
                                  <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <p className="text-on-surface font-medium truncate" title={c.productA?.name || "Product A"}>
                                {c.productA?.name || "Product A"}
                              </p>
                              <p className="text-on-surface-variant text-[12px] truncate" title={c.productB?.name ? `vs. ${c.productB.name}` : ""}>
                                {c.productB?.name ? `vs. ${c.productB.name}` : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-md px-xs">
                          <div className="flex flex-col gap-1 w-24">
                            <span className="text-on-surface font-semibold">{scorePct}%</span>
                            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                              <div className={`${getScoreColor(c.overallScore)} h-full rounded-full`} style={{ width: `${scorePct}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-md px-xs">
                          {renderStatusBadge(c.status)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-md flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">Recent Risk Alerts</h3>
            <Link to="/risk" className="text-primary hover:text-primary-fixed transition-colors text-label-md font-label-md flex items-center gap-xs">
              View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="flex flex-col gap-sm">
            <div
              onClick={() => navigate("/risk")}
              className="p-sm rounded-lg bg-surface hover:bg-surface-container-high border border-outline-variant/10 transition-colors cursor-pointer group flex items-start gap-md"
            >
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="material-symbols-outlined text-error">warning</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-label-md text-label-md text-on-surface truncate">Critical Risk Discrepancies</h4>
                  <span className="font-label-sm text-label-sm text-error bg-error/10 px-2 py-0.5 rounded">
                    {loading || !analytics ? "—" : `${analytics.risk.criticalRiskCount} Critical`}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  High score anomalies and conflicting metadata detected across ABO catalog duplicates.
                </p>
                <div className="flex items-center gap-sm mt-2 text-[12px] text-outline">
                  <span>Score: {loading || !analytics ? "—" : `${Math.round(analytics.risk.averageRiskScore)}/100`}</span>
                  <span>•</span>
                  <span>Active pipeline</span>
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate("/risk")}
              className="p-sm rounded-lg bg-surface hover:bg-surface-container-high border border-outline-variant/10 transition-colors cursor-pointer group flex items-start gap-md"
            >
              <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="material-symbols-outlined text-tertiary">policy</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-label-md text-label-md text-on-surface truncate">High Risk Discrepancies</h4>
                  <span className="font-label-sm text-label-sm text-tertiary bg-tertiary/10 px-2 py-0.5 rounded">
                    {loading || !analytics ? "—" : `${analytics.risk.highRiskCount} High Risk`}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  Candidates requiring operator verification before merge actions can proceed.
                </p>
                <div className="flex items-center gap-sm mt-2 text-[12px] text-outline">
                  <span>Immediate Review: {loading || !analytics ? "—" : analytics.risk.immediateReviewCount}</span>
                  <span>•</span>
                  <span>7-Signal Analysis</span>
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate("/risk")}
              className="p-sm rounded-lg bg-surface hover:bg-surface-container-high border border-outline-variant/10 transition-colors cursor-pointer group flex items-start gap-md"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="material-symbols-outlined text-primary">image_search</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-label-md text-label-md text-on-surface truncate">Visual & Semantic Signals</h4>
                  <span className="font-label-sm text-label-sm text-primary bg-primary/10 px-2 py-0.5 rounded">Multimodal</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  CLIP visual ViT-B/32 and OpenAI text embeddings synthesized for automated clustering.
                </p>
                <div className="flex items-center gap-sm mt-2 text-[12px] text-outline">
                  <span>pgvector Cosine Search</span>
                  <span>•</span>
                  <span>Real-time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl p-md flex flex-col relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="flex justify-between items-center mb-lg relative z-10">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Search Performance</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time vector & keyword query analysis</p>
          </div>
          <Link
            to="/search"
            className="bg-primary hover:bg-inverse-primary text-on-primary font-label-md px-4 py-2 rounded-lg transition-colors shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">temp_preferences_custom</span>
            Search Playground
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg relative z-10">
          <div className="flex flex-col gap-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">Total Logged Queries</span>
            <span className="font-headline-xl text-headline-xl text-on-surface">{loading || !analytics ? "—" : analytics.search.totalSearches.toLocaleString()}</span>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-1">
              <div className="bg-secondary h-full rounded-full" style={{ width: "100%" }}></div>
            </div>
          </div>
          <div className="flex flex-col gap-sm border-l border-outline-variant/10 pl-lg">
            <span className="font-label-md text-label-md text-on-surface-variant">Zero-Result Rate</span>
            <span className="font-headline-xl text-headline-xl text-on-surface">{loading || !analytics ? "—" : `${analytics.search.zeroResultRatePercent}%`}</span>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-1">
              <div className="bg-tertiary h-full rounded-full" style={{ width: `${analytics?.search?.zeroResultRatePercent ?? 0}%` }}></div>
            </div>
          </div>
          <div className="flex flex-col gap-sm border-l border-outline-variant/10 pl-lg">
            <span className="font-label-md text-label-md text-on-surface-variant">Avg. Search Relevance</span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl text-on-surface">{loading || !analytics || analytics.search.averageSearchRelevance == null ? "—" : analytics.search.averageSearchRelevance.toFixed(2)}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">/ 1.0</span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-1 flex">
              <div className="bg-secondary h-full rounded-l-full" style={{ width: `${Math.round((analytics?.search?.averageSearchRelevance ?? 0) * 100)}%` }}></div>
              <div className="bg-surface-variant h-full rounded-r-full" style={{ width: `${100 - Math.round((analytics?.search?.averageSearchRelevance ?? 0) * 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
