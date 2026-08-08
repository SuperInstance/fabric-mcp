/**
 * Spreadsheet Moment - GraphQL API v2
 *
 * Round 18: Modern GraphQL API with subscriptions, caching, and optimization
 * Features: Type-safe schema, real-time subscriptions, query complexity analysis
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLID, GraphQLInputObjectType, GraphQLUnionType, GraphQLEnumType, GraphQLInterfaceType } from 'graphql';
import { PubSub } from 'graphql-subscriptions';

/**
 * GraphQL Scalars (Custom implementations since we're not importing graphql-scalars)
 */

// Simple Date scalar implementation
class DateScalar {
  name = 'Date';
  description = 'Date custom scalar type';

  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return value;
    }
    throw new TypeError('Date cannot represent non-date value');
  }

  parseValue(value: unknown): Date {
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new TypeError('Date cannot represent non-string value');
  }

  parseLiteral(ast: any): Date {
    if (ast.kind === 'StringValue') {
      return new Date(ast.value);
    }
    throw new TypeError('Date cannot represent non-string value');
  }
}

// Simple JSON scalar implementation
class JSONScalar {
  name = 'JSON';
  description = 'JSON custom scalar type';

  serialize(value: unknown): unknown {
    return value;
  }

  parseValue(value: unknown): unknown {
    return value;
  }

  parseLiteral(ast: any): unknown {
    switch (ast.kind) {
      case 'StringValue':
      case 'BooleanValue':
      case 'IntValue':
      case 'FloatValue':
      case 'ObjectValue':
      case 'ListValue':
        return ast.value;
      default:
        return null;
    }
  }
}

/**
 * Enums
 */
const CellType = new GraphQLEnumType({
  name: 'CellType',
  values: {
    TEXT: { value: 'text' },
    NUMBER: { value: 'number' },
    FORMULA: { value: 'formula' },
    DATE: { value: 'date' },
    BOOLEAN: { value: 'boolean' },
  },
});

const Permission = new GraphQLEnumType({
  name: 'Permission',
  values: {
    READ: { value: 'read' },
    WRITE: { value: 'write' },
    DELETE: { value: 'delete' },
    SHARE: { value: 'share' },
    ADMIN: { value: 'admin' },
  },
});

/**
 * Types
 */
const Cell = new GraphQLObjectType({
  name: 'Cell',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    row: { type: new GraphQLNonNull(GraphQLInt) },
    column: { type: new GraphQLNonNull(GraphQLInt) },
    value: { type: GraphQLString },
    formula: { type: GraphQLString },
    type: { type: new GraphQLNonNull(CellType) },
    formatted: { type: GraphQLString },
    style: { type: CellStyle },
  }),
});

const CellStyle = new GraphQLObjectType({
  name: 'CellStyle',
  fields: {
    bold: { type: GraphQLBoolean },
    italic: { type: GraphQLBoolean },
    underline: { type: GraphQLBoolean },
    backgroundColor: { type: GraphQLString },
    color: { type: GraphQLString },
    fontSize: { type: GraphQLInt },
    horizontalAlignment: { type: GraphQLString },
    verticalAlignment: { type: GraphQLString },
  },
});

const Spreadsheet = new GraphQLObjectType({
  name: 'Spreadsheet',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
    updatedAt: { type: new GraphQLNonNull(GraphQLString) },
    owner: { type: new GraphQLNonNull(User) },
    cells: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Cell))),
      args: {
        rows: { type: new GraphQLList(GraphQLInt) },
        columns: { type: new GraphQLList(GraphQLInt) },
      },
      resolve: (parent, args, context) => {
        return context.loaders.cells.load({
          spreadsheetId: parent.id,
          rows: args.rows,
          columns: args.columns,
        });
      },
    },
    collaborators: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Collaborator))),
      resolve: (parent, args, context) => {
        return context.loaders.collaborators.load(parent.id);
      },
    },
    permissions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Permission))),
      resolve: (parent, args, context) => {
        return context.loaders.permissions.load({
          userId: context.user?.id,
          spreadsheetId: parent.id,
        });
      },
    },
  }),
});

const User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLString },
    avatar: { type: GraphQLString },
    spreadsheets: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Spreadsheet))),
      resolve: (parent, args, context) => {
        return context.loaders.userSpreadsheets.load(parent.id);
      },
    },
  }),
});

const Collaborator = new GraphQLObjectType({
  name: 'Collaborator',
  fields: () => ({
    user: { type: new GraphQLNonNull(User) },
    role: { type: new GraphQLNonNull(GraphQLString) },
    permissions: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Permission))) },
    joinedAt: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

/**
 * Input types
 */
const CellInput = new GraphQLInputObjectType({
  name: 'CellInput',
  fields: {
    row: { type: new GraphQLNonNull(GraphQLInt) },
    column: { type: new GraphQLNonNull(GraphQLInt) },
    value: { type: GraphQLString },
    formula: { type: GraphQLString },
    style: { type: new GraphQLInputObjectType({
      name: 'CellStyleInput',
      fields: {
        bold: { type: GraphQLBoolean },
        italic: { type: GraphQLBoolean },
        underline: { type: GraphQLBoolean },
        backgroundColor: { type: GraphQLString },
        color: { type: GraphQLString },
        fontSize: { type: GraphQLInt },
      },
    })},
  },
});

/**
 * Query type
 */
const Query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    viewer: {
      type: User,
      description: 'Currently authenticated user',
      resolve: (parent, args, context) => {
        return context.user || null;
      },
    },
    spreadsheet: {
      type: Spreadsheet,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (parent, args, context) => {
        return context.loaders.spreadsheet.load(args.id);
      },
    },
    spreadsheets: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Spreadsheet))),
      args: {
        first: { type: GraphQLInt },
        after: { type: GraphQLString },
        orderBy: { type: GraphQLString },
      },
      resolve: (parent, args, context) => {
        return context.loaders.spreadsheets.load({
          first: args.first || 10,
          after: args.after,
          orderBy: args.orderBy || 'createdAt',
        });
      },
    },
  }),
});

