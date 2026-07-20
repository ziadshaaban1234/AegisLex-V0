/**
 * RefreshTokenInterceptor
 * ─────────────────────────────────────────────────────────
 * Catches 401 responses and triggers a silent token refresh.
 * Queues concurrent requests during refresh and retries them.
 * Redirects to /auth/login if the refresh itself fails.
 *
 * In mock mode: passes through (no real tokens).
 * // TODO: Replace with real backend endpoint
 */
import {
  HttpInterceptorFn, HttpErrorResponse,
  HttpHandlerFn, HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError, switchMap, filter, take, catchError, of } from 'rxjs';
import { TokenService }   from '@core/services/token.service';
import { SessionService } from '@core/services/session.service';
import { LoggerService }  from '@core/services/logger.service';
import { environment }    from '@environments/environment';

// Module-level singleton state for request queuing
let isRefreshing            = false;
const refreshDone$          = new BehaviorSubject<string | null>(null);

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function queueAndRetry(
  req:      HttpRequest<unknown>,
  next:     HttpHandlerFn,
): ReturnType<HttpHandlerFn> {
  return refreshDone$.pipe(
    filter(t => t !== null),
    take(1),
    switchMap(token => next(addToken(req, token!))),
  );
}

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.mockMode) return next(req);

  const tokens  = inject(TokenService);
  const session = inject(SessionService);
  const router  = inject(Router);
  const logger  = inject(LoggerService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) return throwError(() => err);

      if (isRefreshing) {
        // Another refresh is in flight — queue this request
        return queueAndRetry(req, next);
      }

      const refreshToken = tokens.getRefreshToken();
      if (!refreshToken) {
        session.handleExpiredSession();
        return throwError(() => err);
      }

      isRefreshing = true;
      refreshDone$.next(null);

      // Future Backend Endpoint:
      // POST ${env.apiBaseUrl}/auth/refresh-token  { refreshToken }
      // Response: { accessToken, refreshToken, expiresIn }
      // This interceptor is provider-agnostic — it refreshes the session
      // token regardless of which AI provider (Grok/Gemini) is active.
      const refresh$ = of({ accessToken: 'mock-refreshed-' + Date.now() });

      return refresh$.pipe(
        switchMap(({ accessToken }) => {
          tokens.setAccessToken(accessToken);
          isRefreshing = false;
          refreshDone$.next(accessToken);
          logger.debug('RefreshTokenInterceptor', 'Token refreshed silently');
          return next(addToken(req, accessToken));
        }),
        catchError(refreshErr => {
          isRefreshing = false;
          refreshDone$.next(null);
          logger.error('RefreshTokenInterceptor', 'Refresh failed — logging out', refreshErr);
          session.handleExpiredSession();
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
