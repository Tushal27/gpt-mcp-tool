from datetime import datetime, timezone

from ..db import get_connection


def create_task(title: str, due: str = "", priority: str = "normal") -> dict:
    """Create a new open task, optionally with a due date (YYYY-MM-DD) and priority."""
    now = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    try:
        cur = conn.execute(
            "INSERT INTO tasks (title, due_date, priority, status, created_at) "
            "VALUES (?, ?, ?, 'open', ?)",
            (title, due or None, priority, now),
        )
        conn.commit()
        return {
            "id": cur.lastrowid,
            "title": title,
            "due_date": due or None,
            "priority": priority,
            "status": "open",
            "created_at": now,
        }
    finally:
        conn.close()


def list_tasks(status: str = "") -> list[dict]:
    """List tasks, optionally filtered by status ('open' or 'done')."""
    conn = get_connection()
    try:
        if status:
            rows = conn.execute(
                "SELECT * FROM tasks WHERE status = ? ORDER BY "
                "(due_date IS NULL), due_date, created_at",
                (status,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM tasks ORDER BY status, (due_date IS NULL), due_date, created_at"
            ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def complete_task(task_id: int) -> dict:
    """Mark a task as done by id."""
    now = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    try:
        cur = conn.execute(
            "UPDATE tasks SET status = 'done', completed_at = ? WHERE id = ?",
            (now, task_id),
        )
        conn.commit()
        if cur.rowcount == 0:
            return {"error": f"no task with id {task_id}"}
        row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        return dict(row)
    finally:
        conn.close()
