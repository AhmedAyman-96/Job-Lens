import initSqlJs from "sql.js";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "joblens.db");

type BindParams = any[];

class Stmt {
  private stmt: import("sql.js").Statement;
  private db: DatabaseWrapper;

  constructor(stmt: import("sql.js").Statement, db: DatabaseWrapper) {
    this.stmt = stmt;
    this.db = db;
  }

  get(...params: BindParams) {
    if (params.length > 0) this.stmt.bind(params);
    let result: Record<string, any> | null = null;
    if (this.stmt.step()) {
      result = this.stmt.getAsObject();
    }
    this.stmt.free();
    return result;
  }

  all(...params: BindParams) {
    if (params.length > 0) this.stmt.bind(params);
    const results: Record<string, any>[] = [];
    while (this.stmt.step()) {
      results.push({ ...this.stmt.getAsObject() });
    }
    this.stmt.free();
    return results;
  }

  run(...params: BindParams) {
    if (params.length > 0) this.stmt.bind(params);
    this.stmt.step();
    this.stmt.free();
    this.db.save();
  }
}

class DatabaseWrapper {
  private sqlDb: import("sql.js").Database;

  constructor(sqlDb: import("sql.js").Database) {
    this.sqlDb = sqlDb;
  }

  prepare(sql: string): Stmt {
    return new Stmt(this.sqlDb.prepare(sql), this);
  }

  exec(sql: string) {
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const stmt of statements) {
      this.sqlDb.run(stmt + ";");
    }
    this.save();
  }

  transaction<T extends any[]>(fn: (...args: T) => void) {
    return (...args: T) => {
      this.sqlDb.run("BEGIN");
      try {
        fn(...args);
        this.sqlDb.run("COMMIT");
        this.save();
      } catch (e) {
        this.sqlDb.run("ROLLBACK");
        throw e;
      }
    };
  }

  save() {
    const data = this.sqlDb.export();
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

let _ready: Promise<DatabaseWrapper> | null = null;

async function initDb(): Promise<DatabaseWrapper> {
  const SQL = await initSqlJs();
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  let sqlDb: import("sql.js").Database;
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(buffer);
  } else {
    sqlDb = new SQL.Database();
  }

  sqlDb.run("PRAGMA journal_mode = WAL");
  const db = new DatabaseWrapper(sqlDb);
  migrate(db);
  return db;
}

function migrate(db: DatabaseWrapper) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      guid        TEXT    UNIQUE NOT NULL,
      title       TEXT    NOT NULL,
      company     TEXT    NOT NULL DEFAULT '',
      location    TEXT    NOT NULL DEFAULT '',
      feed        TEXT    NOT NULL,
      source      TEXT    NOT NULL DEFAULT '',
      link        TEXT    NOT NULL DEFAULT '',
      description TEXT    NOT NULL DEFAULT '',
      notes       TEXT    NOT NULL DEFAULT '',
      is_manual   INTEGER NOT NULL DEFAULT 0,
      status      TEXT    NOT NULL DEFAULT 'New',
      saved       INTEGER NOT NULL DEFAULT 0,
      date_posted TEXT    NOT NULL DEFAULT '',
      created_at  INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS feed_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      feed       TEXT NOT NULL,
      fetched_at INTEGER NOT NULL DEFAULT (unixepoch()),
      count      INTEGER NOT NULL DEFAULT 0,
      error      TEXT
    );
  `);
}

export async function getDb(): Promise<DatabaseWrapper> {
  if (_ready) return _ready;
  _ready = initDb();
  return _ready;
}

export type { DatabaseWrapper };
