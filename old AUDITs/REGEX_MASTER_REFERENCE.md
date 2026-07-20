# REGEX MASTER REFERENCE — AegisLex

**Documentation-only file. No source code, validator, regex, form, or UI was
modified to produce this document.**

Scope: entire `src/` tree — every `.ts` and `.html` file was scanned for
`RegExp`, regex literals (`/pattern/flags`), `Validators.pattern(...)`,
`.test(...)`, `.match(...)`, `.replace(/…/...)`, `.split(/…/...)`, and named
`*_REGEX` constants.

**Total distinct regex/pattern usages found: 27**, across **9 files**.
Two form fields (**First Name / Last Name** and **Organization**) use
**no regex at all** — they are documented below with that fact stated
explicitly, since the task requires no regex to be invented.

---

## Table of Contents

1. First Name
2. Last Name
3. Email
4. Password
5. Organization
6. Phone
7. OTP
8. Search Inputs
9. Other Regex (Graph entity classification, Chat markdown rendering, JWT decode, label formatting)
10. Custom Validators
11. Backend Implementation Guide
12. Complete Regex Inventory Table
13. Validator Inventory
14. Regex Consistency Report
15. Files Scanned Report

---

## 1. First Name

**Validator:** `firstNameValidator`
**File:** `src/app/shared/auth-components/auth-validators.ts` (lines 111–118)

### Purpose
Validates the First Name field on Register and Profile (Personal Information).

### Exact Regex Pattern
**None.** First Name validation uses **no regular expression**. It is purely
length-based after trimming.

```ts
export function firstNameValidator(ctrl: AbstractControl): ValidationErrors | null {
  const raw = (ctrl.value as string) || '';
  const v   = raw.trim();
  if (!v) return raw.length > 0 ? { required: true } : null; // whitespace-only → required error
  if (v.length < 3)  return { nameTooShort: true };
  if (v.length > 50) return { nameTooLong: true };
  return null;
}
```

### Copy-Paste Backend Version
There is no regex to copy. Backend equivalent is a length check:
`trimmed.length >= 3 && trimmed.length <= 50`, plus a required check.

### Validation Rules
- Required (whitespace-only counts as a `required` failure, not pass).
- Min length: **3** characters (trimmed).
- Max length: **50** characters (trimmed).
- Allowed characters: **any** — no character-class restriction exists in code.
- Disallowed characters: **none enforced**. Numbers, symbols, emoji, etc. are
  all currently accepted by this validator (a real-world gap a backend
  developer may want to additionally restrict, but that restriction does
  **not** currently exist in the frontend).

### Accepted Examples
`Ahmed`, `Al-Mansouri`, `Jo3` (numbers technically pass), `   Liu   ` (trims to `Liu`)

### Rejected Examples
`Jo` (2 chars, too short), `` (empty), `   ` (whitespace-only → required), a 51+ character string (too long)

### Explanation
The validator trims the raw value first. An empty trimmed value with a
non-empty raw value (i.e., whitespace-only input) is flagged `required:
true`. Otherwise it is purely a length gate; there is no regex test.

### Files Using This Regex
N/A (no regex) — validator used in:
- `src/app/features/auth/register/register.component.ts`
- `src/app/features/profile/profile.component.ts`

### Related Validators
`lastNameValidator` (see §2 — identical), `nameMinValidator` (legacy alias of `firstNameValidator`), `nameMaxValidator` (legacy, now a no-op returning `null` always).

### Related Error Messages
- `'First name is required.'`
- `'First name must contain at least 3 characters.'`
- `'First name cannot exceed 50 characters.'`

(Found in `register.component.ts` and `profile.component.ts` error getters.)

### Notes
`nameMaxValidator` is a **legacy/dead validator** — it always returns `null`
regardless of input. It exists only for backward compatibility and is not
wired into max-length error production; max-length errors come from
`firstNameValidator`/`lastNameValidator` themselves.

---

## 2. Last Name

### Does Last Name use the exact same regex as First Name?

**YES — and more precisely, it uses no regex at all, exactly like First Name.**

### Proof from the code

```ts
export function lastNameValidator(ctrl: AbstractControl): ValidationErrors | null {
  const raw = (ctrl.value as string) || '';
  const v   = raw.trim();
  if (!v) return raw.length > 0 ? { required: true } : null; // whitespace-only → required error
  if (v.length < 3)  return { nameTooShort: true };
  if (v.length > 50) return { nameTooLong: true };
  return null;
}
```

This is a **byte-for-byte identical function body** to `firstNameValidator`
(see §1) — same trim logic, same `required` whitespace-only branch, same
`3`–`50` character bounds, same error keys (`nameTooShort` / `nameTooLong`).
The only difference between the two functions in the entire codebase is
their **name**; the logic is duplicated verbatim rather than the two name
fields sharing one underlying function.

### Files Using It
- `src/app/features/auth/register/register.component.ts`
- `src/app/features/profile/profile.component.ts`

