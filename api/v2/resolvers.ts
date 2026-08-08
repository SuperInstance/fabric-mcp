/**
 * Spreadsheet Moment - GraphQL Resolvers
 *
 * Query and mutation resolvers for the GraphQL API v2
 * Features: Type-safe resolvers, error handling, data fetching
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import { PubSub } from 'graphql-subscriptions';
import { v4 as uuidv4 } from 'uuid';

// Types
interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface Cell {
  id: string;
  row: number;
  column: number;
  value?: string;
  formula?: string;
  type: 'text' | 'number' | 'formula' | 'date' | 'boolean';
  formatted?: string;
  style?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    backgroundColor?: string;
    color?: string;
    fontSize?: number;
    horizontalAlignment?: string;
    verticalAlignment?: string;
  };
}

interface Spreadsheet {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  cells: Cell[];
  collaborators: Collaborator[];
}

interface Collaborator {
  user: User;
  role: string;
  permissions: string[];
  joinedAt: string;
}

interface CreateSpreadsheetInput {
  name: string;
  description?: string;
  ownerId: string;
}

interface UpdateCellsInput {
  spreadsheetId: string;
  cells: Array<{
    row: number;
    column: number;
    value?: string;
    formula?: string;
    style?: Cell['style'];
  }>;
}

interface ShareSpreadsheetInput {
  spreadsheetId: string;
  email: string;
  role: string;
  permissions: string[];
}

// Mutation resolver types
export type MutationResolvers = ReturnType<typeof createMutationResolvers>;
export type QueryResolvers = ReturnType<typeof createQueryResolvers>;
export type FieldResolvers = ReturnType<typeof createFieldResolvers>;

// In-memory database (replace with actual database in production)
class Database {
  private users: Map<string, User> = new Map();
  private spreadsheets: Map<string, Spreadsheet> = new Map();
  private cells: Map<string, Cell[]> = new Map(); // spreadsheetId -> cells
  private collaborators: Map<string, Collaborator[]> = new Map(); // spreadsheetId -> collaborators

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed test data
    const user1: User = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.png',
    };
    this.users.set(user1.id, user1);

    const spreadsheet1: Spreadsheet = {
      id: 'sheet-1',
      name: 'Test Spreadsheet',
      description: 'A test spreadsheet',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: user1.id,
      cells: [],
      collaborators: [],
    };
    this.spreadsheets.set(spreadsheet1.id, spreadsheet1);
  }

  // User operations
  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  // Spreadsheet operations
  async createSpreadsheet(input: CreateSpreadsheetInput): Promise<Spreadsheet> {
    const spreadsheet: Spreadsheet = {
      id: `sheet-${uuidv4()}`,
      name: input.name,
      description: input.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: input.ownerId,
      cells: [],
      collaborators: [],
    };
    this.spreadsheets.set(spreadsheet.id, spreadsheet);
    return spreadsheet;
  }

  async findSpreadsheetById(id: string): Promise<Spreadsheet | null> {
    return this.spreadsheets.get(id) || null;
  }

  async findSpreadsheetsByOwnerId(ownerId: string): Promise<Spreadsheet[]> {
    return Array.from(this.spreadsheets.values()).filter(s => s.ownerId === ownerId);
  }

  async findAllSpreadsheets(options: { first?: number; after?: string; orderBy?: string }): Promise<Spreadsheet[]> {
    let spreadsheets = Array.from(this.spreadsheets.values());

    // Sort
    if (options.orderBy === 'createdAt') {
      spreadsheets.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    // Pagination (simplified)
    if (options.first) {
      spreadsheets = spreadsheets.slice(0, options.first);
    }

    return spreadsheets;
  }

  async updateSpreadsheet(id: string, updates: Partial<Pick<Spreadsheet, 'name' | 'description'>>): Promise<Spreadsheet | null> {
    const spreadsheet = this.spreadsheets.get(id);
    if (!spreadsheet) return null;

    const updated = {
      ...spreadsheet,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.spreadsheets.set(id, updated);
    return updated;
  }

  async deleteSpreadsheet(id: string): Promise<boolean> {
    return this.spreadsheets.delete(id);
  }

  // Cell operations
  async findCellsBySpreadsheetId(spreadsheetId: string): Promise<Cell[]> {
    return this.cells.get(spreadsheetId) || [];
  }

  async updateCells(spreadsheetId: string, cellUpdates: UpdateCellsInput['cells']): Promise<Cell[]> {
    const existingCells = this.cells.get(spreadsheetId) || [];
    const cellMap = new Map(existingCells.map(cell => [`${cell.row}-${cell.column}`, cell]));

    const updatedCells: Cell[] = [];

    for (const update of cellUpdates) {
      const key = `${update.row}-${update.column}`;
      const existing = cellMap.get(key);

      const cell: Cell = existing
        ? {
            ...existing,
            value: update.value !== undefined ? update.value : existing.value,
            formula: update.formula !== undefined ? update.formula : existing.formula,
            style: update.style || existing.style,
          }
        : {
            id: `cell-${uuidv4()}`,
            row: update.row,
            column: update.column,
            value: update.value,
            formula: update.formula,
            type: update.formula ? 'formula' : update.value ? 'text' : 'text',
            style: update.style,
          };

      cellMap.set(key, cell);
      updatedCells.push(cell);
    }

    this.cells.set(spreadsheetId, Array.from(cellMap.values()));
    return updatedCells;
  }

  // Collaborator operations
  async findCollaboratorsBySpreadsheetId(spreadsheetId: string): Promise<Collaborator[]> {
    return this.collaborators.get(spreadsheetId) || [];
  }

  async addCollaborator(spreadsheetId: string, email: string, role: string, permissions: string[]): Promise<Collaborator | null> {
    const user = await this.findUserByEmail(email);
    if (!user) return null;

    const collaborator: Collaborator = {
      user,
      role,
      permissions,
      joinedAt: new Date().toISOString(),
    };

    const existing = this.collaborators.get(spreadsheetId) || [];
    this.collaborators.set(spreadsheetId, [...existing, collaborator]);

    return collaborator;
  }
}

// Mutation resolvers
export const createMutationResolvers = (db: Database, pubSub: PubSub) => ({
  async createSpreadsheet(_: any, { name, description }: { name: string; description?: string }, context: any): Promise<Spreadsheet> {
    if (!context.user) {
      throw new Error('Authentication required');
    }

    return db.createSpreadsheet({
      name,
      description,
      ownerId: context.user.id,
    });
  },

  async updateSpreadsheet(_: any, { id, name, description }: { id: string; name?: string; description?: string }): Promise<Spreadsheet | null> {
    const updated = await db.updateSpreadsheet(id, { name, description });
    if (!updated) {
      throw new Error('Spreadsheet not found');
    }
    return updated;
  },

  async deleteSpreadsheet(_: any, { id }: { id: string }): Promise<boolean> {
    const deleted = await db.deleteSpreadsheet(id);
    if (!deleted) {
      throw new Error('Spreadsheet not found');
    }
    return true;
  },

  async updateCells(_: any, { spreadsheetId, cells }: UpdateCellsInput): Promise<Cell[]> {
    const updatedCells = await db.updateCells(spreadsheetId, cells);

    // Publish subscription event
    pubSub.publish('CELLS_UPDATED', {
      cellsUpdated: {
        spreadsheetId,
        cells: updatedCells,
      },
    });

    return updatedCells;
  },

  async shareSpreadsheet(_: any, { spreadsheetId, email, role, permissions }: ShareSpreadsheetInput): Promise<Spreadsheet | null> {
    const collaborator = await db.addCollaborator(spreadsheetId, email, role, permissions);

    if (!collaborator) {
      throw new Error('User not found');
    }

    // Publish subscription event
    pubSub.publish('COLLABORATOR_JOINED', {
      collaboratorJoined: collaborator,
    });

    return db.findSpreadsheetById(spreadsheetId);
  },
});

// Query resolvers
export const createQueryResolvers = (db: Database) => ({
  async viewer(_: any, __: any, context: any): Promise<User | null> {
    return context.user || null;
  },

  async spreadsheet(_: any, { id }: { id: string }): Promise<Spreadsheet | null> {
    return db.findSpreadsheetById(id);
  },

  async spreadsheets(_: any, { first = 10, after, orderBy = 'createdAt' }: { first?: number; after?: string; orderBy?: string }): Promise<Spreadsheet[]> {
    return db.findAllSpreadsheets({ first, after, orderBy });
  },
});

// Field resolvers for nested types
export const createFieldResolvers = (db: Database) => ({
  Spreadsheet: {
    async owner(spreadsheet: Spreadsheet): Promise<User> {
      const user = await db.findUserById(spreadsheet.ownerId);
      if (!user) {
        throw new Error('Owner not found');
      }
      return user;
    },

    async cells(spreadsheet: Spreadsheet, args: { rows?: number[]; columns?: number[] }): Promise<Cell[]> {
      let cells = await db.findCellsBySpreadsheetId(spreadsheet.id);

      // Filter by rows and columns if provided
      if (args.rows && args.rows.length > 0) {
        cells = cells.filter(cell => args.rows!.includes(cell.row));
      }
      if (args.columns && args.columns.length > 0) {
        cells = cells.filter(cell => args.columns!.includes(cell.column));
      }

      return cells;
    },

    async collaborators(spreadsheet: Spreadsheet): Promise<Collaborator[]> {
      return db.findCollaboratorsBySpreadsheetId(spreadsheet.id);
    },

    permissions(): string[] {
      // In a real implementation, this would check the user's permissions
      return ['read', 'write'];
    },
  },

  User: {
    async spreadsheets(user: User): Promise<Spreadsheet[]> {
      return db.findSpreadsheetsByOwnerId(user.id);
    },
  },
});

// Export database instance
export const database = new Database();
