import { createClient as createLibsqlClient, type Client as LibsqlClient } from '@libsql/client';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

export interface QueryResult {
  rows: any[];
}

export interface DatabaseClient {
  execute(sql: string, args?: any[]): Promise<QueryResult>;
  batch(statements: { sql: string; args?: any[] }[]): Promise<void>;
  isLocal(): boolean;
  getSync(sql: string, args?: any[]): any;
  runSync(sql: string, args?: any[]): { changes: number; lastInsertRowid: number };
}

class LocalClient implements DatabaseClient {
  private db: Database.Database;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootDir = path.resolve(__dirname, '../..');
    const dataDir = path.join(rootDir, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.db = new Database(path.join(dataDir, 'recipes.db'));
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
  }

  async execute(sql: string, args: any[] = []): Promise<QueryResult> {
    const stmt = this.db.prepare(sql);
    if (sql.trimStart().toUpperCase().startsWith('SELECT')) {
      return { rows: stmt.all(...args) };
    }
    const result = stmt.run(...args);
    return { rows: [{ changes: result.changes, lastInsertRowid: Number(result.lastInsertRowid) }] };
  }

  async batch(statements: { sql: string; args?: any[] }[]): Promise<void> {
    const transaction = this.db.transaction(() => {
      for (const stmt of statements) {
        this.db.prepare(stmt.sql).run(...(stmt.args || []));
      }
    });
    transaction();
  }

  isLocal(): boolean { return true; }

  getSync(sql: string, args: any[] = []): any {
    return this.db.prepare(sql).get(...args);
  }

  runSync(sql: string, args: any[] = []): { changes: number; lastInsertRowid: number } {
    const result = this.db.prepare(sql).run(...args);
    return { changes: result.changes, lastInsertRowid: Number(result.lastInsertRowid) };
  }
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
    return { rows: result.rows.map(row => {
      const obj: any = {};
      for (const [key, value] of Object.entries(row)) {
        obj[key] = typeof value === 'bigint' ? Number(value) : value;
      }
      return obj;
    }) };
  }

  async batch(statements: { sql: string; args?: any[] }[]): Promise<void> {
    await this.client.batch(statements.map(s => ({
      sql: s.sql,
      args: (s.args || []).map(a => a === null ? null : a),
    })));
  }

  isLocal(): boolean { return false; }

  getSync(_sql: string, _args?: any[]): any {
    throw new Error('Use execute() for Turso');
  }

  runSync(_sql: string, _args?: any[]): { changes: number; lastInsertRowid: number } {
    throw new Error('Use execute() for Turso');
  }
}

export function createClient(): DatabaseClient {
  if (process.env.TURSO_URL) {
    return new TursoClient();
  }
  return new LocalClient();
}
