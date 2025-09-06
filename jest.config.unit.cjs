module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests/unit'],
  silent: false, // Keep console output but filter warnings
  verbose: false, // Reduce verbose output
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.types.ts',
  ],
  coverageDirectory: 'coverage/new',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  
  // Add proper cleanup options to prevent leaks
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Worker configuration to prevent hanging
  maxWorkers: 1,
  workerIdleMemoryLimit: '512MB',
  
  // Enhanced process management for stability
  forceExit: true, // Temporary measure for clean test runs
  detectOpenHandles: false, // Handled manually in setup
  detectLeaks: false, // Not needed with proper cleanup
};
