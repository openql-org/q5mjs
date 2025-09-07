# Quantum Measurements

Measurement is the bridge between the quantum and classical worlds. It's how we extract classical information from quantum states, but it fundamentally changes the quantum system in the process. Understanding measurement is crucial for quantum algorithm design and quantum error correction.

## The Measurement Postulate

When we measure a quantum state, we get a classical outcome according to Born's rule:
- **Probability**: P(outcome) = |amplitude|²  
- **State collapse**: After measurement, the system is in the measured state
- **Irreversibility**: The original superposition is destroyed

```typescript
import { Circuit } from 'q5m';

// Create superposition
const circuit = new Circuit(1);
circuit.h(0); // |ψ⟩ = (|0⟩ + |1⟩)/√2

// Before measurement
const stateBeforeMeasurement = circuit.execute();
console.log('Before measurement:', stateBeforeMeasurement.state.probabilities());
// Output: [0.5, 0.5]

// Add measurement to circuit
circuit.mz(0); // Z-basis measurement

const result = circuit.execute();
console.log('After measurement:', result.state.probabilities());
// Output: [1, 0] or [0, 1] - no more superposition!
// The measurement has collapsed the state to either |0⟩ or |1⟩
```

## Measurement Bases

### Computational Basis (Z-basis)

The standard measurement we've been using measures in the computational basis {|0⟩, |1⟩}:

```typescript
const circuit = new Circuit(1);
circuit.h(0); // Equal superposition
circuit.mz(0); // Z-basis (computational basis) measurement

const result = circuit.execute();
console.log('Final state after Z-basis measurement:', result.state.probabilities());
// The state is now either [1, 0] (measured |0⟩) or [0, 1] (measured |1⟩)
```

### Hadamard Basis (X-basis)

We can also measure in the Hadamard basis {|+⟩, |−⟩} where:
- |+⟩ = (|0⟩ + |1⟩)/√2
- |−⟩ = (|0⟩ − |1⟩)/√2

```typescript
// Prepare |+⟩ state
const circuit = new Circuit(1);
circuit.h(0);

const state = circuit.execute();

// X-basis measurement of |+⟩ state
const result = Measurement.measureAs(state, 0, 'hadamard');
console.log('X-basis measurement:', result.outcome);
// High probability of measuring 0 (corresponding to |+⟩)
```

### Y-basis (Circular Basis)

The Y-basis uses {|+i⟩, |−i⟩} where:
- |+i⟩ = (|0⟩ + i|1⟩)/√2  
- |−i⟩ = (|0⟩ − i|1⟩)/√2

```typescript
const state = circuit.execute();
const result = Measurement.measureAs(state, 0, 'circular');
```

## Custom Measurement Operators

You can define custom measurements using projection operators:

```typescript
import { HermitianMatrices, complex } from 'q5m';

// Create custom projectors for a tilted basis
const angle = Math.PI / 6; // 30 degrees
const cos30 = Math.cos(angle);
const sin30 = Math.sin(angle);

const P0_custom = [
  [complex(cos30 * cos30, 0), complex(cos30 * sin30, 0)],
  [complex(cos30 * sin30, 0), complex(sin30 * sin30, 0)]
];

const P1_custom = [
  [complex(sin30 * sin30, 0), complex(-cos30 * sin30, 0)], 
  [complex(-cos30 * sin30, 0), complex(cos30 * cos30, 0)]
];

// Use custom measurement
const circuit = new Circuit(1);
circuit.h(0);
const state = circuit.execute();

const result = Measurement.measureWith(state, 0, {
  P0: P0_custom,
  P1: P1_custom
});
```

## Multi-Qubit Measurements

### Independent Measurements

Measuring multiple qubits independently:

```typescript
const circuit = new Circuit(2);
circuit.h(0).h(1); // Both qubits in superposition

const state = circuit.execute();

// Measure both qubits
const results = Measurement.measureMultiple(state, [0, 1]);
console.log('Measurement outcomes:', results.outcome); // e.g., "01"
console.log('Individual results:', results.individualResults);
```

