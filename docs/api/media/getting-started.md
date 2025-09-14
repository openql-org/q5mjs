# - dynamically loaded. Getting Started with q5m.js

## Quick Installation

### Package Manager
```bash
npm install q5m
# or
yarn add q5m
```

### Browser CDN
```html
<script src="https://unpkg.com/@q5m/q5m/dist/q5m.min.js"></script>
```

### ES Modules (Modern Browsers)
```javascript
import { Circuit } from 'https://unpkg.com/@q5m/q5m/dist/index.mjs'
```

## Your First Quantum Circuit

Let's start with the most famous quantum example - creating a Bell state that demonstrates quantum entanglement:

### Basic Bell State
```typescript
import { Circuit } from '@q5m/q5m';

// Create a 2-qubit quantum circuit
const circuit = new Circuit(2);

// Apply Hadamard gate to qubit 0 (creates superposition)
circuit.h(0);

// Apply CNOT gate with control=0, target=1 (creates entanglement)
circuit.cnot(0, 1);

// Execute the circuit and get the final quantum state
const result = circuit.execute();

// View the probabilities of measuring each basis state
console.log('Bell state probabilities:', result.probabilities());
// Output: [0.5, 0, 0, 0.5] - equal probability of |00⟩ and |11⟩

// Get specific amplitude
const amplitude00 = result.amplitude(0b00); // |00⟩ state
const amplitude11 = result.amplitude(0b11); // |11⟩ state
console.log('|00⟩ amplitude:', amplitude00.toString());
console.log('|11⟩ amplitude:', amplitude11.toString());
```

### Understanding the Result
The Bell state creates a quantum superposition where measuring the qubits will give you either `|00⟩` or `|11⟩` with equal probability (50% each). The qubits are now entangled - measuring one instantly determines the other!

## Core Concepts

### 1. Quantum Circuits
Circuits are the primary way to build quantum computations:

```typescript
import { Circuit } from '@q5m/q5m';

// Create circuit with specified number of qubits
const circuit = new Circuit(3); // 3-qubit system

// Fluent API allows method chaining
circuit
  .h(0)                    // Hadamard on qubit 0
  .cnot(0, 1)             // CNOT from 0 to 1  
  .rz(Math.PI / 4, 2)     // Z-rotation on qubit 2
  .measure([0, 1, 2]);    // Measure all qubits

const result = circuit.execute();
console.log('Final amplitudes:', result.amplitudes());
console.log('Measurements:', result.measurements);
```

### 2. Available Gates

#### Single-Qubit Gates
```typescript
const circuit = new Circuit(1);

// Pauli gates
circuit.x(0);  // Pauli-X (bit flip)
circuit.y(0);  // Pauli-Y  
circuit.z(0);  // Pauli-Z (phase flip)

// Hadamard (creates superposition)
circuit.h(0);

// Phase gates
circuit.s(0);  // S gate (√Z)
circuit.t(0);  // T gate (√S)
circuit.phase(Math.PI / 4, 0); // Arbitrary phase

// Rotation gates
circuit.rx(Math.PI / 2, 0);  // X rotation
circuit.ry(Math.PI / 3, 0);  // Y rotation  
circuit.rz(Math.PI / 6, 0);  // Z rotation
```

#### Two-Qubit Gates
```typescript
const circuit = new Circuit(2);

// CNOT (controlled-X)
circuit.cnot(0, 1);  // control=0, target=1
circuit.cx(0, 1);    // alias for cnot

// Other controlled gates
circuit.cz(0, 1);    // Controlled-Z
circuit.cy(0, 1);    // Controlled-Y
circuit.ch(0, 1);    // Controlled-Hadamard

// SWAP gate
circuit.swap(0, 1);

// Controlled phase
circuit.cp(Math.PI / 2, 0, 1);
```

#### Measurement Gates
```typescript
const circuit = new Circuit(2);
circuit.h(0).cnot(0, 1);

// Measure in different bases
circuit.mz(0);  // Z-basis measurement
circuit.mx(1);  // X-basis measurement  
circuit.my(0);  // Y-basis measurement

// Measure with arbitrary phase
circuit.mp(Math.PI / 4, 1); // Measure with phase π/4
```

### 3. Working with Quantum States

#### Direct State Access
```typescript
import { Circuit, QubitState, complex } from '@q5m/q5m';

const circuit = new Circuit(2);
circuit.h(0).cnot(0, 1);
const state = circuit.execute();

// Get all amplitudes
const amplitudes = state.amplitudes();
console.log('State vector:', amplitudes);

// Get specific amplitude (using binary notation)
const amp01 = state.amplitude(0b01); // |01⟩ state
console.log('Amplitude of |01⟩:', amp01.toString());

// Get probabilities
const probs = state.probabilities();
console.log('Measurement probabilities:', probs);

// Get specific probability
const prob11 = state.probability(0b11); // P(|11⟩)
console.log('Probability of |11⟩:', prob11);
```

#### Custom Initial States
```typescript
import { Circuit, QubitState, complex } from '@q5m/q5m';

// Create custom 2-qubit initial state
const customState = new QubitState(2, [
  complex(1/Math.sqrt(2), 0),  // |00⟩ coefficient
  complex(0, 0),               // |01⟩ coefficient  
  complex(0, 0),               // |10⟩ coefficient
  complex(1/Math.sqrt(2), 0),  // |11⟩ coefficient
]);

// Use custom state in circuit
const circuit = new Circuit(2, customState);
circuit.h(0); // Apply Hadamard to qubit 0

const result = circuit.execute();
console.log('Result:', result.probabilities());
```

## Built-in Quantum Algorithms

### Grover's Search Algorithm
Quantum algorithm for searching unsorted databases with quadratic speedup:

