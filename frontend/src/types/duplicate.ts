import type { ProductSummary, ProductDetail, PagedResponse } from "./product";

export type DuplicateStatus = 0 | 1 | 2 | 3;

export const DuplicateStatusEnum = {
  Potential: 0,
  Confirmed: 1,
  Rejected: 2,
  AutoMerged: 3,
} as const;

export interface CandidateExplanation {
  summary: string;
  confidenceLevel: string;
  keyMatches: string[];
  keyDifferences: string[];
  recommendation: string;
}

export interface CandidateAiExplanation {
  summary: string;
  reasoning: string;
  keyMatches: string[];
  keyConflicts: string[];
  operatorGuidance: string;
  status: "Generated" | "Cached" | "Fallback" | "Disabled" | string;
  generatedAt?: string | null;
  modelUsed?: string | null;
}

export interface RiskSignal {
  code: string;
  name: string;
  category: string;
  severity: "Low" | "Medium" | "High" | "Critical" | string;
  scoreContribution: number;
  description: string;
  evidence: string;
}

export interface AiRiskExplanation {
  summary: string;
  reasoning: string;
  keyRisks: string[];
  operatorGuidance: string;
  status: "Generated" | "Fallback" | "Disabled" | string;
  generatedAt?: string | null;
  modelUsed?: string | null;
}

export interface RiskAssessment {
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical" | string;
  summary: string;
  riskSignals: RiskSignal[];
  conflictingSignalsCount: number;
  dataQualityIssuesCount: number;
  requiresImmediateReview: boolean;
  aiExplanation?: AiRiskExplanation | null;
}

export interface ImageSimilarityResult {
  isAvailable: boolean;
  similarityScore: number | null;
  statusMessage: string;
}

export interface DuplicateCandidateSummary {
  id: string;
  productAId: string;
  productBId: string;
  productA: ProductSummary | null;
  productB: ProductSummary | null;
  overallScore: number;
  textSimilarity?: number | null;
  semanticSimilarity?: number | null;
  attributeSimilarity?: number | null;
  visualSimilarity?: number | null;
  brandMatch: boolean;
  modelMatch: boolean;
  categoryMatch?: boolean;
  status: DuplicateStatus;
  matchSignals: string | null;
  riskScore?: number;
  riskLevel?: string;
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
  categoryMatch: boolean;
  status: DuplicateStatus;
  matchSignals: string | null;
  aiExplanation: string | null;
  aiExplanationDetails?: CandidateAiExplanation | null;
  riskAssessment?: RiskAssessment;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string | null;
  reviewedAt?: string | null;
  explanation: CandidateExplanation;
  imageSimilarity: ImageSimilarityResult;
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

export interface UpdateCandidateStatusPayload {
  status: DuplicateStatus;
  resolutionNotes?: string;
}

export type PagedDuplicateResponse = PagedResponse<DuplicateCandidateSummary>;
