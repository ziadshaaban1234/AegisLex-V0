import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'aegislex_theme';

  private themeSignal = signal<Theme>(this.loadStoredTheme());
  readonly currentTheme = this.themeSignal.asReadonly();

  private isDarkSignal = signal<boolean>(false);
  readonly isDark = this.isDarkSignal.asReadonly();

  constructor() {
    // Apply theme immediately (outside effect) on first load
    this.applyThemeToDom(this.themeSignal());

    // Use allowSignalWrites so isDarkSignal can be set inside the effect
    effect(() => {
      const theme = this.themeSignal();
      this.applyThemeToDom(theme);
    }, { allowSignalWrites: true });

    // Re-apply when OS preference changes while "system" is selected
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (this.themeSignal() === 'system') {
          this.applyThemeToDom('system');
        }
      });
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  toggleTheme(): void {
    const next: Theme = this.isDarkSignal() ? 'light' : 'dark';
    this.setTheme(next);
  }

  private applyThemeToDom(theme: Theme): void {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }

    // Update isDark signal — allowed because allowSignalWrites: true
    this.isDarkSignal.set(isDark);
  }

  private loadStoredTheme(): Theme {
    try {
      const stored = localStorage.getItem(this.THEME_KEY) as Theme | null;
      return stored ?? 'dark';
    } catch {
      return 'dark';
    }
  }
}
