# Basic Quantum Gates

In this chapter, we'll explore the fundamental quantum gates that form the building blocks of quantum algorithms. Think of gates as the quantum equivalent of classical logic gates, but with the power to create and manipulate superposition and quantum interference.

## Single-Qubit Gates

### Pauli Gates

The Pauli gates are fundamental single-qubit operations named after physicist Wolfgang Pauli.

#### X Gate (Bit Flip)
The X gate flips a qubit from |0⟩ to |1⟩ and vice versa, similar to a classical NOT gate:

```typescript
import { Circuit } from 'q5m';

// Start with |0⟩ and apply X gate
const circuit1 = new Circuit(1);
circuit1.x(0);
console.log(circuit1.execute().state.probabilities());
// Output: [0, 1] - now in state |1⟩

// Start with |1⟩ and apply X gate
const circuit2 = new Circuit(1);
circuit2.x(0).x(0); // Two X gates cancel out
console.log(circuit2.execute().state.probabilities());
// Output: [1, 0] - back to |0⟩
```

#### Y Gate (Phase and Bit Flip)
The Y gate combines a bit flip with a phase change:

```typescript
const circuit = new Circuit(1);
circuit.y(0);
const result = circuit.execute();
const state = result.state;
console.log(state.amplitudes());
// Output: [Complex(0, 0), Complex(0, 1)] - representing i|1⟩
```

#### Z Gate (Phase Flip)
The Z gate leaves |0⟩ unchanged but adds a phase of -1 to |1⟩:

```typescript
const circuit = new Circuit(1);
circuit.h(0).z(0); // H creates superposition, Z adds phase
const result = circuit.execute();
const state = result.state;
console.log(state.amplitudes());
// Output: [Complex(0.707, 0), Complex(-0.707, 0)]
// Representing (1/√2)|0⟩ - (1/√2)|1⟩
```

### Hadamard Gate (H) - Superposition Creator

We introduced the Hadamard gate in Chapter 1. It's the most important gate for creating superposition:

```typescript
const circuit = new Circuit(1);
circuit.h(0);
console.log(circuit.execute().state.probabilities());
// Output: [0.5, 0.5] - equal superposition
```

The Hadamard gate transforms:
- |0⟩ → (|0⟩ + |1⟩)/√2
- |1⟩ → (|0⟩ - |1⟩)/√2

### Phase Gates

Phase gates add phase rotations without changing probabilities.

#### S Gate (Quarter Turn)
```typescript
const circuit = new Circuit(1);
circuit.h(0).s(0); // Create superposition then add phase
const result = circuit.execute();
const state = result.state;
console.log(state.amplitudes());
// The |1⟩ component gets multiplied by i
```

#### T Gate (Eighth Turn)
```typescript
const circuit = new Circuit(1);
circuit.h(0).t(0);
const result = circuit.execute();
const state = result.state;
// The |1⟩ component gets multiplied by e^(iπ/4)
```

### Rotation Gates

Rotation gates allow precise control over qubit states with parameterized angles.

#### RX Gate (X-axis Rotation)
```typescript
const circuit = new Circuit(1);
circuit.rx(0, Math.PI / 2); // 90-degree rotation around X-axis
const state = circuit.execute();
console.log(state.probabilities());
// Creates a specific superposition based on the angle
```

#### RY Gate (Y-axis Rotation)
```typescript
const circuit = new Circuit(1);
circuit.ry(0, Math.PI / 4); // 45-degree rotation around Y-axis
const state = circuit.execute();
```

#### RZ Gate (Z-axis Rotation)
```typescript
const circuit = new Circuit(1);
circuit.h(0).rz(0, Math.PI / 3); // Phase rotation
const state = circuit.execute();
```

## Gate Combinations and Sequences

Quantum gates can be combined to create complex operations:

```typescript
const circuit = new Circuit(1);

// Create a custom sequence
circuit
  .h(0)        // Create superposition
  .rz(0, Math.PI / 4)  // Add phase rotation
  .h(0);       // Another Hadamard

const result = circuit.execute();
const state = result.state;
console.log(state.probabilities());
```

## Visualizing Gate Effects

Let's see how different gates affect the same initial superposition:

