import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let dbInstance: Database.Database | null = null;

export function getDatabase(dbPath: string): Database.Database {
  // Return cached instance if same path
  if (dbInstance && dbInstance.name === dbPath) {
    return dbInstance;
  }

  // Check if database file exists
  if (!fs.existsSync(dbPath)) {
    throw new Error(
      `Database not found at: ${dbPath}\n` +
        `Please ensure Automaton is running or specify a valid database path using:\n` +
        `  --db <path>  (CLI argument)\n` +
        `  AUTOMATON_DB_PATH=<path>  (environment variable)`
    );
  }

  try {
    // Open database (write-access needed for some tables e.g. inbox_messages)
    dbInstance = new Database(dbPath);

    return dbInstance;
  } catch (error) {
    throw new Error(
      `Failed to open database at ${dbPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function getDatabaseInstance(): Database.Database | null {
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export function getIdentity(key: string): string | null {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call getDatabase() first.');
  }

  try {
    const stmt = dbInstance.prepare('SELECT value FROM identity WHERE key = ?');
    const row = stmt.get(key) as { value: string } | undefined;
    return row?.value ?? null;
  } catch (error) {
    console.error(`Error reading identity key "${key}":`, error);
    return null;
  }
}

export function getKV(key: string): unknown | null {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call getDatabase() first.');
  }

  try {
    const stmt = dbInstance.prepare('SELECT value FROM kv WHERE key = ?');
    const row = stmt.get(key) as { value: string } | undefined;
    if (!row) return null;

    try {
      return JSON.parse(row.value);
    } catch {
      return row.value;
    }
  } catch (error) {
    console.error(`Error reading KV key "${key}":`, error);
    return null;
  }
}

export interface QueryOptions {
  limit: number;
  offset: number;
  where?: Record<string, unknown>;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export function queryPaginated<T extends Record<string, unknown>>(
  table: string,
  options: QueryOptions
): PaginatedResult<T> {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call getDatabase() first.');
  }

  const { limit, offset, where, orderBy, orderDirection = 'DESC' } = options;

  try {
    // Build WHERE clause
    let whereClause = '';
    const whereValues: unknown[] = [];

    if (where && Object.keys(where).length > 0) {
      const conditions = Object.entries(where).map(([key, value]) => {
        whereValues.push(value);
        return `${key} = ?`;
      });
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    // Build ORDER BY clause
    const orderClause = orderBy ? `ORDER BY ${orderBy} ${orderDirection}` : '';

    // Get total count
    const countStmt = dbInstance.prepare(`SELECT COUNT(*) as count FROM ${table} ${whereClause}`);
    const countRow = countStmt.get(...whereValues) as { count: number };
    const total = countRow.count;

    // Get paginated data
    const query = `SELECT * FROM ${table} ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
    const stmt = dbInstance.prepare(query);
    const data = stmt.all(...whereValues, limit, offset) as T[];

    return {
      data,
      total,
      limit,
      offset,
    };
  } catch (error) {
    throw new Error(
      `Error querying table "${table}": ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
