import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchRequest, SearchResponse, SimilarCase, ApiResponse } from '@core/models';
import { MockService } from '@core/mock/mock.service';

// ─────────────────────────────────────────────────────────────────────────────
// FUTURE BACKEND IMPLEMENTATION (comment only — no runtime change)
//
//   search(query, type?, filters?):
//     POST /api/v1/search { query, searchType:'hybrid'|'semantic'|'keyword',
//                           filters?: { caseId?, dateRange?, documentType? } }
//     Returns: { results: SearchResult[], total, searchTime, suggestions }
//
//   getSimilarCases(caseId):
//     GET /api/v1/cases/:caseId/similar?limit=10
//     Backed by vector embeddings (pgvector / Pinecone / Weaviate).
//
//   getRecommendations(caseId):
//     GET /api/v1/cases/:caseId/recommendations
//     Returns AI-ranked action items based on case context + legal DB.
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly mock = inject(MockService);
  search(request: SearchRequest): Observable<ApiResponse<SearchResponse>> { return this.mock.search(request.query) as any; }
  getSimilarCases(documentId: string, _limit = 5): Observable<ApiResponse<SimilarCase[]>> { return this.mock.getSimilarCases(documentId) as any; }
  getSimilarCasesByText(text: string, _limit = 5): Observable<ApiResponse<SimilarCase[]>> { return this.mock.getSimilarCasesByText(text) as any; }
  getLegalReferences(query: string): Observable<ApiResponse<any[]>> { return this.mock.search(query) as any; }
}
