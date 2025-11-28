---
allowed-tools: "Bash(cd app && npm run dev -- --host), KillShell(*)"
allowed-mcp-servers: ["playwright (mcp__playwright__)"]
description: "Start dev server, test UI, stop server"
---

Start dev server, verify UI loads, stop server:

1. `cd app && npm run dev -- --host` (background)
2. Wait for "ready" in output
3. Navigate to http://localhost:3000 with Playwright MCP
4. Screenshot as `ui-test.png`
5. Kill server
6. Show screenshot
