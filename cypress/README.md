# Q5M.js E2E Test Suite

## Test Structure

### `/e2e/core/` - Core API Tests (Headless)
Pure JavaScript tests that verify the core Q5M.js API functionality. These tests can run headless without any UI framework dependencies.

- **circuit.cy.js** - Circuit creation and execution tests
- **gates.cy.js** - Quantum gate operations (single-qubit, two-qubit)
- **measurement.cy.js** - Measurement and probability tests
- **algorithms.cy.js** - Basic quantum algorithm implementations

### `/e2e/frameworks/` - Framework Integration Tests
Simple integration tests for each supported framework (4 tests per framework):

- **vanilla.cy.js** - Vanilla JavaScript integration
- **react.cy.js** - React component integration
- **vue.cy.js** - Vue.js integration
- **angular.cy.js** - Angular integration
- **nextjs.cy.js** - Next.js App Router integration
- **nuxtjs.cy.js** - Nuxt.js 3 integration

## Running Tests

### Core Tests Only (Headless)
```bash
npm run test:e2e -- --env framework=none
```

### Specific Framework Tests
```bash
# Vanilla JavaScript
npm run test:e2e -- --env framework=vanilla

# React
npm run test:e2e -- --env framework=react

# Vue
npm run test:e2e -- --env framework=vue

# Angular
npm run test:e2e -- --env framework=angular

# Next.js
npm run test:e2e -- --env framework=nextjs

# Nuxt.js
npm run test:e2e -- --env framework=nuxtjs
```

### All Tests
```bash
npm run test:e2e -- --env framework=all
```

## Test Configuration

The test framework is configured in `cypress.config.ts` with dynamic spec patterns based on the selected framework.

## Legacy Tests

Previous E2E tests have been moved to `/cypress_beta/` for reference. These contain more comprehensive tests that can be migrated or adapted as needed.

## Test Philosophy

1. **Core tests** focus on API functionality without UI dependencies
2. **Framework tests** verify basic integration with 4 key scenarios each
3. **Headless execution** is prioritized for CI/CD efficiency
4. **Simple and maintainable** test structure over complex scenarios