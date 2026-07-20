import {
  Component, inject, signal, OnInit, OnDestroy,
  ViewChildren, QueryList, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ThemeService } from '@core/services/theme.service';
import { LanguageService } from '@core/services/language.service';
import { DraftRecoveryService } from '@core/services/draft-recovery.service';
import { OtpStateService } from '@core/services/otp-state.service';
import { OTP_FULL_REGEX } from '../../../shared/auth-components/auth-validators';

const OTP_LENGTH       = 6;
const RESEND_COUNTDOWN = 60;

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.scss',
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  private readonly router    = inject(Router);
  private readonly drafts    = inject(DraftRecoveryService);
  private readonly otpState  = inject(OtpStateService);
  readonly themeService      = inject(ThemeService);
  readonly langService       = inject(LanguageService);

  digits    = signal<string[]>(Array(OTP_LENGTH).fill(''));
  isLoading = signal(false);
  isSuccess = signal(false);
  otpError  = signal('');
  countdown = signal(RESEND_COUNTDOWN);
  canResend = signal(false);
  email     = signal('');
  attempts  = signal(0);

  otpLength = OTP_LENGTH;
  otpArray  = Array.from({ length: OTP_LENGTH }, (_, i) => i);

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  private timer?: ReturnType<typeof setInterval>;
  private submitGuard = false;

  ngOnInit(): void {
    const storedEmail = this.drafts.loadOtpEmail() || '';
    this.email.set(storedEmail);
    if (!storedEmail) { this.router.navigate(['/auth/forgot-password']); return; }
    this.startCountdown();
    setTimeout(() => this.focusInput(0), 120);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private startCountdown(): void {
    this.countdown.set(RESEND_COUNTDOWN);
    this.canResend.set(false);
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.countdown.update(v => {
        if (v <= 1) { clearInterval(this.timer); this.canResend.set(true); return 0; }
        return v - 1;
      });
    }, 1000);
  }

  focusInput(index: number): void {
    const el = this.otpInputs?.get(index);
    if (el) { el.nativeElement.focus(); el.nativeElement.select(); }
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    // Strip non-digits
    let val = input.value.replace(/\D/g, '');
    if (val.length > 1) val = val[val.length - 1]; // keep last digit
    input.value = val;

    this.digits.update(d => { const c = [...d]; c[index] = val; return c; });
    if (this.otpError()) this.otpError.set('');

    if (val && index < OTP_LENGTH - 1) this.focusInput(index + 1);

    const code = this.digits().join('');
    if (OTP_FULL_REGEX.test(code)) this.submitOtp(code);
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const current = this.digits()[index];
      if (current) {
        this.digits.update(d => { const c = [...d]; c[index] = ''; return c; });
        const inp = this.otpInputs?.get(index);
        if (inp) inp.nativeElement.value = '';
      } else if (index > 0) {
        this.digits.update(d => { const c = [...d]; c[index - 1] = ''; return c; });
        const prev = this.otpInputs?.get(index - 1);
        if (prev) { prev.nativeElement.value = ''; }
        this.focusInput(index - 1);
      }
    }
    if (event.key === 'ArrowLeft'  && index > 0)              this.focusInput(index - 1);
    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) this.focusInput(index + 1);
    if (event.key === 'Tab') return; // allow natural tab
  }

  onPaste(event: ClipboardEvent, startIndex: number): void {
    event.preventDefault();
    const pasted = (event.clipboardData?.getData('text') || '').replace(/\D/g, '');
    if (!pasted) return;

    const newDigits = [...this.digits()];
    for (let i = 0; i < pasted.length && startIndex + i < OTP_LENGTH; i++) {
      newDigits[startIndex + i] = pasted[i];
      const inp = this.otpInputs?.get(startIndex + i);
      if (inp) inp.nativeElement.value = pasted[i];
    }
    this.digits.set(newDigits);

    const nextEmpty = newDigits.findIndex((d, idx) => idx >= startIndex && !d);
    this.focusInput(nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty);

    const code = newDigits.join('');
    if (OTP_FULL_REGEX.test(code)) this.submitOtp(code);
  }

  private submitOtp(code: string): void {
    if (this.isLoading() || this.submitGuard) return;
    this.submitGuard = true;
    this.isLoading.set(true);
    this.otpError.set('');

    // Demo: 123456 succeeds
    setTimeout(() => {
      this.isLoading.set(false);
      this.submitGuard = false;

      if (code === '123456') {
        this.isSuccess.set(true);
        this.otpState.setVerified('demo-reset-token-' + Date.now());
        setTimeout(() => this.router.navigate(['/auth/reset-password']), 1400);
      } else {
        this.attempts.update(a => a + 1);
        this.otpError.set(
          this.attempts() >= 3 ? 'otp.error.max_attempts' : 'otp.error.invalid'
        );
        this.clearInputs();
        setTimeout(() => this.focusInput(0), 50);
      }
    }, 1400);
  }

  private clearInputs(): void {
    this.digits.set(Array(OTP_LENGTH).fill(''));
    this.otpInputs?.forEach(inp => { inp.nativeElement.value = ''; });
  }

  resendCode(): void {
    if (!this.canResend() || this.isLoading()) return;
    this.clearInputs();
    this.otpError.set('');
    this.attempts.set(0);
    this.startCountdown();
    setTimeout(() => this.focusInput(0), 50);
  }

  /** Used by manual submit button if one exists */
  get otpFormatError(): string {
    const code = this.digits().join('');
    if (!code) return 'OTP is required.';
    if (!OTP_FULL_REGEX.test(code)) return 'OTP must contain exactly 6 digits.';
    return '';
  }

  get filledCount(): number  { return this.digits().filter(d => !!d).length; }
  get isComplete():  boolean { return this.filledCount === OTP_LENGTH; }
}
