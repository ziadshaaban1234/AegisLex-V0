# AUTHENTICATION-AUDIT.md

## Architecture overview
- `AuthAdapter` (interface, `core/adapters/auth.adapter.ts`) defines every auth operation: `login`, `register`, `forgotPassword`, `verifyOtp`, `resetPassword`, `refreshToken`, `logout`, `getCurrentUser`.
- `MockAuthAdapter` and `ProductionAuthAdapter` both fully implement the interface.
- `app.config.ts` provides `AUTH_ADAPTER` and currently points both the mock and "production" branches at `MockAuthAdapter`, with a clearly commented one-line switch to flip to `ProductionAuthAdapter` once a real backend exists. This is intentional, documented, and working as designed.
- `SessionService` + `TokenService` + `StorageService` form a consistent storage layer: all key names (`aegislex_access_token`, `aegislex_refresh_token`, `aegislex_token_expiry`, `aegislex_user`, `aegislex_reg_draft`, `aegislex_otp_state`, `aegislex_reset_verified`, `aegislex_otp_email`, `aegislex_device_id`) are defined once and referenced identically everywhere, including in `StorageService.clearAuthStorage()`'s cleanup list. No mismatched or orphaned keys were found.

## Flow-by-flow verification

### Login ✅ fully wired through the adapter
`LoginComponent` → `store.dispatch(AuthActions.login(...))` → `AuthEffects.login$` → `AuthService` → `AUTH_ADAPTER` (`MockAuthAdapter.login`) → `loginSuccess`/`loginFailure` → toast + SignalR connect + `returnUrl`-aware redirect. `guestGuard` correctly prevents an already-authenticated user from reaching this page.

### Register ✅ fully wired through the adapter
Same store→effects→adapter pipeline as login, dispatched via `AuthActions.register(...)`. `unsavedChangesGuard` correctly blocks accidental navigation away from a partially-filled form (`hasUnsavedChanges()` is implemented).

### Remember Me ✅
`SessionService.setSession(...)` forwards the `rememberMe` flag into `TokenService.setTokens(access, refresh, expiresIn, persistent)`, which stores in `localStorage` when persistent and `sessionStorage` otherwise (mirroring the access token into `localStorage` either way "for guard compatibility in demo mode" — a deliberate, commented decision, not a bug).

### Logout ✅
Sidebar logout button calls through `AuthFacade`/`SessionService.clearSession()`, which clears tokens, auth storage, and the user signal, matching the storage keys defined above.

### Session Restore ✅
`SessionService` initializes `userSignal` from `StorageService.get<User>('aegislex_user')` in its constructor and exposes a `sessionRestored` signal — consistent rehydration on app reload.

### Refresh Token Flow ✅ (mock-correct)
`refresh-token.interceptor.ts` catches `401`s, queues concurrent requests via a `BehaviorSubject`, and (in mock mode) issues a synthetic refreshed token. Falls back to `session.handleExpiredSession()` (clear + redirect to login with `reason=session_expired`) if no refresh token exists or the refresh itself fails. Logic is sound for a mock environment; the real network call is a clearly marked `TODO`.

### Auth Guards / Role / Permission Protection ✅
Covered in `ROUTING-AUDIT.md`. `authGuard` and `guestGuard` are live and correct; `roleGuard`/`permissionGuard` are implemented and ready but unattached (no role-gated route exists yet — intentional).

### Forgot Password / OTP / Reset Password ⚠️ finding (not a bug, but worth flagging)
These three pages work correctly as a **self-contained local demo flow**: `ForgotPasswordComponent` → `DraftRecoveryService`/`sessionStorage` (`aegislex_otp_email`) → `VerifyOtpComponent` (hard-codes the same demo code, `123456`, as `MockAuthAdapter.verifyOtp`) → `OtpStateService` (`aegislex_reset_verified`) → `ResetPasswordComponent` → success → `/auth/login`.

However, **none of the three actually calls through `AUTH_ADAPTER`** — each has a `// In real app: authService.forgotPassword(email)` / `// In real app: authService.resetPassword(token, password)` style comment instead of an actual call. This means `MockAuthAdapter.forgotPassword`, `.verifyOtp`, and `.resetPassword` (and their `ProductionAuthAdapter` counterparts) are fully implemented but currently **unused dead code from the UI's perspective**. Functionally the demo still works end-to-end (the OTP code is kept in sync between both places), but it means that — unlike login/register — switching `AUTH_ADAPTER` to `ProductionAuthAdapter` at backend go-live will **not** automatically wire up real forgot-password/OTP/reset-password calls; those three components would need to be updated to call the adapter, contrary to the "zero other changes" goal stated in `app.config.ts`'s comments.

This was **not changed** in this pass — rewiring three components' control flow to call a different abstraction is an architectural change with real regression risk, not a confirmed bug fix, so per the "if uncertain, do not modify" rule it's left as a flagged finding for you to decide on rather than something silently altered.

## Mock Mode vs. "Production Ready" Mode
- `environment.mockMode` is `true` in `environment.ts`/`environment.development.ts` and `false` in `environment.prod.ts`/`environment.staging.ts`.
- `authInterceptor` and `refreshTokenInterceptor` both branch on `environment.mockMode` to decide whether to attach bearer tokens / attempt real refresh calls.
- Because `AUTH_ADAPTER` is hard-wired to `MockAuthAdapter` regardless of `mockMode` (by explicit design, per the comment in `app.config.ts`), a staging/production build today would have `mockMode: false` (so interceptors behave as if hitting a real API) while still actually talking to the in-memory mock adapter. This is consistent with the documented "no backend yet" interim state and is not flagged as a bug — just noted here for visibility before any real staging deploy.

## Summary
Login, Register, Remember Me, Logout, Session Restore, Refresh Token, and all route guards are correctly implemented and verified. Forgot Password / OTP / Reset Password work as a local demo but are not yet wired through the shared `AuthAdapter` abstraction — flagged as a finding, not silently changed.
