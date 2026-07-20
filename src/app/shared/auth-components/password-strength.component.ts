import { Component, Input, OnChanges, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { calcPasswordStrength, PasswordStrength } from './auth-validators';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pw-strength" *ngIf="value">

      <!-- Single segmented strength bar — 5 segments, one per criterion -->
      <div class="pw-strength__bar">
        <div *ngFor="let seg of segments; let i = index"
             class="pw-strength__segment"
             [class.pw-strength__segment--filled]="i < strength.score"
             [ngClass]="i < strength.score ? strength.colorClass : ''">
        </div>
      </div>

      <!-- Label row -->
      <div class="pw-strength__meta" *ngIf="strength.label">
        <span class="pw-strength__label" [ngClass]="strength.colorClass + '--text'">{{ langService.t(strength.labelKey) }}</span>
        <span class="pw-strength__hint" *ngIf="strength.score > 0 && strength.score < 4">{{ langService.t('pw_strength.keep_going') }}</span>
        <span class="pw-strength__hint pw-strength__hint--great" *ngIf="strength.score >= 4">{{ langService.t('pw_strength.great') }}</span>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }

    .pw-strength {
      margin-top: 10px;
      margin-bottom: 4px;
    }

    /* ── Segmented bar ── */
    .pw-strength__bar {
      display: flex;
      gap: 4px;
      height: 6px;
    }

    .pw-strength__segment {
      flex: 1;
      height: 6px;
      border-radius: 3px;
      background: rgba(255,255,255,0.10);
      transition: background-color 0.35s ease;
    }

    /* Filled segments get the color directly on the segment itself */
    .pw-strength__segment.ps-very-weak  { background: #ef4444; }
    .pw-strength__segment.ps-weak       { background: #f97316; }
    .pw-strength__segment.ps-medium     { background: #eab308; }
    .pw-strength__segment.ps-strong     { background: #22c55e; }
    .pw-strength__segment.ps-very-strong{ background: #10b981; }

    /* ── Label row ── */
    .pw-strength__meta {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 7px;
      font-size: 12px;
      line-height: 1;
    }

    .pw-strength__label {
      font-weight: 700;
      transition: color 0.3s ease;
    }

    /* Text colour classes for the label */
    .ps-very-weak--text   { color: #ef4444; }
    .ps-weak--text        { color: #f97316; }
    .ps-medium--text      { color: #eab308; }
    .ps-strong--text      { color: #22c55e; }
    .ps-very-strong--text { color: #10b981; }
    .ps-none--text        { color: transparent; }

    .pw-strength__hint {
      color: #8899bb;
      font-weight: 400;
    }
    .pw-strength__hint--great {
      color: #8899bb;
    }
  `]
})
export class PasswordStrengthComponent implements OnChanges {
  readonly langService = inject(LanguageService);
  @Input() value = '';
  strength: PasswordStrength = { score: 0, label: '', labelKey: '', percent: 0, colorClass: 'ps-none' };
  segments = [0, 1, 2, 3, 4];

  ngOnChanges(): void {
    this.strength = calcPasswordStrength(this.value);
  }
}
