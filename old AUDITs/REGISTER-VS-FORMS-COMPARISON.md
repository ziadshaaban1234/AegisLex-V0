# REGISTER VS OTHER FORMS COMPARISON REPORT
## AegisLex — Source of Truth Alignment
### Date: 2026-06-22

---

## REGISTER (Source of Truth) — Full Field Inventory

### Step 1 Fields
| Field | Type | Required | Validator | Min | Max |
|---|---|---|---|---|---|
| First Name | text | YES | `firstNameValidator` | 3 | 50 |
| Last Name | text | YES | `lastNameValidator` | 3 | 50 |
| Email | email | YES | `emailValidator` | 1 | 254 |
| Organization | text | NO | `organizationValidator` | 2 | 100 |
| Role | radio | YES | default `'lawyer'` | — | — |

### Step 2 Fields
| Field | Type | Required | Validator | Min | Max |
|---|---|---|---|---|---|
| Password | password | YES | `passwordValidator` | 8 | 64 |
| Confirm Password | password | YES | `passwordMatchValidator` (group) | — | — |
| Agree Terms | checkbox | YES | `Validators.requiredTrue` | — | — |

### Register UI Features
- `form-input-wrapper` with `--error` / `--success` modifier classes
- Leading `material-icons` icon in every field
- Trailing `check_circle` on valid fields
- `form-errors` / `form-error` error display with `error` icon
- `role="alert"` on error containers
- `aria-invalid`, `aria-required`, `aria-describedby` on all inputs
- `PasswordStrengthComponent` on password field
- `PasswordRequirementsComponent` on password field (shows on focus or touched)
- Show/hide toggle button on password fields
- `passwordFocused` signal driving requirements visibility
- `form-match-msg` "Passwords match" success message on confirmPassword

---

## COMPARISON TABLE — ALL EQUIVALENT FIELDS

### First Name

| Criterion | Register | Reset PW | Forgot PW | Login | Profile (Fixed) | Settings |
|---|---|---|---|---|---|---|
| Has field | ✅ | ❌ N/A | ❌ N/A | ❌ N/A | ✅ | ❌ N/A |
| `firstNameValidator` | ✅ | — | — | — | ✅ | — |
| Min 3 chars | ✅ | — | — | — | ✅ | — |
| Max 50 chars | ✅ | — | — | — | ✅ | — |
| Exact error messages | ✅ | — | — | — | ✅ | — |
| UI wrapper pattern | ✅ | — | — | — | ✅ | — |

### Last Name

| Criterion | Register | Reset PW | Forgot PW | Login | Profile (Fixed) | Settings |
|---|---|---|---|---|---|---|
| Has field | ✅ | ❌ N/A | ❌ N/A | ❌ N/A | ✅ | ❌ N/A |
| `lastNameValidator` | ✅ | — | — | — | ✅ | — |
| Min 3 chars | ✅ | — | — | — | ✅ | — |
| Max 50 chars | ✅ | — | — | — | ✅ | — |
| Exact error messages | ✅ | — | — | — | ✅ | — |
| UI wrapper pattern | ✅ | — | — | — | ✅ | — |

### Email

| Criterion | Register | Reset PW | Forgot PW | Login | Profile (Fixed) | Settings |
|---|---|---|---|---|---|---|
| Has field | ✅ | ❌ N/A | ✅ | ✅ | ✅ | ❌ N/A |
| `emailValidator` | ✅ | — | ✅ | ✅ | ✅ | — |
| Max 254 check | ✅ | — | ✅ | ✅ | ✅ | — |
| `getEmailErrorHint()` | ✅ | — | ✅ | ✅ | ✅ | — |
| Exact error messages | ✅ | — | ✅ | ✅ | ✅ | — |
| UI wrapper pattern | ✅ | — | ✅ | ✅ | ✅ | — |

### Organization

| Criterion | Register | Reset PW | Forgot PW | Login | Profile (Fixed) | Settings |
|---|---|---|---|---|---|---|
| Has field | ✅ | ❌ N/A | ❌ N/A | ❌ N/A | ✅ | ❌ N/A |
| `organizationValidator` | ✅ | — | — | — | ✅ | — |
| Optional (no required) | ✅ | — | — | — | ✅ | — |
| Min 2 if non-empty | ✅ | — | — | — | ✅ | — |
| Max 100 | ✅ | — | — | — | ✅ | — |
| `(optional)` label | ✅ | — | — | — | ✅ | — |
| Exact error messages | ✅ | — | — | — | ✅ | — |
| UI wrapper pattern | ✅ | — | — | — | ✅ | — |

### Password (creation)

| Criterion | Register | Reset PW | Forgot PW | Login | Profile (Fixed) | Settings |
|---|---|---|---|---|---|---|
| Has field | ✅ | ✅ | ❌ N/A | ❌* | ✅ | ❌ N/A |
| `passwordValidator` | ✅ | ✅ | — | — | ✅ | — |
| All 5 rules | ✅ | ✅ | — | — | ✅ | — |
| `PasswordStrengthComponent` | ✅ | ✅ | — | — | ✅ | — |
| `PasswordRequirementsComponent` | ✅ | ✅ | — | — | ✅ | — |
| Show/hide toggle | ✅ | ✅ | — | ✅ | ✅ | — |
| `passwordFocused` signal | ✅ | ✅ | — | — | ✅ | — |
| Exact error messages | ✅ | ✅ | — | — | ✅ | — |
| UI wrapper pattern | ✅ | ✅ | — | — | ✅ | — |

*Login password: `Validators.required` only (correct — login enforces no creation rules)

### Confirm Password

| Criterion | Register | Reset PW | Forgot PW | Login | Profile (Fixed) | Settings |
|---|---|---|---|---|---|---|
| Has field | ✅ | ✅ | ❌ N/A | ❌ N/A | ✅ | ❌ N/A |
| `passwordMatchValidator` | ✅ | ✅ | — | — | ✅ | — |
| `required` error msg | `Confirm password is required.` | `Confirm password is required.` | — | — | `Confirm password is required.` | — |
| Mismatch error msg | `Passwords do not match.` | `Passwords do not match.` | — | — | `Passwords do not match.` | — |
| Match success msg | `Passwords match` | `Passwords match` | — | — | `Passwords match` | — |
| Show/hide toggle | ✅ | ✅ | — | — | ✅ | — |

---

## FINAL ALIGNMENT STATUS

| Form | Status | Notes |
|---|---|---|
| Register | ✅ Source of truth | Unchanged |
| Reset Password | ✅ Already aligned | No changes needed |
| Forgot Password | ✅ Already aligned | No changes needed |
| Login | ✅ Already aligned | No changes needed |
| **Profile** | ✅ **FIXED** | 3 files updated |
| Settings | ✅ N/A | No equivalent fields |

