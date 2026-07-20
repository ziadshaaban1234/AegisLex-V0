import { ApplicationConfig, ErrorHandler } from '@angular/core';
import {
  provideRouter, withViewTransitions, withComponentInputBinding
} from '@angular/router';
import {
  provideHttpClient, withInterceptors
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore }           from '@ngrx/store';
import { provideEffects }         from '@ngrx/effects';
import { provideStoreDevtools }   from '@ngrx/store-devtools';

import { routes }                 from './app.routes';
import { reducers, metaReducers } from './store/app.state';
import { AuthEffects }            from './store/auth/auth.effects';
import { CasesEffects }           from './store/cases/cases.effects';
import { NotificationsEffects }   from './store/notifications/notifications.effects';
import { environment }            from '@environments/environment';

// Interceptors (applied in order)
import { authInterceptor }         from './core/interceptors/auth.interceptor';
import { refreshTokenInterceptor } from './core/interceptors/refresh-token.interceptor';
import { errorInterceptor }        from './core/interceptors/error.interceptor';

// Auth adapter — swap MockAuthAdapter → ProductionAuthAdapter at backend go-live
import { AUTH_ADAPTER }            from './core/adapters/auth.adapter';
import { MockAuthAdapter }         from './core/adapters/mock-auth.adapter';
// import { ProductionAuthAdapter } from './core/adapters/production-auth.adapter';

// Global error handler
import { GlobalErrorHandler }      from './core/services/error.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions(), withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        refreshTokenInterceptor,
        errorInterceptor,
      ])
    ),
    provideAnimationsAsync(),
    provideStore(reducers, { metaReducers }),
    provideEffects([AuthEffects, CasesEffects, NotificationsEffects]),
    ...(environment.production ? [] : [
      provideStoreDevtools({
        maxAge: 25,
        logOnly: false,
        name: 'AegisLex NgRx Store',
      }),
    ]),

    // Global error handler (catches unhandled exceptions)
    { provide: ErrorHandler, useClass: GlobalErrorHandler },

    // ── AI Provider Integration Note ──────────────────────────────────────────
    // When the backend is ready:
    //   1. Set environment.mockMode = false in the target environment file.
    //   2. Set environment.aiBaseUrl to the backend AI gateway URL.
    //   3. Switch AUTH_ADAPTER from MockAuthAdapter to ProductionAuthAdapter (below).
    //
    // The backend AI gateway handles provider routing:
    //   Grok (primary) → Gemini (fallback, automatic on failure)
    //
    // No other files need to change. All AI feature services (SaulService,
    // analysis, chat, recommendations, similar-cases) already read from
    // environment.aiBaseUrl via EnvironmentService.
    // ─────────────────────────────────────────────────────────────────────────

    // Auth adapter — one-line switch for backend go-live.
    // Both branches currently resolve to MockAuthAdapter because no real
    // backend exists yet (staging/prod environments would otherwise call
    // a nonexistent API). When the backend is ready, change the false
    // branch to ProductionAuthAdapter — no other file needs to change.
    // TODO: Replace with real backend implementation
    {
      provide:  AUTH_ADAPTER,
      useClass: environment.mockMode
        ? MockAuthAdapter
        : MockAuthAdapter,   // ← change to ProductionAuthAdapter at backend go-live
    },
  ],
};
