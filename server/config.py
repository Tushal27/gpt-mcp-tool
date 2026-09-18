import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Week 1: local SQLite file. Week 2 swaps this for a Postgres DSN.
DB_PATH = os.environ.get("FF_DB_PATH", str(BASE_DIR / "db" / "ff.sqlite3"))
