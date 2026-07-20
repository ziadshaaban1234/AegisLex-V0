/**
 * OtpStateService
 * ─────────────────────────────────────────────────────────
 * Manages OTP flow state: email, countdown, attempts,
 * verified token. Centralises what was scattered across
 * the verify-otp component and sessionStorage calls.
 */
import { Injectable, signal, computed } from '@angular/core';
import { OtpFlowState, OtpPurpose } from '@core/models';

const OTP_TTL_MS    = 10 * 60 * 1000; // 10 minutes
const OTP_MAX_TRIES = 3;
const RESEND_SECS   = 60;

@Injectable({ providedIn: 'root' })
export class OtpStateService {

  private _state = signal<OtpFlowState | null>(null);
  private _canResend = signal(false);
  private _countdown = signal(0);

  readonly state      = this._state.asReadonly();
  readonly canResend  = this._canResend.asReadonly();
  readonly countdown  = this._countdown.asReadonly();
  readonly isExpired  = computed(() => {
    const s = this._state();
    return s ? Date.now() > s.expiresAt : true;
  });
  readonly attemptsRemaining = computed(() => {
    const s = this._state();
    return s ? Math.max(0, s.maxAttempts - s.attempts) : 0;
  });
  readonly isLocked = computed(() => this.attemptsRemaining() === 0);

  private countdownTimer?: ReturnType<typeof setInterval>;

  // ── Initialise flow ──────────────────────────────────────

  startFlow(email: string, purpose: OtpPurpose = 'reset_password'): void {
    this._state.set({
      email,
      purpose,
      sentAt:      Date.now(),
      expiresAt:   Date.now() + OTP_TTL_MS,
      attempts:    0,
      maxAttempts: OTP_MAX_TRIES,
    });
    this.startResendCountdown();
    // Persist email for page-refresh recovery
    sessionStorage.setItem('aegislex_otp_email', email);
  }

  // ── Attempt tracking ─────────────────────────────────────

  recordAttempt(): void {
    this._state.update(s => s ? { ...s, attempts: s.attempts + 1 } : s);
  }

  setVerified(resetToken: string): void {
    this._state.update(s => s ? { ...s, resetToken } : s);
    sessionStorage.setItem('aegislex_reset_verified', 'true');
  }

  // ── Resend countdown ─────────────────────────────────────

  startResendCountdown(): void {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this._countdown.set(RESEND_SECS);
    this._canResend.set(false);
    this.countdownTimer = setInterval(() => {
      this._countdown.update(v => {
        if (v <= 1) {
          clearInterval(this.countdownTimer);
          this._canResend.set(true);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }

  resetAttempts(): void {
    this._state.update(s => s ? { ...s, attempts: 0 } : s);
  }

  // ── Clear ────────────────────────────────────────────────

  clear(): void {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this._state.set(null);
    this._canResend.set(false);
    this._countdown.set(0);
    sessionStorage.removeItem('aegislex_otp_email');
    sessionStorage.removeItem('aegislex_reset_verified');
  }
}
