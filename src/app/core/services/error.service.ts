/**
 * Error Infrastructure
 * ─────────────────────────────────────────────────────────
 * AppError — strongly-typed error model
 * ErrorCodes — all known error code constants
 * ErrorMapper — maps HTTP/raw errors to AppError
 * ErrorService — centralized error handling service
 * GlobalErrorHandler — Angular ErrorHandler implementation
 */
import { Injectable, ErrorHandler, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerService } from './logger.service';
import { ToastService } from './toast.service';
import { LanguageService } from './language.service';

// ── ErrorCodes ────────────────────────────────────────────

export const ErrorCodes = {
  // Auth
  INVALID_CREDENTIALS:   'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED:        'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED:      'ACCOUNT_DISABLED',
  EMAIL_ALREADY_EXISTS:  'EMAIL_ALREADY_EXISTS',
  SESSION_EXPIRED:       'SESSION_EXPIRED',
  TOKEN_INVALID:         'TOKEN_INVALID',
  TOKEN_EXPIRED:         'TOKEN_EXPIRED',
  OTP_INVALID:           'OTP_INVALID',
  OTP_EXPIRED:           'OTP_EXPIRED',
  OTP_MAX_ATTEMPTS:      'OTP_MAX_ATTEMPTS',
  RESET_TOKEN_INVALID:   'RESET_TOKEN_INVALID',
  RESET_TOKEN_EXPIRED:   'RESET_TOKEN_EXPIRED',
  // HTTP
  BAD_REQUEST:           'BAD_REQUEST',
  UNAUTHORIZED:          'UNAUTHORIZED',
  FORBIDDEN:             'FORBIDDEN',
  NOT_FOUND:             'NOT_FOUND',
  VALIDATION_ERROR:      'VALIDATION_ERROR',
  TOO_MANY_REQUESTS:     'TOO_MANY_REQUESTS',
  SERVER_ERROR:          'SERVER_ERROR',
  SERVICE_UNAVAILABLE:   'SERVICE_UNAVAILABLE',
  // Network
  NETWORK_ERROR:         'NETWORK_ERROR',
  TIMEOUT:               'TIMEOUT',
  // Application
  UNKNOWN:               'UNKNOWN',
  RUNTIME_ERROR:         'RUNTIME_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// ── AppError model ────────────────────────────────────────

export class AppError extends Error {
  constructor(
    public readonly code:       ErrorCode,
    message:                    string,
    public readonly statusCode: number  = 0,
    public readonly context:    string  = 'App',
    public readonly original?:  unknown,
    /** LanguageService translation key for the user-facing message.
     *  `message` above stays English — it is used for console/log output
     *  only (see LoggerService). UI-facing text must resolve `messageKey`
     *  via LanguageService.t() before display. */
    public readonly messageKey: string  = 'error.code.unexpected',
  ) {
    super(message);
    this.name = 'AppError';
  }

  get isAuthError(): boolean {
    return [
      ErrorCodes.INVALID_CREDENTIALS, ErrorCodes.ACCOUNT_LOCKED,
      ErrorCodes.ACCOUNT_DISABLED, ErrorCodes.SESSION_EXPIRED,
      ErrorCodes.TOKEN_INVALID, ErrorCodes.TOKEN_EXPIRED,
    ].includes(this.code as never);
  }

  get isNetworkError(): boolean {
    return this.code === ErrorCodes.NETWORK_ERROR || this.statusCode === 0;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

// ── ErrorMapper ───────────────────────────────────────────

export class ErrorMapper {
  static fromHttp(err: HttpErrorResponse): AppError {
    if (!navigator.onLine || err.status === 0) {
      return new AppError(ErrorCodes.NETWORK_ERROR, 'No internet connection.', 0, 'HTTP', err, 'error.http.no_connection');
    }
    const serverCode = err.error?.code as ErrorCode | undefined;
    const message    = err.error?.message as string | undefined;
    switch (err.status) {
      case 400: return new AppError(serverCode ?? ErrorCodes.BAD_REQUEST,          message ?? 'Bad request.',                     400, 'HTTP', err, 'error.http.bad_request');
      case 401: return new AppError(serverCode ?? ErrorCodes.UNAUTHORIZED,          message ?? 'Authentication required.',         401, 'HTTP', err, 'error.http.unauthorized');
      case 403: return new AppError(serverCode ?? ErrorCodes.FORBIDDEN,             message ?? 'You do not have permission.',      403, 'HTTP', err, 'error.http.forbidden');
      case 404: return new AppError(serverCode ?? ErrorCodes.NOT_FOUND,             message ?? 'Resource not found.',             404, 'HTTP', err, 'error.http.not_found');
      case 422: return new AppError(serverCode ?? ErrorCodes.VALIDATION_ERROR,      message ?? 'Validation failed.',              422, 'HTTP', err, 'error.http.validation_failed');
      case 429: return new AppError(serverCode ?? ErrorCodes.TOO_MANY_REQUESTS,     message ?? 'Too many requests.',              429, 'HTTP', err, 'error.http.too_many_requests');
      case 500: return new AppError(serverCode ?? ErrorCodes.SERVER_ERROR,          message ?? 'Server error. Please try again.', 500, 'HTTP', err, 'error.http.server_error');
      case 503: return new AppError(serverCode ?? ErrorCodes.SERVICE_UNAVAILABLE,   message ?? 'Service unavailable.',            503, 'HTTP', err, 'error.http.service_unavailable');
      default:  return new AppError(serverCode ?? ErrorCodes.UNKNOWN,               message ?? 'An unexpected error occurred.',   err.status, 'HTTP', err, 'error.http.unknown');
    }
  }

  static fromUnknown(err: unknown, context = 'App'): AppError {
    if (err instanceof AppError) return err;
    if (err instanceof HttpErrorResponse) return ErrorMapper.fromHttp(err);
    if (err instanceof Error) {
      return new AppError(ErrorCodes.RUNTIME_ERROR, err.message, 0, context, err, 'error.code.unexpected');
    }
    return new AppError(ErrorCodes.UNKNOWN, String(err), 0, context, err, 'error.code.unexpected');
  }

  /** Translation key for the human-readable message — resolve with
   *  LanguageService.t() before showing to the user. Kept as `toUserMessage`
   *  (returns a string) for backward compatibility: when no server message
   *  is present, it now returns the *English* fallback resolved from the
   *  same MAP that `toUserMessageKey` uses, so existing non-DI callers keep
   *  working unchanged. New UI call sites should prefer `toUserMessageKey`
   *  and pass it through LanguageService.t(). */
  static readonly CODE_KEY_MAP: Partial<Record<ErrorCode, string>> = {
    INVALID_CREDENTIALS:  'error.code.invalid_credentials',
    ACCOUNT_LOCKED:       'error.code.account_locked',
    ACCOUNT_DISABLED:     'error.code.account_disabled',
    SESSION_EXPIRED:      'error.code.session_expired',
    NETWORK_ERROR:        'error.code.network_error',
    TOO_MANY_REQUESTS:    'error.code.too_many_requests',
    SERVER_ERROR:         'error.code.server_error',
    SERVICE_UNAVAILABLE:  'error.code.service_unavailable',
  };

  /** Translation key for the human-readable message for a given AppError. */
  static toUserMessageKey(err: AppError): string {
    return ErrorMapper.CODE_KEY_MAP[err.code] ?? err.messageKey ?? 'error.code.unexpected';
  }

  /** @deprecated kept only for any external/legacy non-DI caller — prefer
   *  toUserMessageKey() + LanguageService.t() at the UI boundary. */
  static toUserMessage(err: AppError): string {
    const MAP: Partial<Record<ErrorCode, string>> = {
      INVALID_CREDENTIALS:  'Invalid email or password.',
      ACCOUNT_LOCKED:       'Your account is temporarily locked. Please try again later.',
      ACCOUNT_DISABLED:     'Your account is disabled. Please contact support.',
      SESSION_EXPIRED:      'Your session has expired. Please sign in again.',
      NETWORK_ERROR:        'A network error occurred. Please check your connection.',
      TOO_MANY_REQUESTS:    'Too many attempts. Please wait a few minutes before trying again.',
      SERVER_ERROR:         'Something went wrong. Please try again.',
      SERVICE_UNAVAILABLE:  'Service is temporarily unavailable. Please try again shortly.',
    };
    return MAP[err.code] ?? err.message ?? 'An unexpected error occurred.';
  }
}

// ── ErrorService ──────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private readonly logger = inject(LoggerService);
  private readonly toast  = inject(ToastService);
  private readonly lang   = inject(LanguageService);

  /** Handle an error: log it and optionally show a toast */
  handle(err: unknown, context = 'App', showToast = true): AppError {
    const appErr = ErrorMapper.fromUnknown(err, context);
    this.logger.error(context, appErr.message, err);
    if (showToast && !appErr.isAuthError) {
      this.toast.error(
        this.lang.t('error.toast.generic_title'),
        this.lang.t(ErrorMapper.toUserMessageKey(appErr)),
      );
    }
    return appErr;
  }

  /** Handle silently — log only, no toast */
  handleSilent(err: unknown, context = 'App'): AppError {
    return this.handle(err, context, false);
  }
}

// ── GlobalErrorHandler ────────────────────────────────────

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(LoggerService);
  private readonly toast  = inject(ToastService);
  private readonly lang   = inject(LanguageService);

  handleError(error: unknown): void {
    const appErr = ErrorMapper.fromUnknown(error, 'Global');
    this.logger.error('GlobalErrorHandler', appErr.message, error);
    // Don't toast chunk load errors (lazy-load network issues)
    if (appErr.message?.includes('ChunkLoadError')) {
      this.toast.warning(
        this.lang.t('error.toast.update_title'),
        this.lang.t('error.toast.update_message'),
      );
      return;
    }
    if (!appErr.isAuthError && !appErr.isNetworkError) {
      this.toast.error(
        this.lang.t('error.toast.unexpected_title'),
        this.lang.t('error.toast.refresh_message'),
      );
    }
  }
}
