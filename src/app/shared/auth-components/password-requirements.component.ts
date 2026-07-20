import { Component, Input, OnChanges, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PASSWORD_UPPERCASE_REGEX, PASSWORD_LOWERCASE_REGEX,
  PASSWORD_NUMBER_REGEX, PASSWORD_SPECIAL_REGEX
} from './auth-validators';
import { LanguageService } from '@core/services/language.service';

type ReqState = 'pending' | 'valid' | 'invalid';

interface Req { key: string; labelKey: string; state: ReqState; }

@Component({
  selector: 'app-password-requirements',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pw-reqs" *ngIf="visible" role="status" aria-live="polite" [attr.aria-label]="langService.t('pw_reqs.aria_label')">
      <p class="pw-reqs__title">{{ langService.t('pw_reqs.title') }}</p>
      <div class="pw-reqs__grid">
        <div *ngFor="let req of requirements"
             class="pw-req"
             [class.pw-req--valid]="req.state === 'valid'"
             [class.pw-req--invalid]="req.state === 'invalid'"
             [class.pw-req--pending]="req.state === 'pending'">
          <span class="material-icons pw-req__icon">
            {{ req.state === 'valid' ? 'check_circle' : req.state === 'invalid' ? 'cancel' : 'radio_button_unchecked' }}
          </span>
          <span class="pw-req__label">{{ langService.t(req.labelKey) }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .pw-reqs {
      margin-top: 14px;
    }

    .pw-reqs__title {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: #8899bb;
      margin: 0 0 9px 0;
    }

    .pw-reqs__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      row-gap: 7px;
      column-gap: 12px;
    }

    @media (max-width: 380px) {
      .pw-reqs__grid { grid-template-columns: 1fr; }
    }

    .pw-req {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      line-height: 1.3;
      transition: color 0.2s ease;
    }

    .pw-req__icon {
      font-size: 14px;
      flex-shrink: 0;
      transition: color 0.2s ease;
    }

    .pw-req__label {
      transition: color 0.2s ease;
    }

    /* Pending — readable in dark mode; light-mode override in .auth-light */
    .pw-req--pending             { color: #8899bb; }
    .pw-req--pending .pw-req__icon { color: #6e7f9e; }

    /* Valid */
    .pw-req--valid               { color: #34d399; }
    .pw-req--valid .pw-req__icon   { color: #34d399; }

    /* Invalid */
    .pw-req--invalid               { color: #f87171; }
    .pw-req--invalid .pw-req__icon  { color: #f87171; }
  `]
})
export class PasswordRequirementsComponent implements OnChanges {
  readonly langService = inject(LanguageService);
  @Input() value   = '';
  @Input() touched = false;
  @Input() visible = false;

  requirements: Req[] = [];

  ngOnChanges(): void {
    const v = (this.value || '').trim();
    const hasInput = v.length > 0;
    const state = (met: boolean): ReqState =>
      !hasInput ? 'pending' : met ? 'valid' : 'invalid';

    this.requirements = [
      { key: 'len',     labelKey: 'pw_reqs.length',  state: state(v.length >= 8) },
      { key: 'upper',   labelKey: 'pw_reqs.upper',   state: state(PASSWORD_UPPERCASE_REGEX.test(v)) },
      { key: 'lower',   labelKey: 'pw_reqs.lower',   state: state(PASSWORD_LOWERCASE_REGEX.test(v)) },
      { key: 'number',  labelKey: 'pw_reqs.number',  state: state(PASSWORD_NUMBER_REGEX.test(v)) },
      { key: 'special', labelKey: 'pw_reqs.special', state: state(PASSWORD_SPECIAL_REGEX.test(v)) },
    ];
  }
}
