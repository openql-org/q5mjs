# Multi-Qubit Systems and Entanglement

Welcome to the most mind-bending aspect of quantum computing! When we have multiple qubits, we can create entangled states - quantum correlations that Einstein famously called "spooky action at a distance." These states are essential for quantum algorithms and quantum advantage.

## Understanding Multi-Qubit States

### Two-Qubit State Space

A two-qubit system has four possible computational basis states:
- |00⟩ - both qubits in state 0
- |01⟩ - first qubit 0, second qubit 1  
- |10⟩ - first qubit 1, second qubit 0
- |11⟩ - both qubits in state 1

```typescript
import { Circuit } from 'q5m';

// Start with two qubits in |00⟩
const circuit = new Circuit(2);
const result = circuit.execute();
const state = result.state;
console.log(state.probabilities());
// Output: [1, 0, 0, 0] - 100% probability of |00⟩
```

### Creating Superposition in Multiple Qubits

```typescript
// Apply Hadamard to both qubits
const circuit = new Circuit(2);
circuit.h(0).h(1);
const result = circuit.execute();
const state = result.state;
console.log(state.probabilities());
// Output: [0.25, 0.25, 0.25, 0.25] - equal superposition of all states
```

This creates the state: (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2

## The CNOT Gate: Creating Entanglement

The Controlled-NOT (CNOT) gate is the key to creating entanglement. It flips the target qubit only if the control qubit is |1⟩.

### CNOT Gate Operation

```typescript
// CNOT with qubit 0 as control, qubit 1 as target
const circuit = new Circuit(2);

// Case 1: Control is |0⟩
circuit.cnot(0, 1); // No change
console.log(circuit.execute().state.probabilities());
// Output: [1, 0, 0, 0] - still |00⟩

// Case 2: Control is |1⟩  
const circuit2 = new Circuit(2);
circuit2.x(0).cnot(0, 1); // Set control to |1⟩, then CNOT
console.log(circuit2.execute().probabilities());
// Output: [0, 0, 0, 1] - now |11⟩
```

## Bell States: The Four Maximally Entangled States

Bell states are the simplest examples of quantum entanglement:

### Bell State |Φ⁺⟩ = (|00⟩ + |11⟩)/√2

```typescript
const circuit = new Circuit(2);
circuit.h(0).cnot(0, 1); // Hadamard then CNOT
const state = circuit.execute();
console.log(state.probabilities());
// Output: [0.5, 0, 0, 0.5] - equal probability of |00⟩ and |11⟩

console.log(state.amplitudes());
// Complex amplitudes showing the superposition
```

This state is entangled because:
- If you measure the first qubit as 0, the second is guaranteed to be 0
- If you measure the first qubit as 1, the second is guaranteed to be 1
- But before measurement, both qubits are in superposition!

### Other Bell States

```typescript
// |Φ⁻⟩ = (|00⟩ - |11⟩)/√2
const phiMinus = new Circuit(2);
phiMinus.h(0).cnot(0, 1).z(0);

// |Ψ⁺⟩ = (|01⟩ + |10⟩)/√2  
const psiPlus = new Circuit(2);
psiPlus.h(0).cnot(0, 1).x(1);

// |Ψ⁻⟩ = (|01⟩ - |10⟩)/√2
const psiMinus = new Circuit(2);
psiMinus.h(0).cnot(0, 1).x(1).z(0);
```

## Measuring Entangled States

When you measure one qubit of an entangled pair, you instantly know the state of the other:

```typescript
import { Circuit, Measurement } from 'q5m';

// Create Bell state
const circuit = new Circuit(2);
circuit.h(0).cnot(0, 1);
const state = circuit.execute();

// Measure the first qubit
const result = Measurement.measure(state, 0);
console.log(`First qubit measured: ${result.outcome}`);

// Check the second qubit's state after measurement
const finalProbs = result.collapsedState.probabilities();
console.log('Final probabilities:', finalProbs);

// If first qubit was 0, only |00⟩ remains
// If first qubit was 1, only |11⟩ remains
```

## Multi-Qubit Gates

### Controlled Gates

Beyond CNOT, we can create controlled versions of any gate:

```typescript
// Controlled-Z gate
const circuit = new Circuit(2);
circuit.h(0).h(1).cz(0, 1);

// Controlled-Hadamard gate
const circuit2 = new Circuit(2);
circuit2.x(0).ch(0, 1); // Apply H to qubit 1 only if qubit 0 is |1⟩
```

### Three-Qubit Gates: Toffoli (CCNOT)

The Toffoli gate has two control qubits and flips the target only if both controls are |1⟩:

```typescript
// Example usage (advanced - typically created using decomposition)
const circuit = new Circuit(3);
circuit.x(0).x(1); // Set both controls to |1⟩
// Apply Toffoli gate would flip qubit 2
// circuit.ccnot(0, 1, 2); // Note: q5m may use different syntax
```

## Entanglement in Larger Systems

### GHZ State (3-qubit entanglement)

```typescript
// Create |000⟩ + |111⟩ state
const circuit = new Circuit(3);
circuit.h(0).cnot(0, 1).cnot(0, 2);
const state = circuit.execute();
console.log(state.probabilities());
// Only |000⟩ and |111⟩ have non-zero probability
```

### W State (Another 3-qubit entangled state)

The W state (|001⟩ + |010⟩ + |100⟩)/√3 can be created with more complex gate sequences.

## Testing for Entanglement

### Product States vs Entangled States

A product state can be written as a tensor product of individual qubit states:
|ψ⟩ = |ψ₁⟩ ⊗ |ψ₂⟩

```typescript
// Product state example: |0⟩ ⊗ |+⟩
const productState = new Circuit(2);
productState.h(1); // Only apply H to qubit 1
const state = productState.execute();
console.log(state.probabilities());
// Output: [0.5, 0.5, 0, 0] - can be factored as |0⟩ ⊗ (|0⟩ + |1⟩)/√2
```

Compare this to the entangled Bell state we created earlier - it cannot be factored!

### Practical Entanglement Detection

```typescript
import { Measurement } from 'q5m';

function isEntangled(circuit: Circuit): boolean {
  const state = circuit.execute();
  
  // Simple test: measure first qubit many times and see if 
  // it affects the second qubit's statistics
  let correlationCount = 0;
  const trials = 1000;
  
  for (let i = 0; i < trials; i++) {
    const freshState = circuit.execute();
    const result1 = Measurement.measure(freshState, 0);
    const result2 = Measurement.measure(result1.collapsedState, 1);
    
    // Check if measurements are correlated
    if (result1.outcome === result2.outcome) {
      correlationCount++;
    }
  }
  
  const correlation = correlationCount / trials;
  // For Bell state, correlation should be ~1.0 or ~0.0
  // For product states, correlation should be ~0.5
  return Math.abs(correlation - 0.5) > 0.4;
}

// Test with Bell state
const bellCircuit = new Circuit(2);
bellCircuit.h(0).cnot(0, 1);
console.log('Bell state entangled:', isEntangled(bellCircuit));

// Test with product state  
const productCircuit = new Circuit(2);
productCircuit.h(0).h(1);
console.log('Product state entangled:', isEntangled(productCircuit));
```

## Quantum Teleportation Circuit

One of the most famous applications of entanglement:

```typescript
// Quantum teleportation protocol
function quantumTeleportation() {
  const circuit = new Circuit(3);
  
  // Step 1: Create Bell pair between qubits 1 and 2
  circuit.h(1).cnot(1, 2);
  
  // Step 2: Prepare state to teleport on qubit 0 (example: |+⟩)
  circuit.h(0);
  
  // Step 3: Bell measurement on qubits 0 and 1
  circuit.cnot(0, 1).h(0);
  
  const state = circuit.execute();
  
  // Step 4: Measure qubits 0 and 1
  const result0 = Measurement.measure(state, 0);
  const result1 = Measurement.measure(result0.collapsedState, 1);
  
  // Step 5: Apply corrections to qubit 2 based on measurements
  const correctionCircuit = new Circuit(3);
  if (result1.outcome === 1) correctionCircuit.x(2);
  if (result0.outcome === 1) correctionCircuit.z(2);
  
  // The state on qubit 2 is now the same as the original state on qubit 0!
  return result1.collapsedState;
}
```

## Practice Exercises

### Exercise 1: Bell State Variations
Create circuits for all four Bell states and verify their properties through measurement.

### Exercise 2: Entanglement Swapping
Create two Bell pairs and use quantum operations to entangle qubits that never directly interacted.

### Exercise 3: Quantum Dense Coding
Use a Bell pair to transmit 2 classical bits by manipulating only one qubit.

## Real-World Applications

### Quantum Key Distribution
Entangled photons can detect eavesdropping attempts.

### Quantum Error Correction
Entanglement helps protect quantum information from decoherence.

### Quantum Algorithms
Many quantum algorithms (like Shor's and Grover's) rely on entanglement for their advantage.

## Summary

You've learned about:
- **Multi-qubit state spaces** and computational basis states
- **CNOT gate** and how it creates entanglement
- **Bell states** as examples of maximal entanglement
- **Measuring entangled systems** and quantum correlations
- **Controlled gates** and multi-qubit operations
- **Entanglement detection** and characterization
- **Quantum teleportation** as a practical application

The strange correlations of entanglement are what give quantum computers their power. In the next chapter, we'll explore how to measure quantum systems and extract classical information.

Continue to [Chapter 4: Quantum Measurements](./04-measurements.md)