from mcp.server.mcpserver import MCPServer

from .tools.memory import save_memory, search_memory
from .tools.work_log import save_work_log, list_work_log
from .tools.tasks import create_task, list_tasks, complete_task

mcp = MCPServer(
    name="ff-memory",
    instructions=(
        "Personal memory, work log, and task tools. Use save_memory for general "
        "notes/facts, save_work_log when the user says things like 'save this as "
        "today's work', and the task tools for planning/todos."
    ),
)

mcp.tool()(save_memory)
mcp.tool()(search_memory)
mcp.tool()(save_work_log)
mcp.tool()(list_work_log)
mcp.tool()(create_task)
mcp.tool()(list_tasks)
mcp.tool()(complete_task)
