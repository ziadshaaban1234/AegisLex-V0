/**
 * EnvironmentService
 * ─────────────────────────────────────────────────────────
 * Provides strongly-typed access to the current environment
 * configuration everywhere in the application.
 *
 * Never import `environment` directly in services/components —
 * inject EnvironmentService instead.
 *
 * Injection token: ENVIRONMENT_CONFIG
 */
import { Injectable, InjectionToken, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { EnvironmentConfig } from '@environments/environment.interface';

/** Injection token for the raw environment object */
export const ENVIRONMENT_CONFIG =
  new InjectionToken<EnvironmentConfig>('ENVIRONMENT_CONFIG', {
    providedIn: 'root',
    factory: () => environment as EnvironmentConfig,
  });

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  private readonly config = inject(ENVIRONMENT_CONFIG);

  get production():                boolean { return this.config.production; }
  get mockMode():                  boolean { return this.config.mockMode; }
  get enableDemoMode():            boolean { return this.config.enableDemoMode; }
  get apiBaseUrl():                string  { return this.config.apiBaseUrl; }
  get apiVersion():                string  { return this.config.apiVersion; }
  get saulBaseUrl():               string  { return this.config.saulBaseUrl; }
  get signalRUrl():                string  { return this.config.signalRUrl; }
  get websocketUrl():              string  { return this.config.websocketUrl; }
  get fileUploadUrl():             string  { return this.config.fileUploadUrl; }
  get appName():                   string  { return this.config.appName; }
  get appVersion():                string  { return this.config.appVersion; }
  get enableAnalytics():           boolean { return this.config.enableAnalytics; }
  get enableDebugLogs():           boolean { return this.config.enableDebugLogs; }
  get enableErrorTracking():       boolean { return this.config.enableErrorTracking; }
  get enablePerformanceTracking(): boolean { return this.config.enablePerformanceTracking; }
  get tokenRefreshThreshold():     number  { return this.config.tokenRefreshThreshold; }
  get sessionTimeoutMinutes():     number  { return this.config.sessionTimeoutMinutes; }

  // ── AI Provider Configuration ─────────────────────────────────────────────
  // These getters expose AI configuration for services that will route
  // requests to the backend AI gateway. The backend handles provider
  // selection (Grok primary → Gemini fallback) transparently.
  // Frontend services should use aiBaseUrl as their single request target.

  /** Primary AI provider identifier ('grok') */
  get aiProvider():         string  { return this.config.aiProvider; }

  /** Fallback AI provider identifier ('gemini') */
  get fallbackAiProvider(): string  { return this.config.fallbackAiProvider; }

  /**
   * Base URL for the unified AI backend gateway.
   * Empty string = mock mode; no real AI calls are made.
   * When non-empty, all AI feature services (SaulService, analysis,
   * chat, recommendations) should POST to this endpoint.
   */
  get aiBaseUrl():          string  { return this.config.aiBaseUrl; }

  /** Whether the backend is configured for Grok → Gemini failover */
  get enableAiFallback():   boolean { return this.config.enableAiFallback; }

  /**
   * Google OAuth 2.0 Client ID (public identifier — no secrets stored here).
   * Empty string = Google Auth not yet configured.
   * When non-empty, GoogleAuthAdapter uses this to initiate the OAuth flow.
   * The backend endpoint /auth/google/callback handles server-side token exchange.
   */
  get googleClientId(): string { return this.config.googleClientId; }

  /**
   * Compatibility alias for apiBaseUrl.
   * Provided so any future service written against the pattern
   * `env.apiUrl` (common in ASP.NET + Angular scaffolding) resolves
   * to the same value as `env.apiBaseUrl` without a breaking change.
   * Prefer `apiBaseUrl` for new code.
   */
  get apiUrl(): string { return this.config.apiBaseUrl; }

  /** Full API base: e.g. https://api.aegislex.com/api/v1 */
  get apiRoot(): string {
    return this.apiBaseUrl ? `${this.apiBaseUrl}/${this.apiVersion}` : '';
  }

  // ── Qdrant / Vector Search Configuration ─────────────────────────────────
  // The frontend does NOT communicate with Qdrant directly.
  // All vector search and semantic retrieval is handled by the ASP.NET backend,
  // which wraps Qdrant calls and returns unified SearchResult payloads.
  //
  // Frontend integration point: SearchService → POST /api/v1/search
  // The `searchType` field in SearchRequest drives backend routing:
  //   'semantic'  → backend uses Qdrant vector similarity (embeddings)
  //   'keyword'   → backend uses PostgreSQL full-text search
  //   'hybrid'    → backend combines both (re-ranked by BM25 + cosine similarity)
  //
  // Qdrant collection names (backend-managed, informational only):
  //   aegislex_documents   — document chunk embeddings
  //   aegislex_cases       — case-level summary embeddings
  //   aegislex_legal_db    — legal reference corpus embeddings
  //
  // When mockMode = false and apiBaseUrl is set:
  //   SearchService.search()           → POST ${apiRoot}/search
  //   SearchService.getSimilarCases()  → GET  ${apiRoot}/search/similar/:docId
  //   SearchService.getSimilarByText() → POST ${apiRoot}/search/similar-by-text
  //
  // No Qdrant URL, API key, or collection name is stored on the frontend.
  // The backend manages all Qdrant connection details securely server-side.

  /** Returns the full config object (read-only) */
  getConfig(): Readonly<EnvironmentConfig> { return Object.freeze({ ...this.config }); }
}
