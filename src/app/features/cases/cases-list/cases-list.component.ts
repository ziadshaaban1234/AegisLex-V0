import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockService } from '@core/mock/mock.service';
import { ToastService } from '@core/services/toast.service';
import { LanguageService } from '@core/services/language.service';
import { Store } from '@ngrx/store';
import { CasesActions } from '../../../store/cases/cases.reducer';
import { Case } from '@core/models';

@Component({
  selector: 'app-cases-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cases-list.component.html',
  styleUrl: './cases-list.component.scss',
})
export class CasesListComponent implements OnInit {
  private readonly mockService    = inject(MockService);
  private readonly toastService   = inject(ToastService);
  private readonly store          = inject(Store);
  readonly lang                   = inject(LanguageService);

  cases            = signal<Case[]>([]);
  loading          = signal(true);
  total            = signal(0);
  page             = signal(1);
  pageSize         = 20;
  searchQuery      = signal('');
  selectedStatus   = signal<string>('');
  selectedType     = signal<string>('');
  selectedPriority = signal<string>('');
  viewMode         = signal<'grid' | 'list'>('list');
  showDeleteConfirm = signal<string | null>(null);

  // Options use lang.t() so they re-evaluate on language switch via computed
  statusOptions = computed(() => [
    { value: '',         label: this.lang.t('cases.filter.all_statuses') },
    { value: 'active',   label: this.lang.t('cases.status.active') },
    { value: 'pending',  label: this.lang.t('cases.status.pending') },
    { value: 'review',   label: this.lang.t('cases.status.under_review') },
    { value: 'closed',   label: this.lang.t('cases.status.closed') },
    { value: 'archived', label: this.lang.t('cases.status.archived') },
  ]);

  typeOptions = computed(() => [
    { value: '',              label: this.lang.t('cases.filter.all_types') },
    { value: 'contract',     label: this.lang.t('cases.type.contract') },
    { value: 'litigation',   label: this.lang.t('cases.type.litigation') },
    { value: 'compliance',   label: this.lang.t('cases.type.compliance') },
    { value: 'investigation',label: this.lang.t('cases.type.investigation') },
    { value: 'advisory',     label: this.lang.t('cases.type.advisory') },
  ]);

  priorityOptions = computed(() => [
    { value: '',         label: this.lang.t('cases.filter.all_priorities') },
    { value: 'critical', label: this.lang.t('cases.priority.critical') },
    { value: 'high',     label: this.lang.t('cases.priority.high') },
    { value: 'medium',   label: this.lang.t('cases.priority.medium') },
    { value: 'low',      label: this.lang.t('cases.priority.low') },
  ]);

  totalPages = computed(() => Math.ceil(this.total() / this.pageSize));

  ngOnInit(): void { this.loadCases(); }

  loadCases(): void {
    this.loading.set(true);
    this.mockService.getCases(this.page(), this.pageSize, this.selectedStatus() || undefined, this.searchQuery() || undefined).subscribe({
      next: (res: any) => { this.cases.set(res.data.items); this.total.set(res.data.total); this.loading.set(false); },
    });
  }

  onSearch(event: Event): void { this.searchQuery.set((event.target as HTMLInputElement).value); this.page.set(1); this.loadCases(); }
  onFilterChange(): void { this.page.set(1); this.loadCases(); }

  deleteCase(id: string): void {
    this.mockService.deleteCase(id).subscribe({
      next: () => {
        this.store.dispatch(CasesActions.deleteCaseSuccess({ id }));
        this.cases.update(c => c.filter(x => x.id !== id));
        this.total.update(t => t - 1);
        this.showDeleteConfirm.set(null);
        this.toastService.success(this.lang.t('cases.toast.deleted'));
      },
    });
  }

  archiveCase(id: string): void {
    this.mockService.archiveCase(id).subscribe({
      next: (res: any) => {
        this.cases.update(c => c.map(x => x.id === id ? res.data : x));
        this.toastService.success(this.lang.t('cases.toast.archived'));
      },
    });
  }

  goToPage(p: number): void { if (p < 1 || p > this.totalPages()) return; this.page.set(p); this.loadCases(); }

  getPriorityConfig(priority: string): { label: string; color: string; bg: string } {
    const labels: Record<string, string> = {
      critical: this.lang.t('cases.priority.critical'),
      high:     this.lang.t('cases.priority.high'),
      medium:   this.lang.t('cases.priority.medium'),
      low:      this.lang.t('cases.priority.low'),
    };
    const colors: Record<string, { color: string; bg: string }> = {
      critical: { color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
      high:     { color: '#ea580c', bg: 'rgba(234,88,12,0.1)' },
      medium:   { color: '#ca8a04', bg: 'rgba(202,138,4,0.1)' },
      low:      { color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
    };
    return { label: labels[priority] || priority, ...(colors[priority] || { color: '#64748b', bg: 'rgba(100,116,139,0.1)' }) };
  }

  getStatusConfig(status: string): { label: string; color: string; bg: string } {
    const labels: Record<string, string> = {
      active:   this.lang.t('cases.status.active'),
      pending:  this.lang.t('cases.status.pending'),
      review:   this.lang.t('cases.status.review'),
      closed:   this.lang.t('cases.status.closed'),
      archived: this.lang.t('cases.status.archived'),
    };
    const colors: Record<string, { color: string; bg: string }> = {
      active:   { color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
      pending:  { color: '#ca8a04', bg: 'rgba(202,138,4,0.1)' },
      review:   { color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
      closed:   { color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
      archived: { color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
    };
    return { label: labels[status] || status, ...(colors[status] || { color: '#64748b', bg: 'rgba(100,116,139,0.1)' }) };
  }

  getCaseTypeIcon(type: string): string {
    const m: Record<string, string> = { contract: 'description', litigation: 'gavel', compliance: 'verified', investigation: 'search', advisory: 'lightbulb', other: 'folder' };
    return m[type] || 'folder';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.lang.currentLang() === 'ar' ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  trackById(_: number, item: Case): string { return item.id; }
}
