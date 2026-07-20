# Frontend Environment & Infrastructure Preparation Pass

Scope: frontend only. No backend, database, or AI server code touched.
No runtime behavior changed. No mocks/demo mode removed. No production
endpoints activated.

This pass started from a codebase that already had most of this work done
in earlier sessions (typed `EnvironmentConfig`, `EnvironmentService`,
`ApiUrlBuilder`/`ApiEndpoints`, a swappable `AuthAdapter` with a real
`ProductionAuthAdapter` already written, and "FUTURE BACKEND IMPLEMENTATION"
comment blocks in most data services). This report only describes what was
**verified** and what was **actually changed** in this pass — it does not
re-claim credit for pre-existing work.

---

## 1. Environment files reviewed
`environment.interface.ts`, `environment.ts`, `environment.development.ts`,
`environment.staging.ts`, `environment.prod.ts`.

Verified: all four concrete files satisfied every field in the interface
with no missing/extra keys (compared field-by-field, not just by skimming),
and `angular.json` `fileReplacements` map all four correctly per
build configuration (`production`→`.prod.ts`, `development`→`.development.ts`,
`staging`→`.staging.ts`, default→`environment.ts`).

## 2. Environment files modified
All five files above. Three new fields were added to the interface and
populated consistently in all four concrete files:

- `websocketUrl` — raw WebSocket endpoint, separate from the SignalR hub
- `fileUploadUrl` — placeholder for a future non-API upload target
- `enableDemoMode` — informational flag mirroring `mockMode`

None of these three fields are read anywhere in the codebase yet (verified
by `grep` across `src/`), so adding them cannot change behavior. See
`FRONTEND-INFRASTRUCTURE.md` → "Forward-compatibility fields" for the
full rationale, including three fields that were deliberately **not**
added because they'd duplicate existing values (`aiBaseUrl` would duplicate
`saulBaseUrl`; `enableMockMode` would duplicate `mockMode`; an
environment-level `featureFlags` object would duplicate the richer
`FeatureFlagConfig` already in `core/config/app.config.ts`).

> **2026-06-23 update:** the `aiBaseUrl` part of that rationale was later
> revisited — a subsequent Grok+Gemini integration pass did add
> `aiBaseUrl`, for a different, non-duplicating purpose. See
> `GROK-GEMINI-INTEGRATION-AUDIT.md` §11 for the reconciliation.

## 3. Infrastructure files reviewed
`package.json`/`package-lock.json`, `angular.json`, `tsconfig*.json`,
`core/config/api.config.ts`, `core/config/app.config.ts`,
`core/config/route.metadata.ts`, `core/guards/*` (5 files),
`core/interceptors/*` (3 files), `core/services/storage.service.ts` vs.
`core/services/cache/cache.service.ts`, `core/adapters/*` (auth adapter +
mock + production implementations), `app.config.ts`, `store/app.state.ts`.

Findings (no changes made — all judged safe-as-is or out of scope):
- `storage.service.ts` (raw typed localStorage/sessionStorage wrapper) and
  `cache/cache.service.ts` (TTL-based cache layer) are **not** duplicates —
  distinct responsibilities.
- Five files read `environment.mockMode`/`environment.production` directly
  instead of through `EnvironmentService` (`app.config.ts`,
  `store/app.state.ts`, and the three interceptors). This is a pre-existing,
  intentional pattern for early/short-circuit checks, not duplicated logic —
  left untouched.
- `store/app.state.ts` line 19 has a no-op ternary
  (`!environment.production ? [] : []`, both branches identical). This is a
  pre-existing app-logic quirk, not an infrastructure/environment-config
  issue, and "fixing" it either way would change runtime behavior — left
  untouched and flagged here instead.
- `analysis.component.ts` and `recommendations.component.ts` call
  `MockService` directly rather than going through `DocumentsService`/a
  dedicated service (which already has the documented future-backend
  comment block). Functionally identical today, but a minor architectural
  inconsistency worth a deliberate cleanup pass later — not changed here
  per "do not refactor aggressively."

