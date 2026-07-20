# AegisLex — REGEX-REFERENCE.md

**Authentication Validators, Regex Patterns & Error Messages**
Source of truth: `src/app/shared/auth-components/auth-validators.ts`

> **Global Trim Rule:** Every validator calls `.trim()` on the raw control value
> before applying any length check or regex test. Leading and trailing whitespace
> are always ignored. Empty values after `.trim()` are handled by Angular's
> `Validators.required` unless the field is explicitly optional.

---

## 1. Regex Constants Quick Reference

All constants are exported from `src/app/shared/auth-components/auth-validators.ts`.
No regex is defined in any component, service, or adapter file.

| Constant | Exact Pattern | Status |
|----------|---------------|--------|
| `EMAIL_REGEX` | `/^[A-Za-z0-9._%+-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/` | ✅ Active |
| `PASSWORD_UPPERCASE_REGEX` | `/[A-Z]/` | ✅ Active |
| `PASSWORD_LOWERCASE_REGEX` | `/[a-z]/` | ✅ Active |
| `PASSWORD_NUMBER_REGEX` | `/\d/` | ✅ Active |
| `PASSWORD_SPECIAL_REGEX` | `/[^\w\s]/` | ✅ Active |
| `OTP_DIGIT_REGEX` | `/^[0-9]$/` | ✅ Active (exported) |
| `OTP_FULL_REGEX` | `/^\d{6}$/` | ✅ Active |
| `WHITESPACE_ONLY_REGEX` | `/^\s+$/` | Exported, legacy compat |

---

## 2. Validation Matrix

| Field | Required | Trim | Min | Max | Regex | Validator |
|-------|----------|------|-----|-----|-------|-----------|
| First Name | Yes | Yes | 3 chars | 50 chars | None | `firstNameValidator` |
| Last Name | Yes | Yes | 3 chars | 50 chars | None | `lastNameValidator` |
| Email | Yes | Yes | — | 254 chars | `EMAIL_REGEX` | `emailValidator` |
| Organization | **No** | Yes | 2 (if provided) | 100 (if provided) | None | `organizationValidator` |
| Password | Yes | Yes | 8 chars | 64 chars | 4 character-class checks | `passwordValidator` |
| Confirm Password | Yes | Yes | — | — | Equality check | `passwordMatchValidator` (group) |
| OTP | Yes | No | 6 digits | 6 digits | `OTP_FULL_REGEX` | `otpValidator` / inline |

---

## 3. Validator: `emailValidator`

**File:** `src/app/shared/auth-components/auth-validators.ts`
**Angular error keys returned:** `emailTooLong`, `invalidEmail`

### Purpose

Validates a correctly formatted email address using a hardened regex that rejects
malformed domains — consecutive dots, hyphen-starting/ending labels, leading or
trailing dots, missing TLD dot, single-label domains like `localhost`.

### Regex Used

```
EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/
```

### Pattern Breakdown

| Section | Pattern | Meaning |
|---------|---------|---------|
| Start | `^` | Anchor — no partial matches |
| Local part | `[A-Za-z0-9._%+-]+` | Letters, digits, `.` `_` `%` `+` `-` — one or more |
| At-sign | `@` | Required literal |
| First label start | `[A-Za-z0-9]` | Must begin with alphanum — no leading hyphen |
| First label body | `([A-Za-z0-9-]*[A-Za-z0-9])?` | Middle may include hyphens; ends with alphanum |
| Extra labels | `(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*` | Each preceded by `\.`; same no-hyphen-edge rules; makes consecutive dots impossible |
| TLD dot | `\.` | Mandatory dot before TLD |
| TLD | `[A-Za-z]{2,}` | 2+ alpha-only chars |
| End | `$` | Nothing after TLD |

### How Each Requirement Is Enforced

