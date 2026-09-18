import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import server.config as config  # noqa: E402


def _use_temp_db(tmp_path, monkeypatch):
    db_file = tmp_path / "test.sqlite3"
    monkeypatch.setattr(config, "DB_PATH", str(db_file))
    import server.db as db

    monkeypatch.setattr(db, "DB_PATH", str(db_file))
    db.init_db()


def test_save_and_search_memory(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    from server.tools.memory import save_memory, search_memory

    save_memory("The MCP server uses SQLite locally", tags="ff,mcp")
    save_memory("Unrelated note about groceries", tags="personal")

    results = search_memory("MCP")
    assert len(results) == 1
    assert "SQLite" in results[0]["content"]


def test_save_and_list_work_log(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    from server.tools.work_log import save_work_log, list_work_log

    save_work_log("Built the memory tool", date="2026-09-18")
    entries = list_work_log(date_from="2026-09-01", date_to="2026-09-30")
    assert len(entries) == 1
    assert entries[0]["summary"] == "Built the memory tool"

    none = list_work_log(date_from="2026-10-01")
    assert none == []


def test_task_lifecycle(tmp_path, monkeypatch):
    _use_temp_db(tmp_path, monkeypatch)
    from server.tools.tasks import create_task, list_tasks, complete_task

    created = create_task("Deploy the MCP server", due="2026-09-25", priority="high")
    assert created["status"] == "open"

    open_tasks = list_tasks(status="open")
    assert len(open_tasks) == 1

    done = complete_task(created["id"])
    assert done["status"] == "done"

    done_tasks = list_tasks(status="done")
    assert len(done_tasks) == 1

    missing = complete_task(9999)
    assert "error" in missing
