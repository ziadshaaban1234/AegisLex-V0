import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Notification, ApiResponse, PagedResult } from '@core/models';
import { MockService } from '@core/mock/mock.service';

// ─────────────────────────────────────────────────────────────────────────────
// FUTURE BACKEND IMPLEMENTATION (comment only — no runtime change)
//
//   getNotifications():  GET  /api/v1/notifications?page=1&pageSize=50
//   markAsRead(id):      PATCH /api/v1/notifications/:id/read
//   markAllRead():       POST  /api/v1/notifications/mark-all-read
//   deleteNotification(id): DELETE /api/v1/notifications/:id
//   getUnreadCount():    GET  /api/v1/notifications/unread-count
//
//   Real-time delivery via SignalR hub:
//     hubConnection.on('notification', (n: Notification) => {
//       this.notificationsSignal.update(ns => [n, ...ns]);
//       this.unreadCountSignal.update(c => c + 1);
//     });
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly mock = inject(MockService);
  private unreadCountSignal = signal<number>(3);
  readonly unreadCount = this.unreadCountSignal.asReadonly();

  getNotifications(_page = 1, _pageSize = 20, _unreadOnly = false): Observable<ApiResponse<PagedResult<Notification>>> { return this.mock.getNotifications() as any; }
  markAsRead(id: string): Observable<ApiResponse<void>> { this.unreadCountSignal.update(n => Math.max(0, n - 1)); return this.mock.markAsRead(id) as any; }
  markAllAsRead(): Observable<ApiResponse<void>> { this.unreadCountSignal.set(0); return this.mock.markAllAsRead() as any; }
  deleteNotification(id: string): Observable<ApiResponse<void>> { return this.mock.deleteNotification(id) as any; }
  getUnreadCount(): Observable<ApiResponse<{ count: number }>> { return this.mock.getUnreadCount() as any; }
  setUnreadCount(count: number): void { this.unreadCountSignal.set(count); }
}
