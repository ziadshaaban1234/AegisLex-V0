/**
 * LoadingService
 * ─────────────────────────────────────────────────────────
 * Tracks loading state for pages, sections, and requests.
 * Prevents layout shifts by maintaining deterministic state.
 *
 * Usage:
 *   loading.setPage(true);
 *   loading.setSection('cases-list', true);
 *   loading.isLoading('cases-list');  // → true
 */
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _pageLoading     = signal(false);
  private readonly _sectionLoading  = signal<Record<string, boolean>>({});
  private readonly _requestCount    = signal(0);

  readonly isPageLoading      = this._pageLoading.asReadonly();
  readonly hasActiveRequests  = computed(() => this._requestCount() > 0);
  readonly isGloballyLoading  = computed(() =>
    this._pageLoading() || this._requestCount() > 0
  );

  // ── Page loading ──────────────────────────────────────────

  setPage(loading: boolean): void { this._pageLoading.set(loading); }

  // ── Section loading (keyed) ───────────────────────────────

  setSection(key: string, loading: boolean): void {
    this._sectionLoading.update(m => ({ ...m, [key]: loading }));
  }

  isSection(key: string): boolean {
    return this._sectionLoading()[key] === true;
  }

  clearSection(key: string): void {
    this._sectionLoading.update(m => {
      const copy = { ...m };
      delete copy[key];
      return copy;
    });
  }

  // ── Request tracking ──────────────────────────────────────

  /** Call when an HTTP request starts */
  requestStarted(): void { this._requestCount.update(n => n + 1); }

  /** Call when an HTTP request completes (success or error) */
  requestCompleted(): void {
    this._requestCount.update(n => Math.max(0, n - 1));
  }

  /** Reset all loading state (e.g. on navigation) */
  reset(): void {
    this._pageLoading.set(false);
    this._sectionLoading.set({});
    this._requestCount.set(0);
  }
}
