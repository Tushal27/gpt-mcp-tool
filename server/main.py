from .db import init_db
from .mcp_app import mcp


def main() -> None:
    """Local stdio entrypoint, for use with the MCP Inspector or Claude Desktop."""
    init_db()
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
