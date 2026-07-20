import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockService } from '@core/mock/mock.service';
import { LanguageService } from '@core/services/language.service';
import { AnalyticsData, ChartDataPoint } from '@core/models';

// ─────────────────────────────────────────────────────────────────────────────
// AI PROVIDER ABSTRACTION — FUTURE BACKEND INTEGRATION
//
// Current state: MockService serves all analytics/insights data.
//
// Future Provider Flow:
//   Grok (Primary) — AI-driven analytics and trend detection
//   ↓ (on failure / timeout — handled by backend, transparent to frontend)
//   Gemini (Fallback)
//   ↓
//   Backend returns unified AnalyticsData response.
//
// Future Backend Endpoint:
//   GET /api/v1/analytics?period=7d|30d|90d|1y
//
// Angular integration (when backend is ready):
//   Replace this.mockService.getAnalytics(period) with:
//     this.http.get<ApiResponse<AnalyticsData>>(
//       `/api/v1/analytics`, { params: { period } }
//     )
//
// No component template changes needed.
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.scss',
})
export class InsightsComponent implements OnInit {
  private readonly mockService = inject(MockService);
  readonly lang = inject(LanguageService);

  analytics = signal<AnalyticsData | null>(null);
  loading = signal(true);
  selectedPeriod = signal<'7d'|'30d'|'90d'|'1y'>('30d');

  get periods(): {value: '7d'|'30d'|'90d'|'1y'; label: string}[] {
    return [
      { value: '7d',  label: this.lang.t('insights.period.7d') },
      { value: '30d', label: this.lang.t('insights.period.30d') },
      { value: '90d', label: this.lang.t('insights.period.90d') },
      { value: '1y',  label: this.lang.t('insights.period.1y') },
    ];
  }

  get kpiItems() {
    return [
      { label: this.lang.t('insights.kpi.avg_analysis_time'), value: '2.4s', change: '-18%', positive: true, icon: 'speed',             color: '#4e4eeb' },
      { label: this.lang.t('insights.kpi.risk_detection'),    value: '94%',  change: '+3%',  positive: true, icon: 'warning',           color: '#ef4444' },
      { label: this.lang.t('insights.kpi.doc_coverage'),      value: '87%',  change: '+12%', positive: true, icon: 'document_scanner',  color: '#10b981' },
      { label: this.lang.t('insights.kpi.avg_risk_score'),    value: '52',   change: '-7',   positive: true, icon: 'analytics',         color: '#f59e0b' },
    ];
  }

  kpis = signal([
    { label: 'Avg Analysis Time', value: '2.4s', change: '-18%', positive: true, icon: 'speed',            color: '#4e4eeb' },
    { label: 'Risk Detection Rate', value: '94%', change: '+3%', positive: true, icon: 'warning',          color: '#ef4444' },
    { label: 'Document Coverage', value: '87%',  change: '+12%', positive: true, icon: 'document_scanner', color: '#10b981' },
    { label: 'Avg Risk Score',    value: '52',   change: '-7',   positive: true, icon: 'analytics',        color: '#f59e0b' },
  ]);

  ngOnInit(): void { this.loadAnalytics(); }

  loadAnalytics(): void {
    this.loading.set(true);
    // Current: MockService (mock mode)
    // Future:  GET /api/v1/analytics?period=${this.selectedPeriod()}
    //          Provider: Grok (primary) | Gemini (fallback — backend decides)
    this.mockService.getAnalytics(this.selectedPeriod()).subscribe({
      next: (res: any) => { this.analytics.set(res.data); this.loading.set(false); },
    });
  }

  setPeriod(p: '7d'|'30d'|'90d'|'1y'): void { this.selectedPeriod.set(p); this.loadAnalytics(); }

  getBarWidth(value: number, data: ChartDataPoint[]): number {
    const max = Math.max(...data.map(d=>d.value)); return max>0?(value/max)*100:0;
  }
}
