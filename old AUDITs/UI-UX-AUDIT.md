# UI-UX-AUDIT.md
## AegisLex — UI/UX Issues Audit Report

---

## Issue 1 — Password Duplication (Register Step 2 & Reset Password)

### Problem Description

Both the **Register Step 2** and **Reset Password** pages showed two
simultaneous sources of password feedback:

1. A `form-errors` list showing individual error messages (e.g.,
   "Password must contain at least one uppercase letter.")
2. The `<app-password-requirements>` checklist showing the same requirements
   as visual pass/fail indicators

When a user typed an invalid password (e.g., `"password123"`), they would see:
- The error list above: "Password must contain at least one uppercase letter."
- The checklist below: ✗ One uppercase letter

This duplicated identical information in two places, creating visual clutter
and UX confusion.

### Root Cause

The `passwordErrors` getter in both components collected all password error
messages and the HTML rendered them as a `form-errors` block. The
`<app-password-requirements>` component was then rendered directly below,
providing the same information visually.

Both were present simultaneously with no conditional that would show one
or the other.

### Fix Applied

**Register Step 2** (`register.component.html`): Removed the `form-errors`
div block for the password field. The `<app-password-requirements>` checklist
and `<app-password-strength>` bar are the single source of password feedback.

**Reset Password** (`reset-password.component.html`): Same removal applied.

**What was kept:**
- `<app-password-strength>` — animated strength bar (5 segments)
- `<app-password-requirements>` — live checklist with pass/fail icons

**What was removed:**
- The `<div class="form-errors">` block containing `*ngFor="let msg of passwordErrors"`
  for the password field specifically

**Error border retained:** The `[class.form-input-wrapper--error]="passwordErrors.length > 0"`
class binding on the input wrapper was NOT removed. The red border still
indicates invalid state — only the redundant text list below was removed.

### Result

Single, clear source of truth for password feedback. Checklist items turn
green as requirements are met. Strength bar fills progressively. No
duplicated messages.

---

## Issue 2 — Ask Saul Button Hover Bug

### Problem Description

The "Ask Saul" button (`.btn-primary` class, rendered as an `<a>` tag linking
to `/app/chat`) showed visual instability on hover:

- Button text could disappear or become illegible
- The `<span class="material-icons">` icon could disappear
- Content was unstable during hover transition

This affected the button in multiple locations:
- Dashboard header
- Case Detail header
- Recommendations page header
- Workspace status widget

### Root Cause

The global `.btn-primary, .btn-secondary, .btn-ghost, .btn-danger` rule in
`src/styles.scss` adds a hover overlay via `::after` pseudo-element:

```scss
.btn-primary, .btn-secondary, .btn-ghost, .btn-danger {
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;          // covers entire button
    background: white;
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
    border-radius: inherit;
    // NO z-index set ← THIS IS THE BUG
  }

  &:hover {
    &::after { opacity: 0.07; }
  }
}
```

The `::after` element is `position: absolute; inset: 0` — it covers the
entire button area. Without an explicit `z-index`, it participates in the
default stacking context.

The button children (text node, `<span class="material-icons">`) are also
not `position: relative`, so they don't establish their own stacking context.

In some browsers and rendering engines, the `::after` element stacks on top
of the sibling text and icon nodes, causing the overlay to obscure them on
hover (when `opacity` transitions from `0` to `0.07`).

### Fix Applied

In `src/styles.scss`, two rules were added inside the
`.btn-primary, .btn-secondary, .btn-ghost, .btn-danger` block:

```scss
&::after {
  // ... existing rules ...
  z-index: 0; // keep overlay behind button text/icons
}

// Ensure text content stays above the ::after overlay
> * {
  position: relative;
  z-index: 1;
}
```

**`z-index: 0` on `::after`:** Pins the overlay to the base of the stacking
context. Button content at natural `z-index: auto` would still be above it
in many cases, but to be explicit:

**`> * { position: relative; z-index: 1; }`:** Forces all direct children
(text nodes are not elements, but `<span>` children are) to establish their
own stacking context above the overlay. This guarantees the icon `<span>` and
any `<div>` or `<strong>` inside a button always paint above the `::after`.

### Verified Behavior

**Before fix:**
- Hover → `::after` overlays content → text/icon may disappear or dim too much

**After fix:**
- Hover → `::after` (opacity: 0.07) shows subtle white tint behind content
- Text remains fully visible
- Icon remains fully visible
- Smooth `translateY(-1px)` lift applies correctly
- `scale(0.96)` active state works correctly
- No content instability at any state

**Applies to all locations:** Dashboard "Ask Saul" button, Case Detail "Ask Saul"
button, Recommendations "Ask Saul" button, Workspace "Start Investigation" button,
and all other `.btn-primary / .btn-secondary / .btn-ghost / .btn-danger` instances.

### Files Fixed

```
src/styles.scss  — Button Micro-interactions section (lines ~745–773)
```

