import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '@core/services/theme.service';
import { LanguageService, Language } from '@core/services/language.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { MockService } from '@core/mock/mock.service';

interface SettingOption { labelKey: string; descKey: string; key: string; }

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  readonly toastService = inject(ToastService);
  readonly langService = inject(LanguageService);
  private readonly mockService = inject(MockService);

  readonly isDark = this.themeService.isDark;
  readonly currentUser = this.authService.currentUser;
  activeSection = signal<string>('appearance');
  saving = signal(false);

  sections = [
    { id: 'appearance', labelKey: 'settings.nav.appearance', icon: 'palette' },
    { id: 'notifications', labelKey: 'settings.nav.notifications', icon: 'notifications' },
    { id: 'ai', labelKey: 'settings.nav.ai', icon: 'smart_toy' },
    { id: 'security', labelKey: 'settings.nav.security', icon: 'security' },
    { id: 'api', labelKey: 'settings.nav.api', icon: 'api' },
  ];

  prefs: Record<string, boolean | string> = {
    theme: this.themeService.currentTheme(),
    language: this.langService.currentLang(),
    emailNotifications: true,
    pushNotifications: true,
    analysisComplete: true,
    reportReady: true,
    aiModel: 'gpt-4o',
    autoAnalyze: true,
    streamingResponses: true,
    includeExplanations: true,
  };

  notifOptions: SettingOption[] = [
    { labelKey: 'settings.notif.email_label', descKey: 'settings.notif.email_desc', key: 'emailNotifications' },
    { labelKey: 'settings.notif.push_label', descKey: 'settings.notif.push_desc', key: 'pushNotifications' },
    { labelKey: 'settings.notif.analysis_label', descKey: 'settings.notif.analysis_desc', key: 'analysisComplete' },
    { labelKey: 'settings.notif.report_label', descKey: 'settings.notif.report_desc', key: 'reportReady' },
  ];

  aiOptions: SettingOption[] = [
    { labelKey: 'settings.ai.auto_analyze_label', descKey: 'settings.ai.auto_analyze_desc', key: 'autoAnalyze' },
    { labelKey: 'settings.ai.streaming_label', descKey: 'settings.ai.streaming_desc', key: 'streamingResponses' },
    { labelKey: 'settings.ai.explanations_label', descKey: 'settings.ai.explanations_desc', key: 'includeExplanations' },
  ];

  getBoolPref(key: string): boolean { return Boolean(this.prefs[key]); }
  setBoolPref(key: string, value: boolean): void { this.prefs[key] = value; }
  getStringPref(key: string): string { return String(this.prefs[key] ?? ''); }
  setStringPref(key: string, value: string): void {
    this.prefs[key] = value;
    if (key === 'language') {
      this.langService.setLanguage(value as Language);
    }
  }
  get currentTheme(): string { return this.themeService.currentTheme(); }

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.prefs['theme'] = theme;
    this.themeService.setTheme(theme);
  }

  saveSettings(): void {
    this.saving.set(true);
    this.mockService.updatePreferences(this.prefs).subscribe({
      next: () => { this.saving.set(false); this.toastService.success(this.langService.t('settings.toast.saved')); },
    });
  }
}
