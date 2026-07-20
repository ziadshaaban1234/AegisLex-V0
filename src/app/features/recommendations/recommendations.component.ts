import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockService } from '@core/mock/mock.service';
import { LanguageService } from '@core/services/language.service';
import { Recommendation } from '@core/models';

// ─────────────────────────────────────────────────────────────────────────────
// AI PROVIDER ABSTRACTION — FUTURE BACKEND INTEGRATION
//
// Current state: MockService serves all recommendation data.
//
// Future Provider Flow:
//   Grok (Primary)
//   ↓ (on failure / timeout — handled by backend, transparent to frontend)
//   Gemini (Fallback)
//   ↓
//   Backend returns unified Recommendation[] response.
//
// Future Backend Endpoint:
//   GET ${env.aiBaseUrl}/recommendations
//   OR: GET /api/v1/recommendations (via existing ApiEndpoints.RECOMMENDATIONS.LIST)
//
// Angular integration (when backend is ready):
//   Replace this.mockService.getRecommendations() with:
//     this.http.get<ApiResponse<Recommendation[]>>(`${this.env.aiBaseUrl}/recommendations`)
//
// No component template changes needed.
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recommendations.component.html',
  styleUrl: './recommendations.component.scss',
})
export class RecommendationsComponent implements OnInit {
  private readonly mockService = inject(MockService);
  readonly lang = inject(LanguageService);
  recommendations = signal<Recommendation[]>([]);
  loading = signal(true);
  selectedPriority = signal<string>('all');
  priorities = ['all', 'urgent', 'high', 'medium', 'low'];

  getPriorityLabel(p: string): string {
    const key = `rec.priority.${p}`;
    return this.lang.t(key);
  }

  ngOnInit(): void {
    // Current: MockService (mock mode)
    // Future:  GET ${env.aiBaseUrl}/recommendations
    //          Provider: Grok (primary) | Gemini (fallback — backend decides)
    this.mockService.getRecommendations().subscribe({
      next: (res: any) => { this.recommendations.set(res.data); this.loading.set(false); },
    });
  }

  get filtered(): Recommendation[] {
    if (this.selectedPriority() === 'all') return this.recommendations();
    return this.recommendations().filter(r => r.priority === this.selectedPriority());
  }

  countByPriority(priority: string): number {
    return this.recommendations().filter(r => r.priority === priority).length;
  }

  capitalize(s: string): string {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  getPriorityConfig(p: string): { color: string; bg: string } {
    const m: Record<string, { color: string; bg: string }> = {
      urgent: { color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
      high:   { color: '#ea580c', bg: 'rgba(234,88,12,0.1)' },
      medium: { color: '#ca8a04', bg: 'rgba(202,138,4,0.1)' },
      low:    { color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
    };
    return m[p] || { color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
  }
}
