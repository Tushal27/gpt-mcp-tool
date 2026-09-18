"""HTTP entrypoint for remote deployment (Render, etc).

Run with: uvicorn server.asgi:app --host 0.0.0.0 --port $PORT
"""

import os

from mcp.server.transport_security import TransportSecuritySettings

from .auth import BearerAuthMiddleware
from .db import init_db
from .mcp_app import mcp

init_db()

# The MCP SDK auto-allowlists only localhost Host headers; anything else
# (e.g. Render's onrender.com hostname) is rejected with 421 unless listed
# here explicitly. RENDER_EXTERNAL_HOSTNAME is set automatically by Render.
allowed_hosts = ["127.0.0.1:*", "localhost:*"]
render_host = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
if render_host:
    allowed_hosts.append(render_host)
extra_host = os.environ.get("MCP_ALLOWED_HOST")
if extra_host:
    allowed_hosts.append(extra_host)

app = mcp.streamable_http_app(
    stateless_http=True,
    transport_security=TransportSecuritySettings(
        enable_dns_rebinding_protection=True,
        allowed_hosts=allowed_hosts,
    ),
)
app.add_middleware(BearerAuthMiddleware)
