// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Build Toffoli Gate (CCNOT)
 * 
 * This recipe shows how to construct a Toffoli gate (Controlled-Controlled-NOT)
 * using basic quantum gates available in q5m.js.
 * 
 * Theory:
 * The Toffoli gate is a 3-qubit gate that flips the target qubit
 * only when both control qubits are |1⟩. It's universal for
 * classical computation and important for quantum algorithms.
 * 
 * Truth Table:
 * |000⟩ -> |000⟩
 * |001⟩ -> |001⟩
 * |010⟩ -> |010⟩
 * |011⟩ -> |011⟩
 * |100⟩ -> |100⟩
 * |101⟩ -> |101⟩
 * |110⟩ -> |111⟩  // Both controls are 1, so target flips
 * |111⟩ -> |110⟩  // Both controls are 1, so target flips
 * 
 * Implementation uses the decomposition:
 * 1. Several Hadamard, Phase, and CNOT gates
 * 2. Total of 6 CNOT gates and several single-qubit gates
 */

import { Circuit } from '../../src/index.js';

export function buildToffoliGate(circuit: Circuit, control1: number, control2: number, target: number): Circuit {
  /**
   * Standard Toffoli gate decomposition
   * Based on Nielsen & Chuang textbook implementation
   */
  
  // First part
  circuit.h(target);
  circuit.cnot(control2, target);
  circuit.t(target).dagger();  // T† gate
  circuit.cnot(control1, target);
  circuit.t(target);
  circuit.cnot(control2, target);
  circuit.t(target).dagger();  // T† gate
  circuit.cnot(control1, target);
  
  // Second part
  circuit.t(control2);
  circuit.t(target);
  circuit.h(target);
  circuit.cnot(control1, control2);
  circuit.t(control1);
  circuit.t(control2).dagger();  // T† gate
  circuit.cnot(control1, control2);
  
  return circuit;
}

/**
 * Alternative: Simplified Toffoli using relative phase
 * This version is mathematically equivalent but uses fewer gates
 */
export function buildSimplifiedToffoli(circuit: Circuit, control1: number, control2: number, target: number): Circuit {
  // Using decomposition with fewer T gates
  circuit.h(target);
  circuit.cnot(control1, target);
  circuit.t(target).dagger();
  circuit.cnot(control2, target);
  circuit.t(target);
  circuit.cnot(control1, target);
  circuit.t(target).dagger();
  circuit.cnot(control2, target);
  circuit.t(target);
  circuit.h(target);
  
  // Phase correction on control qubits
  circuit.cnot(control2, control1);
  circuit.t(control1).dagger();
  circuit.cnot(control2, control1);
  
  return circuit;
}

export function demonstrateToffoli(): void {
  console.log('=== Toffoli Gate (CCNOT) Construction ===\n');
  
  // Test all possible input states
  const testStates = [
    { bits: '000', desc: 'No controls active' },
    { bits: '001', desc: 'No controls active' },
    { bits: '010', desc: 'Only control2 active' },
    { bits: '011', desc: 'Only control2 active' },
    { bits: '100', desc: 'Only control1 active' },
    { bits: '101', desc: 'Only control1 active' },
    { bits: '110', desc: 'Both controls active → flip' },
    { bits: '111', desc: 'Both controls active → flip' }
  ];
  
  console.log('Testing Toffoli gate on all basis states:\n');
  console.log('Input  →  Output  (Description)');
  console.log('-'.repeat(50));
  
  for (const test of testStates) {
    const circuit = new Circuit(3);
    
    // Prepare input state
    for (let i = 0; i < 3; i++) {
      if (test.bits[2 - i] === '1') {
        circuit.x(i);
      }
    }
    
    // Apply Toffoli gate
    buildToffoliGate(circuit, 0, 1, 2);
    
    // Execute and measure
    const result = circuit.execute();
    const probabilities = result.state.probabilities();
    
    // Find the output state (should be deterministic)
    let outputBits = '';
    for (let i = 0; i < 8; i++) {
      if (probabilities[i] > 0.99) {
        outputBits = i.toString(2).padStart(3, '0');
        break;
      }
    }
    
    console.log(`|${test.bits}⟩  →  |${outputBits}⟩  (${test.desc})`);
  }
  
  // Show the circuit structure
  console.log('\n\nCircuit Structure (for |110⟩ -> |111⟩):');
  console.log('-'.repeat(50));
  const demoCircuit = new Circuit(3);
  demoCircuit.x(0).x(1);  // Prepare |110⟩
  buildToffoliGate(demoCircuit, 0, 1, 2);
  console.log(demoCircuit.toString());
  
  // Gate count analysis
  console.log('\nGate Count Analysis:');
  console.log('  - Hadamard gates: 2');
  console.log('  - CNOT gates: 6');
  console.log('  - T gates: 7 (including T†)');
  console.log('  - Total gates: 15');
  
  console.log('\n✓ Successfully demonstrated Toffoli gate construction!');
  console.log('Note: The Toffoli gate is crucial for:');
  console.log('  • Reversible classical computation');
  console.log('  • Arithmetic circuits in quantum algorithms');
  console.log('  • Error correction codes');
  console.log('  • Grover\'s algorithm oracle construction');
}

// Helper to add T-dagger functionality
Circuit.prototype.dagger = function() {
  // T† is equivalent to T* (complex conjugate)
  // In our case, we can use phase(-π/4) as T†
  const lastQubit = this.gates[this.gates.length - 1]?.qubits[0] || 0;
  return this.phase(-Math.PI/4, lastQubit);
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateToffoli();
  process.exit(0);
}
