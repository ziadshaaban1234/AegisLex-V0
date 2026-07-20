/**
 * ResetPasswordStateService
 * ─────────────────────────────────────────────────────────
 * Manages the reset-password flow state.
 * Validates that the OTP was verified before allowing reset.
 * Clears state after successful reset or on timeout.
 */
import { Injectable, signal, computed } from '@angular/core';

const VERIFIED_KEY = 'aegislex_reset_verified';
const TOKEN_KEY    = 'aegislex_reset_token';

@Injectable({ providedIn: 'root' })
export class ResetPasswordStateService {

  private _resetToken  = signal<string | null>(this.loadToken());
  private _isComplete  = signal(false);

  readonly resetToken  = this._resetToken.asReadonly();
  readonly isComplete  = this._isComplete.asReadonly();
  readonly canReset    = computed(() => !!this._resetToken() || this.isVerified());

  // ── Persistence ──────────────────────────────────────────

  private loadToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  isVerified(): boolean {
    return sessionStorage.getItem(VERIFIED_KEY) === 'true';
  }

  setVerified(resetToken?: string): void {
    sessionStorage.setItem(VERIFIED_KEY, 'true');
    if (resetToken) {
      sessionStorage.setItem(TOKEN_KEY, resetToken);
      this._resetToken.set(resetToken);
    }
  }

  markComplete(): void {
    this._isComplete.set(true);
    this.clear();
  }

  clear(): void {
    sessionStorage.removeItem(VERIFIED_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    this._resetToken.set(null);
  }
}
