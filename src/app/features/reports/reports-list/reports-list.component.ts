import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockService } from '@core/mock/mock.service';
import { ToastService } from '@core/services/toast.service';
import { LanguageService } from '@core/services/language.service';
import { Report, Case } from '@core/models';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './reports-list.component.html',
  styleUrl: './reports-list.component.scss',
})
export class ReportsListComponent implements OnInit {
  private readonly mockService = inject(MockService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  readonly langService = inject(LanguageService);

  reports = signal<Report[]>([]);
  cases = signal<Case[]>([]);
  loading = signal(true);
  showGenerateModal = signal(false);
  generating = signal(false);

  generateForm = { caseId: '', reportType: 'contract_analysis', title: '', includeRisks: true, includeTimeline: true, includeRecommendations: true, includeSimilarCases: false };

  reportTypes = [
    { value: 'contract_analysis', labelKey: 'reports.type.contract_analysis', icon: 'description' },
    { value: 'risk_assessment',   labelKey: 'reports.type.risk_assessment',   icon: 'warning' },
    { value: 'legal_summary',     labelKey: 'reports.type.legal_summary',     icon: 'summarize' },
    { value: 'due_diligence',     labelKey: 'reports.type.due_diligence',     icon: 'fact_check' },
    { value: 'case_report',       labelKey: 'reports.type.case_report',       icon: 'folder_open' },
  ];

  ngOnInit(): void {
    const caseId = this.route.snapshot.queryParamMap.get('caseId');
    if (caseId) this.generateForm.caseId = caseId;
    this.mockService.getReports(caseId || undefined).subscribe({
      next: (res: any) => { this.reports.set(res.data.items); this.loading.set(false); },
    });
    this.mockService.getCases(1, 100).subscribe({
      next: (res: any) => this.cases.set(res.data.items),
    });
  }

  generateReport(): void {
    this.generating.set(true);
    this.mockService.generateReport(this.generateForm).subscribe({
      next: (res: any) => {
        this.reports.update(r => [res.data, ...r]);
        this.showGenerateModal.set(false);
        this.generating.set(false);
        this.toastService.success(this.langService.t('reports.toast.generated'), res.data.title);
      },
    });
  }

  downloadReport(id: string, format: 'pdf' | 'docx'): void {
    this.mockService.downloadReport(id, format).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `report.${format}`; a.click();
        URL.revokeObjectURL(url);
        this.toastService.success(this.langService.t('viewer.toast.download'));
      },
    });
  }

  deleteReport(id: string): void {
    this.mockService.deleteReport(id).subscribe({
      next: () => { this.reports.update(r => r.filter(x => x.id !== id)); this.toastService.success(this.langService.t('reports.toast.deleted')); },
    });
  }

  getStatusConfig(status: string): { color: string; bg: string; icon: string } {
    const m: Record<string,{color:string;bg:string;icon:string}> = {
      completed:{color:'#16a34a',bg:'rgba(22,163,74,0.1)',icon:'check_circle'},
      generating:{color:'#f59e0b',bg:'rgba(245,158,11,0.1)',icon:'sync'},
      failed:{color:'#ef4444',bg:'rgba(239,68,68,0.1)',icon:'error'},
    };
    return m[status] || {color:'#64748b',bg:'rgba(100,116,139,0.1)',icon:'description'};
  }

  getReportTypeIcon(type: string): string {
    const m: Record<string,string> = { contract_analysis:'description', risk_assessment:'warning', legal_summary:'summarize', due_diligence:'fact_check', case_report:'folder_open' };
    return m[type] || 'description';
  }

  getReportTypeLabel(type: string): string {
    const found = this.reportTypes.find(r => r.value === type);
    return found ? this.langService.t(found.labelKey) : type;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.langService.currentLang() === 'ar' ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  trackById(_: number, item: Report): string { return item.id; }
}
