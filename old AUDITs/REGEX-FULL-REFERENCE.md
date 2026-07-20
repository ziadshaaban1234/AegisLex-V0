# AegisLex — REGEX-FULL-REFERENCE.md

Source: `src/app/shared/auth-components/auth-validators.ts`
This file documents only validators that **physically exist** in the codebase.

---

## 1. Email Validator

**Constant:** `EMAIL_REGEX`
**Used in:** `emailValidator(ctrl)`

### Actual Regex
```
/^[A-Za-z0-9._%+-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/
```

### Character-by-Character Breakdown

```
^
  Start of string — no leading characters allowed

[A-Za-z0-9._%+-]+
  Local part (before @)
  A-Z          uppercase letters
  a-z          lowercase letters
  0-9          digits
  .            dot (allowed mid-local, but regex does NOT explicitly
               forbid leading/trailing dots — that is caught by
               getEmailErrorHint() at the UI layer)
  _            underscore
  %            percent
  +            plus
  -            hyphen
  +            one or more of the above characters required

@
  The literal @ symbol — exactly one (multiple @ would break the pattern
  since the local part [A-Za-z0-9._%+-]+ does not include @)

[A-Za-z0-9]
  First character of the first domain label
  Must be alphanumeric — cannot start with hyphen

([A-Za-z0-9-]*[A-Za-z0-9])?
  Optional remainder of the first domain label
  [A-Za-z0-9-]*   zero or more alphanumeric or hyphen
  [A-Za-z0-9]     must end with alphanumeric — cannot end with hyphen
  ?               entire group is optional (single-char labels like "x" are valid)

(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*
  Zero or more additional domain labels, each preceded by a dot
  \.               literal dot separator
  [A-Za-z0-9]      label must start with alphanumeric
  ([A-Za-z0-9-]*[A-Za-z0-9])?   optional rest of label (same hyphen rule)
  *                zero or more subdomain labels allowed

\.
  The mandatory dot before the TLD

[A-Za-z]{2,}
  TLD — two or more English letters only
  No digits allowed in TLD
  No dot allowed in TLD

$
  End of string — no trailing characters allowed
```

### Purpose
Validates that an email has a valid local part, exactly one @, a properly structured domain, and an alphabetic TLD of at least 2 characters.

### Validation Flow
1. Trim value
2. If empty after trim → `{ required: true }` (only if raw value was non-empty whitespace)
3. If length > 254 → `{ emailTooLong: true }`
4. If fails `EMAIL_REGEX` → `{ invalidEmail: true }`
5. `getEmailErrorHint(value)` then maps `invalidEmail` to a specific message

### Valid Examples
| Input | Why valid |
|-------|-----------|
| `user@example.com` | Standard email |
| `ahmed.ali@corp.legal` | Dots in local, alpha TLD |
| `info+tag@aegislex.ae` | Plus addressing |
| `u@x.io` | Minimal: 1-char local, 1-char label, 2-char TLD |
| `m@sub.domain.com` | Subdomain |

### Invalid Examples
| Input | Error |
|-------|-------|
| `ziadgmail.com` | Missing @ symbol |
| `ziad@` | Missing domain |
| `ziad@gmail` | Missing dot before TLD |
| `ziad@@gmail.com` | Multiple @ symbols |
| `ziad..test@gmail.com` | Consecutive dots (local part violates `[A-Za-z0-9._%+-]+` — two consecutive dots would still match, but `getEmailErrorHint` catches it for messaging) |
| `.ziad@gmail.com` | Leading dot — regex allows it, UI hint catches it |
| `ziad.@gmail.com` | Trailing dot before @ — regex allows it, UI hint catches it |
| `user@-bad.com` | Domain label starts with hyphen |
| `user@bad-.com` | Domain label ends with hyphen |
| `user@gmail.123` | TLD is digits — fails `[A-Za-z]{2,}` |

