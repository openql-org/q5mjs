# Introduction to Quantum Computing with q5m.js

Welcome to the quantum computing world! This tutorial will guide you through the fundamental concepts of quantum computing using the q5m.js library. No prior quantum computing knowledge is required - we'll start from the basics and build up to more complex topics.

## What is Quantum Computing?

Quantum computing leverages the strange and powerful properties of quantum mechanics to process information in ways that classical computers cannot. The key differences are:

- **Classical bits**: Can be either 0 or 1
- **Quantum bits (qubits)**: Can be in a "superposition" of both 0 and 1 simultaneously

## What is q5m.js?

q5m.js is a modern TypeScript library for quantum computing simulations. It provides:

- **Easy-to-use API**: Simple circuit construction with method chaining
- **High performance**: Optimized state vector simulations
- **Full-featured**: Gates, measurements, algorithms, and visualization
- **Framework integration**: Export to Qiskit, OpenQASM, and Cirq

## Setting Up Your First Quantum Circuit

Let's start with the simplest possible quantum circuit - a single qubit:

```typescript
import { Circuit } from 'q5m';

// Create a circuit with 1 qubit
const circuit = new Circuit(1);

// Execute the circuit and get the result
const result = circuit.execute();
const state = result.state;

// Check the probabilities
console.log(state.probabilities());
// Output: [1, 0] - 100% probability of measuring |0⟩
```

## Understanding Quantum States

A quantum state describes the complete state of a quantum system. For a single qubit, we represent it mathematically as:

```
|ψ⟩ = α|0⟩ + β|1⟩
```

Where:
- `α` and `β` are complex numbers called amplitudes
- `|α|²` is the probability of measuring the qubit in state |0⟩
- `|β|²` is the probability of measuring the qubit in state |1⟩
- `|α|² + |β|² = 1` (probabilities must sum to 1)

In q5m.js, you can examine these amplitudes:

```typescript
const circuit = new Circuit(1);
const result = circuit.execute();
const state = result.state;

// Get the complex amplitudes
const amplitudes = state.amplitudes();
console.log(amplitudes);
// Output: [Complex(1, 0), Complex(0, 0)] - representing |0⟩

// Get probabilities (squared magnitudes)
const probabilities = state.probabilities();
console.log(probabilities);
// Output: [1, 0]
```

## Your First Quantum Gate: Hadamard (H)

The Hadamard gate creates a superposition - putting a qubit in a state where it's equally likely to be measured as 0 or 1:

```typescript
import { Circuit } from 'q5m';

const circuit = new Circuit(1);

// Apply Hadamard gate to qubit 0
circuit.h(0);

const result = circuit.execute();
const state = result.state;
console.log(state.probabilities());
// Output: [0.5, 0.5] - 50% chance of |0⟩, 50% chance of |1⟩

// The amplitudes are:
console.log(state.amplitudes());
// Output: [Complex(0.707, 0), Complex(0.707, 0)]
// This represents (1/√2)|0⟩ + (1/√2)|1⟩
```

## Measurement: The Quantum-to-Classical Interface

Measurement collapses the quantum superposition into a definite classical result:

```typescript
import { Circuit } from 'q5m';

const circuit = new Circuit(1);
circuit.h(0); // Create superposition

// Add measurement to circuit
circuit.mz(0); // Z-basis measurement

const result = circuit.execute();
console.log('Measurement results:', result.measurements);
console.log('Final probabilities:', result.probabilities());
// After measurement, state is collapsed to either |0⟩ or |1⟩
```

## Key Concepts Summary

1. **Qubits**: The fundamental unit of quantum information
2. **Superposition**: A qubit can be in multiple states simultaneously
3. **Amplitudes**: Complex numbers that determine measurement probabilities
4. **Gates**: Operations that manipulate quantum states
5. **Measurement**: Collapses superposition into classical results

## What's Next?

In the next tutorial, we'll explore different types of quantum gates and how they transform quantum states. You'll learn about:

- Pauli gates (X, Y, Z)
- Rotation gates (RX, RY, RZ)
- Phase gates (S, T)
- How to visualize quantum states

## Practice Exercise

Try modifying the Hadamard example:

1. Create a circuit with 2 qubits
2. Apply Hadamard gates to both qubits
3. Observe the resulting 4-state superposition
4. Measure one qubit and see how it affects the system

```typescript
// Your solution here
const circuit = new Circuit(2);
circuit.h(0).h(1);
const result = circuit.execute();
const state = result.state;
console.log(state.probabilities());
// What do you expect to see? [0.25, 0.25, 0.25, 0.25]
```

Continue to [Chapter 2: Basic Quantum Gates](./02-basic-gates.md) when you're ready!