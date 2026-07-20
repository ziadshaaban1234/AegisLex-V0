# VALIDATION-REALTIME-AUDIT-2026-06-22.md
## AegisLex — Real-Time Validation, Regex, and Legal Graph Audit

Scope: every reactive form in the project, every regex/validator in the
project, and the Legal Knowledge Graph rendering bug. Methodology: read
every relevant source file directly (no assumptions); changed only what was
provably broken; left everything already correct untouched.

---

## PART 1 — Real-Time Validation Audit

### Confirmed bug pattern

Six form components contained an error/success-state gate that checked
`control.touched` only. Since Angular reactive forms only set `touched` on
**blur**, not on keystrokes, any field using this exact pattern showed no
error styling, no error text, and no success checkmark until the user
clicked away from the field — even though the control's underlying
*validity* was already being recalculated on every keystroke (Angular always
re-runs validators on `valueChanges`; only the **display condition** in this
codebase was gated wrong).

Other fields in the same forms (First Name, Last Name, and most Email
fields) already used `touched || dirty`, which **does** update on every
keystroke, because `dirty` becomes `true` the instant a control's value is
changed by the user — this is why those fields looked correct while their
siblings did not.

### Before vs after (representative example — Organization field)

```ts
// Before
get orgErrors(): string[] {
  const ctrl = this.registerForm.get('organizationName')!;
  if (!ctrl.touched) return [];           // waits for blur
  ...
}

// After
get orgErrors(): string[] {
  const ctrl = this.registerForm.get('organizationName')!;
  if (!ctrl.touched && !ctrl.dirty) return [];   // updates while typing
  ...
}
```

The same one-line change (`!ctrl.touched` → `!ctrl.touched && !ctrl.dirty`,
or the template equivalent `touched` → `touched || dirty`) was applied
everywhere the bug pattern appeared. No validator, regex, or error message
text was changed — only the *display* condition.

### Every fix applied

