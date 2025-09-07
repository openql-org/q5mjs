# Quantum Algorithms

Quantum algorithms are where the power of quantum computing really shines! They can solve certain problems exponentially faster than classical algorithms by leveraging quantum phenomena like superposition, entanglement, and interference. Let's explore the most important quantum algorithms implemented in q5m.js.

## Why Quantum Algorithms Work

Quantum algorithms achieve speedup through:
1. **Superposition**: Process multiple inputs simultaneously
2. **Entanglement**: Create complex correlations between qubits
3. **Interference**: Amplify correct answers and cancel wrong ones
4. **Parallelism**: Explore solution spaces exponentially faster

## Grover's Search Algorithm

Grover's algorithm finds a marked item in an unsorted database quadratically faster than classical search.

### The Problem
- **Classical**: Search N items → O(N) time
- **Quantum**: Search N items → O(√N) time

### How It Works

```typescript
import { groverSearchForItem } from 'q5m';

// Search for the item "101" in a 3-qubit space (8 possible items)
const searchTarget = '101';
const numQubits = 3;

const searchState = groverSearchForItem(numQubits, searchTarget);

console.log('Search probabilities:', searchState.probabilities());
// The probability at index 5 (binary 101) should be high!

// Check the probability of finding the target item
const targetIndex = parseInt(searchTarget, 2);
console.log(`Probability of finding ${searchTarget}:`, searchState.probability(targetIndex));
```

### Manual Grover Implementation

Let's understand how Grover's algorithm works by building it step by step:

```typescript
import { Circuit } from 'q5m';

function manualGrover(numQubits: number, targetIndex: number, iterations?: number): Circuit {
  const circuit = new Circuit(numQubits);
  
  // Step 1: Initialize superposition
  for (let i = 0; i < numQubits; i++) {
    circuit.h(i);
  }
  
  // Calculate optimal iterations
  const N = 2 ** numQubits;
  const optimalIterations = iterations ?? Math.floor(Math.PI * Math.sqrt(N) / 4);
  
  // Step 2: Grover iterations
  for (let iter = 0; iter < optimalIterations; iter++) {
    // Oracle: flip phase of target state
    applyOracle(circuit, targetIndex, numQubits);
    
    // Diffusion operator: inversion about average
    applyDiffusion(circuit, numQubits);
  }
  
  return circuit;
}

function applyOracle(circuit: Circuit, targetIndex: number, numQubits: number) {
  // Convert target index to binary and apply controlled operations
  const binaryTarget = targetIndex.toString(2).padStart(numQubits, '0');
  
  // Flip qubits that should be 0 in target
  for (let i = 0; i < numQubits; i++) {
    if (binaryTarget[numQubits - 1 - i] === '0') {
      circuit.x(i);
    }
  }
  
  // Multi-controlled Z gate (flips phase if all qubits are 1)
  if (numQubits === 1) {
    circuit.z(0);
  } else if (numQubits === 2) {
    circuit.cz(0, 1);
  } else {
    // For 3+ qubits, approximate with multiple gates
    // This is simplified - real implementation uses ancilla qubits
    circuit.cz(0, 1);
    for (let i = 2; i < numQubits; i++) {
      circuit.cz(0, i);
    }
  }
  
  // Flip back the qubits we flipped
  for (let i = 0; i < numQubits; i++) {
    if (binaryTarget[numQubits - 1 - i] === '0') {
      circuit.x(i);
    }
  }
}

function applyDiffusion(circuit: Circuit, numQubits: number) {
  // Apply H to all qubits
  for (let i = 0; i < numQubits; i++) {
    circuit.h(i);
  }
  
  // Apply oracle for |00...0⟩ state (index 0)
  applyOracle(circuit, 0, numQubits);
  
  // Apply H to all qubits again
  for (let i = 0; i < numQubits; i++) {
    circuit.h(i);
  }
}

// Test manual Grover
const target = 5; // Binary 101
const circuit = manualGrover(3, target, 2);
const state = circuit.execute();
console.log('Manual Grover result:', state.probabilities());
```

