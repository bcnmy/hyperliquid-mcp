# Enhanced Hyperliquid MCP Server

This project implements a comprehensive Model Context Protocol (MCP) server in Node.js that allows you to access **ALL** Hyperliquid public APIs. The server exposes 44 different tools covering perpetuals, spot trading, market data, user account information, staking, and more.

## Overview

The enhanced MCP server provides complete access to Hyperliquid's public API through MCP tools that can be accessed from MCP clients like the Claude Desktop app. This integration enables seamless interaction between Claude and comprehensive Hyperliquid data.

## Features

### 🔄 **Perpetuals APIs (9 tools)**
- **get-hyperliquid-positions** - Get user's perpetual positions and margin summary
- **get-perp-dexs** - List all perpetual DEXs
- **get-perp-meta** - Get perpetuals metadata (universe and margin tables)
- **get-perp-asset-contexts** - Get asset contexts (mark price, funding, open interest)
- **get-user-funding** - Get user's funding history
- **get-user-non-funding-ledger** - Get user's non-funding ledger updates
- **get-funding-history** - Get historical funding rates for coins
- **get-predicted-fundings** - Get predicted funding rates across venues
- **get-perps-at-oi-cap** - Get perps at open interest caps
- **get-perp-deploy-auction** - Get perp deploy auction information

### 🪙 **Spot Trading APIs (5 tools)**
- **get-spot-meta** - Get spot metadata (tokens and pairs)
- **get-spot-asset-contexts** - Get spot asset contexts (prices, volume)
- **get-spot-balances** - Get user's spot token balances
- **get-spot-deploy-auction** - Get spot deploy auction information
- **get-token-details** - Get detailed information about specific tokens

### 📊 **Market Data APIs (4 tools)**
- **get-all-mids** - Get mid prices for all coins
- **get-l2-book** - Get L2 order book snapshot
- **get-candle-snapshot** - Get OHLCV candlestick data
- **get-max-builder-fee** - Check builder fee approval status

### 👤 **User Account APIs (11 tools)**
- **get-open-orders** - Get user's open orders
- **get-frontend-open-orders** - Get open orders with frontend info
- **get-user-fills** - Get user's recent fills
- **get-user-fills-by-time** - Get user's fills within time range
- **get-user-rate-limit** - Get user's rate limit status
- **get-order-status** - Get order status by ID
- **get-historical-orders** - Get user's historical orders
- **get-user-twap-slice-fills** - Get user's TWAP slice fills
- **get-subaccounts** - Get user's subaccounts
- **get-user-role** - Get user's role (user/agent/vault/subaccount)
- **get-user-portfolio** - Get user's portfolio performance data

### 🏦 **Vault APIs (2 tools)**
- **get-vault-details** - Get detailed vault information
- **get-user-vault-equities** - Get user's vault deposits

### 🎯 **Referral & Fees APIs (2 tools)**
- **get-user-referral** - Get user's referral information
- **get-user-fees** - Get user's fee structure and history

### 🥩 **Staking APIs (4 tools)**
- **get-user-delegations** - Get user's staking delegations
- **get-user-staking-summary** - Get user's staking summary
- **get-user-staking-history** - Get user's staking history
- **get-user-staking-rewards** - Get user's staking rewards

## Prerequisites

- Node.js (v18 or higher)
- Claude Desktop app
- npm (Node Package Manager)

## Installation & Setup

1. **Clone and install:**
```bash
git clone https://github.com/tomarsachin2271/hyperliquid-mcp.git
cd hyperliquid-mcp
npm install
```

2. **Build the project:**
```bash
npm run build
```

3. **Configure Claude Desktop:**
   - Open Claude Desktop app
   - Go to Claude menu → Settings → Developer → Edit Config
   - Add the following configuration:

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

4. **Restart Claude Desktop**

## Usage Examples

### Basic Position Checking
```
"Can you check my Hyperliquid positions for wallet 0x7f3B192Ab3220940D66236792F3EBDB0e4E74138?"
```

### Market Data Analysis
```
"Show me the current funding rates across all venues and the L2 book for ETH"
```

### Comprehensive Account Analysis
```
"Give me a complete analysis of wallet 0x... including positions, fills, open orders, fees, and staking status"
```

### Spot Trading Information
```
"What are my spot balances and show me the current PURR/USDC market data"
```

### Vault Information
```
"Show me details about vault 0x... and check if I have any deposits there"
```

### Historical Data
```
"Get my funding history for the last 30 days and show my portfolio performance"
```

## API Coverage

This MCP server provides **complete coverage** of all Hyperliquid public APIs:

| Category | Endpoints Covered | Total Available |
|----------|-------------------|-----------------|
| Perpetuals | 9/9 | ✅ 100% |
| Spot | 5/5 | ✅ 100% |
| Market Data | 4/4 | ✅ 100% |
| User Account | 11/11 | ✅ 100% |
| Vault | 2/2 | ✅ 100% |
| Referral & Fees | 2/2 | ✅ 100% |
| Staking | 4/4 | ✅ 100% |

## Rate Limiting

The server respects Hyperliquid's rate limits:
- Info endpoint: 1200 requests per minute
- Weight-based limits for different endpoints
- Automatic error handling for rate limit exceeded

## Error Handling

- Comprehensive error messages for all API failures
- Graceful handling of network issues
- Proper validation of wallet addresses and parameters
- Detailed logging for debugging

## Technical Details

- **Language**: TypeScript/Node.js
- **MCP SDK**: @modelcontextprotocol/sdk v1.8.0
- **Validation**: Zod for schema validation
- **Architecture**: Modular design with reusable HTTP client
- **API Version**: Supports all current Hyperliquid API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License - see LICENSE file for details

## Support

For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/tomarsachin2271/hyperliquid-mcp/issues)
- Check Hyperliquid documentation: [API Docs](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api)

## Changelog

### v2.0.0 (Latest)
- ✨ Added 43 new API endpoints covering all Hyperliquid public APIs
- 🔄 Complete perpetuals API coverage
- 🪙 Full spot trading API support
- 📊 Comprehensive market data access
- 👤 Complete user account management
- 🏦 Vault management capabilities
- 🥩 Staking and delegation tools
- 🎯 Referral and fee management
- 🛠️ Improved error handling and logging
- 📚 Enhanced documentation

### v1.0.0
- ⚡ Initial release with basic position checking 