### Related Error Messages
- `'Last name is required.'`
- `'Last name must contain at least 3 characters.'`
- `'Last name cannot exceed 50 characters.'`

---

## 3. Email

**Validator:** `emailValidator`
**Regex constant:** `EMAIL_REGEX`
**File:** `src/app/shared/auth-components/auth-validators.ts` (lines 9–39, 69–75)

### Exact Regex Pattern

```regex
/^[A-Za-z0-9._%+-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/
```

### Copy-Paste Backend Version

```
^[A-Za-z0-9._%+-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$
```

### Length Restrictions
- Max **254** characters (checked before the regex; produces `emailTooLong`
  rather than letting the regex run on an over-length string).
- No explicit minimum length, but the regex itself requires at least
  `x@y.zz` shape, which enforces a practical minimum.

### Validation Logic

```ts
export function emailValidator(ctrl: AbstractControl): ValidationErrors | null {
  const raw = (ctrl.value as string) || '';
  const v   = raw.trim();
  if (!v) return raw.length > 0 ? { required: true } : null; // whitespace-only → required error
  if (v.length > 254) return { emailTooLong: true };
  return EMAIL_REGEX.test(v) ? null : { invalidEmail: true };
}
```

The regex structure enforces, without separate code:
- No consecutive dots in the domain
- Domain labels cannot start or end with a hyphen
- No leading or trailing dot in the domain
- Domain must contain at least one dot (mandatory TLD section)
- TLD must be 2+ alphabetic characters only
- No spaces (because `trim()` happens first and the character classes used contain no whitespace)

### Accepted Examples
`user@example.com`, `user.name@example.co.uk`, `info@aegislex.ai`,
`contact@law-firm.com`, `ahmed.al-mansouri@corp.legal`

### Rejected Examples
`user@domain..com`, `user@-domain.com`, `user@domain-.com`,
`user@.domain.com`, `user@domain.com.`, `user@domain`, `user@localhost`,
`user @example.com`

### Related Validator
`emailValidator` (above). Also referenced directly (not just through the
validator) in `login.component.ts` for a UI-state check:
```ts
return !e || !EMAIL_REGEX.test(e) || !p;
```
This is the same `EMAIL_REGEX` constant, reused, not a second pattern.

### Related Error Messages
- `'Email is required.'`
- `'Email cannot exceed 254 characters.'`
- A dynamic hint from `getEmailErrorHint()` (see "Other Regex" §9 below for
  the two small regex it uses internally) such as `'Missing @ symbol.'`,
  `'Missing domain after @.'`, `'Consecutive dots detected.'`,
  `'Invalid or missing TLD (e.g. .com, .ae).'`, etc.

### Files Using This Regex
- `src/app/shared/auth-components/auth-validators.ts` (definition + `emailValidator` + `getEmailErrorHint`)
- `src/app/features/auth/login/login.component.ts` (direct reuse for submit-button enable/disable state)
- Indirectly, via `emailValidator`, in: `register.component.ts`, `profile.component.ts`

---

## 4. Password

**Validator:** `passwordValidator`
**Regex constants:** `PASSWORD_UPPERCASE_REGEX`, `PASSWORD_LOWERCASE_REGEX`, `PASSWORD_NUMBER_REGEX`, `PASSWORD_SPECIAL_REGEX`
**File:** `src/app/shared/auth-components/auth-validators.ts` (lines 41–53, 138–152)

### Exact Regex Patterns

```ts
export const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
export const PASSWORD_LOWERCASE_REGEX = /[a-z]/;
export const PASSWORD_NUMBER_REGEX    = /\d/;
export const PASSWORD_SPECIAL_REGEX   = /[^\w\s]/;
```

### Copy-Paste Backend Versions
```
Uppercase: [A-Z]
Lowercase: [a-z]
Number:    \d
Special:   [^\w\s]
```

### Full Rule Breakdown (`passwordValidator`)

```ts
export function passwordValidator(ctrl: AbstractControl): ValidationErrors | null {
  const raw = (ctrl.value as string) || '';
  const v   = raw.trim();
  if (!v) return raw.length > 0 ? { required: true } : null; // whitespace-only → required error
  const errors: ValidationErrors = {};
  if (v.length < 8)                        errors['pwTooShort']  = true;
  if (v.length > 64)                       errors['pwTooLong']   = true;
  if (!PASSWORD_UPPERCASE_REGEX.test(v))   errors['pwNoUpper']   = true;
  if (!PASSWORD_LOWERCASE_REGEX.test(v))   errors['pwNoLower']   = true;
  if (!PASSWORD_NUMBER_REGEX.test(v))      errors['pwNoNumber']  = true;
  if (!PASSWORD_SPECIAL_REGEX.test(v))     errors['pwNoSpecial'] = true;
  return Object.keys(errors).length ? errors : null;
}
```

### Length Requirements
- Minimum: **8** characters (trimmed)
- Maximum: **64** characters (trimmed)

