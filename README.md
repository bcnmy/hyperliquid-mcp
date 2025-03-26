# Hyperliquid MCP Server

This project implements a Model Context Protocol (MCP) server in Node.js that allows you to query your Hyperliquid open positions. The server exposes a tool that can be accessed from MCP clients like the Claude Desktop app.

## Overview

The MCP server provides a tool named `get-hyperliquid-positions` that allows Claude to fetch unrealized PnL and position information for any Hyperliquid wallet address. This integration enables seamless interaction between Claude and your Hyperliquid trading data.

## Prerequisites

- Node.js installed on your system
- Claude Desktop app
- npm (Node Package Manager)

## Building the Project

1. Clone this repository:
```bash
git clone https://github.com/tomarsachin2271/hyperliquid-mcp.git
cd hyperliquid-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```
This will generate the `dist/index.js` file that will be used by the MCP server.

## Configuring Claude Desktop

1. Open Claude Desktop app
2. Go to Claude menu → Settings → Developer → Edit Config
3. This will open your config file in Finder (on macOS)
4. Add the following configuration to the file:

```json
{
    "mcpServers": {
        "hyperliquid": {
            "command": "node",
            "args": [
                "/path/to/your/hyperliquid-mcp/dist/index.js"
            ]
        }
    }
}
```

Replace `/path/to/your` with the actual path to your project directory.

4. Save the config file
5. Restart the Claude Desktop app

## Using the Tool

After configuration:

1. You'll see a hammer icon in the bottom right section of the chat input box
2. The MCP tool will be listed as "get-hyperliquid-positions"
3. You can ask Claude questions like:
   ```
   "Can you tell me unrealised pnl for my position on hyperliquid for 0x7f3B192Ab3220940D66236792F3EBDB0e4E74138"
   ```
4. Claude will identify the appropriate tool and ask for your confirmation
5. Click "Allow" to execute the query
6. Claude will display the results of your query

## Example Usage

1. Ask Claude about your positions
2. Claude identifies the tool needed
3. Approve the tool usage
4. Get your position information directly in the chat

This seamless integration allows you to quickly access your Hyperliquid trading information through natural conversation with Claude. 