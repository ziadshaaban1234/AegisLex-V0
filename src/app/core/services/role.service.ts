/**
 * RoleService
 * ─────────────────────────────────────────────────────────
 * Role metadata, display labels, and role-switching support.
 * Thin facade over PermissionService for UI-facing role info.
 */
import { Injectable } from '@angular/core';
import { RoleDto, UserRole } from '@core/models';
import { PERMISSIONS, Permission } from './permission.service';

const ROLE_METADATA: Record<UserRole, Omit<RoleDto, 'permissions'> & { permissions: Permission[] }> = {
  admin: {
    id: 'role-admin', name: 'admin', displayName: 'Administrator',
    description: 'Full system access — manage users, settings, and all data.',
    permissions: Object.values(PERMISSIONS) as Permission[],
  },
  lawyer: {
    id: 'role-lawyer', name: 'lawyer', displayName: 'Lawyer / Attorney',
    description: 'Create and manage cases, documents, and reports.',
    permissions: [
      PERMISSIONS.READ_DASHBOARD, PERMISSIONS.READ_CASES, PERMISSIONS.READ_DOCUMENTS,
      PERMISSIONS.READ_ANALYSIS, PERMISSIONS.READ_REPORTS,
      PERMISSIONS.WRITE_CASES, PERMISSIONS.WRITE_DOCUMENTS, PERMISSIONS.WRITE_REPORTS,
    ],
  },
  analyst: {
    id: 'role-analyst', name: 'analyst', displayName: 'Legal Analyst',
    description: 'Analyse documents and generate reports. Read access to cases.',
    permissions: [
      PERMISSIONS.READ_DASHBOARD, PERMISSIONS.READ_CASES, PERMISSIONS.READ_DOCUMENTS,
      PERMISSIONS.READ_ANALYSIS, PERMISSIONS.READ_REPORTS, PERMISSIONS.WRITE_DOCUMENTS,
    ],
  },
  viewer: {
    id: 'role-viewer', name: 'viewer', displayName: 'Read-only Viewer',
    description: 'View dashboard, cases, and documents. No write access.',
    permissions: [
      PERMISSIONS.READ_DASHBOARD, PERMISSIONS.READ_CASES, PERMISSIONS.READ_DOCUMENTS,
    ],
  },
};

@Injectable({ providedIn: 'root' })
export class RoleService {

  getAllRoles(): RoleDto[] {
    return Object.values(ROLE_METADATA) as RoleDto[];
  }

  getRoleMetadata(role: UserRole): RoleDto {
    return ROLE_METADATA[role] as RoleDto;
  }

  getDisplayName(role: UserRole): string {
    return ROLE_METADATA[role]?.displayName ?? role;
  }

  getAvailableRoles(): { value: UserRole; label: string }[] {
    return [
      { value: 'lawyer',  label: 'Lawyer / Attorney' },
      { value: 'analyst', label: 'Legal Analyst'      },
      { value: 'admin',   label: 'Admin / Manager'    },
      { value: 'viewer',  label: 'Read-only Viewer'   },
    ];
  }
}
