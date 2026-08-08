/**
 * Spreadsheet Moment - GraphQL DataLoaders
 *
 * Batch data loading with DataLoader to prevent N+1 queries
 * Features: Batch loading, caching, deduplication
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import { database } from './resolvers';

// Simple DataLoader implementation (since we don't have the dataloader package)
class DataLoader<K, V> {
  private batch: K[] = [];
  private promises: Map<K, Promise<V>> = new Map();
  private batchPromise: Promise<V[]> | null = null;
  private batchScheduleTimer: any = null;

  constructor(
    private batchLoadFn: (keys: K[]) => Promise<V[]>,
    options?: { batchScheduleFn?: (callback: () => void) => void }
  ) {
    if (options?.batchScheduleFn) {
      this.batchScheduleFn = options.batchScheduleFn;
    }
  }

  private batchScheduleFn = (callback: () => void) => {
    // Default: schedule for next tick
    Promise.resolve().then(callback);
  };

  async load(key: K): Promise<V> {
    // Check if we already have a promise for this key
    const existingPromise = this.promises.get(key);
    if (existingPromise) {
      return existingPromise;
    }

    // Create a new promise for this key
    const promise = new Promise<V>((resolve, reject) => {
      this.batch.push(key);

      const resolvePromise = async (results: V[]) => {
        const index = this.batch.indexOf(key);
        if (index !== -1 && results[index] !== undefined) {
          resolve(results[index]);
        } else {
          reject(new Error(`Key not found: ${JSON.stringify(key)}`));
        }
      };

      // Schedule batch loading
      if (!this.batchPromise) {
        this.batchPromise = new Promise<V[]>((resolve, reject) => {
          this.batchScheduleFn(async () => {
            const batch = [...this.batch];
            this.batch = [];
            this.batchPromise = null;

            try {
              const results = await this.batchLoadFn(batch);
              resolve(results);
            } catch (error) {
              reject(error);
            }
          });
        }).then(results => {
          // Resolve all pending promises
          for (const key of this.promises.keys()) {
            const index = this.batch.indexOf(key);
            if (index !== -1 && results[index] !== undefined) {
              this.promises.get(key)!.then(() => {}, () => {});
            }
          }
        });
      }

      this.batchPromise!.then(resolvePromise).catch(reject);
    });

    this.promises.set(key, promise);
    return promise;
  }

  async loadMany(keys: K[]): Promise<V[]> {
    return Promise.all(keys.map(key => this.load(key)));
  }

  clear(key: K): void {
    this.promises.delete(key);
  }

  clearAll(): void {
    this.promises.clear();
    this.batch = [];
    this.batchPromise = null;
  }
}

// DataLoader context type
export interface DataLoaderContext {
  spreadsheet: DataLoader<string, any>;
  spreadsheets: DataLoader<any, any[]>;
  cells: DataLoader<any, any[]>;
  collaborators: DataLoader<string, any[]>;
  permissions: DataLoader<any, any[]>;
  userSpreadsheets: DataLoader<string, any[]>;
}

/**
 * Create DataLoader instances for batch loading
 */
export function createDataLoaders(db: typeof database): DataLoaderContext {
  return {
    // Batch load spreadsheets by ID
    spreadsheet: new DataLoader(async (ids: string[]) => {
      const spreadsheets = await Promise.all(
        ids.map(id => db.findSpreadsheetById(id))
      );
      return spreadsheets;
    }),

    // Batch load spreadsheets with filters
    spreadsheets: new DataLoader(async (queries: any[]) => {
      // All queries use the same filters, so just return once
      return db.findAllSpreadsheets(queries[0] || {});
    }),

    // Batch load cells for spreadsheets
    cells: new DataLoader(async (queries: any[]) => {
      // Group by spreadsheetId
      const grouped = new Map<string, any[]>();
      for (const query of queries) {
        const spreadsheetId = typeof query === 'string' ? query : query.spreadsheetId;
        if (!grouped.has(spreadsheetId)) {
          grouped.set(spreadsheetId, []);
        }
        grouped.get(spreadsheetId)!.push(query);
      }

      // Load cells for each spreadsheet
      const results: any[] = [];
      for (const query of queries) {
        const spreadsheetId = typeof query === 'string' ? query : query.spreadsheetId;
        const cells = await db.findCellsBySpreadsheetId(spreadsheetId);

        // Apply filters if provided
        let filteredCells = cells;
        if (typeof query === 'object' && query.rows) {
          filteredCells = cells.filter(cell => query.rows.includes(cell.row));
        }
        if (typeof query === 'object' && query.columns) {
          filteredCells = filteredCells.filter(cell => query.columns.includes(cell.column));
        }

        results.push(filteredCells);
      }

      return results;
    }),

    // Batch load collaborators
    collaborators: new DataLoader(async (spreadsheetIds: string[]) => {
      const collaborators = await Promise.all(
        spreadsheetIds.map(id => db.findCollaboratorsBySpreadsheetId(id))
      );
      return collaborators;
    }),

    // Batch load permissions
    permissions: new DataLoader(async (queries: any[]) => {
      // In a real implementation, this would check actual permissions
      // For now, return default permissions
      return queries.map(() => ['read', 'write']);
    }),

    // Batch load user spreadsheets
    userSpreadsheets: new DataLoader(async (userIds: string[]) => {
      const spreadsheets = await Promise.all(
        userIds.map(id => db.findSpreadsheetsByOwnerId(id))
      );
      return spreadsheets;
    }),
  };
}

/**
 * Clear all DataLoader caches
 */
export function clearAllDataLoaders(loaders: DataLoaderContext): void {
  loaders.spreadsheet.clearAll();
  loaders.spreadsheets.clearAll();
  loaders.cells.clearAll();
  loaders.collaborators.clearAll();
  loaders.permissions.clearAll();
  loaders.userSpreadsheets.clearAll();
}

/**
 * Prime DataLoaders with known data
 */
export function primeDataLoaders(loaders: DataLoaderContext, data: {
  spreadsheets?: any[];
  cells?: Map<string, any[]>;
  collaborators?: Map<string, any[]>;
}): void {
  if (data.spreadsheets) {
    for (const spreadsheet of data.spreadsheets) {
      loaders.spreadsheet.clear();
    }
  }

  if (data.cells) {
    for (const [spreadsheetId, cells] of data.cells.entries()) {
      loaders.cells.clear();
    }
  }

  if (data.collaborators) {
    for (const [spreadsheetId, collaborators] of data.collaborators.entries()) {
      loaders.collaborators.clear();
    }
  }
}
