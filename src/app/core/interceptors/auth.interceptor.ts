/**
 * AuthInterceptor
 * ─────────────────────────────────────────────────────────
 * Attaches Bearer token + request metadata headers to every
 * outgoing HTTP request that isn't an auth endpoint.
 *
 * Headers added:
 *   Authorization:    Bearer <access-token>
 *   X-Request-Id:     unique UUID per request
 *   X-Correlation-Id: passed through if already set, else = RequestId
 *   X-Api-Version:    v1
 *
 * Skips auth endpoints (login, register, etc.) to avoid
 * circular dependency when refreshing expired tokens.
 */
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService }      from '@core/services/token.service';
import { LoggerService }     from '@core/services/logger.service';
import { PerformanceService } from '@core/services/performance.service';
import { environment }       from '@environments/environment';
import { ApiConstants }      from '@core/config/api.config';

const AUTH_SKIP_PATHS = [
  '/auth/login', '/auth/register', '/auth/forgot-password',
  '/auth/verify-otp', '/auth/reset-password', '/auth/refresh-token',
  // Google OAuth callback — the frontend POSTs a Google ID token here.
  // The request carries no AegisLex access token (the user is not yet
  // authenticated), so the Authorization header must be omitted to
  // avoid an "invalid_token" error on the backend before the user is
  // even created. This mirrors the pattern used for /auth/login above.
  '/auth/google/callback',
];

function shouldSkip(url: string): boolean {
  return AUTH_SKIP_PATHS.some(p => url.includes(p));
}

function addMeta(req: HttpRequest<unknown>, requestId: string): HttpRequest<unknown> {
  const existing = req.headers.get(ApiConstants.HEADERS.CORRELATION_ID);
  return req.clone({
    setHeaders: {
      [ApiConstants.HEADERS.REQUEST_ID]:     requestId,
      [ApiConstants.HEADERS.CORRELATION_ID]: existing ?? requestId,
      [ApiConstants.HEADERS.API_VERSION]:    'v1',
    },
  });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Mock mode — no real HTTP calls; still add metadata for consistency
  if (environment.mockMode) {
    return next(req);
  }

  const tokens  = inject(TokenService);
  const logger  = inject(LoggerService);
  const perf    = inject(PerformanceService);

  const requestId = crypto.randomUUID();
  let outgoing    = addMeta(req, requestId);
  perf.startRequest(requestId);

  if (!shouldSkip(req.url)) {
    const token = tokens.getAccessToken();
    if (token) {
      outgoing = outgoing.clone({
        setHeaders: { [ApiConstants.HEADERS.AUTHORIZATION]: `Bearer ${token}` },
      });
    }
  }

  logger.debug('AuthInterceptor', `→ ${req.method} ${req.url}`, { requestId });
  return next(outgoing);
};
