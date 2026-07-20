/**
 * ApiClient — Centralized HTTP wrapper.
 * ─────────────────────────────────────────────────────────
 * All feature services use ApiClient instead of HttpClient directly.
 * Provides: URL building, typed responses, error mapping,
 * request-ID injection, timing, retry, and timeout.
 *
 * Switching from mock → real: only AuthService / feature
 * services need to call apiClient.get/post instead of mockService.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout, tap } from 'rxjs/operators';
import { ApiUrlBuilder, ApiConstants }  from '@core/config/api.config';
import { ErrorMapper }                  from './error.service';
import { LoggerService }                from './logger.service';
import { PerformanceService }           from './performance.service';
import { ApiResponse }                  from '@core/models';

export interface RequestOptions {
  params?:  Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?:   number;
  correlationId?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http    = inject(HttpClient);
  private readonly urlBuilder = inject(ApiUrlBuilder);
  private readonly logger  = inject(LoggerService);
  private readonly perf    = inject(PerformanceService);

  get<T>(path: string, opts: RequestOptions = {}): Observable<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, opts);
  }

  post<T>(path: string, body: unknown, opts: RequestOptions = {}): Observable<ApiResponse<T>> {
    return this.request<T>('POST', path, body, opts);
  }

  put<T>(path: string, body: unknown, opts: RequestOptions = {}): Observable<ApiResponse<T>> {
    return this.request<T>('PUT', path, body, opts);
  }

  patch<T>(path: string, body: unknown, opts: RequestOptions = {}): Observable<ApiResponse<T>> {
    return this.request<T>('PATCH', path, body, opts);
  }

  delete<T>(path: string, opts: RequestOptions = {}): Observable<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, opts);
  }

  private request<T>(
    method:  string,
    path:    string,
    body?:   unknown,
    opts:    RequestOptions = {},
  ): Observable<ApiResponse<T>> {
    const requestId    = crypto.randomUUID();
    const correlationId = opts.correlationId ?? requestId;
    const url          = this.urlBuilder.build(path);
    const timeoutMs    = opts.timeoutMs ?? ApiConstants.DEFAULT_TIMEOUT_MS;
    const retries      = opts.retries   ?? 0;

    let headers = new HttpHeaders({
      [ApiConstants.HEADERS.CONTENT_TYPE]:   ApiConstants.MIME.JSON,
      [ApiConstants.HEADERS.REQUEST_ID]:     requestId,
      [ApiConstants.HEADERS.CORRELATION_ID]: correlationId,
      [ApiConstants.HEADERS.API_VERSION]:    'v1',
      ...(opts.headers ?? {}),
    });

    let params = new HttpParams();
    if (opts.params) {
      Object.entries(opts.params).forEach(([k, v]) => {
        params = params.set(k, String(v));
      });
    }

    this.perf.startRequest(requestId);
    this.logger.debug('ApiClient', `${method} ${url}`, { requestId });

    return (this.http.request<ApiResponse<T>>(method, url, { body, headers, params }) as Observable<ApiResponse<T>>).pipe(
      timeout(timeoutMs),
      retry(retries),
      tap(() => this.perf.endRequest(requestId, path)),
      catchError(err => {
        this.perf.endRequest(requestId, path);
        const appErr = ErrorMapper.fromUnknown(err, 'ApiClient');
        this.logger.error('ApiClient', `${method} ${url} failed`, appErr);
        return throwError(() => appErr);
      }),
    );
  }
}
