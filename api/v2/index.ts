/**
 * Spreadsheet Moment - GraphQL API v2
 *
 * Main entry point for the GraphQL API
 * Exports all components for easy importing
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

// Re-export schema components
export {
  schema,
  QueryComplexityAnalyzer,
  QueryCache,
  SubscriptionManager,
  DataLoaderConfig,
  buildContext,
  APIv2,
} from './GraphQLSchema.js';

// Re-export resolvers
export {
  createQueryResolvers,
  createMutationResolvers,
  createFieldResolvers,
  database,
} from './resolvers.js';

// Re-export subscriptions
export {
  createSubscriptionFilters,
  createSubscriptionResolvers,
  subscriptionManager,
} from './subscriptions.js';

// Re-export context
export {
  buildHTTPContext,
  buildWebSocketContext,
  authenticateMiddleware,
  rateLimitMiddleware,
  loggingMiddleware,
} from './context.js';

// Re-export dataloaders
export {
  createDataLoaders,
  clearAllDataLoaders,
  primeDataLoaders,
} from './dataloaders.js';

// Re-export server
export {
  createExecutableSchema,
  createGraphQLApp,
  createSubscriptionServer,
  startGraphQLServer,
} from './server.js';
