# GraphQL API v2 - Quick Start Guide

Get the Spreadsheet Moment GraphQL API v2 up and running in minutes.

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

```bash
# Navigate to the API v2 directory
cd api/v2

# Install dependencies
npm install

# Or if using the main polln package
npm install graphql graphql-subscriptions @graphql-tools/schema subscriptions-transport-ws express cors uuid
```

## Start the Server

```bash
# Development mode with hot reload
npm run dev

# Or run directly with tsx
npx tsx server.ts

# Or build and run
npm run build
npm start
```

The server will start at:
- **HTTP**: http://localhost:4000/graphql
- **WebSocket**: ws://localhost:4000/graphql

## Test the API

### 1. Health Check

```bash
curl http://localhost:4000/health
```

### 2. Simple Query

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ viewer { id email name } }"}'
```

### 3. Create a Spreadsheet

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-token" \
  -d '{
    "query": "mutation CreateSpreadsheet($name: String!) { createSpreadsheet(name: $name) { id name } }",
    "variables": { "name": "My Spreadsheet" }
  }'
```

### 4. Run Examples

```bash
npx tsx examples.ts
```

## Key Features

- **Queries**: Fetch spreadsheets, cells, collaborators
- **Mutations**: Create, update, delete spreadsheets and cells
- **Subscriptions**: Real-time updates via WebSocket
- **DataLoader**: Automatic batching to prevent N+1 queries
- **Query Complexity**: Automatic analysis to prevent expensive queries
- **Caching**: Built-in caching layer for improved performance

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check out [examples.ts](./examples.ts) for usage examples
- Explore the [schema](./GraphQLSchema.ts) for type definitions

## Troubleshooting

**Port already in use?**
```bash
# Change port in server.ts or set environment variable
PORT=3000 npm start
```

**Module not found?**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors?**
```bash
# Regenerate type definitions
npm run build
```

## Support

For issues and questions:
- GitHub: https://github.com/SuperInstance/polln
- Documentation: See README.md
