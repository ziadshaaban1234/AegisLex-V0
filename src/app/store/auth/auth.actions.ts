import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User, LoginRequest, RegisterRequest, LockoutInfo } from '@core/models';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // ── Auth flows ───────────────────────────────────────────
    'Login':                    props<{ request: LoginRequest }>(),
    'Login Success':            props<{ user: User; accessToken: string }>(),
    'Login Failure':            props<{ error: string }>(),

    'Register':                 props<{ request: RegisterRequest }>(),
    'Register Success':         props<{ user: User; accessToken: string }>(),
    'Register Failure':         props<{ error: string }>(),

    'Logout':                   emptyProps(),
    'Logout Success':           emptyProps(),

    // Side-effect-free state sync — used by flows (e.g. login.component.ts)
    // that manage their own navigation/toast/SignalR side effects directly
    // and only need the NgRx AuthState slice kept in sync, without
    // triggering loginSuccess$'s tap() (which would double-navigate/toast).
    'Session Synced':           props<{ user: User; accessToken: string }>(),

    'Update User':              props<{ user: User }>(),

    // ── Token refresh ─────────────────────────────────────────
    'Refresh Token Success':    props<{ accessToken: string }>(),
    'Refresh Token Failure':    emptyProps(),

    // ── Session lifecycle ─────────────────────────────────────
    'Session Restored':         emptyProps(),
    'Session Expired':          emptyProps(),

    // ── OTP flow ──────────────────────────────────────────────
    'Otp Sent':                 props<{ email: string }>(),
    'Otp Verified':             emptyProps(),
    'Otp Cleared':              emptyProps(),

    // ── Account lockout ───────────────────────────────────────
    'Set Lockout':              props<{ lockout: LockoutInfo }>(),
    'Clear Lockout':            emptyProps(),
  },
});
