/**
 * RoleGuard — restricts routes to specific user roles.
 *
 * Usage in routes:
 *   {
 *     path: 'admin',
 *     canActivate: [roleGuard],
 *     data: { roles: ['admin'] }
 *   }
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { SessionService } from '@core/services/session.service';
import { UserRole } from '@core/models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const session       = inject(SessionService);
  const router        = inject(Router);
  const allowedRoles  = (route.data?.['roles'] as UserRole[]) ?? [];
  const user          = session.currentUser();

  if (!user) return router.createUrlTree(['/auth/login']);

  if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) return true;

  // Authenticated but wrong role → dashboard
  return router.createUrlTree(['/app/dashboard']);
};
