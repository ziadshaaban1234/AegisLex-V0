/**
 * DraftRecoveryService
 * ─────────────────────────────────────────────────────────
 * Manages safe draft persistence for all auth forms.
 * NEVER persists passwords, tokens, or OTP codes.
 * Auto-expires drafts after 24 hours.
 * Centralises all draft logic previously in auth-validators.ts.
 */
import { Injectable } from '@angular/core';
import { RegDraft } from '@core/models';

const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

const KEYS = {
  REG:            'aegislex_reg_draft',
  FORGOT_EMAIL:   'aegislex_forgot_email',
  OTP_STATE:      'aegislex_otp_state',
} as const;

@Injectable({ providedIn: 'root' })
export class DraftRecoveryService {

  // ── Registration draft ───────────────────────────────────

  saveRegistrationDraft(draft: Omit<RegDraft, 'savedAt'>): void {
    try {
      const payload: RegDraft = { ...draft, savedAt: Date.now() };
      localStorage.setItem(KEYS.REG, JSON.stringify(payload));
    } catch {}
  }

  loadRegistrationDraft(): Partial<RegDraft> | null {
    try {
      const raw = localStorage.getItem(KEYS.REG);
      if (!raw) return null;
      const d: RegDraft = JSON.parse(raw);
      if (Date.now() - d.savedAt > DRAFT_TTL_MS) {
        this.clearRegistrationDraft();
        return null;
      }
      return d;
    } catch { return null; }
  }

  clearRegistrationDraft(): void {
    localStorage.removeItem(KEYS.REG);
  }

  hasFreshRegistrationDraft(): boolean {
    return !!this.loadRegistrationDraft();
  }

  // ── Forgot-password email ────────────────────────────────

  saveForgotEmail(email: string): void {
    try { sessionStorage.setItem(KEYS.FORGOT_EMAIL, email); } catch {}
  }

  loadForgotEmail(): string | null {
    return sessionStorage.getItem(KEYS.FORGOT_EMAIL);
  }

  clearForgotEmail(): void {
    sessionStorage.removeItem(KEYS.FORGOT_EMAIL);
  }

  // ── OTP flow state ───────────────────────────────────────

  saveOtpState(email: string): void {
    try { sessionStorage.setItem(KEYS.OTP_STATE, email); } catch {}
  }

  loadOtpEmail(): string | null {
    return sessionStorage.getItem(KEYS.OTP_STATE)
        ?? sessionStorage.getItem('aegislex_otp_email')
        ?? null;
  }

  clearOtpState(): void {
    sessionStorage.removeItem(KEYS.OTP_STATE);
    sessionStorage.removeItem('aegislex_otp_email');
    sessionStorage.removeItem('aegislex_reset_verified');
  }

  // ── Bulk clear ───────────────────────────────────────────

  clearAll(): void {
    this.clearRegistrationDraft();
    this.clearForgotEmail();
    this.clearOtpState();
  }
}
