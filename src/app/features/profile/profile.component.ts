import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { LanguageService } from '@core/services/language.service';
import { MockService } from '@core/mock/mock.service';
import { PasswordStrengthComponent } from '../../shared/auth-components/password-strength.component';
import { PasswordRequirementsComponent } from '../../shared/auth-components/password-requirements.component';
import {
  firstNameValidator, lastNameValidator, emailValidator,
  organizationValidator, passwordValidator, passwordMatchValidator,
  calcPasswordStrength, getEmailErrorHintKey,
} from '../../shared/auth-components/auth-validators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordStrengthComponent, PasswordRequirementsComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly mockService = inject(MockService);
  readonly langService = inject(LanguageService);

  readonly currentUser = this.authService.currentUser;
  saving = signal(false);
  changingPassword = signal(false);
  showPasswordSection = signal(false);

  // password visibility toggles
  showCurrentPassword  = signal(false);
  showNewPassword      = signal(false);
  showConfirmPassword  = signal(false);
  newPasswordFocused   = signal(false);

  profileForm = this.fb.group({
    firstName:        [this.currentUser()?.firstName        || '', [Validators.required, firstNameValidator]],
    lastName:         [this.currentUser()?.lastName         || '', [Validators.required, lastNameValidator]],
    email:            [this.currentUser()?.email            || '', [Validators.required, emailValidator]],
    organizationName: [this.currentUser()?.organizationName || '', [organizationValidator]],
  });

  // Current Password reuses the exact same passwordValidator as Register so that
  // it can never show a "valid" state for an obviously incomplete password
  // (e.g. "abc"). Format-valid here means "satisfies password format rules" —
  // it does NOT mean the password is correct; only the backend can confirm that.
  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required, passwordValidator]],
    password:     ['', [Validators.required, passwordValidator]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: passwordMatchValidator });

  // ── New/Confirm Password gate ───────────────────────────────────────────
  // New Password and Confirm Password stay locked/disabled until Current
  // Password becomes format-valid. They start disabled; see constructor.
  currentPasswordUnlocked = signal(false);

  constructor() {
    // Start locked: user must enter a format-valid Current Password first.
    this.passwordForm.get('password')!.disable();
    this.passwordForm.get('confirmPassword')!.disable();

    this.passwordForm.get('currentPassword')!.valueChanges.subscribe(() => {
      this.updatePasswordGate();
    });
  }

  private updatePasswordGate(): void {
    const currentCtrl = this.passwordForm.get('currentPassword')!;
    const formatValid = currentCtrl.valid;

    if (formatValid && !this.currentPasswordUnlocked()) {
      this.currentPasswordUnlocked.set(true);
      this.passwordForm.get('password')!.enable();
      this.passwordForm.get('confirmPassword')!.enable();
    } else if (!formatValid && this.currentPasswordUnlocked()) {
      this.lockNewPasswordFields();
    }
  }

  /** Locks New/Confirm Password again and clears their values (used on initial
   *  lock-state changes and on simulated backend "incorrect password" relock). */
  private lockNewPasswordFields(): void {
    this.currentPasswordUnlocked.set(false);
    const pw  = this.passwordForm.get('password')!;
    const cpw = this.passwordForm.get('confirmPassword')!;
    pw.disable();
    cpw.disable();
  }

  stats = [
    { labelKey: 'profile.stats.cases_created',     value: 42,   icon: 'folder_open',       color: '#4e4eeb' },
    { labelKey: 'profile.stats.docs_analyzed',     value: 318,  icon: 'document_scanner',  color: '#10b981' },
    { labelKey: 'profile.stats.reports_generated', value: 27,   icon: 'description',       color: '#8b5cf6' },
    { labelKey: 'profile.stats.ai_queries',        value: 1204, icon: 'smart_toy',         color: '#f59e0b' },
  ];

  togglePasswordSection(): void { this.showPasswordSection.update(v => !v); }
  toggleCurrentPassword():  void { this.showCurrentPassword.update(v => !v); }
  toggleNewPassword():      void { this.showNewPassword.update(v => !v); }
  toggleConfirmPassword():  void { this.showConfirmPassword.update(v => !v); }

  get newPasswordValue(): string {
    return (this.passwordForm.get('password')?.value || '').trim();
  }
  get newPasswordStrength() { return calcPasswordStrength(this.newPasswordValue); }

  saveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.profileForm.value;
    this.mockService.updateProfile(val).subscribe({
      next: () => {
        this.authService.updateCurrentUser({ ...this.currentUser()!, ...val as any });
        this.toastService.success(this.langService.t('profile.toast.profile_updated'));
        this.saving.set(false);
      },
    });
  }

  changePassword(): void {
    if (this.newPasswordFieldsLocked) {
      // New/Confirm Password are disabled and excluded from form validity by
      // Angular, so guard explicitly rather than relying on passwordForm.invalid.
      this.passwordForm.get('currentPassword')!.markAsTouched();
      return;
    }
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    if (this.passwordForm.hasError('passwordMismatch')) {
      this.toastService.error(this.langService.t('profile.toast.passwords_mismatch'));
      return;
    }
    this.changingPassword.set(true);

    // ──────────────────────────────────────────────────────────────────────
    // BACKEND READY — kept inactive/commented. Mocks remain authoritative
    // until a real backend is connected. Do not uncomment without removing
    // the mock setTimeout block below.
    // ──────────────────────────────────────────────────────────────────────
    //
    // POST /profile/change-password
    //
    // Request:
    // {
    //   currentPassword,
    //   newPassword
    // }
    //
    // Success:
    // {
    //   success: true
    // }
    //
    // Failure:
    // {
    //   success: false,
    //   message: "Current password is incorrect"
    // }
    //
    // this.authService.changePassword({
    //   currentPassword: this.passwordForm.value.currentPassword!,
    //   newPassword: this.passwordForm.value.password!,
    // }).subscribe({
    //   next: (res) => {
    //     if (!res.success) {
    //       // Relock flow: current password was rejected by the backend.
    //       this.handleIncorrectCurrentPasswordError();
    //       this.changingPassword.set(false);
    //       return;
    //     }
    //     this.toastService.success('Password changed successfully');
    //     this.changingPassword.set(false);
    //     this.showPasswordSection.set(false);
    //     this.passwordForm.reset();
    //   },
    //   error: () => {
    //     this.handleIncorrectCurrentPasswordError();
    //     this.changingPassword.set(false);
    //   },
    // });

    setTimeout(() => {
      this.toastService.success(this.langService.t('profile.toast.password_changed'));
      this.changingPassword.set(false);
      this.showPasswordSection.set(false);
      this.passwordForm.reset();
    }, 800);
  }

  /** Relock flow (Section 8): called when the backend reports that Current
   *  Password is incorrect. Shows the error on Current Password, clears and
   *  re-locks New/Confirm Password, and keeps Current Password's value so
   *  the user can correct it. Password is never changed in this path —
   *  Section 9 ("Password Safety") — the profile remains unchanged. */
  private handleIncorrectCurrentPasswordError(): void {
    this.passwordForm.get('currentPassword')!.setErrors({ incorrect: true });
    this.passwordForm.get('password')!.setValue('');
    this.passwordForm.get('confirmPassword')!.setValue('');
    this.lockNewPasswordFields();
  }

  get userInitials(): string {
    const u = this.currentUser();
    if (!u) return '?';
    return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  }

  getRoleBadgeKey(role: string): string {
    const m: Record<string, string> = {
      admin: 'profile.role_badge.admin', lawyer: 'profile.role_badge.lawyer',
      analyst: 'profile.role_badge.analyst', viewer: 'profile.role_badge.viewer'
    };
    return m[role] || role;
  }

  // ── Profile form error getters — exact messages matching Register ──────────

  get firstNameErrors(): string[] {
    const ctrl = this.profileForm.get('firstName')!;
    if (!ctrl.touched && !ctrl.dirty) return [];
    const e: string[] = [];
    if (ctrl.hasError('required'))     e.push('profile.error.first_name_required');
    if (ctrl.hasError('nameTooShort')) e.push('profile.error.first_name_short');
    if (ctrl.hasError('nameTooLong'))  e.push('profile.error.first_name_long');
    return e;
  }

  get lastNameErrors(): string[] {
    const ctrl = this.profileForm.get('lastName')!;
    if (!ctrl.touched && !ctrl.dirty) return [];
    const e: string[] = [];
    if (ctrl.hasError('required'))     e.push('profile.error.last_name_required');
    if (ctrl.hasError('nameTooShort')) e.push('profile.error.last_name_short');
    if (ctrl.hasError('nameTooLong'))  e.push('profile.error.last_name_long');
    return e;
  }

  get emailErrors(): string[] {
    const ctrl = this.profileForm.get('email')!;
    if (!ctrl.touched && !ctrl.dirty) return [];
    const e: string[] = [];
    if (ctrl.hasError('required'))     e.push('val.email.required');
    if (ctrl.hasError('emailTooLong')) e.push('val.email.too_long');
    if (ctrl.hasError('invalidEmail')) e.push(getEmailErrorHintKey(ctrl.value));
    return e;
  }

  get orgErrors(): string[] {
    const ctrl = this.profileForm.get('organizationName')!;
    if (!ctrl.touched && !ctrl.dirty) return [];
    const e: string[] = [];
    if (ctrl.hasError('orgTooShort')) e.push('profile.error.org_short');
    if (ctrl.hasError('orgTooLong'))  e.push('profile.error.org_long');
    return e;
  }

  isProfileFieldValid(name: string): boolean {
    const c = this.profileForm.get(name);
    return !!(c?.valid && (c?.touched || c?.dirty));
  }

  // ── Password form error getters — exact messages matching Register ─────────

  get currentPasswordErrors(): string[] {
    const ctrl = this.passwordForm.get('currentPassword')!;
    if (!ctrl.touched && !ctrl.dirty) return [];
    const e: string[] = [];
    if (ctrl.hasError('required'))    e.push('profile.error.current_pw_required');
    if (ctrl.hasError('pwTooShort'))  e.push('val.password.too_short');
    if (ctrl.hasError('pwTooLong'))   e.push('val.password.too_long');
    if (ctrl.hasError('pwNoUpper'))   e.push('val.password.no_upper');
    if (ctrl.hasError('pwNoLower'))   e.push('val.password.no_lower');
    if (ctrl.hasError('pwNoNumber'))  e.push('val.password.no_number');
    if (ctrl.hasError('pwNoSpecial')) e.push('val.password.no_special');
    if (ctrl.hasError('incorrect'))   e.push('profile.error.current_pw_incorrect');
    return e;
  }

  /** Whether New/Confirm Password should render in their locked visual state. */
  get newPasswordFieldsLocked(): boolean {
    return !this.currentPasswordUnlocked();
  }

  get newPasswordErrors(): string[] {
    const ctrl = this.passwordForm.get('password')!;
    if (!ctrl.touched && !ctrl.dirty) return [];
    const e: string[] = [];
    if (ctrl.hasError('required'))    e.push('val.password.required');
    if (ctrl.hasError('pwTooShort'))  e.push('val.password.too_short');
    if (ctrl.hasError('pwTooLong'))   e.push('val.password.too_long');
    if (ctrl.hasError('pwNoUpper'))   e.push('val.password.no_upper');
    if (ctrl.hasError('pwNoLower'))   e.push('val.password.no_lower');
    if (ctrl.hasError('pwNoNumber'))  e.push('val.password.no_number');
    if (ctrl.hasError('pwNoSpecial')) e.push('val.password.no_special');
    return e;
  }

  get confirmPasswordErrors(): string[] {
    const ctrl = this.passwordForm.get('confirmPassword')!;
    if (!ctrl.touched && !ctrl.dirty) return [];
    const e: string[] = [];
    if (ctrl.hasError('required')) e.push('profile.error.confirm_required');
    if (this.passwordForm.hasError('passwordMismatch') && ctrl.value)
      e.push('profile.error.passwords_mismatch');
    return e;
  }

  get confirmMatch(): boolean {
    const pw  = (this.passwordForm.get('password')?.value     || '').trim();
    const cpw = (this.passwordForm.get('confirmPassword')?.value || '').trim();
    return !!(pw && cpw && pw === cpw);
  }

  isPasswordFieldValid(name: string): boolean {
    const c = this.passwordForm.get(name);
    return !!(c?.valid && (c?.touched || c?.dirty));
  }
}
