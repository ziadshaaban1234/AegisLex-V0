/**
 * EnvironmentConfig — strongly-typed shape for all environment files.
 * Every property is required so missing fields cause compile errors.
 */
export interface EnvironmentConfig {
  /** true in production builds */
  production: boolean;
  /** Use in-memory mock data instead of real API calls */
  mockMode: boolean;
  /**
   * Marks this build as a public/static demo build. Currently
   * informational only — the demo banner and "Enter Demo" button on the
   * login page are unconditional today and do not read this flag. Added
   * so a future change can gate that UI per-environment without another
   * interface change. Mirrors `mockMode` for now.
   */
  enableDemoMode: boolean;
  /** Base URL for the REST API (empty = relative) */
  apiBaseUrl: string;
  /** API version prefix, e.g. "v1" */
  apiVersion: string;
  /** Base URL for the Saul AI service */
  saulBaseUrl: string;
  /** Base URL for the SignalR hub */
  signalRUrl: string;
  /**
   * Base URL for a raw WebSocket endpoint (distinct from the SignalR hub
   * above). Reserved for future use — e.g. a non-SignalR streaming
   * transport. Empty string = not provisioned yet. Not read anywhere
   * today; added for forward-compatibility only (see FRONTEND-INFRASTRUCTURE.md).
   */
  websocketUrl: string;
  /**
   * Base URL for direct file/blob uploads (e.g. a CDN or object-storage
   * endpoint), if uploads are ever routed somewhere other than the main
   * API. Empty string = uploads continue going through
   * `${apiBaseUrl}${ApiEndpoints.DOCUMENTS.UPLOAD}` as they do today.
   * Not read anywhere today; added for forward-compatibility only.
   */
  fileUploadUrl: string;
  /** Application display name */
  appName: string;
  /** Semantic version */
  appVersion: string;
  /** Enable Google Analytics / Mixpanel etc. */
  enableAnalytics: boolean;
  /**
   * Google OAuth 2.0 Client ID for future Google Authentication support.
   * Empty string = Google Auth not yet configured (all environments today).
   * When populated, GoogleAuthAdapter will use this ID to initiate the
   * OAuth 2.0 flow. The backend endpoint /auth/google/callback handles
   * token exchange — the frontend never receives client secrets.
   * Set this value only in environment files, never in code.
   */
  googleClientId: string;
  /** Print debug logs to console */
  enableDebugLogs: boolean;
  /** Report errors to Sentry / Datadog etc. */
  enableErrorTracking: boolean;
  /** Collect Web Vitals / custom timings */
  enablePerformanceTracking: boolean;
  /** Refresh token this many seconds before expiry */
  tokenRefreshThreshold: number;
  /** Auto-logout after N idle minutes (0 = disabled) */
  sessionTimeoutMinutes: number;

  // ── AI Provider Configuration ──────────────────────────────────────────────
  // These fields are consumed by the backend AI gateway only.
  // The Angular frontend does NOT call AI providers directly.
  // The backend selects the active provider and returns a unified response.
  //
  // Future Provider Flow:
  //   Grok (Primary)
  //   ↓ (on failure / timeout)
  //   Gemini (Fallback)
  //   ↓
  //   Backend returns unified response → Angular consumes it identically.
  //
  // Frontend integration point: EnvironmentService.aiBaseUrl
  // All AI feature services (SaulService, analysis, chat, recommendations)
  // will POST to this single endpoint when mockMode = false.

  /**
   * Primary AI provider identifier.
   * Sent to the backend so it knows which provider to use first.
   * Value: 'grok'
   * Not read by Angular directly — informational / passed in API headers if needed.
   */
  aiProvider: string;

  /**
   * Fallback AI provider identifier.
   * Backend switches to this provider if the primary is unavailable.
   * Value: 'gemini'
   * Not read by Angular directly — informational.
   */
  fallbackAiProvider: string;

  /**
   * Base URL for the unified AI backend gateway endpoint.
   * Empty string = not provisioned yet (mock mode active).
   * When populated, all AI feature services route through this URL.
   * Example: 'https://api.aegislex.com/api/v1/ai'
   */
  aiBaseUrl: string;

  /**
   * Whether the frontend should acknowledge AI provider fallback behaviour.
   * When true, the backend may transparently switch from Grok → Gemini
   * and the frontend continues to consume the response without change.
   * Set to false only to force primary provider only (no failover).
   */
  enableAiFallback: boolean;
}