| Requirement | Mechanism |
|-------------|-----------|
| No consecutive dots | Each `\.` must be followed by `[A-Za-z0-9]` |
| Labels can't start with `-` | Every label opens with `[A-Za-z0-9]` |
| Labels can't end with `-` | Body section ends with `[A-Za-z0-9]` |
| No leading dot in domain | Domain starts with `[A-Za-z0-9]`, not `\.` |
| No trailing dot | Must end with `[A-Za-z]{2,}$` |
| Domain must have a dot | Mandatory `\.[A-Za-z]{2,}` (TLD) |
| TLD ≥ 2 alpha-only | `[A-Za-z]{2,}` — no digits or hyphens |
| No spaces | `trim()` before test; no `\s` in pattern |
| Max 254 chars | Length check before regex in `emailValidator` |

### Validation Logic

```
1. v = value.trim()
2. if (!v)             → null  (Validators.required handles empty)
3. if (v.length > 254) → { emailTooLong: true }
4. if (!EMAIL_REGEX.test(v)) → { invalidEmail: true }
5. return null
```

### Valid Examples

| Address | Why |
|---------|-----|
| `user@example.com` | Standard |
| `user.name@example.co.uk` | Multi-label, dot in local |
| `info@aegislex.ai` | 2-char TLD |
| `contact@law-firm.com` | Hyphen in middle of label |
| `ahmed.al-mansouri@corp.legal` | Hyphens and dots |
| `demo@aegislex.com` | Demo user address |

### Invalid Examples

| Address | Reason |
|---------|--------|
| `user@domain..com` | Consecutive dots |
| `user@-domain.com` | Label starts with hyphen |
| `user@domain-.com` | Label ends with hyphen |
| `user@.domain.com` | Leading dot in domain |
| `user@domain.com.` | Trailing dot |
| `user@domain` | No TLD dot |
| `user@localhost` | No dot at all |
| `user @example.com` | Space (removed by trim, result fails) |
| `user@d.c` | TLD only 1 char |

### Error Messages

| Error key | Message |
|-----------|---------|
| `required` | `Email is required.` |
| `emailTooLong` | `Email cannot exceed 254 characters.` |
| `invalidEmail` | `Please enter a valid email address.` |

### Usage Locations

| Component | File | How used |
|-----------|------|---------|
| Register (Step 1) | `features/auth/register/register.component.ts` | `[Validators.required, emailValidator]` |
| Login | `features/auth/login/login.component.ts` | `[Validators.required, emailValidator]`; `EMAIL_REGEX` in `loginDisabled` getter |
| Forgot Password | `features/auth/forgot-password/forgot-password.component.ts` | `[Validators.required, emailValidator]` |

---

## 4. Validator: `firstNameValidator`

**File:** `src/app/shared/auth-components/auth-validators.ts`
**Angular error keys returned:** `nameTooShort`, `nameTooLong`

### Purpose

Validates first name is 3–50 characters (trimmed). Internal spaces allowed.

### Regex Used

None — pure length check on trimmed string.

### Validation Logic

```
1. v = value.trim()
2. if (!v)            → null
3. if (v.length < 3)  → { nameTooShort: true }
4. if (v.length > 50) → { nameTooLong: true }
5. return null
```

### Valid / Invalid Examples

**Valid:** `Ali`, `Mary Jane`, `Al-Mansouri`, `   Ahmed   ` (trimmed)
**Invalid:** `Jo` (2 chars), `A` (1 char), `  ` (whitespace only)

### Error Messages

| Error key | Message |
|-----------|---------|
| `required` | `First name is required.` |
| `nameTooShort` | `First name must contain at least 3 characters.` |
| `nameTooLong` | `First name cannot exceed 50 characters.` |

**Used in:** Register (Step 1)

---

## 5. Validator: `lastNameValidator`

Same logic as `firstNameValidator`. Separate function for distinct error messages.

### Error Messages

| Error key | Message |
|-----------|---------|
| `required` | `Last name is required.` |
| `nameTooShort` | `Last name must contain at least 3 characters.` |
| `nameTooLong` | `Last name cannot exceed 50 characters.` |

**Used in:** Register (Step 1)

---

## 6. Validator: `organizationValidator`

**File:** `src/app/shared/auth-components/auth-validators.ts`
**Angular error keys returned:** `orgTooShort`, `orgTooLong`

Optional field. Empty → always valid. If non-empty: 2–100 chars trimmed.

