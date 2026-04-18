import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

let db = null;

function getDbPath() {
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return join(dir, "analytics.db");
}

export function getDb() {
  if (db) return db;

  const dbPath = getDbPath();
  const instance = new Database(dbPath);
  instance.pragma("journal_mode = WAL");
  instance.pragma("synchronous = NORMAL");

  instance.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
    CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);
  `);

  db = instance;
  return db;
}

let insertStmt = null;

export function recordEvent(sessionId, eventType, payload) {
  try {
    const d = getDb();
    if (!insertStmt) {
      insertStmt = d.prepare(`INSERT INTO events (session_id, event_type, payload) VALUES (?, ?, ?)`);
    }
    insertStmt.run(sessionId, eventType, payload ? JSON.stringify(payload) : null);
  } catch (err) {
    console.error("[analytics] Failed to record event:", err.message);
  }
}
