from datetime import datetime, timezone

from ..db import get_connection
from ..embeddings import embed


def save_memory(content: str, tags: str = "") -> dict:
    """Save a piece of content as a general memory, optionally tagged."""
    now = datetime.now(timezone.utc).isoformat()
    vector = embed(content, input_type="document")
    conn = get_connection()
    try:
        row = conn.execute(
            "INSERT INTO memories (content, tags, created_at, embedding) VALUES (%s, %s, %s, %s) "
            "RETURNING id, content, tags, created_at",
            (content, tags, now, vector),
        ).fetchone()
        conn.commit()
        return row
    finally:
        conn.close()


def search_memory(query: str) -> list[dict]:
    """Search saved memories by meaning (semantic search), most relevant first."""
    vector = embed(query, input_type="query")
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT id, content, tags, created_at FROM memories "
            "WHERE embedding IS NOT NULL "
            "ORDER BY embedding <=> %s::vector LIMIT 10",
            (vector,),
        ).fetchall()
        return rows
    finally:
        conn.close()