### Correlated Measurements

When qubits are entangled, their measurements are correlated:

```typescript
// Create Bell state
const circuit = new Circuit(2);
circuit.h(0).cnot(0, 1);
const state = circuit.execute();

// Measure both qubits many times to see correlation
for (let i = 0; i < 10; i++) {
  const freshState = circuit.execute();
  const results = Measurement.measureMultiple(freshState, [0, 1]);
  console.log(`Trial ${i + 1}: ${results.outcome}`);
  // You'll see either "00" or "11", never "01" or "10"!
}
```

### Partial Measurements

Measuring only some qubits in a multi-qubit system:

```typescript
// Three-qubit GHZ state
const circuit = new Circuit(3);
circuit.h(0).cnot(0, 1).cnot(0, 2);
const state = circuit.execute();

// Measure only the first qubit
const result = Measurement.measure(state, 0);
console.log('First qubit:', result.outcome);

// Check remaining two-qubit state
const remaining = result.collapsedState;
console.log('Remaining state probabilities:', remaining.probabilities());
// If first qubit was 0: only |00⟩ remains for qubits 1,2
// If first qubit was 1: only |11⟩ remains for qubits 1,2
```

## Measurement Statistics

### Expected Values

For a measurement operator M, the expected value is ⟨ψ|M|ψ⟩:

```typescript
function calculateExpectedValue(circuit: Circuit, operator: any): number {
  // Simplified example for Pauli-Z expectation
  const state = circuit.execute();
  const probs = state.probabilities();
  
  // For Z measurement: E[Z] = P(0) - P(1)
  return probs[0] - probs[1];
}

// Example: Expected value of Z for |+⟩ state
const circuit = new Circuit(1);
circuit.h(0);
console.log('⟨Z⟩ for |+⟩ state:', calculateExpectedValue(circuit, 'Z')); 
// Output: ~0 (equal probability of +1 and -1)
```

### Measurement Variance

```typescript
function measurementVariance(circuit: Circuit, trials: number = 1000): number {
  let sum = 0;
  let sumSquares = 0;
  
  for (let i = 0; i < trials; i++) {
    const state = circuit.execute();
    const result = Measurement.measure(state, 0);
    const outcome = result.outcome === 0 ? 1 : -1; // Convert to ±1
    
    sum += outcome;
    sumSquares += outcome * outcome;
  }
  
  const mean = sum / trials;
  const variance = (sumSquares / trials) - (mean * mean);
  return variance;
}
```

## Quantum Non-Demolition Measurements

Some measurements can be performed without disturbing the measured property:

```typescript
// Measuring Z doesn't affect a state that's already in Z eigenbasis
const circuit = new Circuit(1);
// State is already |0⟩

const state1 = circuit.execute();
const result1 = Measurement.measure(state1, 0);
console.log('First measurement:', result1.outcome); // Always 0

// Second measurement on collapsed state
const result2 = Measurement.measure(result1.collapsedState, 0);
console.log('Second measurement:', result2.outcome); // Still 0
```

## Measurement-Based Quantum Computing

Some quantum algorithms use measurement as a computational resource:

### One-Way Quantum Computer Model

```typescript
// Example: Measurement-based CNOT
function measurementBasedCNOT() {
  // Create cluster state
  const circuit = new Circuit(4);
  circuit.h(0).h(1).h(2).h(3);
  circuit.cnot(0, 1).cnot(1, 2).cnot(2, 3);
  
  let state = circuit.execute();
  
  // Measure qubits in specific bases based on desired computation
  const measurement1 = Measurement.measure(state, 0);
  state = measurement1.collapsedState;
  
  const measurement2 = Measurement.measure(state, 1);
  state = measurement2.collapsedState;
  
  // The remaining qubits now have the CNOT operation applied
  return state;
}
```

## Weak Measurements

While q5m.js focuses on projective measurements, weak measurements are possible in principle:

