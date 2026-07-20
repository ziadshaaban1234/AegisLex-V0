import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MockService } from '@core/mock/mock.service';
import { LanguageService } from '@core/services/language.service';
import { TimelineEvent } from '@core/models';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
})
export class TimelineComponent implements OnInit {
  private readonly route       = inject(ActivatedRoute);
  private readonly mockService = inject(MockService);
  readonly lang                = inject(LanguageService);

  events        = signal<TimelineEvent[]>([]);
  loading       = signal(true);
  caseId        = signal<string | null>(null);
  activeFilter  = signal<string>('all');
  expandedId    = signal<string | null>(null);

  // Filters are computed so labels update on language switch
  filters = computed(() => [
    { value: 'all',          label: this.lang.t('timeline.filter.all') },
    { value: 'contracts',    label: this.lang.t('timeline.filter.contracts') },
    { value: 'legal_actions',label: this.lang.t('timeline.filter.legal_actions') },
    { value: 'payments',     label: this.lang.t('timeline.filter.payments') },
    { value: 'deadlines',    label: this.lang.t('timeline.filter.deadlines') },
    { value: 'amendments',   label: this.lang.t('timeline.filter.amendments') },
    { value: 'terminations', label: this.lang.t('timeline.filter.terminations') },
  ]);

  filteredEvents = computed(() => {
    const f = this.activeFilter();
    if (f === 'all') return this.events();
    return this.events().filter(e => e.eventType === f);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('caseId');
    this.caseId.set(id);
    this.mockService.getTimeline(id || undefined).subscribe({
      next: (res: any) => { this.events.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  toggleExpand(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  getEventIcon(type: string): string {
    const m: Record<string, string> = {
      contracts: 'description', legal_actions: 'gavel', payments: 'payments',
      deadlines: 'schedule', amendments: 'edit_note', terminations: 'cancel',
    };
    return m[type] || 'event';
  }

  getEventColor(type: string): string {
    const m: Record<string, string> = {
      contracts: '#4e4eeb', legal_actions: '#ef4444', payments: '#10b981',
      deadlines: '#f59e0b', amendments: '#8b5cf6', terminations: '#64748b',
    };
    return m[type] || '#94a3b8';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(
      this.lang.currentLang() === 'ar' ? 'ar-AE' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  }

  trackById(_: number, item: TimelineEvent): string { return item.id; }
}
