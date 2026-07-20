import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MockService } from '@core/mock/mock.service';
import { ToastService } from '@core/services/toast.service';
import { LanguageService } from '@core/services/language.service';
import { Store } from '@ngrx/store';
import { CasesActions } from '../../../store/cases/cases.reducer';

@Component({
  selector: 'app-case-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './case-form.component.html',
  styleUrl: './case-form.component.scss',
})
export class CaseFormComponent {
  private readonly fb          = inject(FormBuilder);
  private readonly mockService = inject(MockService);
  private readonly toastService= inject(ToastService);
  private readonly router      = inject(Router);
  private readonly store       = inject(Store);
  readonly lang                = inject(LanguageService);

  isLoading = signal(false);
  tagInput  = signal('');
  tags      = signal<string[]>([]);

  // Computed so labels update when language changes
  caseTypes = computed(() => [
    { value: 'contract',      label: this.lang.t('cases.type.contract'),      icon: 'description' },
    { value: 'litigation',    label: this.lang.t('cases.type.litigation'),    icon: 'gavel' },
    { value: 'compliance',    label: this.lang.t('cases.type.compliance'),    icon: 'verified' },
    { value: 'investigation', label: this.lang.t('cases.type.investigation'), icon: 'search' },
    { value: 'advisory',      label: this.lang.t('cases.type.advisory'),      icon: 'lightbulb' },
    { value: 'other',         label: this.lang.t('cases.type.other'),         icon: 'folder' },
  ]);

  priorities = computed(() => [
    { value: 'critical', label: this.lang.t('cases.priority.critical'), color: '#ef4444' },
    { value: 'high',     label: this.lang.t('cases.priority.high'),     color: '#f97316' },
    { value: 'medium',   label: this.lang.t('cases.priority.medium'),   color: '#eab308' },
    { value: 'low',      label: this.lang.t('cases.priority.low'),      color: '#22c55e' },
  ]);

  form = this.fb.group({
    title:       ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    description: [''],
    caseType:    ['contract', Validators.required],
    priority:    ['medium', Validators.required],
    clientName:  [''],
  });

  addTag(): void {
    const val = this.tagInput().trim();
    if (val && !this.tags().includes(val) && this.tags().length < 10) {
      this.tags.update(t => [...t, val]);
      this.tagInput.set('');
    }
  }

  onTagKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); this.addTag(); }
  }

  removeTag(tag: string): void { this.tags.update(t => t.filter(x => x !== tag)); }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    const val = this.form.value;
    this.mockService.createCase({
      title:       val.title!,
      description: val.description || undefined,
      caseType:    val.caseType as any,
      priority:    val.priority as any,
      clientName:  val.clientName || undefined,
      tags:        this.tags(),
    }).subscribe({
      next: (res: any) => {
        this.store.dispatch(CasesActions.createCaseSuccess({ case: res.data }));
        this.toastService.success(this.lang.t('cases.toast.created'), res.data.caseNumber);
        this.router.navigate(['/app/cases', res.data.id]);
      },
      error: () => { this.isLoading.set(false); },
    });
  }

  fieldError(name: string): string {
    const ctrl = this.form.get(name);
    if (!ctrl || (!ctrl.touched && !ctrl.dirty) || ctrl.valid) return '';
    if (ctrl.hasError('required')) return this.lang.t('case_form.error.required');
    if (ctrl.hasError('minlength')) return this.lang.t('case_form.error.minlength', [ctrl.errors?.['minlength'].requiredLength]);
    return '';
  }
}
