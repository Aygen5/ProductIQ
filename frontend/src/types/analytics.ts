export interface CatalogAnalytics {
  totalProducts: number;
  productsWithImages: number;
  productsWithAttributes: number;
  totalBrands: number;
  totalCategories: number;
}

export interface DuplicateAnalytics {
  totalCandidates: number;
  pendingReviewCount: number;
  confirmedCount: number;
  rejectedCount: number;
  autoMergedCount: number;
  uniqueProductsInvolved: number;
  duplicateRate: number;
  duplicateRatePercent: number;
  averageOverallScore: number;
  minScore: number;
  maxScore: number;
  precision: number | null;
  precisionPercent: number | null;
  precisionAvailable: boolean;
  precisionExplanation: string;
  recall: number | null;
  recallPercent: number | null;
  recallAvailable: boolean;
  recallExplanation: string;
}

export interface RiskAnalytics {
  totalEvaluated: number;
  criticalRiskCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  immediateReviewCount: number;
  averageRiskScore: number;
  topRiskSignals: Record<string, number>;
}

export interface SearchQueryLog {
  id: string;
  queryText: string;
  executionTimeMs: number;
  totalResults: number;
  avgRelevanceScore: number | null;
  createdAt: string;
}

export interface SearchAnalytics {
  totalSearches: number;
  zeroResultSearches: number;
  zeroResultRate: number;
  zeroResultRatePercent: number;
  averageSearchRelevance: number | null;
  averageSearchRelevancePercent: number | null;
  averageExecutionTimeMs: number;
  searchRelevanceAvailable: boolean;
  zeroResultRateAvailable: boolean;
  relevanceExplanation: string;
  recentSearches: SearchQueryLog[];
}

export interface AnalyticsSummary {
  catalog: CatalogAnalytics;
  duplicates: DuplicateAnalytics;
  risk: RiskAnalytics;
  search: SearchAnalytics;
  generatedAt: string;
}

export interface CatalogHealthDataPoint {
  date: string;
  qualityScore: number;
  duplicatesDetected: number;
  totalProducts: number;
}

export interface CatalogHealth {
  period: "7D" | "30D" | "90D" | string;
  currentQualityScore: number;
  totalDuplicatesDetected: number;
  totalProducts: number;
  dataPoints: CatalogHealthDataPoint[];
}
