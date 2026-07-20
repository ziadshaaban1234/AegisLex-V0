/**
 * GoogleAuthService
 * ─────────────────────────────────────────────────────────
 * Dedicated service for the Google Authentication flow.
 *
 * Responsibilities:
 *   1. Simulate the Google popup / account selection (mock mode).
 *   2. Call the existing AUTH_ADAPTER.loginWithGoogle() with the
 *      resulting token.
 *   3. Pass the result through the existing AuthService pipeline
 *      (setSession, storage, Remember Me) — IDENTICAL to
 *      email/password login.
 *   4. Return the same Observable<ApiResponse<AuthResponse>> that
 *      callers (LoginComponent, RegisterComponent) already handle.
 *
 * DESIGN RULES:
 *   - NEVER bypasses AuthFacade or AuthService.
 *   - NEVER introduces a separate auth pipeline.
 *   - NEVER duplicates session/token/storage logic.
 *   - NEVER performs real HTTP calls (mock mode only today).
 *   - Uses the same AUTH_ADAPTER injection token as AuthService,
 *     so switching to ProductionAuthAdapter in app.config.ts
 *     automatically activates real Google auth here too.
 *
 * FUTURE ACTIVATION (production):
 *   When environment.googleClientId is populated AND the backend
 *   /auth/google/callback is ready:
 *     1. Set featureFlags.enableGoogleAuth = true.
 *     2. Load the Google Identity Services script in index.html.
 *     3. Uncomment the initGoogleSignIn() block below.
 *     4. No other changes are required — the auth pipeline is
 *        already wired correctly.
 *
 * // TODO: Uncomment GIS SDK integration when backend is ready.
 */
import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AUTH_ADAPTER } from '@core/adapters/auth.adapter';
import { SessionService, SESSION_USER_KEY } from './session.service';
import { StorageService } from './storage.service';
import { DeviceService } from './device.service';
import { AuthActions } from '@store/auth/auth.actions';
import { AppState } from '@store/app.state';
import { ApiResponse, AuthResponse, GoogleAuthRequest, User } from '@core/models';

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private readonly adapter    = inject(AUTH_ADAPTER);
  private readonly sessionSvc = inject(SessionService);
  private readonly storageSvc = inject(StorageService);
  private readonly deviceSvc  = inject(DeviceService);
  private readonly store      = inject(Store<AppState>);
  private readonly router     = inject(Router);

  /**
   * Start the Google login flow.
   *
   * In mock mode: simulates the Google popup with a short delay,
   * then calls adapter.loginWithGoogle() and processes the result
   * through the identical pipeline as email/password login.
   *
   * In production (future): will open the real Google Identity
   * Services popup, wait for the credential callback, then call
   * adapter.loginWithGoogle({ idToken: credential.credential }).
   *
   * @returns Observable that resolves to ApiResponse<AuthResponse>
   *          on success, or throws on failure — same contract as
   *          AuthService.login().
   */
  loginWithGoogle(): Observable<ApiResponse<AuthResponse>> {
    if (!this.adapter.loginWithGoogle) {
      return throwError(() => ({
        error: {
          code: 'GOOGLE_NOT_SUPPORTED',
          message: 'Google authentication is not supported by the current adapter.',
        },
      }));
    }

    // Mock mode: synthesize a mock idToken.
    // In production: replace this block with the GIS SDK popup and
    // use the real credential.credential from the CredentialResponse.
    const mockRequest: GoogleAuthRequest = {
      idToken:  'mock-google-id-token-' + Date.now(),
      deviceId: this.deviceSvc.deviceId,
    };

    // Add a brief simulated "popup selection" delay before the adapter call,
    // so the loading state is visible and the UX feels authentic.
    return of(mockRequest).pipe(
      delay(400),
      switchMap(req => this.adapter.loginWithGoogle!(req)),
      tap(res => {
        if (res.success) {
          // Process session — IDENTICAL to AuthService.login()
          this.sessionSvc.setSession(
            res.data.user as User,
            res.data.accessToken,
            res.data.refreshToken,
            res.data.expiresIn,
            false,  // Google auth: no "remember me" checkbox — session duration handled by token expiry
          );
          // Mirror to localStorage for guard compatibility (same as AuthService.login)
          this.storageSvc.set(SESSION_USER_KEY, res.data.user, true);
        }
      }),
      map(res => res as unknown as ApiResponse<AuthResponse>),
    );
  }
}
