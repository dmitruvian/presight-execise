import type { FacetRow, SortBy, SortDir, UserResult } from '../../domain/user';

export type QueryOptions = {
  q: string;
  nationalities: string[];
  hobbies: string[];
  sortBy: SortBy;
  sortDir: SortDir;
  limit: number;
  offset: number;
};

export type UsersResponse = {
  users: UserResult[];
  pagination: {
    limit: number;
    offset: number;
    page: number;
    total: number;
    hasMore: boolean;
  };
  facets: {
    hobbies: FacetRow[];
    nationalities: FacetRow[];
  };
  filters: {
    q: string;
    nationality: string[];
    hobby: string[];
  };
  sort: {
    sortBy: SortBy;
    sortDir: SortDir;
  };
};

export interface UsersRepository {
  findUsers(options: QueryOptions): UsersResponse;
}

export function getUsers(repository: UsersRepository, options: QueryOptions): UsersResponse {
  return repository.findUsers(options);
}