### Validation Logic

```
1. v = value.trim()
2. if (!v)             → null  (OPTIONAL)
3. if (v.length < 2)   → { orgTooShort: true }
4. if (v.length > 100) → { orgTooLong: true }
5. return null
```

### Error Messages

| Error key | Message |
|-----------|---------|
| `orgTooShort` | `Organization must contain at least 2 characters.` |
| `orgTooLong` | `Organization cannot exceed 100 characters.` |

**Used in:** Register (Step 1) — no `Validators.required` on this control

---

## 7. Validator: `passwordValidator`

**File:** `src/app/shared/auth-components/auth-validators.ts`
**Angular error keys returned:** `pwTooShort`, `pwTooLong`, `pwNoUpper`, `pwNoLower`, `pwNoNumber`, `pwNoSpecial`

All failing rules are collected and returned simultaneously.

### Regex Constants

| Constant | Pattern | Checks |
|----------|---------|--------|
| `PASSWORD_UPPERCASE_REGEX` | `/[A-Z]/` | At least one uppercase A–Z |
| `PASSWORD_LOWERCASE_REGEX` | `/[a-z]/` | At least one lowercase a–z |
| `PASSWORD_NUMBER_REGEX` | `/\d/` | At least one digit 0–9 |
| `PASSWORD_SPECIAL_REGEX` | `/[^\w\s]/` | At least one special character |

### `PASSWORD_SPECIAL_REGEX` — `/[^\w\s]/`

| Token | Meaning |
|-------|---------|
| `[^ ... ]` | Negated class |
| `\w` | Word chars: `[A-Za-z0-9_]` |
| `\s` | Whitespace |
| Combined | NOT alphanum, NOT underscore, NOT whitespace |

**Matched characters:** `!` `@` `#` `$` `%` `^` `&` `*` `(` `)` `-` `+` `=` `[` `]` `{` `}` `|` `;` `'` `"` `,` `.` `<` `>` `/` `?`

### Validation Logic

```
1. v = value.trim()
2. if (!v) → null
3. Collect ALL failures simultaneously:
   v.length < 8                      → pwTooShort
   v.length > 64                     → pwTooLong
   !PASSWORD_UPPERCASE_REGEX.test(v) → pwNoUpper
   !PASSWORD_LOWERCASE_REGEX.test(v) → pwNoLower
   !PASSWORD_NUMBER_REGEX.test(v)    → pwNoNumber
   !PASSWORD_SPECIAL_REGEX.test(v)   → pwNoSpecial
4. Return all errors at once
5. return null
```

### Error Messages (all shown simultaneously)

| Error key | Message |
|-----------|---------|
| `required` | `Password is required.` |
| `pwTooShort` | `Password must contain at least 8 characters.` |
| `pwTooLong` | `Password cannot exceed 64 characters.` |
| `pwNoUpper` | `Password must contain at least one uppercase letter.` |
| `pwNoLower` | `Password must contain at least one lowercase letter.` |
| `pwNoNumber` | `Password must contain at least one number.` |
| `pwNoSpecial` | `Password must contain at least one special character.` |

**Used in:** Register (Step 2), Reset Password, `PasswordRequirementsComponent`, `calcPasswordStrength`

---

## 8. Validator: `passwordMatchValidator`

**Angular error key returned:** `passwordMismatch` (on the **form group**)

Cross-field validator — compares `password` and `confirmPassword` after trimming both.

### Validation Logic

```
1. pw  = group.get('password').value.trim()
2. cpw = group.get('confirmPassword').value.trim()
3. if (!pw || !cpw) → null
4. if (pw !== cpw)  → { passwordMismatch: true }
5. return null
```

### Error Messages

| Context | Error key | Message |
|---------|-----------|---------|
| `confirmPassword` | `required` | `Confirm password is required.` |
| form group | `passwordMismatch` | `Passwords do not match.` |

**Used in:** Register form group, Reset Password form group

---

## 9. Validator: `otpValidator`

**Angular error key returned:** `invalidOtp`

### Regex Used

```
OTP_FULL_REGEX = /^\d{6}$/
```

