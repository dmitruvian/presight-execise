import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchUsers, type FacetValue, type User } from '../../../entities/user';
import type { DirectoryState } from '../../../features/directory-query';

const PAGE_SIZE = 50;

interface DirectoryData {
  users: User[];
  facets: { hobbies: FacetValue[]; nationalities: FacetValue[] };
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  loadMore: () => void;
}

export function useUsersDirectory(state: DirectoryState): DirectoryData {
  const [users, setUsers] = useState<User[]>([]);
  const [facets, setFacets] = useState({ hobbies: [] as FacetValue[], nationalities: [] as FacetValue[] });
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const activeRequest = useRef(0);

  const queryKey = useMemo(() => JSON.stringify(state), [state]);

  useEffect(() => {
    const requestId = activeRequest.current + 1;
    activeRequest.current = requestId;
    const controller = new AbortController();

    setIsLoading(true);
    setIsLoadingMore(false);
    setError(null);
    setOffset(0);

    fetchUsers({ ...state, limit: PAGE_SIZE, offset: 0 }, controller.signal)
      .then((response) => {
        if (activeRequest.current !== requestId) return;
        setUsers(response.users);
        setFacets(response.facets);
        setTotal(response.pagination.total);
        setHasMore(response.pagination.hasMore);
        setOffset(response.users.length);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setUsers([]);
        setTotal(0);
        setHasMore(false);
        setError(err instanceof Error ? err.message : 'Unable to load users');
      })
      .finally(() => {
        if (activeRequest.current === requestId) setIsLoading(false);
      });

    return () => controller.abort();
  }, [queryKey, state]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    const requestId = activeRequest.current;
    setIsLoadingMore(true);
    setError(null);

    fetchUsers({ ...state, limit: PAGE_SIZE, offset })
      .then((response) => {
        if (activeRequest.current !== requestId) return;
        setUsers((current) => [...current, ...response.users]);
        setFacets(response.facets);
        setTotal(response.pagination.total);
        setHasMore(response.pagination.hasMore);
        setOffset((current) => current + response.users.length);
      })
      .catch((err: unknown) => {
        if (activeRequest.current !== requestId) return;
        setError(err instanceof Error ? err.message : 'Unable to load more users');
      })
      .finally(() => {
        if (activeRequest.current === requestId) setIsLoadingMore(false);
      });
  }, [hasMore, isLoading, isLoadingMore, offset, state]);

  return { users, facets, total, hasMore, isLoading, isLoadingMore, error, loadMore };
}
