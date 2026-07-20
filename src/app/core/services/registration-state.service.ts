/**
 * RegistrationStateService
 * ─────────────────────────────────────────────────────────
 * Tracks multi-step registration state.
 * Bridges Step 1 (account details) → Step 2 (security).
 * Delegates draft persistence to DraftRecoveryService.
 */
import { Injectable, signal, inject } from '@angular/core';
import { DraftRecoveryService } from './draft-recovery.service';
import { RegDraft } from '@core/models';

export type RegStep = 1 | 2;

export interface Step1Data {
  firstName:        string;
  lastName:         string;
  email:            string;
  organizationName: string;
  role:             string;
  agreeTerms?:      boolean;
}

@Injectable({ providedIn: 'root' })
export class RegistrationStateService {
  private readonly drafts = inject(DraftRecoveryService);

  private _currentStep = signal<RegStep>(1);
  private _step1Data   = signal<Step1Data | null>(null);

  readonly currentStep = this._currentStep.asReadonly();
  readonly step1Data   = this._step1Data.asReadonly();

  advanceToStep2(data: Step1Data): void {
    this._step1Data.set(data);
    this._currentStep.set(2);
  }

  backToStep1(): void {
    this._currentStep.set(1);
  }

  reset(): void {
    this._currentStep.set(1);
    this._step1Data.set(null);
  }

  saveDraft(data: Omit<RegDraft, 'savedAt'>): void {
    this.drafts.saveRegistrationDraft(data);
  }

  loadDraft(): Partial<RegDraft> | null {
    return this.drafts.loadRegistrationDraft();
  }

  clearDraft(): void {
    this.drafts.clearRegistrationDraft();
  }
}