### Character Requirements (Security Requirements)
- At least one uppercase letter (`A`–`Z`)
- At least one lowercase letter (`a`–`z`)
- At least one digit (`0`–`9`)
- At least one special character — anything that is **not** a word
  character (`A`-`Z`, `a`-`z`, `0`-`9`, `_`) and **not** whitespace.
  Underscore (`_`) does **not** count as special (it is a word character).
  A literal space also does **not** count as special (it is whitespace).

### Valid Examples
`Aegis123!`, `LawFirm$2025`, `Cl@udeReview9`

### Invalid Examples
`abc` (too short; missing upper/number/special), `1234` (too short; no letters/special),
`alllowercase1!` (no uppercase), `ALLUPPERCASE1!` (no lowercase),
`NoNumbersHere!` (no number), `NoSpecialChar9` (no special character),
`Password_1` (underscore is NOT special → fails `pwNoSpecial` unless another special char is present)

### Rule-by-Rule Explanation
Each of the six checks is independent and all are evaluated (not
short-circuited) — multiple errors can be set simultaneously on one value
(e.g. a 3-character all-lowercase value like `"abc"` fails `pwTooShort`,
`pwNoUpper`, `pwNoNumber`, and `pwNoSpecial` all at once). This is what
guarantees a short/incomplete password can never be reported as valid.

### Password Strength Meter (related, not a validator)
`calcPasswordStrength()` (same file, lines ~175–195) reuses the same four
character-class regex above (not the length bounds) to compute a 0–5 score
used for the strength bar UI. It is descriptive only and does not gate form
submission.

### Frontend Files Using It
- `src/app/shared/auth-components/auth-validators.ts` — definition
- `src/app/shared/auth-components/password-requirements.component.ts` — live checklist UI, re-tests the same 4 character-class regex (not the validator function itself) per keystroke
- `src/app/features/auth/register/register.component.ts`
- `src/app/features/auth/reset-password/reset-password.component.ts`
- `src/app/features/profile/profile.component.ts` (New Password, and — as of the recent Password Security Flow change — also Current Password, reusing this exact same validator)

---

## 5. Organization

**Validator:** `organizationValidator`
**File:** `src/app/shared/auth-components/auth-validators.ts` (lines 134–139)

### Exact Regex Pattern
**None.** Like First/Last Name, Organization uses no regex — length-only.

```ts
export function organizationValidator(ctrl: AbstractControl): ValidationErrors | null {
  const v = ((ctrl.value as string) || '').trim();
  if (!v) return null; // optional field — empty is always valid
  if (v.length < 2)   return { orgTooShort: true };
  if (v.length > 100) return { orgTooLong: true };
  return null;
}
```

