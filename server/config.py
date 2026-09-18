import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.environ.get("DATABASE_URL", "")

# Lets tests (and any future multi-tenant use) isolate their tables from the
# real data by using a separate Postgres schema instead of a separate DB.
DB_SCHEMA = os.environ.get("DB_SCHEMA") or "public"
