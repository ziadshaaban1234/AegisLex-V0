import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-loading-btn',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type"
      class="auth-loading-btn"
      [class.loading]="loading"
      [class.secondary]="variant === 'secondary'"
      [class.danger]="variant === 'danger'"
      [disabled]="loading || disabled"
      [attr.aria-busy]="loading"
      [attr.aria-label]="loading ? loadingLabel : label"
      (click)="!loading && !disabled && clicked.emit()">
      <div *ngIf="loading" class="btn-spinner" aria-hidden="true"></div>
      <span *ngIf="!loading && icon" class="material-icons" aria-hidden="true">{{ icon }}</span>
      <span class="btn-label">{{ loading ? loadingLabel : label }}</span>
    </button>
  `,
  styles: [`
    .auth-loading-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 13px 20px;
      background: linear-gradient(135deg, #4e4eeb, #6271f6);
      color: white; border: none; border-radius: 11px;
      font-size: 15px; font-weight: 600; cursor: pointer; letter-spacing: 0.01em;
      transition: transform 0.2s, box-shadow 0.2s, background 0.2s, opacity 0.2s;
      font-family: var(--font-sans);
      box-shadow: 0 4px 18px rgba(78,78,235,0.38);
      position: relative; overflow: hidden;
      .material-icons { font-size: 18px; }
      .btn-label { position: relative; z-index: 1; }
    }
    .auth-loading-btn::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
      opacity: 0; transition: opacity 0.2s;
    }
    .auth-loading-btn:hover:not(:disabled)::before { opacity: 1; }
    .auth-loading-btn:hover:not(:disabled) {
      transform: translateY(-1px); box-shadow: 0 8px 28px rgba(78,78,235,0.48);
    }
    .auth-loading-btn:active:not(:disabled) { transform: scale(0.98); box-shadow: 0 2px 8px rgba(78,78,235,0.3); }
    .auth-loading-btn:disabled,
    .auth-loading-btn.loading { opacity: 0.65; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
    .auth-loading-btn:focus-visible {
      outline: 2.5px solid #8093fb; outline-offset: 2px;
    }

    .auth-loading-btn.secondary {
      background: transparent; border: 1.5px solid rgba(255,255,255,0.12);
      color: rgba(200,215,255,0.7); box-shadow: none;
      .material-icons { color: #6271f6; }
      &:hover:not(:disabled) {
        background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.22);
        color: #f0f4ff; box-shadow: none; transform: none;
      }
    }
    .auth-loading-btn.danger {
      background: linear-gradient(135deg, #dc2626, #ef4444);
      box-shadow: 0 4px 18px rgba(220,38,38,0.35);
      &:hover:not(:disabled) { box-shadow: 0 8px 28px rgba(220,38,38,0.45); }
    }

    .btn-spinner {
      width: 18px; height: 18px; flex-shrink: 0;
      border: 2.5px solid rgba(255,255,255,0.28); border-top-color: white;
      border-radius: 50%; animation: btnSpin 0.72s linear infinite;
    }
    @keyframes btnSpin { to { transform: rotate(360deg); } }
  `]
})
export class AuthLoadingButtonComponent {
  @Input() label        = 'Submit';
  @Input() loadingLabel = 'Loading...';
  @Input() icon         = '';
  @Input() loading      = false;
  @Input() disabled     = false;
  @Input() type: 'submit' | 'button' = 'submit';
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Output() clicked = new EventEmitter<void>();
}
