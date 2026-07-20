/**
 * Qdrant Frontend Preparation
 * ─────────────────────────────────────────────────────────
 * The Angular frontend does NOT connect to Qdrant directly.
 *
 * All vector search, semantic retrieval, and embedding operations are
 * handled by the ASP.NET backend. The backend wraps Qdrant and exposes
 * a unified REST API that the frontend consumes via SearchService.
 *
 * This file centralises:
 *   1. SearchType definitions — the payload field that tells the backend
 *      which Qdrant collection / query strategy to use.
 *   2. Qdrant collection name constants — informational only, used in
 *      comments and future backend-communication headers if needed.
 *   3. VectorSearchRequest / VectorSearchResult types — the DTO shapes
 *      that SearchService will send and receive once mockMode = false.
 *
 * ── Backend integration flow ─────────────────────────────────────────
 *
 *   Angular SearchService
 *       ↓  POST /api/v1/search  { query, searchType, filters? }
 *   ASP.NET Backend
 *       ↓  SELECT strategy:
 *          'semantic'  → embed query via Grok/Gemini → Qdrant cosine search
 *          'keyword'   → PostgreSQL full-text search (tsvector)
 *          'hybrid'    → both above, re-ranked by reciprocal rank fusion
 *       ↓  Returns unified SearchResult[]
 *   Angular SearchService
 *       ↓  Renders results in SearchComponent
 *
 * No Qdrant API key, host URL, or collection configuration lives here.
 * All Qdrant connection details are managed server-side (appsettings.json /
 * environment variables / Azure Key Vault).
 *
 * ── Collection layout (backend-managed, FYI only) ────────────────────
 *
 *   Collection                 | Embedding model       | Distance
 *   ─────────────────────────────────────────────────────────────────
 *   aegislex_documents         | text-embedding-3-large| Cosine
 *   aegislex_cases             | text-embedding-3-large| Cosine
 *   aegislex_legal_db          | text-embedding-3-large| Cosine
 *
 * ── To activate (when backend is ready) ──────────────────────────────
 *   1. Set environment.mockMode = false.
 *   2. Set environment.apiBaseUrl to the backend URL.
 *   3. SearchService methods will automatically route HTTP calls to the
 *      backend — no other frontend change is required.
 */

// ── Search type ───────────────────────────────────────────

/** Drives backend search routing: semantic (Qdrant), keyword (PG), or hybrid. */
export type SearchType = 'semantic' | 'keyword' | 'hybrid';

// ── Qdrant collection identifiers (informational only) ───

/** Backend-managed Qdrant collection names. Read-only constants for reference. */
export const QdrantCollections = {
  /** Chunked document embeddings — primary source for contract/clause search. */
  DOCUMENTS:  'aegislex_documents',
  /** Case-level summary embeddings — drives similar-cases feature. */
  CASES:      'aegislex_cases',
  /** Legal reference corpus — statutes, judgments, DIFC/UAE law database. */
  LEGAL_DB:   'aegislex_legal_db',
} as const;

export type QdrantCollection = typeof QdrantCollections[keyof typeof QdrantCollections];

// ── Request / Response DTOs ───────────────────────────────

/**
 * Frontend → backend payload for a vector / hybrid search request.
 * Sent by SearchService when mockMode = false.
 * Endpoint: POST /api/v1/search
 */
export interface VectorSearchRequest {
  /** The user's natural-language query. */
  query:       string;
  /** Which backend search strategy to invoke. Default: 'hybrid'. */
  searchType:  SearchType;
  /** Optional limiting filters applied server-side before re-ranking. */
  filters?: {
    /** Restrict results to documents/cases in a specific case. */
    caseId?:       string;
    /** Restrict by document MIME type (e.g. 'application/pdf'). */
    documentType?: string;
    /** ISO date range filter on document upload / case creation date. */
    dateRange?: {
      from?: string;
      to?:   string;
    };
  };
  /** Max number of results to return. Default: 10. Backend caps at 50. */
  limit?: number;
  /** Minimum cosine-similarity score threshold (0–1). Default: 0.7. */
  scoreThreshold?: number;
}

/**
 * A single result item returned by the backend search endpoint.
 * Consumed by SearchService and rendered by SearchComponent.
 */
export interface VectorSearchResult {
  /** Unique identifier of the matched document or case. */
  id:          string;
  /** Entity type — drives result card rendering in SearchComponent. */
  type:        'document' | 'case' | 'legal_reference';
  /** Short title or file name of the matched entity. */
  title:       string;
  /** The most relevant passage extracted from the match (highlighted). */
  excerpt:     string;
  /** Cosine similarity score (0–1). Higher = more semantically relevant. */
  score:       number;
  /** Qdrant collection the hit came from. */
  collection:  QdrantCollection;
  /** ISO timestamp of the document/case creation date. */
  createdAt:   string;
  /** Case the document belongs to, if applicable. */
  caseId?:     string;
  /** Search strategy that produced this result. */
  searchType:  SearchType;
  /** Passage tokens that matched the query (for highlighting). */
  highlights?: string[];
}

/**
 * Top-level response envelope for POST /api/v1/search.
 * Maps to ApiResponse<VectorSearchResponse> in SearchService.
 */
export interface VectorSearchResponse {
  /** Ordered result set (highest score first). */
  results:    VectorSearchResult[];
  /** Total hits before limit / threshold filtering. */
  total:      number;
  /** Server-measured search latency in milliseconds. */
  searchTime: number;
  /** Auto-suggested query completions from the search index. */
  suggestions?: string[];
}
