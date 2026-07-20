import { createReducer, on } from '@ngrx/store';
import { User, LockoutInfo } from '@core/models';
import { AuthActions } from './auth.actions';
import { TOKEN_STORAGE_KEYS } from '@core/services/token.service';
import { SESSION_USER_KEY }  from '@core/services/session.service';

// ── Error type ────────────────────────────────────────────

export type AuthErrorType =
  | 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'ACCOUNT_DISABLED'
  | 'EMAIL_ALREADY_EXISTS' | 'NETWORK_ERROR' | 'SERVER_ERROR'
  | 'TOO_MANY_REQUESTS' | null;

// ── Session status ────────────────────────────────────────

export type SessionStatus =
  | 'idle'        // no user, no attempt
  | 'active'      // authenticated, token valid
  | 'restoring'   // rehydrating from storage on app load
  | 'expired'     // token expired, attempting refresh
  | 'refreshing'  // silent refresh in progress
  | 'locked'      // account locked
  | 'terminated'; // explicitly logged out

// ── State shape ───────────────────────────────────────────

export interface AuthState {
  user:            User | null;
  accessToken:     string | null;
  refreshToken:    string | null;
  permissions:     string[];
  loading:         boolean;
  error:           string | null;
  errorType:       AuthErrorType;
  rememberMe:      boolean;
  sessionRestored: boolean;
  sessionStatus:   SessionStatus;
  lockout:         LockoutInfo | null;
  otpEmail:        string | null;     // email currently in OTP flow
  resetPending:    boolean;           // OTP verified, awaiting password reset
}

// ── Session rehydration ───────────────────────────────────
// ARCHITECTURAL EXCEPTION: reducers are pure functions with no DI context,
// so TokenService/SessionService cannot be injected here. This reads
// localStorage directly ONLY to compute the initial state synchronously
// (required for SSR-safe rehydration before the app bootstraps). The key
// NAMES are still centralized — imported from TOKEN_STORAGE_KEYS and
// SESSION_USER_KEY rather than re-typed as magic strings, so there is
// only ever one place where these key names are defined.

export function loadPersistedAuth(): Partial<AuthState> {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS);
    const raw   = localStorage.getItem(SESSION_USER_KEY);
    const user  = raw ? (JSON.parse(raw) as User) : null;
    return { accessToken: token, user };
  } catch { return {}; }
}

const persisted = loadPersistedAuth();

// ── Permissions derivation (mock until backend integration) ─

export function derivePermissions(user: User | null): string[] {
  if (!user) return [];
  const base = ['read:dashboard', 'read:cases', 'read:documents'];
  switch (user.role) {
    case 'admin':
      return [
        ...base,
        'write:cases', 'delete:cases',
        'write:documents', 'delete:documents',
        'write:reports', 'delete:reports',
        'read:analysis', 'read:reports', 'read:users',
        'manage:users', 'write:settings', 'view:audit_log',
      ];
    case 'lawyer':
      return [...base, 'write:cases', 'write:documents', 'write:reports', 'read:analysis', 'read:reports'];
    case 'analyst':
      return [...base, 'write:documents', 'read:analysis', 'read:reports'];
    default: // viewer
      return base;
  }
}

// ── Initial state ─────────────────────────────────────────

const initialState: AuthState = {
  user:            persisted.user    ?? null,
  accessToken:     persisted.accessToken ?? null,
  refreshToken:    null,
  permissions:     derivePermissions(persisted.user ?? null),
  loading:         false,
  error:           null,
  errorType:       null,
  rememberMe:      false,
  sessionRestored: !!persisted.user,
  sessionStatus:   persisted.user ? 'restoring' : 'idle',
  lockout:         null,
  otpEmail:        null,
  resetPending:    false,
};

// ── Reducer ───────────────────────────────────────────────

export const authReducer = createReducer(
  initialState,

  // ── Login / Register (loading start) ─────────────────────
  on(AuthActions.login, AuthActions.register, (state, action) => ({
    ...state,
    loading:       true,
    error:         null,
    errorType:     null,
    sessionStatus: 'idle' as SessionStatus,
    rememberMe:    'request' in action &&
                   (action.request as { rememberMe?: boolean }).rememberMe === true,
  })),

  // ── Login / Register success (and side-effect-free session sync) ────────
  on(AuthActions.loginSuccess, AuthActions.registerSuccess, AuthActions.sessionSynced, (state, { user, accessToken }) => ({
    ...state,
    user,
    accessToken,
    permissions:     derivePermissions(user),
    loading:         false,
    error:           null,
    errorType:       null,
    sessionRestored: false,
    sessionStatus:   'active' as SessionStatus,
    lockout:         null,
  })),

  // ── Login failure ─────────────────────────────────────────
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading:       false,
    error,
    errorType:     (
      error?.includes('locked')   ? 'ACCOUNT_LOCKED'   :
      error?.includes('disabled') ? 'ACCOUNT_DISABLED' :
      'INVALID_CREDENTIALS'
    ) as AuthErrorType,
    sessionStatus: error?.includes('locked') ? 'locked' as SessionStatus : state.sessionStatus,
  })),

  // ── Register failure ──────────────────────────────────────
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading:   false,
    error,
    errorType: (error?.includes('exists') ? 'EMAIL_ALREADY_EXISTS' : 'SERVER_ERROR') as AuthErrorType,
  })),

  // ── Logout ────────────────────────────────────────────────
  on(AuthActions.logoutSuccess, () => ({
    ...initialState,
    user:          null,
    accessToken:   null,
    refreshToken:  null,
    permissions:   [],
    sessionRestored: false,
    sessionStatus: 'terminated' as SessionStatus,
    lockout:       null,
    otpEmail:      null,
    resetPending:  false,
  })),

  // ── Update user profile ───────────────────────────────────
  on(AuthActions.updateUser, (state, { user }) => ({
    ...state,
    user,
    permissions: derivePermissions(user),
  })),

  // ── Token refresh success ─────────────────────────────────
  on(AuthActions.refreshTokenSuccess, (state, { accessToken }) => ({
    ...state,
    accessToken,
    error:         null,
    errorType:     null,
    sessionStatus: 'active' as SessionStatus,
  })),

  // ── Token refresh failure → force logout ──────────────────
  on(AuthActions.refreshTokenFailure, () => ({
    ...initialState,
    user:          null,
    accessToken:   null,
    refreshToken:  null,
    permissions:   [],
    sessionRestored: false,
    sessionStatus: 'expired' as SessionStatus,
    lockout:       null,
    otpEmail:      null,
    resetPending:  false,
  })),

  // ── Session restored (after rehydration completes) ────────
  on(AuthActions.sessionRestored, (state) => ({
    ...state,
    sessionRestored: true,
    sessionStatus:   state.user ? 'active' as SessionStatus : 'idle' as SessionStatus,
  })),

  // ── OTP flow ──────────────────────────────────────────────
  on(AuthActions.otpSent, (state, { email }) => ({
    ...state, otpEmail: email, resetPending: false,
  })),

  on(AuthActions.otpVerified, (state) => ({
    ...state, resetPending: true,
  })),

  on(AuthActions.otpCleared, (state) => ({
    ...state, otpEmail: null, resetPending: false,
  })),

  // ── Lockout ───────────────────────────────────────────────
  on(AuthActions.setLockout, (state, { lockout }) => ({
    ...state,
    lockout,
    sessionStatus: lockout.isLocked ? 'locked' as SessionStatus : state.sessionStatus,
  })),

  on(AuthActions.clearLockout, (state) => ({
    ...state, lockout: null,
    sessionStatus: 'idle' as SessionStatus,
  })),
);
