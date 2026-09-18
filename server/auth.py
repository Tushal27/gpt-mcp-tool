from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from .config import MCP_AUTH_TOKEN

# Not "Authorization" (reserved by Claude's connector sign-in/OAuth flow) and
# not an "x-mcp-*" prefix (reserved-looking to connector UIs too) — a plain
# custom header name avoids both restrictions.
AUTH_HEADER_NAME = "x-api-token"


class BearerAuthMiddleware(BaseHTTPMiddleware):
    """Rejects /mcp requests missing a valid X-Api-Token header.

    Only guards /mcp — /dashboard and /tasks/daily-digest are hit by a
    browser or an external cron ping, neither of which can set a custom
    header, so those routes check a ?token= query param themselves instead.

    If MCP_AUTH_TOKEN is unset, auth is skipped entirely — convenient for
    local HTTP testing, but the token MUST be set before deploying anywhere
    public.
    """

    async def dispatch(self, request: Request, call_next):
        if not MCP_AUTH_TOKEN or not request.url.path.startswith("/mcp"):
            return await call_next(request)

        header = request.headers.get(AUTH_HEADER_NAME, "")
        if header != MCP_AUTH_TOKEN:
            return JSONResponse({"error": "unauthorized"}, status_code=401)

        return await call_next(request)


def check_query_token(request: Request) -> Response | None:
    """Shared ?token= check for browser/cron-facing routes. Returns an error
    Response if the token is missing/wrong, or None if the request may proceed."""
    if not MCP_AUTH_TOKEN:
        return None
    if request.query_params.get("token", "") != MCP_AUTH_TOKEN:
        return Response("unauthorized", status_code=401)
    return None
