from datetime import datetime, timezone

from ..db import get_connection


def create_task(title: str, due: str = "", priority: str = "normal") -> dict:
    """Create a new open task, optionally with a due date (YYYY-MM-DD) and priority."""
    now = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    try:
        row = conn.execute(
            "INSERT INTO tasks (title, due_date, priority, status, created_at) "
            "VALUES (%s, %s, %s, 'open', %s) "
            "RETURNING id, title, due_date, priority, status, created_at",
            (title, due or None, priority, now),
        ).fetchone()
        conn.commit()
        return row
    finally:
        conn.close()


def list_tasks(status: str = "") -> list[dict]:
    """List tasks, optionally filtered by status ('open' or 'done')."""
    conn = get_connection()
    try:
        if status:
            rows = conn.execute(
                "SELECT * FROM tasks WHERE status = %s ORDER BY "
                "(due_date IS NULL), due_date, created_at",
                (status,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM tasks ORDER BY status, (due_date IS NULL), due_date, created_at"
            ).fetchall()
        return rows
    finally:
        conn.close()


def complete_task(task_id: int) -> dict:
    """Mark a task as done by id."""
    now = datetime.now(timezone.utc).isoformat()
    conn = get_connection()
    try:
        cur = conn.execute(
            "UPDATE tasks SET status = 'done', completed_at = %s WHERE id = %s",
            (now, task_id),
        )
        if cur.rowcount == 0:
            conn.rollback()
            return {"error": f"no task with id {task_id}"}
        conn.commit()
        row = conn.execute("SELECT * FROM tasks WHERE id = %s", (task_id,)).fetchone()
        return row
    finally:
        conn.close()
