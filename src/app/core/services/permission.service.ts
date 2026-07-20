/**
 * PermissionService
 * ─────────────────────────────────────────────────────────
 * Role-based and permission-based access control.
 * Derives permissions from the current user's role.
 * Plug-and-play: swap mock → real permission check via API
 * without changing any component code.
 */
import { Injectable, inject, computed } from '@angular/core';
import { SessionService } from './session.service';
import { UserRole } from '@core/models';

// ── Permission definitions ────────────────────────────────

export const PERMISSIONS = {
  // Read
  READ_DASHBOARD:    'read:dashboard',
  READ_CASES:        'read:cases',
  READ_DOCUMENTS:    'read:documents',
  READ_ANALYSIS:     'read:analysis',
  READ_REPORTS:      'read:reports',
  READ_USERS:        'read:users',
  // Write
  WRITE_CASES:       'write:cases',
  WRITE_DOCUMENTS:   'write:documents',
  WRITE_REPORTS:     'write:reports',
  // Delete
  DELETE_CASES:      'delete:cases',
  DELETE_DOCUMENTS:  'delete:documents',
  DELETE_REPORTS:    'delete:reports',
  // Admin
  MANAGE_USERS:      'manage:users',
  WRITE_SETTINGS:    'write:settings',
  VIEW_AUDIT_LOG:    'view:audit_log',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ── Role → permissions map ────────────────────────────────

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: Object.values(PERMISSIONS) as Permission[],
  lawyer: [
    PERMISSIONS.READ_DASHBOARD, PERMISSIONS.READ_CASES,
    PERMISSIONS.READ_DOCUMENTS, PERMISSIONS.READ_ANALYSIS,
    PERMISSIONS.READ_REPORTS,
    PERMISSIONS.WRITE_CASES, PERMISSIONS.WRITE_DOCUMENTS,
    PERMISSIONS.WRITE_REPORTS,
  ],
  analyst: [
    PERMISSIONS.READ_DASHBOARD, PERMISSIONS.READ_CASES,
    PERMISSIONS.READ_DOCUMENTS, PERMISSIONS.READ_ANALYSIS,
    PERMISSIONS.READ_REPORTS, PERMISSIONS.WRITE_DOCUMENTS,
  ],
  viewer: [
    PERMISSIONS.READ_DASHBOARD, PERMISSIONS.READ_CASES,
    PERMISSIONS.READ_DOCUMENTS,
  ],
};

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly session = inject(SessionService);

  readonly permissions = computed<Permission[]>(() => {
    const user = this.session.currentUser();
    if (!user) return [];
    return ROLE_PERMISSIONS[user.role] ?? [];
  });

  readonly role = computed<UserRole | null>(() => this.session.currentUser()?.role ?? null);

  has(permission: Permission): boolean {
    return this.permissions().includes(permission);
  }

  hasAll(perms: Permission[]): boolean {
    return perms.every(p => this.has(p));
  }

  hasAny(perms: Permission[]): boolean {
    return perms.some(p => this.has(p));
  }

  hasRole(role: UserRole): boolean {
    return this.role() === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const current = this.role();
    return current !== null && roles.includes(current);
  }

  isAdmin():   boolean { return this.hasRole('admin'); }
  isLawyer():  boolean { return this.hasRole('lawyer'); }
  isAnalyst(): boolean { return this.hasRole('analyst'); }
  isViewer():  boolean { return this.hasRole('viewer'); }

  /** Returns all permissions for the given role */
  getPermissionsForRole(role: UserRole): Permission[] {
    return [...(ROLE_PERMISSIONS[role] ?? [])];
  }
}
