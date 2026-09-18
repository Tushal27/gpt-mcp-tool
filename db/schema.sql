-- SQLite schema for local dev (Week 1). Week 2 ports this to Postgres.

CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    tags TEXT,                     -- comma-separated
    created_at TEXT NOT NULL       -- ISO 8601
);

CREATE TABLE IF NOT EXISTS work_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_date TEXT NOT NULL,        -- YYYY-MM-DD
    summary TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    due_date TEXT,                 -- YYYY-MM-DD, nullable
    priority TEXT NOT NULL DEFAULT 'normal',
    status TEXT NOT NULL DEFAULT 'open',   -- open | done
    created_at TEXT NOT NULL,
    completed_at TEXT
);
