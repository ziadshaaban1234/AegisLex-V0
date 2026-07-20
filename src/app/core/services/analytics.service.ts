/**
 * AnalyticsService — Environment-controlled event tracking.
 * ─────────────────────────────────────────────────────────
 * No external SDK is integrated yet.
 * Replace the stub bodies with real SDK calls (Mixpanel,
 * Segment, GA4) when enableAnalytics = true in production.
 *
 * Components call track() — never the SDK directly.
 */
import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { EnvironmentService } from './environment.service';
import { LoggerService }      from './logger.service';

export interface AnalyticsEvent {
  name:       string;
  category:   string;
  properties?: Record<string, string | number | boolean | null>;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly env    = inject(EnvironmentService);
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);

  private userId: string | null = null;

  // ── Initialise (called once from AppComponent) ────────────

  init(): void {
    if (!this.env.enableAnalytics) return;
    // TODO: Replace with analytics provider
    this.trackPageViews();
    this.logger.debug('Analytics', 'Initialised');
  }

  // ── User identity ─────────────────────────────────────────

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.env.enableAnalytics) return;
    this.userId = userId;
    this.logger.debug('Analytics', 'Identify', { userId, traits });
    // TODO: Replace with analytics provider
  }

  reset(): void {
    this.userId = null;
    // TODO: Replace with analytics provider
  }

  // ── Event tracking ────────────────────────────────────────

  track(event: AnalyticsEvent): void {
    if (!this.env.enableAnalytics) return;
    this.logger.debug('Analytics', 'Track', event);
    // TODO: Replace with analytics provider
  }

  // ── Auth events ───────────────────────────────────────────

  trackLogin(method = 'email'):  void { this.track({ name: 'Login',     category: 'Auth',   properties: { method } }); }
  trackRegister():               void { this.track({ name: 'Register',  category: 'Auth' }); }
  trackLogout():                 void { this.track({ name: 'Logout',    category: 'Auth' }); this.reset(); }
  trackPasswordReset():          void { this.track({ name: 'PasswordReset', category: 'Auth' }); }

  // ── Feature events ────────────────────────────────────────

  trackFeatureUse(feature: string, action?: string): void {
    this.track({ name: 'FeatureUsed', category: 'Feature', properties: { feature, action: action ?? '' } });
  }

  // ── Page tracking ─────────────────────────────────────────

  trackPage(path: string): void {
    if (!this.env.enableAnalytics) return;
    this.logger.debug('Analytics', 'PageView', { path });
    // TODO: Replace with analytics provider
  }

  private trackPageViews(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => this.trackPage((e as NavigationEnd).urlAfterRedirects));
  }
}
