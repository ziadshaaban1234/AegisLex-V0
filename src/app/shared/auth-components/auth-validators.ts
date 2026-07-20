// ============================================================
// AegisLex Enterprise Auth Validators — Single Source of Truth
// ============================================================

import { AbstractControl, ValidationErrors } from '@angular/forms';

// ── REGEX CONSTANTS ──────────────────────────────────────────────────────────

/** EMAIL_REGEX — Hardened email validation
 *
 *  Pattern:
 *    ^[A-Za-z0-9._%+-]+
 *    @
 *    [A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?
 *    (\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*
 *    \.[A-Za-z]{2,}$
 *
 *  Enforces:
 *    - No consecutive dots in domain (structure prevents them)
 *    - Domain labels must not start with hyphen
 *    - Domain labels must not end with hyphen
 *    - No leading dot in domain
 *    - No trailing dot in domain
 *    - Domain must contain at least one dot (mandatory TLD section)
 *    - TLD must be 2+ alphabetic characters only
 *    - No spaces (trim() applied before test in emailValidator)
 *    - Max 254 chars (length check in emailValidator before regex)
 *
 *  ✓ user@example.com            ✓ user.name@example.co.uk
 *  ✓ info@aegislex.ai            ✓ contact@law-firm.com
 *  ✓ ahmed.al-mansouri@corp.legal
 *
 *  ✗ user@domain..com            ✗ user@-domain.com
 *  ✗ user@domain-.com            ✗ user@.domain.com
 *  ✗ user@domain.com.            ✗ user@domain
 *  ✗ user@localhost              ✗ user @example.com
 */
export const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

/** PASSWORD_UPPERCASE_REGEX — at least one A-Z */
export const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;

/** PASSWORD_LOWERCASE_REGEX — at least one a-z */
export const PASSWORD_LOWERCASE_REGEX = /[a-z]/;

/** PASSWORD_NUMBER_REGEX — at least one 0-9 */
export const PASSWORD_NUMBER_REGEX = /\d/;

/** PASSWORD_SPECIAL_REGEX — at least one non-word, non-whitespace character
 *  Matches: ! @ # $ % ^ & * ( ) - + = [ ] { } | ; ' " , . < > / ?
 */
export const PASSWORD_SPECIAL_REGEX = /[^\w\s]/;

/** OTP_DIGIT_REGEX — exactly one digit 0-9 (used per-box) */
export const OTP_DIGIT_REGEX = /^[0-9]$/;

/** OTP_FULL_REGEX — exactly 6 digits
 *  ✓ 123456  ✓ 000000  ✗ 12345  ✗ 1234567  ✗ 12345a
 */
export const OTP_FULL_REGEX = /^\d{6}$/;

/** WHITESPACE_ONLY_REGEX — detects blank/space-only strings (exported for legacy compat) */
export const WHITESPACE_ONLY_REGEX = /^\s+$/;

// ── GLOBAL TRIM RULE ─────────────────────────────────────────────────────────
// Every validator trims before measuring length or running regex.

export function emailValidator(ctrl: AbstractControl): ValidationErrors | null {
  const raw = (ctrl.value as string) || '';
  const v   = raw.trim();
  if (!v) return raw.length > 0 ? { required: true } : null; // whitespace-only → required error
  if (v.length > 254) return { emailTooLong: true };
  return EMAIL_REGEX.test(v) ? null : { invalidEmail: true };
}

/** Returns a human-readable email error hint for a given (trimmed) value.
 *  Only called when EMAIL_REGEX has already failed. EMAIL_REGEX is NOT changed.
 *  Kept as-is (English strings) for backward compatibility — see
 *  getEmailErrorHintKey() below for the localization-aware variant used by
 *  Phase 1 (auth + settings) screens. */
