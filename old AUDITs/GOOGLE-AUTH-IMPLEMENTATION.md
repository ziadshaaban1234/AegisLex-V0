# GOOGLE-AUTH-IMPLEMENTATION.md

**Date:** 2026-06-29  
**Task:** Part 3 of 3 — Implementation Guide for Future Google Authentication Activation  
**Status:** Frontend preparation complete. Backend integration pending.

---

## OVERVIEW

This document describes exactly what is already in place and exactly what steps
a backend developer (or frontend developer at activation time) must follow to
activate Google Authentication end-to-end. Nothing in this document requires
changes today. All steps below are gated behind the feature flag
`enableGoogleAuth: false` and the empty `googleClientId: ''`.

---

## WHAT IS ALREADY IMPLEMENTED (frontend — complete)

### 1. Type System
- `GoogleAuthRequest { idToken: string; deviceId?: string }` — defined in `src/app/core/models/index.ts`
- `EnvironmentConfig.googleClientId: string` — typed in `src/environments/environment.interface.ts`
- `FeatureFlagConfig.enableGoogleAuth: boolean` — typed in `src/app/core/config/app.config.ts`

### 2. Environment Configuration
- `googleClientId: ''` present in all 4 environment files (default = inactive).
- `enableGoogleAuth: false` in `DEFAULT_APP_CONFIG.featureFlags` (default = inactive).

### 3. API Endpoint Constant
- `ApiEndpoints.AUTH.GOOGLE_CALLBACK = '/auth/google/callback'` — in `src/app/core/config/api.config.ts`

### 4. AuthAdapter Extension Point
- `loginWithGoogle?(request: GoogleAuthRequest): Observable<ApiResponse<LoginResponse>>` — optional method on `AuthAdapter` interface.
- Optional (`?`) so `MockAuthAdapter` and `ProductionAuthAdapter` compile without implementing it.

### 5. Mock Implementation
- `MockAuthAdapter.loginWithGoogle()` — fully implemented. Returns a synthetic Google user with a valid `LoginResponse` shape. Simulates 1,100 ms network latency.

### 6. GoogleAuthAdapter (stub)
- `src/app/core/adapters/google-auth.adapter.ts` — exists, NOT wired to AUTH_ADAPTER.
- Contains `loginWithGoogle()` with a commented-out real HTTP call (`TODO: Uncomment when backend is ready`).
- All other AuthAdapter methods throw descriptive errors to prevent misuse.

### 7. GoogleAuthService
- `src/app/core/services/google-auth.service.ts` — fully implemented.
- In mock mode: synthesises a mock `idToken`, adds a 400 ms popup-simulation delay, calls `adapter.loginWithGoogle!()`, then pipes through the IDENTICAL session/storage pipeline as `AuthService.login()`.
- In production (future): replace the mock `idToken` block with the real Google Identity Services popup call.

### 8. EnvironmentService Getter
- `get googleClientId(): string` — delegates to `this.config.googleClientId`.

### 9. FeatureFlagService Computed Signal
- `readonly googleAuthEnabled = computed(() => this._flags().enableGoogleAuth)` — ready for use in templates.

### 10. UI Buttons
- Login page: Google Sign-In button calls `onGoogleLogin()` → `GoogleAuthService.loginWithGoogle()`.
- Register page: Google Sign-Up button calls `onGoogleSignUp()` → `GoogleAuthService.loginWithGoogle()`.
- Both buttons respect `isLoading()` and `isGoogleLoading()` guard signals.
- NOTE: Buttons are currently always visible (not gated by `googleAuthEnabled()`).
  In production, wrap with `*ngIf="featureFlagService.googleAuthEnabled()"`.

### 11. Translation Keys (English + Arabic)
- `auth.google.sign_in_with_google`
- `auth.google.sign_up_with_google`
- `auth.google.signing_in`
- `auth.google.error.generic`
- `auth.google.error.popup_closed`

### 12. CSS Styling
- `.auth-google-btn` — styled in `src/app/shared/styles/_auth-shared.scss`.
- Google brand colours applied. RTL-compatible. Responsive.

### 13. Interceptor Skip Path
- `/auth/google/callback` added to `AUTH_SKIP_PATHS` in `auth.interceptor.ts`.
- Ensures the Authorization header is NOT sent on the Google callback request
  (user is unauthenticated at this point — sending a bearer token would cause
  a server-side token validation error before the user is created).

---

## ACTIVATION STEPS (when backend is ready)

Complete these steps **in order**. Do not skip or reorder.

### Step 1 — Backend: Implement POST /auth/google/callback
See `GOOGLE-AUTH-BACKEND-CONTRACT.md` for the full contract.

Key points:
- Accept `{ "googleToken": "<Google ID token>" }` (note: field name is `googleToken` per the backend contract; the frontend sends `idToken` — align field names during implementation).
- Validate the token with Google (see contract for full validation checklist).
- Upsert the user in the database.
- Return a standard `LoginResponse` (same shape as POST /auth/login).

