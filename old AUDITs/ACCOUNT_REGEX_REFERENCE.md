# ACCOUNT_REGEX_REFERENCE.md
## AegisLex — Account Field Regex & Validation Reference
### Source of Truth: `src/app/shared/auth-components/auth-validators.ts`
### Generated: 2026-06-22

---

## 1. EMAIL

| Property | Value |
|---|---|
| **Field Name** | `email` |
| **Required** | YES |
| **Validator Function** | `emailValidator` |
| **Min Length** | 1 (non-empty after trim) |
| **Max Length** | 254 characters (checked before regex) |

**Exact Regex:**
```
/^[A-Za-z0-9._%+-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/
```

**Exact Validators (in order):**
1. `Validators.required`
2. `emailValidator` (trims, length-checks 254, then applies EMAIL_REGEX)

**Error Keys → Exact Error Messages:**
| Error Key | Message |
|---|---|
| `required` | `Email is required.` |
| `emailTooLong` | `Email cannot exceed 254 characters.` |
| `invalidEmail` | Dynamic via `getEmailErrorHint()` (see below) |

**getEmailErrorHint() messages (exact):**
- No `@`: `Missing @ symbol.`
- Multiple `@`: `Multiple @ symbols detected.`
- Email starts with `.`: `Email cannot start with a dot.`
- Email ends with `.` before `@`: `Email cannot end with a dot before @.`
- Missing domain after `@`: `Missing domain after @.`
- Domain has no `.`: `Missing dot before TLD (e.g. gmail.com).`
- Consecutive dots anywhere: `Consecutive dots detected.`
- TLD < 2 chars or non-alpha: `Invalid or missing TLD (e.g. .com, .ae).`
- Default fallback: `Please enter a valid email address.`

**Accepted Examples:**
- `user@example.com`
- `user.name@example.co.uk`
- `info@aegislex.ai`
- `contact@law-firm.com`
- `ahmed.al-mansouri@corp.legal`

**Rejected Examples:**
- `user@domain..com` (consecutive dots)
- `user@-domain.com` (domain starts with hyphen)
- `user@domain-.com` (domain ends with hyphen)
- `user@.domain.com` (leading dot in domain)
- `user@domain.com.` (trailing dot)
- `user@domain` (no TLD)
- `user@localhost` (no TLD)
- `user @example.com` (space in local part)

---

## 2. FIRST NAME

| Property | Value |
|---|---|
| **Field Name** | `firstName` |
| **Required** | YES |
| **Validator Function** | `firstNameValidator` |
| **Regex** | None (length-only validation) |
| **Min Length** | 3 (after trim) |
| **Max Length** | 50 (after trim) |

**Exact Validators (in order):**
1. `Validators.required`
2. `firstNameValidator` (trims, checks min 3, max 50)

**Error Keys → Exact Error Messages:**
| Error Key | Message |
|---|---|
| `required` | `First name is required.` |
| `nameTooShort` | `First name must contain at least 3 characters.` |
| `nameTooLong` | `First name cannot exceed 50 characters.` |

**Accepted Examples:** `Ali`, `Ahmed`, `Al-Mansouri`, `Jean-Pierre`

**Rejected Examples:** `A` (< 3 chars), `AB` (< 3 chars), 51+ char strings

---

## 3. LAST NAME

| Property | Value |
|---|---|
| **Field Name** | `lastName` |
| **Required** | YES |
| **Validator Function** | `lastNameValidator` |
| **Regex** | None (length-only validation) |
| **Min Length** | 3 (after trim) |
| **Max Length** | 50 (after trim) |

**Exact Validators (in order):**
1. `Validators.required`
2. `lastNameValidator` (trims, checks min 3, max 50)

**Error Keys → Exact Error Messages:**
| Error Key | Message |
|---|---|
| `required` | `Last name is required.` |
| `nameTooShort` | `Last name must contain at least 3 characters.` |
| `nameTooLong` | `Last name cannot exceed 50 characters.` |

**Accepted Examples:** `Ali`, `Smith`, `Al-Mansouri`

**Rejected Examples:** `Li` (< 3 chars), 51+ char strings

---

## 4. ORGANIZATION NAME

| Property | Value |
|---|---|
| **Field Name** | `organizationName` |
| **Required** | NO — OPTIONAL |
| **Validator Function** | `organizationValidator` |
| **Regex** | None (length-only validation) |
| **Min Length** | 2 (after trim, only if non-empty) |
| **Max Length** | 100 (after trim) |

**Exact Validators:**
1. `organizationValidator` (trims; if empty string → valid; if non-empty checks min 2, max 100)

**Error Keys → Exact Error Messages:**
| Error Key | Message |
|---|---|
| `orgTooShort` | `Organization must contain at least 2 characters.` |
| `orgTooLong` | `Organization cannot exceed 100 characters.` |

**Note:** Empty string is ALWAYS valid. No `required` error. No regex.

