import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthService } from '@core/services/auth.service';
import { GoogleAuthService } from '@core/services/google-auth.service';
import { ThemeService } from '@core/services/theme.service';
import { LanguageService } from '@core/services/language.service';
import { AppState } from '../../../store/app.state';
import { AuthActions } from '../../../store/auth/auth.actions';
import { EMAIL_REGEX, emailValidator, getEmailErrorHintKey } from '../../../shared/auth-components/auth-validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly fb           = inject(FormBuilder);
  private readonly authService  = inject(AuthService);
  private readonly googleAuth   = inject(GoogleAuthService);
  private readonly router       = inject(Router);
  private readonly route        = inject(ActivatedRoute);
  private readonly store        = inject(Store<AppState>);
  readonly themeService         = inject(ThemeService);
  readonly langService          = inject(LanguageService);

  showPassword    = signal(false);
  isLoading       = signal(false);
  isGoogleLoading = signal(false);
  serverError     = signal('');
  errorType       = signal<'error' | 'locked' | 'disabled'>('error');
  sessionMsg      = signal('');
  submitGuard     = false; // prevent double-click

  private sub = new Subscription();

  loginForm = this.fb.group({
    email:      ['demo@aegislex.com', [Validators.required, emailValidator]],
    password:   ['demo123',           [Validators.required]],
    rememberMe: [true],
  });

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/app/dashboard']);
      return;
    }

    // Session-expired query param
    this.sub.add(
      this.route.queryParams.subscribe(params => {
        if (params['reason'] === 'session_expired')
          this.sessionMsg.set('login.session_expired');
      })
    );

    // Clear errors on any value change
    this.sub.add(
      this.loginForm.valueChanges.subscribe(() => {
        if (this.serverError()) { this.serverError.set(''); this.sessionMsg.set(''); }
      })
    );
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  togglePassword(): void { this.showPassword.update(v => !v); }

  onSubmit(): void {
    if (this.submitGuard || this.isLoading() || this.isGoogleLoading()) return;
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }

    this.submitGuard = true;
    this.isLoading.set(true);
    this.serverError.set('');
    this.sessionMsg.set('');

    const email      = (this.loginForm.value.email    || '').trim();
    const password   = (this.loginForm.value.password || '').trim();
    const rememberMe = this.loginForm.value.rememberMe ?? false;

    this.authService.login({ email, password, rememberMe }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.submitGuard = false;
        // Keep the NgRx AuthState slice in sync (side-effect-free —
        // does not trigger loginSuccess$'s toast/navigate/SignalR tap,
        // which this component already handles itself below).
        this.store.dispatch(AuthActions.sessionSynced({
          user: res.data.user,
          accessToken: res.data.accessToken,
        }));
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/app/dashboard';
        this.router.navigate([returnUrl]);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.submitGuard = false;
        const code = err?.error?.code || 'SERVER_ERROR';
        switch (code) {
          case 'INVALID_CREDENTIALS':
            this.serverError.set('login.error.invalid_credentials');
            this.errorType.set('error');
            break;
          case 'ACCOUNT_DISABLED':
            this.serverError.set('login.error.account_disabled');
            this.errorType.set('disabled');
            break;
          case 'ACCOUNT_LOCKED':
            this.serverError.set('login.error.account_locked');
            this.errorType.set('locked');
            break;
          default:
            this.serverError.set('login.error.generic');
            this.errorType.set('error');
        }
      },
    });
  }

  loginAsDemo(): void {
    if (this.isLoading()) return;
    this.loginForm.patchValue({
      email: 'demo@aegislex.com', password: 'demo123', rememberMe: true,
    });
    this.onSubmit();
  }

  onGoogleLogin(): void {
    if (this.isLoading() || this.isGoogleLoading()) return;
    this.isGoogleLoading.set(true);
    this.serverError.set('');
    this.sessionMsg.set('');

    this.googleAuth.loginWithGoogle().subscribe({
      next: (res) => {
        this.isGoogleLoading.set(false);
        // Sync NgRx AuthState — same action as email/password flow
        this.store.dispatch(AuthActions.sessionSynced({
          user: res.data.user,
          accessToken: res.data.accessToken,
        }));
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/app/dashboard';
        this.router.navigate([returnUrl]);
      },
      error: () => {
        this.isGoogleLoading.set(false);
        this.serverError.set('auth.google.error.generic');
        this.errorType.set('error');
      },
    });
  }

  // ── Error getters ─────────────────────────────────────────────────────────

  get emailErrors(): string[] {
    const ctrl = this.loginForm.get('email')!;
    if (!ctrl.touched && !ctrl.dirty) return [];
    const e: string[] = [];
    if (ctrl.hasError('required'))     e.push('val.email.required');
    if (ctrl.hasError('emailTooLong')) e.push('val.email.too_long');
    if (ctrl.hasError('invalidEmail')) e.push(getEmailErrorHintKey(ctrl.value));
    return e;
  }

  get passwordErrors(): string[] {
    const ctrl = this.loginForm.get('password')!;
    if (!ctrl.touched && !ctrl.dirty) return [];
    if (ctrl.hasError('required')) return ['val.password.required'];
    return [];
  }

  get loginDisabled(): boolean {
    const e = (this.loginForm.get('email')?.value    || '').trim();
    const p = (this.loginForm.get('password')?.value || '').trim();
    return !e || !EMAIL_REGEX.test(e) || !p;
  }

  isEmailValid(): boolean {
    const c = this.loginForm.get('email');
    return !!(c?.valid && (c?.touched || c?.dirty));
  }
}
