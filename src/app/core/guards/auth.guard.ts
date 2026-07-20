/**
 * AuthGuard — protects routes that require authentication.
 * Preserves the intended URL as ?returnUrl= on redirect.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@core/services/session.service';

export const authGuard: CanActivateFn = (route, state) => {
  const session = inject(SessionService);
  const router  = inject(Router);

  if (session.isAuthenticated()) return true;

  return router.createUrlTree(
    ['/auth/login'],
    { queryParams: { returnUrl: state.url } }
  );
};
