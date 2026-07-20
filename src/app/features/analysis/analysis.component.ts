import { Component, OnInit, inject, signal } from '@angular/core';
import { ScaleOfJusticeComponent } from '@shared/components/scale-of-justice/scale-of-justice.component';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MockService } from '@core/mock/mock.service';
import { ToastService } from '@core/services/toast.service';
import { LanguageService } from '@core/services/language.service';
import { DocumentAnalysis } from '@core/models';

// ─────────────────────────────────────────────────────────────────────────────
// AI PROVIDER ABSTRACTION — FUTURE BACKEND INTEGRATION
//
// Current state: MockService serves all document analysis results.
//
// Future Provider Flow:
//   Grok (Primary)
//   ↓ (on failure / timeout — handled by backend, transparent to frontend)
//   Gemini (Fallback)
//   ↓
//   Backend returns unified DocumentAnalysis response.
//
// Future Backend Endpoints:
//   GET    ${env.aiBaseUrl}/documents/:documentId/analysis
//   POST   ${env.aiBaseUrl}/documents/:documentId/analyze  (triggers analysis)
//
// Angular integration (when backend is ready):
//   Replace this.mockService.getDocumentAnalysis(docId) with:
//     this.http.get<ApiResponse<DocumentAnalysis>>(
//       `${this.env.aiBaseUrl}/documents/${docId}/analysis`
//     )
//
//   Replace this.mockService.triggerAnalysis(id) with:
//     this.http.post<ApiResponse<DocumentAnalysis>>(
//       `${this.env.aiBaseUrl}/documents/${id}/analyze`, {}
//     )
//
// No component template changes needed. The DocumentAnalysis interface
// (core/models/index.ts) already matches the expected backend shape.
// ─────────────────────────────────────────────────────────────────────────────

type AnalysisTab = 'summary' | 'risks' | 'clauses' | 'entities' | 'contradictions' | 'recommendations';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, RouterLink, ScaleOfJusticeComponent],
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.scss',
})
export class AnalysisComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly mockService = inject(MockService);
  private readonly toastService = inject(ToastService);
  readonly lang = inject(LanguageService);

  analysis = signal<DocumentAnalysis | null>(null);
  loading = signal(true);
  analysisRunning = signal(false);
  activeTab = signal<AnalysisTab>('summary');
  expandedRiskId = signal<string | null>(null);
  documentId = signal<string>('');

  get tabs(): { id: AnalysisTab; label: string; icon: string; count?: () => number }[] {
    return [
      { id: 'summary',         label: this.lang.t('analysis.tab.summary'),         icon: 'auto_awesome' },
      { id: 'risks',           label: this.lang.t('analysis.tab.risks'),           icon: 'warning',         count: () => this.analysis()?.risks?.length ?? 0 },
      { id: 'clauses',         label: this.lang.t('analysis.tab.clauses'),         icon: 'description',     count: () => this.analysis()?.clauses?.length ?? 0 },
      { id: 'entities',        label: this.lang.t('analysis.tab.entities'),        icon: 'account_tree',    count: () => this.analysis()?.entities?.length ?? 0 },
      { id: 'contradictions',  label: this.lang.t('analysis.tab.contradictions'),  icon: 'compare_arrows',  count: () => this.analysis()?.contradictions?.length ?? 0 },
      { id: 'recommendations', label: this.lang.t('analysis.tab.recommendations'), icon: 'lightbulb',       count: () => this.analysis()?.recommendations?.length ?? 0 },
    ];
  }

  ngOnInit(): void {
    const docId = this.route.snapshot.paramMap.get('documentId') || 'doc-001';
    this.documentId.set(docId);
    // Current: MockService (mock mode)
    // Future:  GET ${env.aiBaseUrl}/documents/:documentId/analysis
    //          Provider: Grok (primary) | Gemini (fallback — backend decides)
    this.mockService.getDocumentAnalysis(docId).subscribe({
      next: (res: any) => { this.analysis.set(res.data); this.loading.set(false); },
    });
  }

  runAnalysis(): void {
    this.analysisRunning.set(true);
    // Current: MockService (mock mode)
    // Future:  POST ${env.aiBaseUrl}/documents/:documentId/analyze
    //          Provider: Grok (primary) | Gemini (fallback — backend decides)
    this.mockService.triggerAnalysis(this.documentId()).subscribe({
      next: (res: any) => {
        this.analysis.set(res.data);
        this.analysisRunning.set(false);
        this.toastService.success(this.lang.t('analysis.toast.complete'));
      },
    });
  }

  getRiskConfig(severity: string): { color: string; bg: string; icon: string } {
    const m: Record<string, { color: string; bg: string; icon: string }> = {
      critical: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', icon: 'dangerous' },
      high:     { color: '#ea580c', bg: 'rgba(234,88,12,0.08)',  icon: 'warning' },
      medium:   { color: '#ca8a04', bg: 'rgba(202,138,4,0.08)',  icon: 'error_outline' },
      low:      { color: '#16a34a', bg: 'rgba(22,163,74,0.08)',  icon: 'info' },
    };
    return m[severity] || { color: '#64748b', bg: 'rgba(100,116,139,0.08)', icon: 'info' };
  }

  getContradictionConfig(s: string): { color: string; bg: string } {
    const m: Record<string,{color:string;bg:string}> = { critical:{color:'#dc2626',bg:'rgba(220,38,38,0.08)'}, moderate:{color:'#ea580c',bg:'rgba(234,88,12,0.08)'}, minor:{color:'#ca8a04',bg:'rgba(202,138,4,0.08)'} };
    return m[s] || { color: '#64748b', bg: 'rgba(100,116,139,0.08)' };
  }

  getPriorityConfig(p: string): { color: string; bg: string } {
    const m: Record<string,{color:string;bg:string}> = { urgent:{color:'#dc2626',bg:'rgba(220,38,38,0.1)'}, high:{color:'#ea580c',bg:'rgba(234,88,12,0.1)'}, medium:{color:'#ca8a04',bg:'rgba(202,138,4,0.1)'}, low:{color:'#16a34a',bg:'rgba(22,163,74,0.1)'} };
    return m[p] || { color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
  }

  toggleRisk(id: string): void { this.expandedRiskId.update(c => c === id ? null : id); }

  get criticalRisksCount(): number { return this.analysis()?.risks?.filter(r => r.severity === 'critical').length ?? 0; }
  get highRisksCount(): number { return this.analysis()?.risks?.filter(r => r.severity === 'high').length ?? 0; }

  getEntityAttributes(attrs: Record<string, string>): string[] { return Object.entries(attrs).map(([k, v]) => `${k}: ${v}`); }
  trackById(_: number, item: { id: string }): string { return item.id; }
}
