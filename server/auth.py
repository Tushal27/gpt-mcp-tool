import os

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

# Not "Authorization" (reserved by Claude's connector sign-in/OAuth flow) and
# not an "x-mcp-*" prefix (reserved-looking to connector UIs too) — a plain
# custom header name avoids both restrictions.
AUTH_HEADER_NAME = "x-api-token"


class BearerAuthMiddleware(BaseHTTPMiddleware):
    """Rejects requests missing a valid X-Api-Token header.

    If MCP_AUTH_TOKEN is unset, auth is skipped entirely — convenient for local
    HTTP testing, but the token MUST be set before deploying anywhere public.
    """

    def __init__(self, app):
        super().__init__(app)
        self.expected_token = os.environ.get("MCP_AUTH_TOKEN", "")

    async def dispatch(self, request: Request, call_next):
        if not self.expected_token:
            return await call_next(request)

        header = request.headers.get(AUTH_HEADER_NAME, "")
        if header != self.expected_token:
            return JSONResponse({"error": "unauthorized"}, status_code=401)

        return await call_next(request)
