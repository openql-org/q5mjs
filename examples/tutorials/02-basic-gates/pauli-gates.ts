// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Pauli Gates (X, Y, Z)
 * 
 * This example demonstrates the three Pauli gates, which are fundamental
 * operations in quantum computing and form the basis for many quantum algorithms.
 * 
 * Theory:
 * Pauli gates are single-qubit operations that correspond to rotations
 * around the X, Y, and Z axes of the Bloch sphere:
 * - X gate: π rotation around X-axis (bit flip)
 * - Y gate: π rotation around Y-axis (bit and phase flip)  
 * - Z gate: π rotation around Z-axis (phase flip)
 * 
 * Mathematical representation:
 * X = |0⟩⟨1| + |1⟩⟨0| = [[0,1],[1,0]]
 * Y = i(|1⟩⟨0| - |0⟩⟨1|) = [[0,-i],[i,0]]
 * Z = |0⟩⟨0| - |1⟩⟨1| = [[1,0],[0,-1]]
 */

import { Circuit } from '../../../src/index.js';

export function demonstratePauliGates(): void {
  console.log('=== Pauli Gates (X, Y, Z) ===\n');
  
  // X Gate - Bit Flip
  console.log('1. Pauli-X Gate (Bit Flip):');
  console.log('   Effect: |0⟩ → |1⟩, |1⟩ → |0⟩');
  
  // Test X on |0⟩
  let circuit = new Circuit(1);
  circuit.x(0);
  let result = circuit.execute();
  console.log('   X|0⟩ result:');
  console.log(`     |0⟩: ${(result.state.probabilities()[0] * 100).toFixed(1)}%`);
  console.log(`     |1⟩: ${(result.state.probabilities()[1] * 100).toFixed(1)}%`);
  
  // Test X on |1⟩ (apply X twice)
  circuit = new Circuit(1);
  circuit.x(0).x(0);  // X² = I (identity)
  result = circuit.execute();
  console.log('   X²|0⟩ result (X² = I):');
  console.log(`     |0⟩: ${(result.state.probabilities()[0] * 100).toFixed(1)}%`);
  console.log(`     |1⟩: ${(result.state.probabilities()[1] * 100).toFixed(1)}%\n`);
  
  // Y Gate - Bit and Phase Flip
  console.log('2. Pauli-Y Gate (Bit and Phase Flip):');
  console.log('   Effect: |0⟩ → i|1⟩, |1⟩ → -i|0⟩');
  
  circuit = new Circuit(1);
  circuit.y(0);
  result = circuit.execute();
  const yAmplitudes = [result.state.amplitude(0), result.state.amplitude(1)];
  console.log('   Y|0⟩ result:');
  console.log(`     Amplitude |0⟩: ${yAmplitudes[0].toString()}`);
  console.log(`     Amplitude |1⟩: ${yAmplitudes[1].toString()}`);
  console.log(`     Probabilities: |0⟩: ${(result.state.probabilities()[0] * 100).toFixed(1)}%, |1⟩: ${(result.state.probabilities()[1] * 100).toFixed(1)}%\n`);
  
  // Z Gate - Phase Flip
  console.log('3. Pauli-Z Gate (Phase Flip):');
  console.log('   Effect: |0⟩ → |0⟩, |1⟩ → -|1⟩');
  
  // Z gate has no effect on computational basis states probabilities
  circuit = new Circuit(1);
  circuit.z(0);
  result = circuit.execute();
  console.log('   Z|0⟩ result (no probability change):');
  console.log(`     |0⟩: ${(result.state.probabilities()[0] * 100).toFixed(1)}%`);
  console.log(`     |1⟩: ${(result.state.probabilities()[1] * 100).toFixed(1)}%`);
  
  // Show Z effect on superposition
  circuit = new Circuit(1);
  circuit.h(0).z(0);  // Create superposition then apply Z
  result = circuit.execute();
  const zAmplitudes = [result.state.amplitude(0), result.state.amplitude(1)];
  console.log('   H then Z|0⟩ (Z affects superposition):');
  console.log(`     Amplitude |0⟩: ${zAmplitudes[0].toString()}`);
  console.log(`     Amplitude |1⟩: ${zAmplitudes[1].toString()}\n`);
  
  // Pauli Gate Properties
  console.log('4. Pauli Gate Properties:');
  console.log('   • All Pauli gates are:');
  console.log('     - Unitary: P†P = I');
  console.log('     - Hermitian: P† = P');
  console.log('     - Involutory: P² = I (self-inverse)');
  
  // Demonstrate involution property
  console.log('   • Involution demonstration (P² = I):');
  
  // X² = I
  circuit = new Circuit(1);
  circuit.x(0).x(0);
  result = circuit.execute();
  console.log(`     X²|0⟩ = |0⟩: ${(result.state.probabilities()[0] * 100).toFixed(1)}% (should be 100%)`);
  
  // Y² = I  
  circuit = new Circuit(1);
  circuit.y(0).y(0);
  result = circuit.execute();
  console.log(`     Y²|0⟩ = |0⟩: ${(result.state.probabilities()[0] * 100).toFixed(1)}% (should be 100%)`);
  
  // Z² = I
  circuit = new Circuit(1);
  circuit.z(0).z(0);
  result = circuit.execute();
  console.log(`     Z²|0⟩ = |0⟩: ${(result.state.probabilities()[0] * 100).toFixed(1)}% (should be 100%)\n`);
  
  // Anti-commutation relations
  console.log('5. Anti-commutation Relations:');
  console.log('   Pauli gates anti-commute: {P₁, P₂} = P₁P₂ + P₂P₁ = 0');
  console.log('   Examples: XY = -YX, YZ = -ZY, ZX = -XZ');
  
  // Demonstrate XY vs YX
  circuit = new Circuit(1);
  circuit.h(0).x(0).y(0);  // Apply X then Y to superposition
  result = circuit.execute();
  const xyAmps = [result.state.amplitude(0), result.state.amplitude(1)];
  
  const circuit2 = new Circuit(1);
  circuit2.h(0).y(0).x(0);  // Apply Y then X to superposition
  const state2 = circuit2.execute();
  const yxAmps = [state2.state.amplitude(0), state2.state.amplitude(1)];
  
  console.log('   XY|+⟩ amplitudes:', xyAmps.map(a => a.toString()));
  console.log('   YX|+⟩ amplitudes:', yxAmps.map(a => a.toString()));
  console.log('   Note: XY = -YX (phase difference)\n');
  
  console.log('✓ Pauli gates demonstration completed!');
  console.log('Key takeaways:');
  console.log('• X flips computational basis states');
  console.log('• Y combines bit flip with phase');  
  console.log('• Z only affects relative phases');
  console.log('• All are self-inverse and anti-commute');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstratePauliGates();
  process.exit(0);
}