### Grover Success Probability

```typescript
import { groverSuccessProbability } from 'q5m';

function analyzeGroverPerformance(numQubits: number, targetItem: string) {
  const N = 2 ** numQubits;
  const targetIndex = parseInt(targetItem, 2);
  
  console.log(`\nGrover Analysis for ${numQubits} qubits:`);
  console.log(`Database size: ${N}`);
  console.log(`Target: ${targetItem} (index ${targetIndex})`);
  
  // Test different iteration counts
  for (let iterations = 1; iterations <= Math.ceil(Math.PI * Math.sqrt(N) / 2); iterations++) {
    const prob = groverSuccessProbability(N, 1, iterations);
    console.log(`${iterations} iterations: ${(prob * 100).toFixed(1)}% success`);
  }
}

analyzeGroverPerformance(3, '101');
analyzeGroverPerformance(4, '1010');
```

## Quantum Fourier Transform (QFT)

The QFT is the quantum analog of the classical Fast Fourier Transform and is a key component in many quantum algorithms.

### Basic QFT

```typescript
import { createQFTCircuit, quantumFourierTransform } from 'q5m';

// Create a 3-qubit QFT circuit
const qftCircuit = createQFTCircuit(3);

// Prepare an input state (example: |001⟩)
const circuit = new Circuit(3);
circuit.x(2); // Set last qubit to |1⟩
const inputState = circuit.execute();

// Apply QFT
const qftResult = quantumFourierTransform(inputState, 3);
console.log('QFT result probabilities:', qftResult.probabilities());

// The QFT transforms |001⟩ into a superposition with specific phases
```

### QFT for Encoding and Decoding

```typescript
import { qftEncode } from 'q5m';

function demonstrateQFTEncoding() {
  const numQubits = 3;
  
  // Encode different classical values using QFT
  const values = [0, 1, 2, 3, 4, 5, 6, 7];
  
  for (const value of values) {
    console.log(`\nEncoding value ${value}:`);
    
    const circuit = qftEncode(numQubits, value);
    const state = circuit.execute();
    
    // The resulting state has periodic structure
    const probs = state.probabilities();
    console.log('Probabilities:', probs.map(p => p.toFixed(3)));
    
    // Measure to see the periodic pattern
    const measurements = [];
    for (let i = 0; i < 100; i++) {
      const freshState = circuit.execute();
      const result = Measurement.measureAll(freshState);
      measurements.push(parseInt(result, 2));
    }
    
    // Count frequencies
    const frequencies = new Array(8).fill(0);
    measurements.forEach(m => frequencies[m]++);
    console.log('Measurement frequencies:', frequencies);
  }
}

demonstrateQFTEncoding();
```

## Quantum Phase Estimation

Phase estimation extracts the eigenvalue (phase) of a unitary operator for a given eigenstate.

### Basic Phase Estimation

```typescript
import { quantumPhaseEstimation, createPhaseEstimationCircuit } from 'q5m';

function estimatePhase() {
  const precisionQubits = 4; // Number of qubits for phase precision
  const eigenphase = Math.PI / 3; // Phase we want to estimate
  
  // Create a phase estimation circuit for a simple phase gate
  const circuit = createPhaseEstimationCircuit(precisionQubits, eigenphase);
  const state = circuit.execute();
  
  // Measure the precision qubits to get phase estimate
  const indices = Array.from({length: precisionQubits}, (_, i) => i);
  const result = Measurement.measureMultiple(state, indices);
  
  // Convert binary result to phase estimate
  const binaryResult = result.outcome;
  const phaseEstimate = parseInt(binaryResult, 2) / (2 ** precisionQubits);
  const actualPhase = phaseEstimate * 2 * Math.PI;
  
  console.log(`True phase: ${eigenphase.toFixed(4)}`);
  console.log(`Estimated phase: ${actualPhase.toFixed(4)}`);
  console.log(`Error: ${Math.abs(eigenphase - actualPhase).toFixed(4)}`);
}

estimatePhase();
```