### Edge Cases
- TLD must be letters only (`[A-Za-z]{2,}`) — `.123` fails
- Hyphen cannot be at start or end of any domain label
- Subdomains supported (any count)
- Underscore allowed in local part, not in domain
- Single-character local part is valid (`u@x.io`)
- Leading/trailing dots in local part: regex technically permits, caught by `getEmailErrorHint`

### Related Error Messages
| Key | Message source |
|-----|---------------|
| `required` | `'Email is required.'` |
| `emailTooLong` | `'Email cannot exceed 254 characters.'` |
| `invalidEmail` | `getEmailErrorHint(value)` — see §8 |

### Pages Using It
- Login (`login.component.ts`)
- Register Step 1 (`register.component.ts`)
- Forgot Password (`forgot-password.component.ts`)

---

## 2. Password Validator

**Used in:** `passwordValidator(ctrl)`

### Actual Regexes (four separate checks)

```
PASSWORD_UPPERCASE_REGEX = /[A-Z]/
PASSWORD_LOWERCASE_REGEX = /[a-z]/
PASSWORD_NUMBER_REGEX    = /\d/
PASSWORD_SPECIAL_REGEX   = /[^\w\s]/
```

### Character-by-Character Breakdown

#### `PASSWORD_UPPERCASE_REGEX = /[A-Z]/`
```
[A-Z]
  Character class — any single uppercase English letter A through Z
  No anchors — tests anywhere in the string
```

#### `PASSWORD_LOWERCASE_REGEX = /[a-z]/`
```
[a-z]
  Character class — any single lowercase English letter a through z
  No anchors — tests anywhere in the string
```

#### `PASSWORD_NUMBER_REGEX = /\d/`
```
\d
  Shorthand for [0-9] — any single decimal digit
  No anchors — tests anywhere in the string
```

#### `PASSWORD_SPECIAL_REGEX = /[^\w\s]/`
```
[^   ]
  Negated character class — matches anything NOT in the class

\w
  Word characters: [A-Za-z0-9_]
  Note: underscore _ IS a word character, so it is NOT a special char here

\s
  Whitespace characters: space, tab, newline, etc.

Combined: matches any character that is not alphanumeric, not underscore, not whitespace.
Examples that match: ! @ # $ % ^ & * ( ) - + = [ ] { } | ; ' " , . < > / ?
```

### Purpose
Enforces all four criteria for a strong password in combination with length checks. All failures are returned simultaneously (not one at a time).

### Validation Flow
1. Trim value
2. If empty → `{ required: true }`
3. If length < 8 → `{ pwTooShort: true }`
4. If length > 64 → `{ pwTooLong: true }`
5. If no uppercase → `{ pwNoUpper: true }`
6. If no lowercase → `{ pwNoLower: true }`
7. If no digit → `{ pwNoNumber: true }`
8. If no special char → `{ pwNoSpecial: true }`
9. Steps 5–8 are collected and returned together

### Valid Examples
| Input | Why valid |
|-------|-----------|
| `Secure#Pass1` | Upper, lower, digit, special, 13 chars |
| `LegalA1@Dubai` | All criteria met |
| `Aa1!aaaa` | Exactly 8 chars, all criteria |

### Invalid Examples
| Input | Errors |
|-------|--------|
| `password` | No upper, no digit, no special |
| `SHORT1!` | Too short (7 chars) |
| `NOLOWER1!` | No lowercase |
| `NoSpecial1` | No special character |
| `NoDigit!A` | No digit |
| `under_score1A` | Underscore is NOT a special char — `pwNoSpecial` fires |

### Edge Cases
- Underscore `_` is matched by `\w` so it does NOT satisfy `PASSWORD_SPECIAL_REGEX`
- All errors fire together: `NOLOWERNODIGIT!` → `pwNoLower + pwNoNumber` simultaneously
- Length check runs before character checks; short passwords still collect all errors

