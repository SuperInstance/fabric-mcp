/**
 * Spreadsheet Moment - GraphQL Subscriptions
 *
 * Real-time subscription handlers for live updates
 * Features: WebSocket subscriptions, event filtering, live collaboration
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import { PubSub, withFilter } from 'graphql-subscriptions';
import { Cell, Collaborator } from './resolvers';

// Subscription event types
export interface CellsUpdatedPayload {
  spreadsheetId: string;
  cells: Cell[];
}

export interface CollaboratorJoinedPayload {
  spreadsheetId: string;
  collaborator: Collaborator;
}

// Subscription filters
export const createSubscriptionFilters = (pubSub: PubSub) => ({
  /**
   * Filter cells updated events by spreadsheet ID
   */
  cellsUpdated: withFilter(
    () => pubSub.asyncIterator(['CELLS_UPDATED']),
    (payload: { cellsUpdated: CellsUpdatedPayload }, variables: { spreadsheetId: string }) => {
      return payload.cellsUpdated.spreadsheetId === variables.spreadsheetId;
    }
  ),

  /**
   * Filter collaborator joined events by spreadsheet ID
   */
  collaboratorJoined: withFilter(
    () => pubSub.asyncIterator(['COLLABORATOR_JOINED']),
    (payload: { collaboratorJoined: CollaboratorJoinedPayload }, variables: { spreadsheetId: string }) => {
      return payload.collaboratorJoined.spreadsheetId === variables.spreadsheetId;
    }
  ),
});

// Subscription resolvers
export const createSubscriptionResolvers = (pubSub: PubSub) => ({
  /**
   * Subscribe to cell updates in a spreadsheet
   */
  cellsUpdated: {
    subscribe: withFilter(
      () => pubSub.asyncIterator(['CELLS_UPDATED']),
      (payload: { cellsUpdated: CellsUpdatedPayload }, variables: { spreadsheetId: string }) => {
        // Only send updates for the requested spreadsheet
        return payload.cellsUpdated.spreadsheetId === variables.spreadsheetId;
      }
    ),
    resolve: (payload: { cellsUpdated: CellsUpdatedPayload }) => {
      return payload.cellsUpdated;
    },
  },

  /**
   * Subscribe to collaborator join events
   */
  collaboratorJoined: {
    subscribe: withFilter(
      () => pubSub.asyncIterator(['COLLABORATOR_JOINED']),
      (payload: { collaboratorJoined: CollaboratorJoinedPayload }, variables: { spreadsheetId: string }) => {
        return payload.collaboratorJoined.spreadsheetId === variables.spreadsheetId;
      }
    ),
    resolve: (payload: { collaboratorJoined: CollaboratorJoinedPayload }) => {
      return payload.collaboratorJoined.collaborator;
    },
  },
});

/**
 * Subscription manager for handling WebSocket connections
 */
export class SubscriptionManager {
  private pubSub: PubSub;
  private subscriptions: Map<string, Set<string>> = new Map(); // spreadsheetId -> Set of subscription IDs

  constructor() {
    this.pubSub = new PubSub();
  }

  /**
   * Publish cell updates
   */
  publishCellsUpdated(spreadsheetId: string, cells: Cell[]): void {
    this.pubSub.publish('CELLS_UPDATED', {
      cellsUpdated: {
        spreadsheetId,
        cells,
      },
    });
  }

  /**
   * Publish collaborator joined event
   */
  publishCollaboratorJoined(spreadsheetId: string, collaborator: Collaborator): void {
    this.pubSub.publish('COLLABORATOR_JOINED', {
      collaboratorJoined: {
        spreadsheetId,
        collaborator,
      },
    });
  }

  /**
   * Get the PubSub instance
   */
  getPubSub(): PubSub {
    return this.pubSub;
  }

  /**
   * Track a subscription for a spreadsheet
   */
  trackSubscription(spreadsheetId: string, subscriptionId: string): void {
    if (!this.subscriptions.has(spreadsheetId)) {
      this.subscriptions.set(spreadsheetId, new Set());
    }
    this.subscriptions.get(spreadsheetId)!.add(subscriptionId);
  }

  /**
   * Remove a subscription
   */
  removeSubscription(spreadsheetId: string, subscriptionId: string): void {
    const subs = this.subscriptions.get(spreadsheetId);
    if (subs) {
      subs.delete(subscriptionId);
      if (subs.size === 0) {
        this.subscriptions.delete(spreadsheetId);
      }
    }
  }

  /**
   * Get active subscription count for a spreadsheet
   */
  getSubscriptionCount(spreadsheetId: string): number {
    return this.subscriptions.get(spreadsheetId)?.size || 0;
  }

  /**
   * Clear all subscriptions
   */
  clearAll(): void {
    this.subscriptions.clear();
  }
}

// Export singleton instance
export const subscriptionManager = new SubscriptionManager();