### Step 2 — GCP Console
1. Go to https://console.cloud.google.com
2. Create a new project (or select an existing one).
3. Enable the "Google Identity" API.
4. Navigate to APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID.
5. Application type: Web application.
6. Authorized JavaScript origins:
   - `https://yourdomain.com` (production)
   - `https://staging.yourdomain.com` (staging)
   - `http://localhost:4200` (development, if needed)
7. Authorized redirect URIs: none needed for the popup flow.
8. Copy the Client ID (public — safe to store in environment files).
9. The Client Secret stays in GCP / your backend only — NEVER in the frontend.

### Step 3 — Environment Files
Populate `googleClientId` in the relevant environment files:
```typescript
// src/environments/environment.prod.ts
googleClientId: '123456789-abc...apps.googleusercontent.com',

// src/environments/environment.staging.ts
googleClientId: '123456789-def...apps.googleusercontent.com',

// Leave environment.ts and environment.development.ts as ''
// (mock mode handles these without a real Client ID)
```

### Step 4 — Feature Flag
After steps 1–3 are verified in staging:
```typescript
// src/app/core/config/app.config.ts  (DEFAULT_APP_CONFIG)
featureFlags: {
  ...
  enableGoogleAuth: true,  // ← flip this
}
```
Or use a zero-deploy toggle:
```typescript
featureFlagService.applyRemoteFlags({ enableGoogleAuth: true });
```

### Step 5 — index.html: Load Google Identity Services SDK
```html
<!-- src/index.html — add before </body> -->
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### Step 6 — GoogleAuthAdapter: Uncomment the HTTP Call
In `src/app/core/adapters/google-auth.adapter.ts`, replace the `throwError` stub with:
```typescript
loginWithGoogle(request: GoogleAuthRequest): Observable<ApiResponse<LoginResponse>> {
  return this.http.post<ApiResponse<LoginResponse>>(
    this.urlBuilder.build(ApiEndpoints.AUTH.GOOGLE_CALLBACK),
    request
  );
}
```
Note: Align the field name (`idToken` vs `googleToken`) with the backend contract.

### Step 7 — GoogleAuthService: Replace Mock Token with Real GIS SDK Call
In `src/app/core/services/google-auth.service.ts`, replace the mock block with:
```typescript
loginWithGoogle(): Observable<ApiResponse<AuthResponse>> {
  return new Observable(observer => {
    window.google.accounts.id.initialize({
      client_id: this.envSvc.googleClientId,
      callback: (credential: { credential: string }) => {
        const req: GoogleAuthRequest = {
          idToken:  credential.credential,
          deviceId: this.deviceSvc.deviceId,
        };
        this.adapter.loginWithGoogle!(req).pipe(
          tap(res => {
            if (res.success) {
              this.sessionSvc.setSession(
                res.data.user as User,
                res.data.accessToken,
                res.data.refreshToken,
                res.data.expiresIn,
                false,
              );
              this.storageSvc.set(SESSION_USER_KEY, res.data.user, true);
            }
          }),
          map(res => res as unknown as ApiResponse<AuthResponse>),
        ).subscribe(observer);
      },
    });
    window.google.accounts.id.prompt();
  });
}
```

### Step 8 — app.config.ts: Wire GoogleAuthAdapter (optional pattern)
Current architecture uses `MockAuthAdapter.loginWithGoogle()` in mock mode,
which is already correct. In production, `ProductionAuthAdapter` does not
implement `loginWithGoogle()`, so the Google flow will fail unless you either:

**Option A** — Add `loginWithGoogle()` to `ProductionAuthAdapter`:
```typescript
loginWithGoogle(request: GoogleAuthRequest): Observable<ApiResponse<LoginResponse>> {
  return this.http.post<ApiResponse<LoginResponse>>(
    this.urlBuilder.build(ApiEndpoints.AUTH.GOOGLE_CALLBACK),
    request
  );
}
```
This is the simplest approach and the recommended one.

**Option B** — Use a composite adapter pattern (advanced):
Register `GoogleAuthAdapter` separately and have `GoogleAuthService` inject it
by class name rather than by the `AUTH_ADAPTER` token.

Option A is preferred — it keeps all production HTTP calls in `ProductionAuthAdapter`.

### Step 9 — UI: Gate Google Button with Feature Flag
In both `login.component.html` and `register.component.html`, wrap the Google
button with the feature flag:
```html
<ng-container *ngIf="featureFlagService.googleAuthEnabled()">
  <button class="auth-google-btn" ...>...</button>
</ng-container>
```
Inject `FeatureFlagService` in the component if not already injected.

---

## WHAT MUST NEVER CHANGE

- `MockAuthAdapter` — do not modify.
- `AUTH_ADAPTER` binding in `app.config.ts` — do not replace with GoogleAuthAdapter.
- `AuthService` — do not add Google-specific logic here.
- `AuthFacade` — do not add Google-specific logic here.
- `AuthEffects`, `AuthReducer`, `AuthActions`, `AuthSelectors` — do not modify.
- `auth.guard.ts`, `guest.guard.ts` — do not modify.
- Existing auth routes — do not modify.
- `SessionService`, `TokenService` — do not modify.
- Demo Mode, Mock Mode — do not remove or modify.
