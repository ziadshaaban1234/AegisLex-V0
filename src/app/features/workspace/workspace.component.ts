import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent {
  private readonly authService = inject(AuthService);
  readonly lang = inject(LanguageService);
  readonly currentUser = this.authService.currentUser;

  get quickLinks() {
    return [
      { label: this.lang.t('workspace.link.upload'),   icon: 'upload_file',  route: '/app/upload',   color: '#4e4eeb', desc: this.lang.t('workspace.link.upload_desc') },
      { label: this.lang.t('workspace.link.chat'),     icon: 'smart_toy',    route: '/app/chat',     color: '#8b5cf6', desc: this.lang.t('workspace.link.chat_desc') },
      { label: this.lang.t('workspace.link.new_case'), icon: 'add_circle',   route: '/app/cases/new',color: '#10b981', desc: this.lang.t('workspace.link.new_case_desc') },
      { label: this.lang.t('workspace.link.search'),   icon: 'search',       route: '/app/search',   color: '#f59e0b', desc: this.lang.t('workspace.link.search_desc') },
      { label: this.lang.t('workspace.link.reports'),  icon: 'description',  route: '/app/reports',  color: '#ef4444', desc: this.lang.t('workspace.link.reports_desc') },
      { label: this.lang.t('workspace.link.timeline'), icon: 'timeline',     route: '/app/timeline', color: '#0ea5e9', desc: this.lang.t('workspace.link.timeline_desc') },
    ];
  }

  get recentTools() {
    return [
      { name: this.lang.t('workspace.tool.contract_analyzer'), icon: 'analytics',     uses: 24, lastUsed: this.lang.t('workspace.tool.2h_ago') },
      { name: this.lang.t('workspace.tool.risk_detector'),      icon: 'warning',       uses: 18, lastUsed: this.lang.t('workspace.tool.yesterday') },
      { name: this.lang.t('workspace.tool.legal_search'),       icon: 'manage_search', uses: 47, lastUsed: this.lang.t('workspace.tool.30min_ago') },
      { name: this.lang.t('workspace.tool.report_generator'),   icon: 'description',   uses: 11, lastUsed: this.lang.t('workspace.tool.3d_ago') },
    ];
  }

  get activityItems() {
    return [
      { label: this.lang.t('workspace.activity.analyses'),  icon: 'analytics',     color: '#4e4eeb', count: 24, pct: 80  },
      { label: this.lang.t('workspace.activity.searches'),  icon: 'manage_search', color: '#f59e0b', count: 47, pct: 100 },
      { label: this.lang.t('workspace.activity.reports'),   icon: 'description',   color: '#10b981', count: 11, pct: 36  },
      { label: this.lang.t('workspace.activity.timelines'), icon: 'timeline',      color: '#8b5cf6', count: 8,  pct: 26  },
      { label: this.lang.t('workspace.activity.graph'),     icon: 'hub',           color: '#ef4444', count: 15, pct: 50  },
    ];
  }

  get saulFeatures() {
    return [
      { name: this.lang.t('workspace.feat.ocr'),      icon: 'document_scanner', color: '#4e4eeb', desc: this.lang.t('workspace.feat.ocr_desc') },
      { name: this.lang.t('workspace.feat.contract'), icon: 'analytics',        color: '#10b981', desc: this.lang.t('workspace.feat.contract_desc') },
      { name: this.lang.t('workspace.feat.search'),   icon: 'manage_search',    color: '#f59e0b', desc: this.lang.t('workspace.feat.search_desc') },
      { name: this.lang.t('workspace.feat.timeline'), icon: 'timeline',         color: '#8b5cf6', desc: this.lang.t('workspace.feat.timeline_desc') },
      { name: this.lang.t('workspace.feat.graph'),    icon: 'hub',              color: '#ef4444', desc: this.lang.t('workspace.feat.graph_desc') },
      { name: this.lang.t('workspace.feat.report'),   icon: 'description',      color: '#0ea5e9', desc: this.lang.t('workspace.feat.report_desc') },
    ];
  }
}
