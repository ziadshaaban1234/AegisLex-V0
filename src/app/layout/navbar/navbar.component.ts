import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '@core/services/theme.service';
import { LanguageService } from '@core/services/language.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationsService } from '@core/services/notifications.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  @Input() sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly themeService = inject(ThemeService);
  readonly langService = inject(LanguageService);
  private readonly authService = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly router = inject(Router);

  readonly isDark = this.themeService.isDark;
  readonly currentUser = this.authService.currentUser;
  readonly unreadCount = this.notificationsService.unreadCount;

  searchQuery = signal('');
  showSearch = signal(false);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
    if (query.trim().length > 2) {
      this.router.navigate(['/app/search'], { queryParams: { q: query } });
    }
  }

  openSearch(): void {
    this.showSearch.set(true);
  }

  closeSearch(): void {
    this.showSearch.set(false);
    this.searchQuery.set('');
  }

  toggleLanguage(): void {
    const next = this.langService.currentLang() === 'en' ? 'ar' : 'en';
    this.langService.setLanguage(next);
  }

  get userInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
}
