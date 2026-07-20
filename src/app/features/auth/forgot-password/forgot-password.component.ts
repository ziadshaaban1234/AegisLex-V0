import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '@core/services/theme.service';
import { LanguageService } from '@core/services/language.service';
import { DraftRecoveryService } from '@core/services/draft-recovery.service';
import { emailValidator, getEmailErrorHintKey } from '../../../shared/auth-components/auth-validators';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  private readonly fb     = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly drafts = inject(DraftRecoveryService);
  readonly themeService   = inject(ThemeService);
  readonly langService    = inject(LanguageService);

  isLoading      = signal(false);
  isSuccess      = signal(false);
  serverError    = signal('');
  submittedEmail = signal('');
  submitGuard    = false;

  private sub = new Subscription();

  forgotForm = this.fb.group({
    email: ['', [Validators.required, emailValidator]],
  });

  ngOnInit(): void {
    this.sub.add(
      this.forgotForm.get('email')!.valueChanges.subscribe(() => {
        if (this.serverError()) this.serverError.set('');
      })
    );
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  onSubmit(): void {
    if (this.submitGuard || this.isLoading()) return;
    if (this.forgotForm.invalid) { this.forgotForm.markAllAsTouched(); return; }

    this.submitGuard = true;
    this.isLoading.set(true);
    this.serverError.set('');

    const email = (this.forgotForm.get('email')!.value || '').trim();
    this.submittedEmail.set(email);

    // In real app: authService.forgotPassword(email)
    setTimeout(() => {
      this.isLoading.set(false);
      this.submitGuard = false;
      this.isSuccess.set(true);
      this.drafts.saveOtpState(email);
    }, 1600);
  }

  goToOtp(): void { this.router.navigate(['/auth/verify-otp']); }

  resendEmail(): void {
    this.isSuccess.set(false);
    this.forgotForm.patchValue({ email: this.submittedEmail() });
    this.forgotForm.markAsUntouched();
  }

  // Backend error handler — exact messages per spec (now via translation keys)
  handleServerError(code: string): void {
    const map: Record<string,string> = {
      USER_NOT_FOUND:   'forgot.error.user_not_found',
      ACCOUNT_DISABLED: 'forgot.error.account_disabled',
      OTP_RATE_LIMIT:   'forgot.error.otp_rate_limit',
    };
    this.serverError.set(map[code] || 'forgot.error.generic');
  }

  get emailErrors(): string[] {
    const ctrl = this.forgotForm.get('email')!;
    if (!ctrl.touched && !ctrl.dirty) return [];
    const e: string[] = [];
    if (ctrl.hasError('required'))     e.push('val.email.required');
    if (ctrl.hasError('emailTooLong')) e.push('val.email.too_long');
    if (ctrl.hasError('invalidEmail')) e.push(getEmailErrorHintKey(ctrl.value));
    return e;
  }

  isEmailValid(): boolean {
    const c = this.forgotForm.get('email');
    return !!(c?.valid && (c?.touched || c?.dirty));
  }
}
