export type SearchMode = "Hybrid" | "Keyword" | "Semantic";

export interface QueryAnalysis {
  rawQuery: string;
  normalizedQuery: string;
  detectedBrand: string | null;
  detectedCategory: string | null;
  detectedModel: string | null;
  searchIntent: string;
  keyTerms: string[];
  hasVisualAdjectives: boolean;
}

export interface SearchResult {
  productId: string;
  amazonItemId: string;
  name: string;
  brand: string | null;
  category: string | null;
  productType: string | null;
  modelName: string | null;
  modelNumber: string | null;
  price: number | null;
  currency: string | null;
  mainImageUrl: string | null;
  relevanceScore: number;
  relevancePercent: number;
  keywordScore: number;
  semanticScore: number;
  matchedFields: string[];
  explanation: string;
}

export interface SearchRequest {
  query: string;
  mode?: SearchMode;
  brand?: string;
  category?: string;
  minScore?: number;
  page?: number;
  pageSize?: number;
}

export interface SearchResponse {
  query: string;
  mode: string;
  totalCount: number;
  page: number;
  pageSize: number;
  executionTimeMs: number;
  queryAnalysis: QueryAnalysis;
  results: SearchResult[];
}
