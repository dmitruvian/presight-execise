export const SORT_COLUMNS = {
  first_name: 'u.first_name',
  last_name: 'u.last_name',
  age: 'u.age',
  nationality: 'u.nationality'
} as const;

export type SortBy = keyof typeof SORT_COLUMNS;
export type SortDir = 'asc' | 'desc';

export type UserRow = {
  id: number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
};

export type FacetRow = {
  value: string;
  count: number;
};

export type UserResult = UserRow & {
  hobbies: string[];
};
