/**
 * FeatureFlagService
 * ─────────────────────────────────────────────────────────
 * Manages feature flags with three priority levels:
 *   1. Remote overrides (future backend, highest priority)
 *   2. Environment-level overrides
 *   3. Default config (lowest priority)
 *
 * Components use isEnabled(flag) — never read flags directly.
 * Backend integration: replace loadRemoteFlags() body only.
 */
import { Injectable, signal, computed } from '@angular/core';
import { FeatureFlagConfig, DEFAULT_APP_CONFIG } from '@core/config/app.config';

export type FeatureFlag = keyof FeatureFlagConfig;

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {

  private readonly _flags = signal<FeatureFlagConfig>({
    ...DEFAULT_APP_CONFIG.featureFlags,
  });

  /** Read-only view of all flags */
  readonly flags = this._flags.asReadonly();

  // ── Computed convenience flags ────────────────────────────

  readonly aiEnabled            = computed(() => this._flags().enableAiModule);
  readonly notificationsEnabled = computed(() => this._flags().enableNotifications);
  readonly reportsEnabled       = computed(() => this._flags().enableReports);
  readonly analyticsEnabled     = computed(() => this._flags().enableAdvancedAnalytics);
  readonly auditLogsEnabled     = computed(() => this._flags().enableAuditLogs);
  readonly mockAuthEnabled      = computed(() => this._flags().enableMockAuth);
  /**
   * True when Google Sign-In is ready to use.
   * Requires googleClientId to be set AND the backend /auth/google/callback
   * endpoint to be implemented. Defaults to false.
   */
  readonly googleAuthEnabled    = computed(() => this._flags().enableGoogleAuth);

  // ── Query ─────────────────────────────────────────────────

  /** Returns true when the named feature flag is enabled */
  isEnabled(flag: FeatureFlag): boolean {
    return this._flags()[flag];
  }

  /** Returns true when ALL listed flags are enabled */
  allEnabled(flags: FeatureFlag[]): boolean {
    return flags.every(f => this._flags()[f]);
  }

  /** Returns true when ANY listed flag is enabled */
  anyEnabled(flags: FeatureFlag[]): boolean {
    return flags.some(f => this._flags()[f]);
  }

  // ── Override ──────────────────────────────────────────────

  /** Apply remote flag overrides (call after fetching from backend) */
  applyRemoteFlags(overrides: Partial<FeatureFlagConfig>): void {
    this._flags.update(current => ({ ...current, ...overrides }));
  }

  /** Override a single flag (e.g. from A/B test) */
  setFlag(flag: FeatureFlag, value: boolean): void {
    this._flags.update(f => ({ ...f, [flag]: value }));
  }

  /** Reset all flags to default config */
  reset(): void {
    this._flags.set({ ...DEFAULT_APP_CONFIG.featureFlags });
  }

  // ── Future: load from backend ─────────────────────────────

  /**
   * Fetch feature flags from the remote config endpoint.
   * Called once on app init. No-op until backend is available.
   * TODO: inject HttpClient and call GET /config/feature-flags
   */
  loadRemoteFlags(): void {
    // TODO: Replace with real backend endpoint
    // this.http.get<FeatureFlagConfig>('/config/feature-flags')
    //   .subscribe(flags => this.applyRemoteFlags(flags));
  }
}
