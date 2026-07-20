import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Report, ApiResponse, PagedResult } from '@core/models';
import { MockService } from '@core/mock/mock.service';

// ─────────────────────────────────────────────────────────────────────────────
// FUTURE BACKEND IMPLEMENTATION (comment only — no runtime change)
//
//   getReports(caseId?):  GET  /api/v1/reports?caseId=:id&page=1&pageSize=20
//   getReport(id):        GET  /api/v1/reports/:id
//   generateReport(req):  POST /api/v1/reports/generate
//                           { caseId, documentIds, reportType, title, options }
//                         This is a long-running operation. Response includes
//                         a reportId. Poll GET /api/v1/reports/:id or listen
//                         on SignalR hub event 'reportReady'.
//   deleteReport(id):     DELETE /api/v1/reports/:id
//   downloadReport(id, fmt): GET /api/v1/reports/:id/download?format=pdf|docx
//                             Returns blob with Content-Disposition header.
// ─────────────────────────────────────────────────────────────────────────────

export interface GenerateReportRequest { caseId?: string; documentId?: string; reportType: string; title?: string; includeRisks?: boolean; includeTimeline?: boolean; includeRecommendations?: boolean; includeSimilarCases?: boolean; }

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly mock = inject(MockService);
  getReports(caseId?: string): Observable<ApiResponse<PagedResult<Report>>> { return this.mock.getReports(caseId) as any; }
  getReport(id: string): Observable<ApiResponse<Report>> { return this.mock.getReport(id) as any; }
  generateReport(request: GenerateReportRequest): Observable<ApiResponse<Report>> { return this.mock.generateReport(request) as any; }
  downloadReport(id: string, format: 'pdf' | 'docx' | 'html'): Observable<Blob> { return this.mock.downloadReport(id, format); }
  deleteReport(id: string): Observable<ApiResponse<void>> { return this.mock.deleteReport(id) as any; }
}
