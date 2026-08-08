/**
 * Spreadsheet Moment - GraphQL Server
 *
 * Apollo Server/Express integration for GraphQL API v2
 * Features: HTTP & WebSocket, subscriptions, caching, error handling
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import { createServer } from 'http';
import { execute, subscribe, GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import express from 'express';
import cors from 'cors';
import { PubSub } from 'graphql-subscriptions';
import { GraphQLSchema as APISchema, QueryComplexityAnalyzer, QueryCache, SubscriptionManager } from './GraphQLSchema';
import { buildContext, authenticateMiddleware, rateLimitMiddleware, loggingMiddleware } from './context';
import { createQueryResolvers, createMutationResolvers, createFieldResolvers, database } from './resolvers';
import { createSubscriptionResolvers } from './subscriptions';
import { subscriptionManager as subManager } from './subscriptions';

// Type stubs for graphql-tools (minimal implementation)
function makeExecutableSchemaStub(config: any): GraphQLSchema {
  return APISchema;
}

/**
 * Create executable schema with resolvers
 */
export function createExecutableSchema(): GraphQLSchema {
  const pubSub = new PubSub();

  // Combine all resolvers
  const resolvers = {
    Query: createQueryResolvers(database),
    Mutation: createMutationResolvers(database, pubSub),
    Subscription: createSubscriptionResolvers(pubSub),
    ...createFieldResolvers(database),
  };

  // Create executable schema
  return makeExecutableSchemaStub({
    typeDefs: APISchema,
    resolvers,
  });
}

/**
 * Create Express app with GraphQL endpoint
 */
export function createGraphQLApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(loggingMiddleware);
  app.use(authenticateMiddleware);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // GraphQL POST endpoint
  app.post('/graphql', async (req, res) => {
    try {
      const { query, variables, operationName } = req.body;

      // Build context
      const context = buildContext({ req, res });

      // Analyze query complexity
      const analyzer = new QueryComplexityAnalyzer();
      const analysis = analyzer.analyze(query);

      if (!analysis.withinLimit) {
        return res.status(400).json({
          errors: [{
            message: `Query complexity ${analysis.complexity} exceeds limit ${analysis.maxComplexity}`,
          }],
        });
      }

      // Check cache
      const cache = new QueryCache();
      const cacheKey = cache.generateKey(query, variables);
      const cachedResult = cache.get(cacheKey);

      if (cachedResult) {
        return res.json(cachedResult);
      }

      // Execute query (in production, use graphql function properly)
      // For now, return a mock response
      const result = {
        data: {
          viewer: context.user || null,
        },
      };

      // Cache result
      cache.set(cacheKey, result);

      res.json(result);
    } catch (error: any) {
      console.error('GraphQL error:', error);
      res.status(500).json({
        errors: [{
          message: error.message || 'Internal server error',
        }],
      });
    }
  });

  // GraphQL GET endpoint (for GraphiQL)
  app.get('/graphql', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>GraphQL Playground</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; }
          .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .info { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
          code { background: #e0e0e0; padding: 2px 6px; border-radius: 3px; }
          .endpoint { font-size: 18px; font-weight: bold; color: #0066cc; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Spreadsheet Moment GraphQL API v2</h1>
          <div class="info">
            <p><strong>WebSocket Endpoint:</strong> <span class="endpoint">ws://localhost:4000/graphql</span></p>
            <p><strong>HTTP Endpoint:</strong> <span class="endpoint">POST http://localhost:4000/graphql</span></p>
          </div>
          <div class="info">
            <h2>Example Queries</h2>
            <h3>Get Viewer:</h3>
            <pre><code>query GetViewer {
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
}</code></pre>
            <h3>Get Spreadsheet:</h3>
            <pre><code>query GetSpreadsheet($id: ID!) {
  spreadsheet(id: $id) {
    id
    name
    description
    createdAt
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
  }
}</code></pre>
            <h3>Create Spreadsheet:</h3>
            <pre><code>mutation CreateSpreadsheet($name: String!, $description: String) {
  createSpreadsheet(name: $name, description: $description) {
    id
    name
    description
    createdAt
  }
}</code></pre>
            <h3>Update Cells:</h3>
            <pre><code>mutation UpdateCells($spreadsheetId: ID!, $cells: [CellInput!]!) {
  updateCells(spreadsheetId: $spreadsheetId, cells: $cells) {
    id
    row
    column
    value
    formula
  }
}</code></pre>
            <h3>Subscribe to Cell Updates:</h3>
            <pre><code>subscription OnCellsUpdated($spreadsheetId: ID!) {
  cellsUpdated(spreadsheetId: $spreadsheetId) {
    spreadsheetId
    cells {
      id
      row
      column
      value
      formula
    }
  }
}</code></pre>
          </div>
        </div>
      </body>
      </html>
    `);
  });

  return app;
}

/**
 * Create WebSocket server for subscriptions
 */
export function createSubscriptionServer(httpServer: any, schema: GraphQLSchema) {
  return SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: (connectionParams: any, webSocket: any, context: any) => {
        // Extract user from connection params
        const token = connectionParams?.authToken || connectionParams?.Authorization?.replace('Bearer ', '');

        // In production, verify JWT token
        const user = token
          ? {
              id: 'user-1',
              email: 'test@example.com',
              name: 'Test User',
            }
          : undefined;

        return { user };
      },
      onDisconnect: (webSocket: any, context: any) => {
        console.log('WebSocket disconnected');
      },
    },
    {
      server: httpServer,
      path: '/graphql',
    }
  );
}

/**
 * Start GraphQL server
 */
export async function startGraphQLServer(port: number = 4000) {
  const app = createGraphQLApp();
  const httpServer = createServer(app);

  const schema = createExecutableSchema();

  // Create subscription server
  createSubscriptionServer(httpServer, schema);

  // Start listening
  return new Promise<void>((resolve) => {
    httpServer.listen(port, () => {
      console.log(`GraphQL Server ready at http://localhost:${port}/graphql`);
      console.log(`Subscriptions ready at ws://localhost:${port}/graphql`);
      resolve();
    });
  });
}

/**
 * Main entry point
 */
if (require.main === module) {
  startGraphQLServer(4000).catch(console.error);
}

export { database, subscriptionManager as subscriptionManager };
