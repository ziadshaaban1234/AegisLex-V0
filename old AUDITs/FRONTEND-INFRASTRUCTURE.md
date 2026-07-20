# AegisLex — Frontend Infrastructure Guide

Complete reference for the enterprise-grade frontend architecture.
No backend required — mock adapters simulate all API calls.

---

## Folder Structure

```
src/
├── environments/
│   ├── environment.interface.ts   ← EnvironmentConfig type (single source of truth)
│   ├── environment.ts             ← Default / demo (mockMode: true)
│   ├── environment.development.ts ← Local dev against real backend
│   ├── environment.staging.ts     ← CI/CD staging environment
│   └── environment.prod.ts        ← Production
│
└── app/
    ├── core/
    │   ├── adapters/
    │   │   ├── auth.adapter.ts          ← AuthAdapter interface + AUTH_ADAPTER token
    │   │   ├── mock-auth.adapter.ts     ← In-memory mock implementation
    │   │   ├── production-auth.adapter.ts ← Real HTTP implementation
    │   │   └── index.ts                 ← Barrel export
    │   │
    │   ├── config/
    │   │   ├── api.config.ts            ← ApiEndpoints, ApiUrlBuilder, ApiConstants
    │   │   ├── app.config.ts            ← AuthConfig, UiConfig, ThemeConfig, FeatureFlagConfig
    │   │   └── route.metadata.ts        ← RouteMetadata, ROUTE_METADATA constants
    │   │
    │   ├── guards/
    │   │   ├── auth.guard.ts            ← Requires authentication
    │   │   ├── guest.guard.ts           ← Redirects authenticated users
    │   │   ├── role.guard.ts            ← route.data.roles restriction
    │   │   ├── permission.guard.ts      ← route.data.permissions restriction
    │   │   └── unsaved-changes.guard.ts ← canDeactivate: unsaved form data
    │   │
    │   ├── interceptors/
    │   │   ├── auth.interceptor.ts          ← Bearer token + X-Request-Id headers
    │   │   ├── refresh-token.interceptor.ts ← 401 handling + silent refresh + queue
    │   │   └── error.interceptor.ts         ← Maps HTTP errors to AppError
    │   │
    │   ├── models/
    │   │   └── index.ts             ← All API contracts, DTOs, domain models
    │   │
    │   ├── mock/
    │   │   ├── mock.service.ts      ← Centralized mock data factory
    │   │   └── mock-data.ts         ← Static mock datasets
    │   │
    │   └── services/
    │       ├── analytics.service.ts         ← Event/page tracking (stub for SDK)
    │       ├── api-client.service.ts        ← Typed HTTP wrapper + request metadata
    │       ├── auth.service.ts              ← Auth operations → delegates to adapter
    │       ├── auth-facade.service.ts       ← Single public API for components
    │       ├── cache/
    │       │   └── cache.service.ts         ← Memory + persistent cache with TTL
    │       ├── device.service.ts            ← DeviceId generation + fingerprint
    │       ├── draft-recovery.service.ts    ← Safe form draft persistence
    │       ├── environment.service.ts       ← Typed environment access
    │       ├── error.service.ts             ← AppError, ErrorMapper, GlobalErrorHandler
    │       ├── feature-flag.service.ts      ← Signal-based feature flags
    │       ├── loading.service.ts           ← Page/section/request loading state
    │       ├── logger.service.ts            ← Environment-aware logging
    │       ├── modal/
    │       │   └── modal.service.ts         ← ModalService, ConfirmDialog, AlertDialog
    │       ├── otp-state.service.ts         ← OTP flow state management
    │       ├── performance.service.ts       ← Request/page timing (Web Vitals)
    │       ├── permission.service.ts        ← RBAC permission checks
    │       ├── registration-state.service.ts ← Multi-step registration state
    │       ├── reset-password-state.service.ts ← Reset flow state
    │       ├── role.service.ts              ← Role metadata and display
    │       ├── session.service.ts           ← Session lifecycle + expiry
    │       ├── signalr.service.ts           ← Real-time connection
    │       ├── storage.service.ts           ← Typed localStorage/sessionStorage wrapper
    │       ├── theme.service.ts             ← Dark/light mode persistence
    │       ├── toast.service.ts             ← Success/error/warning notifications
    │       └── token.service.ts             ← Token storage, expiry, JWT decode
    │
    ├── store/
    │   ├── app.state.ts             ← Root NgRx state shape
    │   └── auth/
    │       ├── auth.actions.ts      ← All auth action groups
    │       ├── auth.reducer.ts      ← AuthState with session/lockout/OTP
    │       ├── auth.selectors.ts    ← All selectors including computed
    │       └── auth.effects.ts      ← Side-effects (navigation, toasts, SignalR)
    │
    └── shared/
        ├── auth-components/
        │   ├── auth-validators.ts           ← All validators + EMAIL_REGEX (single source)
        │   ├── auth-error.component.ts
        │   ├── auth-loading-button.component.ts
        │   ├── password-requirements.component.ts
        │   └── password-strength.component.ts
        └── styles/
            └── _auth-shared.scss            ← Auth design system (shared across all pages)
```

