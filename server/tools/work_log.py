from datetime import datetime, timezone

from ..db import get_connection


def _today() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def save_work_log(summary: str, date: str = "") -> dict:
    """Save a work log entry for a given date (defaults to today, UTC)."""
    log_date = date or _today()
    now = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    try:
        row = conn.execute(
            "INSERT INTO work_log (log_date, summary, created_at) VALUES (%s, %s, %s) "
            "RETURNING id, log_date, summary, created_at",
            (log_date, summary, now),
        ).fetchone()
        conn.commit()
        return row
    finally:
        conn.close()


def list_work_log(date_from: str = "", date_to: str = "") -> list[dict]:
    """List work log entries, optionally filtered by an inclusive date range (YYYY-MM-DD)."""
    conn = get_connection()
    try:
        query = "SELECT id, log_date, summary, created_at FROM work_log WHERE 1=1"
        params: list[str] = []
        if date_from:
            query += " AND log_date >= %s"
            params.append(date_from)
        if date_to:
            query += " AND log_date <= %s"
            params.append(date_to)
        query += " ORDER BY log_date DESC, created_at DESC"
        rows = conn.execute(query, params).fetchall()
        return rows
    finally:
        conn.close()
