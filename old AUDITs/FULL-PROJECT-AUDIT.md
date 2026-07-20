# AegisLex — Full Project Audit

**Scope of this pass:** read-only. No files were modified. Every finding
below was traced through actual source code (file open, exact lines
quoted/referenced) — nothing here is inferred from file names or doc
comments alone. Where I could not verify something from source (mainly:
actual rendered layout at specific pixel widths, since this sandbox has
no browser/screenshot capability), I say so explicitly instead of
guessing.

**What was read:** all 109 `.ts` files in `src/app` (every guard,
interceptor, adapter, service, store file, config file — full text, not
samples), all NgRx reducers/effects/selectors, `app.config.ts`,
`app.routes.ts`, `main.ts`, `index.html`. All 30 `.html` templates and 31
`.scss` files were swept with targeted, verifiable greps for the specific
categories below (trackBy, subscriptions, `innerHTML`, event listeners,
`alt`/`aria-label`, media-query breakpoints), and every file a grep
flagged was opened and read in full before being included as a finding.
Files that produced no hits for a category are reported as
**"Verified – no change required"** for that category, not silently
skipped.

**What this pass could NOT verify:** actual rendered layout in a browser
at 320–1440px (no network/browser tooling in this sandbox — see
breakpoint inventory in §1, which is a source-level check only), and a
real `ng build`/`ng test` (no `node_modules`, no network — same
limitation as the previous infra-prep pass).

No fixes were applied in this pass. Every item below lists a proposed fix
and a risk level; nothing was touched, per Rule #1 and Rule #3.

---

## Executive summary

The codebase is well-architected overall — typed models, a real
swappable auth-adapter pattern, NgRx for auth/cases/notifications,
consistent mock-delay simulation, and (for the most part) thoughtful
inline documentation of known tradeoffs. The issues found are almost
entirely about **wiring**, not about broken individual units: several
well-built pieces of infrastructure (permission/role guards, route
metadata, an unread-count API, a full bilingual dictionary) were built
correctly but never connected to the place that should call them, and
three of the five auth flows quietly bypass the adapter architecture
that the other two correctly use.

Highest-value findings, in order of significance:

1. **Three auth flows (forgot-password, verify-otp, reset-password) never call the AuthAdapter** — switching to `ProductionAuthAdapter` would not change their behavior. (§2.1)
2. **`permissionGuard`/`roleGuard` are fully implemented but wired into zero routes** — there is currently no route-level permission/role enforcement anywhere in the app. (§2.2)
3. **Unread-notification count has three disconnected sources of truth**, one of which silently discards its result. (§2.3)
4. **"Remember me" unchecked doesn't actually end the session on browser close** — by design for the demo, but worth a deliberate decision before backend go-live. (§2.4)
5. **Switching the language to Arabic flips the whole page to RTL with `lang="ar"`, but no UI text changes** — the translation dictionary is built but never called. (§4.1)

Everything else is lower-severity (duplicated logic, unused-but-harmless
prepared infrastructure, missing `trackBy`, two cosmetic gaps).

---

## 1. Responsiveness

**Source-level inventory (verified):** 31 SCSS files contain 144 `max-width`
media queries and 5 `min-width` queries. Breakpoint values in use, with
hit counts: 320(4), 360(4), 375(2), 380(3), 400(1), **480(32)**, 500(1),
**640(26)**, **768(30)**, 900(8), **1024(24)**, 1100(1), 1200(3),
1280(3). `prefers-reduced-motion` is also respected (2 hits).

This covers most of the requested test widths directly (320, 360, 375,
480, 768, 1024, 1280) via exact-match breakpoints. The requested 390,
412, 430, and 1440 don't have a dedicated breakpoint, but each falls
inside an existing range (e.g. 390–430 all inherit whatever is set at
the 480px-and-below tier) — that's a normal, common pattern, not
automatically a bug.

**Honest limitation:** I cannot render the app in a browser in this
sandbox, so I cannot confirm what these rules actually look like at each
pixel width — only that the CSS source is structured with broad,
sensible tiers and no obvious gaps (e.g. no component with zero
responsive rules at all — every feature SCSS file has at least one media
query). Claiming a pixel-by-pixel visual verification would not be true.
**If you want actual rendering verification, that needs to happen in a
real browser/device lab** — I'd recommend that as a follow-up rather
than trusting a source-only read for this category.

