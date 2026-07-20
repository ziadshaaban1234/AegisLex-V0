/**
 * API Infrastructure — Centralized endpoint definitions, URL builder,
 * and HTTP constants.
 *
 * NEVER hardcode endpoint strings in feature modules.
 * Always use ApiEndpoints or ApiUrlBuilder.
 */
import { Injectable, inject } from '@angular/core';
import { EnvironmentService } from '@core/services/environment.service';

// ── Endpoint definitions ──────────────────────────────────

export const ApiEndpoints = {
  // Auth
  AUTH: {
    LOGIN:            '/auth/login',
    REGISTER:         '/auth/register',
    LOGOUT:           '/auth/logout',
    FORGOT:           '/auth/forgot-password',
    VERIFY_OTP:       '/auth/verify-otp',
    RESET_PASSWORD:   '/auth/reset-password',
    REFRESH_TOKEN:    '/auth/refresh-token',
    ME:               '/auth/me',
    // ── Google Authentication (future) ──────────────────────────────────────
    // The frontend sends the Google ID token to the backend for verification.
    // The backend validates it with Google, creates/updates the user record,
    // and returns a standard LoginResponse (same shape as /auth/login).
    // The frontend never communicates with Google's servers directly.
    GOOGLE_CALLBACK:  '/auth/google/callback',
  },
  // Cases
  CASES: {
    LIST:     '/cases',
    DETAIL:   (id: string) => `/cases/${id}`,
    CREATE:   '/cases',
    UPDATE:   (id: string) => `/cases/${id}`,
    DELETE:   (id: string) => `/cases/${id}`,
    ARCHIVE:  (id: string) => `/cases/${id}/archive`,
    CLOSE:    (id: string) => `/cases/${id}/close`,
  },
  // Documents
  DOCUMENTS: {
    LIST:     '/documents',
    DETAIL:   (id: string) => `/documents/${id}`,
    UPLOAD:   '/documents/upload',
    DELETE:   (id: string) => `/documents/${id}`,
    ANALYSIS: (id: string) => `/documents/${id}/analysis`,
    TEXT:     (id: string) => `/documents/${id}/text`,
    DOWNLOAD: (id: string) => `/documents/${id}/download`,
  },
  // Analysis
  ANALYSIS: {
    GET:      (documentId: string) => `/analysis/${documentId}`,
    TRIGGER:  (documentId: string) => `/analysis/${documentId}/trigger`,
  },
  // Reports
  REPORTS: {
    LIST:     '/reports',
    DETAIL:   (id: string) => `/reports/${id}`,
    GENERATE: '/reports/generate',
    DELETE:   (id: string) => `/reports/${id}`,
    DOWNLOAD: (id: string, format: string) => `/reports/${id}/download/${format}`,
  },
  // Chat
  CHAT: {
    SESSIONS:        '/chat/sessions',
    SESSION:         (id: string) => `/chat/sessions/${id}`,
    CREATE_SESSION:  '/chat/sessions',
    DELETE_SESSION:  (id: string) => `/chat/sessions/${id}`,
    MESSAGES:        (sessionId: string) => `/chat/sessions/${sessionId}/messages`,
    SEND:            (sessionId: string) => `/chat/sessions/${sessionId}/messages`,
  },
  // Notifications
  NOTIFICATIONS: {
    LIST:       '/notifications',
    UNREAD:     '/notifications/unread-count',
    MARK_READ:  (id: string) => `/notifications/${id}/read`,
    MARK_ALL:   '/notifications/read-all',
    DELETE:     (id: string) => `/notifications/${id}`,
  },
  // Dashboard
  DASHBOARD: {
    STATS:     '/dashboard/stats',
    ANALYTICS: (period: string) => `/dashboard/analytics/${period}`,
  },
  // Search
  SEARCH: {
    QUERY:        '/search',
    SIMILAR:      (docId: string) => `/search/similar/${docId}`,
    SIMILAR_TEXT: '/search/similar-by-text',
  },
  // User
  USER: {
    PROFILE:     '/users/me',
    UPDATE:      '/users/me',
    PREFERENCES: '/users/me/preferences',
    SESSIONS:    '/users/me/sessions',
  },
  // Recommendations
  RECOMMENDATIONS: {
    LIST: '/recommendations',
  },
} as const;

// ── ApiConstants ─────────────────────────────────────────

export const ApiConstants = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE:     100,
  DEFAULT_TIMEOUT_MS: 30_000,
  RETRY_ATTEMPTS:    3,
  RETRY_DELAY_MS:    1_000,
  HEADERS: {
    CONTENT_TYPE:   'Content-Type',
    AUTHORIZATION:  'Authorization',
    ACCEPT:         'Accept',
    REQUEST_ID:     'X-Request-Id',
    CORRELATION_ID: 'X-Correlation-Id',
    API_VERSION:    'X-Api-Version',
  },
  MIME: {
    JSON: 'application/json',
    PDF:  'application/pdf',
    FORM: 'multipart/form-data',
  },
} as const;

// ── ApiUrlBuilder ─────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ApiUrlBuilder {
  private readonly env = inject(EnvironmentService);

  /** Builds a fully-qualified API URL: baseUrl/version/path */
  build(path: string): string {
    const base = this.env.apiRoot;
    if (!base) return path; // relative — mock mode
    const clean = path.startsWith('/') ? path : `/${path}`;
    return `${base}${clean}`;
  }

  /** Builds a URL with query parameters */
  buildWithParams(path: string, params: Record<string, string | number | boolean | undefined>): string {
    const url  = this.build(path);
    const qs   = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    return qs ? `${url}?${qs}` : url;
  }

  /** Saul AI URL */
  saul(path: string): string {
    const base = this.env.saulBaseUrl;
    return base ? `${base}${path}` : path;
  }
}
