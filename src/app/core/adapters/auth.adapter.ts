/**
 * AuthAdapter — Abstract interface for all authentication operations.
 * ─────────────────────────────────────────────────────────────────────
 * Components and services depend ONLY on this interface.
 * Switch between mock and production by swapping the adapter
 * in app.config.ts — zero component changes required.
 *
 * Usage (in app.config.ts):
 *   { provide: AUTH_ADAPTER, useClass: MockAuthAdapter }     // demo
 *   { provide: AUTH_ADAPTER, useClass: ProductionAuthAdapter } // prod
 */
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
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

/** Injection token — use this everywhere instead of concrete classes */
export const AUTH_ADAPTER = new InjectionToken<AuthAdapter>('AUTH_ADAPTER');

export interface AuthAdapter {
  /** Authenticate with email + password */
  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>>;

  /** Create a new account */
  register(request: RegisterRequest): Observable<ApiResponse<RegisterResponse>>;

  /** Request a password-reset OTP */
  forgotPassword(request: ForgotPasswordRequest): Observable<ApiResponse<ForgotPasswordResponse>>;

  /** Verify the OTP entered by the user */
  verifyOtp(request: VerifyOtpRequest): Observable<ApiResponse<VerifyOtpResponse>>;

  /** Set a new password after OTP verification */
  resetPassword(request: ResetPasswordRequest): Observable<ApiResponse<ResetPasswordResponse>>;

  /** Silently exchange a refresh token for a new access token */
  refreshToken(request: RefreshTokenRequest): Observable<ApiResponse<RefreshTokenResponse>>;

  /** Invalidate the session on the server */
  logout(request: LogoutRequest): Observable<ApiResponse<LogoutResponse>>;

  /** Fetch the authenticated user's profile and permissions */
  getCurrentUser(): Observable<ApiResponse<CurrentUserResponse>>;

  /**
   * Authenticate via Google OAuth 2.0 (optional — future use).
   *
   * Flow:
   *   1. Frontend uses Google Identity Services JS SDK to open the consent popup.
   *   2. On success, Google returns an ID token (JWT) to the browser.
   *   3. Frontend calls this method with { idToken }.
   *   4. This method POSTs the token to the backend endpoint
   *      ApiEndpoints.AUTH.GOOGLE_CALLBACK (/auth/google/callback).
   *   5. Backend validates the token with Google, creates/upserts the user,
   *      and returns a standard LoginResponse.
   *   6. Frontend stores the session identically to email/password login.
   *
   * This method is optional on the interface so that MockAuthAdapter and
   * ProductionAuthAdapter continue to compile without changes today.
   * Implement this method in GoogleAuthAdapter only.
   *
   * Do NOT call this method unless:
   *   - environment.googleClientId is non-empty, AND
   *   - featureFlags.enableGoogleAuth is true, AND
   *   - the backend /auth/google/callback endpoint exists.
   */
  loginWithGoogle?(request: GoogleAuthRequest): Observable<ApiResponse<LoginResponse>>;
}
