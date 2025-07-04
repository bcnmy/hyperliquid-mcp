import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import 'dotenv/config';

const server = new McpServer({
    name: "hyperliquid-mcp",
    version: "2.0.0",
    capabilities: {
        resources: {},
        tools: {}
    }
});

const API_BASE_URL = 'https://api.hyperliquid.xyz';

// Common response handler
async function makeHyperliquidRequest(endpoint: string, body: any) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error making request to ${endpoint}:`, error);
        throw error;
    }
}

// ==================== PERPETUALS ENDPOINTS ====================

// Existing: User's perpetuals account summary (positions, margin, etc.)
server.tool("get-hyperliquid-positions", {
    walletAddress: z.string().describe("The EVM wallet address of the user"),
    dex: z.string().optional().describe("Perp dex name. Defaults to empty string (first perp dex)")
}, async ({ walletAddress, dex }: { walletAddress: string; dex?: string }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'clearinghouseState',
            user: walletAddress,
            ...(dex && { dex })
        });
        
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
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching user positions: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get all perpetual dexs
server.tool("get-perp-dexs", {}, async () => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'perpDexs'
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching perpetual dexs: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get perpetuals metadata (universe and margin tables)
server.tool("get-perp-meta", {
    dex: z.string().optional().describe("Perp dex name. Defaults to empty string (first perp dex)")
}, async ({ dex }: { dex?: string }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'meta',
            ...(dex && { dex })
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching perpetuals metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get perpetuals asset contexts (mark price, funding, open interest, etc.)
server.tool("get-perp-asset-contexts", {}, async () => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'metaAndAssetCtxs'
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching perpetuals asset contexts: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get user's funding history
server.tool("get-user-funding", {
    walletAddress: z.string().describe("The EVM wallet address of the user"),
    startTime: z.number().describe("Start time in milliseconds, inclusive"),
    endTime: z.number().optional().describe("End time in milliseconds, inclusive")
}, async ({ walletAddress, startTime, endTime }: { walletAddress: string; startTime: number; endTime?: number }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'userFunding',
            user: walletAddress,
            startTime,
            ...(endTime && { endTime })
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching user funding: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get user's non-funding ledger updates
server.tool("get-user-non-funding-ledger", {
    walletAddress: z.string().describe("The EVM wallet address of the user"),
    startTime: z.number().describe("Start time in milliseconds, inclusive"),
    endTime: z.number().optional().describe("End time in milliseconds, inclusive")
}, async ({ walletAddress, startTime, endTime }: { walletAddress: string; startTime: number; endTime?: number }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'userNonFundingLedgerUpdates',
            user: walletAddress,
            startTime,
            ...(endTime && { endTime })
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching user non-funding ledger updates: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get historical funding rates
server.tool("get-funding-history", {
    coin: z.string().describe("Coin symbol (e.g., 'ETH')"),
    startTime: z.number().describe("Start time in milliseconds, inclusive"),
    endTime: z.number().optional().describe("End time in milliseconds, inclusive")
}, async ({ coin, startTime, endTime }: { coin: string; startTime: number; endTime?: number }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'fundingHistory',
            coin,
            startTime,
            ...(endTime && { endTime })
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching funding history: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get predicted funding rates for different venues
server.tool("get-predicted-fundings", {}, async () => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'predictedFundings'
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching predicted fundings: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Query perps at open interest caps
server.tool("get-perps-at-oi-cap", {}, async () => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'perpsAtOpenInterestCap'
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching perps at open interest cap: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get information about the Perp Deploy Auction
server.tool("get-perp-deploy-auction", {}, async () => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'perpDeployAuctionStatus'
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching perp deploy auction status: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// ==================== SPOT ENDPOINTS ====================

// Get spot metadata
server.tool("get-spot-meta", {}, async () => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'spotMeta'
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching spot metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get spot asset contexts
server.tool("get-spot-asset-contexts", {}, async () => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'spotMetaAndAssetCtxs'
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching spot asset contexts: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get user's spot token balances
server.tool("get-spot-balances", {
    walletAddress: z.string().describe("The EVM wallet address of the user")
}, async ({ walletAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'spotClearinghouseState',
            user: walletAddress
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching spot balances: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get information about the Spot Deploy Auction
server.tool("get-spot-deploy-auction", {
    walletAddress: z.string().describe("The EVM wallet address of the user")
}, async ({ walletAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'spotDeployState',
            user: walletAddress
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching spot deploy auction: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get information about a token
server.tool("get-token-details", {
    tokenId: z.string().describe("Token ID in 34-character hexadecimal format")
}, async ({ tokenId }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'tokenDetails',
            tokenId
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching token details: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// ==================== GENERAL ENDPOINTS ====================

// Get mids for all coins
server.tool("get-all-mids", {
    dex: z.string().optional().describe("Perp dex name. Defaults to empty string (first perp dex)")
}, async ({ dex }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'allMids',
            ...(dex && { dex })
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching all mids: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get user's open orders
server.tool("get-open-orders", {
    walletAddress: z.string().describe("The EVM wallet address of the user"),
    dex: z.string().optional().describe("Perp dex name. Defaults to empty string (first perp dex)")
}, async ({ walletAddress, dex }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'openOrders',
            user: walletAddress,
            ...(dex && { dex })
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching open orders: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get user's open orders with additional frontend info
server.tool("get-frontend-open-orders", {
    walletAddress: z.string().describe("The EVM wallet address of the user"),
    dex: z.string().optional().describe("Perp dex name. Defaults to empty string (first perp dex)")
}, async ({ walletAddress, dex }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'frontendOpenOrders',
            user: walletAddress,
            ...(dex && { dex })
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching frontend open orders: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get user's fills
server.tool("get-user-fills", {
    walletAddress: z.string().describe("The EVM wallet address of the user"),
    aggregateByTime: z.boolean().optional().describe("Whether to aggregate partial fills by time")
}, async ({ walletAddress, aggregateByTime }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'userFills',
            user: walletAddress,
            ...(aggregateByTime !== undefined && { aggregateByTime })
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching user fills: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get user's fills by time
server.tool("get-user-fills-by-time", {
    walletAddress: z.string().describe("The EVM wallet address of the user"),
    startTime: z.number().describe("Start time in milliseconds, inclusive"),
    endTime: z.number().optional().describe("End time in milliseconds, inclusive"),
    aggregateByTime: z.boolean().optional().describe("Whether to aggregate partial fills by time")
}, async ({ walletAddress, startTime, endTime, aggregateByTime }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'userFillsByTime',
            user: walletAddress,
            startTime,
            ...(endTime && { endTime }),
            ...(aggregateByTime !== undefined && { aggregateByTime })
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching user fills by time: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Query user rate limits
server.tool("get-user-rate-limit", {
    walletAddress: z.string().describe("The EVM wallet address of the user")
}, async ({ walletAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'userRateLimit',
            user: walletAddress
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching user rate limit: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Query order status by oid or cloid
server.tool("get-order-status", {
    walletAddress: z.string().describe("The EVM wallet address of the user"),
    oid: z.union([z.number(), z.string()]).describe("Order ID (number) or Client Order ID (16-byte hex string)")
}, async ({ walletAddress, oid }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'orderStatus',
            user: walletAddress,
            oid
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching order status: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// L2 book snapshot
server.tool("get-l2-book", {
    coin: z.string().describe("Coin symbol"),
    nSigFigs: z.number().optional().describe("Number of significant figures (2, 3, 4, 5, or null for full precision)"),
    mantissa: z.number().optional().describe("Mantissa (1, 2, or 5) - only allowed if nSigFigs is 5")
}, async ({ coin, nSigFigs, mantissa }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'l2Book',
            coin,
            ...(nSigFigs !== undefined && { nSigFigs }),
            ...(mantissa !== undefined && { mantissa })
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching L2 book: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Candle snapshot
server.tool("get-candle-snapshot", {
    coin: z.string().describe("Coin symbol"),
    interval: z.enum(["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "8h", "12h", "1d", "3d", "1w", "1M"]).describe("Candle interval"),
    startTime: z.number().describe("Start time in milliseconds"),
    endTime: z.number().describe("End time in milliseconds")
}, async ({ coin, interval, startTime, endTime }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'candleSnapshot',
            req: {
                coin,
                interval,
                startTime,
                endTime
            }
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching candle snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Check builder fee approval
server.tool("get-max-builder-fee", {
    walletAddress: z.string().describe("The EVM wallet address of the user"),
    builderAddress: z.string().describe("Builder address in 42-character hexadecimal format")
}, async ({ walletAddress, builderAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'maxBuilderFee',
            user: walletAddress,
            builder: builderAddress
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching max builder fee: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get user's historical orders
server.tool("get-historical-orders", {
    walletAddress: z.string().describe("The EVM wallet address of the user")
}, async ({ walletAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'historicalOrders',
            user: walletAddress
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching historical orders: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get user's TWAP slice fills
server.tool("get-user-twap-slice-fills", {
    walletAddress: z.string().describe("The EVM wallet address of the user")
}, async ({ walletAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'userTwapSliceFills',
            user: walletAddress
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching user TWAP slice fills: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get user's subaccounts
server.tool("get-subaccounts", {
    walletAddress: z.string().describe("The EVM wallet address of the user")
}, async ({ walletAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'subAccounts',
            user: walletAddress
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching subaccounts: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get vault details
server.tool("get-vault-details", {
    vaultAddress: z.string().describe("Vault address in 42-character hexadecimal format"),
    walletAddress: z.string().optional().describe("User address in 42-character hexadecimal format")
}, async ({ vaultAddress, walletAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'vaultDetails',
            vaultAddress,
            ...(walletAddress && { user: walletAddress })
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching vault details: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Get user's vault deposits
server.tool("get-user-vault-equities", {
    walletAddress: z.string().describe("The EVM wallet address of the user")
}, async ({ walletAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'userVaultEquities',
            user: walletAddress
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching user vault equities: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Query user's role
server.tool("get-user-role", {
    walletAddress: z.string().describe("The EVM wallet address of the user")
}, async ({ walletAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'userRole',
            user: walletAddress
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching user role: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Query user's portfolio
server.tool("get-user-portfolio", {
    walletAddress: z.string().describe("The EVM wallet address of the user")
}, async ({ walletAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'portfolio',
            user: walletAddress
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching user portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Query user's referral information
server.tool("get-user-referral", {
    walletAddress: z.string().describe("The EVM wallet address of the user")
}, async ({ walletAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'referral',
            user: walletAddress
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching user referral: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Query user's fees
server.tool("get-user-fees", {
    walletAddress: z.string().describe("The EVM wallet address of the user")
}, async ({ walletAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'userFees',
            user: walletAddress
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching user fees: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Query user's staking delegations
server.tool("get-user-delegations", {
    walletAddress: z.string().describe("The EVM wallet address of the user")
}, async ({ walletAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'delegations',
            user: walletAddress
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching user delegations: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Query user's staking summary
server.tool("get-user-staking-summary", {
    walletAddress: z.string().describe("The EVM wallet address of the user")
}, async ({ walletAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'delegatorSummary',
            user: walletAddress
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching user staking summary: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Query user's staking history
server.tool("get-user-staking-history", {
    walletAddress: z.string().describe("The EVM wallet address of the user")
}, async ({ walletAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'delegatorHistory',
            user: walletAddress
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching user staking history: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

// Query user's staking rewards
server.tool("get-user-staking-rewards", {
    walletAddress: z.string().describe("The EVM wallet address of the user")
}, async ({ walletAddress }) => {
    try {
        const data = await makeHyperliquidRequest('info', {
            type: 'delegatorRewards',
            user: walletAddress
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(data, null, 2)
            }]
        };
    } catch (error) {
        console.error(error);
        return {
            content: [{
                type: "text",
                text: `Error fetching user staking rewards: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        };
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.log("Enhanced Hyperliquid MCP server started with all public APIs");  
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});