### Related Error Messages
| Key | Message |
|-----|---------|
| `required` | `Password is required.` |
| `pwTooShort` | `Password must contain at least 8 characters.` |
| `pwTooLong` | `Password cannot exceed 64 characters.` |
| `pwNoUpper` | `Password must contain at least one uppercase letter.` |
| `pwNoLower` | `Password must contain at least one lowercase letter.` |
| `pwNoNumber` | `Password must contain at least one number.` |
| `pwNoSpecial` | `Password must contain at least one special character.` |

### Pages Using It
- Register Step 2 (`register.component.ts`)
- Reset Password (`reset-password.component.ts`)

---

## 3. Confirm Password Validator

**Used in:** `passwordMatchValidator(group)` — applied at **form group level**

### Actual Logic (no regex)
```typescript
const pw  = group.get('password')?.value?.trim()      || '';
const cpw = group.get('confirmPassword')?.value?.trim() || '';
if (!pw || !cpw) return null;          // skip if either field is empty
return pw === cpw ? null : { passwordMismatch: true };
```

### Purpose
Ensures the `confirmPassword` field matches `password`. Returns error on the group, not on either control individually.

### Validation Flow
1. Trim both values
2. If either is empty → return `null` (no premature mismatch error)
3. If equal → `null` (valid)
4. If not equal → `{ passwordMismatch: true }` on the form group

### Valid Examples
| password | confirmPassword | Result |
|----------|----------------|--------|
| `Secure#Pass1` | `Secure#Pass1` | valid |
| `` | `Secure#Pass1` | null (deferred) |

### Invalid Examples
| password | confirmPassword | Result |
|----------|----------------|--------|
| `Secure#Pass1` | `Secure#Pass2` | `passwordMismatch` |
| `Secure#Pass1` | `secure#pass1` | `passwordMismatch` (case-sensitive) |

### Edge Cases
- Case-sensitive: `Password1!` ≠ `password1!`
- Trim applied to both before comparison

### Related Error Messages
| Condition | Message |
|-----------|---------|
| `required` (confirmPassword untouched) | `Confirm password is required.` |
| `passwordMismatch` | `Passwords do not match.` |

### Pages Using It
- Register Step 2 (`register.component.ts`)
- Reset Password (`reset-password.component.ts`)

---

## 4. First Name Validator

**Used in:** `firstNameValidator(ctrl)`

### Actual Logic (no regex — pure length check)
```typescript
const v = (ctrl.value as string || '').trim();
if (!v)           return { required: true };
if (v.length < 3) return { nameTooShort: true };
if (v.length > 50) return { nameTooLong: true };
return null;
```

### Purpose
Ensures the first name is between 3 and 50 characters after trimming. No character-set restriction.

### Validation Flow
1. Trim value
2. Empty → `{ required: true }`
3. Length < 3 → `{ nameTooShort: true }`
4. Length > 50 → `{ nameTooLong: true }`
5. Otherwise → `null` (valid)

### Valid Examples
`Ali`, `Mary Jane`, `Al-Mansouri`, `Søren`, `محمد`

### Invalid Examples
| Input | Error |
|-------|-------|
| `Jo` | `nameTooShort` (2 chars) |
| `A` | `nameTooShort` (1 char) |
| `   ` | `required` (whitespace only) |
| 51-char string | `nameTooLong` |

### Edge Cases
- Hyphens, spaces, and Unicode characters are all allowed
- Whitespace-only treated as empty
- No regex — character type is unrestricted

### Related Error Messages
| Key | Message |
|-----|---------|
| `required` | `First name is required.` |
| `nameTooShort` | `First name must contain at least 3 characters.` |
| `nameTooLong` | `First name cannot exceed 50 characters.` |

### Pages Using It
- Register Step 1 (`register.component.ts`)

---

## 5. Last Name Validator

**Used in:** `lastNameValidator(ctrl)`

### Actual Logic
Identical to `firstNameValidator` — same trim, same 3–50 length check, no regex.

### Related Error Messages
| Key | Message |
|-----|---------|
| `required` | `Last name is required.` |
| `nameTooShort` | `Last name must contain at least 3 characters.` |
| `nameTooLong` | `Last name cannot exceed 50 characters.` |

### Pages Using It
- Register Step 1 (`register.component.ts`)

---

## 6. Organization Validator

**Used in:** `organizationValidator(ctrl)`

### Actual Logic (no regex — length check, field is optional)
```typescript
const v = (ctrl.value as string || '').trim();
if (!v) return null;                   // empty is valid — field is optional
if (v.length < 2)  return { orgTooShort: true };
if (v.length > 100) return { orgTooLong: true };
return null;
```

### Purpose
Optional field. If the user provides a value, it must be 2–100 characters.

### Validation Flow
1. Trim value
2. Empty → `null` (valid, field is optional)
3. Length < 2 → `{ orgTooShort: true }`
4. Length > 100 → `{ orgTooLong: true }`
5. Otherwise → `null`

### Valid Examples
`Al-Tamimi & Co`, `DIFC Courts`, `A` is invalid but `AB` is valid

### Invalid Examples
| Input | Error |
|-------|-------|
| `A` | `orgTooShort` (1 char) |
| 101-char string | `orgTooLong` |

### Related Error Messages
| Key | Message |
|-----|---------|
| `orgTooShort` | `Organization must contain at least 2 characters.` |
| `orgTooLong` | `Organization cannot exceed 100 characters.` |

### Pages Using It
- Register Step 1 (`register.component.ts`)

---

## 7. OTP Validator

**Constant:** `OTP_FULL_REGEX`, `OTP_DIGIT_REGEX`
**Used in:** `otpValidator(ctrl)` and per-box input filtering

### Actual Regexes
```
OTP_DIGIT_REGEX = /^[0-9]$/
OTP_FULL_REGEX  = /^\d{6}$/
```

### Character-by-Character Breakdown

#### `OTP_DIGIT_REGEX = /^[0-9]$/`
```
^        Start of string
[0-9]    A single decimal digit (0 through 9)
$        End of string
Result: matches exactly one digit — used per input box to filter keystrokes
```

#### `OTP_FULL_REGEX = /^\d{6}$/`
```
^        Start of string
\d       Any decimal digit [0-9]
{6}      Exactly 6 repetitions
$        End of string
Result: matches a string of exactly 6 digits and nothing else
```

### Purpose
- `OTP_DIGIT_REGEX`: Applied per-box on keydown/paste to silently reject non-digit input
- `OTP_FULL_REGEX`: Applied to the assembled 6-digit string on form submission

### Validation Flow
1. Per-box: each keypress is tested against `OTP_DIGIT_REGEX`; non-digits are dropped
2. On paste: `/\D/g` strips non-digits before distributing into boxes
3. On submit: assembled value tested against `OTP_FULL_REGEX`
4. Empty → `{ required: true }`
5. Fails `OTP_FULL_REGEX` → `{ invalidOtp: true }`

### Valid Examples
`123456`, `000000`, `999999`

### Invalid Examples
| Input | Error |
|-------|-------|
| `12345` | Too short (5 digits) |
| `1234567` | Too long (7 digits) |
| `12345a` | Contains letter |
| `` | `required` |

### Edge Cases
- Paste event: non-digits stripped via `/\D/g` before box distribution
- All-zeros (`000000`) is valid
- Server-side rejection after 3 failed attempts returns a different UI message

### Related Error Messages
| Condition | Message |
|-----------|---------|
| Empty | `OTP is required.` |
| Fails regex | `OTP must contain exactly 6 digits.` |
| Server reject (< 3 attempts) | `Invalid OTP.` |
| Server reject (≥ 3 attempts) | `Maximum attempts exceeded.` |

