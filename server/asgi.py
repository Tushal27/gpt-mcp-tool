"""HTTP entrypoint for remote deployment (Render, etc).

Run with: uvicorn server.asgi:app --host 0.0.0.0 --port $PORT
"""

from .auth import BearerAuthMiddleware
from .db import init_db
from .mcp_app import mcp

init_db()

app = mcp.streamable_http_app(stateless_http=True)
app.add_middleware(BearerAuthMiddleware)
