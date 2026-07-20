import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthActions }           from './auth.actions';
import { AuthService }           from '@core/services/auth.service';
import { ToastService }          from '@core/services/toast.service';
import { SignalRService }        from '@core/services/signalr.service';
import { DraftRecoveryService }  from '@core/services/draft-recovery.service';
import { SessionService }        from '@core/services/session.service';

@Injectable()
export class AuthEffects {
  private readonly actions$   = inject(Actions);
  private readonly authSvc    = inject(AuthService);
  private readonly toasts     = inject(ToastService);
  private readonly signalR    = inject(SignalRService);
  private readonly drafts     = inject(DraftRecoveryService);
  private readonly session    = inject(SessionService);
  private readonly router     = inject(Router);

  // ── Login ─────────────────────────────────────────────────

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ request }) =>
        this.authSvc.login(request).pipe(
          map(res => AuthActions.loginSuccess({
            user: res.data.user,
            accessToken: res.data.accessToken,
          })),
          catchError(err => of(AuthActions.loginFailure({
            error: err?.error?.message ?? 'Login failed. Please try again.',
          })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ user }) => {
        this.toasts.success(`Welcome back, ${user.firstName}!`);
        this.signalR.connect();
        const params = new URLSearchParams(window.location.search);
        const returnUrl = params.get('returnUrl') || '/app/dashboard';
        this.router.navigate([returnUrl]);
      })
    ),
    { dispatch: false }
  );

  loginFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginFailure),
      tap(({ error }) => this.toasts.error('Login Failed', error))
    ),
    { dispatch: false }
  );

  // ── Register ──────────────────────────────────────────────

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ request }) =>
        this.authSvc.register(request).pipe(
          map(res => AuthActions.registerSuccess({
            user: res.data.user,
            accessToken: res.data.accessToken,
          })),
          catchError(err => of(AuthActions.registerFailure({
            error: err?.error?.message ?? 'Registration failed. Please try again.',
          })))
        )
      )
    )
  );

  registerSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(({ user }) => {
        this.drafts.clearRegistrationDraft();
        this.toasts.success(`Welcome to AegisLex, ${user.firstName}!`);
        this.router.navigate(['/app/dashboard']);
      })
    ),
    { dispatch: false }
  );

  registerFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerFailure),
      tap(({ error }) => this.toasts.error('Registration Failed', error))
    ),
    { dispatch: false }
  );

  // ── Logout ────────────────────────────────────────────────

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.signalR.disconnect();
        // authSvc.logout() is called by AuthFacade before dispatching this action
      }),
      map(() => AuthActions.logoutSuccess())
    )
  );

  logoutSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => this.router.navigate(['/auth/login']))
    ),
    { dispatch: false }
  );

  // ── Session expired ───────────────────────────────────────

  sessionExpired$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.sessionExpired),
      tap(() => {
        this.session.clearSession();
        this.toasts.warning('Session Expired', 'Your session has expired. Please sign in again.');
        this.router.navigate(['/auth/login'], { queryParams: { reason: 'session_expired' } });
      })
    ),
    { dispatch: false }
  );
}
