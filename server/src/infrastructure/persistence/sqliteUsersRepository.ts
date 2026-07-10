import type { QueryOptions, UsersRepository, UsersResponse } from '../../application/users/getUsers';
import { SORT_COLUMNS, type FacetRow, type UserRow } from '../../domain/user';
import type { AppDatabase } from '../database/sqlite';

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

function placeholders(values: unknown[]): string {
  return values.map(() => '?').join(', ');
}

function buildWhere(options: QueryOptions): { clause: string; params: unknown[] } {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (options.q) {
    const pattern = `%${escapeLike(options.q)}%`;
    clauses.push(`(
      u.first_name COLLATE NOCASE LIKE ? ESCAPE '\\'
      OR u.last_name COLLATE NOCASE LIKE ? ESCAPE '\\'
      OR (u.first_name || ' ' || u.last_name) COLLATE NOCASE LIKE ? ESCAPE '\\'
    )`);
    params.push(pattern, pattern, pattern);
  }

  if (options.nationalities.length > 0) {
    clauses.push(`u.nationality IN (${placeholders(options.nationalities)})`);
    params.push(...options.nationalities);
  }

  if (options.hobbies.length > 0) {
    clauses.push(`u.id IN (
      SELECT uh.user_id
      FROM user_hobbies uh
      JOIN hobbies h ON h.id = uh.hobby_id
      WHERE h.name IN (${placeholders(options.hobbies)})
      GROUP BY uh.user_id
      HAVING COUNT(DISTINCT h.name) = ?
    )`);
    params.push(...options.hobbies, options.hobbies.length);
  }

  return {
    clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params
  };
}

export class SqliteUsersRepository implements UsersRepository {
  constructor(private readonly db: AppDatabase) {}

  findUsers(options: QueryOptions): UsersResponse {
    return findUsers(this.db, options);
  }
}

function findUsers(db: AppDatabase, options: QueryOptions): UsersResponse {
  const where = buildWhere(options);
  const totalRow = db
    .prepare(`SELECT COUNT(*) AS total FROM users u ${where.clause}`)
    .get(...where.params) as { total: number };

  const orderColumn = SORT_COLUMNS[options.sortBy];
  const rows = db
    .prepare(
      `SELECT u.id, u.avatar, u.first_name, u.last_name, u.age, u.nationality
       FROM users u
       ${where.clause}
       ORDER BY ${orderColumn} ${options.sortDir.toUpperCase()}, u.id ASC
       LIMIT ? OFFSET ?`
    )
    .all(...where.params, options.limit, options.offset) as UserRow[];

  const hobbiesByUser = new Map<number, string[]>();
  if (rows.length > 0) {
    const ids = rows.map((row) => row.id);
    const hobbyRows = db
      .prepare(
        `SELECT uh.user_id AS userId, h.name
         FROM user_hobbies uh
         JOIN hobbies h ON h.id = uh.hobby_id
         WHERE uh.user_id IN (${placeholders(ids)})
         ORDER BY h.name ASC`
      )
      .all(...ids) as Array<{ userId: number; name: string }>;

    for (const hobbyRow of hobbyRows) {
      const userHobbies = hobbiesByUser.get(hobbyRow.userId) ?? [];
      userHobbies.push(hobbyRow.name);
      hobbiesByUser.set(hobbyRow.userId, userHobbies);
    }
  }

  const hobbyFacets = db
    .prepare(
      `SELECT h.name AS value, COUNT(DISTINCT u.id) AS count
       FROM users u
       JOIN user_hobbies uh ON uh.user_id = u.id
       JOIN hobbies h ON h.id = uh.hobby_id
       ${where.clause}
       GROUP BY h.name
       ORDER BY count DESC, h.name ASC
       LIMIT 20`
    )
    .all(...where.params) as FacetRow[];

  const nationalityFacets = db
    .prepare(
      `SELECT u.nationality AS value, COUNT(*) AS count
       FROM users u
       ${where.clause}
       GROUP BY u.nationality
       ORDER BY count DESC, u.nationality ASC
       LIMIT 20`
    )
    .all(...where.params) as FacetRow[];

  return {
    users: rows.map((row) => ({
      ...row,
      hobbies: hobbiesByUser.get(row.id) ?? []
    })),
    pagination: {
      limit: options.limit,
      offset: options.offset,
      page: Math.floor(options.offset / options.limit) + 1,
      total: totalRow.total,
      hasMore: options.offset + rows.length < totalRow.total
    },
    facets: {
      hobbies: hobbyFacets,
      nationalities: nationalityFacets
    },
    filters: {
      q: options.q,
      nationality: options.nationalities,
      hobby: options.hobbies
    },
    sort: {
      sortBy: options.sortBy,
      sortDir: options.sortDir
    }
  };
}
