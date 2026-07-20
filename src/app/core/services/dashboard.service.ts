import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardStats, AnalyticsData, ApiResponse } from '@core/models';
import { MockService } from '@core/mock/mock.service';

// ─────────────────────────────────────────────────────────────────────────────
// FUTURE BACKEND IMPLEMENTATION (comment only — no runtime change)
//
//   getStats():          GET /api/v1/dashboard/stats
//                          Returns: { totalCases, activeCases, documentsAnalyzed,
//                                     risksDetected, reportsGenerated, pendingTasks,
//                                     casesByStatus, casesByType, monthlyActivity }
//   getAnalytics(range): GET /api/v1/analytics?range=30d|90d|1y
//                          Returns: { chartData, trends, topRisks, topCaseTypes }
//   getRecentActivity(): GET /api/v1/dashboard/activity?limit=10
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly mock = inject(MockService);
  getStats(): Observable<ApiResponse<DashboardStats>> { return this.mock.getDashboardStats() as any; }
  getAnalytics(period: '7d' | '30d' | '90d' | '1y'): Observable<ApiResponse<AnalyticsData>> { return this.mock.getAnalytics(period) as any; }
  getRecentActivity(_limit = 10): Observable<ApiResponse<any[]>> { return this.mock.getDashboardStats() as any; }
}