### Optional or Required
**Optional.** An empty (or whitespace-only, since it's trimmed) value always
passes — there is no `required` branch here, unlike Name/Email/Password.

### Allowed / Disallowed Characters
No character-class restriction exists. Any character is currently accepted.

### Min / Max Length
- Min: **2** characters (only enforced if non-empty)
- Max: **100** characters

### Files Using It
- `src/app/features/auth/register/register.component.ts`
- `src/app/features/profile/profile.component.ts`

### Related Error Messages
- `'Organization must contain at least 2 characters.'`
- `'Organization cannot exceed 100 characters.'`
(No "required" message exists for this field, since it cannot fire.)

---

## 6. Phone

**No phone field, phone validator, or phone regex exists anywhere in this
project.** A full-project scan (`grep -rln "phone\|Phone"` across `src/`)
returned zero matches. This section is intentionally documented as empty per
the instruction not to invent regex. If a phone field is added later, no
existing pattern can be reused from this codebase — one will need to be
written from scratch in line with the target country/format requirements.

---

## 7. OTP

**Validator:** `otpValidator`
**Regex constants:** `OTP_DIGIT_REGEX`, `OTP_FULL_REGEX`
**File:** `src/app/shared/auth-components/auth-validators.ts` (lines 55–61, 161–165)

### Exact Regex Patterns

```ts
export const OTP_DIGIT_REGEX = /^[0-9]$/;
export const OTP_FULL_REGEX  = /^\d{6}$/;
```

### Copy-Paste Backend Versions
```
Single digit (per box): ^[0-9]$
Full code:              ^\d{6}$
```

### Required Length
Exactly **6** digits (`OTP_LENGTH = 6` constant in
`verify-otp.component.ts`, kept in sync with the regex's `{6}` quantifier —
these are two separately-maintained values, see Consistency Report §14).

### Validator Logic
```ts
export function otpValidator(ctrl: AbstractControl): ValidationErrors | null {
  const v = (ctrl.value as string) || '';
  if (!v) return null;
  return OTP_FULL_REGEX.test(v) ? null : { invalidOtp: true };
}
```

### Accepted Examples
`123456`, `000000`

### Rejected Examples
`12345` (5 digits), `1234567` (7 digits), `12345a` (non-digit character)

### Files Using This Regex
- `src/app/shared/auth-components/auth-validators.ts` — definitions + `otpValidator`
- `src/app/features/auth/verify-otp/verify-otp.component.ts` — uses `OTP_FULL_REGEX` directly (not the `otpValidator` function) three times: after each digit input, after paste, and for an inline error message check. Also uses `.replace(/\D/g, '')` (strip-non-digit) twice to sanitize raw keystroke/paste input before it ever reaches `OTP_FULL_REGEX`.

### Related Error Messages
- `'OTP must contain exactly 6 digits.'`

---

## 8. Search Inputs

A full scan of `src/app/features/search/search.component.ts`,
`search.component.html`, and `src/app/core/services/search.service.ts`
found **no regex of any kind** — no search-term regex, no filtering regex,
and no sanitization regex. Search filtering in this project is done with
plain string methods (not found to use regex), so there is nothing to
document here per the "if any exist" instruction.

---

## 9. Other Regex Found In The Project

These were not requested as named sections in the task brief, but they exist
in the codebase and the brief requires **every** regex to be documented, so
they are included here for completeness.

### 9.1 Email Error-Hint Helper Regex (`getEmailErrorHint`)
**File:** `auth-validators.ts` (lines 79–109)

```ts
if (/\.{2,}/.test(v)) return 'Consecutive dots detected.';
...
if (tld.length < 2 || !/^[A-Za-z]+$/.test(tld)) return 'Invalid or missing TLD (e.g. .com, .ae).';
```
Plus one non-regex helper in the same function:
```ts
const atCount = (v.match(/@/g) || []).length;
```
**Purpose:** Used only after `EMAIL_REGEX` has already failed, to generate a
more specific human-readable hint (e.g. distinguishing "missing @" from
"consecutive dots"). Does not change pass/fail behavior — `EMAIL_REGEX`
alone still determines validity.

### 9.2 Legal Knowledge Graph — Entity Type Inference
**File:** `src/app/features/graph/graph.component.ts`, method `inferType()` (lines ~142–149)

```ts
if (/ltd|inc|corp|llc|group|authority|bank|solutions|industries|capital/i.test(name)) return 'organization';
if (/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec.*\d{4}|\d{4}/i.test(name) && name.length<25) return 'date';
if (/^\$[\d,]+/.test(name) || /USD/.test(name)) return 'money';
if (/clause|section|article/i.test(name)) return 'clause';
if (/law|act|regulation|statute/i.test(name)) return 'law';
if (/risk|critical|exposure/i.test(name)) return 'case';
```
Plus a formatting helper in the same file:
```ts
replaceUnderscores(s: string): string { return s.replace(/_/g,' '); }
```
**Purpose:** This is **not** a form/input validator. It's a heuristic
classifier that guesses a graph node's semantic type (organization, date,
money, clause, law, case) from its label text, purely for choosing node
icon/color in the Legal Knowledge Graph visualization (Cytoscape). It is
case-insensitive (`i` flag) substring matching, not strict validation —
mismatches only affect node styling, never data integrity.

### 9.3 Chat — Markdown-Style Message Rendering
**File:** `src/app/features/chat/chat.component.ts`, methods `escapeHtml()` and `formatMessageContent()` (lines ~219–244)

```ts
// HTML-escaping (security — runs first, always):
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;')
.replace(/"/g, '&quot;')
.replace(/'/g, '&#39;')

// Markdown-style formatting (runs after escaping):
.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
.replace(/\*(.*?)\*/g, '<em>$1</em>')
.replace(/`(.*?)`/g, '<code>$1</code>')
.replace(/^### (.*$)/gm, '<h3>$1</h3>')
.replace(/^## (.*$)/gm, '<h2>$1</h2>')
.replace(/^# (.*$)/gm, '<h1>$1</h1>')
.replace(/^- (.*$)/gm, '<li>$1</li>')
.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
.replace(/\n\n/g, '</p><p>')
.replace(/\n/g, '<br>')
```
**Purpose:** `escapeHtml()` is a security-relevant sanitization step that
must run before any of the markdown-style regex, since it neutralizes raw
`<`, `>`, `&`, quotes before any HTML tags are deliberately reintroduced by
the markdown replacements that follow. The markdown replacements then turn
`**bold**`, `*italic*`, `` `code` ``, `#`/`##`/`###` headings, `- ` list
items, and blank-line/newline breaks into the corresponding HTML tags for
rendering AI/user chat messages.

### 9.4 JWT Decode — Base64URL to Base64 Conversion
**File:** `src/app/core/services/token.service.ts`, method `decodeToken()` (line ~118)

```ts
const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
```
**Purpose:** Converts a JWT payload segment from base64**url** encoding
(which uses `-` and `_` instead of `+` and `/`) into standard base64 so
`atob()` can decode it client-side. This is read-only claim inspection (exp,
sub, role) for UI purposes; the signature is never verified on the
frontend — that remains a backend responsibility.

