# AegisLex — Validation Rules

> **Frontend and Backend must use identical validation rules.**
> Last updated: June 2026

---

## First Name

| Rule         | Value |
|--------------|-------|
| Minimum      | 3 characters |
| Maximum      | 50 characters |
| Allowed      | Arabic, English, numbers, symbols, spaces |
| Regex        | `^.{3,50}$` |

**Error Messages:**
- `First name must contain at least 3 characters.` — when `length < 3`
- `First name cannot exceed 50 characters.` — when `length > 50`

---

## Last Name

| Rule         | Value |
|--------------|-------|
| Minimum      | 3 characters |
| Maximum      | 50 characters |
| Allowed      | Arabic, English, numbers, symbols, spaces |
| Regex        | `^.{3,50}$` |

**Error Messages:**
- `Last name must contain at least 3 characters.` — when `length < 3`
- `Last name cannot exceed 50 characters.` — when `length > 50`

---

## Email

| Rule         | Value |
|--------------|-------|
| Required     | Yes |
| Allowed      | English characters only |
| Must contain | `@`, valid domain, valid TLD |
| Regex        | `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$` |

**Error Messages:**
- `Email is required.` — when field is empty
- `Please enter a valid email address.` — when format is invalid

---

## Organization

| Rule     | Value |
|----------|-------|
| Required | Yes |
| Allowed  | Arabic, English, numbers, symbols, spaces |

**Error Messages:**
- `Organization is required.` — when field is empty

---

## Password

| Rule             | Value |
|------------------|-------|
| Minimum length   | 8 characters |
| Maximum length   | 64 characters |
| Uppercase        | At least 1 |
| Lowercase        | At least 1 |
| Number           | At least 1 |
| Special character| At least 1 (any non-word, non-space) |
| Regex            | `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,64}$` |

**All failed rules are displayed simultaneously.**

**Error Messages:**
- `Password must contain at least 8 characters.` — when `length < 8`
- `Password cannot exceed 64 characters.` — when `length > 64`
- `Password must contain at least one uppercase letter.` — when no `[A-Z]`
- `Password must contain at least one lowercase letter.` — when no `[a-z]`
- `Password must contain at least one number.` — when no `[0-9]`
- `Password must contain at least one special character.` — when no `[^\w\s]`

---

## Confirm Password

| Rule  | Value |
|-------|-------|
| Must equal | `password` field |

**Error Messages:**
- `Please confirm your password.` — when field is empty
- `Passwords do not match.` — when value differs from password

---

## Login — Email

Same regex as registration email above.

**Error Messages:**
- `Email is required.` — when empty
- `Please enter a valid email address.` — when format invalid

## Login — Password

| Rule     | Value |
|----------|-------|
| Required | Yes |

**Error Messages:**
- `Password is required.` — when empty

---

## UX Behaviour

- Validation triggers on **input (real-time)** and on **blur**
- Errors appear immediately after first interaction with a field
- Errors disappear immediately when the issue is corrected
- Errors do **not** appear on page load before any interaction
- Submit button is **disabled** until all fields pass validation
- All password errors are shown **simultaneously** (not one at a time)

---

## Addendum — 2026-06-22 Real-Time Validation Audit

The "input (real-time)" claim above describes the *intended* behavior and
was already true for First Name, Last Name, and most Email fields (their
error/success getters checked `touched || dirty`). It was **not** true for
Organization, Password, and Confirm Password on Register/Reset Password, nor
for Email/Password on Login, Forgot Password, plus the Profile and Case
Title forms — those fields' error and success-state getters checked
`touched` only, so feedback waited for blur instead of updating on every
keystroke as the user typed.

This has been corrected across every reactive form in the project. The
underlying validation regex/rules themselves were not changed — only the
condition that decides *when* an already-computed error is displayed. See
`VALIDATION-REALTIME-AUDIT-2026-06-22.md` for the full list of files and
exact before/after diffs.

