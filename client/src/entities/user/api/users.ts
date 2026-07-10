export type SortField = 'first_name' | 'last_name' | 'age' | 'nationality';
export type SortDirection = 'asc' | 'desc';

export interface User {
  id: string | number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  hobbies: string[];
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  facets: {
    hobbies: FacetValue[];
    nationalities: FacetValue[];
  };
}

export interface UsersQuery {
  text: string;
  hobbies: string[];
  nationalities: string[];
  sortField: SortField;
  sortDirection: SortDirection;
  limit: number;
  offset: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';

export async function fetchUsers(query: UsersQuery, signal?: AbortSignal): Promise<UsersResponse> {
  const params = new URLSearchParams({
    limit: String(query.limit),
    offset: String(query.offset),
    sortBy: query.sortField,
    sortDir: query.sortDirection,
  });

  if (query.text.trim()) {
    params.set('q', query.text.trim());
  }

  query.hobbies.forEach((hobby) => params.append('hobby', hobby));
  query.nationalities.forEach((nationality) => params.append('nationality', nationality));

  const response = await fetch(`${API_BASE_URL}/api/users?${params.toString()}`, { signal });
  if (!response.ok) {
    throw new Error(`Unable to load users (${response.status})`);
  }

  return response.json() as Promise<UsersResponse>;
}
