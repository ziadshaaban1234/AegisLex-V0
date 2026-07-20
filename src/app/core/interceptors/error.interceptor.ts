/**
 * ErrorInterceptor
 * ─────────────────────────────────────────────────────────
 * Centralised HTTP error handling.
 * Uses ErrorMapper to convert HTTP errors to typed AppErrors.
 * 401 responses are passed through to RefreshTokenInterceptor.
 * All other errors are mapped and re-thrown as AppError instances.
 */
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorMapper } from '@core/services/error.service';
import { LoggerService } from '@core/services/logger.service';
import { environment }  from '@environments/environment';
import { ApiConstants } from '@core/config/api.config';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.mockMode) return next(req);

  const logger = inject(LoggerService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const requestId = req.headers.get(ApiConstants.HEADERS.REQUEST_ID) ?? 'unknown';

      // 401 is handled by RefreshTokenInterceptor — pass through
      if (err.status === 401) return throwError(() => err);

      const appErr = ErrorMapper.fromHttp(err);
      logger.error('ErrorInterceptor', `${req.method} ${req.url} → ${err.status}`, {
        requestId, code: appErr.code, message: appErr.message,
      });

      return throwError(() => appErr);
    })
  );
};
