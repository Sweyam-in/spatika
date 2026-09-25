# Spatika MCP

MCP server for coding agents that need Spatika UI guidance without scraping the docs site by hand.

```json
{
  "mcpServers": {
    "spatika": {
      "command": "npx",
      "args": ["@spatika/mcp"]
    }
  }
}
```

In this repository, run it with:

```bash
npm run mcp:build
npm --silent run mcp
```

The server exposes resources for `llms.txt`, the full agent dump, component JSON, the AGENTS guide,
and the Spatika skill. It also includes tools to search components and fetch a specific component or
guide markdown file.
