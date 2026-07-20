import { EnvironmentConfig } from './environment.interface';

export const environment: EnvironmentConfig = {
  production:                 false,
  mockMode:                   true,
  enableDemoMode:              true,
  apiBaseUrl:                 '',
  apiVersion:                 'v1',
  saulBaseUrl:                '',
  signalRUrl:                 '',
  websocketUrl:                '',
  fileUploadUrl:               '',
  appName:                    'AegisLex',
  appVersion:                 '1.0.0',
  enableAnalytics:            false,
  googleClientId:             '',   // Google Auth not yet configured — leave empty
  enableDebugLogs:            true,
  enableErrorTracking:        false,
  enablePerformanceTracking:  false,
  tokenRefreshThreshold:      300,
  sessionTimeoutMinutes:      0,

  // ── AI Provider Configuration ──────────────────────────────────────────────
  // Mock mode: aiBaseUrl is empty — all AI calls are served by MockService.
  // Future: set aiBaseUrl to backend gateway URL and mockMode to false.
  // Backend will route: Grok (primary) → Gemini (fallback) transparently.
  aiProvider:         'grok',
  fallbackAiProvider: 'gemini',
  aiBaseUrl:          '',       // empty = mock mode; backend not yet provisioned
  enableAiFallback:   true,
};
