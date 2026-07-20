import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockService } from '@core/mock/mock.service';
import { Store } from '@ngrx/store';
import { NotificationsActions } from '@store/notifications/notifications.reducer';
import { Notification } from '@core/models';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent implements OnInit {
  private readonly mockService = inject(MockService);
  private readonly store = inject(Store);
  readonly langService = inject(LanguageService);
  notifications = signal<Notification[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.mockService.getNotifications().subscribe({
      next: (res: any) => { this.notifications.set(res.data.items); this.loading.set(false); },
    });
  }

  markRead(id: string): void {
    this.store.dispatch(NotificationsActions.markAsRead({ id }));
    this.notifications.update(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n));
  }

  markAllRead(): void {
    this.store.dispatch(NotificationsActions.markAllAsRead());
    this.notifications.update(ns => ns.map(n => ({ ...n, isRead: true })));
  }

  getIcon(type: string): string {
    const m: Record<string,string> = { analysis_complete:'analytics', report_ready:'description', info:'info', success:'check_circle', warning:'warning', error:'error', mention:'alternate_email' };
    return m[type] || 'notifications';
  }

  getColor(type: string): string {
    const m: Record<string,string> = { analysis_complete:'#4e4eeb', report_ready:'#8b5cf6', success:'#22c55e', warning:'#f59e0b', error:'#ef4444', mention:'#0ea5e9' };
    return m[type] || '#64748b';
  }

  formatTime(d: string): string {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return this.langService.t('notifications.just_now');
    if (m < 60) return this.langService.t('notifications.minutes_ago', [m]);
    const h = Math.floor(m / 60);
    if (h < 24) return this.langService.t('notifications.hours_ago', [h]);
    return new Date(d).toLocaleDateString(this.langService.currentLang() === 'ar' ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric' });
  }

  get unreadCount(): number { return this.notifications().filter(n => !n.isRead).length; }

  trackById(_index: number, notification: Notification): string { return notification.id; }
}
