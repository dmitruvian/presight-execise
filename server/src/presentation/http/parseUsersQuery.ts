import type { Request } from 'express';
import type { QueryOptions } from '../../application/users/getUsers';
import { BadRequestError } from '../../domain/errors';
import { SORT_COLUMNS, type SortBy, type SortDir } from '../../domain/user';

function firstValue(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : undefined;
  }
  return typeof value === 'string' ? value : undefined;
}

function parseMulti(value: unknown): string[] {
  const rawValues = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  const values = rawValues
    .filter((item): item is string => typeof item === 'string')
    .flatMap((item) => item.split(','))
    .map((item) => item.trim())
    .filter(Boolean);

  return [...new Set(values)];
}

function parseIntegerParam(value: unknown, name: string, defaultValue: number): number {
  const raw = firstValue(value);
  if (raw === undefined || raw.trim() === '') {
    return defaultValue;
  }
  if (!/^\d+$/.test(raw)) {
    throw new BadRequestError(`${name} must be a non-negative integer`);
  }
  return Number.parseInt(raw, 10);
}

export function parseUsersQuery(req: Request): QueryOptions {
  const sortBy = firstValue(req.query.sortBy) ?? 'last_name';
  if (!Object.prototype.hasOwnProperty.call(SORT_COLUMNS, sortBy)) {
    throw new BadRequestError(`sortBy must be one of: ${Object.keys(SORT_COLUMNS).join(', ')}`);
  }

  const sortDir = (firstValue(req.query.sortDir) ?? 'asc').toLowerCase();
  if (sortDir !== 'asc' && sortDir !== 'desc') {
    throw new BadRequestError('sortDir must be asc or desc');
  }

  const limit = parseIntegerParam(req.query.limit, 'limit', 50);
  if (limit < 1 || limit > 100) {
    throw new BadRequestError('limit must be between 1 and 100');
  }

  const offset = parseIntegerParam(req.query.offset, 'offset', 0);

  return {
    q: (firstValue(req.query.q) ?? '').trim(),
    nationalities: parseMulti(req.query.nationality),
    hobbies: parseMulti(req.query.hobby),
    sortBy: sortBy as SortBy,
    sortDir: sortDir as SortDir,
    limit,
    offset
  };
}
