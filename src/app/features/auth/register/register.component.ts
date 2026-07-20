import {
  Component, inject, signal, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { debounceTime, Subscription } from 'rxjs';
import { AuthActions } from '../../../store/auth/auth.actions';
import { AppState } from '../../../store/app.state';
import { ThemeService } from '@core/services/theme.service';
import { LanguageService } from '@core/services/language.service';
import { GoogleAuthService } from '@core/services/google-auth.service';
import { PasswordStrengthComponent } from '../../../shared/auth-components/password-strength.component';
import { PasswordRequirementsComponent } from '../../../shared/auth-components/password-requirements.component';
import {
  emailValidator, firstNameValidator, lastNameValidator,
  organizationValidator, passwordValidator, passwordMatchValidator,
  calcPasswordStrength, getEmailErrorHintKey,
} from '../../../shared/auth-components/auth-validators';
import { RegistrationStateService } from '@core/services/registration-state.service';
import { RoleService } from '@core/services/role.service';

import { CanDeactivateComponent } from '../../../core/guards/unsaved-changes.guard';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    PasswordStrengthComponent, PasswordRequirementsComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit, OnDestroy, CanDeactivateComponent {
  private readonly fb       = inject(FormBuilder);
  private readonly store    = inject(Store<AppState>);
  private readonly regState = inject(RegistrationStateService);
  private readonly roleSvc  = inject(RoleService);
  private readonly router   = inject(Router);
  private readonly route    = inject(ActivatedRoute);
  private readonly googleAuth = inject(GoogleAuthService);
  readonly themeService     = inject(ThemeService);
  readonly langService      = inject(LanguageService);

  showPassword    = signal(false);
  showConfirm     = signal(false);
  isLoading       = signal(false);
  isGoogleLoading = signal(false);
  currentStep     = signal(1);
  passwordFocused = signal(false);
  draftRestored   = signal(false);
  submitBlocked   = signal(false); // prevent double-submit

  private sub = new Subscription();

  registerForm = this.fb.group({
    firstName:        ['', [Validators.required, firstNameValidator]],
    lastName:         ['', [Validators.required, lastNameValidator]],
    email:            ['', [Validators.required, emailValidator]],
    organizationName: ['', [organizationValidator]],       // OPTIONAL
    role:             ['lawyer'],
    password:         ['', [Validators.required, passwordValidator]],
    confirmPassword:  ['', [Validators.required]],
    agreeTerms:       [false, Validators.requiredTrue],
  }, { validators: passwordMatchValidator });

  // NOTE: RoleService.getAvailableRoles() returns English-only labels and is
  // also used elsewhere; rather than modifying that shared service, this
  // component builds its own localized role list (same `value`s, same order)
  // using LanguageService translation keys, used only for display in this
  // template's role-selector radio buttons.
  roles: { value: string; labelKey: string }[] = [
    { value: 'lawyer',  labelKey: 'register.role.lawyer'  },
    { value: 'analyst', labelKey: 'register.role.analyst' },
    { value: 'admin',   labelKey: 'register.role.admin'   },
    { value: 'viewer',  labelKey: 'register.role.viewer'  },
  ];

  ngOnInit(): void {
    const draft = this.regState.loadDraft();
    if (draft) {
      this.registerForm.patchValue({
        firstName:        draft.firstName        ?? '',
        lastName:         draft.lastName         ?? '',
        email:            draft.email            ?? '',
        organizationName: draft.organizationName ?? '',
        role:             draft.role             ?? 'lawyer',
        agreeTerms:       draft.agreeTerms       ?? false,
      });
      if (draft.firstName || draft.email) this.draftRestored.set(true);
    }

    // Auto-save draft with debounce
    this.sub.add(
      this.registerForm.valueChanges.pipe(debounceTime(700)).subscribe(v => {
        this.regState.saveDraft({
          firstName:        v.firstName        || '',
          lastName:         v.lastName         || '',
          email:            v.email            || '',
          organizationName: v.organizationName || '',
          role:             v.role             || 'lawyer',
          agreeTerms:       v.agreeTerms       ?? false,
        });
      })
    );

    // Clear server-level errors immediately on value changes
    this.sub.add(
      this.registerForm.valueChanges.subscribe(() => {
        if (this.submitBlocked()) this.submitBlocked.set(false);
      })
    );
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  togglePassword(): void { this.showPassword.update(v => !v); }
  toggleConfirm():  void { this.showConfirm.update(v => !v); }

  get passwordValue(): string { return (this.registerForm.get('password')?.value || '').trim(); }
  get passwordStrength() { return calcPasswordStrength(this.passwordValue); }

  nextStep(): void {
    const step1Fields = ['firstName', 'lastName', 'email', 'organizationName'];
    step1Fields.forEach(f => this.registerForm.get(f)?.markAsTouched());
    const allValid = step1Fields.every(f => this.registerForm.get(f)?.valid);
    if (allValid) {
      this.currentStep.set(2);
      // Scroll to top of form panel
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    }
  }

  prevStep(): void {
    this.currentStep.set(1);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }

  dismissDraftNotice(): void { this.draftRestored.set(false); }

  onSubmit(): void {
    if (this.isLoading() || this.submitBlocked()) return;
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }

    this.isLoading.set(true);
    this.submitBlocked.set(true);

    const v = this.registerForm.value;
    this.store.dispatch(AuthActions.register({
      request: {
        firstName:        (v.firstName || '').trim(),
        lastName:         (v.lastName  || '').trim(),
        email:            (v.email     || '').trim(),
        password:         (v.password  || '').trim(),
        confirmPassword:  (v.confirmPassword || '').trim(),
        organizationName: v.organizationName?.trim() || undefined,
        role:             v.role || 'lawyer',
      },
    }));

    // Reset guard after timeout (effects will navigate away on success)
    setTimeout(() => { this.isLoading.set(false); this.submitBlocked.set(false); }, 8000);
  }

  // ── Error getters — exact messages per spec ──────────────────────────────

  get firstNameErrors(): string[] {
    const ctrl = this.registerForm.get('firstName')!;
    if (!ctrl.touched && !ctrl.dirty) return [];
    const e: string[] = [];
    if (ctrl.hasError('required'))     e.push('register.error.required.first_name');
    if (ctrl.hasError('nameTooShort')) e.push('register.error.too_short.first_name');
    if (ctrl.hasError('nameTooLong'))  e.push('register.error.too_long.first_name');
    return e;
  }

  get lastNameErrors(): string[] {
    const ctrl = this.registerForm.get('lastName')!;
    if (!ctrl.touched && !ctrl.dirty) return [];
    const e: string[] = [];
    if (ctrl.hasError('required'))     e.push('register.error.required.last_name');
    if (ctrl.hasError('nameTooShort')) e.push('register.error.too_short.last_name');
    if (ctrl.hasError('nameTooLong'))  e.push('register.error.too_long.last_name');
    return e;
  }

  get emailErrors(): string[] {
    const ctrl = this.registerForm.get('email')!;
    if (!ctrl.touched && !ctrl.dirty) return [];
    const e: string[] = [];
    if (ctrl.hasError('required'))     e.push('val.email.required');
    if (ctrl.hasError('emailTooLong')) e.push('val.email.too_long');
    if (ctrl.hasError('invalidEmail')) e.push(getEmailErrorHintKey(ctrl.value));
    return e;
  }

  get orgErrors(): string[] {
    const ctrl = this.registerForm.get('organizationName')!;
    if (!ctrl.touched && !ctrl.dirty) return [];
    const e: string[] = [];
    if (ctrl.hasError('orgTooShort')) e.push('register.error.org_too_short');
    if (ctrl.hasError('orgTooLong'))  e.push('register.error.org_too_long');
    return e;
  }

  get passwordErrors(): string[] {
    const ctrl = this.registerForm.get('password')!;
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
    const ctrl = this.registerForm.get('confirmPassword')!;
    if (!ctrl.touched && !ctrl.dirty) return [];
    const e: string[] = [];
    if (ctrl.hasError('required')) e.push('register.error.confirm_required');
    if (this.registerForm.hasError('passwordMismatch') && ctrl.value)
      e.push('register.error.passwords_mismatch');
    return e;
  }

  get confirmMatch(): boolean {
    const pw  = (this.registerForm.get('password')?.value  || '').trim();
    const cpw = (this.registerForm.get('confirmPassword')?.value || '').trim();
    return !!(pw && cpw && pw === cpw);
  }

  // Success state helpers
  isFieldValid(name: string): boolean {
    const c = this.registerForm.get(name);
    return !!(c?.valid && (c?.touched || c?.dirty));
  }

  get step1Valid(): boolean {
    return ['firstName','lastName','email','organizationName']
      .every(f => this.registerForm.get(f)?.valid);
  }

  get step2Valid(): boolean {
    const pw    = this.registerForm.get('password');
    const cpw   = this.registerForm.get('confirmPassword');
    const terms = this.registerForm.get('agreeTerms');
    return !!(pw?.valid && cpw?.value && !this.registerForm.hasError('passwordMismatch') && terms?.value);
  }

  /** CanDeactivateComponent — prevent accidental navigation loss */
  hasUnsavedChanges(): boolean {
    if (this.isLoading()) return false;
    const v = this.registerForm.value;
    return !!(v.firstName || v.lastName || v.email || v.organizationName || v.password);
  }

  onGoogleSignUp(): void {
    if (this.isLoading() || this.isGoogleLoading()) return;
    this.isGoogleLoading.set(true);

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
      },
    });
  }
}