**Accepted Examples:** `""` (empty), `"Al"`, `"Smith & Co"`, `"Aegis Legal Partners LLC"`

**Rejected Examples:** `"A"` (< 2 chars after trim), 101+ char strings

---

## 5. PASSWORD

| Property | Value |
|---|---|
| **Field Name** | `password` |
| **Required** | YES |
| **Validator Function** | `passwordValidator` |
| **Min Length** | 8 (after trim) |
| **Max Length** | 64 (after trim) |

**Exact Regex Constants:**
```typescript
PASSWORD_UPPERCASE_REGEX = /[A-Z]/
PASSWORD_LOWERCASE_REGEX = /[a-z]/
PASSWORD_NUMBER_REGEX    = /\d/
PASSWORD_SPECIAL_REGEX   = /[^\w\s]/
```

**Exact Validators (in order):**
1. `Validators.required`
2. `passwordValidator` (trims; checks all rules simultaneously)

**Error Keys → Exact Error Messages:**
| Error Key | Message |
|---|---|
| `required` | `Password is required.` |
| `pwTooShort` | `Password must contain at least 8 characters.` |
| `pwTooLong` | `Password cannot exceed 64 characters.` |
| `pwNoUpper` | `Password must contain at least one uppercase letter.` |
| `pwNoLower` | `Password must contain at least one lowercase letter.` |
| `pwNoNumber` | `Password must contain at least one number.` |
| `pwNoSpecial` | `Password must contain at least one special character.` |

**Password Strength Scoring (`calcPasswordStrength`):**
- +1 if length ≥ 8
- +1 if has uppercase
- +1 if has lowercase
- +1 if has number
- +1 if has special character
- +1 (bonus) if length ≥ 14 (capped at 5)

| Score | Label | Bar % | CSS Class |
|---|---|---|---|
| 0 | (empty) | 0% | `ps-none` |
| 1 | Very Weak | 10% | `ps-very-weak` |
| 2 | Weak | 30% | `ps-weak` |
| 3 | Medium | 55% | `ps-medium` |
| 4 | Strong | 78% | `ps-strong` |
| 5 | Very Strong | 100% | `ps-very-strong` |

**Password Requirements UI Labels (PasswordRequirementsComponent):**
- `At least 8 characters`
- `One uppercase letter`
- `One lowercase letter`
- `One number`
- `One special character`

**Accepted Examples:** `Passw0rd!`, `Legal@2024X`, `Str0ng&Pass`

**Rejected Examples:** `password` (no upper, no special), `SHORT1!` (< 8), `ALLUPPERCASE1!` (no lower)

---

## 6. CONFIRM PASSWORD

| Property | Value |
|---|---|
| **Field Name** | `confirmPassword` |
| **Required** | YES |
| **Validator Function** | `Validators.required` on control; `passwordMatchValidator` on group |
| **Regex** | None |

**Error Keys → Exact Error Messages:**
| Error Key | Source | Message |
|---|---|---|
| `required` | control | `Confirm password is required.` |
| `passwordMismatch` | group | `Passwords do not match.` |

**Success Message (shown when both fields match):**
```
Passwords match
```
(displayed as `<div class="form-match-msg"><span class="material-icons">check_circle</span>Passwords match</div>`)

**Validator (group-level):**
```typescript
export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw  = ((group.get('password')?.value  as string) || '').trim();
  const cpw = ((group.get('confirmPassword')?.value as string) || '').trim();
  if (!pw || !cpw) return null;
  return pw !== cpw ? { passwordMismatch: true } : null;
}
```
Note: In Profile's `passwordForm`, the group keys are `newPassword` / `confirmPassword`.
The `passwordMatchValidator` reads `password` and `confirmPassword` from the group.
Profile's password form uses these exact same control names for the validator to work.

---

## 7. OTP (verify-otp only)

| Property | Value |
|---|---|
| **Field Name** | `otp` (per-digit inputs) |
| **Required** | YES |
| **Per-digit Regex** | `/^[0-9]$/` (`OTP_DIGIT_REGEX`) |
| **Full OTP Regex** | `/^\d{6}$/` (`OTP_FULL_REGEX`) |
| **Length** | Exactly 6 digits |

**Error Keys → Exact Error Messages:**
| Error Key | Message |
|---|---|
| `invalidOtp` | (handled via UI state, not displayed as text error) |

---

## 8. GLOBAL TRIM RULE

**All validators trim before measuring length or running regex.**
The `trim()` is applied inside each validator function on the raw `ctrl.value`.
Whitespace-only strings are treated as empty/required-error for required fields.

---

## 9. FIELDS WITH NO VALIDATION IN REGISTER

These fields exist only outside Register and have no Register equivalent:
- `currentPassword` in Profile (required-only: `'Current password is required.'`)
- `role` in Register (radio selector, no validation needed)
- `agreeTerms` in Register (`Validators.requiredTrue`, no equivalent outside Register)