---

## Environment System

### How to use

Never import `environment` directly in services or components.
Inject `EnvironmentService` instead:

```typescript
@Injectable({ providedIn: 'root' })
export class MyService {
  private readonly env = inject(EnvironmentService);

  doSomething(): void {
    if (this.env.mockMode) { /* use mock */ }
    const url = this.env.apiRoot; // https://api.aegislex.com/api/v1
  }
}
```

### Environment files

| File | Used when | mockMode | Debug logs |
|------|-----------|----------|------------|
| `environment.ts` | Default / `ng serve` | ✅ | ✅ |
| `environment.development.ts` | `--configuration=development` | ✅ | ✅ |
| `environment.staging.ts` | `--configuration=staging` | ❌ | ✅ |
| `environment.prod.ts` | `ng build --configuration=production` | ❌ | ❌ |

### Adding a new environment variable

1. Add the property to `EnvironmentConfig` in `environment.interface.ts`
2. Add the value to **all four** environment files
3. Access via `EnvironmentService.myNewProperty`
4. TypeScript compiler enforces completeness across all files

### Forward-compatibility fields (infrastructure prep pass)

Three fields were added to `EnvironmentConfig` purely to prepare for future
backend/AI integration. They are wired into `EnvironmentService` the same
way as every other field, but **nothing currently reads them** — adding
them changes no runtime behavior.

| Field | Purpose | Today's value |
|---|---|---|
| `websocketUrl` | Raw WebSocket endpoint, separate from the SignalR hub, for a transport that doesn't go through SignalR | Empty in default/mock, `ws(s)://…/ws` placeholder elsewhere |
| `fileUploadUrl` | Alternate upload target (CDN / object storage) if uploads are ever moved off the main API | Empty everywhere — uploads keep using `apiBaseUrl` + `ApiEndpoints.DOCUMENTS.UPLOAD` |
| `enableDemoMode` | Marks a build as a public demo build | Mirrors `mockMode` today; not yet read by the login page's demo banner, which remains unconditional |

Three other concepts from the original infra-prep checklist were deliberately
**not** added as new fields, to avoid duplicating values that already exist
elsewhere in the codebase:

- **"aiBaseUrl"** → already covered by `saulBaseUrl` (Saul is the AI
  assistant; a second field with the same value would violate the
  no-duplicate-environment-values rule).
  > **2026-06-23 update:** a later pass (see
  > `GROK-GEMINI-INTEGRATION-AUDIT.md` §11) added `aiBaseUrl` after all,
  > for a different reason than what this section assumed — it's a
  > broader multi-feature AI gateway field, not a duplicate of
  > `saulBaseUrl`. This bullet is left as-is for historical accuracy;
  > see that document for the current state.
