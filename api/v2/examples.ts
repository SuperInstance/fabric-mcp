/**
 * Spreadsheet Moment - GraphQL API Examples
 *
 * Usage examples for the GraphQL API v2
 * Features: Queries, mutations, subscriptions, authentication
 *
 * MIT License - Copyright (c) 2026 SuperInstance Research Team
 */

import { createServer } from 'http';
import { startGraphQLServer } from './server';
import { database } from './resolvers';

/**
 * Example 1: Basic Query - Get Viewer
 */
async function exampleGetViewer() {
  console.log('\n=== Example 1: Get Viewer ===');

  const query = `
    query GetViewer {
      viewer {
        id
        email
        name
        avatar
      }
    }
  `;

  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-token',
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Example 2: Query - Get Spreadsheet
 */
async function exampleGetSpreadsheet(spreadsheetId: string) {
  console.log('\n=== Example 2: Get Spreadsheet ===');

  const query = `
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
        cells(rows: [1, 2], columns: [1, 2]) {
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
            backgroundColor
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
  `;

  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { id: spreadsheetId },
    }),
  });

  const result = await response.json();
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Example 3: Query - List Spreadsheets
 */
async function exampleListSpreadsheets() {
  console.log('\n=== Example 3: List Spreadsheets ===');

  const query = `
    query ListSpreadsheets {
      spreadsheets(first: 10, orderBy: "createdAt") {
        id
        name
        description
        createdAt
        updatedAt
      }
    }
  `;

  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Example 4: Mutation - Create Spreadsheet
 */
async function exampleCreateSpreadsheet() {
  console.log('\n=== Example 4: Create Spreadsheet ===');

  const mutation = `
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
  `;

  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-token',
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        name: 'My New Spreadsheet',
        description: 'Created via GraphQL',
      },
    }),
  });

  const result = await response.json();
  console.log(JSON.stringify(result, null, 2));
  return result.data?.createSpreadsheet;
}

/**
 * Example 5: Mutation - Update Cells
 */
async function exampleUpdateCells(spreadsheetId: string) {
  console.log('\n=== Example 5: Update Cells ===');

  const mutation = `
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
  `;

  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-token',
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        spreadsheetId,
        cells: [
          {
            row: 1,
            column: 1,
            value: 'Hello',
            style: {
              bold: true,
              fontSize: 14,
            },
          },
          {
            row: 1,
            column: 2,
            value: 'World',
            style: {
              italic: true,
              backgroundColor: '#ffff00',
            },
          },
          {
            row: 2,
            column: 1,
            formula: '=A1&B1',
          },
        ],
      },
    }),
  });

  const result = await response.json();
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Example 6: Mutation - Share Spreadsheet
 */
async function exampleShareSpreadsheet(spreadsheetId: string) {
  console.log('\n=== Example 6: Share Spreadsheet ===');

  const mutation = `
    mutation ShareSpreadsheet($spreadsheetId: ID!, $email: String!, $role: String!, $permissions: [Permission!]) {
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
  `;

  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-token',
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        spreadsheetId,
        email: 'collaborator@example.com',
        role: 'editor',
        permissions: ['READ', 'WRITE'],
      },
    }),
  });

  const result = await response.json();
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Example 7: Subscription - Cell Updates (WebSocket)
 */
async function exampleCellUpdatesSubscription(spreadsheetId: string) {
  console.log('\n=== Example 7: Subscribe to Cell Updates ===');

  const WebSocket = require('ws');
  const ws = new WebSocket('ws://localhost:4000/graphql', {
    graphql: true,
  });

  ws.on('open', () => {
    // Send subscription message
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
                formula
                type
              }
            }
          }
        `,
        variables: { spreadsheetId },
      },
    }));
  });

  ws.on('message', (data: any) => {
    const message = JSON.parse(data);
    console.log('Subscription update:', JSON.stringify(message, null, 2));
  });

  ws.on('error', (error: any) => {
    console.error('WebSocket error:', error);
  });
}

/**
 * Example 8: Query with DataLoader batching
 */
async function exampleDataLoaderBatching() {
  console.log('\n=== Example 8: DataLoader Batching ===');

  const query = `
    query DataLoaderExample {
      spreadsheets(first: 5) {
        id
        name
        owner {
          id
          email
          name
        }
        collaborators {
          user {
            id
            email
          }
          role
        }
        cells {
          id
          row
          column
          value
        }
      }
    }
  `;

  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Example 9: Query Complexity Analysis
 */
async function exampleQueryComplexity() {
  console.log('\n=== Example 9: Query Complexity ===');

  const { QueryComplexityAnalyzer } = require('./GraphQLSchema');
  const analyzer = new QueryComplexityAnalyzer();

  const complexQuery = `
    query ComplexQuery {
      spreadsheets(first: 10) {
        id
        name
        cells {
          id
          row
          column
          value
        }
        collaborators {
          user {
            id
            email
            spreadsheets {
              id
              name
              cells {
                id
                row
                column
              }
            }
          }
        }
      }
    }
  `;

  const analysis = analyzer.analyze(complexQuery);
  console.log('Query complexity:', analysis);
  console.log('Within limit:', analysis.withinLimit);
}

/**
 * Example 10: Error Handling
 */
async function exampleErrorHandling() {
  console.log('\n=== Example 10: Error Handling ===');

  // Query with invalid ID
  const query = `
    query GetInvalidSpreadsheet {
      spreadsheet(id: "invalid-id") {
        id
        name
      }
    }
  `;

  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('Starting GraphQL server...');
  await startGraphQLServer(4000);

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Run examples
    await exampleGetViewer();
    await exampleListSpreadsheets();

    const newSpreadsheet = await exampleCreateSpreadsheet();
    const spreadsheetId = newSpreadsheet?.id || 'sheet-1';

    await exampleGetSpreadsheet(spreadsheetId);
    await exampleUpdateCells(spreadsheetId);
    await exampleShareSpreadsheet(spreadsheetId);

    // Note: WebSocket example requires manual handling
    console.log('\nNote: WebSocket subscription example requires manual connection');
    console.log('See exampleCellUpdatesSubscription() function');

    await exampleDataLoaderBatching();
    await exampleQueryComplexity();
    await exampleErrorHandling();

    console.log('\n=== All examples completed ===');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export {
  exampleGetViewer,
  exampleGetSpreadsheet,
  exampleListSpreadsheets,
  exampleCreateSpreadsheet,
  exampleUpdateCells,
  exampleShareSpreadsheet,
  exampleCellUpdatesSubscription,
  exampleDataLoaderBatching,
  exampleQueryComplexity,
  exampleErrorHandling,
};
