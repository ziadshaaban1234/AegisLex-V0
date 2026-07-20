/**
 * PermissionGuard — restricts routes to users with specific permissions.
 *
 * Usage in routes:
 *   {
 *     path: 'settings',
 *     canActivate: [permissionGuard],
 *     data: { permissions: ['write:settings'] }
 *   }
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { PermissionService, Permission } from '@core/services/permission.service';
import { SessionService } from '@core/services/session.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const perms    = inject(PermissionService);
  const session  = inject(SessionService);
  const router   = inject(Router);
  const required = (route.data?.['permissions'] as Permission[]) ?? [];

  if (!session.isAuthenticated()) return router.createUrlTree(['/auth/login']);

  if (required.length === 0 || perms.hasAll(required)) return true;

  return router.createUrlTree(['/app/dashboard']);
};
