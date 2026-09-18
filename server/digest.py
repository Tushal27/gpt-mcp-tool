from datetime import datetime, timedelta, timezone
from html import escape

import httpx
from starlette.requests import Request
from starlette.responses import PlainTextResponse, Response

from .auth import check_query_token
from .config import DIGEST_EMAIL_TO, RESEND_API_KEY
from .db import get_connection

RESEND_URL = "https://api.resend.com/emails"
FROM_ADDRESS = "ff digest <onboarding@resend.dev>"


def _yesterday() -> str:
    return (datetime.now(timezone.utc) - timedelta(days=1)).date().isoformat()


def _build_summary() -> tuple[str, list[dict], list[dict]]:
    since = _yesterday()
    conn = get_connection()
    try:
        work_log = conn.execute(
            "SELECT log_date, summary FROM work_log WHERE log_date >= %s "
            "ORDER BY log_date DESC, created_at DESC",
            (since,),
        ).fetchall()
        tasks = conn.execute(
            "SELECT title, due_date, priority FROM tasks WHERE status = 'open' "
            "ORDER BY (due_date IS NULL), due_date"
        ).fetchall()
        return since, work_log, tasks
    finally:
        conn.close()


def _render_html(since: str, work_log: list[dict], tasks: list[dict]) -> str:
    work_html = "".join(f"<li>{escape(r['summary'])} ({escape(r['log_date'])})</li>" for r in work_log)
    if not work_html:
        work_html = "<li><em>Nothing logged.</em></li>"

    task_html = "".join(
        f"<li>{escape(r['title'])}"
        f"{' — due ' + escape(r['due_date']) if r['due_date'] else ''}"
        f" ({escape(r['priority'])})</li>"
        for r in tasks
    )
    if not task_html:
        task_html = "<li><em>No open tasks.</em></li>"

    return (
        f"<h2>Work log since {escape(since)}</h2><ul>{work_html}</ul>"
        f"<h2>Open tasks</h2><ul>{task_html}</ul>"
    )


def send_digest_email() -> None:
    since, work_log, tasks = _build_summary()
    html = _render_html(since, work_log, tasks)
    response = httpx.post(
        RESEND_URL,
        headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
        json={
            "from": FROM_ADDRESS,
            "to": [DIGEST_EMAIL_TO],
            "subject": "ff daily digest",
            "html": html,
        },
        timeout=30,
    )
    response.raise_for_status()


async def daily_digest_endpoint(request: Request) -> Response:
    denied = check_query_token(request)
    if denied is not None:
        return denied
    send_digest_email()
    return PlainTextResponse("digest sent")
