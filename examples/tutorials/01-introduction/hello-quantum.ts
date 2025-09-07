// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Hello Quantum - Your First Quantum Circuit
 * 
 * This example demonstrates the most basic quantum circuit:
 * creating a single qubit and applying a Hadamard gate.
 * 
 * Theory:
 * A qubit starts in the |0⟩ state. The Hadamard gate creates
 * an equal superposition: (|0⟩ + |1⟩)/√2
 */

import { Circuit } from '../../../src/index.js';

export function helloQuantum(): void {
  console.log('=== Hello Quantum ===\n');
  
  // Create a quantum circuit with 1 qubit
  const circuit = new Circuit(1);
  console.log('Created circuit with 1 qubit in |0⟩ state');
  
  // Apply Hadamard gate to create superposition
  circuit.h(0);
  console.log('Applied Hadamard gate to qubit 0');
  
  // Execute the circuit and get the final state
  const result = circuit.execute();
  
  // Display the results
  console.log('\nCircuit diagram:');
  console.log(circuit.toString());
  
  console.log('\nFinal state amplitudes:');
  const stateSize = Math.pow(2, 1); // 2^1 = 2 states for 1 qubit
  for (let i = 0; i < stateSize; i++) {
    const binary = i.toString(2).padStart(1, '0');
    const amp = result.state.amplitude(i);
    console.log(`  |${binary}⟩: ${amp.toString()}`);
  }
  
  console.log('\nProbabilities:');
  const probabilities = result.state.probabilities();
  probabilities.forEach((prob, i) => {
    const binary = i.toString(2).padStart(1, '0');
    const percentage = (prob * 100).toFixed(1);
    console.log(`  |${binary}⟩: ${percentage}%`);
  });
  
  // Expected output:
  // |0⟩: 50.0%
  // |1⟩: 50.0%
  
  console.log('\n✓ Successfully created your first quantum superposition!');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  helloQuantum();
  process.exit(0);
}
