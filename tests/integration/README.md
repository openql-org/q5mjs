# Integration Tests

This directory contains integration tests that verify the interaction between multiple components and end-to-end functionality.

## Structure

```
integration/
├── core/                  # Core component performance tests
│   └── MultiQubitGates.performance.test.ts
├── optimizations/         # Memory and performance optimization tests
│   ├── circuit-optimization.test.ts
│   └── quantum-state-optimization.test.ts
└── README.md
```

## Test Categories

### Core Performance (`core/`)
Tests that verify performance characteristics of core quantum components with large system sizes:
- Multi-qubit gate operations on systems with 6+ qubits
- Memory usage and computational efficiency for large matrices
- Edge cases with maximum reasonable qubit counts
- Stress tests for repeated operations on large systems

### Optimizations (`optimizations/`)
Tests that verify the automatic memory and performance optimizations work correctly across the system:
- Automatic memory optimization for large circuits (>12 qubits)
- Sparse/dense representation switching
- Memory usage during quantum operations
- Performance characteristics with real quantum algorithms

## Running Integration Tests

```bash
# Run all integration tests
npm test -- tests/integration

# Run specific category
npm test -- tests/integration/optimizations

# Run with coverage
npm run test:coverage -- tests/integration
```

## Key Testing Points

1. **Memory Efficiency**: Verify 99.99% memory reduction for sparse states
2. **Automatic Optimization**: Confirm optimization triggers at >12 qubits
3. **API Compatibility**: Ensure all APIs work with optimizations
4. **Real-world Algorithms**: Test with Grover, QFT, etc.
5. **State Transitions**: Verify sparse/dense switching logic