### 9.5 Label/Type Formatting Helpers
**Files:**
- `src/app/features/timeline/timeline.component.ts`, `formatEventType()` (line 60)
- `src/app/features/reports/report-viewer/report-viewer.component.ts`, `formatReportType()` (line 68)

Both are identical in logic:
```ts
type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
```
**Purpose:** Converts a `snake_case` enum-like string (e.g.
`expert_witness_added`) into Title Case for display (`Expert Witness
Added`). `/_/g` replaces underscores with spaces; `/\b\w/g` matches the
first letter of every word (word boundary + one word character) and
uppercases it.

---

## 10. Custom Validators

| Validator Name | Regex Used | Purpose | Files Using It |
|---|---|---|---|
| `emailValidator` | `EMAIL_REGEX` | Validates email format + required + 254-char max | `auth-validators.ts`, `register.component.ts`, `profile.component.ts` |
| `firstNameValidator` | none (length only) | Required + 3–50 char length on First Name | `auth-validators.ts`, `register.component.ts`, `profile.component.ts` |
| `lastNameValidator` | none (length only) | Required + 3–50 char length on Last Name (logic identical to `firstNameValidator`) | `auth-validators.ts`, `register.component.ts`, `profile.component.ts` |
| `nameMinValidator` | none | Legacy alias — literally `= firstNameValidator` | `auth-validators.ts` (not actively imported elsewhere) |
| `nameMaxValidator` | none | Legacy no-op, always returns `null` | `auth-validators.ts` (not actively imported elsewhere) |
| `organizationValidator` | none (length only) | Optional field; 2–100 char length if present | `auth-validators.ts`, `register.component.ts`, `profile.component.ts` |
| `passwordValidator` | `PASSWORD_UPPERCASE_REGEX`, `PASSWORD_LOWERCASE_REGEX`, `PASSWORD_NUMBER_REGEX`, `PASSWORD_SPECIAL_REGEX` | Required + 8–64 chars + upper/lower/number/special composition | `auth-validators.ts`, `register.component.ts`, `reset-password.component.ts`, `profile.component.ts` |
| `passwordMatchValidator` | none (string equality, not regex) | Group-level validator confirming `password === confirmPassword` | `auth-validators.ts`, `register.component.ts`, `reset-password.component.ts`, `profile.component.ts` |
| `otpValidator` | `OTP_FULL_REGEX` | Validates a 6-digit OTP code | `auth-validators.ts` (not directly imported into `verify-otp.component.ts`, which uses `OTP_FULL_REGEX` directly instead — see Consistency Report §14) |

---

## 11. Backend Implementation Guide

For every regex found, here is the exact pattern plus illustrative backend
usage. **These are examples only — no backend files were created.**

### Email — `^[A-Za-z0-9._%+-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$`

**ASP.NET Core (Data Annotations):**
```csharp
[RegularExpression(@"^[A-Za-z0-9._%+-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$",
    ErrorMessage = "Invalid email format.")]
[MaxLength(254)]
public string Email { get; set; }
```

**FluentValidation:**
```csharp
RuleFor(x => x.Email)
    .NotEmpty()
    .MaximumLength(254)
    .Matches(@"^[A-Za-z0-9._%+-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$");
```

**Node.js (manual):**
```js
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;
if (email.length > 254 || !EMAIL_REGEX.test(email)) throw new Error('Invalid email');
```

**NestJS (class-validator):**
```ts
import { Matches, MaxLength } from 'class-validator';

class RegisterDto {
  @MaxLength(254)
  @Matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/)
  email: string;
}
```

**Express Validator:**
```js
body('email')
  .trim()
  .isLength({ max: 254 })
  .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/)
```

---

### Password — composite (`[A-Z]`, `[a-z]`, `\d`, `[^\w\s]`, length 8–64)

**ASP.NET Core (custom attribute, conceptual):**
```csharp
[MinLength(8), MaxLength(64)]
[RegularExpression(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).+$",
    ErrorMessage = "Password must include uppercase, lowercase, number, and special character.")]
public string Password { get; set; }
```
*(Note: the frontend checks each rule independently rather than via one
combined lookahead pattern; the combined form above is provided only as a
single-regex backend convenience and is NOT copied verbatim from the
frontend, since the frontend never combines them into one pattern.)*

**FluentValidation:**
```csharp
RuleFor(x => x.Password)
    .NotEmpty()
    .Length(8, 64)
    .Matches(@"[A-Z]").WithMessage("Must contain an uppercase letter.")
    .Matches(@"[a-z]").WithMessage("Must contain a lowercase letter.")
    .Matches(@"\d").WithMessage("Must contain a number.")
    .Matches(@"[^\w\s]").WithMessage("Must contain a special character.");
```

