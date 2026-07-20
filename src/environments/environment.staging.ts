import { EnvironmentConfig } from './environment.interface';

export const environment: EnvironmentConfig = {
  production:                 false,
  mockMode:                   false,
  enableDemoMode:              false,
  apiBaseUrl:                 'https://api.staging.aegislex.com/api',
  apiVersion:                 'v1',
  saulBaseUrl:                'https://saul.staging.aegislex.com',
  signalRUrl:                 'https://api.staging.aegislex.com/hubs',
  websocketUrl:                'wss://api.staging.aegislex.com/ws',
  fileUploadUrl:               '',
  appName:                    'AegisLex (Staging)',
  appVersion:                 '1.0.0-staging',
  enableAnalytics:            false,
  googleClientId:             '',   // Google Auth not yet configured — populate when GCP project is ready
  enableDebugLogs:            true,
  enableErrorTracking:        true,
  enablePerformanceTracking:  true,
  tokenRefreshThreshold:      300,
  sessionTimeoutMinutes:      60,

  // ── AI Provider Configuration ──────────────────────────────────────────────
  // Staging: aiBaseUrl points to the staging AI gateway.
  // Backend routes: Grok (primary) → Gemini (fallback).
  // Frontend consumes the unified response identically regardless of provider.
  aiProvider:         'grok',
  fallbackAiProvider: 'gemini',
  aiBaseUrl:          'https://api.staging.aegislex.com/api/v1/ai',
  enableAiFallback:   true,
} as EnvironmentConfig;
