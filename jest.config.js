module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Root directory for tests
  roots: ['<rootDir>/tests'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],

  // TypeScript configuration
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },

  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@analytics/(.*)$': '<rootDir>/src/analytics/$1',
    '^@i18n/(.*)$': '<rootDir>/src/i18n/$1',
    '^@accessibility/(.*)$': '<rootDir>/src/accessibility/$1',
    '^@performance/(.*)$': '<rootDir>/src/performance/$1',
    '^@security/(.*)$': '<rootDir>/src/security/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@community/(.*)$': '<rootDir>/src/community/$1'
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/__tests__/**',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 82,
      functions: 82,
      lines: 82,
      statements: 82
    },
    './src/analytics/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/i18n/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/accessibility/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/performance/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/security/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/api/v2/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/community/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],

  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>/src'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Maximum workers (set to 1 for debugging)
  maxWorkers: '50%',

  // Test timeout
  testTimeout: 10000,

  // Global setup and teardown
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts',

  // Reporter configuration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/test-results',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ]
};