### Advanced Phase Estimation

```typescript
import { estimateEigenstatePhase } from 'q5m';

function advancedPhaseEstimation() {
  // Estimate phase for different operators
  const testCases = [
    { phase: Math.PI / 4, description: "π/4 phase" },
    { phase: Math.PI / 2, description: "π/2 phase" },
    { phase: 3 * Math.PI / 4, description: "3π/4 phase" },
  ];
  
  for (const testCase of testCases) {
    console.log(`\nTesting ${testCase.description}:`);
    
    const estimated = estimateEigenstatePhase(testCase.phase, 5); // 5 precision qubits
    console.log(`True phase: ${testCase.phase.toFixed(4)}`);
    console.log(`Estimated: ${estimated.phase.toFixed(4)}`);
    console.log(`Confidence: ${(estimated.confidence * 100).toFixed(1)}%`);
  }
}

advancedPhaseEstimation();
```

## Amplitude Amplification

A generalization of Grover's algorithm for amplifying any marked amplitude.

```typescript
import { amplitudeAmplification } from 'q5m';

function demonstrateAmplitudeAmplification() {
  const numQubits = 3;
  
  // Define a custom amplitude oracle (marks states with specific property)
  const amplitudeOracle = (state: string): boolean => {
    // Mark states where the number of 1s is odd
    const ones = state.split('').filter(bit => bit === '1').length;
    return ones % 2 === 1;
  };
  
  // Apply amplitude amplification
  const circuit = amplitudeAmplification({
    numQubits,
    oracle: amplitudeOracle,
    iterations: 2
  });
  
  const state = circuit.execute();
  const probs = state.probabilities();
  
  console.log('\nAmplitude Amplification Results:');
  for (let i = 0; i < probs.length; i++) {
    const binary = i.toString(2).padStart(numQubits, '0');
    const isMarked = amplitudeOracle(binary);
    console.log(`|${binary}⟩: ${(probs[i] * 100).toFixed(1)}% ${isMarked ? '(MARKED)' : ''}`);
  }
}

demonstrateAmplitudeAmplification();
```

## Shor's Algorithm (Conceptual)

While a full implementation of Shor's algorithm is complex, here's the quantum part:

```typescript
function shorsPeriodFinding(N: number, a: number): number {
  // This is a simplified conceptual implementation
  // Real Shor's algorithm requires more sophisticated implementation
  
  const numQubits = Math.ceil(Math.log2(N * N)); // Rough estimate
  const precisionQubits = numQubits;
  
  console.log(`Finding period of f(x) = ${a}^x mod ${N}`);
  console.log(`Using ${numQubits} qubits for input, ${precisionQubits} for output`);
  
  // Step 1: Create superposition over all inputs
  const circuit = new Circuit(numQubits + precisionQubits);
  for (let i = 0; i < numQubits; i++) {
    circuit.h(i);
  }
  
  // Step 2: Apply the modular exponentiation function
  // This would require a complex quantum implementation
  // For demonstration, we'll simulate the effect
  
  // Step 3: Apply QFT to extract the period
  const qftCircuit = createQFTCircuit(numQubits);
  // Apply QFT to the input qubits
  
  // Step 4: Measure and process results
  const state = circuit.execute();
  const measurement = Measurement.measureAll(state);
  
  console.log('Measurement result:', measurement);
  console.log('Period extraction would continue...');
  
  return 1; // Placeholder
}

// Example usage
shorsPeriodFinding(15, 7); // Factor 15 using base 7
```

## Algorithm Comparison