| Token | Meaning |
|-------|---------|
| `^` | Start anchor |
| `\d{6}` | Exactly 6 decimal digits |
| `$` | End anchor |

**Valid:** `123456`, `000000`, `999999`
**Invalid:** `12345` (5), `1234567` (7), `12345a` (letter), `12 345` (space)

### Error Messages

| Condition | Message |
|-----------|---------|
| Empty | `OTP is required.` |
| Fails regex | `OTP must contain exactly 6 digits.` |
| Server rejects (< 3 tries) | `Invalid OTP.` |
| ≥ 3 failed attempts | `Maximum attempts exceeded.` |

**Used in:** `verify-otp.component.ts`

---

## 10. Inline Regex: Non-Digit Strip

**File:** `src/app/features/auth/verify-otp/verify-otp.component.ts`
**Pattern:** `/\D/g`

Sanitization only — strips non-digits silently from input and paste events.

| Token | Meaning |
|-------|---------|
| `\D` | Any character NOT a digit (inverse of `\d`) |
| `g` | Global — replaces all occurrences |

```typescript
val    = val.replace(/\D/g, '');               // onDigitInput
pasted = clipboardText.replace(/\D/g, '');     // onPaste
```

**Examples:** `"abc123"` → `"123"`, `"OTP: 789012"` → `"789012"`, `"12-34-56"` → `"123456"`

---

## 11. Helper: `calcPasswordStrength`

**File:** `src/app/shared/auth-components/auth-validators.ts`

Scores a password 0–5 for the 5-segment animated strength bar.

**Regex used:** `PASSWORD_UPPERCASE_REGEX`, `PASSWORD_LOWERCASE_REGEX`,
`PASSWORD_NUMBER_REGEX`, `PASSWORD_SPECIAL_REGEX`

### Scoring Rules (trimmed value)

| Condition | Points |
|-----------|--------|
| Empty | 0, return immediately |
| `length >= 8` | +1 |
| Contains uppercase | +1 |
| Contains lowercase | +1 |
| Contains digit | +1 |
| Contains special char | +1 |
| `length >= 14` (bonus) | +1, capped at 5 |

### Score → Display

| Score | Label | Bar | CSS class |
|-------|-------|-----|-----------|
| 0 | *(not shown)* | 0% | `ps-none` |
| 1 | Very Weak | 10% | `ps-very-weak` |
| 2 | Weak | 30% | `ps-weak` |
| 3 | Medium | 55% | `ps-medium` |
| 4 | Strong | 78% | `ps-strong` |
| 5 | Very Strong | 100% | `ps-very-strong` |

**Used in:** `PasswordStrengthComponent`, Register, Reset Password

---

## 12. Server Error Code Map

**File:** `src/app/shared/auth-components/auth-validators.ts` — `AUTH_ERROR_MAP`
**Helper:** `mapAuthError(code, fallback?)`

| Backend Code | User-facing message |
|-------------|---------------------|
| `INVALID_CREDENTIALS` | `Invalid email or password.` |
| `ACCOUNT_DISABLED` | `Your account is disabled. Please contact support.` |
| `ACCOUNT_LOCKED` | `Your account is temporarily locked. Please try again later.` |
| `EMAIL_ALREADY_EXISTS` | `An account with this email address already exists.` |
| `USER_NOT_FOUND` | `User not found.` |
| `OTP_RATE_LIMIT` | `OTP rate limit exceeded.` |
| `INVALID_OTP` | `Invalid OTP.` |
| `OTP_EXPIRED` | `OTP expired.` |
| `MAX_ATTEMPTS` | `Maximum attempts exceeded.` |
| `WEAK_PASSWORD` | `Weak password.` |
| `RESET_TOKEN_INVALID` | `Invalid reset session.` |
| `RESET_TOKEN_EXPIRED` | `Reset session expired.` |
| `SERVER_ERROR` | `Something went wrong. Please try again.` |
| `NETWORK_ERROR` | `A network error occurred. Please check your connection and try again.` |
| `TOO_MANY_REQUESTS` | `Too many attempts. Please wait a few minutes before trying again.` |

---

## 13. Error Messages by Page