**Verified – no change required** at the source level: no component
SCSS file was found with zero responsive rules.

---

## 2. Backend / state-management readiness — the real findings

### 2.1 Three of five auth flows never reach the AuthAdapter
- **Root cause:** `forgot-password.component.ts`, `verify-otp.component.ts`, and `reset-password.component.ts` each implement their own local `setTimeout(...)`-based fake submission instead of calling `AuthFacade`/`AuthService`/`AUTH_ADAPTER`. `AuthFacade.forgotPassword()`, `.verifyOtp()`, and `.resetPassword()` (in `auth-facade.service.ts`) also don't call the adapter — they only touch local state services. `MockAuthAdapter.forgotPassword()/.verifyOtp()/.resetPassword()` (fully implemented, correct) are consequently never invoked by anything.
- **Exact files / lines:**
  - `src/app/features/auth/forgot-password/forgot-password.component.ts:56-62` (comment: `// In real app: authService.forgotPassword(email)`)
  - `src/app/features/auth/verify-otp/verify-otp.component.ts:130-150` (`submitOtp()`, hardcoded `code === '123456'`)
  - `src/app/features/auth/reset-password/reset-password.component.ts:76-83` (comment: `// In real app: authService.resetPassword(token, password)`)
  - `src/app/core/services/auth-facade.service.ts:122-145` (`forgotPassword()`, `verifyOtp()`, `resetPassword()` methods)
  - Confirmed via `src/app/store/auth/auth.actions.ts` and `auth.effects.ts`: there is no `ForgotPassword`/`VerifyOtp`/`ResetPassword` *request* action with an effect — only `Login`/`Register` have a full action → effect → adapter pipeline.
- **Risk level:** Medium-High for backend readiness (not a live bug — the demo works correctly today).
- **Why it's real:** The adapter-swap design explicitly promises "switch one provider in `app.config.ts`, zero component changes." That promise is true for login/register and false for these three flows — flipping to `ProductionAuthAdapter` would not make password-reset or OTP verification hit a real backend; they'd keep "succeeding" locally forever.
- **Proposed fix:** Wire these three components to `AuthFacade`/`AuthService` the same way `login.component.ts` does (direct service call + `tap`), or add `ForgotPassword`/`VerifyOtp`/`ResetPassword` actions + effects mirroring `login$`/`register$`. The OTP digit-box UX, countdown timer, and paste handling in `verify-otp.component.ts` are independent of this and don't need to change.
- **Why a fix is NOT applied here:** Real regression risk — these are the most form-heavy, state-machine-heavy components in the app (digit focus management, draft recovery, countdown timers, multi-step validation). I can't run `ng build`/`ng test` in this sandbox to confirm a refactor doesn't break them. This should be done as its own focused, reviewable change.

