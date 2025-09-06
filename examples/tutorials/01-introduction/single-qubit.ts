// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Single Qubit Operations
 * 
 * This example explores various operations on a single qubit,
 * demonstrating different quantum gates and their effects.
 * 
 * Theory:
 * Single-qubit gates are unitary operations that transform
 * the state of one qubit. Common gates include:
 * - Pauli gates (X, Y, Z)
 * - Hadamard (H)
 * - Phase gates (S, T)
 * - Rotation gates (Rx, Ry, Rz)
 */

import { Circuit } from '../../../src/index.js';

export function singleQubitOperations(): void {
  console.log('=== Single Qubit Operations ===\n');
  
  // Example 1: Pauli-X gate (quantum NOT)
  console.log('1. Pauli-X Gate (NOT gate):');
  const circuitX = new Circuit(1);
  circuitX.x(0);
  let result = circuitX.execute();
  console.log('   |0⟩ -> X -> |1⟩');
  const probs1 = result.state.probabilities();
  console.log(`   Result: |0⟩: ${(probs1[0] * 100).toFixed(1)}%, |1⟩: ${(probs1[1] * 100).toFixed(1)}%\n`);
  
  // Example 2: Hadamard gate (superposition)
  console.log('2. Hadamard Gate (creates superposition):');
  const circuitH = new Circuit(1);
  circuitH.h(0);
  result = circuitH.execute();
  console.log('   |0⟩ -> H -> (|0⟩ + |1⟩)/√2');
  const probs2 = result.state.probabilities();
  console.log(`   Result: |0⟩: ${(probs2[0] * 100).toFixed(1)}%, |1⟩: ${(probs2[1] * 100).toFixed(1)}%\n`);
  
  // Example 3: Combined operations
  console.log('3. Combined Operations (H then Z):');
  const circuitHZ = new Circuit(1);
  circuitHZ.h(0).z(0).h(0);  // H-Z-H sequence equals X gate
  result = circuitHZ.execute();
  console.log('   |0⟩ -> H -> Z -> H -> |1⟩');
  const probs3 = result.state.probabilities();
  console.log(`   Result: |0⟩: ${(probs3[0] * 100).toFixed(1)}%, |1⟩: ${(probs3[1] * 100).toFixed(1)}%\n`);
  
  // Example 4: Phase gates
  console.log('4. Phase Gates (S and T):');
  const circuitPhase = new Circuit(1);
  circuitPhase.h(0).s(0).t(0);
  result = circuitPhase.execute();
  console.log('   |0⟩ -> H -> S -> T');
  console.log(`   Amplitude |0⟩: ${result.state.amplitude(0).toString()}`);
  console.log(`   Amplitude |1⟩: ${result.state.amplitude(1).toString()}\n`);
  
  // Example 5: Rotation gates
  console.log('5. Rotation Gates (Rx, Ry, Rz):');
  const circuitRot = new Circuit(1);
  const angle = Math.PI / 4; // 45 degrees
  circuitRot.ry(angle, 0);
  result = circuitRot.execute();
  console.log(`   |0⟩ -> Ry(π/4)`);
  const probs5 = result.state.probabilities();
  console.log(`   Result: |0⟩: ${(probs5[0] * 100).toFixed(1)}%, |1⟩: ${(probs5[1] * 100).toFixed(1)}%\n`);
  
  // Example 6: Circuit visualization
  console.log('6. Circuit Visualization:');
  const demoCircuit = new Circuit(1);
  demoCircuit.h(0).s(0).x(0).t(0).h(0);
  console.log(demoCircuit.toString());
  
  console.log('\n✓ Explored various single-qubit operations!');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  singleQubitOperations();
  process.exit(0);
}
