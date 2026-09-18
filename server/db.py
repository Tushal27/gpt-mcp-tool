import psycopg
from psycopg.rows import dict_row

from .config import BASE_DIR, DATABASE_URL, DB_SCHEMA

_SCHEMA_PATH = BASE_DIR / "db" / "schema.sql"


def get_connection() -> psycopg.Connection:
    conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    conn.execute(f'SET search_path TO "{DB_SCHEMA}"')
    return conn


def init_db() -> None:
    schema = _SCHEMA_PATH.read_text(encoding="utf-8")
    statements = [s.strip() for s in schema.split(";") if s.strip()]
    conn = psycopg.connect(DATABASE_URL)
    try:
        conn.execute(f'CREATE SCHEMA IF NOT EXISTS "{DB_SCHEMA}"')
        conn.execute(f'SET search_path TO "{DB_SCHEMA}"')
        for statement in statements:
            conn.execute(statement)
        conn.commit()
    finally:
        conn.close()


def drop_schema() -> None:
    """Test-only helper: drop an isolated test schema and everything in it."""
    conn = psycopg.connect(DATABASE_URL)
    try:
        conn.execute(f'DROP SCHEMA IF EXISTS "{DB_SCHEMA}" CASCADE')
        conn.commit()
    finally:
        conn.close()
