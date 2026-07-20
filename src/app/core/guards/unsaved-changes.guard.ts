/**
 * UnsavedChangesGuard — canDeactivate guard.
 * Shows a confirmation dialog when leaving a form with unsaved data.
 *
 * Implement the CanDeactivateComponent interface in any form component.
 *
 * Usage in routes:
 *   {
 *     path: 'register',
 *     canDeactivate: [unsavedChangesGuard],
 *     ...
 *   }
 */
import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { LanguageService } from '@core/services/language.service';

export interface CanDeactivateComponent {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<CanDeactivateComponent> = (component) => {
  if (!component?.hasUnsavedChanges?.()) return true;

  const lang = inject(LanguageService);
  return window.confirm(lang.t('common.unsaved_changes_confirm'));
};
