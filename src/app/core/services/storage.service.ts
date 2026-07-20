/**
 * StorageService
 * ─────────────────────────────────────────────────────────
 * Typed wrapper around localStorage / sessionStorage.
 * Centralises all storage access and provides safe JSON
 * serialisation so callers never deal with try/catch.
 */
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {

  // ── Typed get/set for localStorage ─────────────────────

  set<T>(key: string, value: T, persistent = true): void {
    try {
      const store = persistent ? localStorage : sessionStorage;
      store.setItem(key, JSON.stringify(value));
    } catch { /* quota exceeded — silently ignore */ }
  }

  get<T>(key: string, fallback: T | null = null): T | null {
    try {
      const raw = localStorage.getItem(key) ?? sessionStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : fallback;
    } catch { return fallback; }
  }

  getString(key: string): string | null {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key) ?? null;
  }

  setString(key: string, value: string, persistent = true): void {
    try {
      const store = persistent ? localStorage : sessionStorage;
      store.setItem(key, value);
    } catch {}
  }

  remove(key: string): void {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  removeMany(keys: string[]): void {
    keys.forEach(k => this.remove(k));
  }

  // ── Auth-specific helpers ───────────────────────────────

  /** Remove every key that belongs to AegisLex auth flows */
  clearAuthStorage(): void {
    this.removeMany([
      'aegislex_access_token',
      'aegislex_refresh_token',
      'aegislex_token_expiry',
      'aegislex_user',
      'aegislex_reg_draft',
      'aegislex_otp_state',
      'aegislex_reset_verified',
      'aegislex_otp_email',
      'aegislex_device_id',
    ]);
  }
}
