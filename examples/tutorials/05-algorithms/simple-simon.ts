// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Simon's Algorithm (Simplified)
 * 
 * Demonstrates Simon's algorithm for finding the period of a Boolean function.
 */

import { Circuit } from '../../../src/index.js';

export function demonstrateSimpleSimon(): void {
  console.log('=== Simon Algorithm Demo ===\\n');
  
  console.log('1. Finding Hidden Period:');
  console.log('   Given function f(x) = f(x XOR s) for secret s');
  console.log('   Classical: O(2^(n/2)) queries');
  console.log('   Quantum: O(n) queries\\n');
  
  // Simple 2-qubit example
  const circuit = new Circuit(4); // 2 input + 2 output qubits
  
  // Hadamard on input register
  circuit.h(0).h(1);
  
  // Simple oracle for s = "11"
  circuit.cnot(0, 2).cnot(1, 3);
  circuit.cnot(0, 3).cnot(1, 2);
  
  // Hadamard on input register again
  circuit.h(0).h(1);
  
  const result = circuit.execute();
  console.log('2. Circuit Result:');
  console.log(circuit.toString());
  
  console.log('\\n3. Measurement Results:');
  const probs = result.state.probabilities();
  for (let i = 0; i < 16; i++) {
    if (probs[i] > 0.01) {
      const binary = i.toString(2).padStart(4, '0');
      console.log(`   |${binary}⟩: ${(probs[i] * 100).toFixed(1)}%`);
    }
  }
  
  console.log('\\n✓ Simon algorithm demo completed!');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateSimpleSimon();
  process.exit(0);
}
