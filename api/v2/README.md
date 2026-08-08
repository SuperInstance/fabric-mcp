# Spreadsheet Moment - GraphQL API v2

**Round 18: Modern GraphQL API with Subscriptions, Caching, and Optimization**

A production-ready GraphQL API implementation for Spreadsheet Moment with real-time subscriptions, intelligent caching, query complexity analysis, and DataLoader batching.

---

## Features

- **Type-Safe Schema**: Full GraphQL schema with comprehensive type definitions
- **Real-Time Subscriptions**: WebSocket-based live updates for collaborative editing
- **Query Complexity Analysis**: Automatic complexity scoring to prevent expensive queries
- **DataLoader Batching**: Efficient batch loading to prevent N+1 query problems
- **Intelligent Caching**: Query result caching with configurable TTL
- **Authentication**: JWT-based authentication with middleware
- **Rate Limiting**: Request rate limiting to prevent abuse
- **Error Handling**: Comprehensive error handling and validation

---

## Installation

```bash
# Install dependencies
npm install

# Add required packages
npm install graphql graphql-subscriptions @graphql-tools/schema subscriptions-transport-ws express cors
npm install --save-dev @types/express @types/ws @types/cors
```

---

## Quick Start

### Start the Server

```bash
# Using npm scripts
npm run dev

# Or directly with Node
node dist/api/v2/server.js

# Or with tsx for development
npx tsx src/api/v2/server.ts
```

The server will start on:
- **HTTP**: `http://localhost:4000/graphql`
- **WebSocket**: `ws://localhost:4000/graphql`

### Basic Query

```graphql
query GetViewer {
  viewer {
    id
    email
    name
    spreadsheets {
      id
      name
      createdAt
    }
  }
}
```

---

## API Reference

### Queries

#### `viewer`
Get the currently authenticated user.

```graphql
query GetViewer {
  viewer {
    id
    email
    name
    avatar
  }
}
```

#### `spreadsheet`
Get a specific spreadsheet by ID.

```graphql
query GetSpreadsheet($id: ID!) {
  spreadsheet(id: $id) {
    id
    name
    description
    createdAt
    updatedAt
    owner {
      id
      email
      name
    }
    cells(rows: [1, 2, 3], columns: [1, 2, 3]) {
      id
      row
      column
      value
      formula
      type
      formatted
      style {
        bold
        italic
        underline
        backgroundColor
        color
        fontSize
      }
    }
    collaborators {
      user {
        id
        email
        name
      }
      role
      permissions
      joinedAt
    }
    permissions
  }
}
```

#### `spreadsheets`
List all spreadsheets with pagination.

```graphql
query ListSpreadsheets($first: Int, $after: String, $orderBy: String) {
  spreadsheets(first: $first, after: $after, orderBy: $orderBy) {
    id
    name
    description
    createdAt
  }
}
```

### Mutations

#### `createSpreadsheet`
Create a new spreadsheet.

```graphql
mutation CreateSpreadsheet($name: String!, $description: String) {
  createSpreadsheet(name: $name, description: $description) {
    id
    name
    description
    createdAt
    owner {
      id
      email
    }
  }
}
```

#### `updateSpreadsheet`
Update spreadsheet metadata.

```graphql
mutation UpdateSpreadsheet($id: ID!, $name: String, $description: String) {
  updateSpreadsheet(id: $id, name: $name, description: $description) {
    id
    name
    description
    updatedAt
  }
}
```

#### `deleteSpreadsheet`
Delete a spreadsheet.

```graphql
mutation DeleteSpreadsheet($id: ID!) {
  deleteSpreadsheet(id: $id)
}
```

#### `updateCells`
Update cells in a spreadsheet (triggers subscription).

```graphql
mutation UpdateCells($spreadsheetId: ID!, $cells: [CellInput!]!) {
  updateCells(spreadsheetId: $spreadsheetId, cells: $cells) {
    id
    row
    column
    value
    formula
    type
    style {
      bold
      italic
      fontSize
      backgroundColor
    }
  }
}
```

#### `shareSpreadsheet`
Share a spreadsheet with a user (triggers subscription).

```graphql
mutation ShareSpreadsheet(
  $spreadsheetId: ID!
  $email: String!
  $role: String!
  $permissions: [Permission!]
) {
  shareSpreadsheet(
    spreadsheetId: $spreadsheetId
    email: $email
    role: $role
    permissions: $permissions
  ) {
    id
    name
    collaborators {
      user {
        id
        email
        name
      }
      role
      permissions
      joinedAt
    }
  }
}
```

### Subscriptions

#### `cellsUpdated`
Real-time updates when cells are modified.

```graphql
subscription OnCellsUpdated($spreadsheetId: ID!) {
  cellsUpdated(spreadsheetId: $spreadsheetId) {
    spreadsheetId
    cells {
      id
      row
      column
      value
      formula
      type
      style {
        bold
        italic
        backgroundColor
      }
    }
  }
}
```

#### `collaboratorJoined`
Real-time notifications when collaborators join.

```graphql
subscription OnCollaboratorJoined($spreadsheetId: ID!) {
  collaboratorJoined(spreadsheetId: $spreadsheetId) {
    user {
      id
      email
      name
      avatar
    }
    role
    permissions
    joinedAt
  }
}
```

---

## Authentication

