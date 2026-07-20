import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthFacade } from '@core/services/auth-facade.service';
import { LanguageService } from '@core/services/language.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  tk: string;
  badge?: number;
  dividerAfter?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<void>();

  private readonly authFacade = inject(AuthFacade);
  readonly langService = inject(LanguageService);
  readonly currentUser = this.authFacade.currentUser;

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',        icon: 'dashboard',       route: '/app/dashboard',       tk: 'nav.dashboard' },
    { label: 'Saul AI Chat',     icon: 'smart_toy',       route: '/app/chat',            tk: 'nav.chat' },
    { label: 'Workspace',        icon: 'workspaces',      route: '/app/workspace',       tk: 'nav.workspace', dividerAfter: true },
    { label: 'Cases',            icon: 'folder_open',     route: '/app/cases',           tk: 'nav.cases' },
    { label: 'Upload Documents', icon: 'upload_file',     route: '/app/upload',          tk: 'nav.upload' },
    { label: 'Analysis',         icon: 'analytics',       route: '/app/analysis',        tk: 'nav.analysis', dividerAfter: true },
    { label: 'Reports',          icon: 'description',     route: '/app/reports',         tk: 'nav.reports' },
    { label: 'Timeline',         icon: 'timeline',        route: '/app/timeline',        tk: 'nav.timeline' },
    { label: 'Legal Graph',      icon: 'hub',             route: '/app/graph',           tk: 'nav.graph', dividerAfter: true },
    { label: 'Search',           icon: 'search',          route: '/app/search',          tk: 'nav.search' },
    { label: 'Similar Cases',    icon: 'content_copy',    route: '/app/similar-cases',   tk: 'nav.similar_cases' },
    { label: 'Recommendations',  icon: 'lightbulb',       route: '/app/recommendations', tk: 'nav.recommendations' },
    { label: 'Insights',         icon: 'bar_chart',       route: '/app/insights',        tk: 'nav.insights', dividerAfter: true },
    { label: 'Notifications',    icon: 'notifications',   route: '/app/notifications',   tk: 'nav.notifications' },
    { label: 'Settings',         icon: 'settings',        route: '/app/settings',        tk: 'nav.settings' },
  ];

  onToggle(): void {
    this.toggleCollapse.emit();
  }

  onNavigate(): void {
    this.navigate.emit();
  }

  logout(): void {
    this.authFacade.logout();
  }

  get userInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
}
