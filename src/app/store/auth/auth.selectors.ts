import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

// ── Feature slice ─────────────────────────────────────────

export const selectAuthState = createFeatureSelector<AuthState>('auth');

// ── User & authentication ─────────────────────────────────

export const selectCurrentUser      = createSelector(selectAuthState, s => s.user);
export const selectIsAuthenticated  = createSelector(selectAuthState, s => !!s.user);
export const selectIsAdmin          = createSelector(selectCurrentUser, u => u?.role === 'admin');
export const selectUserRole         = createSelector(selectCurrentUser, u => u?.role ?? null);
export const selectUserFullName     = createSelector(
  selectCurrentUser,
  u => u ? `${u.firstName} ${u.lastName}` : null
);

// ── Tokens ────────────────────────────────────────────────

export const selectAccessToken      = createSelector(selectAuthState, s => s.accessToken);
export const selectRefreshToken     = createSelector(selectAuthState, s => s.refreshToken);

// ── Permissions ───────────────────────────────────────────

export const selectPermissions      = createSelector(selectAuthState, s => s.permissions);

export const selectHasPermission    = (permission: string) =>
  createSelector(selectPermissions, perms => perms.includes(permission));

export const selectHasAllPermissions = (required: string[]) =>
  createSelector(selectPermissions, perms => required.every(p => perms.includes(p)));

export const selectHasAnyPermission = (required: string[]) =>
  createSelector(selectPermissions, perms => required.some(p => perms.includes(p)));

// ── Loading & error ───────────────────────────────────────

export const selectAuthLoading      = createSelector(selectAuthState, s => s.loading);
export const selectAuthError        = createSelector(selectAuthState, s => s.error);
export const selectAuthErrorType    = createSelector(selectAuthState, s => s.errorType);

// ── Session ───────────────────────────────────────────────

export const selectSessionRestored  = createSelector(selectAuthState, s => s.sessionRestored);
export const selectSessionStatus    = createSelector(selectAuthState, s => s.sessionStatus);
export const selectRememberMe       = createSelector(selectAuthState, s => s.rememberMe);

export const selectIsSessionActive  = createSelector(
  selectSessionStatus, s => s === 'active'
);
export const selectIsSessionExpired = createSelector(
  selectSessionStatus, s => s === 'expired'
);

// ── OTP flow ──────────────────────────────────────────────

export const selectOtpEmail         = createSelector(selectAuthState, s => s.otpEmail);
export const selectResetPending     = createSelector(selectAuthState, s => s.resetPending);

// ── Lockout ───────────────────────────────────────────────

export const selectLockout          = createSelector(selectAuthState, s => s.lockout);
export const selectIsLocked         = createSelector(selectAuthState,
  s => s.lockout?.isLocked === true || s.sessionStatus === 'locked'
);
export const selectLockoutSeconds   = createSelector(
  selectLockout, l => l?.remainingSeconds ?? 0
);

// ── Composite ─────────────────────────────────────────────

export const selectAuthSummary = createSelector(
  selectCurrentUser, selectIsAuthenticated, selectPermissions,
  selectSessionStatus, selectAuthLoading, selectAuthError,
  (user, isAuth, perms, status, loading, error) => ({
    user, isAuthenticated: isAuth, permissions: perms,
    sessionStatus: status, loading, error,
  })
);
