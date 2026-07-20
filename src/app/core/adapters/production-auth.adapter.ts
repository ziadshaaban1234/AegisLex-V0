/**
 * ProductionAuthAdapter
 * ─────────────────────────────────────────────────────────
 * Implements AuthAdapter using real HTTP calls.
 * All endpoint URLs are built via ApiUrlBuilder + ApiEndpoints —
 * no hardcoded strings, no direct environment property reads.
 *
 * TO ACTIVATE: in app.config.ts change:
 *   { provide: AUTH_ADAPTER, useClass: MockAuthAdapter }
 * to:
 *   { provide: AUTH_ADAPTER, useClass: ProductionAuthAdapter }
 *
 * The application requires zero other changes.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiUrlBuilder, ApiEndpoints } from '@core/config/api.config';
import { AuthAdapter } from './auth.adapter';
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
} from '@core/models';

@Injectable({ providedIn: 'root' })
export class ProductionAuthAdapter implements AuthAdapter {
  private readonly http       = inject(HttpClient);
  private readonly urlBuilder = inject(ApiUrlBuilder);

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(this.urlBuilder.build(ApiEndpoints.AUTH.LOGIN), request);
  }

  register(request: RegisterRequest): Observable<ApiResponse<RegisterResponse>> {
    return this.http.post<ApiResponse<RegisterResponse>>(this.urlBuilder.build(ApiEndpoints.AUTH.REGISTER), request);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<ApiResponse<ForgotPasswordResponse>> {
    return this.http.post<ApiResponse<ForgotPasswordResponse>>(this.urlBuilder.build(ApiEndpoints.AUTH.FORGOT), request);
  }

  verifyOtp(request: VerifyOtpRequest): Observable<ApiResponse<VerifyOtpResponse>> {
    return this.http.post<ApiResponse<VerifyOtpResponse>>(this.urlBuilder.build(ApiEndpoints.AUTH.VERIFY_OTP), request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<ApiResponse<ResetPasswordResponse>> {
    return this.http.post<ApiResponse<ResetPasswordResponse>>(this.urlBuilder.build(ApiEndpoints.AUTH.RESET_PASSWORD), request);
  }

  refreshToken(request: RefreshTokenRequest): Observable<ApiResponse<RefreshTokenResponse>> {
    return this.http.post<ApiResponse<RefreshTokenResponse>>(this.urlBuilder.build(ApiEndpoints.AUTH.REFRESH_TOKEN), request);
  }

  logout(request: LogoutRequest): Observable<ApiResponse<LogoutResponse>> {
    return this.http.post<ApiResponse<LogoutResponse>>(this.urlBuilder.build(ApiEndpoints.AUTH.LOGOUT), request);
  }

  getCurrentUser(): Observable<ApiResponse<CurrentUserResponse>> {
    return this.http.get<ApiResponse<CurrentUserResponse>>(this.urlBuilder.build(ApiEndpoints.AUTH.ME));
  }
}