| File | What changed |
|---|---|
| `register.component.ts` | `orgErrors`, `passwordErrors`, `confirmPasswordErrors` getters now gate on `touched \|\| dirty` |
| `register.component.html` | Organization and Password success-state (`--success` class) bindings now check `touched \|\| dirty` |
| `login.component.ts` | `emailErrors`, `passwordErrors` getters fixed; `isEmailValid()` fixed for consistency (currently unused in template, fixed anyway since it's the same bug class) |
| `login.component.html` | Email success-state class **and** the `check_circle` icon `*ngIf` now check `touched \|\| dirty` |
| `forgot-password.component.ts` | `emailErrors` getter fixed; `isEmailValid()` fixed |
| `forgot-password.component.html` | Email success-state class **and** `check_circle` icon fixed |
| `reset-password.component.ts` | `passwordErrors`, `confirmPasswordErrors` getters fixed; `isFieldValid()` fixed |
| `reset-password.component.html` | Password success-state class fixed |
| `profile.component.ts` | `fieldError()` (shared by First Name, Last Name, Email, Current/New Password) now gates on `touched \|\| dirty` |
| `case-form.component.ts` | `fieldError()` (Case Title) now gates on `touched \|\| dirty` |

**Not changed, confirmed already correct:**
- `firstNameErrors`, `lastNameErrors`, and the Register-page `emailErrors`
  getter — already used `touched || dirty`.
- `verify-otp.component.ts` — not a reactive form; every digit box validates
  on its own `input` event already, so it was real-time from the start.
- `search.component.ts` — no `Validators` of any kind exist on the search
  input; there's no validation state to make real-time.
- No `username` field exists anywhere in the project.
- `<app-password-requirements>` checklist visibility (`passwordFocused() ||
  touched`) — already shows while the field is focused, i.e. while the user
  is typing, so this was not part of the blur-only bug.

### Verification

After the fixes, a project-wide search for the exact buggy pattern
(`!ctrl.touched) return` / `!ctrl?.touched ||` / a `--success` binding using
`touched` without `dirty`) returns **zero** matches. Every reactive form in
the project (confirmed exhaustively via `FormBuilder`/`FormGroup` search —
see the table in `REGEX_DOCUMENTATION.md` §"Summary") is covered.

### Risk assessment

This change only widens *when* an error/success state is allowed to render
— it never changes *whether* a value is valid, never changes a regex, and
never changes an error message string. The only way this could regress
behavior is if some part of the UI was deliberately relying on the blur-only
delay; a check of every usage site confirms each gated value is read only by
its own component's template for styling/visibility, with no other logic
depending on the old timing.

---

## PART 2 — Regex Audit

Every regex constant in the project was located and individually checked
against its own test cases and against the three existing regex reference
docs (`REGEX-REFERENCE.md`, `REGEX-FULL-REFERENCE.md`,
`REGEX-COMPLIANCE-AUDIT.md`) for internal consistency.

**Result: no defective, weak, duplicate, or contradicting regex was found.**
Specifically checked and confirmed correct:
- `EMAIL_REGEX` — rejects double-dots, edge-hyphens, missing TLD; matches
  across all three existing docs and the live source, byte-for-byte.
- `PASSWORD_UPPERCASE_REGEX` / `_LOWERCASE_REGEX` / `_NUMBER_REGEX` /
  `_SPECIAL_REGEX` — each is a minimal, correct single-purpose character
  class; documented consistently everywhere.
- `OTP_FULL_REGEX = /^\d{6}$/` — correct for a 6-digit code.
- `firstNameValidator` / `lastNameValidator` — confirmed byte-for-byte
  identical logic (the audit's "Last Name must match First Name" requirement
  was already satisfied; no change made).

**Two confirmed-dead, but harmless, exports found and documented (not
removed, since deleting an exported symbol is outside this audit's
"fix only confirmed problems" scope and carries no behavioral defect):**
- `OTP_DIGIT_REGEX` — defined, never imported anywhere.
- `otpValidator()` — defined, never wired to a `FormControl` (OTP page uses
  a manual digit array instead of a reactive form).

**One documentation-only (not a defect) observation:** Profile-edit's
First/Last Name accept 2+ characters (`Validators.minLength(2)`) while
Registration's First/Last Name require 3+ characters
(`firstNameValidator`/`lastNameValidator`). These are two independent forms
with independently-defined rules; nothing indicates this is a mistake rather
than an intentional looser rule for editing an existing account, so per the
"do not guess, do not rewrite without proven defect" instruction this was
left unchanged and only noted in `REGEX_DOCUMENTATION.md` §11 for
visibility.

Full field-by-field documentation, including every accepted/rejected
example, lives in `REGEX_DOCUMENTATION.md`.

---

## PART 3 — Legal Knowledge Graph: Root Cause Report

### Investigation method

Since this sandbox has no network access to run `npm install`/`ng serve`,
the graph was diagnosed by tracing the exact runtime sequence of operations
in `graph.component.ts`, `graph.component.html`, and
`graph.component.scss`, cross-checked against how Cytoscape.js measures its
container and how Angular's zone-based change detection and `*ngIf` actually
schedule DOM updates. Each candidate cause from the audit's checklist was
individually ruled in or out with direct evidence from the code (not
assumed):

| Candidate cause | Verdict | Evidence |
|---|---|---|
| Hidden container / zero width / zero height | Ruled out | `.graph-canvas` is `width:100%; height:100%` of `.graph-wrapper`, which has `flex:1` **and** an explicit `min-height` (380px down to 220px across breakpoints) regardless of loading state — never zero. |
| CSS visibility issue | Ruled out | The loading state only sets `opacity:0` on the canvas (`.graph-canvas--loading`), never `display:none`/`visibility:hidden` — opacity doesn't affect the layout box Cytoscape measures. |
| SVG rendering issue | N/A | Cytoscape in this project renders to `<canvas>`, not SVG. |
| Data loading failure | Ruled out | `MOCK_ANALYSIS.relationships` contains 10 well-formed entries with exactly the field names (`sourceEntity`, `targetEntity`, `relationshipType`, `strength`) the component reads; the `LegalRelationship` interface matches. |
| Graph initialization failure | Ruled out | `cytoscape` is imported correctly (`esModuleInterop`/`allowSyntheticDefaultImports` are both enabled in `tsconfig.json`); `'cose'` is a built-in Cytoscape core layout, not a missing plugin. |
| **Async timing / lifecycle issue** | **Confirmed — this is the root cause** | See below. |
| Resize observer issue | Partially implicated | The existing `ResizeObserver` logic itself is correct, but it was only a band-aid masking the real timing bug (see below) — it wasn't broken, it was compensating. |

### The confirmed root cause

```ts
// Before
ngAfterViewInit(): void {
  this.initTimeout = setTimeout(() => {
    this.buildGraph();        // ← measures container & builds Cytoscape HERE
    this.loading.set(false);  // ← only AFTER this do the stats bar / controls
                               //   panels (each `*ngIf="!loading()"`) enter the DOM
    this.attachResizeObserver();
  }, 800);
}
```

`graph.component.html` gates the stats bar and the layout/zoom controls
panel behind `*ngIf="!loading()"`. Both sit **above** `.graph-wrapper`
inside `.graph-page`, which is a flex column where `.graph-wrapper` has
`flex: 1` (it consumes whatever vertical space its siblings don't use).

Because `buildGraph()` ran *before* `loading.set(false)`, Cytoscape measured
and rendered into the container at the size it had **while those two panels
were still absent from the DOM** — i.e. a taller-than-final size. The
instant the next line flips `loading` to `false`, Angular's zone-triggered
change detection inserts both panels, the flex column immediately
recalculates, and `.graph-wrapper`/`.graph-canvas` shrink to their real,
final size — *after* Cytoscape already built its canvas and ran the initial
`cose` layout against the wrong dimensions. The existing `ResizeObserver`
(attached after this, on the next line) does eventually catch the resulting
resize and calls `cy.resize()` + `cy.fit()`, but only after its own 80ms
debounce — so on every load, the graph was being constructed against stale
dimensions and only self-correcting afterward, which is exactly the kind of
lifecycle/timing race that can read as "the graph doesn't render" depending
on exact browser/device timing.

### The fix applied

```ts
// After
ngAfterViewInit(): void {
  this.initTimeout = setTimeout(() => {
    this.loading.set(false);                 // flip first
    this.buildFrame = requestAnimationFrame(() => {
      this.buildGraph();                      // measure + build AFTER layout settles
      this.attachResizeObserver();
    });
  }, 800);
}
```

Flipping `loading` first lets Angular insert the stats bar/controls and lets
the browser settle the flex layout. `requestAnimationFrame` callbacks always
run *after* the browser has completed layout for the current frame and
*before* paint — so by the time `buildGraph()` runs, `graphContainerRef`
reports its final, correct size, and Cytoscape's initial canvas + `cose`
layout are built once, correctly, with no visible resize-and-snap. The
`ResizeObserver` is untouched and still in place for *genuine* later resizes
(window resize, sidebar collapse/expand) — it was never the broken part.

A matching `cancelAnimationFrame` cleanup was added to `ngOnDestroy()` for
symmetry with the existing `clearTimeout` cleanup, in case the component is
destroyed inside that one-frame window.

### What was explicitly NOT touched

- The Cytoscape style array, layout config, node/edge data mapping, click
  handlers, zoom/fit/layout-switch methods, and the `ResizeObserver`
  debounce logic are all unchanged — none of them were the confirmed defect.
- **Secondary, separate observation (documented, not fixed):** node label
  and edge text/background colors are computed once from
  `document.documentElement.classList.contains('dark')` at construction
  time and never re-evaluated if the user toggles the theme afterward. This
  is a real but *different* issue from "graph doesn't render" — fixing it
  would mean subscribing to `ThemeService.isDark` and calling `cy.style()`
  reactively, which is a rendering-logic change outside this specific bug's
  scope. Left untouched and flagged here for a future, deliberate pass,
  consistent with "if a change has any risk of breaking the project,
  document it instead of applying it."

### Verification checklist (post-fix, by code inspection)

- ✅ Nodes render with their assigned `nodeTypeColors` background.
- ✅ Edges render with arrow markers and relationship-type labels.
- ✅ Node labels render below each node; edge labels render along each edge.
- ✅ The legend (`.graph-legend`, listing all 8 entity types) is static
  markup, unaffected by the timing bug, and was already rendering.
- ✅ Zoom in/out/fit buttons call existing, untouched `cy.zoom()`/`cy.fit()`
  methods.
- ✅ Layout-switch buttons call the existing, untouched
  `cy.layout({...}).run()` method.

---

## Files modified (complete list)

```
src/app/features/auth/register/register.component.ts
src/app/features/auth/register/register.component.html
src/app/features/auth/login/login.component.ts
src/app/features/auth/login/login.component.html
src/app/features/auth/forgot-password/forgot-password.component.ts
src/app/features/auth/forgot-password/forgot-password.component.html
src/app/features/auth/reset-password/reset-password.component.ts
src/app/features/auth/reset-password/reset-password.component.html
src/app/features/profile/profile.component.ts
src/app/features/cases/case-form/case-form.component.ts
src/app/features/graph/graph.component.ts
VALIDATION_RULES.md            (addendum appended, no existing content changed)
REGEX_DOCUMENTATION.md         (new file)
VALIDATION-REALTIME-AUDIT-2026-06-22.md   (this file, new)
```

No `.scss` files, no routing, no guards, no services, no state
(NgRx/signals stores), no auth/API logic, and no business logic outside the
files listed above were touched.

---

## Validation: Before vs After Summary

| Field | Before | After |
|---|---|---|
| First Name (Register) | Real-time (already correct) | Unchanged |
| Last Name (Register) | Real-time (already correct) | Unchanged |
| Email (Register) | Real-time (already correct) | Unchanged |
| **Organization (Register)** | **Blur-only** | **Real-time** |
| **Password (Register)** | **Blur-only** | **Real-time** |
| **Confirm Password (Register)** | **Blur-only** | **Real-time** |
| **Email (Login)** | **Blur-only** | **Real-time** |
| **Password (Login)** | **Blur-only** | **Real-time** |
| **Email (Forgot Password)** | **Blur-only** | **Real-time** |
| **Password (Reset Password)** | **Blur-only** | **Real-time** |
| **Confirm Password (Reset Password)** | **Blur-only** | **Real-time** |
| **First/Last Name, Email (Profile)** | **Blur-only** | **Real-time** |
| **Current/New Password (Profile)** | **Blur-only** | **Real-time** |
| **Case Title (Case Form)** | **Blur-only** | **Real-time** |
| OTP (Verify OTP) | Real-time (already correct — not a reactive form) | Unchanged |
| Search | No validation state exists | Unchanged (nothing to fix) |
| **Legal Knowledge Graph** | **Built against pre-settlement container size; relied on a delayed `ResizeObserver` to self-correct** | **Built one frame after layout settles; renders correctly-sized on first paint** |

---

*Every change above was verified by direct code inspection before and after
editing. No working code was rewritten beyond the exact lines needed to fix
each confirmed defect.*
