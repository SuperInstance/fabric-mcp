/**
 * Spreadsheet Moment - GraphQL Context Builder
 *
 * Builds GraphQL context for HTTP and WebSocket connections
 * Features: Authentication, data loaders, pub/sub, caching
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import { PubSub } from 'graphql-subscriptions';
import { createDataLoaders, DataLoaderContext } from './dataloaders';
import { database } from './resolvers';
import { MutationResolvers } from './resolvers';
import { subscriptionManager } from './subscriptions';

// User context type
export interface GraphQLUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

// GraphQL context type
export interface GraphQLContext {
  user?: GraphQLUser;
  db: typeof database;
  loaders: DataLoaderContext;
  mutations: ReturnType<typeof createMutationResolvers>;
  pubSub: PubSub;
  req?: any;
  res?: any;
  connection?: any;
}

// HTTP request context (for Express/HTTP)
export interface RequestContext {
  req: {
    user?: GraphQLUser;
    headers: Record<string, string>;
    query: Record<string, any>;
    body: any;
  };
  res: {
    header: (name: string, value: string) => void;
    status: (code: number) => void;
  };
}

// WebSocket connection context
export interface ConnectionContext {
  connection: {
    context: {
      user?: GraphQLUser;
      token?: string;
    };
  };
}

/**
 * Extract user from request
 */
function extractUser(req?: any): GraphQLUser | undefined {
  // In production, extract from JWT token or session
  // For now, return a mock user
  if (!req) return undefined;

  // Check Authorization header
  const authHeader = req.headers?.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // In production: verify JWT token
    // For demo: return mock user
    return {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
    };
  }

  return undefined;
}

/**
 * Build GraphQL context for HTTP requests
 */
export function buildHTTPContext({ req, res }: RequestContext): GraphQLContext {
  const user = extractUser(req);

  return {
    user,
    db: database,
    loaders: createDataLoaders(database),
    mutations: createMutationResolvers(database, subscriptionManager.getPubSub()),
    pubSub: subscriptionManager.getPubSub(),
    req,
    res,
  };
}

/**
 * Build GraphQL context for WebSocket connections
 */
export function buildWebSocketContext({ connection }: ConnectionContext): GraphQLContext {
  const user = connection?.context?.user;

  return {
    user,
    db: database,
    loaders: createDataLoaders(database),
    mutations: createMutationResolvers(database, subscriptionManager.getPubSub()),
    pubSub: subscriptionManager.getPubSub(),
    connection,
  };
}

/**
 * Unified context builder (detects HTTP vs WebSocket)
 */
export function buildContext(context: RequestContext | ConnectionContext): GraphQLContext {
  if ('req' in context) {
    return buildHTTPContext(context as RequestContext);
  } else {
    return buildWebSocketContext(context as ConnectionContext);
  }
}

/**
 * Middleware for authentication
 */
export function authenticateMiddleware(req: any, res: any, next: any) {
  // Extract token from Authorization header
  const authHeader = req.headers?.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    // Allow unauthenticated requests (viewer will be null)
    return next();
  }

  const token = authHeader.substring(7);

  // In production, verify JWT token
  try {
    // const decoded = jwt.verify(token, JWT_SECRET);
    // req.user = decoded;
    req.user = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
    };
  } catch (error) {
    // Invalid token, continue without user
    console.error('Authentication error:', error);
  }

  next();
}

/**
 * Middleware for rate limiting
 */
export function rateLimitMiddleware(maxRequests: number = 100, windowMs: number = 60000) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: any, res: any, next: any) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const userRequests = requests.get(userId);

    if (!userRequests || now > userRequests.resetTime) {
      requests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userRequests.count >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    userRequests.count++;
    next();
  };
}

/**
 * Middleware for request logging
 */
export function loggingMiddleware(req: any, res: any, next: any) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
}
