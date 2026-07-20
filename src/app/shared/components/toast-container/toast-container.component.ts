import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ToastService, Toast } from '@core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('toastAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' })),
      ]),
    ]),
  ],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toastService.toasts(); trackBy: trackById"
        class="toast toast--{{ toast.type }}"
        [@toastAnim]
        (click)="toastService.remove(toast.id)"
      >
        <span class="material-icons toast__icon">{{ getIcon(toast.type) }}</span>
        <div class="toast__body">
          <p class="toast__title">{{ toast.title }}</p>
          <p *ngIf="toast.message" class="toast__message">{{ toast.message }}</p>
        </div>
        <button class="toast__close" (click)="toastService.remove(toast.id)">
          <span class="material-icons">close</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      inset-inline-end: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 9999;
      max-width: 380px;
      width: calc(100vw - 48px);
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 12px;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-primary);
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      cursor: pointer;
      transition: transform 0.15s ease;

      &:hover { transform: translateX(-4px); }

      :host-context([dir="rtl"]) &:hover { transform: translateX(4px); }

      &:is(.toast--success) { border-inline-start: 3px solid #22c55e; .toast__icon { color: #22c55e; } }
      &:is(.toast--error)   { border-inline-start: 3px solid #ef4444; .toast__icon { color: #ef4444; } }
      &:is(.toast--warning) { border-inline-start: 3px solid #eab308; .toast__icon { color: #eab308; } }
      &:is(.toast--info)    { border-inline-start: 3px solid #3b82f6; .toast__icon { color: #3b82f6; } }
    }

    .toast__icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }

    .toast__body { flex: 1; min-width: 0; }

    .toast__title {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-primary);
      line-height: 1.3;
      margin: 0;
    }

    .toast__message {
      font-size: 13px;
      color: var(--color-text-tertiary);
      margin: 3px 0 0;
      line-height: 1.4;
    }

    .toast__close {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-muted);
      padding: 0;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      transition: color 0.15s;

      &:hover { color: var(--color-text-primary); }

      .material-icons { font-size: 16px; }
    }
  `],
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  trackById(_: number, toast: Toast): string {
    return toast.id;
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return icons[type] || 'info';
  }
}
