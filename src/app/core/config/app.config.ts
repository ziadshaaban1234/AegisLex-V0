/**
 * AppConfig — Centralized typed configuration system.
 * All tuneable parameters in one place.
 */

// ── Auth config ────────────────────────────────────────────

export interface AuthConfig {
  tokenRefreshThresholdSecs: number;
  sessionTimeoutMinutes:     number;
  otpLengthDigits:           number;
  otpExpiryMinutes:          number;
  otpMaxAttempts:            number;
  otpResendCooldownSecs:     number;
  passwordMinLength:         number;
  passwordMaxLength:         number;
  draftTtlHours:             number;
  rememberMeDays:            number;
}

// ── UI config ──────────────────────────────────────────────

export interface UiConfig {
  toastDurationMs:          number;
  toastErrorDurationMs:     number;
  debounceInputMs:          number;
  animationDurationMs:      number;
  defaultPageSize:          number;
  maxPageSize:              number;
  sidebarBreakpointPx:      number;
}

// ── Theme config ───────────────────────────────────────────

export interface ThemeConfig {
  defaultTheme:      'light' | 'dark' | 'system';
  storageKey:        string;
  lightClass:        string;
  darkClass:         string;
}

// ── Storage config ─────────────────────────────────────────

export interface StorageConfig {
  keyPrefix:        string;
  version:          number;
  defaultExpiryMs:  number;
}

// ── Feature flag config ────────────────────────────────────

export interface FeatureFlagConfig {
  enableAiModule:            boolean;
  enableNotifications:       boolean;
  enableReports:             boolean;
  enableAdvancedAnalytics:   boolean;
  enableAuditLogs:           boolean;
  enableMockAuth:            boolean;
  enableDeviceManagement:    boolean;
  enableTwoFactor:           boolean;
  enableExportPdf:           boolean;
  enableBulkOperations:      boolean;
  /**
   * Controls whether the Google Sign-In button is shown on auth pages.
   * Must be false until googleClientId is populated AND the backend
   * /auth/google/callback endpoint is implemented and tested.
   * Only set to true after both conditions are met.
   */
  enableGoogleAuth:          boolean;
}

// ── Combined AppConfig ─────────────────────────────────────

export interface AppConfig {
  auth:         AuthConfig;
  ui:           UiConfig;
  theme:        ThemeConfig;
  storage:      StorageConfig;
  featureFlags: FeatureFlagConfig;
}

// ── Default config values ──────────────────────────────────

export const DEFAULT_APP_CONFIG: AppConfig = {
  auth: {
    tokenRefreshThresholdSecs: 300,
    sessionTimeoutMinutes:     0,
    otpLengthDigits:           6,
    otpExpiryMinutes:          10,
    otpMaxAttempts:            3,
    otpResendCooldownSecs:     60,
    passwordMinLength:         8,
    passwordMaxLength:         64,
    draftTtlHours:             24,
    rememberMeDays:            30,
  },
  ui: {
    toastDurationMs:       4000,
    toastErrorDurationMs:  6000,
    debounceInputMs:       300,
    animationDurationMs:   200,
    defaultPageSize:       20,
    maxPageSize:           100,
    sidebarBreakpointPx:   1024,
  },
  theme: {
    defaultTheme: 'dark',
    storageKey:   'aegislex_theme',
    lightClass:   'auth-light',
    darkClass:    '',
  },
  storage: {
    keyPrefix:       'aegislex_',
    version:         1,
    defaultExpiryMs: 24 * 60 * 60 * 1000,
  },
  featureFlags: {
    enableAiModule:            true,
    enableNotifications:       true,
    enableReports:             true,
    enableAdvancedAnalytics:   true,
    enableAuditLogs:           false,
    enableMockAuth:            true,
    enableDeviceManagement:    false,
    enableTwoFactor:           false,
    enableExportPdf:           true,
    enableBulkOperations:      false,
    enableGoogleAuth:          false,  // Off until googleClientId + backend endpoint are ready
  },
};
