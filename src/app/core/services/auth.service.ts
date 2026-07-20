/**
 * AuthService
 * ─────────────────────────────────────────────────────────
 * Thin orchestration layer over the injected AuthAdapter.
 * Mock vs. production behavior is decided ENTIRELY by which
 * adapter is bound to AUTH_ADAPTER in app.config.ts — this
 * service contains zero environment branching.
 *
 * All state side-effects (token storage, user persistence,
 * draft cleanup) are handled here via SessionService.
 */
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import {
  LoginRequest, RegisterRequest, User,
  ApiResponse, AuthResponse,
} from '@core/models';
import { AUTH_ADAPTER }          from '@core/adapters/auth.adapter';
import { SessionService, SESSION_USER_KEY } from './session.service';
import { StorageService }        from './storage.service';
import { DraftRecoveryService }  from './draft-recovery.service';
import { DeviceService }         from './device.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly adapter       = inject(AUTH_ADAPTER);
  private readonly sessionSvc    = inject(SessionService);
  private readonly storageSvc    = inject(StorageService);
  private readonly drafts        = inject(DraftRecoveryService);
  private readonly deviceSvc     = inject(DeviceService);
  private readonly router        = inject(Router);

  // ── Computed state (delegate to SessionService) ──────────
  readonly currentUser     = this.sessionSvc.currentUser;
  readonly isAuthenticated = this.sessionSvc.isAuthenticated;
  readonly isAdmin         = this.sessionSvc.isAdmin;

  // ── Login ────────────────────────────────────────────────

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    const withDevice: LoginRequest = { ...request, deviceId: this.deviceSvc.deviceId };

    return this.adapter.login(withDevice).pipe(
      tap(res => {
        if (res.success) {
          this.sessionSvc.setSession(
            res.data.user as User,
            res.data.accessToken,
            res.data.refreshToken,
            res.data.expiresIn,
            request.rememberMe ?? false,
          );
          // Always mirror to localStorage for guard compatibility in demo
          this.storageSvc.set(SESSION_USER_KEY, res.data.user, true);
        }
      }),
      map(res => res as unknown as ApiResponse<AuthResponse>),
    );
  }

  // ── Register ─────────────────────────────────────────────

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    const withDevice: RegisterRequest = { ...request, deviceId: this.deviceSvc.deviceId };

    return this.adapter.register(withDevice).pipe(
      tap(res => {
        if (res.success) {
          this.sessionSvc.setSession(
            res.data.user as User,
            res.data.accessToken,
            res.data.refreshToken,
            res.data.expiresIn,
            false,
          );
          this.storageSvc.set(SESSION_USER_KEY, res.data.user, true);
          this.drafts.clearRegistrationDraft();
        }
      }),
      map(res => res as unknown as ApiResponse<AuthResponse>),
    );
  }

  // ── Logout ───────────────────────────────────────────────

  logout(): void {
    this.drafts.clearAll();
    this.sessionSvc.clearSession();
    this.router.navigate(['/auth/login']);
  }

  // ── Token helpers ─────────────────────────────────────────

  getAccessToken(): string | null {
    return this.sessionSvc.getAccessToken() ?? 'mock-token';
  }

  getRefreshToken(): string | null {
    return this.sessionSvc.getRefreshToken() ?? 'mock-refresh';
  }

  updateCurrentUser(user: User): void {
    this.sessionSvc.updateUser(user);
  }
}
