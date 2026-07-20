/**
 * LoggerService
 * ─────────────────────────────────────────────────────────
 * Environment-aware logging. Debug logs are suppressed in
 * production automatically. Error logs are always emitted
 * and can be forwarded to an external service.
 *
 * Usage:
 *   this.logger.debug('Auth', 'Token refreshed');
 *   this.logger.error('HTTP', 'Request failed', err);
 */
import { Injectable, inject } from '@angular/core';
import { EnvironmentService } from './environment.service';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level:     LogLevel;
  context:   string;
  message:   string;
  data?:     unknown;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly env = inject(EnvironmentService);

  /** debug — development only, suppressed in production */
  debug(context: string, message: string, data?: unknown): void {
    if (!this.env.enableDebugLogs) return;
    console.debug(`[${context}]`, message, data ?? '');
  }

  /** info — general information, suppressed in production unless analytics on */
  info(context: string, message: string, data?: unknown): void {
    if (this.env.production && !this.env.enableAnalytics) return;
    console.info(`[${context}]`, message, data ?? '');
  }

  /** warn — always logged */
  warn(context: string, message: string, data?: unknown): void {
    console.warn(`[${context}]`, message, data ?? '');
  }

  /** error — always logged; forwarded to error tracking when enabled */
  error(context: string, message: string, error?: unknown): void {
    console.error(`[${context}]`, message, error ?? '');
    if (this.env.enableErrorTracking) {
      this.forwardToErrorTracker({ level: 'error', context, message, data: error, timestamp: new Date().toISOString() });
    }
  }

  private forwardToErrorTracker(entry: LogEntry): void {
    // TODO: Replace with Sentry/Datadog
    // window.Sentry?.captureException(entry.data, { extra: entry });
  }
}
