-- Postgres schema (Supabase). Column types kept as TEXT for dates/timestamps
-- to match the ISO-string values the tool functions already produce/consume.

CREATE TABLE IF NOT EXISTS memories (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    tags TEXT,                     -- comma-separated
    created_at TEXT NOT NULL       -- ISO 8601
);

CREATE TABLE IF NOT EXISTS work_log (
    id SERIAL PRIMARY KEY,
    log_date TEXT NOT NULL,        -- YYYY-MM-DD
    summary TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    due_date TEXT,                 -- YYYY-MM-DD, nullable
    priority TEXT NOT NULL DEFAULT 'normal',
    status TEXT NOT NULL DEFAULT 'open',   -- open | done
    created_at TEXT NOT NULL,
    completed_at TEXT
);
