import { EnvironmentConfig } from './environment.interface';

export const environment: EnvironmentConfig = {
  production:                 true,
  mockMode:                   false,
  enableDemoMode:              false,
  apiBaseUrl:                 'https://api.aegislex.com/api',
  apiVersion:                 'v1',
  saulBaseUrl:                'https://saul.aegislex.com',
  signalRUrl:                 'https://api.aegislex.com/hubs',
  websocketUrl:                'wss://api.aegislex.com/ws',
  fileUploadUrl:               '',
  appName:                    'AegisLex',
  appVersion:                 '1.0.0',
  enableAnalytics:            true,
  googleClientId:             '',   // Google Auth not yet configured — populate when GCP project is ready
  enableDebugLogs:            false,
  enableErrorTracking:        true,
  enablePerformanceTracking:  true,
  tokenRefreshThreshold:      300,
  sessionTimeoutMinutes:      60,

  // ── AI Provider Configuration ──────────────────────────────────────────────
  // Production: aiBaseUrl points to the production AI gateway.
  // Backend selects provider automatically:
  //   Primary:  Grok   — used for all requests by default.
  //   Fallback: Gemini — activated automatically on Grok failure/timeout.
  // Frontend does NOT implement provider selection or retry logic.
  // All AI feature services POST to aiBaseUrl and receive a unified response.
  aiProvider:         'grok',
  fallbackAiProvider: 'gemini',
  aiBaseUrl:          'https://api.aegislex.com/api/v1/ai',
  enableAiFallback:   true,
} as EnvironmentConfig;
