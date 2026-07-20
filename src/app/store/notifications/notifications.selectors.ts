import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotificationsState } from './notifications.reducer';

export const selectNotificationsState = createFeatureSelector<NotificationsState>('notifications');

export const selectAllNotifications = createSelector(selectNotificationsState, state => state.notifications);
export const selectUnreadCount = createSelector(selectNotificationsState, state => state.unreadCount);
export const selectNotificationsLoading = createSelector(selectNotificationsState, state => state.loading);
