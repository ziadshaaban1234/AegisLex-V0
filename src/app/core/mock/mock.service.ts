import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  User, Case, Document, DocumentAnalysis, Report, ChatSession, ChatMessage,
  DashboardStats, SimilarCase, Recommendation, RegisterRequest
} from '@core/models';
import {
  MOCK_USER, MOCK_CASES, MOCK_DOCUMENTS, MOCK_ANALYSIS,
  MOCK_REPORTS, MOCK_SESSIONS, MOCK_MESSAGES, MOCK_NOTIFICATIONS,
  MOCK_DASHBOARD_STATS, MOCK_SIMILAR_CASES, MOCK_SEARCH_RESULTS
} from './mock-data';

function wrap<T>(data: T, ms = 400): Observable<{ data: T; success: boolean }> {
  return of({ data, success: true }).pipe(delay(ms));
}

@Injectable({ providedIn: 'root' })
export class MockService {
  // ===================================================================
  // Auth
  // FUTURE BACKEND IMPLEMENTATION (comment only — mock behavior below
  // is unchanged and remains active):
  //
  //   GET /api/auth/me
  //     Response: { data: User, success: true }
  //
  //   POST /api/auth/login
  //     Request:  { email: string, password: string }
  //     Response: { data: { accessToken, refreshToken, expiresIn, user }, success: true }
  //
  //   POST /api/auth/register
  //     Request:  RegisterRequest
  //     Response: { data: { accessToken, refreshToken, expiresIn, user }, success: true }
  //
  //   Example service call once wired to a real backend:
  //     login(email: string, password: string) {
  //       return this.http.post<ApiResponse<LoginResult>>('/api/auth/login', { email, password });
  //     }
  // ===================================================================
  getCurrentUser(): User { return MOCK_USER; }
  login(_email: string, _pw: string) { return wrap({ accessToken: 'mock-token', refreshToken: 'mock-refresh', expiresIn: 3600, user: MOCK_USER }, 800); }
  register(_data: RegisterRequest) { return wrap({ accessToken: 'mock-token', refreshToken: 'mock-refresh', expiresIn: 3600, user: MOCK_USER }, 900); }

