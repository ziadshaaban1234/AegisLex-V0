/**
 * Route Metadata — Typed route data for breadcrumbs, permissions,
 * roles, and future dynamic menu generation.
 *
 * Usage in routes:
 *   {
 *     path: 'cases',
 *     data: routeMeta({
 *       title:       'Cases',
 *       breadcrumb:  'Cases',
 *       icon:        'folder',
 *       permissions: ['read:cases'],
 *     }),
 *   }
 */
import { UserRole } from '@core/models';

export interface RouteMetadata {
  /** Page title (also used for <title> tag and breadcrumb text) */
  title:            string;
  /** Label shown in breadcrumb trail */
  breadcrumb?:      string;
  /** Material icon name for sidebar / menu */
  icon?:            string;
  /** Sidebar visibility */
  showInNav?:       boolean;
  /** Order in navigation menu */
  navOrder?:        number;
  /** Required permissions — PermissionGuard reads this */
  permissions?:     string[];
  /** Required roles — RoleGuard reads this */
  roles?:           UserRole[];
  /** Whether this route requires authentication */
  requiresAuth?:    boolean;
  /** Whether this route is only for guests (login, register) */
  guestOnly?:       boolean;
  /** Feature flag that must be enabled for access */
  featureFlag?:     string;
  /** Custom data for future extensions */
  [key: string]:    unknown;
}

/** Type-safe factory for route data objects */
export function routeMeta(meta: RouteMetadata): RouteMetadata {
  return meta;
}

/** Pre-defined metadata for all main nav routes */
export const ROUTE_METADATA: Record<string, RouteMetadata> = {
  DASHBOARD: {
    title: 'Dashboard', breadcrumb: 'Dashboard',
    icon: 'dashboard', showInNav: true, navOrder: 1,
    permissions: ['read:dashboard'], requiresAuth: true,
  },
  CASES: {
    title: 'Cases', breadcrumb: 'Cases',
    icon: 'folder', showInNav: true, navOrder: 2,
    permissions: ['read:cases'], requiresAuth: true,
  },
  DOCUMENTS: {
    title: 'Documents', breadcrumb: 'Documents',
    icon: 'description', showInNav: true, navOrder: 3,
    permissions: ['read:documents'], requiresAuth: true,
  },
  ANALYSIS: {
    title: 'Analysis', breadcrumb: 'Analysis',
    icon: 'analytics', showInNav: true, navOrder: 4,
    permissions: ['read:analysis'], requiresAuth: true,
  },
  REPORTS: {
    title: 'Reports', breadcrumb: 'Reports',
    icon: 'assessment', showInNav: true, navOrder: 5,
    permissions: ['read:reports'], requiresAuth: true,
  },
  NOTIFICATIONS: {
    title: 'Notifications', breadcrumb: 'Notifications',
    icon: 'notifications', showInNav: false,
    requiresAuth: true,
  },
  SETTINGS: {
    title: 'Settings', breadcrumb: 'Settings',
    icon: 'settings', showInNav: true, navOrder: 10,
    requiresAuth: true,
  },
  PROFILE: {
    title: 'Profile', breadcrumb: 'Profile',
    icon: 'person', showInNav: false,
    requiresAuth: true,
  },
  LOGIN: {
    title: 'Sign In', guestOnly: true, requiresAuth: false,
  },
  REGISTER: {
    title: 'Create Account', guestOnly: true, requiresAuth: false,
  },
};
