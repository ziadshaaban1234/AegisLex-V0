import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { authReducer, AuthState } from './auth/auth.reducer';
import { casesReducer, CasesState } from './cases/cases.reducer';
import { notificationsReducer, NotificationsState } from './notifications/notifications.reducer';
import { environment } from '@environments/environment';

export interface AppState {
  auth: AuthState;
  cases: CasesState;
  notifications: NotificationsState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  cases: casesReducer,
  notifications: notificationsReducer,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];
