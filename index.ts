import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import 'dotenv/config';


const server = new McpServer({
    name: "hyperliquid-mcp",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {}
    }
});

server.tool("get-hyperliquid-positions", {
    walletAddress: z.string().describe("The EVM wallet address of the user"),
},
    async ({walletAddress}) => {
        try {
            const response = await fetch('https://api.hyperliquid.xyz/info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'clearinghouseState',
                    user: walletAddress
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Extract positions and unrealized PnL information
            const positions = data.assetPositions.map((pos: any) => ({
                coin: pos.position.coin,
                size: pos.position.szi,
                entryPrice: pos.position.entryPx,
                unrealizedPnl: pos.position.unrealizedPnl,
                leverage: pos.position.leverage.value,
                liquidationPrice: pos.position.liquidationPx,
                returnOnEquity: pos.position.returnOnEquity
            }));

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        positions,
                        accountValue: data.marginSummary.accountValue,
                        totalMarginUsed: data.marginSummary.totalMarginUsed,
                        withdrawable: data.withdrawable
                    }, null, 2)
                }]
            }
        } catch (error) {
            console.error(error);
            return {
                content: [{
                    type: "text",
                    text: "Error fetching user summary"
                }]
            }
        }
    }
)

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.log("Hyperliquid MCP server started");  
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });