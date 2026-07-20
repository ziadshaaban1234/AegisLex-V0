# AegisLex — REGEX-DOCUMENTATION.md

**Actual validators in use — generated from source.**
Source of truth: `src/app/shared/auth-components/auth-validators.ts`

---

## 1. Email

**Validator:** `emailValidator`
**Regex:** `EMAIL_REGEX`
```
/^[A-Za-z0-9._%+-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/
```
**Purpose:** Validates email format. Rejects missing @, missing domain, missing TLD dot, consecutive dots, hyphen-edge labels, single-label domains.

**Logic:**
1. Trim value
2. Whitespace-only → `required`
3. Length > 254 → `emailTooLong`
4. Fails regex → `invalidEmail`

**Valid:** `user@example.com`, `ahmed.al-mansouri@corp.legal`, `info@aegislex.ai`
**Invalid:** `ziadgmail.com` (no @), `ziad@` (no domain), `ziad@gmail` (no TLD dot), `ziad@@gmail.com` (double @), `ziad..test@gmail.com` (consecutive dots)

**Edge cases:** Hyphens allowed mid-label, not at edges. Subdomains supported. TLD must be 2+ alpha-only chars. Underscore allowed in local part.

**Error messages:**
| Key | Message |
|-----|---------|
| `required` | `Email is required.` |
| `emailTooLong` | `Email cannot exceed 254 characters.` |
| `invalidEmail` | Smart hint via `getEmailErrorHint()` (e.g. "Missing @ symbol.") |

**Pages:** Register (Step 1), Login, Forgot Password

---

## 2. First Name

**Validator:** `firstNameValidator`
**Regex:** None — pure length check on trimmed value
**Purpose:** Ensures first name is 3–50 characters.

**Valid:** `Ali`, `Mary Jane`, `Al-Mansouri`
**Invalid:** `Jo` (< 3), `A` (1 char), `  ` (whitespace only)

**Edge cases:** Internal spaces and hyphens allowed. Leading/trailing whitespace is trimmed before check.

**Error messages:**
| Key | Message |
|-----|---------|
| `required` | `First name is required.` |
| `nameTooShort` | `First name must contain at least 3 characters.` |
| `nameTooLong` | `First name cannot exceed 50 characters.` |

**Pages:** Register (Step 1)

---

## 3. Last Name

**Validator:** `lastNameValidator`
**Regex:** None — identical logic to `firstNameValidator`
**Purpose:** Ensures last name is 3–50 characters.

**Valid/Invalid/Edge cases:** Same as First Name.

**Error messages:**
| Key | Message |
|-----|---------|
| `required` | `Last name is required.` |
| `nameTooShort` | `Last name must contain at least 3 characters.` |
| `nameTooLong` | `Last name cannot exceed 50 characters.` |

**Pages:** Register (Step 1)

---

## 4. Organization (optional)

**Validator:** `organizationValidator`
**Regex:** None — length check only
**Purpose:** Optional field. If provided, must be 2–100 characters.

**Valid:** `Al-Tamimi & Co`, any string 2–100 chars
**Invalid:** Single character. >100 chars.
**Edge cases:** Empty string is always valid (no `Validators.required` applied to this field).

**Error messages:**
| Key | Message |
|-----|---------|
| `orgTooShort` | `Organization must contain at least 2 characters.` |
| `orgTooLong` | `Organization cannot exceed 100 characters.` |

**Pages:** Register (Step 1)

---

## 5. Password

**Validator:** `passwordValidator`
**Regexes:** Four character-class checks (all applied simultaneously):

| Constant | Pattern | Checks |
|----------|---------|--------|
| `PASSWORD_UPPERCASE_REGEX` | `/[A-Z]/` | At least one A–Z |
| `PASSWORD_LOWERCASE_REGEX` | `/[a-z]/` | At least one a–z |
| `PASSWORD_NUMBER_REGEX` | `/\d/` | At least one digit |
| `PASSWORD_SPECIAL_REGEX` | `/[^\w\s]/` | At least one special char (not word, not space) |

**Purpose:** Enforces strong password: 8–64 chars, mixed case, digit, special character.