```typescript
import { Circuit } from 'q5m';

function demonstrateGate(gateName: string, gateOperation: (circuit: Circuit) => void) {
  const circuit = new Circuit(1);
  circuit.h(0); // Start with superposition
  gateOperation(circuit);
  
  const result = circuit.execute();
  const state = result.state;
  console.log(`${gateName}:`);
  console.log('Probabilities:', state.probabilities());
  console.log('Amplitudes:', state.amplitudes().map(a => a.toString()));
  console.log('---');
}

// Demonstrate different gates
demonstrateGate('Identity (no gate)', () => {});
demonstrateGate('X gate', circuit => circuit.x(0));
demonstrateGate('Y gate', circuit => circuit.y(0));
demonstrateGate('Z gate', circuit => circuit.z(0));
demonstrateGate('S gate', circuit => circuit.s(0));
demonstrateGate('T gate', circuit => circuit.t(0));
```

## Important Properties

### Gate Reversibility
All quantum gates are reversible (unitary). Many gates are their own inverse:

```typescript
const circuit = new Circuit(1);
circuit.h(0).h(0); // Two Hadamards cancel out
console.log(circuit.execute().state.probabilities());
// Output: [1, 0] - back to original |0⟩ state
```

### Gate Commutativity
Some gates commute (order doesn't matter), others don't:

```typescript
// Z and S commute
const circuit1 = new Circuit(1);
circuit1.h(0).z(0).s(0);

const circuit2 = new Circuit(1);
circuit2.h(0).s(0).z(0);

// Both produce the same result

// But X and Z don't commute:
const circuit3 = new Circuit(1);
circuit3.x(0).z(0); // Different from z(0).x(0)
```

## Creating Custom Gates

You can create custom gates using unitary matrices:

```typescript
import { Circuit, complex, createUnitary } from 'q5m';

// Create a custom rotation gate matrix
const customMatrix = createUnitary([
  [Math.cos(Math.PI/8), -Math.sin(Math.PI/8)],
  [Math.sin(Math.PI/8), Math.cos(Math.PI/8)]
]);

// Note: Custom gate application requires advanced internal APIs
// For rotation gates, use the built-in parametric gates:
const circuit = new Circuit(1);
circuit.ry(0, Math.PI/4); // Equivalent to the custom rotation above
const result = circuit.execute();
const state = result.state;
```

## Practice Exercises

### Exercise 1: Gate Sequences
Create circuits that transform |0⟩ into these target states:
1. -|0⟩ (negative amplitude on |0⟩)
2. i|1⟩ (imaginary amplitude on |1⟩)
3. (|0⟩ - |1⟩)/√2 (minus superposition)

### Exercise 2: Probability Manipulation
Using rotation gates, create a state where the probability of measuring |1⟩ is exactly 0.25.

### Exercise 3: Phase Exploration
Starting with a superposition, apply different phase gates and observe how they affect the amplitudes but not the probabilities.

## Solutions

```typescript
// Exercise 1 solutions:
// 1. -|0⟩
const circuit1 = new Circuit(1);
circuit1.x(0).z(0).x(0); // or use global phase

// 2. i|1⟩
const circuit2 = new Circuit(1);
circuit2.x(0).s(0); // X to get |1⟩, S to add i phase

// 3. (|0⟩ - |1⟩)/√2
const circuit3 = new Circuit(1);
circuit3.x(0).h(0); // X then H creates the minus state

// Exercise 2 solution:
// P(|1⟩) = 0.25 means amplitude = 0.5
const circuit4 = new Circuit(1);
circuit4.ry(0, 2 * Math.asin(0.5)); // RY with appropriate angle
```

## Summary

You've learned about:
- **Pauli gates**: X (bit flip), Y (bit+phase flip), Z (phase flip)
- **Hadamard gate**: Creates superposition
- **Phase gates**: S and T gates for phase rotations
- **Rotation gates**: RX, RY, RZ for parametric rotations
- **Gate properties**: Reversibility and commutativity
- **Gate combinations**: How to sequence gates for desired effects

In the next chapter, we'll explore multi-qubit systems and the fascinating world of quantum entanglement!

Continue to [Chapter 3: Multi-Qubit Systems and Entanglement](./03-multi-qubit.md)