  // ===================================================================
  // Cases
  // FUTURE BACKEND IMPLEMENTATION (comment only — mock behavior unchanged):
  //
  //   GET /api/cases?page=1&pageSize=20&status=open&search=acme
  //     Response: { data: { items: Case[], total, page, pageSize, totalPages }, success: true }
  //
  //   GET /api/cases/:id            → { data: Case, success: true }
  //   POST /api/cases                Request: Partial<Case>  → { data: Case, success: true }
  //   PUT /api/cases/:id             Request: Partial<Case>  → { data: Case, success: true }
  //   DELETE /api/cases/:id          → { success: true }
  //   POST /api/cases/:id/archive    → { data: Case, success: true }
  //   POST /api/cases/:id/close      → { data: Case, success: true }
  //
  //   Example service call once wired to a real backend:
  //     getCases(page: number, pageSize: number, status?: string, search?: string) {
  //       return this.http.get<ApiResponse<PaginatedCases>>('/api/cases', {
  //         params: { page, pageSize, ...(status && { status }), ...(search && { search }) }
  //       });
  //     }
  // ===================================================================
  getCases(page = 1, pageSize = 20, status?: string, search?: string) {
    let items = [...MOCK_CASES];
    if (status) items = items.filter(c => c.status === status);
    if (search) items = items.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.caseNumber.toLowerCase().includes(search.toLowerCase()));
    const start = (page - 1) * pageSize;
    return wrap({ items: items.slice(start, start + pageSize), total: items.length, page, pageSize, totalPages: Math.ceil(items.length / pageSize) });
  }
  getCase(id: string) { return wrap(MOCK_CASES.find(c => c.id === id) || MOCK_CASES[0]); }
  createCase(data: any) {
    const newCase: Case = { ...MOCK_CASES[0], id: 'case-new-' + Date.now(), caseNumber: 'CASE-2024-' + String(MOCK_CASES.length + 1).padStart(3,'0'), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), documents: [], riskScore: undefined };
    return wrap(newCase, 600);
  }
  updateCase(id: string, data: any) { return wrap({ ...(MOCK_CASES.find(c => c.id === id) || MOCK_CASES[0]), ...data, updatedAt: new Date().toISOString() }, 500); }
  deleteCase(_id: string) { return wrap(undefined, 400); }
  archiveCase(id: string) { return wrap({ ...(MOCK_CASES.find(c => c.id === id) || MOCK_CASES[0]), status: 'archived' as any }, 400); }
  closeCase(id: string) { return wrap({ ...(MOCK_CASES.find(c => c.id === id) || MOCK_CASES[0]), status: 'closed' as any }, 400); }

  // ===================================================================
  // Documents
  // FUTURE BACKEND IMPLEMENTATION (comment only — mock behavior unchanged):
  //
  //   GET /api/documents?caseId=:caseId        → { data: { items, total, page, pageSize, totalPages }, success: true }
  //   GET /api/documents/:id                   → { data: Document, success: true }
  //   POST /api/documents (multipart/form-data: file, caseId)
  //     Response: { data: Document, success: true }
  //   DELETE /api/documents/:id                → { success: true }
  //   GET /api/documents/:id/analysis          → { data: DocumentAnalysis, success: true }
  //   POST /api/documents/:id/analyze          → { data: DocumentAnalysis, success: true }
  //   GET /api/documents/:id/download          → raw Blob (binary stream)
  //   GET /api/documents/:id/text              → { data: { text: string, language: string }, success: true }
  //
  //   Example service call for upload once wired to a real backend:
  //     uploadDocument(file: File, caseId?: string) {
  //       const form = new FormData();
  //       form.append('file', file);
  //       if (caseId) form.append('caseId', caseId);
  //       return this.http.post<ApiResponse<Document>>('/api/documents', form);
  //     }
  // ===================================================================
  getDocuments(caseId?: string) {
    const items = caseId ? MOCK_DOCUMENTS.filter(d => d.caseId === caseId) : MOCK_DOCUMENTS;
    return wrap({ items, total: items.length, page: 1, pageSize: 20, totalPages: 1 });
  }
  getDocument(id: string) { return wrap(MOCK_DOCUMENTS.find(d => d.id === id) || MOCK_DOCUMENTS[0]); }
  uploadDocument(file: File, _caseId?: string) {
    const newDoc: Document = { id: 'doc-new-' + Date.now(), caseId: _caseId, fileName: file.name, originalName: file.name, fileType: file.name.split('.').pop() || 'pdf', fileSize: file.size, mimeType: file.type || 'application/pdf', storagePath: '/uploads/' + file.name, status: 'processed', ocrStatus: 'completed', analysisStatus: 'completed', language: 'en', pageCount: 8, uploadedBy: MOCK_USER, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return wrap(newDoc, 1200);
  }
  deleteDocument(_id: string) { return wrap(undefined, 400); }
  getDocumentAnalysis(_id: string) { return wrap(MOCK_ANALYSIS, 600); }
  triggerAnalysis(_id: string) { return wrap({ ...MOCK_ANALYSIS, id: 'ana-new-' + Date.now() }, 2000); }
  // Runs analysis on a document and returns the updated Document record
  // (used by contract-viewer's "Analyze" action, distinct from
  // triggerAnalysis/getDocumentAnalysis which return a DocumentAnalysis).
  analyzeDocument(id: string) {
    const doc = MOCK_DOCUMENTS.find(d => d.id === id) || MOCK_DOCUMENTS[0];
    return wrap({ ...doc, analysisStatus: 'completed' as any, updatedAt: new Date().toISOString() }, 1500);
  }
  downloadDocument(_id: string) { return of(new Blob(['mock pdf content'], { type: 'application/pdf' })); }
  getDocumentText(_id: string) { return wrap({ text: 'NON-DISCLOSURE AGREEMENT\n\nThis Non-Disclosure Agreement ("Agreement") is entered into as of January 15, 2024 between TechCorp Industries Ltd. ("Disclosing Party") and Nexus Capital Group ("Receiving Party")...\n\nARTICLE 1 — DEFINITIONS\n\n1.1 "Confidential Information" means any and all information disclosed by the Disclosing Party...', language: 'en' }, 500); }

  // ===================================================================
  // Analysis
  // FUTURE BACKEND IMPLEMENTATION (comment only — mock behavior unchanged):
  //
  //   GET /api/analysis/:documentId
  //     Response: { data: DocumentAnalysis, success: true }
  //
  //   Example service call once wired to a real backend:
  //     getAnalysis(documentId: string) {
  //       return this.http.get<ApiResponse<DocumentAnalysis>>(`/api/analysis/${documentId}`);
  //     }
  // ===================================================================
  getAnalysis(_documentId: string) { return wrap(MOCK_ANALYSIS, 500); }
  // Returns timeline events, optionally scoped to a case (used by TimelineComponent).
  getTimeline(_caseId?: string) { return wrap(MOCK_ANALYSIS.timeline, 500); }

  // ===================================================================
  // Reports
  // FUTURE BACKEND IMPLEMENTATION (comment only — mock behavior unchanged):
  //
  //   GET /api/reports?caseId=:caseId      → { data: { items, total, page, pageSize, totalPages }, success: true }
  //   GET /api/reports/:id                 → { data: Report, success: true }
  //   POST /api/reports                    Request: { title?, reportType, caseId?, includeSections? }
  //                                         Response: { data: Report, success: true }
  //   DELETE /api/reports/:id              → { success: true }
  //   GET /api/reports/:id/download?format=pdf|docx  → raw Blob (binary stream)
  //
  //   NOTE: server-rendered htmlContent in a Report must be sanitized
  //   server-side before being returned (strip <script>, on* attrs, etc) —
  //   see report-viewer.component.ts for the client-side DomSanitizer note.
  //
  //   Example service call once wired to a real backend:
  //     generateReport(data: GenerateReportRequest) {
  //       return this.http.post<ApiResponse<Report>>('/api/reports', data);
  //     }
  // ===================================================================
  getReports(caseId?: string) {
    const items = caseId ? MOCK_REPORTS.filter(r => r.caseId === caseId) : MOCK_REPORTS;
    return wrap({ items, total: items.length, page: 1, pageSize: 20, totalPages: 1 });
  }
  getReport(id: string) { return wrap(MOCK_REPORTS.find(r => r.id === id) || MOCK_REPORTS[0]); }
  generateReport(data: any) {
    const newReport: Report = { id: 'rep-' + Date.now(), title: data.title || 'AI Generated Report — ' + new Date().toLocaleDateString(), reportType: data.reportType || 'contract_analysis', status: 'completed', summary: 'AI-generated report completed successfully with comprehensive analysis.', htmlContent: '<h2>Generated Report</h2><p>This report was generated by Saul AI based on your documents.</p>', sections: [], createdBy: MOCK_USER, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() };
    return wrap(newReport, 2500);
  }
  deleteReport(_id: string) { return wrap(undefined, 400); }
  downloadReport(_id: string, _fmt: string) { return of(new Blob(['mock report content'], { type: 'application/pdf' })); }

  // ===================================================================
  // Chat
  // FUTURE BACKEND IMPLEMENTATION (comment only — mock behavior unchanged):
  //
  //   GET /api/chat/sessions                  → { data: { items: ChatSession[], ... }, success: true }
  //   GET /api/chat/sessions/:id               → { data: ChatSession (with messages), success: true }
  //   POST /api/chat/sessions  Request: { title?, caseId? } → { data: ChatSession, success: true }
  //   DELETE /api/chat/sessions/:id             → { success: true }
  //   GET /api/chat/sessions/:id/messages       → { data: ChatMessage[], success: true }
  //
  //   Streaming replies (SaulService.sendMessage) belong on the AI
  //   endpoint, not here — see saul.service.ts for the SSE/WebSocket
  //   FUTURE BACKEND IMPLEMENTATION notes already documented there.
  //
  //   Example service call once wired to a real backend:
  //     getSessions() {
  //       return this.http.get<ApiResponse<PaginatedSessions>>('/api/chat/sessions');
  //     }
  // ===================================================================
  getSessions() { return wrap({ items: MOCK_SESSIONS, total: MOCK_SESSIONS.length, page: 1, pageSize: 20, totalPages: 1 }); }
  getSession(id: string) { return wrap({ ...(MOCK_SESSIONS.find(s => s.id === id) || MOCK_SESSIONS[0]), messages: MOCK_MESSAGES.filter(m => m.sessionId === id) }); }
  createSession(title?: string, caseId?: string) { return wrap({ id: 'ses-' + Date.now(), title: title || 'New Conversation', caseId, messages: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isActive: true }, 300); }
  deleteSession(_id: string) { return wrap(undefined, 300); }
  getMessages(sessionId: string) { return wrap(MOCK_MESSAGES.filter(m => m.sessionId === sessionId), 400); }

  // ===================================================================
  // Notifications
  // FUTURE BACKEND IMPLEMENTATION (comment only — mock behavior unchanged):
  //
  //   GET /api/notifications                → { data: { items, total, ... }, success: true }
  //   GET /api/notifications/unread-count   → { data: { count: number }, success: true }
  //   POST /api/notifications/:id/read      → { success: true }
  //   POST /api/notifications/read-all      → { success: true }
  //   DELETE /api/notifications/:id         → { success: true }
  //
  //   Real-time push for new notifications belongs on SignalRService
  //   (see signalr.service.ts) once a live connection replaces `connect()`.
  //
  //   Example service call once wired to a real backend:
  //     getNotifications() {
  //       return this.http.get<ApiResponse<PaginatedNotifications>>('/api/notifications');
  //     }
  // ===================================================================
  getNotifications() { return wrap({ items: MOCK_NOTIFICATIONS, total: MOCK_NOTIFICATIONS.length, page: 1, pageSize: 20, totalPages: 1 }); }
  getUnreadCount() { return wrap({ count: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length }, 200); }
  markAsRead(_id: string) { return wrap(undefined, 200); }
  markAllAsRead() { return wrap(undefined, 300); }
  deleteNotification(_id: string) { return wrap(undefined, 200); }

  // ===================================================================
  // Dashboard
  // FUTURE BACKEND IMPLEMENTATION (comment only — mock behavior unchanged):
  //
  //   GET /api/dashboard/stats              → { data: DashboardStats, success: true }
  //   GET /api/dashboard/analytics?period=30d
  //     Response: { data: { period, casesOpened, casesClosed, documentsProcessed,
  //                          aiQueriesCount, averageRiskScore, topRiskCategories,
  //                          contractTypes }, success: true }
  //
  //   Example service call once wired to a real backend:
  //     getDashboardStats() {
  //       return this.http.get<ApiResponse<DashboardStats>>('/api/dashboard/stats');
  //     }
  // ===================================================================
  getDashboardStats() { return wrap(MOCK_DASHBOARD_STATS, 500); }
  getAnalytics(_period: string) {
    return wrap({
      period: _period, casesOpened: 18, casesClosed: 12, documentsProcessed: 147,
      aiQueriesCount: 423, averageRiskScore: 52,
      topRiskCategories: [
        { label: 'Liability', value: 34, color: '#ef4444' },
        { label: 'Confidentiality', value: 28, color: '#f97316' },
        { label: 'Term & Duration', value: 21, color: '#eab308' },
        { label: 'Dispute Resolution', value: 17, color: '#8b5cf6' },
        { label: 'Payment Terms', value: 14, color: '#3b82f6' },
      ],
      contractTypes: [
        { label: 'NDA', value: 42, color: '#4e4eeb' },
        { label: 'Service Agreement', value: 31, color: '#10b981' },
        { label: 'Employment', value: 22, color: '#8b5cf6' },
        { label: 'Partnership', value: 18, color: '#f59e0b' },
        { label: 'License', value: 15, color: '#0ea5e9' },
      ],
    }, 600);
  }

  // ===================================================================
  // Search
  // FUTURE BACKEND IMPLEMENTATION (comment only — mock behavior unchanged):
  //
  //   GET /api/search?q=:query
  //     Response: { data: { results, total, page, pageSize, query, searchTime }, success: true }
  //
  //   GET /api/documents/:id/similar-cases       → { data: SimilarCase[], success: true }
  //   POST /api/search/similar-cases  Request: { text }  → { data: SimilarCase[], success: true }
  //
  //   This is also where a future vector/knowledge-graph search backend
  //   (powering the Graph feature's similarity edges) would be wired in.
  //
  //   Example service call once wired to a real backend:
  //     search(query: string) {
  //       return this.http.get<ApiResponse<SearchResults>>('/api/search', { params: { q: query } });
  //     }
  // ===================================================================
  search(query: string) {
    const q = query.toLowerCase();
    const filtered = MOCK_SEARCH_RESULTS.filter(r => r.title.toLowerCase().includes(q) || r.excerpt.toLowerCase().includes(q));
    return wrap({ results: filtered.length > 0 ? filtered : MOCK_SEARCH_RESULTS, total: filtered.length || MOCK_SEARCH_RESULTS.length, page: 1, pageSize: 20, query, searchTime: 245 }, 600);
  }
  getSimilarCases(_docId: string) { return wrap(MOCK_SIMILAR_CASES, 700); }
  getSimilarCasesByText(_text: string) { return wrap(MOCK_SIMILAR_CASES, 800); }

  // ===================================================================
  // Recommendations
  // FUTURE BACKEND IMPLEMENTATION (comment only — mock behavior unchanged):
  //
  //   GET /api/recommendations
  //     Response: { data: Recommendation[], success: true }
  //
  //   Example service call once wired to a real backend:
  //     getRecommendations() {
  //       return this.http.get<ApiResponse<Recommendation[]>>('/api/recommendations');
  //     }
  // ===================================================================
  getRecommendations() {
    return wrap(MOCK_ANALYSIS.recommendations || [], 500);
  }

  // ===================================================================
  // User
  // FUTURE BACKEND IMPLEMENTATION (comment only — mock behavior unchanged):
  //
  //   PUT /api/users/me              Request: Partial<User>        → { data: User, success: true }
  //   PUT /api/users/me/preferences  Request: Partial<UserPreferences> → { data: User, success: true }
  //
  //   Example service call once wired to a real backend:
  //     updateProfile(data: Partial<User>) {
  //       return this.http.put<ApiResponse<User>>('/api/users/me', data);
  //     }
  // ===================================================================
  updateProfile(data: any) { return wrap({ ...MOCK_USER, ...data }, 600); }
  updatePreferences(data: any) { return wrap({ ...MOCK_USER, preferences: { ...MOCK_USER.preferences, ...data } }, 400); }
}
