# MODIFIED FILES LIST
## AegisLex — Validation Alignment Pass
### Date: 2026-06-22

---

## FILES MODIFIED (3 source files)

### 1. `src/app/features/profile/profile.component.ts`

**Changes:**
- Added imports: `PasswordStrengthComponent`, `PasswordRequirementsComponent`, `firstNameValidator`, `lastNameValidator`, `emailValidator`, `organizationValidator`, `passwordValidator`, `passwordMatchValidator`, `calcPasswordStrength`, `getEmailErrorHint`
- Replaced `Validators.minLength(2)` with `firstNameValidator` for `firstName`
- Replaced `Validators.minLength(2)` with `lastNameValidator` for `lastName`
- Replaced `Validators.email` with `emailValidator` for `email`
- Added `organizationValidator` to `organizationName`
- Replaced `Validators.minLength(8)` with `passwordValidator` for `newPassword`
- Added `{ validators: passwordMatchValidator }` as second arg to `passwordForm` group
- Added signals: `showCurrentPassword`, `showNewPassword`, `showConfirmPassword`, `newPasswordFocused`
- Added toggle methods: `toggleCurrentPassword()`, `toggleNewPassword()`, `toggleConfirmPassword()`
- Added `newPasswordValue` getter and `newPasswordStrength` getter
- Replaced `changePassword()` naive toast-only mismatch check with `passwordForm.hasError('passwordMismatch')`
- Replaced generic `fieldError()` method with exact per-field error getters:
  - `firstNameErrors`, `lastNameErrors`, `emailErrors`, `orgErrors` (profile form)
  - `currentPasswordErrors`, `newPasswordErrors`, `confirmPasswordErrors` (password form)
  - `confirmMatch` getter, `isProfileFieldValid()`, `isPasswordFieldValid()`
- Added `profileForm.markAllAsTouched()` on invalid submit

### 2. `src/app/features/profile/profile.component.html`

**Changes:**
- Replaced all `<input class="form-field">` patterns with full Register-pattern markup:
  - `<div class="form-input-wrapper" [class.--error] [class.--success]>`
  - Leading `<span class="material-icons form-input-icon">` in every field
  - Trailing `check_circle` success icon on valid fields
  - `<div class="form-errors" role="alert">` error containers with `error` icons
- Added `aria-invalid`, `aria-required`, `aria-describedby` to all profile inputs
- Added `(optional)` span to organization label
- Changed organization label to include `<span class="form-label--optional">`
- Password section — completely replaced:
  - Added show/hide toggle buttons to all 3 password fields
  - Added `(focus)` / `(blur)` bindings on newPassword for `newPasswordFocused` signal
  - Added `<app-password-strength [value]="newPasswordValue">` after newPassword
  - Added `<app-password-requirements [visible]="..." [value]="..." [touched]="...">` after strength
  - Added `form-match-msg` "Passwords match" success display on confirmPassword
  - Replaced `<p class="field-error">` with `<div class="form-errors" role="alert">` pattern
- Updated `saveProfile()` submit to not call invalid (now handled in TS)
- Changed `&` in "Password & Security" to `&amp;` (HTML entity)

### 3. `src/app/features/profile/profile.component.scss`

**Changes:**
- Appended complete set of Register-pattern form styles:
  - `.form-label--optional`
  - `.form-input-wrapper` with all states (`--error`, `--success`, `:hover`, `:focus-within`)
  - `.form-input-icon`
  - `.form-input` (with `.has-trail` modifier)
  - `.form-input-toggle`
  - `.form-input-trail-icon` and `--success` modifier
  - `.form-errors`, `.form-error` (with `errSlideProfile` keyframe)
  - `.form-match-msg`
  - Dark-mode `:host-context(.dark)` overrides

---

## NEW DOCUMENTATION FILES (4)

| File | Purpose |
|---|---|
| `ACCOUNT_REGEX_REFERENCE.md` | Complete regex reference for backend team |
| `VALIDATION-ALIGNMENT-REPORT.md` | Field-by-field before/after comparison |
| `REGISTER-VS-FORMS-COMPARISON.md` | Cross-form alignment status table |
| `REGEX-AUDIT-REPORT.md` | Regex consistency audit across all components |
| `MODIFIED-FILES-LIST.md` | This file |

---

## FILES EXPLICITLY NOT MODIFIED

- `src/app/shared/auth-components/auth-validators.ts` — source of truth, read-only
- `src/app/shared/auth-components/password-requirements.component.ts`
- `src/app/shared/auth-components/password-strength.component.ts`
- `src/app/features/auth/register/*` — source of truth
- `src/app/features/auth/reset-password/*` — already correct
- `src/app/features/auth/forgot-password/*` — already correct
- `src/app/features/auth/login/*` — already correct
- `src/app/features/auth/verify-otp/*`
- `src/app/features/settings/*`
- `src/app/core/**/*` — no auth/routing/mock changes
- `src/app/store/**/*`
- `src/app/layout/**/*`
- All other feature components

