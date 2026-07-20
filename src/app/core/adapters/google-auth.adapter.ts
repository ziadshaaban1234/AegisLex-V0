/**
 * GoogleAuthAdapter
 * ─────────────────────────────────────────────────────────
 * Future adapter for Google OAuth 2.0 authentication.
 * NOT wired up — not registered as AUTH_ADAPTER anywhere today.
 *
 * PURPOSE:
 *   Implements the loginWithGoogle() optional method on AuthAdapter.
 *   All other AuthAdapter methods delegate to the currently-active
 *   adapter (MockAuthAdapter in development, ProductionAuthAdapter
 *   at backend go-live) so that Google Auth is ADDITIVE — it plugs
 *   into the existing pipeline rather than replacing it.
 *
 * ARCHITECTURE:
 *   This adapter is NOT a full AUTH_ADAPTER replacement.
 *   It is a supplemental provider that:
 *     1. Opens the Google Identity Services popup (browser SDK).
 *     2. Receives a Google ID token on success.
 *     3. POSTs the token to POST /auth/google/callback on the backend.
 *     4. Returns a standard LoginResponse (identical to email/password login).
 *
 *   The existing auth pipeline (NgRx, SessionService, TokenService,
 *   interceptors, guards) is completely unaffected — it receives the
 *   same LoginResponse shape regardless of how the user authenticated.
 *
 * HOW TO ACTIVATE (future steps, in order):
 *   Step 1 — Backend:
 *     Implement POST /auth/google/callback.
 *     Accept { idToken: string }, validate with Google, upsert user,
 *     return standard LoginResponse.
 *
 *   Step 2 — GCP:
 *     Create a Google Cloud project and OAuth 2.0 Client ID.
 *     Add authorized JavaScript origins (your domain).
 *
 *   Step 3 — Environment:
 *     Populate googleClientId in environment.prod.ts (and staging).
 *     Leave environment.ts / environment.development.ts empty.
 *
 *   Step 4 — Feature flag:
 *     Set featureFlags.enableGoogleAuth = true in DEFAULT_APP_CONFIG
 *     (or via remote flag override) ONLY after steps 1–3 are complete.
 *
 *   Step 5 — Login page:
 *     Add a "Sign in with Google" button guarded by:
 *       featureFlagService.isEnabled('enableGoogleAuth')
 *     Call authService.loginWithGoogle() from the button handler.
 *     No other changes to the auth flow are required.
 *
 *   Step 6 — AuthService:
 *     Add a loginWithGoogle() method that:
 *       a. Opens the Google popup via the GIS SDK.
 *       b. On success, calls adapter.loginWithGoogle!({ idToken }).
 *       c. Pipes through the same setSession() tap as login().
 *
 * WHAT MUST NEVER CHANGE:
 *   - MockAuthAdapter (untouched).
 *   - ProductionAuthAdapter (untouched).
 *   - AUTH_ADAPTER binding in app.config.ts (untouched).
 *   - AuthFacade, AuthEffects, AuthReducer, AuthActions (untouched).
 *   - All existing auth flows, interceptors, guards (untouched).
 *
 * // TODO: Implement when backend /auth/google/callback is ready.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthAdapter } from './auth.adapter';
import { ApiUrlBuilder, ApiEndpoints } from '@core/config/api.config';
import {
  LoginRequest, LoginResponse,
  RegisterRequest, RegisterResponse,
  ForgotPasswordRequest, ForgotPasswordResponse,
  VerifyOtpRequest, VerifyOtpResponse,
  ResetPasswordRequest, ResetPasswordResponse,
  RefreshTokenRequest, RefreshTokenResponse,
  LogoutRequest, LogoutResponse,
  CurrentUserResponse,
  ApiResponse,
  GoogleAuthRequest,
} from '@core/models';

@Injectable({ providedIn: 'root' })
export class GoogleAuthAdapter implements AuthAdapter {
  private readonly http       = inject(HttpClient);
  private readonly urlBuilder = inject(ApiUrlBuilder);

  // ── Google-specific method ────────────────────────────────
  //
  // This is the only method implemented here.
  // Call this after obtaining a Google ID token from the GIS SDK.
  // The backend validates the token and returns a standard LoginResponse.
  //
  // TODO: Uncomment and test when the backend endpoint is ready.

  loginWithGoogle(request: GoogleAuthRequest): Observable<ApiResponse<LoginResponse>> {
    // TODO: Uncomment when backend /auth/google/callback is implemented.
    // return this.http.post<ApiResponse<LoginResponse>>(
    //   this.urlBuilder.build(ApiEndpoints.AUTH.GOOGLE_CALLBACK),
    //   request
    // );
    return throwError(() => new Error(
      '[GoogleAuthAdapter] loginWithGoogle() is not yet implemented. ' +
      'See GOOGLE-AUTH-PREP-REPORT.md for activation instructions.'
    ));
  }

  // ── Remaining AuthAdapter methods — NOT used by this adapter ─
  //
  // These delegate to the currently-active AUTH_ADAPTER (Mock or Production).
  // GoogleAuthAdapter is never registered as AUTH_ADAPTER today, so these
  // are present only to satisfy the AuthAdapter interface contract.
  // They will never be called.
  //
  // If you wire GoogleAuthAdapter into the provider chain in the future,
  // delegate these to the injected ProductionAuthAdapter, not HttpClient,
  // to avoid duplicating endpoint logic.

  login(_r: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return throwError(() => new Error('[GoogleAuthAdapter] Use AUTH_ADAPTER for email/password login.'));
  }

  register(_r: RegisterRequest): Observable<ApiResponse<RegisterResponse>> {
    return throwError(() => new Error('[GoogleAuthAdapter] Use AUTH_ADAPTER for registration.'));
  }

  forgotPassword(_r: ForgotPasswordRequest): Observable<ApiResponse<ForgotPasswordResponse>> {
    return throwError(() => new Error('[GoogleAuthAdapter] Use AUTH_ADAPTER for forgot-password.'));
  }

  verifyOtp(_r: VerifyOtpRequest): Observable<ApiResponse<VerifyOtpResponse>> {
    return throwError(() => new Error('[GoogleAuthAdapter] Use AUTH_ADAPTER for OTP verification.'));
  }

  resetPassword(_r: ResetPasswordRequest): Observable<ApiResponse<ResetPasswordResponse>> {
    return throwError(() => new Error('[GoogleAuthAdapter] Use AUTH_ADAPTER for password reset.'));
  }

  refreshToken(_r: RefreshTokenRequest): Observable<ApiResponse<RefreshTokenResponse>> {
    return throwError(() => new Error('[GoogleAuthAdapter] Use AUTH_ADAPTER for token refresh.'));
  }

  logout(_r: LogoutRequest): Observable<ApiResponse<LogoutResponse>> {
    return throwError(() => new Error('[GoogleAuthAdapter] Use AUTH_ADAPTER for logout.'));
  }

  getCurrentUser(): Observable<ApiResponse<CurrentUserResponse>> {
    return throwError(() => new Error('[GoogleAuthAdapter] Use AUTH_ADAPTER for getCurrentUser.'));
  }
}
