# REGEX AUDIT REPORT
## AegisLex — All Regex Patterns Verified Against Source of Truth
### Date: 2026-06-22

---

## SOURCE FILE
`src/app/shared/auth-components/auth-validators.ts`

All regex constants are defined once and imported everywhere. There is no duplication.

---

## EMAIL_REGEX

**Exact definition:**
```typescript
export const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;
```

**Usage locations:**
- `auth-validators.ts` — `emailValidator()` function
- `login.component.ts` — `loginDisabled` getter (imported as `EMAIL_REGEX`)

**Audit result:** ✅ Single definition, imported correctly everywhere.

---

## PASSWORD_UPPERCASE_REGEX

**Exact definition:**
```typescript
export const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
```

**Usage locations:**
- `auth-validators.ts` — `passwordValidator()`, `calcPasswordStrength()`
- `password-requirements.component.ts` — requirement checking

**Audit result:** ✅ Single definition, imported correctly.

---

## PASSWORD_LOWERCASE_REGEX

**Exact definition:**
```typescript
export const PASSWORD_LOWERCASE_REGEX = /[a-z]/;
```

**Usage locations:**
- `auth-validators.ts` — `passwordValidator()`, `calcPasswordStrength()`
- `password-requirements.component.ts` — requirement checking

**Audit result:** ✅ Single definition, imported correctly.

---

## PASSWORD_NUMBER_REGEX

**Exact definition:**
```typescript
export const PASSWORD_NUMBER_REGEX = /\d/;
```

**Usage locations:**
- `auth-validators.ts` — `passwordValidator()`, `calcPasswordStrength()`
- `password-requirements.component.ts` — requirement checking

**Audit result:** ✅ Single definition, imported correctly.

---

## PASSWORD_SPECIAL_REGEX

**Exact definition:**
```typescript
export const PASSWORD_SPECIAL_REGEX = /[^\w\s]/;
```

**Matches:** Any character that is NOT a word character (`[A-Za-z0-9_]`) and NOT whitespace.
**Accepted special characters include:** `! @ # $ % ^ & * ( ) - + = [ ] { } | ; ' " , . < > / ?`

**Usage locations:**
- `auth-validators.ts` — `passwordValidator()`, `calcPasswordStrength()`
- `password-requirements.component.ts` — requirement checking

**Audit result:** ✅ Single definition, imported correctly.

---

## OTP_DIGIT_REGEX

**Exact definition:**
```typescript
export const OTP_DIGIT_REGEX = /^[0-9]$/;
```

**Usage:** Per-box digit validation in `verify-otp.component.ts`.

**Audit result:** ✅ Single definition.

---

## OTP_FULL_REGEX

**Exact definition:**
```typescript
export const OTP_FULL_REGEX = /^\d{6}$/;
```

**Usage:** Full 6-digit OTP string validation.

**Audit result:** ✅ Single definition.

---

## WHITESPACE_ONLY_REGEX

**Exact definition:**
```typescript
export const WHITESPACE_ONLY_REGEX = /^\s+$/;
```

**Usage:** Exported for legacy compatibility. Whitespace detection is applied inline in each validator via `trim()` comparison.

**Audit result:** ✅ Exported but logic handled inline in validators.

---

## CROSS-COMPONENT REGEX CONSISTENCY CHECK

| Component | EMAIL_REGEX | PW Regexes | OTP Regexes | Any Inline Regex |
|---|---|---|---|---|
| `auth-validators.ts` | Defined here | Defined here | Defined here | None |
| `register.component.ts` | Imported | Imported | N/A | None |
| `reset-password.component.ts` | N/A | Imported | N/A | None |
| `forgot-password.component.ts` | Imported | N/A | N/A | None |
| `login.component.ts` | Imported | N/A | N/A | None |
| `profile.component.ts` (fixed) | Imported | Imported | N/A | None |
| `password-requirements.component.ts` | N/A | Imported | N/A | None |
| `password-strength.component.ts` | N/A | Imported (via `calcPasswordStrength`) | N/A | None |

**Audit result:** ✅ Zero inline regex duplication. All regex sourced from `auth-validators.ts`.

---

## DOCUMENTATION CONSISTENCY CHECK

| Document | EMAIL_REGEX accurate | PW rules accurate | Org rules accurate | Status |
|---|---|---|---|---|
| `REGEX-COMPLIANCE-AUDIT.md` | ✅ | ✅ | ✅ | No update needed |
| `REGEX-DOCUMENTATION.md` | ✅ | ✅ | ✅ | No update needed |
| `REGEX-FULL-REFERENCE.md` | ✅ | ✅ | ✅ | No update needed |
| `REGEX-REFERENCE.md` | ✅ | ✅ | ✅ | No update needed |
| `VALIDATION_RULES.md` | ✅ | ✅ | ✅ | No update needed |
| `ACCOUNT_REGEX_REFERENCE.md` | ✅ (new) | ✅ (new) | ✅ (new) | Created this session |

**Final audit result:** ✅ All regex patterns consistent. No conflicts or mismatches found.

