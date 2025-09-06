// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import 'jest';

// Jest test setup - console output is now visible during tests
// This allows developers to see all console.log, console.warn, console.error, and console.info messages
// which can be helpful for debugging test failures and understanding test behavior.

// Global cleanup to prevent worker process hanging
beforeEach(() => {
  // Ensure clean state before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Comprehensive cleanup after each test
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

// Global error handlers to catch uncaught promises
process.on('unhandledRejection', (reason, promise) => {
  // Jest will handle these appropriately
});

process.on('uncaughtException', (error) => {
  // Jest will handle these appropriately
});
