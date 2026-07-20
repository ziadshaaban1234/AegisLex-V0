import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScaleOfJusticeComponent } from '@shared/components/scale-of-justice/scale-of-justice.component';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, ScaleOfJusticeComponent],
  template: `
    <div class="not-found">
      <div class="not-found__content">
        <app-scale-of-justice size="lg" [muted]="true"></app-scale-of-justice>
        <h1 class="not-found__code">404</h1>
        <h2 class="not-found__title">{{ lang.t('not_found.title') }}</h2>
        <p class="not-found__desc">
          {{ lang.t('not_found.desc') }}
        </p>
        <a routerLink="/app/dashboard" class="btn-primary">
          <span class="material-icons">home</span>
          {{ lang.t('not_found.return') }}
        </a>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-bg-primary);
      padding: 24px;
    }

    .not-found__content {
      text-align: center;
      max-width: 420px;
    }

    .not-found__code {
      font-size: 80px;
      font-weight: 700;
      font-family: var(--font-display);
      color: var(--color-aegis-primary);
      line-height: 1;
      margin: 16px 0 8px;
    }

    .not-found__title {
      font-size: 24px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 12px;
    }

    .not-found__desc {
      font-size: 15px;
      color: var(--color-text-secondary);
      margin: 0 0 32px;
    }
  `],
})
export class NotFoundComponent {
  readonly lang = inject(LanguageService);
}
