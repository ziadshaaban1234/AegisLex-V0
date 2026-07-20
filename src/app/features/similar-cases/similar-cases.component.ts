import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockService } from '@core/mock/mock.service';
import { LanguageService } from '@core/services/language.service';
import { SimilarCase } from '@core/models';

// ─────────────────────────────────────────────────────────────────────────────
// AI PROVIDER ABSTRACTION — FUTURE BACKEND INTEGRATION
//
// Current state: MockService serves all similar-case search results.
//
// Future Provider Flow:
//   Grok (Primary) — semantic vector search + legal reasoning
//   ↓ (on failure / timeout — handled by backend, transparent to frontend)
//   Gemini (Fallback)
//   ↓
//   Backend returns unified SimilarCase[] response.
//
// Future Backend Endpoints:
//   GET  ${env.aiBaseUrl}/search/similar/:documentId   → getSimilarCases()
//   POST ${env.aiBaseUrl}/search/similar-by-text  { text } → searchByText()
//
// Angular integration (when backend is ready):
//   Replace this.mockService.getSimilarCases(docId) with:
//     this.http.get<ApiResponse<SimilarCase[]>>(
//       `${this.env.aiBaseUrl}/search/similar/${docId}`
//     )
//
//   Replace this.mockService.getSimilarCasesByText(text) with:
//     this.http.post<ApiResponse<SimilarCase[]>>(
//       `${this.env.aiBaseUrl}/search/similar-by-text`, { text }
//     )
//
// No component template changes needed.
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-similar-cases',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './similar-cases.component.html',
  styleUrl: './similar-cases.component.scss',
})
export class SimilarCasesComponent implements OnInit {
  private readonly mockService = inject(MockService);
  private readonly route = inject(ActivatedRoute);
  readonly lang = inject(LanguageService);

  cases = signal<SimilarCase[]>([]);
  loading = signal(true);
  searchText = signal('');

  ngOnInit(): void {
    // Current: MockService (mock mode)
    // Future:  GET ${env.aiBaseUrl}/search/similar/:documentId
    //          Provider: Grok (primary) | Gemini (fallback — backend decides)
    this.mockService.getSimilarCases('doc-001').subscribe({
      next: (res: any) => { this.cases.set(res.data); this.loading.set(false); },
    });
  }

  searchByText(): void {
    if (!this.searchText().trim()) return;
    this.loading.set(true);
    // Current: MockService (mock mode)
    // Future:  POST ${env.aiBaseUrl}/search/similar-by-text  { text: this.searchText() }
    //          Provider: Grok (primary) | Gemini (fallback — backend decides)
    this.mockService.getSimilarCasesByText(this.searchText()).subscribe({
      next: (res: any) => { this.cases.set(res.data); this.loading.set(false); },
    });
  }

  getScoreColor(score: number): string {
    if (score >= 0.85) return '#22c55e'; if (score >= 0.70) return '#f59e0b'; return '#64748b';
  }

  trackById(_: number, item: SimilarCase): string { return item.id; }
}
