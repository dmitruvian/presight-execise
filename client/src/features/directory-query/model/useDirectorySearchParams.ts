import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SortDirection, SortField } from '../../../entities/user';

const sortFields: SortField[] = ['first_name', 'last_name', 'age', 'nationality'];
const sortDirections: SortDirection[] = ['asc', 'desc'];

export interface DirectoryState {
  text: string;
  hobbies: string[];
  nationalities: string[];
  sortField: SortField;
  sortDirection: SortDirection;
}

function toSearchParams(state: DirectoryState) {
  const params = new URLSearchParams();

  if (state.text.trim()) params.set('q', state.text.trim());
  state.hobbies.forEach((hobby) => params.append('hobby', hobby));
  state.nationalities.forEach((nationality) => params.append('nationality', nationality));
  params.set('sortBy', state.sortField);
  params.set('sortDir', state.sortDirection);

  return params;
}

export function useDirectorySearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo<DirectoryState>(() => {
    const sortField = (searchParams.get('sortBy') ?? searchParams.get('sortField')) as SortField | null;
    const sortDirection = (searchParams.get('sortDir') ?? searchParams.get('sortDirection')) as SortDirection | null;

    return {
      text: searchParams.get('q') ?? '',
      hobbies: searchParams.getAll('hobby').filter(Boolean),
      nationalities: searchParams.getAll('nationality').filter(Boolean),
      sortField: sortField && sortFields.includes(sortField) ? sortField : 'last_name',
      sortDirection: sortDirection && sortDirections.includes(sortDirection) ? sortDirection : 'asc',
    };
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.has('sortBy') && searchParams.has('sortDir')) return;

    setSearchParams(toSearchParams(state), { replace: true });
  }, [searchParams, setSearchParams, state]);

  const updateState = useCallback((patch: Partial<DirectoryState>) => {
    const next = { ...state, ...patch };

    setSearchParams(toSearchParams(next), { replace: false });
  }, [setSearchParams, state]);

  return [state, updateState] as const;
}
