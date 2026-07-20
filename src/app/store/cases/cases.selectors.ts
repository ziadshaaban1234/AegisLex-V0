import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CasesState } from './cases.reducer';

export const selectCasesState = createFeatureSelector<CasesState>('cases');

export const selectAllCases = createSelector(selectCasesState, state => state.cases);
export const selectCasesLoading = createSelector(selectCasesState, state => state.loading);
export const selectCasesTotal = createSelector(selectCasesState, state => state.total);
export const selectSelectedCase = createSelector(selectCasesState, state => state.selectedCase);
