import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Document, DocumentAnalysis, UploadProgress, ApiResponse, PagedResult } from '@core/models';
import { MockService } from '@core/mock/mock.service';
import { map } from 'rxjs/operators';

// =======================================================
// FUTURE BACKEND IMPLEMENTATION (comment only — no behavior
// change, MockService is still the only thing called below).
//
// GET    /api/documents?caseId=&page=&pageSize=   → getDocuments()
// GET    /api/documents/:id                        → getDocument()
// DELETE /api/documents/:id                         → deleteDocument()
// GET    /api/documents/:id/analysis                → getDocumentAnalysis()
// POST   /api/documents/:id/analyze                 → triggerAnalysis()
// GET    /api/documents/:id/download (blob)         → downloadDocument()
// GET    /api/documents/:id/text                     → getDocumentText()
//
// Upload is the one meaningfully different call — it needs
// multipart/form-data and upload-progress events, not a plain
// JSON post:
//
//   uploadDocument(file: File, caseId?: string) {
//     const formData = new FormData();
//     formData.append('file', file);
//     if (caseId) formData.append('caseId', caseId);
//     return this.http.post<ApiResponse<Document>>('/api/documents', formData, {
//       reportProgress: true,
//       observe: 'events',
//     }).pipe(
//       map(event => mapHttpEventToUploadProgress(event, file.name)),
//     );
//   }
// =======================================================
@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private readonly mock = inject(MockService);
  getDocuments(caseId?: string, _page = 1, _pageSize = 20): Observable<ApiResponse<PagedResult<Document>>> { return this.mock.getDocuments(caseId) as any; }
  getDocument(id: string): Observable<ApiResponse<Document>> { return this.mock.getDocument(id) as any; }
  uploadDocument(file: File, caseId?: string): Observable<UploadProgress> {
    return this.mock.uploadDocument(file, caseId).pipe(
      map(res => ({ fileName: file.name, progress: 100, status: 'complete' as const, documentId: res.data.id }))
    );
  }
  deleteDocument(id: string): Observable<ApiResponse<void>> { return this.mock.deleteDocument(id) as any; }
  getDocumentAnalysis(id: string): Observable<ApiResponse<DocumentAnalysis>> { return this.mock.getDocumentAnalysis(id) as any; }
  triggerAnalysis(id: string): Observable<ApiResponse<DocumentAnalysis>> { return this.mock.triggerAnalysis(id) as any; }
  downloadDocument(id: string): Observable<Blob> { return this.mock.downloadDocument(id); }
  getDocumentText(id: string): Observable<ApiResponse<{ text: string; language: string }>> { return this.mock.getDocumentText(id) as any; }
}
