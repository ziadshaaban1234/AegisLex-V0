import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MockService } from '@core/mock/mock.service';
import { ToastService } from '@core/services/toast.service';
import { LanguageService } from '@core/services/language.service';
import { Case, Document } from '@core/models';

type ActiveTab = 'overview' | 'documents' | 'analysis' | 'timeline' | 'graph';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './case-detail.component.html',
  styleUrl: './case-detail.component.scss',
})
export class CaseDetailComponent implements OnInit {
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);
  private readonly mockService = inject(MockService);
  private readonly toastService= inject(ToastService);
  readonly lang                = inject(LanguageService);

  case_     = signal<Case | null>(null);
  documents = signal<Document[]>([]);
  loading   = signal(true);
  activeTab = signal<ActiveTab>('overview');

  // Tabs are computed so labels update when language changes
  tabs = computed(() => [
    { id: 'overview'  as ActiveTab, label: this.lang.t('case_detail.tab.overview'),  icon: 'dashboard' },
    { id: 'documents' as ActiveTab, label: this.lang.t('case_detail.tab.documents'), icon: 'folder' },
    { id: 'analysis'  as ActiveTab, label: this.lang.t('case_detail.tab.analysis'),  icon: 'analytics' },
    { id: 'timeline'  as ActiveTab, label: this.lang.t('case_detail.tab.timeline'),  icon: 'timeline' },
    { id: 'graph'     as ActiveTab, label: this.lang.t('case_detail.tab.graph'),     icon: 'hub' },
  ]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.mockService.getCase(id).subscribe({
      next: (res: any) => { this.case_.set(res.data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.router.navigate(['/app/cases']); },
    });
    this.mockService.getDocuments(id).subscribe({
      next: (res: any) => this.documents.set(res.data.items),
    });
  }

  closeCase(): void {
    this.mockService.closeCase(this.case_()!.id).subscribe({
      next: (res: any) => { this.case_.set(res.data); this.toastService.success(this.lang.t('cases.toast.closed')); },
    });
  }

  archiveCase(): void {
    this.mockService.archiveCase(this.case_()!.id).subscribe({
      next: (res: any) => { this.case_.set(res.data); this.toastService.success(this.lang.t('cases.toast.archived')); },
    });
  }

  analyzeAllDocuments(): void {
    this.toastService.info(
      this.lang.t('case_detail.analysis.toast_start'),
      this.lang.t('case_detail.analysis.processing', [this.documents().length])
    );
  }

  getRiskDesc(score: number): string {
    if (score >= 70) return this.lang.t('case_detail.risk.high_desc');
    if (score >= 40) return this.lang.t('case_detail.risk.medium_desc');
    return this.lang.t('case_detail.risk.low_desc');
  }

  docCountLabel(): string {
    const n = this.documents().length;
    return `${n} ${n !== 1 ? this.lang.t('case_detail.doc_plural') : this.lang.t('case_detail.doc_singular')}`;
  }

  getPriorityConfig(priority: string): { color: string; bg: string } {
    const m: Record<string, { color: string; bg: string }> = {
      critical: { color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
      high:     { color: '#ea580c', bg: 'rgba(234,88,12,0.1)' },
      medium:   { color: '#ca8a04', bg: 'rgba(202,138,4,0.1)' },
      low:      { color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
    };
    return m[priority] || { color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
  }

  getStatusConfig(status: string): { color: string; bg: string } {
    const m: Record<string, { color: string; bg: string }> = {
      active:   { color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
      pending:  { color: '#ca8a04', bg: 'rgba(202,138,4,0.1)' },
      review:   { color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
      closed:   { color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
      archived: { color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
    };
    return m[status] || { color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
  }

  getDocStatusIcon(status: string): string {
    const m: Record<string, string> = { uploaded: 'upload_file', processing: 'sync', processed: 'check_circle', error: 'error' };
    return m[status] || 'description';
  }

  getDocStatusColor(status: string): string {
    const m: Record<string, string> = { uploaded: '#64748b', processing: '#f59e0b', processed: '#22c55e', error: '#ef4444' };
    return m[status] || '#64748b';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.lang.currentLang() === 'ar' ? 'ar-AE' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  trackById(_: number, item: Document): string { return item.id; }
}
