# Contributing to q5m.js

Thank you for your interest in contributing to q5m.js! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Documentation](#documentation)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow:

- **Be respectful**: Treat everyone with respect and kindness
- **Be collaborative**: Work together towards common goals
- **Be inclusive**: Welcome contributors from all backgrounds
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Understand that everyone is learning and growing

## Getting Started

### Prerequisites

- **Node.js 18+**: Required runtime environment
- **npm 8+**: Package manager
- **Git**: Version control system
- **TypeScript knowledge**: Familiarity with TypeScript is recommended

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/q5mjs.git
   cd q5mjs
   ```

## Development Setup

### Initial Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Git hooks**:
   ```bash
   npm run prepare
   ```

3. **Run tests to verify setup**:
   ```bash
   npm test
   ```

### Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build production bundle
- `npm run build:types` - Generate TypeScript declaration files
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run docs` - Generate API documentation

## Coding Standards

### TypeScript Style Guide

#### Type Safety (CRITICAL)

**NEVER use `any` type** in production code:

```typescript
// ❌ BAD - using any
function processData(data: any): any {
  return data.someProperty;
}

// ✅ GOOD - specific types
function processQuantumState(state: QuantumState): MeasurementResult {
  return measureState(state);
}
```

#### Type Guidelines

1. **Prefer explicit types** over inference when it improves clarity
2. **Use `unknown` type** only as a last resort for truly unknown data
3. **Avoid underscore-prefixed parameters** - implement meaningful functionality
4. **Use type assertions carefully** - only when you're certain about the type

```typescript
// ❌ BAD - unused underscore parameter
function renderGate(_gate: QuantumGate): string {
  return "placeholder";
}

// ✅ GOOD - meaningful implementation
function renderGate(gate: QuantumGate, options: RenderOptions): string {
  return `${gate.name} gate with ${options.style} styling`;
}
```

#### Import/Export Guidelines

```typescript
// ✅ Use type-only imports when possible
import type { QuantumGate } from './Gate';
import { HadamardGate } from './SingleQubitGates';

// ✅ Prefer named exports over default exports
export { Circuit, QuantumState } from './core';
```

#### Code Formatting

- **Indentation**: 2 spaces (enforced by Prettier)
- **Line length**: 100 characters maximum
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings, double quotes in JSX/templates
- **Template literals**: Use template literals instead of string concatenation

```typescript
// ❌ BAD - string concatenation
const message = 'Gate ' + gate.name + ' applied to qubit ' + qubitIndex;

// ✅ GOOD - template literals
const message = `Gate ${gate.name} applied to qubit ${qubitIndex}`;
```

### File Organization

```
src/
├── core/           # Core quantum computing classes
├── algorithms/     # Quantum algorithms
├── visualization/  # Visualization utilities
├── math/          # Mathematical utilities
├── converters/    # Format conversion utilities
└── index.ts       # Main entry point
```

### License Headers

**ALL source files** must include SPDX license headers:

```typescript
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

// Your code here...
```

## Testing Guidelines

### Test Structure

```
tests/
├── unit/           # Unit tests
│   ├── core/       # Core module tests
│   ├── algorithms/ # Algorithm tests
│   └── math/       # Math utility tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── benchmark/     # Performance tests
```

### Writing Tests

#### Unit Tests

```typescript
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { Circuit } from '../../../src/core/Circuit';

describe('Circuit', () => {
  describe('Basic Operations', () => {
    it('should create circuit with specified number of qubits', () => {
      const circuit = new Circuit(3);
      expect(circuit.getNumQubits()).toBe(3);
    });

    it('should apply Hadamard gate correctly', () => {
      const circuit = new Circuit(1);
      circuit.h(0);
      circuit.execute();
      
      const probabilities = circuit.getProbabilities();
      expect(probabilities[0]).toBeCloseTo(0.5, 10);
      expect(probabilities[1]).toBeCloseTo(0.5, 10);
    });
  });
});
```

#### Test Requirements

1. **Coverage**: Maintain >90% test coverage
2. **Descriptive names**: Use clear, descriptive test names
3. **Arrange-Act-Assert**: Follow the AAA pattern
4. **Edge cases**: Test boundary conditions and error cases
5. **Floating-point precision**: Use `toBeCloseTo()` for quantum probabilities

```typescript
// ✅ GOOD - testing edge cases
it('should throw error for invalid qubit index', () => {
  const circuit = new Circuit(2);
  expect(() => circuit.h(-1)).toThrow('Qubit index -1 out of range');
  expect(() => circuit.h(2)).toThrow('Qubit index 2 out of range');
});
```

### Performance Tests

Include performance benchmarks for critical operations:

```typescript
describe('Performance', () => {
  it('should handle 10-qubit circuits efficiently', () => {
    const startTime = performance.now();
    const circuit = new Circuit(10);
    
    // Apply gates...
    circuit.execute();
    
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(1000); // Should complete in <1s
  });
});
```

## Commit Guidelines

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code changes that neither fix bugs nor add features
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **perf**: Performance improvements

#### Scopes

- **core**: Core quantum computing functionality
- **algorithms**: Quantum algorithms
- **visualization**: Visualization components
- **math**: Mathematical utilities
- **tests**: Test-related changes
- **docs**: Documentation changes
- **build**: Build system changes

#### Examples

```bash
feat(core): add quantum Fourier transform implementation

- Implement QFT circuit generation
- Add inverse QFT functionality
- Include comprehensive unit tests

Closes #42

fix(algorithms): correct Grover iteration count calculation

The optimal iteration count was off by one for certain cases.

Breaking change: Updated GroverOptions interface

BREAKING CHANGE: GroverOptions.iterations now defaults to undefined
```

### Commit Requirements

1. **Language**: All commit messages must be in English
2. **Imperative mood**: Use present tense ("add" not "added")
3. **Line length**: First line ≤50 characters, body lines ≤72 characters
4. **Reference issues**: Include issue numbers when applicable

## Pull Request Process

### Before Submitting

1. **Update your branch**:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run all checks**:
   ```bash
   npm run lint      # Must pass with 0 errors, 0 warnings
   npm run typecheck # Must pass TypeScript compilation
   npm test          # All tests must pass
   npm run build     # Build must succeed
   ```

3. **Update documentation** if you've changed APIs

### PR Requirements

1. **Clear description**: Explain what changes you made and why
2. **Test coverage**: Include tests for new functionality
3. **Documentation**: Update relevant documentation
4. **Breaking changes**: Clearly mark breaking changes
5. **Small focused changes**: Keep PRs focused on single concerns

### PR Template

```markdown
## Summary
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests pass locally
- [ ] Performance impact assessed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented appropriately
- [ ] Documentation updated
- [ ] No new TypeScript errors or warnings
- [ ] ESLint passes with 0 errors/warnings

## Breaking Changes
List any breaking changes and migration steps.

## Additional Notes
Any additional information for reviewers.
```

### Review Process

1. **Automated checks**: CI must pass
2. **Code review**: At least one maintainer approval required
3. **Testing**: Verify functionality works as expected
4. **Documentation**: Ensure docs are updated appropriately

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Bug Description**
A clear description of the bug.

**To Reproduce**
Steps to reproduce the behavior:
1. Create circuit with '...'
2. Apply gate '...'
3. Execute and measure
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- OS: [e.g., macOS 14.0]
- Node.js version: [e.g., 18.17.0]
- q5m.js version: [e.g., 0.1.0]

**Additional Context**
Any other relevant information.
```

### Feature Requests

```markdown
**Feature Description**
Clear description of the desired feature.

**Use Case**
Why is this feature needed? What problem does it solve?

**Proposed Solution**
If you have ideas for implementation.

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Any other relevant information.
```

## Documentation

### Code Documentation

1. **JSDoc comments** for all public APIs:

```typescript
/**
 * Creates a quantum circuit with the specified number of qubits.
 * 
 * @param numQubits - The number of qubits in the circuit (must be positive)
 * @throws {Error} If numQubits is not positive
 * 
 * @example
 * ```typescript
 * const circuit = new Circuit(3);
 * circuit.h(0).cnot(0, 1).measure();
 * ```
 */
constructor(numQubits: number) {
  // Implementation...
}
```

2. **README updates** for new features
3. **Type definitions** must be complete and accurate
4. **Examples** for complex functionality

### API Documentation

- Automatically generated using TypeDoc
- Include usage examples
- Document breaking changes
- Provide migration guides

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. Update CHANGELOG.md
2. Run full test suite
3. Update version in package.json
4. Create git tag
5. Generate release notes
6. Publish to npm

## Getting Help

- **Issues**: For bug reports and feature requests
- **Discussions**: For questions and general discussion
- **Email**: For security issues or private matters

## Recognition

Contributors will be recognized in:
- CHANGELOG.md for significant contributions
- README.md contributors section
- Git commit history

Thank you for contributing to q5m.js! 🚀