```typescript
function compareAlgorithms() {
  const problems = [
    {
      name: "Search in 8 items",
      classical: 8,
      quantum: Math.ceil(Math.PI * Math.sqrt(8) / 4),
      algorithm: "Grover"
    },
    {
      name: "Search in 1024 items", 
      classical: 1024,
      quantum: Math.ceil(Math.PI * Math.sqrt(1024) / 4),
      algorithm: "Grover"
    },
    {
      name: "Factor 2048-bit number",
      classical: "Exponential",
      quantum: "Polynomial", 
      algorithm: "Shor"
    },
    {
      name: "Simulate 50 qubits",
      classical: "2^50 operations",
      quantum: "50 qubits",
      algorithm: "Quantum simulation"
    }
  ];
  
  console.log('\nQuantum Algorithm Advantages:');
  console.log('Problem\t\t\tClassical\tQuantum\t\tAlgorithm');
  console.log('-'.repeat(70));
  
  problems.forEach(problem => {
    console.log(`${problem.name.padEnd(20)}\t${String(problem.classical).padEnd(10)}\t${String(problem.quantum).padEnd(10)}\t${problem.algorithm}`);
  });
}

compareAlgorithms();
```

## Practice Exercises

### Exercise 1: Grover Variants
Implement Grover's algorithm for multiple marked items and compare success rates.

### Exercise 2: QFT Applications
Use QFT to detect periodicities in quantum states.

### Exercise 3: Phase Estimation Precision
Test how precision qubits affect phase estimation accuracy.

### Exercise 4: Custom Amplitude Amplification
Design an amplitude amplification algorithm for a specific search problem.

## Solutions

```typescript
// Exercise 1: Multiple item Grover
import { groverSearchForMultipleItems } from 'q5m';

function multiGroverTest() {
  const numQubits = 3;
  const targets = ['001', '101', '110']; // Multiple targets
  
  const circuit = groverSearchForMultipleItems(numQubits, targets);
  const state = circuit.execute();
  
  const probs = state.probabilities();
  targets.forEach(target => {
    const index = parseInt(target, 2);
    console.log(`Target ${target}: ${(probs[index] * 100).toFixed(1)}% probability`);
  });
}

// Exercise 2: QFT Period Detection
function detectPeriod(numQubits: number, period: number) {
  const circuit = new Circuit(numQubits);
  
  // Create a periodic state
  for (let i = 0; i < 2 ** numQubits; i += period) {
    if (i < 2 ** numQubits) {
      // Add amplitude at periodic positions
      // This would require custom state preparation
    }
  }
  
  // Apply QFT
  const qftResult = quantumFourierTransform(circuit.execute(), numQubits);
  
  // The QFT will reveal the period in the measurement statistics
  console.log('Period detection result:', qftResult.probabilities());
}
```

## Real-World Applications

### Quantum Machine Learning
- Quantum data encoding using amplitude encoding
- Variational quantum algorithms for optimization
- Quantum neural networks

### Quantum Chemistry
- Molecular simulation using quantum algorithms
- Ground state energy estimation
- Chemical reaction pathway analysis

### Cryptography
- Quantum key distribution protocols
- Post-quantum cryptography testing
- Random number generation

### Optimization
- Quantum approximate optimization algorithm (QAOA)
- Portfolio optimization
- Traffic flow optimization

## Summary

You've learned about:
- **Grover's Algorithm**: Quadratic speedup for search problems
- **Quantum Fourier Transform**: Converting between time and frequency domains
- **Phase Estimation**: Extracting eigenvalues of quantum operators
- **Amplitude Amplification**: Generalizing Grover for arbitrary amplification
- **Shor's Algorithm**: Exponential speedup for factoring (conceptual)
- **Real-world applications** and **quantum advantages**

These algorithms demonstrate the power of quantum computing and form the foundation for more advanced quantum applications. In the next chapter, we'll explore advanced topics and practical considerations.

Continue to [Chapter 6: Advanced Topics and Practical Applications](./06-advanced.md)