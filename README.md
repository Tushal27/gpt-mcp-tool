# ff — personal memory / work-log / planning MCP server

A remote MCP (Model Context Protocol) tool server that ChatGPT (or Claude) can
call directly during a conversation to save memories, log work, and manage
tasks — instead of those just being replies that vanish.

## Status

Tools run against a local SQLite database. Both transports are wired up:
stdio (for local Inspector testing) and streamable HTTP (for real remote use,
e.g. from ChatGPT). SQLite is fine for now — it resets on redeploy since
Render's free disk is ephemeral, so treat early tests as disposable until
Postgres is wired up (planned, not done yet).

## Setup

```
py -3 -m venv .venv
./.venv/Scripts/python.exe -m pip install -r requirements.txt
```

## Run tests

```
./.venv/Scripts/python.exe -m pytest tests/ -v
```

## Run the server locally (stdio)

```
./.venv/Scripts/python.exe -m server.main
```

## Inspect it with the MCP Inspector

```
npx @modelcontextprotocol/inspector ./.venv/Scripts/python.exe -m server.main
```

This opens a browser UI where you can list and call each tool manually to
verify behavior before wiring anything remote.

## Run the server over HTTP (for remote/ChatGPT use)

```
MCP_AUTH_TOKEN=your-own-secret ./.venv/Scripts/python.exe -m uvicorn server.asgi:app --host 0.0.0.0 --port 8765
```

The MCP endpoint is `POST /mcp`, protected by `Authorization: Bearer <MCP_AUTH_TOKEN>`.
If `MCP_AUTH_TOKEN` is unset, auth is skipped — convenient for a quick local
check, but **always set it before deploying anywhere public**.

## Deploy to Render

1. Push this repo to GitHub, create a new Render Web Service from it — `render.yaml`
   already defines the build/start commands (`uvicorn server.asgi:app --host 0.0.0.0 --port $PORT`).
2. In Render's dashboard, set the `MCP_AUTH_TOKEN` env var to a long random
   secret (it's marked `sync: false` in `render.yaml` so Render will prompt for it).
3. Once deployed, your MCP endpoint is `https://<your-render-app>.onrender.com/mcp`.

## Connect it to ChatGPT

1. In ChatGPT, go to Settings → Connectors (may require enabling Developer
   Mode / a custom connector option, depending on your plan/tier — check this
   first, since not all ChatGPT plans expose custom MCP connectors).
2. Add a custom connector pointing at `https://<your-render-app>.onrender.com/mcp`,
   with the same bearer token you set in `MCP_AUTH_TOKEN`.
3. In a chat, try: "save this as today's work: scaffolded the ff MCP server" —
   it should call `save_work_log`. Then try "what's on my task list" or
   "remember that ..." to exercise the other tools.
4. If your ChatGPT plan doesn't support custom MCP connectors at all, the
   fallback is wrapping these same tool functions in an OpenAPI spec and
   using them as a Custom GPT Action instead — the tool logic in `server/tools/`
   doesn't need to change for that.

## Tools (v1)

- `save_memory(content, tags?)`
- `search_memory(query)`
- `save_work_log(summary, date?)`
- `list_work_log(date_from?, date_to?)`
- `create_task(title, due?, priority?)`
- `list_tasks(status?)`
- `complete_task(task_id)`

## Roadmap

See `C:\Users\ADMIN\.claude\plans\indexed-stargazing-perlis.md` for the full
phased plan (Week 2: Postgres + remote HTTP + auth + Render deploy. Week 3:
wire into ChatGPT as a connector, or fall back to a Custom GPT Action if the
account tier doesn't support MCP connectors).
