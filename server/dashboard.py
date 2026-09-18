from html import escape

from starlette.requests import Request
from starlette.responses import HTMLResponse, Response

from .auth import check_query_token
from .db import get_connection

_STYLE = """
body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #222; }
h2 { border-bottom: 1px solid #ddd; padding-bottom: 0.3rem; margin-top: 2rem; }
.entry { padding: 0.5rem 0; border-bottom: 1px solid #eee; }
.meta { color: #888; font-size: 0.85rem; }
.empty { color: #888; font-style: italic; }
"""


def _fetch_recent() -> dict:
    conn = get_connection()
    try:
        memories = conn.execute(
            "SELECT content, tags, created_at FROM memories ORDER BY created_at DESC LIMIT 20"
        ).fetchall()
        work_log = conn.execute(
            "SELECT log_date, summary, created_at FROM work_log ORDER BY log_date DESC, created_at DESC LIMIT 20"
        ).fetchall()
        tasks = conn.execute(
            "SELECT id, title, due_date, priority, status FROM tasks WHERE status = 'open' "
            "ORDER BY (due_date IS NULL), due_date, created_at"
        ).fetchall()
        return {"memories": memories, "work_log": work_log, "tasks": tasks}
    finally:
        conn.close()


def _section(title: str, rows: list[dict], render_row) -> str:
    if not rows:
        return f"<h2>{escape(title)}</h2><p class='empty'>Nothing yet.</p>"
    items = "".join(render_row(r) for r in rows)
    return f"<h2>{escape(title)}</h2>{items}"


def _render_page(data: dict) -> str:
    memories_html = _section(
        "Memories",
        data["memories"],
        lambda r: (
            f"<div class='entry'>{escape(r['content'])}"
            f"<div class='meta'>{escape(r['tags'] or '')} &middot; {escape(r['created_at'])}</div></div>"
        ),
    )
    work_log_html = _section(
        "Work Log",
        data["work_log"],
        lambda r: (
            f"<div class='entry'>{escape(r['summary'])}"
            f"<div class='meta'>{escape(r['log_date'])}</div></div>"
        ),
    )
    tasks_html = _section(
        "Open Tasks",
        data["tasks"],
        lambda r: (
            f"<div class='entry'>{escape(r['title'])}"
            f"<div class='meta'>priority: {escape(r['priority'])}"
            f"{' &middot; due ' + escape(r['due_date']) if r['due_date'] else ''}</div></div>"
        ),
    )
    return (
        f"<!doctype html><html><head><title>ff dashboard</title><style>{_STYLE}</style></head>"
        f"<body><h1>ff</h1>{memories_html}{work_log_html}{tasks_html}</body></html>"
    )


async def dashboard_endpoint(request: Request) -> Response:
    denied = check_query_token(request)
    if denied is not None:
        return denied
    data = _fetch_recent()
    return HTMLResponse(_render_page(data))