- **"enableMockMode"** → already covered by `mockMode`.
- **Environment-level `featureFlags`** → already covered, more richly, by
  `FeatureFlagConfig` in `src/app/core/config/app.config.ts` (10 flags vs.
  a flat per-environment object). Duplicating it in `environment.*.ts`
  would create two sources of truth.

---

## API Architecture

### Endpoint definitions

All endpoint paths live in `ApiEndpoints` in `src/app/core/config/api.config.ts`.
**Never hardcode endpoint strings in feature modules.**

```typescript
// ✅ Correct
const path = ApiEndpoints.CASES.DETAIL(caseId);
const url  = this.urlBuilder.build(path);

// ❌ Wrong
const url = `${environment.apiUrl}/cases/${caseId}`;
```

### URL builder

`ApiUrlBuilder.build(path)` prepends `environment.apiRoot` (baseUrl + version).
In mock mode, returns the relative path unchanged.

---

## Adapter Architecture

The `AuthAdapter` interface is the contract between the application and any auth backend.

```
AUTH_ADAPTER token
  │
  ├── MockAuthAdapter       ← current (environment.mockMode = true)
  └── ProductionAuthAdapter ← ready (real HttpClient calls)
```

### Switching to production

In `app.config.ts`, change **one line**:

```typescript
// Before (mock):
{ provide: AUTH_ADAPTER, useClass: MockAuthAdapter }

// After (production):
{ provide: AUTH_ADAPTER, useClass: ProductionAuthAdapter }
```

Zero changes required in any component, guard, or effect.

---

## Feature Flag System

Feature flags control whether features are visible/active.

```typescript
// In a component:
readonly aiEnabled = inject(FeatureFlagService).aiEnabled; // Signal<boolean>

// In a template:
@if (aiEnabled()) { <app-ai-panel/> }
```

### Flag priority (highest → lowest)

1. Remote override (future backend, applied via `applyRemoteFlags()`)
2. Default config in `DEFAULT_APP_CONFIG.featureFlags`

### Available flags

| Flag | Default | Purpose |
|------|---------|---------|
| `enableAiModule` | `true` | AI chat and analysis features |
| `enableNotifications` | `true` | Real-time notifications |
| `enableReports` | `true` | Report generation |
| `enableAdvancedAnalytics` | `true` | Advanced analytics dashboard |
| `enableAuditLogs` | `false` | Admin audit log viewer |
| `enableMockAuth` | `true` | Mock authentication |
| `enableDeviceManagement` | `false` | Trusted device management |
| `enableTwoFactor` | `false` | 2FA flows |
| `enableExportPdf` | `true` | PDF export |
| `enableBulkOperations` | `false` | Bulk case/document operations |

---

## State Architecture

### NgRx Auth State (`AuthState`)

| Field | Type | Purpose |
|-------|------|---------|
| `user` | `User \| null` | Current authenticated user |
| `accessToken` | `string \| null` | JWT access token |
| `refreshToken` | `string \| null` | JWT refresh token |
| `permissions` | `string[]` | Derived from user role |
| `loading` | `boolean` | Auth operation in progress |
| `error` | `string \| null` | Last error message |
| `errorType` | `AuthErrorType` | Typed error classification |
| `rememberMe` | `boolean` | Persist session across browser restarts |
| `sessionRestored` | `boolean` | True after successful rehydration |
| `sessionStatus` | `SessionStatus` | `idle\|active\|restoring\|expired\|locked\|terminated` |
| `lockout` | `LockoutInfo \| null` | Account lockout state |
| `otpEmail` | `string \| null` | Email currently in OTP flow |
| `resetPending` | `boolean` | OTP verified, awaiting password reset |

### Key selectors

```typescript
selectCurrentUser       // User | null
selectIsAuthenticated   // boolean
selectPermissions       // string[]
selectSessionStatus     // SessionStatus
selectLockout           // LockoutInfo | null
selectIsLocked          // boolean
selectOtpEmail          // string | null
selectHasPermission('read:cases')  // boolean (parametrised)
```

---

## Storage Architecture

### StorageService

Use `StorageService` instead of `localStorage` directly:

