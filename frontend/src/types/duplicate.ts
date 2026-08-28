import type { ProductSummary, ProductDetail, PagedResponse } from "./product";

export type DuplicateStatus = 1 | 2 | 3 | 4;

export interface DuplicateCandidateSummary {
  id: string;
  productAId: string;
  productBId: string;
  productA: ProductSummary | null;
  productB: ProductSummary | null;
  overallScore: number;
  brandMatch: boolean;
  modelMatch: boolean;
  status: DuplicateStatus;
  matchSignals: string | null;
  createdAt: string;
}

export interface DuplicateCandidateDetail {
  id: string;
  productAId: string;
  productBId: string;
  productA: ProductDetail | null;
  productB: ProductDetail | null;
  overallScore: number;
  textSimilarity: number | null;
  semanticSimilarity: number | null;
  attributeSimilarity: number | null;
  visualSimilarity: number | null;
  brandMatch: boolean;
  modelMatch: boolean;
  status: DuplicateStatus;
  matchSignals: string | null;
  aiExplanation: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface DuplicateCandidatesSummary {
  totalCandidates: number;
  scoredCandidates: number;
  potentialCount: number;
  confirmedCount: number;
  rejectedCount: number;
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  lowConfidenceCount: number;
  averageOverallScore: number;
  minimumScore: number;
  maximumScore: number;
}

export interface DuplicateQueryParams {
  page?: number;
  pageSize?: number;
  minScore?: number;
  maxScore?: number;
  status?: DuplicateStatus;
  brand?: string;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export type PagedDuplicateResponse = PagedResponse<DuplicateCandidateSummary>;
