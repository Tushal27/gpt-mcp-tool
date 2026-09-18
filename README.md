# ff — personal memory / work-log / planning MCP server

A remote MCP (Model Context Protocol) tool server that ChatGPT (or Claude) can
call directly during a conversation to save memories, log work, and manage
tasks — instead of those just being replies that vanish.

## Status

Live and connected to Claude. Storage is Postgres (Supabase), so data
survives Render restarts/redeploys. Both transports are wired up: stdio (for
local Inspector testing) and streamable HTTP (for real remote use).

## Setup

```
py -3 -m venv .venv
./.venv/Scripts/python.exe -m pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in `DATABASE_URL` (a Supabase Postgres
connection string — the "Connection pooling" URI, Transaction mode, port
6543, matches this app's connect-per-request pattern). Everything here
(local dev, tests, and prod) talks to the same Postgres instance.

## Run tests

```
./.venv/Scripts/python.exe -m pytest tests/ -v
```

Each test runs in its own throwaway Postgres schema (created and dropped
automatically) so nothing touches real data — but this means tests need a
reachable `DATABASE_URL` set in the environment.

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

The MCP endpoint is `POST /mcp`, protected by an `X-Api-Token: <MCP_AUTH_TOKEN>`
header (deliberately not `Authorization`, and not an `x-mcp-*` prefix either —
both looked reserved to Claude's connector UI and it refused to let those be
set manually). If `MCP_AUTH_TOKEN` is unset, auth is skipped — convenient for
a quick local check, but **always set it before deploying anywhere public**.

## Deploy to Render

1. Push this repo to GitHub, create a new Render Web Service from it — `render.yaml`
   already defines the build/start commands (`uvicorn server.asgi:app --host 0.0.0.0 --port $PORT`).
2. In Render's dashboard, set `MCP_AUTH_TOKEN` (a long random secret) and
   `DATABASE_URL` (your Supabase connection string) — both marked `sync: false`
   in `render.yaml` so Render will prompt for them.
3. Once deployed, your MCP endpoint is `https://<your-render-app>.onrender.com/mcp`.

## Connect it to Claude or ChatGPT

Custom remote MCP connectors require ChatGPT Pro/Business (not available on
lower tiers) — Claude Pro supports them too, without that tier restriction.

1. Settings → Connectors → Add custom connector.
2. URL: `https://<your-render-app>.onrender.com/mcp`.
3. Auth: add a custom header (not "Authorization" — see note above) named
   `X-Api-Token` with the value you set as `MCP_AUTH_TOKEN`.
4. In a chat, try: "save this as today's work: scaffolded the ff MCP server" —
   it should call `save_work_log`. Then try "what's on my task list" or
   "remember that ..." to exercise the other tools.

## Tools (v1)

- `save_memory(content, tags?)` — embeds the content via Voyage AI and stores it for semantic search
- `search_memory(query)` — semantic search (pgvector cosine similarity), not substring match
- `save_work_log(summary, date?)`
- `list_work_log(date_from?, date_to?)`
- `create_task(title, due?, priority?)`
- `list_tasks(status?)`
- `complete_task(task_id)`

## Web dashboard

`GET /dashboard?token=<MCP_AUTH_TOKEN>` — a read-only page showing recent
memories, work log, and open tasks. Bookmark it with the token in the URL.

## Daily digest email

`GET /tasks/daily-digest?token=<MCP_AUTH_TOKEN>` — sends an email (via Resend)
summarizing work log entries since yesterday and all open tasks. Wire up a
free external cron (e.g. cron-job.org) to hit this URL once a day; Render's
free tier will cold-start on the ping if it was idle.

Requires `VOYAGE_API_KEY`, `RESEND_API_KEY`, and `DIGEST_EMAIL_TO` (see
`.env.example`) — set these in Render's dashboard too when deploying.

## Roadmap

See `C:\Users\ADMIN\.claude\plans\indexed-stargazing-perlis.md`. Possible
next steps discussed but not yet started: a voice ("Jarvis"-style) interface
via Siri Shortcuts/Google Assistant routines hitting a new endpoint backed by
the Claude API directly; GitHub commit auto-logging (deferred, not needed
right now).