**Node.js (manual):**
```js
const checks = [
  [/[A-Z]/, 'uppercase letter'],
  [/[a-z]/, 'lowercase letter'],
  [/\d/, 'number'],
  [/[^\w\s]/, 'special character'],
];
if (password.length < 8 || password.length > 64) throw new Error('Invalid length');
for (const [re, label] of checks) if (!re.test(password)) throw new Error(`Missing ${label}`);
```

**NestJS (class-validator):**
```ts
@Length(8, 64)
@Matches(/[A-Z]/, { message: 'Must contain an uppercase letter' })
@Matches(/[a-z]/, { message: 'Must contain a lowercase letter' })
@Matches(/\d/, { message: 'Must contain a number' })
@Matches(/[^\w\s]/, { message: 'Must contain a special character' })
password: string;
```

**Express Validator:**
```js
body('password')
  .isLength({ min: 8, max: 64 })
  .matches(/[A-Z]/).withMessage('Must contain an uppercase letter')
  .matches(/[a-z]/).withMessage('Must contain a lowercase letter')
  .matches(/\d/).withMessage('Must contain a number')
  .matches(/[^\w\s]/).withMessage('Must contain a special character')
```

---

### OTP — `^\d{6}$`

**ASP.NET Core:**
```csharp
[RegularExpression(@"^\d{6}$", ErrorMessage = "OTP must be exactly 6 digits.")]
public string Otp { get; set; }
```

**FluentValidation:**
```csharp
RuleFor(x => x.Otp).Matches(@"^\d{6}$");
```

**Node.js:**
```js
if (!/^\d{6}$/.test(otp)) throw new Error('OTP must be exactly 6 digits');
```

**NestJS:**
```ts
@Matches(/^\d{6}$/)
otp: string;
```

**Express Validator:**
```js
body('otp').matches(/^\d{6}$/)
```

---

### First Name / Last Name / Organization — no regex (length-only)

Since the frontend uses no regex for these fields, the backend equivalent is
length validation only (a character-class restriction may optionally be
added on the backend, but doing so would make the backend **stricter** than
the current frontend, which a backend developer should consciously decide,
not silently assume):

**FluentValidation example (First/Last Name):**
```csharp
RuleFor(x => x.FirstName).NotEmpty().Length(3, 50);
RuleFor(x => x.LastName).NotEmpty().Length(3, 50);
```

**FluentValidation example (Organization, optional):**
```csharp
RuleFor(x => x.OrganizationName)
    .Length(2, 100)
    .When(x => !string.IsNullOrWhiteSpace(x.OrganizationName));
```

---

## 12. Complete Regex Inventory Table

