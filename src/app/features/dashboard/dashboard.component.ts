import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '@core/services/dashboard.service';
import { CasesService } from '@core/services/cases.service';
import { AuthService } from '@core/services/auth.service';
import { LanguageService } from '@core/services/language.service';
import { DashboardStats, Case, ChartDataPoint } from '@core/models';
import { ScaleOfJusticeComponent } from '@shared/components/scale-of-justice/scale-of-justice.component';

interface DonutSegment { color: string; dash: string; offset: string; }
interface ActivityMock { icon: string; text: string; time: string; color: string; bg: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe, ScaleOfJusticeComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly casesService = inject(CasesService);
  private readonly authService = inject(AuthService);
  readonly lang = inject(LanguageService);

  readonly currentUser = this.authService.currentUser;
  stats = signal<DashboardStats | null>(null);
  recentCases = signal<Case[]>([]);
  loading = signal(true);

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return this.lang.t('dashboard.greeting.morning');
    if (h < 18) return this.lang.t('dashboard.greeting.afternoon');
    return this.lang.t('dashboard.greeting.evening');
  });

  statCards = computed(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      { label: this.lang.t('dashboard.stat.total_cases'),       value: s.totalCases,          icon: 'folder_open',      color: '#4e4eeb', bg: 'rgba(78,78,235,0.1)',    change: '+12%',       positive: true  },
      { label: this.lang.t('dashboard.stat.active_cases'),      value: s.activeCases,         icon: 'pending_actions',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   change: '+3',         positive: true  },
      { label: this.lang.t('dashboard.stat.docs_analyzed'),     value: s.documentsAnalyzed,   icon: 'document_scanner', color: '#10b981', bg: 'rgba(16,185,129,0.1)',   change: '+28%',       positive: true  },
      { label: this.lang.t('dashboard.stat.risks_detected'),    value: s.risksDetected,       icon: 'warning',          color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    change: '-5%',        positive: false },
      { label: this.lang.t('dashboard.stat.reports_generated'), value: s.reportsGenerated,    icon: 'description',      color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',   change: '+18%',       positive: true  },
      { label: this.lang.t('dashboard.stat.pending_tasks'),     value: s.pendingTasks,        icon: 'task_alt',         color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)',   change: '2 due today', positive: false },
    ];
  });

  /** Static activity feed — defined once, never re-evaluated during change detection */
  readonly mockActivity: ActivityMock[] = [
    { icon: 'analytics',    text: 'Saul completed analysis on NDA — TechCorp Acquisition (4 risks detected)',  time: '2 minutes ago',  color: '#4e4eeb', bg: 'rgba(78,78,235,0.1)'   },
    { icon: 'upload_file',  text: 'NDA_TechCorp_2024_v3.pdf uploaded to CASE-2024-001',                        time: '15 minutes ago', color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
    { icon: 'warning',      text: '3 critical risks detected in GDPR Compliance Audit — EuroBank',             time: '1 hour ago',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
    { icon: 'description',  text: 'Contract Risk Analysis Report generated for CASE-2024-001',                 time: '2 hours ago',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
    { icon: 'folder_open',  text: 'New case CASE-2024-005 opened — Real Estate Purchase Agreement',            time: '3 hours ago',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
    { icon: 'smart_toy',    text: 'Saul found 4 similar precedents for unlimited liability clause',             time: '4 hours ago',    color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)'  },
  ];

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: res => { this.stats.set(res.data); this.loading.set(false); },
    });
    this.casesService.getCases(1, 5).subscribe({
      next: res => this.recentCases.set(res.data.items),
    });
  }

  trackByIndex(index: number): number { return index; }

  buildDonutSegments(data: ChartDataPoint[]): DonutSegment[] {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return [];
    const circ = 2 * Math.PI * 45;  // circumference for r=45
    let cumFrac = 0;
    return data.map(d => {
      const frac = d.value / total;
      const dash = `${frac * circ} ${circ - frac * circ}`;
      const offset = `${circ - cumFrac * circ}`;
      cumFrac += frac;
      return { color: d.color || '#4e4eeb', dash, offset };
    });
  }

  getPriorityColor(priority: string): string {
    const m: Record<string,string> = { critical:'#ef4444', high:'#f97316', medium:'#eab308', low:'#22c55e' };
    return m[priority] || '#94a3b8';
  }

  getStatusBadge(status: string): string {
    const m: Record<string,string> = { active:'badge badge-success', pending:'badge badge-warning', review:'badge badge-info', closed:'badge badge-aegis', archived:'badge badge-aegis' };
    return m[status] || 'badge badge-info';
  }

  getStatusLabel(status: string): string {
    const key = `dashboard.status.${status}`;
    return this.lang.t(key) || status;
  }

  formatDate(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return this.lang.t('dashboard.date.today');
    if (d === 1) return this.lang.t('dashboard.date.yesterday');
    if (d < 7)  return this.lang.t('dashboard.date.days_ago', [d]);
    return new Date(dateStr).toLocaleDateString(this.lang.currentLang() === 'ar' ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric' });
  }
}