```typescript
const storage = inject(StorageService);
storage.set('my-key', { data: 123 }, true);      // persistent
storage.get<MyType>('my-key');                    // typed get
storage.setString('simple', 'value');             // raw string
storage.clearAuthStorage();                       // clears all aegislex_* keys
```

### CacheService

HTTP response caching with TTL:

```typescript
const cache = inject(CacheService);
cache.set('cases-list', data, 5 * 60_000);       // 5-min TTL
cache.get<Case[]>('cases-list');                  // returns null if expired
cache.invalidate('cases-');                       // clears all 'cases-*' keys
cache.clearAll();                                 // call on logout
```

---

## Error Handling

All errors flow through `ErrorService` or `GlobalErrorHandler`:

```typescript
// In a service:
const errorSvc = inject(ErrorService);
this.http.get(...).pipe(
  catchError(err => {
    errorSvc.handle(err, 'CasesService');   // logs + shows toast
    return throwError(() => err);
  })
);

// Map HTTP error manually:
const appErr = ErrorMapper.fromHttp(httpErr);
console.log(appErr.code);     // 'NOT_FOUND'
console.log(appErr.message);  // 'Resource not found.'
console.log(appErr.isNetworkError); // false
```

---

## Logging

```typescript
const logger = inject(LoggerService);
logger.debug('MyService', 'Loading cases', { count: 5 });  // dev only
logger.info('MyService', 'Cases loaded');
logger.warn('MyService', 'Cache miss for key', key);
logger.error('MyService', 'Failed to load', err);          // always + error tracker
```

Debug and info logs are suppressed in production automatically.

---

## Analytics

```typescript
const analytics = inject(AnalyticsService);
analytics.init();                           // call once from AppComponent.ngOnInit
analytics.identify(userId, { role });       // call after login
analytics.trackLogin('email');
analytics.trackFeatureUse('ai-analysis', 'run');
analytics.reset();                          // call after logout
```

No SDK is integrated — add Mixpanel / Segment / GA4 to the stub bodies in
`analytics.service.ts` when `environment.enableAnalytics = true`.

---

## Backend Integration Process

When the backend is ready, follow this checklist:

1. **Environment files** — set `apiBaseUrl`, `saulBaseUrl`, `signalRUrl` in `environment.staging.ts` and `environment.prod.ts`. Set `mockMode: false`.

2. **Adapter** — in `app.config.ts` change `MockAuthAdapter` → `ProductionAuthAdapter` (one line).

3. **Feature HTTP services** — for each feature, replace `MockService` calls with `ApiClient.get/post` using `ApiEndpoints.*`.

4. **Auth interceptors** — `RefreshTokenInterceptor` already queues requests. Replace the `of({ accessToken: ... })` stub with a real `HttpClient.post(ApiEndpoints.AUTH.REFRESH_TOKEN)` call.

5. **Permissions** — replace `derivePermissions()` in `auth.reducer.ts` with the `permissions` array returned by the backend login response.

6. **Feature flags** — call `FeatureFlagService.loadRemoteFlags()` in `AppComponent.ngOnInit()` to fetch remote overrides.

No component changes are required for any of these steps.

---

## Extension Points

| Need | Where to add |
|------|-------------|
| New API endpoint | `ApiEndpoints` in `api.config.ts` |
| New environment variable | `EnvironmentConfig` + all 4 env files + `EnvironmentService` getter |
| New feature flag | `FeatureFlagConfig` + `DEFAULT_APP_CONFIG.featureFlags` + `FeatureFlagService` computed |
| New permission | `PERMISSIONS` in `permission.service.ts` + role map |
| New auth error code | `ErrorCodes` + `ErrorMapper.toUserMessage()` |
| New modal type | `ModalType` union + `ModalService.open()` call |
| New route with permissions | `routes` + `data: routeMeta({ permissions: [...] })` |
| New NgRx state field | `AuthState` + `auth.actions.ts` + `auth.reducer.ts` + `auth.selectors.ts` |
