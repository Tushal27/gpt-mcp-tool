import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest  # noqa: E402

import server.config as config  # noqa: E402
import server.db as db  # noqa: E402


@pytest.fixture
def isolated_schema(monkeypatch):
    """Run against a throwaway Postgres schema in the same DATABASE_URL so
    tests don't touch real data, then drop it afterwards."""
    schema = f"pytest_{uuid.uuid4().hex[:12]}"
    monkeypatch.setattr(config, "DB_SCHEMA", schema)
    monkeypatch.setattr(db, "DB_SCHEMA", schema)
    db.init_db()
    yield
    db.drop_schema()


def test_save_and_search_memory(isolated_schema):
    from server.tools.memory import save_memory, search_memory

    save_memory("The MCP server now uses Postgres", tags="ff,mcp")
    save_memory("Unrelated note about groceries", tags="personal")

    results = search_memory("Postgres")
    assert len(results) == 1
    assert "Postgres" in results[0]["content"]


def test_save_and_list_work_log(isolated_schema):
    from server.tools.work_log import save_work_log, list_work_log

    save_work_log("Migrated storage to Postgres", date="2026-09-18")
    entries = list_work_log(date_from="2026-09-01", date_to="2026-09-30")
    assert len(entries) == 1
    assert entries[0]["summary"] == "Migrated storage to Postgres"

    none = list_work_log(date_from="2026-10-01")
    assert none == []


def test_task_lifecycle(isolated_schema):
    from server.tools.tasks import create_task, list_tasks, complete_task

    created = create_task("Deploy the MCP server", due="2026-09-25", priority="high")
    assert created["status"] == "open"

    open_tasks = list_tasks(status="open")
    assert len(open_tasks) == 1

    done = complete_task(created["id"])
    assert done["status"] == "done"

    done_tasks = list_tasks(status="done")
    assert len(done_tasks) == 1

    missing = complete_task(999999)
    assert "error" in missing
