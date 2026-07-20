import { EnvironmentConfig } from './environment.interface';

export const environment: EnvironmentConfig = {
  production:                 false,
  mockMode:                   true,
  enableDemoMode:              true,
  apiBaseUrl:                 'http://localhost:3000/api',
  apiVersion:                 'v1',
  saulBaseUrl:                'http://localhost:3001',
  signalRUrl:                 'http://localhost:3000/hubs',
  websocketUrl:                'ws://localhost:3000/ws',
  fileUploadUrl:               '',
  appName:                    'AegisLex (Dev)',
  appVersion:                 '1.0.0-dev',
  enableAnalytics:            false,
  googleClientId:             '',   // Google Auth not yet configured — leave empty
  enableDebugLogs:            true,
  enableErrorTracking:        false,
  enablePerformanceTracking:  true,
  tokenRefreshThreshold:      300,
  sessionTimeoutMinutes:      0,

  // ── AI Provider Configuration ──────────────────────────────────────────────
  // Dev: aiBaseUrl is empty and mockMode=true — MockService handles all AI.
  // When local backend is running, set aiBaseUrl to 'http://localhost:3001/ai'
  // and mockMode to false to enable live Grok/Gemini integration.
  aiProvider:         'grok',
  fallbackAiProvider: 'gemini',
  aiBaseUrl:          '',       // empty = mock mode; set to local backend URL when ready
  enableAiFallback:   true,
} as EnvironmentConfig;
