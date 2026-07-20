import { createActionGroup, props, emptyProps } from '@ngrx/store';
import { createReducer, on } from '@ngrx/store';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Notification } from '@core/models';
import { NotificationsService } from '@core/services/notifications.service';

export const NotificationsActions = createActionGroup({
  source: 'Notifications',
  events: {
    'Load Notifications': emptyProps(),
    'Load Notifications Success': props<{ notifications: Notification[]; total: number }>(),
    'Load Notifications Failure': props<{ error: string }>(),
    'Add Notification': props<{ notification: Notification }>(),
    'Mark As Read': props<{ id: string }>(),
    'Mark As Read Success': props<{ id: string }>(),
    'Mark All As Read': emptyProps(),
    'Mark All As Read Success': emptyProps(),
    'Set Unread Count': props<{ count: number }>(),
  },
});

export interface NotificationsState {
  notifications: Notification[]; unreadCount: number; total: number; loading: boolean; error: string | null;
}

const initialState: NotificationsState = { notifications: [], unreadCount: 0, total: 0, loading: false, error: null };

export const notificationsReducer = createReducer(
  initialState,
  on(NotificationsActions.loadNotifications, state => ({ ...state, loading: true })),
  on(NotificationsActions.loadNotificationsSuccess, (state, { notifications, total }) => ({ ...state, notifications, total, loading: false, unreadCount: notifications.filter(n => !n.isRead).length })),
  on(NotificationsActions.loadNotificationsFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(NotificationsActions.addNotification, (state, { notification }) => ({ ...state, notifications: [notification, ...state.notifications], unreadCount: state.unreadCount + 1, total: state.total + 1 })),
  on(NotificationsActions.markAsReadSuccess, (state, { id }) => ({ ...state, notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n), unreadCount: Math.max(0, state.unreadCount - 1) })),
  on(NotificationsActions.markAllAsReadSuccess, state => ({ ...state, notifications: state.notifications.map(n => ({ ...n, isRead: true })), unreadCount: 0 })),
  on(NotificationsActions.setUnreadCount, (state, { count }) => ({ ...state, unreadCount: count })),
);

@Injectable()
export class NotificationsEffects {
  private readonly actions$ = inject(Actions);
  private readonly notifService = inject(NotificationsService);

  load$ = createEffect(() => this.actions$.pipe(
    ofType(NotificationsActions.loadNotifications),
    switchMap(() => this.notifService.getNotifications(1, 20).pipe(
      map(res => NotificationsActions.loadNotificationsSuccess({ notifications: res.data.items, total: res.data.total })),
      catchError(() => of(NotificationsActions.loadNotificationsFailure({ error: 'Failed' })))
    ))
  ));

  markRead$ = createEffect(() => this.actions$.pipe(
    ofType(NotificationsActions.markAsRead),
    switchMap(({ id }) => this.notifService.markAsRead(id).pipe(
      map(() => NotificationsActions.markAsReadSuccess({ id })),
      catchError(() => of(NotificationsActions.loadNotificationsFailure({ error: 'Failed' })))
    ))
  ));

  markAll$ = createEffect(() => this.actions$.pipe(
    ofType(NotificationsActions.markAllAsRead),
    switchMap(() => this.notifService.markAllAsRead().pipe(
      map(() => NotificationsActions.markAllAsReadSuccess()),
      catchError(() => of(NotificationsActions.loadNotificationsFailure({ error: 'Failed' })))
    ))
  ));
}
