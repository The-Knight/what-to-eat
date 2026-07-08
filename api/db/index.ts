import { createClient, type DatabaseClient } from './client.js';

let _db: DatabaseClient | null = null;

function getDb(): DatabaseClient {
  if (!_db) {
    _db = createClient();
  }
  return _db;
}

// Use Proxy so `db.execute()` etc. work transparently
const db: DatabaseClient = new Proxy({} as DatabaseClient, {
  get(_target, prop, _receiver) {
    const client = getDb();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default db;
export type { DatabaseClient } from './client.js';
