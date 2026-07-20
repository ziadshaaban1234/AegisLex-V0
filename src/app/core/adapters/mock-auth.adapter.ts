/**
 * MockAuthAdapter
 * ─────────────────────────────────────────────────────────
 * Implements AuthAdapter using in-memory mock data.
 * Used in mock mode (environment.mockMode = true).
 *
 * Simulates realistic latency with Observable delays.
 * Matches the exact response shape the production backend
 * will return — zero component changes when switching.
 *
 * // TODO: Replace with real backend implementation
 * (switch the AUTH_ADAPTER provider in app.config.ts to
 * ProductionAuthAdapter — no other file needs to change)
 */
import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { AuthAdapter } from './auth.adapter';
import { MockService } from '@core/mock/mock.service';
import {
  LoginRequest, LoginResponse,
  RegisterRequest, RegisterResponse,
  ForgotPasswordRequest, ForgotPasswordResponse,
  VerifyOtpRequest, VerifyOtpResponse,
  ResetPasswordRequest, ResetPasswordResponse,
  RefreshTokenRequest, RefreshTokenResponse,
  LogoutRequest, LogoutResponse,
  CurrentUserResponse,
  ApiResponse, UserRole,
  GoogleAuthRequest, User, UserPreferences,
} from '@core/models';

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, message: 'OK' };
}

@Injectable({ providedIn: 'root' })
export class MockAuthAdapter implements AuthAdapter {
  private readonly mock = inject(MockService);

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.mock.login(request.email, request.password).pipe(
      switchMap(res => {
        const response: ApiResponse<LoginResponse> = {
          success: true,
          data: {
            accessToken:  res.data.accessToken,
            refreshToken: res.data.refreshToken,
            expiresIn:    res.data.expiresIn,
            user:         res.data.user,
            rememberMe:   request.rememberMe ?? false,
          },
          message: 'Login successful',
        };
        return of(response);
      })
    );
  }

  register(req: RegisterRequest): Observable<ApiResponse<RegisterResponse>> {
    return this.mock.register(req).pipe(
      switchMap(res => of(ok<RegisterResponse>({
        accessToken:  res.data.accessToken,
        refreshToken: res.data.refreshToken,
        expiresIn:    res.data.expiresIn,
        user:         res.data.user,
      })))
    );
  }

  forgotPassword(req: ForgotPasswordRequest): Observable<ApiResponse<ForgotPasswordResponse>> {
    return of(ok<ForgotPasswordResponse>({
      message:   `OTP sent to ${req.email}`,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    })).pipe(delay(900));
  }

  verifyOtp(req: VerifyOtpRequest): Observable<ApiResponse<VerifyOtpResponse>> {
    // Demo: 123456 always succeeds
    if (req.otp === '123456') {
      return of(ok<VerifyOtpResponse>({
        verified:   true,
        resetToken: 'mock-reset-token-' + Date.now(),
        expiresAt:  new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      })).pipe(delay(800));
    }
    return throwError(() => ({
      error: { code: 'INVALID_OTP', message: 'Invalid OTP.' },
      status: 422,
    }));
  }

  resetPassword(_req: ResetPasswordRequest): Observable<ApiResponse<ResetPasswordResponse>> {
    return of(ok<ResetPasswordResponse>({
      success: true,
      message: 'Password reset successfully.',
    })).pipe(delay(1000));
  }

  refreshToken(_req: RefreshTokenRequest): Observable<ApiResponse<RefreshTokenResponse>> {
    return of(ok<RefreshTokenResponse>({
      accessToken:  'mock-refreshed-token-' + Date.now(),
      refreshToken: 'mock-refresh-token',
      expiresIn:    3600,
    })).pipe(delay(300));
  }

  logout(_req: LogoutRequest): Observable<ApiResponse<LogoutResponse>> {
    return of(ok<LogoutResponse>({ success: true })).pipe(delay(200));
  }

  getCurrentUser(): Observable<ApiResponse<CurrentUserResponse>> {
    const user = this.mock.getCurrentUser();
    return of(ok<CurrentUserResponse>({
      user,
      permissions: ['read:dashboard', 'read:cases', 'read:documents', 'write:cases'],
      role: {
        id: 'role-' + user.role,
        name: user.role as UserRole,
        displayName: user.role,
        permissions: [],
        description: '',
      },
    })).pipe(delay(300));
  }

  /**
   * Mock Google Authentication
   * ─────────────────────────────────────────────────────────
   * Simulates the complete Google OAuth flow in mock mode:
   *   1. Validates the (mock) ID token — always succeeds.
   *   2. Returns a standard LoginResponse with a synthesized mock
   *      Google user that conforms to the existing User model.
   *   3. Response shape is identical to email/password login,
   *      so the existing auth pipeline handles it without changes.
   *
   * In production: POST /auth/google/callback { idToken } → LoginResponse
   * TODO: Replace with real backend call when ProductionAuthAdapter is activated.
   */
  loginWithGoogle(_req: GoogleAuthRequest): Observable<ApiResponse<LoginResponse>> {
    const defaultPrefs: UserPreferences = {
      theme: 'dark',
      language: 'en',
      notifications: { email: true, push: true, analysisComplete: true, reportReady: true },
    };
    const googleUser: User = {
      id:               'usr-google-mock-001',
      firstName:        'Google',
      lastName:         'Demo User',
      email:            'google.demo@aegislex.com',
      role:             'lawyer',
      avatarUrl:        undefined,
      organizationName: 'AegisLex Demo',
      isActive:         true,
      createdAt:        new Date().toISOString(),
      lastLoginAt:      new Date().toISOString(),
      preferences:      defaultPrefs,
    };

    const response: ApiResponse<LoginResponse> = {
      success: true,
      message: 'Google login successful',
      data: {
        accessToken:  'mock-google-token-' + Date.now(),
        refreshToken: 'mock-google-refresh-' + Date.now(),
        expiresIn:    3600,
        user:         googleUser,
        rememberMe:   false,
      },
    };
    return of(response).pipe(delay(1100));
  }
}