## 4. Services prepared for backend (comment-only, already present — verified accurate)
`documents.service.ts`, `cases.service.ts`, `reports.service.ts`,
`search.service.ts`, `dashboard.service.ts`, `notifications.service.ts`,
`mock.service.ts`, `token.service.ts`, `report-viewer.component.ts`.
Spot-checked `documents.service.ts` and `cases.service.ts` line-by-line
against the real endpoint shapes in `ApiEndpoints` — comments are accurate.

`api-client.service.ts` and `production-auth.adapter.ts` need **no**
comment block — they are not mocks, they're already-real implementations
(currently unused/inactive, swapped in behind a DI token), which is a more
complete form of "future backend prep" than a comment.

## 5. Services prepared for AI (comment-only, already present — verified accurate)
`saul.service.ts` already has a full SSE-streaming comment block
(`sendMessage`) plus session CRUD endpoint mapping. Verified the comment
matches the real method signatures below it.

## 6. Comments added (this pass)
- `signalr.service.ts` — this was the one real-time/AI-adjacent service
  with **no** future-backend comment block. Added one covering
  `@microsoft/signalr` HubConnection usage (the package is already a
  dependency) plus a raw-WebSocket fallback referencing the new
  `websocketUrl` field. `connect()`, `disconnect()`, `joinCase()`,
  `leaveCase()`, and `simulateAnalysisProgress()` are untouched.
- JSDoc on the three new `EnvironmentConfig` fields explaining they are
  unused placeholders today.

## 7. Files modified
- `src/environments/environment.interface.ts`
- `src/environments/environment.ts`
- `src/environments/environment.development.ts`
- `src/environments/environment.staging.ts`
- `src/environments/environment.prod.ts`
- `src/app/core/services/environment.service.ts`
- `src/app/core/services/signalr.service.ts`
- `FRONTEND-INFRASTRUCTURE.md` (documentation only)

## 8. Files created
None.

## 9. Files deleted
None.

## 10. Demo Mode verification
"Demo Mode" was not previously a distinct flag — it's hardcoded UI: the
`demo-banner` and "Enter Demo" button in `login.component.html` are
unconditional regardless of environment. A new `enableDemoMode` field was
added to `EnvironmentConfig` (mirrors `mockMode`'s value in each file) so a
future change can gate that banner per-environment, but it is **not wired
into the login component** — the banner still always renders, exactly as
before. Demo login flow (`loginAsDemo()`, `MockAuthAdapter`) untouched.

## 11. Mock Mode verification
`mockMode` itself was not renamed, removed, or relocated. Every existing
reader of `environment.mockMode` / `EnvironmentService.mockMode` —
`auth.interceptor.ts`, `error.interceptor.ts`, `refresh-token.interceptor.ts`,
`app.config.ts` (adapter selection), `token.service.ts`, `auth-facade.service.ts` —
was left byte-for-byte unchanged. `MockAuthAdapter` remains the active
provider; `ProductionAuthAdapter` remains unregistered/inactive.

## 12. Risk assessment
**Low.** Every change in this pass is additive: new interface fields (with
all four environment files updated in lockstep, so no missing-field compile
error), new `EnvironmentService` getters, and new comment blocks. Nothing
existing was renamed, deleted, or had its logic altered.

**Verification performed:**
- Manually diffed every edited file against its original content.
- Grepped the full `src/` tree to confirm the three new env fields and the
  new `EnvironmentConfig` shape aren't constructed anywhere else (no test
  fixtures or duplicate literals exist that would need updating too).
- Ran `tsc --noEmit --noResolve --skipLibCheck` against all seven edited
  `.ts` files to catch syntax errors. Zero syntax errors.

**Verification NOT performed, and why:** this sandbox has no network
access and no `node_modules` installed, so a real `ng build` / `ng serve`
could not be run here. The `tsc` syntax check above is real but partial —
it cannot catch Angular-template binding errors or full type-checking
against `@angular/*` types. **Recommend running `npm install && npm run
build` (and `npm run build:dev`) locally before deploying** to get a real
build-level guarantee. I'm flagging this explicitly rather than claiming a
build pass I didn't actually run.