/**
 * Mutation type
 */
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createSpreadsheet: {
      type: Spreadsheet,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
      },
      resolve: (parent, args, context) => {
        return context.mutations.createSpreadsheet({
          name: args.name,
          description: args.description,
          ownerId: context.user.id,
        });
      },
    },
    updateSpreadsheet: {
      type: Spreadsheet,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
      },
      resolve: (parent, args, context) => {
        return context.mutations.updateSpreadsheet(args.id, {
          name: args.name,
          description: args.description,
        });
      },
    },
    deleteSpreadsheet: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (parent, args, context) => {
        return context.mutations.deleteSpreadsheet(args.id);
      },
    },
    updateCells: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Cell))),
      args: {
        spreadsheetId: { type: new GraphQLNonNull(GraphQLID) },
        cells: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(CellInput))) },
      },
      resolve: async (parent, args, context) => {
        const cells = await context.mutations.updateCells(args.spreadsheetId, args.cells);

        // Publish subscription event
        context.pubSub.publish('CELLS_UPDATED', {
          cellsUpdated: {
            spreadsheetId: args.spreadsheetId,
            cells,
          },
        });

        return cells;
      },
    },
    shareSpreadsheet: {
      type: Spreadsheet,
      args: {
        spreadsheetId: { type: new GraphQLNonNull(GraphQLID) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        role: { type: new GraphQLNonNull(GraphQLString) },
        permissions: { type: new GraphQLList(new GraphQLNonNull(Permission)) },
      },
      resolve: (parent, args, context) => {
        return context.mutations.shareSpreadsheet(args.spreadsheetId, {
          email: args.email,
          role: args.role,
          permissions: args.permissions || ['read'],
        });
      },
    },
  }),
});

/**
 * Subscription type
 */
const Subscription = new GraphQLObjectType({
  name: 'Subscription',
  fields: () => ({
    cellsUpdated: {
      type: new GraphQLObjectType({
        name: 'CellsUpdatedPayload',
        fields: {
          spreadsheetId: { type: new GraphQLNonNull(GraphQLID) },
          cells: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Cell))) },
        },
      }),
      subscribe: (parent, args, context) => {
        return context.pubSub.asyncIterator(['CELLS_UPDATED']);
      },
      resolve: (payload) => payload,
    },
    collaboratorJoined: {
      type: Collaborator,
      subscribe: (parent, args, context) => {
        return context.pubSub.asyncIterator(['COLLABORATOR_JOINED']);
      },
      resolve: (payload) => payload,
    },
  }),
});

/**
 * Create GraphQL schema
 */
export const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
  subscription: Subscription,
});

/**
 * Query complexity analyzer
 */
export class QueryComplexityAnalyzer {
  private complexityMap: Map<string, number> = new Map();

  constructor() {
    // Define complexity costs for fields
    this.complexityMap.set('spreadsheet', 10);
    this.complexityMap.set('spreadsheets', 20);
    this.complexityMap.set('cells', 5);
    this.complexityMap.set('collaborators', 3);
    this.complexityMap.set('updateCells', 8);
  }

  /**
   * Analyze query complexity
   */
  analyze(query: string): { complexity: number; maxComplexity: number; withinLimit: boolean } {
    // Simple complexity calculation (in production, use graphql-validation-complexity)
    let complexity = 0;

    for (const [field, cost] of this.complexityMap) {
      const regex = new RegExp(`\\b${field}\\b`, 'g');
      const matches = query.match(regex);
      if (matches) {
        complexity += matches.length * cost;
      }
    }

    return {
      complexity,
      maxComplexity: 1000,
      withinLimit: complexity <= 1000,
    };
  }
}

/**
 * DataLoader configuration stub
 * DataLoader implementations are in dataloaders.ts
 */
export class DataLoaderConfig {
  /**
   * Create batch loaders for efficient data loading
   * This is a stub - actual implementation is in dataloaders.ts
   */
  static createLoaders(db: any) {
    // Import and use the actual DataLoader implementations
    const { createDataLoaders } = require('./dataloaders');
    return createDataLoaders(db);
  }
}

/**
 * Query cache
 */
export class QueryCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number = 60000; // 1 minute

  /**
   * Get cached query result
   */
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set query result in cache
   */
  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Generate cache key from query and variables
   */
  generateKey(query: string, variables?: any): string {
    return JSON.stringify({ query, variables });
  }
}

/**
 * Subscription manager
 */
export class SubscriptionManager {
  private pubSub: PubSub;

  constructor() {
    this.pubSub = new PubSub();
  }

  /**
   * Publish event
   */
  publish(event: string, payload: any): void {
    this.pubSub.publish(event, payload);
  }

  /**
   * Get PubSub instance
   */
  getPubSub(): PubSub {
    return this.pubSub;
  }
}

/**
 * GraphQL context builder
 */
export function buildContext({ req, res, connection, db }: any) {
  return {
    user: req?.user || connection?.context?.user,
    db: db || req?.db || connection?.context?.db,
    loaders: DataLoaderConfig.createLoaders(db || req?.db),
    mutations: req?.mutations,
    pubSub: new SubscriptionManager().getPubSub(),
  };
}

/**
 * Export all components
 */
export const APIv2 = {
  schema,
  complexityAnalyzer: new QueryComplexityAnalyzer(),
  cache: new QueryCache(),
  subscriptions: new SubscriptionManager(),
  buildContext,
};
