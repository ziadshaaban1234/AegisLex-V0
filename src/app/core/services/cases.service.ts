import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Case, CreateCaseRequest, PagedResult, ApiResponse } from '@core/models';
import { MockService } from '@core/mock/mock.service';

// =======================================================
// FUTURE BACKEND IMPLEMENTATION (comment only — no behavior
// change; every method below still calls MockService exactly
// as before). When a real backend exists, this whole service
// can be swapped behind the same public method signatures —
// callers (components) never need to change.
//
// GET    /api/cases?page=&pageSize=&status=&search=  → getCases()
// GET    /api/cases/:id                               → getCase()
// POST   /api/cases               { title, ... }      → createCase()
// PATCH  /api/cases/:id           { ...partial }      → updateCase()
// DELETE /api/cases/:id                                → deleteCase()
// POST   /api/cases/:id/archive                        → archiveCase()
// POST   /api/cases/:id/close                           → closeCase()
//
// Angular example (getCases):
//   return this.http.get<ApiResponse<PagedResult<Case>>>('/api/cases', {
//     params: { page, pageSize, ...(status && { status }), ...(search && { search }) }
//   });
// =======================================================
@Injectable({ providedIn: 'root' })
export class CasesService {
  private readonly mock = inject(MockService);
  getCases(page = 1, pageSize = 20, status?: string, search?: string): Observable<ApiResponse<PagedResult<Case>>> { return this.mock.getCases(page, pageSize, status, search) as any; }
  getCase(id: string): Observable<ApiResponse<Case>> { return this.mock.getCase(id) as any; }
  createCase(request: CreateCaseRequest): Observable<ApiResponse<Case>> { return this.mock.createCase(request) as any; }
  updateCase(id: string, request: Partial<CreateCaseRequest>): Observable<ApiResponse<Case>> { return this.mock.updateCase(id, request) as any; }
  deleteCase(id: string): Observable<ApiResponse<void>> { return this.mock.deleteCase(id) as any; }
  archiveCase(id: string): Observable<ApiResponse<Case>> { return this.mock.archiveCase(id) as any; }
  closeCase(id: string): Observable<ApiResponse<Case>> { return this.mock.closeCase(id) as any; }
}