```typescript
import { groverSearch, groverSearchForItem } from '@q5m/q5m';

// Search for specific bit pattern
const numQubits = 4;
const targetItem = '1010'; // Looking for |1010⟩

const result = groverSearchForItem(numQubits, targetItem);

// Check if we found the target
const targetIndex = parseInt(targetItem, 2);
const probability = result.probability(targetIndex);
console.log(`Found ${targetItem} with probability: ${probability}`);

// Custom search with oracle function
const oracle = (bitString: string) => {
  // Search for any string with exactly 2 ones  
  return (bitString.match(/1/g) || []).length === 2;
};

const customResult = groverSearch(numQubits, oracle);
console.log('Search results:', customResult.probabilities());
```

### Quantum Fourier Transform
Fundamental quantum algorithm for period finding and other applications:

```typescript
import { quantumFourierTransform, qftEncode } from '@q5m/q5m';

// Apply QFT to encode classical data
const data = [1, 0, 1, 0]; // Classical bit array
const qftCircuit = qftEncode(data);
const result = qftCircuit.execute();

console.log('QFT encoded state:', result.amplitudes());

// Apply QFT directly to an existing circuit
const circuit = new Circuit(3);
circuit.h(0).h(1).h(2); // Start with uniform superposition

const qftResult = quantumFourierTransform(circuit);
console.log('QFT result:', qftResult.execute().amplitudes());
```

### Quantum Phase Estimation
Estimate eigenvalues of unitary operators:

```typescript
import { estimateEigenstatePhase, createUnitary } from '@q5m/q5m';

// Create a unitary matrix (rotation by some angle θ)
const theta = 0.3;
const unitary = [
  [complex(Math.cos(theta), 0), complex(-Math.sin(theta), 0)],
  [complex(Math.sin(theta), 0), complex(Math.cos(theta), 0)]
];

// Initial eigenstate |0⟩
const eigenstate = [complex(1, 0), complex(0, 0)];

// Estimate phase with 4 ancilla qubits
const estimatedPhase = estimateEigenstatePhase(unitary, eigenstate, 4);
console.log('Estimated phase:', estimatedPhase);
console.log('Actual phase:', theta / (2 * Math.PI));
```

## Performance & Optimization

### Automatic State Optimization
q5m.js automatically optimizes quantum state representation based on sparsity:

```typescript
import { Circuit } from '@q5m/q5m';

// Large sparse circuit - most amplitudes remain zero
const circuit = new Circuit(15);
circuit.h(0); // Only qubit 0 in superposition

const state = circuit.execute();
console.log('Memory usage:', state.memoryUsage(), 'bytes');
console.log('Sparse representation:', !state.isDense);
```

### Performance Monitoring
```typescript
import { Circuit } from '@q5m/q5m';

// Monitor execution performance
const startTime = performance.now();

const circuit = new Circuit(10);
for (let i = 0; i < 9; i++) {
  circuit.h(i).cnot(i, i + 1);
}

const result = circuit.execute();
const endTime = performance.now();

console.log(`Execution time: ${endTime - startTime}ms`);
console.log('State sparsity:', result.sparsity);
```

## Export to Other Quantum Frameworks

Convert q5m.js circuits to other popular quantum computing frameworks:

### Qiskit (Python)
```typescript
import { Circuit, exportToQiskit } from '@q5m/q5m';

const circuit = new Circuit(2);
circuit.h(0).cnot(0, 1).measure([0, 1]);

const qiskitCode = exportToQiskit(circuit);
console.log('Qiskit code:\n', qiskitCode);
```

### OpenQASM
```typescript
import { Circuit, exportToOpenQASM } from '@q5m/q5m';

const circuit = new Circuit(2);
circuit.h(0).cnot(0, 1);

const qasmCode = exportToOpenQASM(circuit);
console.log('OpenQASM:\n', qasmCode);
```

### Google Cirq
```typescript
import { Circuit, exportToCirq } from '@q5m/q5m';

const circuit = new Circuit(3);
circuit.h(0).cnot(0, 1).cnot(1, 2);

const cirqCode = exportToCirq(circuit);
console.log('Cirq code:\n', cirqCode);
```

## Framework Integration

### React Application
```tsx
import React, { useState, useEffect } from 'react';
import { Circuit, groverSearchForItem } from '@q5m/q5m';

function QuantumSearchApp() {
  const [searchResult, setSearchResult] = useState<number[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const runGroverSearch = async () => {
    setIsSearching(true);
    
    try {
      const result = groverSearchForItem(4, '1100');
      const probs = result.probabilities();
      setSearchResult(probs);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div>
      <h1>Quantum Search Demo</h1>
      <button onClick={runGroverSearch} disabled={isSearching}>
        {isSearching ? 'Searching...' : 'Run Grover Search'}
      </button>
      
      {searchResult.length > 0 && (
        <div>
          <h3>Search Results:</h3>
          <pre>{JSON.stringify(searchResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default QuantumSearchApp;
```

### Vue.js Application
```vue
<template>
  <div>
    <h1>Bell State Generator</h1>
    <button @click="generateBellState">Generate Bell State</button>
    
    <div v-if="bellState">
      <h3>Bell State Amplitudes:</h3>
      <ul>
        <li v-for="(amp, index) in bellState" :key="index">
          |{{ index.toString(2).padStart(2, '0') }}⟩: {{ amp.toString() }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { Circuit } from '@q5m/q5m';

export default {
  data() {
    return {
      bellState: null
    };
  },
  methods: {
    generateBellState() {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      const result = circuit.execute();
      this.bellState = result.amplitudes();
    }
  }
};
</script>
```

---

*Ready to explore the quantum world? Start experimenting with these examples and build your first quantum application with q5m.js!*
