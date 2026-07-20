/**
 * PerformanceService — Environment-controlled timing collection.
 * ─────────────────────────────────────────────────────────
 * No overhead in production when enablePerformanceTracking = false.
 * Marks and measures use the browser Performance API.
 */
import { Injectable, inject } from '@angular/core';
import { EnvironmentService } from './environment.service';
import { LoggerService }      from './logger.service';

export interface TimingEntry {
  name:       string;
  durationMs: number;
  timestamp:  string;
}

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private readonly env    = inject(EnvironmentService);
  private readonly logger = inject(LoggerService);
  private readonly marks  = new Map<string, number>();

  get enabled(): boolean { return this.env.enablePerformanceTracking; }

  // ── Mark / measure ────────────────────────────────────────

  mark(name: string): void {
    if (!this.enabled) return;
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string): TimingEntry | null {
    if (!this.enabled) return null;
    const start = this.marks.get(startMark);
    if (start === undefined) return null;
    const duration = performance.now() - start;
    const entry: TimingEntry = { name, durationMs: Math.round(duration), timestamp: new Date().toISOString() };
    this.logger.debug('Performance', `${name}: ${entry.durationMs}ms`);
    this.marks.delete(startMark);
    return entry;
  }

  // ── Request timing ────────────────────────────────────────

  startRequest(requestId: string): void { this.mark(`req_${requestId}`); }

  endRequest(requestId: string, endpoint: string): TimingEntry | null {
    return this.measure(`HTTP ${endpoint}`, `req_${requestId}`);
  }

  // ── Page timing ───────────────────────────────────────────

  startPage(route: string): void { this.mark(`page_${route}`); }

  endPage(route: string): TimingEntry | null {
    return this.measure(`Page ${route}`, `page_${route}`);
  }

  // ── Web Vitals (passive) ─────────────────────────────────

  collectWebVitals(): void {
    if (!this.enabled || typeof window === 'undefined') return;
    // PerformanceObserver — no external library required
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          this.logger.debug('WebVitals', `${entry.name}: ${Math.round(entry.startTime)}ms`);
        }
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}
  }
}