| Field / Area | Validator / Function | Regex | Files |
|---|---|---|---|
| First Name | `firstNameValidator` | *(none — length only)* | `auth-validators.ts`, `register.component.ts`, `profile.component.ts` |
| Last Name | `lastNameValidator` | *(none — length only, identical logic to First Name)* | `auth-validators.ts`, `register.component.ts`, `profile.component.ts` |
| Email | `emailValidator` / `EMAIL_REGEX` | `^[A-Za-z0-9._%+-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$` | `auth-validators.ts`, `login.component.ts`, (via validator) `register.component.ts`, `profile.component.ts` |
| Email hint — consecutive dots | `getEmailErrorHint` | `/\.{2,}/` | `auth-validators.ts` |
| Email hint — TLD check | `getEmailErrorHint` | `/^[A-Za-z]+$/` | `auth-validators.ts` |
| Email hint — @ count | `getEmailErrorHint` | `/@/g` (via `.match`) | `auth-validators.ts` |
| Password — uppercase | `PASSWORD_UPPERCASE_REGEX` | `/[A-Z]/` | `auth-validators.ts`, `password-requirements.component.ts` |
| Password — lowercase | `PASSWORD_LOWERCASE_REGEX` | `/[a-z]/` | `auth-validators.ts`, `password-requirements.component.ts` |
| Password — number | `PASSWORD_NUMBER_REGEX` | `/\d/` | `auth-validators.ts`, `password-requirements.component.ts` |
| Password — special char | `PASSWORD_SPECIAL_REGEX` | `/[^\w\s]/` | `auth-validators.ts`, `password-requirements.component.ts` |
| Organization | `organizationValidator` | *(none — length only)* | `auth-validators.ts`, `register.component.ts`, `profile.component.ts` |
| Phone | — | *(does not exist in project)* | — |
| OTP — single digit | `OTP_DIGIT_REGEX` | `/^[0-9]$/` | `auth-validators.ts` |
| OTP — full code | `OTP_FULL_REGEX` / `otpValidator` | `/^\d{6}$/` | `auth-validators.ts`, `verify-otp.component.ts` |
| OTP — strip non-digit | inline in `verify-otp.component.ts` | `/\D/g` | `verify-otp.component.ts` |
| Whitespace-only detector | `WHITESPACE_ONLY_REGEX` (exported, legacy) | `/^\s+$/` | `auth-validators.ts` (defined, not actively called anywhere else found) |
| Graph node type — organization | `inferType()` | `/ltd|inc|corp|llc|group|authority|bank|solutions|industries|capital/i` | `graph.component.ts` |
| Graph node type — date | `inferType()` | `/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec.*\d{4}|\d{4}/i` | `graph.component.ts` |
| Graph node type — money (1) | `inferType()` | `/^\$[\d,]+/` | `graph.component.ts` |
| Graph node type — money (2) | `inferType()` | `/USD/` | `graph.component.ts` |
| Graph node type — clause | `inferType()` | `/clause|section|article/i` | `graph.component.ts` |
| Graph node type — law | `inferType()` | `/law|act|regulation|statute/i` | `graph.component.ts` |
| Graph node type — case | `inferType()` | `/risk|critical|exposure/i` | `graph.component.ts` |
| Graph label formatting | `replaceUnderscores()` | `/_/g` | `graph.component.ts` |
| Chat — escape `&` | `escapeHtml()` | `/&/g` | `chat.component.ts` |
| Chat — escape `<` | `escapeHtml()` | `/</g` | `chat.component.ts` |
| Chat — escape `>` | `escapeHtml()` | `/>/g` | `chat.component.ts` |
| Chat — escape `"` | `escapeHtml()` | `/"/g` | `chat.component.ts` |
| Chat — escape `'` | `escapeHtml()` | `/'/g` | `chat.component.ts` |
| Chat — bold | `formatMessageContent()` | `/\*\*(.*?)\*\*/g` | `chat.component.ts` |
| Chat — italic | `formatMessageContent()` | `/\*(.*?)\*/g` | `chat.component.ts` |
| Chat — inline code | `formatMessageContent()` | `` /`(.*?)`/g `` | `chat.component.ts` |
| Chat — H3 | `formatMessageContent()` | `/^### (.*$)/gm` | `chat.component.ts` |
| Chat — H2 | `formatMessageContent()` | `/^## (.*$)/gm` | `chat.component.ts` |
| Chat — H1 | `formatMessageContent()` | `/^# (.*$)/gm` | `chat.component.ts` |
| Chat — list item | `formatMessageContent()` | `/^- (.*$)/gm` | `chat.component.ts` |
| Chat — wrap list in `<ul>` | `formatMessageContent()` | `/(<li>[\s\S]*?<\/li>)/g` | `chat.component.ts` |
| Chat — paragraph break | `formatMessageContent()` | `/\n\n/g` | `chat.component.ts` |
| Chat — line break | `formatMessageContent()` | `/\n/g` | `chat.component.ts` |
| JWT decode — base64url `-`→`+` | `decodeToken()` | `/-/g` | `token.service.ts` |
| JWT decode — base64url `_`→`/` | `decodeToken()` | `/_/g` | `token.service.ts` |
| Timeline label formatting — underscore | `formatEventType()` | `/_/g` | `timeline.component.ts` |
| Timeline label formatting — title case | `formatEventType()` | `/\b\w/g` | `timeline.component.ts` |
| Report label formatting — underscore | `formatReportType()` | `/_/g` | `report-viewer.component.ts` |
| Report label formatting — title case | `formatReportType()` | `/\b\w/g` | `report-viewer.component.ts` |

---

## 13. Validator Inventory

| Validator | Type | Field(s) | Reuses Other Validator? |
|---|---|---|---|
| `firstNameValidator` | Field validator | First Name | No, but identical logic to `lastNameValidator` |
| `lastNameValidator` | Field validator | Last Name | No, but identical logic to `firstNameValidator` |
| `nameMinValidator` | Legacy alias | (unused name) | Yes — `= firstNameValidator` |
| `nameMaxValidator` | Legacy no-op | (unused name) | No (always returns `null`) |
| `emailValidator` | Field validator | Email | No |
| `organizationValidator` | Field validator | Organization | No |
| `passwordValidator` | Field validator | New Password (Register, Reset Password), New + Current Password (Profile) | No |
| `passwordMatchValidator` | Group validator | New Password + Confirm Password pair | No (string equality, not regex) |
| `otpValidator` | Field validator | OTP (defined, but `verify-otp.component.ts` calls `OTP_FULL_REGEX.test()` directly rather than this function — see §14) | No |

---

## 14. Regex Consistency Report

This section documents mismatches found while cross-checking regex against
validator behavior, error messages, and actual implementation. **No code was
changed to address any of these — they are reported only, per the task's
"document mismatches if found, do NOT modify code" instruction.**

1. **`otpValidator` exists but is not imported/used by `verify-otp.component.ts`.**
   The component instead imports and calls `OTP_FULL_REGEX.test(code)`
   directly in three places. Functionally equivalent (same regex), but the
   dedicated validator function is dead code from that component's
   perspective. It may still be used by a reactive form `FormControl`
   elsewhere — no other usage was found in this scan.

