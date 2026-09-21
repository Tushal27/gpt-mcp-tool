import json
from datetime import datetime, timezone

from openai import OpenAI
from starlette.requests import Request
from starlette.responses import JSONResponse

from .config import AI_API_KEY, AI_API_URL, AI_MODEL
from .tools.memory import save_memory, search_memory
from .tools.tasks import complete_task, create_task, list_tasks
from .tools.work_log import list_work_log, save_work_log


def _system_prompt() -> str:
    # The model has no notion of "now" on its own — without this, relative
    # dates like "next Monday" resolve against its training cutoff instead
    # of the actual current date, producing years-old due dates.
    today = datetime.now(timezone.utc).strftime("%A, %Y-%m-%d")
    return (
        "You are Jarvis, a voice assistant with tools to save/search memories, "
        "log work, and manage tasks. Your replies are spoken aloud via "
        "text-to-speech, so keep them short, conversational, and free of "
        "markdown, bullet points, or code formatting. "
        f"Today's date is {today} (UTC) — resolve relative dates "
        "(\"tomorrow\", \"next Monday\", etc.) against this, and pass "
        "due/date arguments as YYYY-MM-DD."
    )

MAX_TOOL_ITERATIONS = 5

DISPATCH = {
    "save_memory": save_memory,
    "search_memory": search_memory,
    "save_work_log": save_work_log,
    "list_work_log": list_work_log,
    "create_task": create_task,
    "list_tasks": list_tasks,
    "complete_task": complete_task,
}

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "save_memory",
            "description": "Save a piece of content as a general memory, optionally tagged.",
            "parameters": {
                "type": "object",
                "properties": {
                    "content": {"type": "string", "description": "The content to remember."},
                    "tags": {"type": "string", "description": "Optional comma-separated tags."},
                },
                "required": ["content"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_memory",
            "description": "Search saved memories by meaning (semantic search).",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "save_work_log",
            "description": "Save a work log entry, e.g. 'save this as today's work'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "summary": {"type": "string"},
                    "date": {"type": "string", "description": "YYYY-MM-DD, defaults to today."},
                },
                "required": ["summary"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_work_log",
            "description": "List past work log entries, optionally within a date range.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date_from": {"type": "string", "description": "YYYY-MM-DD"},
                    "date_to": {"type": "string", "description": "YYYY-MM-DD"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_task",
            "description": "Create a new open task/todo.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "due": {"type": "string", "description": "YYYY-MM-DD, optional."},
                    "priority": {"type": "string", "description": "e.g. low/normal/high."},
                },
                "required": ["title"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "List tasks, optionally filtered by status.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {"type": "string", "description": "'open' or 'done'."},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark a task as done by its id.",
            "parameters": {
                "type": "object",
                "properties": {"task_id": {"type": "integer"}},
                "required": ["task_id"],
            },
        },
    },
]

# AI_API_URL may itself be a free-tier host that needs to cold-start, on top
# of tool-calling round trips — generous timeout so a slow-but-alive backend
# doesn't get killed prematurely.
_client = OpenAI(api_key=AI_API_KEY, base_url=AI_API_URL, timeout=90.0)


def run_agent_turn(user_text: str) -> str:
    messages = [
        {"role": "system", "content": _system_prompt()},
        {"role": "user", "content": user_text},
    ]

    for _ in range(MAX_TOOL_ITERATIONS):
        response = _client.chat.completions.create(
            model=AI_MODEL, messages=messages, tools=TOOLS, tool_choice="auto"
        )
        message = response.choices[0].message

        if not message.tool_calls:
            return message.content or ""

        messages.append(
            {
                "role": "assistant",
                "content": message.content,
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {"name": tc.function.name, "arguments": tc.function.arguments},
                    }
                    for tc in message.tool_calls
                ],
            }
        )

        for tool_call in message.tool_calls:
            func = DISPATCH.get(tool_call.function.name)
            try:
                args = json.loads(tool_call.function.arguments or "{}")
                result = func(**args) if func else {"error": f"unknown tool {tool_call.function.name}"}
            except Exception as exc:  # malformed args or a tool-level failure — report, don't crash
                result = {"error": str(exc)}

            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result, default=str),
                }
            )

    return "Sorry, that took too many steps — try breaking it into something simpler."


async def voice_command_endpoint(request: Request) -> JSONResponse:
    body = await request.json()
    text = (body.get("text") or "").strip()
    if not text:
        return JSONResponse({"error": "missing 'text'"}, status_code=400)

    try:
        reply = run_agent_turn(text)
    except Exception:
        # Always return 200 with a speakable reply — this is a voice UI, so a
        # raw 500/timeout gives the app nothing sensible to say out loud. The
        # AI backend cold-starting or erroring is the most likely cause.
        reply = "Sorry, I couldn't reach my brain just now — give it a few seconds and try again."

    return JSONResponse({"reply": reply})
