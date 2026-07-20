import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-scale-of-justice',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="soj-wrap" [class]="sizeClass" [class.soj-wrap--muted]="muted">
      <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg"
           class="soj-svg" role="img" [attr.aria-label]="lang.t('common.scale_of_justice')">
        <rect x="97" y="150" width="6" height="58" rx="3" class="soj-pillar"/>
        <rect x="72" y="203" width="56" height="7" rx="3.5" class="soj-base"/>
        <rect x="62" y="208" width="76" height="5" rx="2.5" class="soj-base-foot"/>
        <circle cx="100" cy="36" r="5" class="soj-gem"/>
        <circle cx="100" cy="36" r="3" class="soj-gem-inner"/>
        <g class="soj-beam-group" style="transform-origin:100px 62px;transform-box:fill-box;">
          <line x1="100" y1="41" x2="100" y2="150" stroke-width="2.5" stroke-linecap="round" class="soj-rod"/>
          <line x1="18" y1="62" x2="182" y2="62" stroke-width="3" stroke-linecap="round" class="soj-beam"/>
          <circle cx="100" cy="62" r="5.5" class="soj-pivot"/>
          <circle cx="100" cy="62" r="2.5" class="soj-pivot-inner"/>
          <line x1="26" y1="62" x2="18" y2="96" class="soj-chain" stroke-width="1.5" stroke-dasharray="3 3"/>
          <line x1="26" y1="62" x2="34" y2="96" class="soj-chain" stroke-width="1.5" stroke-dasharray="3 3"/>
          <path d="M10 99 Q26 110 42 99" class="soj-pan-arc" stroke-width="2.2" stroke-linecap="round" fill="none"/>
          <ellipse cx="26" cy="98" rx="16" ry="4" class="soj-pan-dish"/>
          <line x1="174" y1="62" x2="166" y2="96" class="soj-chain" stroke-width="1.5" stroke-dasharray="3 3"/>
          <line x1="174" y1="62" x2="182" y2="96" class="soj-chain" stroke-width="1.5" stroke-dasharray="3 3"/>
          <path d="M158 99 Q174 110 190 99" class="soj-pan-arc" stroke-width="2.2" stroke-linecap="round" fill="none"/>
          <ellipse cx="174" cy="98" rx="16" ry="4" class="soj-pan-dish"/>
        </g>
      </svg>
    </div>
  `,
  styles: [`
    :host { display: inline-block; }

    .soj-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      --c: var(--color-aegis-primary, #4e4eeb);
      --g: var(--color-gold, #f59e0b);
      --m: var(--color-text-muted, #94a3b8);
    }

    .soj-wrap-xs  { width: 40px;  height: 44px;  }
    .soj-wrap-sm  { width: 60px;  height: 66px;  }
    .soj-wrap-md  { width: 90px;  height: 99px;  }
    .soj-wrap-lg  { width: 130px; height: 143px; }
    .soj-wrap-xl  { width: 180px; height: 198px; }

    .soj-wrap--muted {
      --c: var(--m);
      --g: var(--m);
    }

    .soj-svg          { width: 100%; height: 100%; overflow: visible; }
    .soj-pillar       { fill: var(--c); opacity: 0.4; }
    .soj-base         { fill: var(--c); opacity: 0.3; }
    .soj-base-foot    { fill: var(--c); opacity: 0.18; }
    .soj-gem          { fill: var(--g); filter: drop-shadow(0 0 4px var(--g)); }
    .soj-gem-inner    { fill: white; opacity: 0.5; }
    .soj-rod          { stroke: var(--c); opacity: 0.55; }
    .soj-beam         { stroke: var(--c); opacity: 0.9; }
    .soj-pivot        { fill: var(--g); }
    .soj-pivot-inner  { fill: white; opacity: 0.55; }
    .soj-chain        { stroke: var(--c); opacity: 0.5; stroke-linecap: round; }
    .soj-pan-arc      { stroke: var(--c); opacity: 0.9; }
    .soj-pan-dish     { fill: var(--c); opacity: 0.12; stroke: var(--c); stroke-width: 1.5; }

    .soj-beam-group {
      animation: sojTilt 5s ease-in-out infinite;
    }

    @keyframes sojTilt {
      0%   { transform: rotate(0deg); }
      20%  { transform: rotate(-9deg); }
      42%  { transform: rotate(0deg); }
      58%  { transform: rotate(8deg); }
      76%  { transform: rotate(0deg); }
      88%  { transform: rotate(-4deg); }
      96%  { transform: rotate(0deg); }
      100% { transform: rotate(0deg); }
    }

    @media (prefers-reduced-motion: reduce) {
      .soj-beam-group { animation: none; }
    }
  `]
})
export class ScaleOfJusticeComponent {
  readonly lang = inject(LanguageService);

  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() muted = false;

  get sizeClass(): string {
    return 'soj-wrap-' + this.size;
  }
}