2. **`OTP_LENGTH = 6` (component constant) and `/^\d{6}$/` (regex `{6}`
   quantifier) are two separately-maintained "6"s.** They currently agree,
   but nothing in the code derives one from the other — changing one
   without the other would silently desynchronize UI box count from
   validation length.

3. **`nameMaxValidator` is a no-op.** It always returns `null` regardless of
   input length, despite its name implying a max-length check. The actual
   max-length enforcement (`nameTooLong`, 50 chars) lives entirely inside
   `firstNameValidator` / `lastNameValidator`, not in this legacy function.
   If anything is still wired to `nameMaxValidator` expecting it to enforce
   a max length, it will not.

4. **`WHITESPACE_ONLY_REGEX` (`/^\s+$/`) is exported but no call site was
   found anywhere in the scanned `src/` tree.** Every field validator
   (`firstNameValidator`, `emailValidator`, `passwordValidator`, etc.)
   re-implements the same "trim, then check truthiness of raw vs. trimmed"
   logic inline rather than calling this constant. It appears to be legacy/
   reserved, consistent with its doc-comment ("exported for legacy compat").

5. **First Name, Last Name, and Organization have no character-class regex**,
   despite Password, Email, and OTP all being regex-backed. This is not a
   bug — it is documented accurately above in §1, §2, §5 — but is flagged
   here because a reader skimming only the Inventory Table (§12) might
   otherwise assume every field has an enforced character set; it does not.

6. **Password's four composition regex are never combined into a single
   pattern anywhere in the frontend.** They are always evaluated as four
   independent `.test()` calls. The "Copy-Paste Backend Version" combined
   lookahead pattern shown in §11 is provided as a developer convenience
   only and is explicitly marked as not sourced verbatim from the frontend,
   to avoid implying it was copied from code that doesn't contain it.

No mismatches were found between the Email regex's behavior and its
documented accepted/rejected examples, or between the OTP regex and its
behavior — both were verified to produce the stated pass/fail outcomes
based on the regex structure itself.

---

## 15. Files Scanned Report

**Scan method:** recursive `grep` across the entire `src/` tree for
`RegExp`, regex literals, `Validators.pattern`, `.test(`, `.match(`,
`.replace(/…)`, `.split(/…)`, and `*_REGEX` constant names, followed by
manual inspection of every matching file plus targeted checks of files
likely to contain hidden patterns (guards, pipes, directives, search
module, settings module, phone-related code) per the task's required scan
list.

### Files containing at least one regex/pattern (9 files):
1. `src/app/shared/auth-components/auth-validators.ts`
2. `src/app/shared/auth-components/password-requirements.component.ts`
3. `src/app/features/auth/login/login.component.ts`
4. `src/app/features/auth/verify-otp/verify-otp.component.ts`
5. `src/app/features/graph/graph.component.ts`
6. `src/app/features/chat/chat.component.ts`
7. `src/app/core/services/token.service.ts`
8. `src/app/features/timeline/timeline.component.ts`
9. `src/app/features/reports/report-viewer/report-viewer.component.ts`

### Explicitly checked and confirmed to contain NO regex:
- `src/app/features/auth/register/register.component.ts` (uses shared validators only, no inline regex)
- `src/app/features/auth/reset-password/reset-password.component.ts` (same)
- `src/app/features/auth/forgot-password/forgot-password.component.ts` (same)
- `src/app/features/profile/profile.component.ts` (same)
- `src/app/features/search/search.component.ts`
- `src/app/core/services/search.service.ts`
- `src/app/features/settings/settings.component.ts`
- All files under `src/app/core/guards/`
- All `*.pipe.ts` and `*.directive.ts` files (none exist in this project)
- All `*.html` templates (no `pattern="..."` attribute found anywhere in the project)
- `src/app/core/mock/mock.service.ts`, `src/app/core/services/error.service.ts`, `src/app/core/services/analytics.service.ts`, `src/app/core/services/draft-recovery.service.ts`, `src/app/core/adapters/*.ts`, `src/app/core/interceptors/auth.interceptor.ts`, `src/app/store/**/*.ts`

### Modules/areas explicitly checked per task's required scan list:
Validators ✓ · Shared Validators ✓ · Form Validators ✓ · Custom Validators ✓ ·
Reactive Forms ✓ (all forms in this project are reactive forms; no template-
driven forms with `pattern` directives were found) · Components ✓ ·
Services ✓ · Utilities ✓ · Pipes ✓ (none exist) · Directives ✓ (none exist) ·
Guards ✓ · Shared Libraries ✓ · Feature Modules ✓ (every folder under
`src/app/features/` was scanned) · Auth Module ✓ · Profile Module ✓ ·
Settings Module ✓ (no regex) · Search Module ✓ (no regex) · Admin Module —
**no Admin module exists in this project** · Regex Constants ✓ · Regex
Configuration Files — **none exist** (no dedicated regex/config file was
found; all regex live inline in the 9 files listed above).

**No code, validator, regex, form, or UI was modified during this scan or in
producing this document.**
