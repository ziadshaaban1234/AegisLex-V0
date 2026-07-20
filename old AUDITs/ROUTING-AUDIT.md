# ROUTING-AUDIT.md

## Scope
Audited `src/app/app.routes.ts` (the only route table in the project) plus every guard referenced by it.

## Route table summary
| Path | Guard(s) | Target | Status |
|---|---|---|---|
| `''` | — | redirect → `/app/dashboard` | ✅ |
| `landing` | — | `LandingComponent` | ✅ |
| `auth/login` | `guestGuard` | `LoginComponent` | ✅ |
| `auth/register` | `guestGuard`, `unsavedChangesGuard` (deactivate) | `RegisterComponent` | ✅ |
| `auth/forgot-password` | — | `ForgotPasswordComponent` | ✅ |
| `auth/verify-otp` | — | `VerifyOtpComponent` | ✅ |
| `auth/reset-password` | `unsavedChangesGuard` (deactivate) | `ResetPasswordComponent` | ✅ |
| `auth` (empty) | — | redirect → `login` | ✅ |
| `app` (+ 19 children) | `authGuard` | `MainLayoutComponent` + lazy feature components | ✅ all 19 children verified |
| `app` (empty) | — | redirect → `dashboard` | ✅ |
| `**` | — | `NotFoundComponent` | ✅ |

## Verification method
Every `loadComponent: () => import('<path>').then(m => m.<ClassName>)` in the file (32 total, including the two duplicate-path chat/timeline/graph/analysis entries for optional `:id` params) was resolved programmatically against the filesystem:
- The target `.ts` file exists at the resolved relative path. ✅ 32/32
- The target file actually exports a class with the exact name referenced (`export class <ClassName>`). ✅ 32/32

No broken lazy-import paths, no missing components, no typo'd class names were found.

## Guard verification
- **`authGuard`** — checks `SessionService.isAuthenticated()`; redirects to `/auth/login` with `returnUrl` preserved via `createUrlTree`. Correctly applied to the entire `app` subtree.
- **`guestGuard`** — inverse check, redirects authenticated users to `/app/dashboard`. Correctly applied to `login` and `register` only (intentionally *not* applied to `forgot-password`/`verify-otp`/`reset-password`, which a logged-in user could plausibly still need, e.g. changing a password).
- **`unsavedChangesGuard`** — a `CanDeactivateFn` that calls `component.hasUnsavedChanges()`. Confirmed both components it's attached to (`RegisterComponent`, `ResetPasswordComponent`) implement that method.
- **`roleGuard`** / **`permissionGuard`** — both fully implemented and correctly read `route.data['roles']` / `route.data['permissions']`, but are **not currently attached to any route** because no role/permission-restricted route exists yet in the app. This is intentional prepared infrastructure, not a bug — flagging it so it isn't mistaken for dead code if a future route needs it.

## Redirects
Both default redirects (`'' → /app/dashboard` and `auth/'' → login`, `app/'' → dashboard`) use `pathMatch: 'full'` correctly, so they won't incorrectly intercept child paths.

## No issues requiring a fix
The routing layer was already correctly wired; no changes were made to `app.routes.ts` or any guard file.