### Register — Step 1

| Field | Condition | Message |
|-------|-----------|---------|
| First Name | Empty | `First name is required.` |
| First Name | < 3 chars | `First name must contain at least 3 characters.` |
| First Name | > 50 chars | `First name cannot exceed 50 characters.` |
| Last Name | Empty | `Last name is required.` |
| Last Name | < 3 chars | `Last name must contain at least 3 characters.` |
| Last Name | > 50 chars | `Last name cannot exceed 50 characters.` |
| Email | Empty | `Email is required.` |
| Email | > 254 chars | `Email cannot exceed 254 characters.` |
| Email | Invalid format | `Please enter a valid email address.` |
| Organization | < 2 chars | `Organization must contain at least 2 characters.` |
| Organization | > 100 chars | `Organization cannot exceed 100 characters.` |

### Register — Step 2

| Field | Condition | Message |
|-------|-----------|---------|
| Password | Empty | `Password is required.` |
| Password | < 8 chars | `Password must contain at least 8 characters.` |
| Password | > 64 chars | `Password cannot exceed 64 characters.` |
| Password | No uppercase | `Password must contain at least one uppercase letter.` |
| Password | No lowercase | `Password must contain at least one lowercase letter.` |
| Password | No digit | `Password must contain at least one number.` |
| Password | No special | `Password must contain at least one special character.` |
| Confirm | Empty | `Confirm password is required.` |
| Confirm | Mismatch | `Passwords do not match.` |

### Login

| Source | Condition | Message |
|--------|-----------|---------|
| Email | Empty | `Email is required.` |
| Email | > 254 | `Email cannot exceed 254 characters.` |
| Email | Invalid | `Please enter a valid email address.` |
| Password | Empty | `Password is required.` |
| Server | `INVALID_CREDENTIALS` | `Invalid email or password.` |
| Server | `ACCOUNT_DISABLED` | `Your account is disabled. Please contact support.` |
| Server | `ACCOUNT_LOCKED` | `Your account is temporarily locked. Please try again later.` |
| Server | other | `Something went wrong. Please try again.` |

### Forgot Password

| Source | Condition | Message |
|--------|-----------|---------|
| Email | Empty | `Email is required.` |
| Email | > 254 | `Email cannot exceed 254 characters.` |
| Email | Invalid | `Please enter a valid email address.` |
| Server | `USER_NOT_FOUND` | `User not found.` |
| Server | `ACCOUNT_DISABLED` | `Account disabled.` |
| Server | `OTP_RATE_LIMIT` | `OTP rate limit exceeded.` |
| Server | other | `Something went wrong. Please try again.` |

### Verify OTP

| Condition | Message |
|-----------|---------|
| Empty | `OTP is required.` |
| Not 6 digits | `OTP must contain exactly 6 digits.` |
| Server reject (< 3) | `Invalid OTP.` |
| ≥ 3 attempts | `Maximum attempts exceeded.` |

### Reset Password

| Source | Condition | Message |
|--------|-----------|---------|
| Password | Empty | `Password is required.` |
| Password | < 8 chars | `Password must contain at least 8 characters.` |
| Password | > 64 chars | `Password cannot exceed 64 characters.` |
| Password | No uppercase | `Password must contain at least one uppercase letter.` |
| Password | No lowercase | `Password must contain at least one lowercase letter.` |
| Password | No digit | `Password must contain at least one number.` |
| Password | No special | `Password must contain at least one special character.` |
| Confirm | Empty | `Confirm password is required.` |
| Confirm | Mismatch | `Passwords do not match.` |
| Server | `WEAK_PASSWORD` | `Weak password.` |
| Server | `RESET_TOKEN_INVALID` | `Invalid reset session.` |
| Server | `RESET_TOKEN_EXPIRED` | `Reset session expired.` |
| Server | other | `Something went wrong. Please try again.` |

---

*All validators, regex constants, and error mappings are defined in a single file:*
**`src/app/shared/auth-components/auth-validators.ts`**

*No validator logic is duplicated in any component, service, adapter, or guard.*
*All three email-validating pages import exclusively from this shared file.*
