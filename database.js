const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const DB_PATH = path.resolve(__dirname, '..', '..', process.env.DB_PATH || './finance.db');

let db = null;
let SQL = null;

/**
 * Initialise sql.js and load or create the database.
 * Must be awaited once before calling getDb().
 */
async function initDb() {
  if (db) return db;

  SQL = await initSqlJs();

  // Load existing database file if it exists
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');
  initSchema();
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialised. Call initDb() first.');
  return db;
}

function initSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'viewer'   CHECK(role IN ('viewer','analyst','admin')),
      status        TEXT NOT NULL DEFAULT 'active'   CHECK(status IN ('active','inactive')),
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS financial_records (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL REFERENCES users(id),
      type          TEXT NOT NULL CHECK(type IN ('income','expense')),
      category      TEXT NOT NULL,
      amount        REAL NOT NULL CHECK(amount > 0),
      date          TEXT NOT NULL,
      description   TEXT,
      is_deleted    INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run('CREATE INDEX IF NOT EXISTS idx_records_user   ON financial_records(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_records_type   ON financial_records(type)');
  db.run('CREATE INDEX IF NOT EXISTS idx_records_date   ON financial_records(date)');
  db.run('CREATE INDEX IF NOT EXISTS idx_records_deleted ON financial_records(is_deleted)');
}

/**
 * Persist the in-memory database to disk.
 */
function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Close and persist the database.
 */
function closeDb() {
  if (db) {
    saveDb();
    db.close();
    db = null;
  }
}

// ─── Helper wrappers to give a better-sqlite3-like API ───

/**
 * Run a statement that returns rows. Returns an array of plain objects.
 */
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Run a statement that returns a single row (or undefined).
 */
function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length ? rows[0] : undefined;
}

/**
 * Run a statement that modifies data. Returns { changes, lastInsertRowid }.
 */
function runSql(sql, params = []) {
  db.run(sql, params);
  const changes = db.getRowsModified();
  const lastId = queryOne('SELECT last_insert_rowid() as id');
  saveDb(); // persist after every write
  return { changes, lastInsertRowid: lastId ? lastId.id : 0 };
}

module.exports = { initDb, getDb, closeDb, saveDb, queryAll, queryOne, runSql };
