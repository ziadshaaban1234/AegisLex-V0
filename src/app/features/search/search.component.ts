import { Component, OnInit, inject, signal } from '@angular/core';
import { ScaleOfJusticeComponent } from '@shared/components/scale-of-justice/scale-of-justice.component';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockService } from '@core/mock/mock.service';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ScaleOfJusticeComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit {
  private readonly mockService = inject(MockService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly langService = inject(LanguageService);

  query = signal('');
  results = signal<any[]>([]);
  loading = signal(false);
  total = signal(0);
  searchType = signal<'semantic'|'keyword'|'hybrid'>('hybrid');
  searchTime = signal(0);
  hasSearched = signal(false);

  suggestedSearches = ['liability cap clause','NDA confidentiality obligations','force majeure provision','dispute resolution arbitration','intellectual property ownership','termination for cause'];
  searchTypes = [
    {value:'hybrid' as const,  labelKey:'search.type.hybrid',   icon:'auto_awesome'},
    {value:'semantic' as const, labelKey:'search.type.semantic', icon:'psychology'},
    {value:'keyword' as const,  labelKey:'search.type.keyword',  icon:'search'},
  ];

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) { this.query.set(q); this.doSearch(); }
  }

  onSearch(): void { if (!this.query().trim()) return; this.router.navigate([],{queryParams:{q:this.query()},queryParamsHandling:'merge'}); this.doSearch(); }
  onKeydown(event: KeyboardEvent): void { if (event.key==='Enter') this.onSearch(); }

  private doSearch(): void {
    this.loading.set(true); this.hasSearched.set(true);
    this.mockService.search(this.query()).subscribe({
      next: (res: any) => { this.results.set(res.data.results); this.total.set(res.data.total); this.searchTime.set(res.data.searchTime); this.loading.set(false); },
    });
  }

  getResultIcon(type: string): string { const m:Record<string,string>={document:'description',case:'folder_open',law:'gavel',judgment:'balance',clause:'article'}; return m[type]||'search'; }
  getResultColor(type: string): string { const m:Record<string,string>={document:'#4e4eeb',case:'#10b981',law:'#ef4444',judgment:'#f59e0b',clause:'#8b5cf6'}; return m[type]||'#64748b'; }
  formatDate(d: string): string { return new Date(d).toLocaleDateString(this.langService.currentLang() === 'ar' ? 'ar-AE' : 'en-US',{month:'short',day:'numeric',year:'numeric'}); }
}
