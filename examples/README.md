# q5m.js Examples

This directory contains comprehensive examples demonstrating the capabilities of q5m.js, organized by learning level and use case.

## Directory Structure

### `tutorials/` - Step-by-step Learning
Organized examples that correspond to the documentation tutorials:

- **[01-introduction/](tutorials/01-introduction/)** - Your first quantum circuits
- **[02-basic-gates/](tutorials/02-basic-gates/)** - Single-qubit gate operations
- **[03-multi-qubit/](tutorials/03-multi-qubit/)** - Two-qubit and multi-qubit operations
- **[04-measurements/](tutorials/04-measurements/)** - Quantum measurements
- **[05-algorithms/](tutorials/05-algorithms/)** - Quantum algorithm implementations

### `cookbook/` - Practical Recipes
Ready-to-use implementations for common quantum computing patterns:

- **[create-bell-state.ts](cookbook/create-bell-state.ts)** - Generate all four Bell states
- **[build-toffoli.ts](cookbook/build-toffoli.ts)** - Construct Toffoli (CCNOT) gates
- **[implement-grover.ts](cookbook/implement-grover.ts)** - Grover's search algorithm
- **[build-qft.ts](cookbook/build-qft.ts)** - Quantum Fourier Transform
- **[quantum-teleportation.ts](cookbook/quantum-teleportation.ts)** - Quantum teleportation protocol
- **[create-ghz-state.ts](cookbook/create-ghz-state.ts)** - GHZ states for multi-qubit entanglement
- **[deutsch-jozsa.ts](cookbook/deutsch-jozsa.ts)** - Deutsch-Jozsa algorithm for function classification

### `showcase/` - Advanced Features
Demonstrations of advanced q5m.js capabilities:

- **[export-formats.ts](showcase/export-formats.ts)** - Export to Qiskit, Cirq, and OpenQASM

### `browser/` - Interactive Web Examples
Browser-based examples showcasing q5m.js integration with web frameworks:

#### `integrations/` - Third-party Library Integrations
- **[d3js/probability-distribution.html](browser/integrations/d3js/probability-distribution.html)** - Interactive probability visualization with D3.js
- **[chartjs/measurement-stats.html](browser/integrations/chartjs/measurement-stats.html)** - Measurement statistics with Chart.js
- **[threejs/circuit-3d.html](browser/integrations/threejs/circuit-3d.html)** - 3D quantum circuit visualization with Three.js
- **[threejs/bloch-sphere.html](browser/integrations/threejs/bloch-sphere.html)** - Interactive Bloch sphere visualization

#### `frameworks/` - Frontend Framework Examples
- **[angular/01-entanglement/](browser/frameworks/angular/01-entanglement/)** - Quantum entanglement demo with Angular
- **[react/01-circuit-builder/](browser/frameworks/react/01-circuit-builder/)** - Interactive circuit builder with React
- **[vue/01-algorithm-visualizer/](browser/frameworks/vue/01-algorithm-visualizer/)** - Quantum algorithms with Vue.js

## Quick Start

### Node.js Examples

#### Run All Examples
```bash
# From the project root
npm run examples

# Or directly
npx tsx examples/run.ts
```

### Browser Examples

Browser examples require a local HTTP server to avoid CORS issues. Use one of these methods:

#### Method 1: Using npx serve (Recommended)
```bash
# Install serve globally (one-time setup)
npm install -g serve

# Or use directly with npx (no installation needed)
npx serve

# Then open examples in your browser:
# http://localhost:3000/examples/browser/integrations/d3js/probability-distribution.html
# http://localhost:3000/examples/browser/integrations/threejs/circuit-3d.html
# http://localhost:3000/examples/browser/frameworks/angular/01-entanglement/
```

#### Method 2: Using Python's built-in server
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Then visit:
# http://localhost:8000/examples/browser/integrations/d3js/probability-distribution.html
# http://localhost:8000/examples/browser/frameworks/angular/01-entanglement/
```

#### Method 3: Using Node.js http-server
```bash
# Install http-server globally (one-time setup)
npm install -g http-server

# Start server
http-server

# Access examples at:
# http://localhost:8080/examples/browser/integrations/...
```

> **Note**: Direct file opening (file://) may not work for framework examples due to CORS restrictions. Always use a local HTTP server for the best experience.

### Run Individual Examples
```bash
# Introduction examples
npx tsx examples/tutorials/01-introduction/hello-quantum.ts
npx tsx examples/tutorials/01-introduction/single-qubit.ts

