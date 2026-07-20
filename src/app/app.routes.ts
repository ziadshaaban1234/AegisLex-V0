import { Routes } from '@angular/router';
import { authGuard }           from './core/guards/auth.guard';
import { guestGuard }          from './core/guards/guest.guard';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';

export const routes: Routes = [
  // Root redirect
  { path: '', redirectTo: '/app/dashboard', pathMatch: 'full' },

  // Landing
  {
    path: 'landing',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
  },

  // Auth routes — guestGuard redirects authenticated users to dashboard
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
      },
      {
        path: 'verify-otp',
        loadComponent: () => import('./features/auth/verify-otp/verify-otp.component').then(m => m.VerifyOtpComponent),
      },
      {
        path: 'reset-password',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // Protected app routes
  {
    path: 'app',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',       loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'chat',            loadComponent: () => import('./features/chat/chat.component').then(m => m.ChatComponent) },
      { path: 'chat/:sessionId', loadComponent: () => import('./features/chat/chat.component').then(m => m.ChatComponent) },
      { path: 'upload',          loadComponent: () => import('./features/upload/upload.component').then(m => m.UploadComponent) },
      { path: 'cases',           loadComponent: () => import('./features/cases/cases-list/cases-list.component').then(m => m.CasesListComponent) },
      { path: 'cases/new',       loadComponent: () => import('./features/cases/case-form/case-form.component').then(m => m.CaseFormComponent) },
      { path: 'cases/:id',       loadComponent: () => import('./features/cases/case-detail/case-detail.component').then(m => m.CaseDetailComponent) },
      { path: 'documents/:id',   loadComponent: () => import('./features/contracts/contract-viewer/contract-viewer.component').then(m => m.ContractViewerComponent) },
      { path: 'analysis/:documentId', loadComponent: () => import('./features/analysis/analysis.component').then(m => m.AnalysisComponent) },
      { path: 'analysis',        loadComponent: () => import('./features/analysis/analysis.component').then(m => m.AnalysisComponent) },
      { path: 'reports',         loadComponent: () => import('./features/reports/reports-list/reports-list.component').then(m => m.ReportsListComponent) },
      { path: 'reports/:id',     loadComponent: () => import('./features/reports/report-viewer/report-viewer.component').then(m => m.ReportViewerComponent) },
      { path: 'timeline/:caseId',loadComponent: () => import('./features/timeline/timeline.component').then(m => m.TimelineComponent) },
      { path: 'timeline',        loadComponent: () => import('./features/timeline/timeline.component').then(m => m.TimelineComponent) },
      { path: 'graph/:caseId',   loadComponent: () => import('./features/graph/graph.component').then(m => m.GraphComponent) },
      { path: 'graph',           loadComponent: () => import('./features/graph/graph.component').then(m => m.GraphComponent) },
      { path: 'search',          loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent) },
      { path: 'recommendations', loadComponent: () => import('./features/recommendations/recommendations.component').then(m => m.RecommendationsComponent) },
      { path: 'similar-cases',   loadComponent: () => import('./features/similar-cases/similar-cases.component').then(m => m.SimilarCasesComponent) },
      { path: 'insights',        loadComponent: () => import('./features/insights/insights.component').then(m => m.InsightsComponent) },
      { path: 'workspace',       loadComponent: () => import('./features/workspace/workspace.component').then(m => m.WorkspaceComponent) },
      { path: 'notifications',   loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'settings',        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'profile',         loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // 404
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
