/**
 * GuestGuard — redirects authenticated users away from auth pages
 * (login, register) to the dashboard.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@core/services/session.service';

export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router  = inject(Router);

  if (!session.isAuthenticated()) return true;

  return router.createUrlTree(['/app/dashboard']);
};
