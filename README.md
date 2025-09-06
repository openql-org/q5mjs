# q5m.js

[![npm version](https://badge.fury.io/js/q5m.svg)](https://www.npmjs.com/package/q5m)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)

A complete type-safe TypeScript library for quantum computing simulations with comprehensive algorithm support, and seamless multi-framework integration.

## ✨ Features

- 📝 **TypeScript First** - Complete type safety with strict mode, 90%+ test coverage
- 🔬 **Advanced Quantum Simulation** - Complete quantum computing primitives with state-of-the-art optimization
- 🔧 **Flexible APIs** - Multiple entry points and API styles for different use cases
- ⚡ **Modern Tooling** - Built with Vite, esbuild, Jest, and Cypress for optimal DX
- 🧪 **Well Tested** - 2000+ comprehensive tests across unit, integration, and E2E scenarios
- 🌐 **Multi-Framework** - Native support for React, Vue, Angular, and vanilla JavaScript
- 🎲 **Algorithm Library** - Built-in quantum algorithms with optimized implementations
- 📊 **Rich Visualization** - Circuit diagrams, state visualization, and export capabilities
- 🔌 **Extensible Architecture** - Plugin system for custom extensions and integrations
- 🚀 **High Performance** - Hybrid sparse/dense quantum states with CSR format, up to 45% performance improvement
- 🎯 **Memory Optimized** - Intelligent state representation switching, 28% memory reduction for large systems  

## 📦 Installation

```bash
npm install q5m
```

## 🚀 Quick Start

### Basic Quantum Circuit

```typescript
import { Circuit } from 'q5m';

// Create a 2-qubit Bell state
const circuit = new Circuit(2);
circuit.h(0).cnot(0, 1);

const result = circuit.execute();
console.log('Bell state probabilities:', result.state.probabilities());
```

### Advanced Usage with Custom Initial State

```typescript
import { Circuit, QubitState, complex } from 'q5m';

// Create custom initial state
const customState = new QubitState(2, [
  complex(0.5, 0),   // |00⟩
  complex(0, 0.5),   // |01⟩  
  complex(0.5, 0),   // |10⟩
  complex(0, -0.5)   // |11⟩
]);

const circuit = new Circuit(2);
circuit.h(0).measure(0);
const result = circuit.run(customState);

if( result.hasMeasurements ) {
    for ( const m of result.measurements ){
        console.log('Measurement results: [', m.measureIndex,'] ', m.outcome, '[', m.probability , '%]');
        console.log('After state vector:', m.collapsedState.stateVector);
    }
} else {
    console.log('After state vector:', result.state.stateVector);
}
```

## 📚 Package Structure & Entry Points

q5m.js provides optimized entry points for different use cases:

### 🎯 Core Package (Lightweight)
*Minimal bundle (~65KB) - Essential quantum computing primitives*

```typescript
import { Circuit, QubitState } from 'q5m/core';
// Only core quantum circuit and state functionality
```

### 📦 Standard Import (Full Features)
*Complete library (~195KB) - All features including algorithms*

```typescript
import { 
  Circuit, 
  groverSearch, 
  quantumFourierTransform,
  exportToQiskit 
} from 'q5m';
```

### 🌐 Browser/CDN
*UMD build for direct browser usage*

```html
<script src="https://unpkg.com/q5m/dist/q5m.min.js"></script>
<script>
  const circuit = new Q5M.Circuit(3);
  circuit.h(0).cnot(0, 1).cnot(1, 2);
  console.log(circuit.execute().state.probabilities());
</script>
```

### 📱 Framework-Specific Usage

#### React Integration
```tsx
import React, { useState } from 'react';
import { Circuit, CircuitRenderer } from 'q5m';

function QuantumApp() {
  const [circuit] = useState(() => {
    const c = new Circuit(2);
    return c.h(0).cnot(0, 1);
  });

  return (
    <div>
      <h1>Bell State Circuit</h1>
      <pre>{circuit.toString()}</pre>
      <p>Probabilities: {JSON.stringify(circuit.execute().state.probabilities())}</p>
    </div>
  );
}
```

## 🔬 Core Concepts

### Quantum Circuits
Central abstraction for building and executing quantum computations:

```typescript
import { Circuit } from 'q5m';

// Create circuit with specified number of qubits
const circuit = new Circuit(3);

// Fluent API for gate composition
circuit
  .h(0)                    // Hadamard gate on qubit 0
  .cnot(0, 1)             // CNOT from qubit 0 to 1
  .rz(Math.PI / 4, 2)     // Z rotation on qubit 2
  .measure([0, 1, 2]);    // Measure all qubits

// Execute and get results
const result = circuit.execute();
console.log('Final state:', result.amplitudes());
console.log('Measurements:', result.measurements);
```

### Quantum States
Advanced state representation with automatic optimization:

```typescript
import { QubitState, complex } from 'q5m';

// Automatic sparse/dense optimization
const state = new QubitState(10); // 10-qubit state
console.log('Memory usage:', state.memoryUsage(), 'bytes');

// Access individual amplitudes efficiently
const amplitude = state.amplitude(0b1010101010);
console.log('Amplitude for |1010101010⟩:', amplitude.toString());

// State operations
const prob = state.probability(0b0000000000);
console.log('Probability of |0000000000⟩:', prob);
```

## 🎲 Built-in Quantum Algorithms

### Grover's Search Algorithm
```typescript
import { groverSearch, groverSearchForItem } from 'q5m';

// Search for specific bit pattern
const result = groverSearchForItem(4, '1010'); // 4 qubits, search for |1010⟩
console.log('Found item with probability:', result.probability(0b1010));

// Custom oracle search
const oracle = (bitString: string) => bitString === '1100';
const searchResult = groverSearch(4, oracle);
```

### Quantum Fourier Transform
```typescript
import { quantumFourierTransform, qftEncode } from 'q5m';

// Apply QFT to encode classical data
const data = [1, 2, 3, 4];
const qftCircuit = qftEncode(data);
const result = qftCircuit.execute();

console.log('QFT encoded state:', result.amplitudes());
```

### Quantum Phase Estimation
```typescript
import { quantumPhaseEstimation, estimateEigenstatePhase } from 'q5m';

// Estimate phase of a unitary operator
const unitary = [
  [complex(Math.cos(0.3), 0), complex(-Math.sin(0.3), 0)],
  [complex(Math.sin(0.3), 0), complex(Math.cos(0.3), 0)]
];

const phase = estimateEigenstatePhase(unitary, [complex(1, 0), complex(0, 0)], 4);
console.log('Estimated phase:', phase);
```

## 🔄 Export & Integration

### Export to Other Quantum Frameworks
```typescript
import { exportToQiskit, exportToOpenQASM, exportToCirq } from 'q5m';

const circuit = new Circuit(2);
circuit.h(0).cnot(0, 1);

// Export to various formats
const qiskitCode = exportToQiskit(circuit);
const qasmCode = exportToOpenQASM(circuit);
const cirqCode = exportToCirq(circuit);

console.log('Qiskit:\n', qiskitCode);
console.log('OpenQASM:\n', qasmCode);
console.log('Cirq:\n', cirqCode);
```

## 📊 Performance Features

### Memory Optimization
```typescript
import { Circuit, QubitState } from 'q5m';

// Automatic sparse optimization for large systems
const largeCircuit = new Circuit(20); // 20 qubits
largeCircuit.h(0); // Most amplitudes remain zero

const state = largeCircuit.execute();
console.log('Representation:', state.isDense ? 'Dense' : 'Sparse');
console.log('Memory usage:', state.memoryUsage(), 'bytes');
```

### Performance Monitoring
```typescript
import { Circuit } from 'q5m';

// Built-in performance tracking
const startTime = performance.now();
const circuit = new Circuit(15);

// Build complex circuit
for (let i = 0; i < 10; i++) {
  circuit.h(i % 15).cnot(i % 15, (i + 1) % 15);
}

const result = circuit.execute();
const endTime = performance.now();

console.log(`Execution time: ${endTime - startTime}ms`);
console.log('Final state sparsity:', result.sparsity);
```

## 🎨 Visualization

### Circuit Visualization
```typescript
import { Circuit, CircuitRenderer } from 'q5m';

const circuit = new Circuit(3);
circuit.h(0).cnot(0, 1).cnot(1, 2);

// ASCII representation
console.log(circuit.toString());

// Rich visualization (if available)
if (typeof window !== 'undefined') {
  const renderer = new CircuitRenderer(circuit);
  document.body.appendChild(renderer.toSVG());
}
```

## 📖 API Reference

### Core Classes
- **`Circuit`** - Main quantum circuit builder and executor
- **`QubitState`** - Quantum state with automatic optimization
- **`Q5mState`** - Base quantum state abstraction
- **Gate Classes** - Individual quantum gate implementations

### Algorithms Module
- **`groverSearch`** - Grover's quantum search algorithm
- **`quantumFourierTransform`** - QFT implementation
- **`quantumPhaseEstimation`** - Phase estimation algorithm
- **`amplitudeAmplification`** - Generalized amplitude amplification

### Math Utilities
- **`complex`** - Complex number operations
- **`createUnitary`** - Unitary matrix construction
- **`matXvec`** - Optimized matrix-vector multiplication

### Export Functions
- **`exportToQiskit`** - Generate Qiskit Python code
- **`exportToOpenQASM`** - Generate OpenQASM 2.0 code
- **`exportToCirq`** - Generate Google Cirq code

## 🔧 Configuration

### TypeScript Configuration
q5m.js is built with strict TypeScript for maximum type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Build Targets
- **ES2022** - Modern JavaScript features
- **Node.js 18+** - Server-side compatibility  
- **Modern browsers** - Chrome 91+, Firefox 90+, Safari 14+

## 🧪 Development & Testing

### Running Tests
```bash
# Unit tests
npm test

# Integration tests  
npm run test:integration

# E2E tests across frameworks
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Performance Benchmarks
```bash
# Basic performance tests
npm run benchmark

# Detailed performance analysis
npm run profile

# Memory usage analysis
npm run test:memory
```

## 📈 Performance Characteristics

### Benchmark Results
- **Small circuits (2-5 qubits)**: ~0.1ms execution time
- **Medium circuits (10-15 qubits)**: ~10ms execution time  
- **Large sparse circuits (20+ qubits)**: ~100ms execution time
- **Memory usage**: 40-60% reduction vs dense representation for sparse states

### Optimization Features
- Automatic sparse/dense state switching
- CSR (Compressed Sparse Row) format for very sparse states
- Optimized complex number operations
- TypedArray usage for memory efficiency
- SIMD-friendly algorithms where possible

## 🤝 Contributing

We welcome contributions! This project follows strict code quality standards and comprehensive testing practices.

### Quick Start for Contributors
```bash
git clone https://github.com/openql-org/q5mjs.git
cd q5mjs
npm install
npm run dev
```

### Code Quality Standards
- **TypeScript**: Strict mode enabled with zero `any` types
- **Testing**: Jest with 90%+ coverage requirement (2000+ tests)
- **Linting**: ESLint + Prettier with zero warnings policy
- **CI/CD**: GitHub Actions with multi-platform testing

For complete contributing guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md) which covers:
- Development setup and workflow
- Coding standards and type safety requirements
- Testing guidelines and coverage requirements
- Commit message format and pull request process
- Documentation standards and API guidelines

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 📚 Documentation

- **[Getting Started](docs/getting-started.md)** - Quick start guide and tutorials
- **[API Documentation](docs/api-overview.md)** - Complete API reference
- **[Contributing Guidelines](CONTRIBUTING.md)** - Development workflow and standards
- **[GitHub Repository](https://github.com/openql-org/q5mjs)** - Source code and issues
- **[npm Package](https://www.npmjs.com/package/q5m)** - Package on npm registry

## 🙏 Acknowledgments

Built with inspiration from the quantum computing community and leveraging modern web technologies for optimal performance and developer experience.

---

*q5m.js - Making quantum computing accessible through elegant TypeScript APIs*
