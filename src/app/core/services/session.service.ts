/**
 * SessionService
 * ─────────────────────────────────────────────────────────
 * Manages frontend session lifecycle: remember-me, expiry
 * detection, silent-refresh scheduling, and rehydration.
 * Backend-agnostic — swaps mock → real via environment flag.
 */
import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { StorageService } from './storage.service';
import { User } from '@core/models';

export const SESSION_USER_KEY = 'aegislex_user';
const REFRESH_THRESHOLD_SECS = 5 * 60; // refresh when < 5 min remain

@Injectable({ providedIn: 'root' })
export class SessionService implements OnDestroy {
  private readonly tokenService   = inject(TokenService);
  private readonly storageService = inject(StorageService);
  private readonly router         = inject(Router);

  private userSignal    = signal<User | null>(this.loadStoredUser());
  private restoredSignal = signal(false);

  readonly currentUser      = this.userSignal.asReadonly();
  readonly isAuthenticated  = computed(() => !!this.userSignal());
  readonly isAdmin          = computed(() => this.userSignal()?.role === 'admin');
  readonly sessionRestored  = this.restoredSignal.asReadonly();

  private refreshTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // Mark session as restored if a valid user was found in storage
    if (this.userSignal()) this.restoredSignal.set(true);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
  }

  // ── Persistence ──────────────────────────────────────────

  private loadStoredUser(): User | null {
    return this.storageService.get<User>(SESSION_USER_KEY);
  }

  setSession(user: User, access: string, refresh: string, expiresIn: number, rememberMe: boolean): void {
    this.tokenService.setTokens(access, refresh, expiresIn, rememberMe);
    this.storageService.set(SESSION_USER_KEY, user, true);
    this.userSignal.set(user);
    this.restoredSignal.set(false);
    this.scheduleRefresh(expiresIn);
  }

  updateUser(user: User): void {
    this.userSignal.set(user);
    this.storageService.set(SESSION_USER_KEY, user, true);
  }

  clearSession(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.tokenService.clearTokens();
    this.storageService.clearAuthStorage();
    this.userSignal.set(null);
    this.restoredSignal.set(false);
  }

  // ── Token helpers ────────────────────────────────────────

  getAccessToken(): string | null { return this.tokenService.getAccessToken(); }
  getRefreshToken(): string | null { return this.tokenService.getRefreshToken(); }
  isTokenValid(): boolean { return this.tokenService.isAccessTokenValid(); }

  // ── Silent-refresh scheduling ────────────────────────────

  private scheduleRefresh(expiresIn: number): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    const ms = Math.max((expiresIn - REFRESH_THRESHOLD_SECS) * 1000, 0);
    this.refreshTimer = setTimeout(() => {
      // In production: call authService.refreshToken() here
      // For demo: tokens don't actually expire
    }, ms);
  }

  // ── Expiry check ─────────────────────────────────────────

  isSessionExpired(): boolean {
    if (!this.userSignal()) return false;
    return !this.tokenService.isAccessTokenValid();
  }

  handleExpiredSession(): void {
    this.clearSession();
    this.router.navigate(['/auth/login'], { queryParams: { reason: 'session_expired' } });
  }
}
