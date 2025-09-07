// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Simple Quantum Error Correction Demo
 * 
 * Basic demonstration of quantum error correction principles.
 */

import { Circuit } from '../../../src/index.js';

export function demonstrateSimpleQEC(): void {
  console.log('=== Simple QEC Demo ===\\n');
  
  console.log('1. Error Correction Basics:');
  console.log('   Goal: Protect quantum information from errors');
  console.log('   Method: Encode logical qubits using multiple physical qubits\\n');
  
  // 3-qubit repetition code
  console.log('2. Three-Qubit Repetition Code:');
  console.log('   Encoding: |0⟩ → |000⟩, |1⟩ → |111⟩');
  
  // Encode |+⟩ state
  const circuit = new Circuit(3);
  circuit.h(0); // Create |+⟩
  
  // Encode using repetition code
  circuit.cnot(0, 1);
  circuit.cnot(0, 2);
  
  console.log('\\n   Encoded |+⟩ state circuit:');
  console.log(circuit.toString());
  
  const result = circuit.execute();
  const probs = result.state.probabilities();
  
  console.log('\\n   Encoded state probabilities:');
  for (let i = 0; i < 8; i++) {
    if (probs[i] > 0.01) {
      const binary = i.toString(2).padStart(3, '0');
      console.log(`     |${binary}⟩: ${(probs[i] * 100).toFixed(1)}%`);
    }
  }
  
  // Error detection example
  console.log('\\n3. Error Detection:');
  console.log('   If one qubit flips, majority vote recovers original state');
  
  const errorCircuit = new Circuit(3);
  errorCircuit.h(0);
  errorCircuit.cnot(0, 1).cnot(0, 2); // Encode
  errorCircuit.x(1); // Introduce error on qubit 1
  
  console.log('   With error on qubit 1 - can be detected and corrected');
  
  console.log('\\n4. QEC Principles:');
  console.log('   • Syndrome measurement detects errors');
  console.log('   • Error correction preserves quantum information');
  console.log('   • Essential for fault-tolerant quantum computing');
  
  console.log('\\n✓ Simple QEC demo completed!');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateSimpleQEC();
  process.exit(0);
}