export function getEmailErrorHint(value: string): string {
  const v = (value || '').trim();
  if (!v) return 'Email is required.';

  // Multiple @ symbols
  const atCount = (v.match(/@/g) || []).length;
  if (atCount === 0) return 'Missing @ symbol.';
  if (atCount > 1)   return 'Multiple @ symbols detected.';

  // Split on the single @
  const atIdx = v.indexOf('@');
  const local  = v.slice(0, atIdx);
  const domain = v.slice(atIdx + 1);

  // Local-part dot issues (before @)
  if (local.startsWith('.')) return 'Email cannot start with a dot.';
  if (local.endsWith('.'))   return 'Email cannot end with a dot before @.';

  // Missing / malformed domain
  if (!domain)               return 'Missing domain after @.';
  if (!domain.includes('.')) return 'Missing dot before TLD (e.g. gmail.com).';

  // Consecutive dots anywhere
  if (/\.{2,}/.test(v)) return 'Consecutive dots detected.';

  // TLD check
  const tld = domain.split('.').pop() || '';
  if (tld.length < 2 || !/^[A-Za-z]+$/.test(tld)) return 'Invalid or missing TLD (e.g. .com, .ae).';

  return 'Please enter a valid email address.';
}

/** Localization-aware variant of getEmailErrorHint(). Runs the exact same
 *  detection logic (identical branch order, identical conditions) but
 *  returns a LanguageService translation key instead of a hardcoded English
 *  string. Added for Phase 1 (auth + settings) localization; does not
 *  replace or modify getEmailErrorHint() above. */
export function getEmailErrorHintKey(value: string): string {
  const v = (value || '').trim();
  if (!v) return 'val.email.required';

  const atCount = (v.match(/@/g) || []).length;
  if (atCount === 0) return 'val.email.missing_at';
  if (atCount > 1)   return 'val.email.multiple_at';

  const atIdx = v.indexOf('@');
  const local  = v.slice(0, atIdx);
  const domain = v.slice(atIdx + 1);

  if (local.startsWith('.')) return 'val.email.starts_with_dot';
  if (local.endsWith('.'))   return 'val.email.ends_with_dot';

  if (!domain)               return 'val.email.missing_domain';
  if (!domain.includes('.')) return 'val.email.missing_tld_dot';

  if (/\.{2,}/.test(v)) return 'val.email.consecutive_dots';

  const tld = domain.split('.').pop() || '';
  if (tld.length < 2 || !/^[A-Za-z]+$/.test(tld)) return 'val.email.invalid_tld';

  return 'val.email.invalid_generic';
}

export function firstNameValidator(ctrl: AbstractControl): ValidationErrors | null {
  const raw = (ctrl.value as string) || '';
  const v   = raw.trim();
  if (!v) return raw.length > 0 ? { required: true } : null; // whitespace-only → required error
  if (v.length < 3)  return { nameTooShort: true };
  if (v.length > 50) return { nameTooLong: true };
  return null;
}

export function lastNameValidator(ctrl: AbstractControl): ValidationErrors | null {
  const raw = (ctrl.value as string) || '';
  const v   = raw.trim();
  if (!v) return raw.length > 0 ? { required: true } : null; // whitespace-only → required error
  if (v.length < 3)  return { nameTooShort: true };
  if (v.length > 50) return { nameTooLong: true };
  return null;
}

// Legacy aliases kept for backward compatibility
export const nameMinValidator = firstNameValidator;
export function nameMaxValidator(_ctrl: AbstractControl): ValidationErrors | null { return null; }

export function organizationValidator(ctrl: AbstractControl): ValidationErrors | null {
  const v = ((ctrl.value as string) || '').trim();
  if (!v) return null; // optional field — empty is always valid
  if (v.length < 2)   return { orgTooShort: true };
  if (v.length > 100) return { orgTooLong: true };
  return null;
}

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

export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw  = ((group.get('password')?.value  as string) || '').trim();
  const cpw = ((group.get('confirmPassword')?.value as string) || '').trim();
  if (!pw || !cpw) return null;
  return pw !== cpw ? { passwordMismatch: true } : null;
}

