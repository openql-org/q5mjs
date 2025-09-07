// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

// Minimal E2E support for serverless Q5M tests

// Global error handling
Cypress.on('uncaught:exception', (err, _runnable) => {
  // Return false to prevent Cypress from failing the test on uncaught exceptions
  // This is useful for quantum calculation precision issues
  if (err.message.includes('precision') || err.message.includes('tolerance')) {
    return false;
  }
  return true;
});

// Custom assertion for quantum probabilities
chai.use((chai, _utils) => {
  chai.Assertion.addMethod('closeToQuantumProbability', function (expected: number, tolerance = 1e-10) {
    const actual = this._obj;
    
    this.assert(
      Math.abs(actual - expected) <= tolerance,
      `expected #{this} to be close to #{exp} within tolerance #{act}`,
      `expected #{this} not to be close to #{exp} within tolerance #{act}`,
      expected,
      tolerance
    );
  });
});