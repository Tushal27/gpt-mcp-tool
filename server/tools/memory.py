from datetime import datetime, timezone

from ..db import get_connection


def save_memory(content: str, tags: str = "") -> dict:
    """Save a piece of content as a general memory, optionally tagged."""
    now = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    try:
        row = conn.execute(
            "INSERT INTO memories (content, tags, created_at) VALUES (%s, %s, %s) "
            "RETURNING id, content, tags, created_at",
            (content, tags, now),
        ).fetchone()
        conn.commit()
        return row
    finally:
        conn.close()


def search_memory(query: str) -> list[dict]:
    """Search saved memories by substring match on content or tags."""
    like = f"%{query}%"
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT id, content, tags, created_at FROM memories "
            "WHERE content ILIKE %s OR tags ILIKE %s ORDER BY created_at DESC",
            (like, like),
        ).fetchall()
        return rows
    finally:
        conn.close()
