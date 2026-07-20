/**
 * TokenService
 * ─────────────────────────────────────────────────────────
 * Single source of truth for all token storage, retrieval,
 * and expiry management. Plug-and-play for real JWTs — swap
 * the mock expiry logic without touching any other service.
 *
 * =======================================================
 * FUTURE PRODUCTION SECURITY NOTE (comment only — no change
 * to current behavior; storing tokens in localStorage/
 * sessionStorage is kept exactly as-is for demo/mock mode):
 *
 * Client-readable storage (localStorage/sessionStorage) is
 * vulnerable to token theft via XSS. For a real backend:
 *   - Prefer an httpOnly, Secure, SameSite=strict cookie for
 *     the refresh token, set by the server on login/refresh.
 *   - Keep only a short-lived access token in memory (or this
 *     service) rather than persisted storage.
 *   - This would touch the auth interceptor and AuthFacade,
 *     so it is intentionally NOT implemented here to avoid
 *     any risk of breaking the existing auth flow.
 * =======================================================
 */
import { Injectable } from '@angular/core';

export const TOKEN_STORAGE_KEYS = {
  ACCESS:  'aegislex_access_token',
  REFRESH: 'aegislex_refresh_token',
  EXPIRY:  'aegislex_token_expiry',
} as const;

@Injectable({ providedIn: 'root' })
export class TokenService {

  // ── Write ────────────────────────────────────────────────

  setTokens(access: string, refresh: string, expiresIn: number, persistent: boolean): void {
    const store = persistent ? localStorage : sessionStorage;
    const expiresAt = (Date.now() + expiresIn * 1000).toString();
    store.setItem(TOKEN_STORAGE_KEYS.ACCESS,  access);
    store.setItem(TOKEN_STORAGE_KEYS.REFRESH, refresh);
    store.setItem(TOKEN_STORAGE_KEYS.EXPIRY,  expiresAt);
    // Mirror in localStorage for guard compatibility in demo mode
    if (!persistent) {
      localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS, access);
    }
  }

  setAccessToken(token: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS, token);
    sessionStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS, token);
  }

  // ── Read ─────────────────────────────────────────────────

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS)
        || sessionStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS)
        || null;
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH)
        || sessionStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH)
        || null;
  }

  getExpiresAt(): number | null {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEYS.EXPIRY)
             || sessionStorage.getItem(TOKEN_STORAGE_KEYS.EXPIRY);
    return raw ? parseInt(raw, 10) : null;
  }

  // ── Status ───────────────────────────────────────────────

  /** Returns true when an access token exists and is not yet expired */
  isAccessTokenValid(): boolean {
    const token    = this.getAccessToken();
    const expiresAt = this.getExpiresAt();
    if (!token) return false;
    // No expiry stored (e.g. demo mode) → treat as valid
    if (!expiresAt) return true;
    // Add a 30-second clock-skew buffer
    return Date.now() < expiresAt - 30_000;
  }

  /** Seconds remaining until token expires; -1 if expired or unknown */
  secondsUntilExpiry(): number {
    const expiresAt = this.getExpiresAt();
    if (!expiresAt) return Infinity as unknown as number;
    const remaining = Math.floor((expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -1;
  }

  // ── Clear ────────────────────────────────────────────────

  clearTokens(): void {
    [localStorage, sessionStorage].forEach(store => {
      store.removeItem(TOKEN_STORAGE_KEYS.ACCESS);
      store.removeItem(TOKEN_STORAGE_KEYS.REFRESH);
      store.removeItem(TOKEN_STORAGE_KEYS.EXPIRY);
    });
  }

  // ── JWT Decode (no library required) ─────────────────────

  /**
   * Decodes a JWT without verifying the signature.
   * Safe for reading claims (exp, sub, role) on the frontend.
   * Signature verification happens on the backend.
   */
  decodeToken<T extends Record<string, unknown>>(token?: string): T | null {
    const t = token ?? this.getAccessToken();
    if (!t) return null;
    try {
      const parts = t.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(payload + '==='.slice((payload.length + 3) % 4 || 0));
      return JSON.parse(decoded) as T;
    } catch { return null; }
  }

  /** Returns the `sub` (user ID) from the current access token */
  getTokenSubject(): string | null {
    return this.decodeToken<{ sub: string }>()?.sub ?? null;
  }

  /** Returns the `exp` (expiry Unix timestamp in seconds) from the token */
  getTokenExpiry(): number | null {
    return this.decodeToken<{ exp: number }>()?.exp ?? null;
  }

  /** Returns true when the token's `exp` claim is in the future */
  isJwtValid(): boolean {
    const exp = this.getTokenExpiry();
    if (!exp) return !!this.getAccessToken(); // mock token — no exp claim
    return Date.now() / 1000 < exp - 30;
  }
}