**Special chars matched by `[^\w\s]`:** `! @ # $ % ^ & * ( ) - + = [ ] { } | ; ' " , . < > / ?`
(anything that is not `[A-Za-z0-9_]` and not whitespace)

**Valid:** `Secure#Pass1`, `LegalA1@Dubai`
**Invalid:** `password` (no upper/digit/special), `SHORT1!` (< 8 chars), `NOLOWER1!` (no lowercase)

**Edge cases:** All failures returned simultaneously (not one at a time). Underscore `_` is NOT a special character (covered by `\w`).

**Error messages:**
| Key | Message |
|-----|---------|
| `required` | `Password is required.` |
| `pwTooShort` | `Password must contain at least 8 characters.` |
| `pwTooLong` | `Password cannot exceed 64 characters.` |
| `pwNoUpper` | `Password must contain at least one uppercase letter.` |
| `pwNoLower` | `Password must contain at least one lowercase letter.` |
| `pwNoNumber` | `Password must contain at least one number.` |
| `pwNoSpecial` | `Password must contain at least one special character.` |

**Pages:** Register (Step 2), Reset Password

---

## 6. Confirm Password

**Validator:** `passwordMatchValidator` (group-level)
**Regex:** None — equality check after trimming both values
**Purpose:** Ensures password and confirmPassword fields match.

**Edge cases:** Returns null if either field is empty (prevents premature mismatch errors). Error is on the form group, not the control.

**Error messages:**
| Key | Message |
|-----|---------|
| `required` | `Confirm password is required.` |
| `passwordMismatch` | `Passwords do not match.` |

**Pages:** Register (Step 2), Reset Password

---

## 7. OTP

**Validator:** `otpValidator`
**Regex:** `OTP_FULL_REGEX = /^\d{6}$/`
**Purpose:** Validates a 6-digit one-time password. Per-box input also uses `OTP_DIGIT_REGEX = /^[0-9]$/`.

**Valid:** `123456`, `000000`
**Invalid:** `12345` (5 digits), `1234567` (7 digits), `12345a` (letter)

**Edge cases:** Non-digits are silently stripped from paste events via `/\D/g` before validation. Empty string is handled by `Validators.required`.

**Error messages:**
| Condition | Message |
|-----------|---------|
| Empty | `OTP is required.` |
| Fails regex | `OTP must contain exactly 6 digits.` |
| Server reject (< 3 attempts) | `Invalid OTP.` |
| >= 3 failed attempts | `Maximum attempts exceeded.` |

**Pages:** Verify OTP

---

## 8. Email Error Hint Helper

**Function:** `getEmailErrorHint(value: string): string`
**Purpose:** Returns a specific, user-friendly message when `invalidEmail` fires, instead of a generic fallback.

| Input | Output |
|-------|--------|
| `ziadgmail.com` | `Missing @ symbol.` |
| `ziad@` | `Missing domain after @.` |
| `ziad@gmail` | `Missing dot before TLD (e.g. gmail.com).` |
| `ziad@@gmail.com` | `Multiple @ symbols detected.` |
| `ziad..test@gmail.com` | `Consecutive dots detected.` |
| anything else invalid | `Please enter a valid email address.` |

**Used in:** Login, Register, Forgot Password

---

## 9. Password Strength (UI only)

**Function:** `calcPasswordStrength(value: string): PasswordStrength`
**Purpose:** Scores password 0–5 for the animated strength bar. Display only — not a form validator.

**Scoring:** +1 per criterion met (length >= 8, uppercase, lowercase, digit, special), +1 bonus if length >= 14, capped at 5.

| Score | Label | CSS class |
|-------|-------|-----------|
| 0 | *(hidden)* | `ps-none` |
| 1 | Very Weak | `ps-very-weak` |
| 2 | Weak | `ps-weak` |
| 3 | Medium | `ps-medium` |
| 4 | Strong | `ps-strong` |
| 5 | Very Strong | `ps-very-strong` |

**Pages:** Register (Step 2), Reset Password

---

*All validators defined in a single file. No validator logic is duplicated in any component.*
