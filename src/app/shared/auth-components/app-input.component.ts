import { Component, Input, Output, EventEmitter, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type InputState = 'default' | 'focus' | 'error' | 'success' | 'disabled';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-input-group" [class]="groupClass()">
      <!-- Floating Label -->
      <label *ngIf="label" [for]="inputId" class="app-input-label" [class.floating]="hasValue() || isFocused()">
        {{ label }}<span *ngIf="required" class="req-star"> *</span>
      </label>

      <div class="app-input-wrapper" [class]="wrapperClass()">
        <!-- Leading Icon -->
        <span *ngIf="icon" class="material-icons app-input-icon app-input-icon--lead">{{ icon }}</span>

        <!-- Input Element -->
        <input
          [id]="inputId"
          [type]="inputType"
          [value]="value"
          [placeholder]="isFocused() ? '' : placeholder"
          [disabled]="disabled"
          [attr.autocomplete]="autocomplete"
          [attr.inputmode]="inputmode"
          [attr.maxlength]="maxlength"
          [attr.aria-describedby]="errorId"
          [attr.aria-invalid]="state === 'error'"
          class="app-input-field"
          [class.has-lead]="!!icon"
          [class.has-trail]="!!trailIcon || toggleable"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()" />

        <!-- Trailing: toggle password -->
        <button *ngIf="toggleable" type="button" class="app-input-trail-btn"
                (click)="onToggle()" [title]="showValue ? 'Hide' : 'Show'">
          <span class="material-icons">{{ showValue ? 'visibility_off' : 'visibility' }}</span>
        </button>

        <!-- Trailing: status icon -->
        <span *ngIf="!toggleable && state === 'success'" class="material-icons app-input-icon app-input-icon--trail app-input-icon--success">check_circle</span>
        <span *ngIf="!toggleable && trailIcon && state !== 'success'" class="material-icons app-input-icon app-input-icon--trail">{{ trailIcon }}</span>
      </div>

      <!-- Validation Messages -->
      <div *ngIf="errors.length > 0" [id]="errorId" class="app-input-errors" role="alert">
        <p *ngFor="let msg of errors" class="app-input-error">
          <span class="material-icons">error</span>{{ msg }}
        </p>
      </div>

      <!-- Success Message -->
      <div *ngIf="state === 'success' && successMsg" class="app-input-success-msg">
        <span class="material-icons">check_circle</span>{{ successMsg }}
      </div>

      <!-- Hint -->
      <div *ngIf="hint && errors.length === 0" class="app-input-hint">{{ hint }}</div>
    </div>
  `,
  styles: [`
    .app-input-group { display: flex; flex-direction: column; gap: 0; position: relative; }

    .app-input-label {
      font-size: 12.5px; font-weight: 600;
      color: rgba(200,215,255,0.75);
      letter-spacing: 0.02em; margin-bottom: 7px;
      transition: color 0.2s;
    }
    .app-input-label .req-star { color: #f87171; margin-left: 2px; }
    .app-input-group--error .app-input-label { color: #f87171; }
    .app-input-group--success .app-input-label { color: #34d399; }

    .app-input-wrapper {
      position: relative; display: flex; align-items: center;
      background: rgba(255,255,255,0.055);
      border: 1.5px solid rgba(255,255,255,0.12);
      border-radius: 11px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      &:hover { border-color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.07); }
    }

    .app-input-wrapper--focus {
      border-color: #6271f6 !important;
      background: rgba(98,113,246,0.08) !important;
      box-shadow: 0 0 0 3px rgba(98,113,246,0.18) !important;
    }
    .app-input-wrapper--error {
      border-color: rgba(239,68,68,0.6) !important;
      background: rgba(239,68,68,0.06) !important;
      box-shadow: none !important;
      &.app-input-wrapper--focus {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239,68,68,0.15) !important;
      }
    }
    .app-input-wrapper--success {
      border-color: rgba(52,211,153,0.5) !important;
      background: rgba(52,211,153,0.05) !important;
      &.app-input-wrapper--focus {
        border-color: #34d399 !important;
        box-shadow: 0 0 0 3px rgba(52,211,153,0.15) !important;
      }
    }
    .app-input-wrapper--disabled { opacity: 0.5; pointer-events: none; }

    .app-input-icon {
      font-size: 18px; color: rgba(200,215,255,0.35); flex-shrink: 0; pointer-events: none;
      transition: color 0.2s;
    }
    .app-input-icon--lead { position: absolute; left: 14px; z-index: 1; }
    .app-input-icon--trail { position: absolute; right: 12px; }
    .app-input-icon--success { color: #34d399; }
    .app-input-wrapper--error .app-input-icon--lead { color: #f87171; }
    .app-input-wrapper--focus .app-input-icon--lead { color: #8093fb; }

    .app-input-field {
      width: 100%; padding: 12px 14px;
      background: transparent; border: none; border-radius: 11px;
      color: #f0f4ff; font-size: 14px; outline: none;
      font-family: var(--font-sans);
      &::placeholder { color: rgba(200,215,255,0.28); }
      &.has-lead { padding-left: 44px; }
      &.has-trail { padding-right: 44px; }
    }

    .app-input-trail-btn {
      position: absolute; right: 12px;
      background: none; border: none; cursor: pointer;
      color: rgba(200,215,255,0.35); padding: 4px;
      transition: color 0.15s; flex-shrink: 0;
      &:hover { color: rgba(200,215,255,0.75); }
      .material-icons { font-size: 18px; display: block; }
    }

    .app-input-errors { margin-top: 7px; display: flex; flex-direction: column; gap: 4px; }
    .app-input-error {
      font-size: 12px; color: #f87171; margin: 0;
      display: flex; align-items: center; gap: 5px; line-height: 1.4;
      animation: errFadeIn 0.15s ease;
      .material-icons { font-size: 14px; flex-shrink: 0; }
    }

    .app-input-success-msg {
      margin-top: 6px; font-size: 12px; color: #34d399;
      display: flex; align-items: center; gap: 5px;
      .material-icons { font-size: 14px; }
    }

    .app-input-hint { margin-top: 6px; font-size: 12px; color: rgba(200,215,255,0.4); }

    @keyframes errFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
  `]
})
export class AppInputComponent {
  @Input() label = '';
  @Input() inputId = '';
  @Input() inputType = 'text';
  @Input() value = '';
  @Input() placeholder = '';
  @Input() icon = '';
  @Input() trailIcon = '';
  @Input() toggleable = false;
  @Input() required = false;
  @Input() disabled = false;
  @Input() state: InputState = 'default';
  @Input() errors: string[] = [];
  @Input() successMsg = '';
  @Input() hint = '';
  @Input() autocomplete = '';
  @Input() inputmode = '';
  @Input() maxlength: number | null = null;

  @Output() valueChange = new EventEmitter<string>();
  @Output() blurred = new EventEmitter<void>();
  @Output() focused = new EventEmitter<void>();

  isFocused = signal(false);
  showValue = false;

  hasValue = computed(() => !!this.value);

  get inputType2(): string {
    if (this.toggleable) return this.showValue ? 'text' : 'password';
    return this.inputType;
  }

  get groupClass(): () => string {
    return () => {
      const cls = ['app-input-group'];
      if (this.state === 'error') cls.push('app-input-group--error');
      if (this.state === 'success') cls.push('app-input-group--success');
      return cls.join(' ');
    };
  }

  get wrapperClass(): () => string {
    return () => {
      const cls = ['app-input-wrapper'];
      if (this.isFocused()) cls.push('app-input-wrapper--focus');
      if (this.state === 'error') cls.push('app-input-wrapper--error');
      if (this.state === 'success') cls.push('app-input-wrapper--success');
      if (this.disabled) cls.push('app-input-wrapper--disabled');
      return cls.join(' ');
    };
  }

  get errorId(): string { return this.inputId ? `${this.inputId}-errors` : ''; }

  onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }

  onFocus(): void { this.isFocused.set(true); this.focused.emit(); }
  onBlur(): void  { this.isFocused.set(false); this.blurred.emit(); }

  onToggle(): void { this.showValue = !this.showValue; }
}
