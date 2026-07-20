import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '@core/services/theme.service';
import { LanguageService } from '@core/services/language.service';
import { DraftRecoveryService } from '@core/services/draft-recovery.service';
import { ResetPasswordStateService } from '@core/services/reset-password-state.service';
import { PasswordStrengthComponent } from '../../../shared/auth-components/password-strength.component';
import { PasswordRequirementsComponent } from '../../../shared/auth-components/password-requirements.component';
import {
  passwordValidator, passwordMatchValidator,
  calcPasswordStrength
} from '../../../shared/auth-components/auth-validators';

import { CanDeactivateComponent } from '../../../core/guards/unsaved-changes.guard';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    PasswordStrengthComponent, PasswordRequirementsComponent
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit, OnDestroy, CanDeactivateComponent {
  private readonly fb        = inject(FormBuilder);
  private readonly router    = inject(Router);
  private readonly drafts    = inject(DraftRecoveryService);
  private readonly resetState = inject(ResetPasswordStateService);
  readonly themeService      = inject(ThemeService);
  readonly langService       = inject(LanguageService);

  showPassword    = signal(false);
  showConfirm     = signal(false);
  isLoading       = signal(false);
  isSuccess       = signal(false);
  serverError     = signal('');
  passwordFocused = signal(false);
  submitGuard     = false;

  private sub = new Subscription();

  resetForm = this.fb.group({
    password:        ['', [Validators.required, passwordValidator]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: passwordMatchValidator });

  ngOnInit(): void {
    if (!this.resetState.isVerified()) { this.router.navigate(['/auth/forgot-password']); return; }

    this.sub.add(
      this.resetForm.valueChanges.subscribe(() => {
        if (this.serverError()) this.serverError.set('');
      })
    );
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  togglePassword(): void { this.showPassword.update(v => !v); }
  toggleConfirm():  void { this.showConfirm.update(v => !v); }

  get passwordValue(): string { return (this.resetForm.get('password')?.value || '').trim(); }
  get passwordStrength() { return calcPasswordStrength(this.passwordValue); }

  onSubmit(): void {
    if (this.submitGuard || this.isLoading()) return;
    if (this.resetForm.invalid) { this.resetForm.markAllAsTouched(); return; }

    this.submitGuard = true;
    this.isLoading.set(true);
    this.serverError.set('');

    // In real app: authService.resetPassword(token, password)
    setTimeout(() => {
      this.isLoading.set(false);
      this.submitGuard = false;
      this.isSuccess.set(true);
      this.drafts.clearOtpState();
      this.resetState.markComplete();
    }, 1600);
  }

  handleServerError(code: string): void {
    const map: Record<string,string> = {
      WEAK_PASSWORD:       'reset.error.weak_password',
      RESET_TOKEN_INVALID: 'reset.error.token_invalid',
      RESET_TOKEN_EXPIRED: 'reset.error.token_expired',
    };
    this.serverError.set(map[code] || 'reset.error.generic');
  }

  goToLogin(): void { this.router.navigate(['/auth/login']); }

  get passwordErrors(): string[] {
    const ctrl = this.resetForm.get('password')!;
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
    const ctrl = this.resetForm.get('confirmPassword')!;
    if (!ctrl.touched && !ctrl.dirty) return [];
    const e: string[] = [];
    if (ctrl.hasError('required')) e.push('register.error.confirm_required');
    if (this.resetForm.hasError('passwordMismatch') && ctrl.value)
      e.push('register.error.passwords_mismatch');
    return e;
  }

  get confirmMatch(): boolean {
    const pw  = (this.resetForm.get('password')?.value        || '').trim();
    const cpw = (this.resetForm.get('confirmPassword')?.value || '').trim();
    return !!(pw && cpw && pw === cpw);
  }

  isFieldValid(name: string): boolean {
    const c = this.resetForm.get(name);
    return !!(c?.valid && (c?.touched || c?.dirty));
  }

  /** CanDeactivateComponent — prevent accidental navigation loss */
  hasUnsavedChanges(): boolean {
    if (this.isSuccess() || this.isLoading()) return false;
    const pw = this.resetForm.get('password')?.value || '';
    return pw.length > 0;
  }
}