export function otpValidator(ctrl: AbstractControl): ValidationErrors | null {
  const v = (ctrl.value as string) || '';
  if (!v) return null;
  return OTP_FULL_REGEX.test(v) ? null : { invalidOtp: true };
}

// ── PASSWORD STRENGTH ─────────────────────────────────────────────────────────

export interface PasswordStrength {
  score: number;      // 0-5
  label: string;
  labelKey: string;   // translation key for `label` — added for Phase 1 localization
  percent: number;    // 0-100
  colorClass: string;
}

export function calcPasswordStrength(value: string): PasswordStrength {
  const v = (value || '').trim();
  if (!v) return { score: 0, label: '', labelKey: '', percent: 0, colorClass: 'ps-none' };
  let score = 0;
  if (v.length >= 8)                     score++;
  if (PASSWORD_UPPERCASE_REGEX.test(v))  score++;
  if (PASSWORD_LOWERCASE_REGEX.test(v))  score++;
  if (PASSWORD_NUMBER_REGEX.test(v))     score++;
  if (PASSWORD_SPECIAL_REGEX.test(v))    score++;
  if (v.length >= 14) score = Math.min(5, score + 1);
  const map: Record<number, { label: string; labelKey: string; percent: number; colorClass: string }> = {
    0: { label: '',            labelKey: '',                       percent: 0,   colorClass: 'ps-none'        },
    1: { label: 'Very Weak',   labelKey: 'pw_strength.very_weak',  percent: 10,  colorClass: 'ps-very-weak'   },
    2: { label: 'Weak',        labelKey: 'pw_strength.weak',       percent: 30,  colorClass: 'ps-weak'        },
    3: { label: 'Medium',      labelKey: 'pw_strength.medium',     percent: 55,  colorClass: 'ps-medium'      },
    4: { label: 'Strong',      labelKey: 'pw_strength.strong',     percent: 78,  colorClass: 'ps-strong'      },
    5: { label: 'Very Strong', labelKey: 'pw_strength.very_strong',percent: 100, colorClass: 'ps-very-strong' },
  };
  return { score, ...map[Math.min(score, 5)] };
}

// ── DRAFT PERSISTENCE ─────────────────────────────────────────────────────────
// Registration draft persistence lives ONLY in DraftRecoveryService
// (wrapped by RegistrationStateService for components). Do not reintroduce
// standalone localStorage-backed draft functions here — that previously
// created a second, parallel implementation of the same feature.

// ── SERVER ERROR MAP ──────────────────────────────────────────────────────────

export const AUTH_ERROR_MAP: Record<string, string> = {
  INVALID_CREDENTIALS:  'Invalid email or password.',
  ACCOUNT_DISABLED:     'Your account is disabled. Please contact support.',
  ACCOUNT_LOCKED:       'Your account is temporarily locked. Please try again later.',
  EMAIL_ALREADY_EXISTS: 'An account with this email address already exists.',
  USER_NOT_FOUND:       'User not found.',
  OTP_RATE_LIMIT:       'OTP rate limit exceeded.',
  INVALID_OTP:          'Invalid OTP.',
  OTP_EXPIRED:          'OTP expired.',
  MAX_ATTEMPTS:         'Maximum attempts exceeded.',
  WEAK_PASSWORD:        'Weak password.',
  RESET_TOKEN_INVALID:  'Invalid reset session.',
  RESET_TOKEN_EXPIRED:  'Reset session expired.',
  SERVER_ERROR:         'Something went wrong. Please try again.',
  NETWORK_ERROR:        'A network error occurred. Please check your connection and try again.',
  TOO_MANY_REQUESTS:    'Too many attempts. Please wait a few minutes before trying again.',
};
export function mapAuthError(code: string, fallback?: string): string {
  return AUTH_ERROR_MAP[code] ?? fallback ?? AUTH_ERROR_MAP['SERVER_ERROR'];
}
