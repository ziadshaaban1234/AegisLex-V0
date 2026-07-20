import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-error',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="message"
         class="auth-err-banner"
         role="alert"
         aria-live="assertive"
         [class.locked]="type === 'locked'"
         [class.disabled]="type === 'disabled'"
         [class.warning]="type === 'warning'"
         [class.success]="type === 'success'">
      <span class="material-icons auth-err-icon" aria-hidden="true">{{ icon }}</span>
      <div class="auth-err-content">
        <strong *ngIf="title" class="auth-err-title">{{ title }}</strong>
        <span class="auth-err-msg">{{ message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .auth-err-banner {
      display: flex; align-items: flex-start; gap: 11px;
      padding: 13px 16px;
      background: rgba(239,68,68,0.10);
      border: 1px solid rgba(239,68,68,0.28);
      border-radius: 11px; color: #fca5a5; font-size: 13.5px; line-height: 1.5;
      animation: errBannerIn 0.2s cubic-bezier(0.25,0.46,0.45,0.94);
    }
    .auth-err-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
    .auth-err-content { display: flex; flex-direction: column; gap: 1px; }
    .auth-err-title { font-weight: 700; font-size: 13px; display: block; margin-bottom: 2px; }
    .auth-err-msg { line-height: 1.5; }

    /* Variants */
    .auth-err-banner.locked   { background: rgba(234,179,8,0.10); border-color: rgba(234,179,8,0.28); color: #fde68a; }
    .auth-err-banner.disabled { background: rgba(148,163,184,0.10); border-color: rgba(148,163,184,0.28); color: #cbd5e1; }
    .auth-err-banner.warning  { background: rgba(251,191,36,0.08); border-color: rgba(251,191,36,0.22); color: #fde68a; }
    .auth-err-banner.success  { background: rgba(52,211,153,0.08); border-color: rgba(52,211,153,0.22); color: #6ee7b7; }

    @keyframes errBannerIn {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: none; }
    }
  `]
})
export class AuthErrorComponent {
  @Input() message = '';
  @Input() title   = '';
  @Input() type: 'error' | 'locked' | 'disabled' | 'warning' | 'success' = 'error';

  get icon(): string {
    if (this.type === 'locked')   return 'lock';
    if (this.type === 'disabled') return 'block';
    if (this.type === 'warning')  return 'warning_amber';
    if (this.type === 'success')  return 'check_circle';
    return 'error_outline';
  }
}
