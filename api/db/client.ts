import { createClient as createLibsqlClient, type Client as LibsqlClient } from '@libsql/client';

export interface QueryResult {
  rows: any[];
  lastInsertRowid?: number;
  rowsAffected?: number;
}

export interface DatabaseClient {
  execute(sql: string, args?: any[]): Promise<QueryResult>;
  batch(statements: { sql: string; args?: any[] }[]): Promise<void>;
  isLocal(): boolean;
}

class TursoClient implements DatabaseClient {
  private client: LibsqlClient;

  constructor() {
    this.client = createLibsqlClient({
      url: process.env.TURSO_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  async execute(sql: string, args: any[] = []): Promise<QueryResult> {
    const result = await this.client.execute({ sql, args: args.map(a => a === null ? null : a) });
    return {
      rows: result.rows.map(row => {
        const obj: any = {};
        for (const [key, value] of Object.entries(row)) {
          obj[key] = typeof value === 'bigint' ? Number(value) : value;
        }
        return obj;
      }),
      lastInsertRowid: typeof result.lastInsertRowid === 'bigint' ? Number(result.lastInsertRowid) : result.lastInsertRowid as number,
      rowsAffected: result.rowsAffected,
    };
  }

  async batch(statements: { sql: string; args?: any[] }[]): Promise<void> {
    await this.client.batch(statements.map(s => ({
      sql: s.sql,
      args: (s.args || []).map(a => a === null ? null : a),
    })));
  }

  isLocal(): boolean { return false; }
}

// Local SQLite client (only loaded when TURSO_URL is NOT set)
let _localDb: any = null;

function getLocalDb() {
  if (!_localDb) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    const path = require('path');
    const fs = require('fs');

    const rootDir = path.resolve(__dirname, '../..');
    const dataDir = path.join(rootDir, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    _localDb = new Database(path.join(dataDir, 'recipes.db'));
    _localDb.pragma('journal_mode = WAL');
    _localDb.pragma('foreign_keys = ON');
  }
  return _localDb;
}

function getLocalClient(): DatabaseClient {
  return {
    async execute(sql: string, args: any[] = []): Promise<QueryResult> {
      const db = getLocalDb();
      const stmt = db.prepare(sql);
      if (sql.trimStart().toUpperCase().startsWith('SELECT')) {
        return { rows: stmt.all(...args) };
      }
      const result = stmt.run(...args);
      return {
        rows: [],
        lastInsertRowid: Number(result.lastInsertRowid),
        rowsAffected: result.changes,
      };
    },
    async batch(statements: { sql: string; args?: any[] }[]): Promise<void> {
      const db = getLocalDb();
      const transaction = db.transaction(() => {
        for (const stmt of statements) {
          db.prepare(stmt.sql).run(...(stmt.args || []));
        }
      });
      transaction();
    },
    isLocal(): boolean { return true; },
  };
}

export function createClient(): DatabaseClient {
  // In Vercel (production), TURSO_URL is set → use Turso (no better-sqlite3 needed)
  // Locally, TURSO_URL is not set → use local SQLite
  if (process.env.TURSO_URL) {
    return new TursoClient();
  }
  return getLocalClient();
}
