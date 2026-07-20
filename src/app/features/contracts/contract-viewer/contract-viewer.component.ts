import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MockService } from '@core/mock/mock.service';
import { ToastService } from '@core/services/toast.service';
import { LanguageService } from '@core/services/language.service';
import { Document as Doc } from '@core/models';

type Panel = 'text' | 'analysis' | 'risks' | 'entities';

@Component({
  selector: 'app-contract-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contract-viewer.component.html',
  styleUrl: './contract-viewer.component.scss',
})
export class ContractViewerComponent implements OnInit {
  private readonly route        = inject(ActivatedRoute);
  private readonly mockService  = inject(MockService);
  private readonly toastService = inject(ToastService);
  readonly lang                 = inject(LanguageService);

  document   = signal<Doc | null>(null);
  loading    = signal(true);
  analyzing  = signal(false);
  activePanel= signal<Panel>('text');
  zoom       = signal(100);
  currentPage= signal(1);

  // Panels are computed so labels update on language switch
  panels = computed(() => [
    { id: 'text'     as Panel, label: this.lang.t('viewer.panel.text'),     icon: 'article' },
    { id: 'analysis' as Panel, label: this.lang.t('viewer.panel.analysis'), icon: 'analytics' },
    { id: 'risks'    as Panel, label: this.lang.t('viewer.panel.risks'),    icon: 'warning' },
    { id: 'entities' as Panel, label: this.lang.t('viewer.panel.entities'), icon: 'hub' },
  ]);

  totalPages = computed(() => this.document()?.pageCount ?? 1);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.mockService.getDocument(id).subscribe({
      next: (res: any) => { this.document.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  analyze(): void {
    if (!this.document()) return;
    this.analyzing.set(true);
    this.mockService.analyzeDocument(this.document()!.id).subscribe({
      next: (res: any) => {
        this.document.set(res.data);
        this.analyzing.set(false);
        this.activePanel.set('analysis');
        this.toastService.success(this.lang.t('viewer.toast.analyzed'));
      },
      error: () => this.analyzing.set(false),
    });
  }

  download(): void {
    this.toastService.info(this.lang.t('viewer.toast.download'), this.document()?.originalName || '');
  }

  zoomIn():    void { if (this.zoom() < 200) this.zoom.update(z => z + 25); }
  zoomOut():   void { if (this.zoom() > 50)  this.zoom.update(z => z - 25); }
  resetZoom(): void { this.zoom.set(100); }

  prevPage(): void { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage(): void { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }

  getRiskDesc(score: number): string {
    if (score >= 70) return this.lang.t('viewer.risk.high');
    if (score >= 40) return this.lang.t('viewer.risk.medium');
    return this.lang.t('viewer.risk.low');
  }

  getRiskColor(score: number): string {
    if (score >= 70) return '#ef4444';
    if (score >= 40) return '#f59e0b';
    return '#22c55e';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(
      this.lang.currentLang() === 'ar' ? 'ar-AE' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  }

  getRiskSeverityColor(severity: string): string {
    const m: Record<string, string> = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e', informational: '#3b82f6' };
    return m[severity] || '#94a3b8';
  }

  getEntityIcon(type: string): string {
    const m: Record<string, string> = { person: 'person', organization: 'business', location: 'location_on', date: 'calendar_today', amount: 'payments', clause: 'article' };
    return m[type] || 'label';
  }
}
