/**
 * Adapters barrel export
 *
 * Import from here in app.config.ts:
 *   import { AUTH_ADAPTER, MockAuthAdapter, ProductionAuthAdapter } from '@core/adapters';
 *
 * To switch to production:
 *   { provide: AUTH_ADAPTER, useClass: ProductionAuthAdapter }
 *
 * Google Auth adapter (future — not wired up today):
 *   import { GoogleAuthAdapter } from '@core/adapters';
 *   See GOOGLE-AUTH-PREP-REPORT.md for activation steps.
 */
export { AUTH_ADAPTER }               from './auth.adapter';
export type { AuthAdapter }           from './auth.adapter';
export { MockAuthAdapter }            from './mock-auth.adapter';
export { ProductionAuthAdapter }      from './production-auth.adapter';
export { GoogleAuthAdapter }          from './google-auth.adapter';