# Cookbook recipes
npx tsx examples/cookbook/create-bell-state.ts
npx tsx examples/cookbook/build-toffoli.ts
npx tsx examples/cookbook/create-ghz-state.ts
npx tsx examples/cookbook/deutsch-jozsa.ts

# Showcase
npx tsx examples/showcase/export-formats.ts
```

### Run by Category
```bash
# All tutorials
npx tsx examples/run.ts tutorials

# All cookbook recipes
npx tsx examples/run.ts cookbook

# All showcase examples
npx tsx examples/run.ts showcase
```

## Learning Path

### For Beginners
1. Start with [hello-quantum.ts](tutorials/01-introduction/hello-quantum.ts)
2. Explore [single-qubit.ts](tutorials/01-introduction/single-qubit.ts)
3. Learn basic gates in [tutorials/02-basic-gates/](tutorials/02-basic-gates/)
4. Try [create-bell-state.ts](cookbook/create-bell-state.ts) recipe

### For Intermediate Users
1. Work through [tutorials/03-multi-qubit/](tutorials/03-multi-qubit/)
2. Implement [build-toffoli.ts](cookbook/build-toffoli.ts)
3. Try [implement-grover.ts](cookbook/implement-grover.ts)
4. Explore [tutorials/05-algorithms/](tutorials/05-algorithms/)

### For Advanced Users
1. Study all cookbook recipes
2. Review [export-formats.ts](showcase/export-formats.ts)
3. Create custom quantum algorithms
4. Contribute new examples!

## Example Categories

### Quantum Fundamentals
- Superposition and interference
- Quantum entanglement
- Measurement and collapse
- Gate operations and circuits

### Quantum Algorithms
- Grover's search algorithm
- Quantum Fourier Transform
- Phase estimation
- Amplitude amplification

### Quantum Protocols
- Quantum teleportation
- Superdense coding
- Quantum key distribution basics
- Error correction concepts

### Practical Applications
- Circuit optimization techniques
- State preparation methods
- Custom gate construction
- Export and integration workflows

## Requirements

### Node.js Examples
- Node.js 16+ or 18+
- TypeScript 4.9+
- tsx for running TypeScript files directly

### Browser Examples
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- Local HTTP server (`serve`, `http-server`, or Python's built-in server)
- Internet connection for CDN resources (Angular, React, Vue, D3.js, Chart.js, Three.js)

## Adding New Examples

When contributing new examples, follow these guidelines:

### File Structure
```typescript
/**
 * Example Title
 * 
 * Brief description of what this example demonstrates.
 * 
 * Theory:
 * Relevant theoretical background and mathematical formulation.
 */

import { Circuit } from '../../src/index.js';

export function exampleFunction(): void {
  console.log('=== Example Title ===\\n');
  
  // Implementation with detailed comments
  const circuit = new Circuit(2);
  // ... circuit operations
  
  const state = circuit.execute();
  
  // Show results with explanations
  console.log('Results:');
  // ... output results
  
  console.log('\\n✓ Example completed successfully!');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleFunction();
}
```

### Documentation
- Include theoretical background in comments
- Explain each step of the quantum circuit
- Show expected outputs in comments
- Provide mathematical formulations where relevant
- Add README.md files for new directories

### Testing
- Verify examples run without errors
- Include meaningful output and explanations
- Test with different input parameters where applicable

## Integration

These examples integrate with:
- [q5m.js Documentation](../docs/)
- [Tutorial Series](../docs/tutorial/en/)
- [API Reference](../docs/api-overview.md)
- [Getting Started Guide](../docs/getting-started.md)

## Contributing

We welcome contributions of new examples! Please:
1. Follow the established patterns and structure
2. Include comprehensive documentation
3. Test your examples thoroughly
4. Submit pull requests with clear descriptions

## Related Resources

- [q5m.js API Documentation](../docs/api/index.html)
- [Quantum Computing Textbooks](../docs/README.md#resources)
- [IBM Qiskit Documentation](https://qiskit.org/documentation/)
- [Google Cirq Documentation](https://quantumai.google/cirq)

---

*Ready to explore the quantum world? Start with `hello-quantum.ts` and begin your quantum computing journey!*