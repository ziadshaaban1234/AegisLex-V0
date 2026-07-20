import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MockService } from '@core/mock/mock.service';
import { ToastService } from '@core/services/toast.service';
import { LanguageService } from '@core/services/language.service';
import { Report } from '@core/models';

@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './report-viewer.component.html',
  styleUrl: './report-viewer.component.scss',
})
export class ReportViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly mockService = inject(MockService);
  private readonly toastService = inject(ToastService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly langService = inject(LanguageService);

  report = signal<Report | null>(null);
  safeHtmlContent = signal<SafeHtml>('');
  loading = signal(true);
  downloading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || 'rep-001';
    this.mockService.getReport(id).subscribe({
      next: (res: any) => {
        this.report.set(res.data);
        // ────────────────────────────────────────────────────────────────
        // SECURITY: bypassSecurityTrustHtml is used here because htmlContent
        // is AI-generated server content rendered as a formatted report.
        // In mock mode this is a hard-coded string literal (safe).
        //
        // FUTURE BACKEND IMPLEMENTATION:
        //   When wiring to a real backend, the server must sanitize
        //   htmlContent before returning it (strip <script>, on* attrs, etc).
        //   A server-side HTML sanitizer (e.g. HtmlSanitizer.NET / DOMPurify
        //   on the Node layer) is the correct defence-in-depth approach.
        //   Angular's DomSanitizer here is the client-side last line.
        // ────────────────────────────────────────────────────────────────
        if (res.data.htmlContent) {
          this.safeHtmlContent.set(
            this.sanitizer.bypassSecurityTrustHtml(res.data.htmlContent)
          );
        }
        this.loading.set(false);
      },
    });
  }

  download(format: 'pdf' | 'docx'): void {
    this.downloading.set(true);
    this.mockService.downloadReport(this.report()?.id || 'rep-001', format).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${this.report()!.title}.${format}`; a.click();
        URL.revokeObjectURL(url);
        this.downloading.set(false);
        this.toastService.success(this.langService.t('viewer.toast.download'));
      },
    });
  }

  formatReportType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(this.langService.currentLang() === 'ar' ? 'ar-AE' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