### 2.2 `permissionGuard` and `roleGuard` are implemented but wired into zero routes
- **Root cause:** Both guards are correct, complete implementations. `route.metadata.ts` defines a full `ROUTE_METADATA` map with `permissions`/`roles` per route. But `app.routes.ts` never imports `permissionGuard`, `roleGuard`, `ROUTE_METADATA`, or `routeMeta()`, and no route has a `data:` property at all.
- **Exact files:** `src/app/core/guards/permission.guard.ts`, `src/app/core/guards/role.guard.ts`, `src/app/core/config/route.metadata.ts` (defined, unused) vs. `src/app/app.routes.ts` (87 lines, only `authGuard`/`guestGuard`/`unsavedChangesGuard` are referenced).
- **Risk level:** Medium for security/backend-readiness (not exploitable today — `PermissionService`/`RoleService` correctly gate *UI elements*, e.g. hiding buttons; this is about *route-level* access, a defense-in-depth layer that's currently absent).
- **Why it's real:** Today, any authenticated user (any role) can navigate directly to any `/app/*` URL — there is no server, so this isn't a live data-exposure risk yet, but it means the role/permission model only exists in the UI layer, not the routing layer, which is the opposite of what `permission.guard.ts`'s own doc comment describes as its purpose.
- **Proposed fix:** Add `data: routeMeta({ permissions: [...] })` to the relevant route entries in `app.routes.ts` and add `permissionGuard`/`roleGuard` to their `canActivate` arrays alongside `authGuard`.
- **Why a fix is NOT applied here:** Touching `canActivate` on every protected route is exactly the kind of change Rule #4 calls out ("do not break routing... do not break guards") — if any single permission list is wrong, a user gets bounced from a page they should have access to, and I have no running app to verify against. This is a 20-30 minute, easily-reviewable change, but it should be done deliberately with the actual intended permission matrix confirmed, not guessed at file-read time.

### 2.3 Unread notification count: three disconnected sources of truth
- **Root cause:** Three separate mechanisms track "unread notification count," and the one piece of code that should reconcile them does nothing.
  1. `NotificationsService.unreadCountSignal` (`notifications.service.ts:20`) — initializes to a **hardcoded `signal<number>(3)`**, used by the navbar badge (`navbar.component.ts:29`).
  2. NgRx `notifications.unreadCount` state field (`notifications.reducer.ts`) — correctly computed from real data on load, exposed via `selectUnreadCount` (`notifications.selectors.ts:7`) — **but `selectUnreadCount` is never imported or used anywhere outside its own file.**
  3. `notifications.component.ts:58` — a local `get unreadCount()` getter, correctly computed from its own locally-loaded list, but page-scoped only.
  4. `main-layout.component.ts:29`: `this.notificationsService.getUnreadCount().subscribe();` — **the `.subscribe()` call has no callback at all.** It fetches the real unread count from the mock backend and immediately discards the result.
- **Risk level:** Medium. Not visible *today* only because the mock dataset (`mock-data.ts`) happens to contain exactly 3 unread notifications — verified by `grep -c "isRead: false"` = 3. That's a coincidence, not a guarantee: change the mock data, or connect a real backend with a different count, and the navbar badge will silently show a stale/wrong number indefinitely (it only changes via direct `markAsRead`/`markAllAsRead` calls from the notifications page, never from the actual source of truth).
- **Proposed fix:** Give `main-layout.component.ts:29`'s subscribe a callback that calls `this.notificationsService.setUnreadCount(res.data.count)` (the method already exists). That one line closes the loop. Separately, decide whether the NgRx `selectUnreadCount` path or the service-signal path should be the single source of truth going forward, and remove the other to stop the duplication.
- **Why a fix is NOT applied here:** The one-line `main-layout.component.ts` fix is low risk and I'd be comfortable applying it on confirmation — flagging it here rather than doing it silently, per the audit-first instruction. The broader "pick one source of truth" cleanup is a small architecture decision, not a 30-second fix, and belongs to you to direct.

### 2.4 "Remember me" unchecked doesn't end the session on browser close
- **Root cause:** `AuthService.login()` (`auth.service.ts:48-58`) always persists the user object to `localStorage` (`this.storageSvc.set(SESSION_USER_KEY, res.data.user, true)` — `true` is hardcoded, ignoring `rememberMe`). `SessionService.setSession()` does the same independently. Separately, `TokenService.setTokens()` (`token.service.ts:40-48`) *also* mirrors the access token into `localStorage` even when `persistent=false`, with the comment "Mirror in localStorage for guard compatibility in demo mode." Because `isAuthenticated` is just `computed(() => !!userSignal())` (`session.service.ts:25`) with no token-expiry check at app-init time, and a token with no stored expiry is treated as "always valid" (`token.service.ts:101`: `if (!expiresAt) return true;`), a user who unchecks "Remember me," closes the browser, and reopens it later is still logged in.
- **Risk level:** Medium for the Security category, but **this looks like a deliberate simplification, not an oversight** — the comment explicitly says it's for "guard compatibility in demo mode," and the whole app is currently a self-described static demo. I'm flagging it because it's the kind of thing that's easy to forget about once a real backend exists, not because today's behavior looks accidental.
- **Proposed fix:** When wiring a real backend, make the persisted-user write respect `rememberMe` the same way `TokenService.setTokens()` already does for tokens, and make `isAccessTokenValid()` require a real `expiresAt` rather than treating "missing expiry" as "valid forever."
- **Why a fix is NOT applied here:** This is core session/auth logic touched by login, session restore, and the refresh-token interceptor simultaneously. Given it may well be intentional for the demo, changing it without your confirmation risks "fixing" something you wanted to keep, which Rule #2 explicitly warns against ("if something is already correct, leave it alone" — and I can't be 100% sure this isn't intentional from source alone).

### 2.5 Refresh-token queue can hang on refresh failure (latent, currently dead code)
- **Root cause:** In `refresh-token.interceptor.ts`, requests queued during a 401 (`queueAndRetry`, lines 31-37) wait on `refreshDone$.pipe(filter(t => t !== null), take(1))`. If the in-flight refresh fails, `refreshDone$.next(null)` is emitted (line ~88) and the queued requests' filter never resolves — they hang until some future, unrelated successful refresh happens to fire (or never resolve).
- **Risk level:** Low today (this entire interceptor short-circuits with `if (environment.mockMode) return next(req);` at the top, and `mockMode` is `true` in both the default and development environments — so this code path is provably unreachable in any environment currently shippable). Worth fixing before a real backend makes it reachable.
- **Proposed fix:** In the refresh-failure `catchError`, also `refreshDone$.error(...)` or otherwise actively reject in-flight queued requests instead of leaving them to hang on a `null` they'll never get released from.
- **Why a fix is NOT applied here:** Concurrency/queueing logic is exactly the kind of thing that's easy to get subtly wrong without a way to test it (no real backend to trigger concurrent 401s against). Zero live impact today, so there's no urgency that outweighs the risk of touching it blind.

### 2.6 `auth.interceptor.ts` mock-mode comment doesn't match the code
- **Root cause:** The function comment says "Mock mode — no real HTTP calls; still add metadata for consistency," but the actual mock-mode branch is just `if (environment.mockMode) { return next(req); }` — it does not call `addMeta()`.
- **File / line:** `src/app/core/interceptors/auth.interceptor.ts:43-46`.
- **Risk level:** Negligible — this interceptor only fires for requests that go through Angular's `HttpClient`, and in mock mode nothing does (all calls go through `MockService`, which returns `of(...).pipe(delay(...))` directly, never touching `HttpClient`). So the code path the comment describes is dead either way.
- **Proposed fix:** Either delete "still add metadata for consistency" from the comment, or (lower priority, since it's inert) make the code match it.
- **Why a fix is NOT applied here:** Purely cosmetic, zero functional impact — listed for completeness per Rule #1's "read everything" requirement, not because it's urgent. This is the one item in this report I'd call genuinely safe to fix in a single follow-up pass without much ceremony, since it's comment text and/or dead-code-path code only.

### 2.7 Duplicated role→permission mapping (two sources of truth, currently in sync)
- **Root cause:** The role→permission mapping exists in two independently-maintained places with no shared source: `PermissionService.ROLE_PERMISSIONS` (`permission.service.ts:39-53`) and `derivePermissions()` in `auth.reducer.ts:65-85`. I compared every role's permission list between the two by hand — **they currently match exactly** — but nothing enforces that they stay in sync; a future change to one (e.g. adding a permission to the `analyst` role) silently won't propagate to the other.
- **Risk level:** Low today (verified identical), Medium going forward.
- **Proposed fix:** Have `derivePermissions()` in `auth.reducer.ts` import and call `PermissionService`'s `ROLE_PERMISSIONS` map (or extract a shared pure function both can call) instead of maintaining its own copy. Pure reducers can't `inject()` a service, but they *can* import a plain exported constant/function — `ROLE_PERMISSIONS` would need to move to a DI-free file (or `PermissionService`'s map could be extracted to a standalone constant the service then wraps).
- **Why a fix is NOT applied here:** Today's values are identical, so there's no live bug — only a maintenance hazard. Restructuring which file owns the canonical map is a real (if small) architecture change I'd rather you sign off on than do unilaterally, especially since the NgRx-state `permissions` array isn't even the one `AuthFacade.can()` actually reads (it reads `PermissionService` directly) — see also §2.3-style "selector exists but isn't the one being read" pattern.

### 2.8 `clearAuthStorage()` doesn't list every auth-adjacent key
- **Root cause:** `StorageService.clearAuthStorage()` (called on logout) removes 9 named keys, but doesn't include `'aegislex_reset_token'` (set by `ResetPasswordStateService`) or `'aegislex_forgot_email'` (set by `DraftRecoveryService`).
- **File:** `src/app/core/services/storage.service.ts:44-54`.
- **Risk level:** Very low — both are `sessionStorage` (cleared on tab/browser close regardless), and both only get written during the public, pre-login forgot/reset flow, which doesn't overlap in practice with an authenticated session being logged out.
- **Proposed fix:** Add both keys to the `removeMany([...])` list for completeness.
- **Why not applied:** Trivial but not zero-risk-free to guess at blind — would want to confirm the full canonical key list against `DraftRecoveryService`/`ResetPasswordStateService`/`OtpStateService` together rather than adding two keys in isolation, since (see §2.9 below) there's already a second, redundant key for the same concept.

### 2.9 Two parallel "OTP email" persistence keys, only one of which is reachable
- **Root cause:** `DraftRecoveryService.saveOtpState()/loadOtpEmail()` writes/reads `'aegislex_otp_state'`. `OtpStateService.startFlow()` independently writes `'aegislex_otp_email'` to `sessionStorage` directly. `DraftRecoveryService.loadOtpEmail()` checks both keys as a fallback chain. In practice, `OtpStateService.startFlow()` is only called from `AuthFacade.forgotPassword()` — which (per §2.1) is never invoked by `forgot-password.component.ts` — so today only the `DraftRecoveryService` key is ever actually written.
- **Risk level:** Low (functionally harmless fallback chain; the two-key situation will resolve naturally once §2.1 is fixed, since the proper flow would then use one consistent path).
- **Proposed fix:** No standalone fix needed — note this as something that should self-resolve as part of the §2.1 rewiring, and isn't worth a separate change in isolation.

### 2.10 `provideStoreDevtools` always included, even in production
- **Root cause:** `app.config.ts:46-50` calls `provideStoreDevtools({ ..., logOnly: environment.production, ... })` unconditionally — `logOnly` limits *interactivity* in production, but the devtools code still ships in every build and the browser extension can still connect and inspect store state in production.
- **Risk level:** Low — minor bundle-size and store-state-visibility surface, not a credential/token leak (no auth tokens are kept in the NgRx store state inspected here).
- **Proposed fix:** Wrap it: `...(environment.production ? [] : [provideStoreDevtools({...})])`.
- **Why not applied:** Small, low-risk, but is a behavior change to the build configuration (removes a provider in prod), so flagged rather than silently applied per Rule #1.

### 2.11 No `TitleStrategy` / per-route `<title>` updates
- **Root cause:** `index.html` has one static `<title>`. `ROUTE_METADATA` (§2.2) defines a `title` per route but is never consulted. Only `chat.component.ts` and `contract-viewer.component.ts` manually call Angular's `Title` service; every other route (dashboard, cases, reports, settings, etc.) leaves the browser tab title unchanged during in-app navigation.
- **Risk level:** Low-Medium for SEO/UX (most routes are behind `authGuard` so search-engine indexing isn't the concern; the real cost is UX — indistinguishable browser tabs/bookmarks/history entries).
- **Proposed fix:** Register a small `TitleStrategy` in `app.config.ts` that reads `route.data['title']` (once §2.2's `data:` wiring exists) and calls `Title.setTitle()`.
- **Why not applied:** Depends on §2.2 being addressed first (the `data:` properties don't exist yet), so sequencing this alone wouldn't accomplish much.

---

## 3. Performance

### 3.1 Missing `trackBy` on `*ngFor`
- **Root cause:** The app uses the legacy `*ngFor` directive everywhere (no `@for` blocks at all — confirmed 0 matches), and most loops omit `trackBy`.
- **Verified counts (file | total `*ngFor` | with `trackBy`):**
  `analysis.component.html` 16/5 · `dashboard.component.html` 12/1 · `insights.component.html` 10/0 · `case-detail.component.html` 8/2 · `cases-list.component.html` 7/2 · `chat.component.html` 6/2 · `register.component.html` 6/0 · `contract-viewer.component.html` 5/0 · `reports-list.component.html` 5/1 · `similar-cases.component.html` 5/1 · `search.component.html` 4/0 · `workspace.component.html` 4/0 · `recommendations.component.html` 4/0 · `case-form.component.html` 3/0 · `landing.component.html` 3/0 · `timeline.component.html` 3/0 · `settings.component.html` 3/0 · `graph.component.html` 2/0 · `verify-otp.component.html` 2/0 · `login.component.html` 2/0 · `notifications.component.html` 2/1 · `forgot-password.component.html` 1/0 · `reset-password.component.html` 1/0 · `profile.component.html` 1/0 · `upload.component.html` 3/1 · `report-viewer.component.html` 1/0 · `sidebar.component.html` 1/0.
- **Risk level:** Low individually, Low-Medium in aggregate (without `trackBy`, Angular destroys/recreates DOM nodes on every list update instead of patching in place — costs more on data-heavy lists like `analysis`, `dashboard`, `insights`, `cases-list`, `search`, `contract-viewer`).
- **Why real:** Directly verified by grep + spot-checks; this is the single highest-volume, lowest-individual-risk finding in the report.
- **Proposed fix:** Add a `trackByFn(index, item) { return item.id; }`-style method + `[ngForTrackBy]` to loops over data with a stable `id` (cases, documents, reports, notifications, search results). Loops over genuinely static/small arrays (e.g. a 3-item settings-tabs list) get negligible benefit and aren't worth touching.
- **Why NOT applied in this pass:** ~100 individual loop sites across 27 files. Each `trackBy` addition is low-risk in isolation, but I have no way to compile-check 100 edits in this sandbox, and a single typo'd `trackBy` reference (e.g. referencing a property that doesn't exist on that particular array's item type) silently breaks list rendering. This is exactly the "small verified fix is better than a large risky fix" tradeoff from your Final Safety Check — I'd rather hand you the precise file list above and do it as a deliberate, reviewable pass (prioritizing the data-heavy files first) than blanket-edit 100 sites in one shot.

### 3.2 Memory leaks / cleanup — **Verified, mostly clean**
- Checked every `setInterval(` in the codebase (4 call sites: `verify-otp.component.ts`, `otp-state.service.ts`, plus 2 more) against `clearInterval(` in the same file — **all paired correctly. Verified – no change required.**
- Checked every `addEventListener(` against `removeEventListener(` — only one file lacks a matching `removeEventListener`: `theme.service.ts`'s `matchMedia('(prefers-color-scheme: dark)')` listener. **Verified – no change required**: this is a `providedIn: 'root'` singleton that lives for the entire app session, so there's nothing to clean up (the same reasoning applies to `analytics.service.ts`'s permanent `router.events` subscription).
- Checked every `.subscribe(` call site (26 files) for `ngOnDestroy`/`takeUntil`/tracked `Subscription`. Most one-shot mock calls (`getCases`, `getReport`, `deleteCase`, etc.) auto-complete after a single emission within ~200-2000ms (standard `of(...).pipe(delay(...))` mock pattern) and don't strictly need unsubscription — **Verified – no meaningful leak risk** for these. The one genuinely long-lived subscription in the app — `chat.component.ts`'s simulated SSE stream (`sendMessage()`) — **is correctly tracked and unsubscribed** in `ngOnDestroy()` (`this.streamSubscription?.unsubscribe()`). This is the one place a leak would actually matter, and it's handled right.

---

## 4. Accessibility

### 4.1 Language toggle produces RTL layout with untranslated (English) text
- **Root cause:** `language.service.ts` contains a full ~90-key English/Arabic dictionary and correctly toggles `document.documentElement`'s `lang`/`dir` attributes and `rtl`/`ltr` body classes. But `LanguageService.t()` (the translation lookup function) is **never called from any of the 30 HTML templates** (`grep -rl "\.t('" src/app --include="*.html"` → 0 matches). The toggle itself is reachable: `navbar.component.ts:60-61` wires a live, clickable language-switch control.
- **Risk level:** Medium for Accessibility/SEO. This is a live, one-click-reachable bug: clicking the navbar language toggle sets `<html lang="ar" dir="rtl">` while every visible string remains English. That's actively wrong for screen readers (announces Arabic pronunciation rules over English text) and for any automated accessibility/SEO scan that checks `lang` against actual content language.
- **Proposed fix:** Either (a) wire `.t()` into the templates (a large undertaking — 90+ keys × however many templates reference that text), or (b) as an interim, lower-risk mitigation, hide/disable the language toggle until translations are wired up, so `lang`/`dir` can't be set to a value that doesn't match the rendered content.
- **Why NOT applied here:** Option (a) is a substantial feature-completion project, not a "fix." Option (b) is small, but removing a visible, working UI control is itself a product decision I shouldn't make unilaterally — flagging for your call.

### 4.2 Two icon-only buttons rely on `title` instead of `aria-label`
- **Root cause:** `upload.component.html`'s retry and remove buttons (lines 196-210) are icon-only (`<span class="material-icons">refresh</span>` / `close`, no visible text) and use only `title="Retry"` / `title="Remove"` — no `aria-label`. `title` is not reliably exposed as an accessible name by screen readers (support is inconsistent, and it's not announced at all on most touch/mobile AT).
- **File:** `src/app/features/upload/upload.component.html:196-210`. (Confirmed via codebase-wide grep that this is the *only* template using `title` with zero `aria-label` anywhere in the file — every other file mixing the two patterns has `aria-label` on at least some icon-only controls, so this isn't a wider systemic gap.)
- **Risk level:** Low (small, isolated, 2 buttons).
- **Proposed fix:** Add `aria-label="Retry upload"` / `aria-label="Remove file"` alongside (or instead of) the existing `title` attributes.
- **Why NOT applied here:** This one genuinely is safe to apply (pure additive HTML attribute, no logic touched) — calling it out explicitly as a candidate I'd do first if you give the go-ahead, rather than doing it silently mid-audit.

### 4.3 `<img>` alt attributes — **Verified, no issue**
A naive single-line grep initially flagged 3 files as "missing alt." On reading the full multi-line markup, **all three (`profile.component.html`, `navbar.component.html`, `sidebar.component.html`) correctly bind `[alt]="currentUser()!.firstName"`** — the attribute is just on a separate line from `<img`. Flagging this here specifically so it's clear I checked and corrected a false positive rather than reporting it wrong. **Verified – no change required.**

### 4.4 `window.confirm()` for unsaved-changes warning
- **File:** `src/app/core/guards/unsaved-changes.guard.ts:24-27`.
- **Risk level:** Very low / cosmetic. Native `confirm()` dialogs are functional and keyboard/screen-reader accessible by default (browser-native), just visually inconsistent with the rest of the app's design system.
- **Not a bug** — listed only because Rule #1 asked for everything read, not because it needs fixing. **Verified – functions correctly, no change required** unless you want it restyled as an in-app modal for visual consistency (a design preference, not a defect).

---

## 5. Security

### 5.1 `innerHTML` / `bypassSecurityTrustHtml` usage — **Verified, both already safe**
Two usages exist in the entire codebase:
- `chat.component.ts` (`formatMessageContent()`, lines 217-245): escapes `&`/`<`/`>`/`"`/`'` **before** applying markdown-style regex replacements, and every replacement produces only a fixed, hardcoded tag with no attribute injection possible. **Verified – correctly implemented, no XSS vector found.**
- `report-viewer.component.ts:29-46`: uses `DomSanitizer.bypassSecurityTrustHtml()` on mock (hardcoded, attacker-uncontrolled) content today, and already carries an explicit, accurate comment warning that a real backend **must** sanitize `htmlContent` server-side (e.g. DOMPurify) before this becomes safe in production. **Verified – the existing warning is accurate and sufficient; no change needed today.** I'd just reinforce: don't let this comment go stale — when a real backend is wired up, server-side sanitization for this specific field is a hard requirement, not a nice-to-have.

### 5.2 Token storage bypasses the centralized `StorageService`
- **Root cause:** `StorageService`'s own doc comment says it "centralises all storage access," but `TokenService`, `ThemeService`, `LanguageService`, `DeviceService`, `DraftRecoveryService`, `OtpStateService`, `ResetPasswordStateService`, and `auth.reducer.ts` all call `localStorage`/`sessionStorage` directly (8 files, confirmed by codebase-wide grep).
- **Risk level:** Low as a security issue (no actual exposure — these are typed, deliberate key names, not arbitrary), Medium as a "duplicated storage logic" maintainability issue (exactly what your original infra-prep task asked me to look for).
- **Why some of this is likely intentional, not a bug:** `auth.reducer.ts` has an explicit comment explaining it *must* read storage directly because NgRx reducers are pure functions with no DI context — that one is a deliberate, documented exception, not an oversight.
- **Proposed fix:** Route `TokenService`, `ThemeService`, `LanguageService`, and `DeviceService` through `StorageService.get<T>()`/`.set<T>()` instead of raw `localStorage` calls.
- **Why NOT applied here:** `TokenService` in particular is the most auth-critical file in the app (every login, every guard check, every interceptor depends on it behaving exactly as it does today). A refactor here is exactly the kind of "meaningful regression risk" Rule #3 says to document instead of apply.

### 5.3 File-upload validation — spot-checked, no issue found
`upload.component.ts`'s file-selection/drop handlers were read in full; type/size validation exists client-side before any mock "upload" begins. No real backend exists yet to receive these files, so server-side validation (the actually security-relevant half of file upload) is N/A today — already correctly out of scope per the original infra-prep pass's "no backend code" rule. **Verified – no change required at the frontend layer.**

---

## 6. SEO
Covered as part of §2.11 (no per-route `<title>` updates). Additionally
verified: no `robots.txt` or `sitemap.xml` exists in the project, and
`landing.component.ts` (the one genuinely public, pre-auth page) doesn't
set its own `<title>`/meta description distinct from the global static
one in `index.html`. Given almost the entire app is behind `authGuard`
(search engines can't index authenticated app content regardless), the
real-world SEO impact is low and concentrated on the `/landing` and
`/auth/*` pages specifically. **Not fixed here** — bundled with §2.11
since both stem from the same missing piece (a `TitleStrategy`/per-route
meta system).

## 7. Empty states / loading states / form validation / edge cases
Spot-checked across `dashboard`, `cases-list`, `notifications`,
`search`, and `reports-list`: each has an explicit `loading` signal
gating a skeleton/spinner state, and an explicit empty-state block
(checked via template `*ngIf` on `loading()`/`(list().length === 0)`
patterns) — **Verified – no missing loading/empty state found** in the
five highest-traffic list views. I did not exhaustively re-verify all 27
remaining feature templates line-by-line for this specific category
given the size of this report already; flagging that as the one area
where I'd call this audit "broad verification, not 100% exhaustive,"
consistent with being upfront about depth rather than overclaiming.

---

## 8. Summary table

| # | Finding | Area | Risk | Fixed this pass? |
|---|---|---|---|---|
| 2.1 | 3 auth flows bypass AuthAdapter | Backend readiness | Med-High | No — proposed only |
| 2.2 | permission/role guards unused | Security / Backend readiness | Medium | No — proposed only |
| 2.3 | Unread count: 3 disconnected sources, one dead subscribe | State mgmt | Medium | No — proposed only |
| 2.4 | "Remember me" doesn't end session | Security | Medium (likely intentional) | No — proposed only |
| 2.5 | Refresh-token queue can hang | Backend readiness | Low (dead code today) | No — proposed only |
| 2.6 | Stale comment in auth.interceptor.ts | Cleanup | Negligible | No — proposed only |
| 2.7 | Duplicated role→permission map | Duplicated logic | Low today / Medium later | No — proposed only |
| 2.8 | clearAuthStorage() missing 2 keys | Cleanup | Very low | No — proposed only |
| 2.9 | Two OTP-email storage keys | Duplicated logic | Low | No — self-resolves with 2.1 |
| 2.10 | StoreDevtools always bundled | Performance/Security | Low | No — proposed only |
| 2.11 | No per-route `<title>` | SEO/UX | Low-Med | No — proposed only |
| 3.1 | ~100 `*ngFor` missing trackBy | Performance | Low (high volume) | No — file list provided |
| 3.2 | Memory leaks/cleanup | Performance | — | **Verified clean** |
| 4.1 | Language toggle: RTL + English text | Accessibility | Medium | No — proposed only |
| 4.2 | 2 icon buttons: title not aria-label | Accessibility | Low | No — safe candidate, flagged |
| 4.3 | img alt attributes | Accessibility | — | **Verified clean (false positive corrected)** |
| 4.4 | window.confirm() dialog | Accessibility | — | **Verified, working as intended** |
| 5.1 | innerHTML / bypassSecurityTrustHtml | Security | — | **Verified, both already safe** |
| 5.2 | Storage access bypasses StorageService | Security/duplication | Low-Med | No — proposed only |
| 5.3 | File upload validation | Security | — | **Verified, client-side OK, server N/A** |

**Nothing was modified in this pass.** Tell me which of the above you'd
like me to act on — I'd suggest starting with §2.3's one-line
`main-layout.component.ts` fix and §4.2's two `aria-label` attributes,
since both are genuinely low-risk and fully scoped; the rest involve
either a product decision (4.1, 2.2's permission matrix) or touch
auth-critical code I'd want a green light on before changing (2.1, 2.4,
5.2).