Include the JWT token in the Authorization header:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { viewer { id email } }"}'
```

For WebSocket connections, include the token in connection params:

```javascript
const ws = new WebSocket('ws://localhost:4000/graphql', {
  graphql: true,
  connectionParams: {
    authToken: 'YOUR_JWT_TOKEN'
  }
});
```

---

## Query Complexity

The API automatically analyzes query complexity to prevent expensive queries:

- **spreadsheet**: 10 points
- **spreadsheets**: 20 points
- **cells**: 5 points
- **collaborators**: 3 points
- **updateCells**: 8 points
- **Maximum complexity**: 1000 points

Queries exceeding the limit will be rejected with an error.

---

## Caching

Query results are cached for 1 minute (configurable) to improve performance:

```typescript
import { QueryCache } from './api/v2/GraphQLSchema';

const cache = new QueryCache();
cache.ttl = 120000; // 2 minutes

const key = cache.generateKey(query, variables);
const cached = cache.get(key);
```

---

## DataLoader

DataLoader automatically batches requests to prevent N+1 queries:

```typescript
// Individual calls (batched automatically)
const spreadsheet1 = await loaders.spreadsheet.load('sheet-1');
const spreadsheet2 = await loaders.spreadsheet.load('sheet-2');
// Executes as: SELECT * FROM spreadsheets WHERE id IN ('sheet-1', 'sheet-2')
```

---

## WebSocket Examples

### Using WebSocket API

```javascript
const ws = new WebSocket('ws://localhost:4000/graphql');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'start',
    id: '1',
    payload: {
      query: `
        subscription OnCellsUpdated($spreadsheetId: ID!) {
          cellsUpdated(spreadsheetId: $spreadsheetId) {
            spreadsheetId
            cells {
              id
              row
              column
              value
            }
          }
        }
      `,
      variables: { spreadsheetId: 'sheet-1' }
    }
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
};
```

### Using Apollo Client

```javascript
import { ApolloClient, InMemoryCache, split, HttpLink, WebSocketLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';

const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql' });
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    connectionParams: {
      authToken: 'YOUR_JWT_TOKEN'
    }
  }
});

const splitLink = split(({ query }) => {
  const definition = getMainDefinition(query);
  return (
    definition.kind === 'OperationDefinition' &&
    definition.operation === 'subscription'
  );
}, wsLink, httpLink);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});

// Subscribe to updates
client.subscribe({
  query: gql`
    subscription OnCellsUpdated($spreadsheetId: ID!) {
      cellsUpdated(spreadsheetId: $spreadsheetId) {
        spreadsheetId
        cells {
          id
          row
          column
          value
        }
      }
    }
  `,
  variables: { spreadsheetId: 'sheet-1' }
}).subscribe({
  next: (data) => console.log('Update:', data),
  error: (err) => console.error('Error:', err)
});
```

---

## Architecture

### File Structure

```
api/v2/
├── GraphQLSchema.ts       # GraphQL schema type definitions
├── resolvers.ts           # Query and mutation resolvers
├── subscriptions.ts       # WebSocket subscription handlers
├── context.ts             # GraphQL context builder
├── dataloaders.ts         # DataLoader implementations
├── server.ts              # Apollo Server/Express integration
├── examples.ts            # Usage examples
└── README.md              # This file
```

### Components

1. **GraphQLSchema.ts**: Schema type definitions, complexity analyzer, cache, subscription manager
2. **resolvers.ts**: Query/mutation logic with in-memory database
3. **subscriptions.ts**: Real-time subscription handlers and filtering
4. **context.ts**: Request/context building with authentication
5. **dataloaders.ts**: Batch loading with DataLoader pattern
6. **server.ts**: Express/HTTP server with WebSocket support
7. **examples.ts**: Runnable examples demonstrating API usage

---

## Performance Optimization

### DataLoader Batching

All related queries are batched into single database calls:

```typescript
// Instead of N separate queries:
for (const id of ids) {
  await db.findSpreadsheetById(id); // N queries
}

// DataLoader batches into 1 query:
await loaders.spreadsheet.loadMany(ids); // 1 query
```

### Query Complexity

Complex queries are automatically analyzed and rejected if too expensive:

```typescript
const analyzer = new QueryComplexityAnalyzer();
const analysis = analyzer.analyze(query);

if (!analysis.withinLimit) {
  throw new Error('Query too complex');
}
```

### Caching

Frequently accessed data is cached with TTL:

```typescript
const cache = new QueryCache();
cache.set(key, data);
const cached = cache.get(key);
```

---

## Testing

Run the examples to test the API:

```bash
npx tsx api/v2/examples.ts
```

Or test manually with curl:

```bash
# Health check
curl http://localhost:4000/health

# GraphQL query
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ spreadsheets { id name } }"}'
```

---

## Production Considerations

### Database

Replace the in-memory database with a real database:

```typescript
// In resolvers.ts
import { Pool } from 'pg';

const db = new Pool({ /* connection config */ });

async function findSpreadsheetById(id: string) {
  const result = await db.query('SELECT * FROM spreadsheets WHERE id = $1', [id]);
  return result.rows[0];
}
```

### Authentication

Implement proper JWT verification:

```typescript
import jwt from 'jsonwebtoken';

function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
```

### Environment Variables

Use environment variables for configuration:

```bash
GRAPHQL_PORT=4000
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

---

## License

MIT License - Copyright (c) 2026 SuperInstance Research Team
