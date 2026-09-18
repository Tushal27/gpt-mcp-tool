from datetime import datetime, timezone

from ..db import get_connection


def save_memory(content: str, tags: str = "") -> dict:
    """Save a piece of content as a general memory, optionally tagged."""
    now = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    try:
        cur = conn.execute(
            "INSERT INTO memories (content, tags, created_at) VALUES (?, ?, ?)",
            (content, tags, now),
        )
        conn.commit()
        return {"id": cur.lastrowid, "content": content, "tags": tags, "created_at": now}
    finally:
        conn.close()


def search_memory(query: str) -> list[dict]:
    """Search saved memories by substring match on content or tags."""
    like = f"%{query}%"
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT id, content, tags, created_at FROM memories "
            "WHERE content LIKE ? OR tags LIKE ? ORDER BY created_at DESC",
            (like, like),
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()
