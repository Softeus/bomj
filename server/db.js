import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'bomj.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('worker','customer')),
    tron_wallet TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    price_usdt REAL NOT NULL DEFAULT 5,
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','assigned','done','paid')),
    customer_id INTEGER NOT NULL REFERENCES users(id),
    worker_id INTEGER REFERENCES users(id),
    tx_id TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    done_at TEXT
  );
`);

export default db;