```typescript
// Conceptual example of weak measurement
// (This would require specialized implementation)
function weakMeasurement(state: any, strength: number) {
  // Weak measurements gain partial information without fully collapsing the state
  // strength parameter controls the measurement-disturbance tradeoff
  // As strength → 0: minimal disturbance, minimal information
  // As strength → 1: projective measurement, complete information
}
```

## Measurement in Different Algorithms

### Quantum Phase Estimation

Measurements extract the estimated phase:

```typescript
// Simplified phase estimation measurement
function phaseEstimationMeasurement(circuit: Circuit, precisionQubits: number) {
  const state = circuit.execute();
  
  // Measure the precision qubits in computational basis
  const indices = Array.from({length: precisionQubits}, (_, i) => i);
  const result = Measurement.measureMultiple(state, indices);
  
  // Convert binary outcome to phase estimate
  const binaryOutcome = result.outcome;
  const phaseEstimate = parseInt(binaryOutcome, 2) / (2 ** precisionQubits);
  
  return phaseEstimate;
}
```

### Grover's Algorithm

Measurements identify the search result:

```typescript
function groverMeasurement(circuit: Circuit, numQubits: number) {
  const state = circuit.execute();
  
  // Measure all qubits
  const indices = Array.from({length: numQubits}, (_, i) => i);
  const result = Measurement.measureMultiple(state, indices);
  
  console.log('Grover search result:', result.outcome);
  console.log('Success probability:', result.probability);
  
  return result.outcome;
}
```

## Practice Exercises

### Exercise 1: Basis Comparison
Create a |+⟩ state and measure it in Z, X, and Y bases. Compare the outcome probabilities.

### Exercise 2: Entanglement Verification
Create a Bell state and verify the measurement correlations by measuring both qubits many times.

### Exercise 3: Measurement Backaction
Start with a superposition, measure it, then apply the same operations again. Compare with the original unmeasured state.

### Exercise 4: Quantum Teleportation Verification
Implement quantum teleportation and verify that the teleported state matches the original through measurement statistics.

## Solutions

```typescript
// Exercise 1: Basis comparison
const circuit = new Circuit(1);
circuit.h(0); // Create |+⟩

function testBasis(basisName: string, basis: 'computational' | 'hadamard' | 'circular') {
  const trials = 1000;
  let zeros = 0;
  
  for (let i = 0; i < trials; i++) {
    const state = circuit.execute();
    const result = Measurement.measureAs(state, 0, basis);
    if (result.outcome === 0) zeros++;
  }
  
  console.log(`${basisName} basis: P(0) = ${zeros/trials}`);
}

testBasis('Z', 'computational'); // ~0.5
testBasis('X', 'hadamard');      // ~1.0 (|+⟩ is eigenstate)
testBasis('Y', 'circular');      // ~0.5

// Exercise 2: Bell state correlations
const bellCircuit = new Circuit(2);
bellCircuit.h(0).cnot(0, 1);

let correlatedMeasurements = 0;
const trials = 1000;

for (let i = 0; i < trials; i++) {
  const state = bellCircuit.execute();
  const results = Measurement.measureMultiple(state, [0, 1]);
  if (results.outcome === '00' || results.outcome === '11') {
    correlatedMeasurements++;
  }
}

console.log(`Correlation rate: ${correlatedMeasurements/trials}`); // Should be ~1.0
```

## Summary

You've learned about:
- **Born's rule** and measurement probabilities
- **Different measurement bases** (Z, X, Y) and their physical meaning
- **Custom measurements** using projection operators
- **Multi-qubit measurements** and quantum correlations
- **Measurement statistics** including expected values and variance
- **Measurement's role** in quantum algorithms
- **The measurement-disturbance principle**

Measurement is not just an endpoint of quantum computation - it's an integral part of many quantum algorithms and protocols. In the next chapter, we'll explore some of the most important quantum algorithms that use these measurement principles.

Continue to [Chapter 5: Quantum Algorithms](./05-algorithms.md)