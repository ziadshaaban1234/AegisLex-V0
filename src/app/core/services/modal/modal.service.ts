/**
 * ModalService + ConfirmDialogService + AlertDialogService
 * ─────────────────────────────────────────────────────────
 * Signal-based modal state manager.
 * No component coupling — state only.
 * A ModalContainerComponent reads this state and renders modals.
 *
 * Built-in dialog types:
 *   confirm  — "Are you sure?" with cancel + confirm
 *   alert    — informational with single dismiss
 *   custom   — any data payload for custom modals
 */
import { Injectable, signal, computed, inject } from '@angular/core';
import { LanguageService } from '../language.service';

// ── Modal types ───────────────────────────────────────────

export type ModalType =
  | 'confirm'
  | 'alert'
  | 'session-expired'
  | 'permission-denied'
  | 'account-locked'
  | 'unsaved-changes'
  | 'force-logout'
  | 'custom';

export interface ModalConfig<T = unknown> {
  id:          string;
  type:        ModalType;
  title:       string;
  message?:    string;
  confirmLabel?: string;
  cancelLabel?:  string;
  danger?:     boolean;
  data?:       T;
}

export interface ModalResult<T = unknown> {
  confirmed: boolean;
  data?:     T;
}

// ── ModalService ──────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly _active = signal<ModalConfig | null>(null);
  private resolveCallback: ((result: ModalResult) => void) | null = null;

  readonly activeModal = this._active.asReadonly();
  readonly isOpen      = computed(() => this._active() !== null);

  open<T = unknown>(config: Omit<ModalConfig<T>, 'id'>): Promise<ModalResult<T>> {
    const id = crypto.randomUUID();
    this._active.set({ ...config, id } as ModalConfig);
    return new Promise(resolve => {
      this.resolveCallback = resolve as (r: ModalResult) => void;
    });
  }

  close(confirmed = false, data?: unknown): void {
    if (this.resolveCallback) {
      this.resolveCallback({ confirmed, data });
      this.resolveCallback = null;
    }
    this._active.set(null);
  }
}

// ── ConfirmDialogService ──────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly modal = new ModalService();
  private readonly lang  = inject(LanguageService);

  confirm(
    title:        string,
    message:      string,
    confirmLabel?: string,
    cancelLabel?:  string,
    danger        = false,
  ): Promise<boolean> {
    return this.modal
      .open({
        type: 'confirm',
        title,
        message,
        confirmLabel: confirmLabel ?? this.lang.t('modal.confirm'),
        cancelLabel:  cancelLabel  ?? this.lang.t('modal.cancel'),
        danger,
      })
      .then(r => r.confirmed);
  }

  delete(itemName: string): Promise<boolean> {
    return this.confirm(
      this.lang.t('modal.delete.title', [itemName]),
      this.lang.t('modal.delete.message', [itemName.toLowerCase()]),
      this.lang.t('modal.delete.confirm_label'),
      this.lang.t('modal.cancel'),
      true,
    );
  }

  unsavedChanges(): Promise<boolean> {
    return this.confirm(
      this.lang.t('modal.unsaved.title'),
      this.lang.t('modal.unsaved.message'),
      this.lang.t('modal.unsaved.confirm_label'),
      this.lang.t('modal.stay'),
      false,
    );
  }

  get activeModal() { return this.modal.activeModal; }
  get isOpen()      { return this.modal.isOpen; }
  close(confirmed = false) { this.modal.close(confirmed); }
}

// ── AlertDialogService ────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AlertDialogService {
  private readonly modal = new ModalService();
  private readonly lang  = inject(LanguageService);

  alert(title: string, message: string): Promise<void> {
    return this.modal
      .open({ type: 'alert', title, message, confirmLabel: this.lang.t('modal.ok') })
      .then(() => undefined);
  }

  sessionExpired(): Promise<void> {
    return this.modal.open({
      type:         'session-expired',
      title:        this.lang.t('modal.session_expired.title'),
      message:      this.lang.t('modal.session_expired.message'),
      confirmLabel: this.lang.t('modal.session_expired.confirm_label'),
    }).then(() => undefined);
  }

  permissionDenied(): Promise<void> {
    return this.modal.open({
      type:         'permission-denied',
      title:        this.lang.t('modal.permission_denied.title'),
      message:      this.lang.t('modal.permission_denied.message'),
      confirmLabel: this.lang.t('modal.ok'),
    }).then(() => undefined);
  }

  get activeModal() { return this.modal.activeModal; }
  get isOpen()      { return this.modal.isOpen; }
  close() { this.modal.close(true); }
}
