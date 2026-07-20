/**
 * AuthFacade
 * ─────────────────────────────────────────────────────────
 * Single public API for all authentication operations.
 * Components and guards interact with AuthFacade only —
 * never directly with SessionService, TokenService, etc.
 *
 * Exposes both NgRx Observable streams (for components
 * using async pipe) and Angular Signals (for components
 * using signal-based reactivity).
 */
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions }      from '@store/auth/auth.actions';
import { AppState }         from '@store/app.state';
import {
  selectCurrentUser, selectIsAuthenticated,
  selectAuthLoading, selectPermissions, selectUserRole,
  selectSessionStatus, selectLockout, selectIsLocked,
  selectOtpEmail, selectResetPending, selectRememberMe,
  selectAuthError, selectSessionRestored,
} from '@store/auth/auth.selectors';
import { SessionService }            from './session.service';
import { TokenService }              from './token.service';
import { PermissionService, Permission } from './permission.service';
import { DraftRecoveryService }      from './draft-recovery.service';
import { OtpStateService }           from './otp-state.service';
import { ResetPasswordStateService } from './reset-password-state.service';
import { ToastService }              from './toast.service';
import { AuthService }               from './auth.service';
import {
  LoginRequest, RegisterRequest,
  ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest,
  ApiResponse, AuthResponse, User,
} from '@core/models';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly session     = inject(SessionService);
  private readonly tokens      = inject(TokenService);
  private readonly permissions = inject(PermissionService);
  private readonly drafts      = inject(DraftRecoveryService);
  private readonly otpState    = inject(OtpStateService);
  private readonly resetState  = inject(ResetPasswordStateService);
  private readonly toasts      = inject(ToastService);
  private readonly authSvc     = inject(AuthService);
  private readonly router      = inject(Router);
  private readonly store       = inject(Store<AppState>);

  // ── NgRx Observable streams ───────────────────────────────

  readonly currentUser$      = this.store.select(selectCurrentUser);
  readonly isAuthenticated$  = this.store.select(selectIsAuthenticated);
  readonly isLoading$        = this.store.select(selectAuthLoading);
  readonly permissions$      = this.store.select(selectPermissions);
  readonly role$             = this.store.select(selectUserRole);
  readonly sessionStatus$    = this.store.select(selectSessionStatus);
  readonly lockoutStatus$    = this.store.select(selectLockout);
  readonly isLocked$         = this.store.select(selectIsLocked);
  readonly otpEmail$         = this.store.select(selectOtpEmail);
  readonly resetPending$     = this.store.select(selectResetPending);
  readonly rememberMe$       = this.store.select(selectRememberMe);
  readonly error$            = this.store.select(selectAuthError);
  readonly sessionRestored$  = this.store.select(selectSessionRestored);

  // ── Angular Signals (direct from SessionService) ──────────

  readonly currentUser      = this.session.currentUser;
  readonly isAuthenticated  = this.session.isAuthenticated;
  readonly sessionRestored  = this.session.sessionRestored;

  // ── Auth operations ───────────────────────────────────────

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.authSvc.login(request);
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.authSvc.register(request);
  }

  logout(): void {
    this.drafts.clearAll();
    this.otpState.clear();
    this.resetState.clear();
    this.store.dispatch(AuthActions.logout());
    this.authSvc.logout();
  }

  forgotPassword(req: ForgotPasswordRequest): void {
    this.drafts.saveForgotEmail(req.email);
    this.otpState.startFlow(req.email, 'reset_password');
    this.store.dispatch(AuthActions.otpSent({ email: req.email }));
  }

  verifyOtp(req: VerifyOtpRequest): void {
    this.otpState.recordAttempt();
    // On success (called externally after verification):
    // this.store.dispatch(AuthActions.otpVerified());
  }

  verifyOtpSuccess(resetToken?: string): void {
    this.otpState.setVerified(resetToken ?? '');
    this.resetState.setVerified(resetToken);
    this.store.dispatch(AuthActions.otpVerified());
  }

  resetPassword(req: ResetPasswordRequest): void {
    this.resetState.markComplete();
    this.drafts.clearAll();
    this.store.dispatch(AuthActions.otpCleared());
  }

  // ── Session management ────────────────────────────────────

  /**
   * Attempt to restore session from storage.
   * Called on app init by AppComponent or a route resolver.
   */
  restoreSession(): void {
    const user = this.session.currentUser();
    if (user && this.session.isTokenValid()) {
      this.store.dispatch(AuthActions.sessionRestored());
    } else if (user && this.session.isSessionExpired()) {
      this.refreshSession();
    }
  }

  /**
   * Silently exchange the refresh token for a new access token.
   * In demo mode: always succeeds with a mock token.
   */
  refreshSession(): void {
    const refreshToken = this.tokens.getRefreshToken();
    if (!refreshToken) {
      this.handleSessionExpiry();
      return;
    }
    // In production: call the adapter's refreshToken() here
    // For demo: simulate success
    const newToken = 'mock-refreshed-' + Date.now();
    this.tokens.setAccessToken(newToken);
    this.store.dispatch(AuthActions.refreshTokenSuccess({ accessToken: newToken }));
  }

  handleSessionExpiry(): void {
    this.logout();
    this.router.navigate(['/auth/login'], { queryParams: { reason: 'session_expired' } });
  }

  // ── Permission helpers ────────────────────────────────────

  can(permission: Permission): boolean       { return this.permissions.has(permission); }
  canAll(perms: Permission[]): boolean       { return this.permissions.hasAll(perms); }
  canAny(perms: Permission[]): boolean       { return this.permissions.hasAny(perms); }
  isAdmin():   boolean { return this.permissions.isAdmin(); }
  isLawyer():  boolean { return this.permissions.isLawyer(); }
  isAnalyst(): boolean { return this.permissions.isAnalyst(); }

  // ── State helpers ─────────────────────────────────────────

  getOtpState()   { return this.otpState.state(); }
  getResetState() { return this.resetState.canReset(); }
  getToken()      { return this.tokens.getAccessToken(); }
  getCurrentUserSnapshot(): User | null { return this.session.currentUser(); }
}
