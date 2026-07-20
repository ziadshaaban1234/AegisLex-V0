import { createActionGroup, props, emptyProps } from '@ngrx/store';
import { createReducer, on } from '@ngrx/store';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Case, PagedResult } from '@core/models';
import { CasesService } from '@core/services/cases.service';

export const CasesActions = createActionGroup({
  source: 'Cases',
  events: {
    'Load Cases': props<{ page?: number; status?: string; search?: string }>(),
    'Load Cases Success': props<{ result: PagedResult<Case> }>(),
    'Load Cases Failure': props<{ error: string }>(),
    'Load Case': props<{ id: string }>(),
    'Load Case Success': props<{ case: Case }>(),
    'Load Case Failure': props<{ error: string }>(),
    'Create Case Success': props<{ case: Case }>(),
    'Update Case Success': props<{ case: Case }>(),
    'Delete Case': props<{ id: string }>(),
    'Delete Case Success': props<{ id: string }>(),
    'Select Case': props<{ id: string | null }>(),
    'Clear Error': emptyProps(),
  },
});

export interface CasesState {
  cases: Case[]; selectedCase: Case | null; selectedCaseId: string | null;
  total: number; page: number; pageSize: number; loading: boolean; error: string | null;
}

const initialState: CasesState = {
  cases: [], selectedCase: null, selectedCaseId: null,
  total: 0, page: 1, pageSize: 20, loading: false, error: null,
};

export const casesReducer = createReducer(
  initialState,
  on(CasesActions.loadCases, state => ({ ...state, loading: true, error: null })),
  on(CasesActions.loadCasesSuccess, (state, { result }) => ({ ...state, cases: result.items, total: result.total, page: result.page, pageSize: result.pageSize, loading: false })),
  on(CasesActions.loadCasesFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(CasesActions.loadCaseSuccess, (state, { case: c }) => ({ ...state, selectedCase: c, loading: false })),
  on(CasesActions.createCaseSuccess, (state, { case: c }) => ({ ...state, cases: [c, ...state.cases], total: state.total + 1 })),
  on(CasesActions.updateCaseSuccess, (state, { case: c }) => ({ ...state, cases: state.cases.map(x => x.id === c.id ? c : x), selectedCase: state.selectedCase?.id === c.id ? c : state.selectedCase })),
  on(CasesActions.deleteCaseSuccess, (state, { id }) => ({ ...state, cases: state.cases.filter(c => c.id !== id), total: state.total - 1, selectedCase: state.selectedCase?.id === id ? null : state.selectedCase })),
  on(CasesActions.selectCase, (state, { id }) => ({ ...state, selectedCaseId: id })),
  on(CasesActions.clearError, state => ({ ...state, error: null })),
);

@Injectable()
export class CasesEffects {
  private readonly actions$ = inject(Actions);
  private readonly casesService = inject(CasesService);

  loadCases$ = createEffect(() => this.actions$.pipe(
    ofType(CasesActions.loadCases),
    switchMap(({ page, status, search }) =>
      this.casesService.getCases(page, 20, status, search).pipe(
        map(res => CasesActions.loadCasesSuccess({ result: res.data })),
        catchError(err => of(CasesActions.loadCasesFailure({ error: err.message || 'Failed to load cases' })))
      )
    )
  ));

  loadCase$ = createEffect(() => this.actions$.pipe(
    ofType(CasesActions.loadCase),
    switchMap(({ id }) =>
      this.casesService.getCase(id).pipe(
        map(res => CasesActions.loadCaseSuccess({ case: res.data })),
        catchError(err => of(CasesActions.loadCaseFailure({ error: err.message || 'Failed to load case' })))
      )
    )
  ));

  deleteCase$ = createEffect(() => this.actions$.pipe(
    ofType(CasesActions.deleteCase),
    switchMap(({ id }) =>
      this.casesService.deleteCase(id).pipe(
        map(() => CasesActions.deleteCaseSuccess({ id })),
        catchError(() => of(CasesActions.loadCasesFailure({ error: 'Failed to delete case' })))
      )
    )
  ));
}