### Pages Using It
- Verify OTP (`verify-otp.component.ts`)

---

## 8. Email Error Hint Helper

**Function:** `getEmailErrorHint(value: string): string`
**Note:** This is NOT a validator. It runs after `EMAIL_REGEX` has already failed, to produce a specific message instead of the generic fallback.

### Logic (no additional regex — positional string inspection)
```typescript
const atCount = (v.match(/@/g) || []).length;
if (atCount === 0) return 'Missing @ symbol.';
if (atCount > 1)   return 'Multiple @ symbols detected.';

const atIdx = v.indexOf('@');
const local  = v.slice(0, atIdx);
const domain = v.slice(atIdx + 1);

if (local.startsWith('.')) return 'Email cannot start with a dot.';
if (local.endsWith('.'))   return 'Email cannot end with a dot before @.';
if (!domain)               return 'Missing domain after @.';
if (!domain.includes('.')) return 'Missing dot before TLD (e.g. gmail.com).';
if (/\.{2,}/.test(v))      return 'Consecutive dots detected.';

const tld = domain.split('.').pop() || '';
if (tld.length < 2 || !/^[A-Za-z]+$/.test(tld)) return 'Invalid or missing TLD.';

return 'Please enter a valid email address.';
```

### Message Map
| Input | Message |
|-------|---------|
| `ziadgmail.com` | `Missing @ symbol.` |
| `ziad@@gmail.com` | `Multiple @ symbols detected.` |
| `.ziad@gmail.com` | `Email cannot start with a dot.` |
| `ziad.@gmail.com` | `Email cannot end with a dot before @.` |
| `ziad@` | `Missing domain after @.` |
| `ziad@gmail` | `Missing dot before TLD (e.g. gmail.com).` |
| `ziad..test@gmail.com` | `Consecutive dots detected.` |
| Any other invalid | `Please enter a valid email address.` |

### Pages Using It
- Login, Register, Forgot Password (replaces the static `invalidEmail` message)

---

## 9. Password Strength Scorer (display only)

**Function:** `calcPasswordStrength(value: string): PasswordStrength`
**Note:** Not a validator. Used for the strength bar UI only. Does not block form submission.

### Logic
```typescript
let score = 0;
if (v.length >= 8)                    score++;   // length criterion
if (PASSWORD_UPPERCASE_REGEX.test(v)) score++;   // uppercase
if (PASSWORD_LOWERCASE_REGEX.test(v)) score++;   // lowercase
if (PASSWORD_NUMBER_REGEX.test(v))    score++;   // digit
if (PASSWORD_SPECIAL_REGEX.test(v))   score++;   // special char
if (v.length >= 14) score = Math.min(5, score + 1); // bonus for length
```

### Score Map
| Score | Label | Bar color |
|-------|-------|-----------|
| 0 | *(hidden)* | — |
| 1 | Very Weak | `#ef4444` (red) |
| 2 | Weak | `#f97316` (orange) |
| 3 | Medium | `#eab308` (yellow) |
| 4 | Strong | `#22c55e` (green) |
| 5 | Very Strong | `#10b981` (teal) |

### Pages Using It
- Register Step 2 (`register.component.ts`)
- Reset Password (`reset-password.component.ts`)

---

## 10. Whitespace-Only Helper

**Constant:** `WHITESPACE_ONLY_REGEX = /^\s+$/`

### Breakdown
```
^       Start of string
\s+     One or more whitespace characters (space, tab, newline, etc.)
$       End of string
Result: true if the entire string is whitespace
```

### Purpose
Exported for legacy compatibility. Used internally in validators to detect blank-but-non-empty input and return `required` instead of a length error.

### Pages Using It
Internal use in `auth-validators.ts` only — not referenced directly in components.

---

*All regex and logic documented here is taken directly from `auth-validators.ts`. Nothing is invented or inferred.*
