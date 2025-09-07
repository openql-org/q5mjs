// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Hadamard Gate
 * 
 * The Hadamard gate is one of the most important gates in quantum computing,
 * creating equal superposition states from computational basis states.
 * 
 * Theory:
 * The Hadamard gate performs a π rotation around the axis (X+Z)/√2 on the Bloch sphere.
 * It maps:
 * - |0⟩ → (|0⟩ + |1⟩)/√2 = |+⟩
 * - |1⟩ → (|0⟩ - |1⟩)/√2 = |-⟩
 * 
 * Matrix representation:
 * H = (1/√2) * [[1, 1], [1, -1]]
 * 
 * Properties:
 * - Unitary: H†H = I
 * - Hermitian: H† = H  
 * - Self-inverse: H² = I
 * - Creates uniform superposition from basis states
 */

import { Circuit } from '../../../src/index.js';

export function demonstrateHadamard(): void {
  console.log('=== Hadamard Gate ===\n');
  
  // Basic superposition creation
  console.log('1. Creating Superposition:');
  console.log('   H|0⟩ = (|0⟩ + |1⟩)/√2 = |+⟩');
  
  let circuit = new Circuit(1);
  circuit.h(0);
  let result = circuit.execute();
  let amplitudes = [result.state.amplitude(0), result.state.amplitude(1)];
  
  console.log('   Result:');
  console.log(`     Amplitude |0⟩: ${amplitudes[0].toString()}`);
  console.log(`     Amplitude |1⟩: ${amplitudes[1].toString()}`);
  console.log(`     Probabilities: |0⟩: ${(result.state.probabilities()[0] * 100).toFixed(1)}%, |1⟩: ${(result.state.probabilities()[1] * 100).toFixed(1)}%`);
  console.log(`     Expected: 50% each (equal superposition)\n`);
  
  // Hadamard on |1⟩
  console.log('2. Hadamard on |1⟩:');
  console.log('   H|1⟩ = (|0⟩ - |1⟩)/√2 = |-⟩');
  
  circuit = new Circuit(1);
  circuit.x(0).h(0);  // Prepare |1⟩ then apply H
  result = circuit.execute();
  amplitudes = [result.state.amplitude(0), result.state.amplitude(1)];
  
  console.log('   Result:');
  console.log(`     Amplitude |0⟩: ${amplitudes[0].toString()}`);
  console.log(`     Amplitude |1⟩: ${amplitudes[1].toString()}`);
  console.log('   Note: |1⟩ coefficient is negative (|-⟩ state)\n');
  
  // Self-inverse property
  console.log('3. Self-Inverse Property (H² = I):');
  console.log('   Applying H twice returns to original state');
  
  // H²|0⟩ = |0⟩
  circuit = new Circuit(1);
  circuit.h(0).h(0);
  result = circuit.execute();
  console.log('   H²|0⟩:');
  console.log(`     |0⟩: ${(result.state.probabilities()[0] * 100).toFixed(1)}% (should be 100%)`);
  console.log(`     |1⟩: ${(result.state.probabilities()[1] * 100).toFixed(1)}% (should be 0%)`);
  
  // H²|1⟩ = |1⟩
  circuit = new Circuit(1);
  circuit.x(0).h(0).h(0);
  result = circuit.execute();
  console.log('   H²|1⟩:');
  console.log(`     |0⟩: ${(result.state.probabilities()[0] * 100).toFixed(1)}% (should be 0%)`);
  console.log(`     |1⟩: ${(result.state.probabilities()[1] * 100).toFixed(1)}% (should be 100%)\n`);
  
  // Basis transformation
  console.log('4. Computational ↔ Superposition Basis:');
  console.log('   H transforms between computational {|0⟩, |1⟩} and superposition {|+⟩, |-⟩} bases');
  
  console.log('   Computational → Superposition:');
  console.log('   |0⟩ --H--> |+⟩ = (|0⟩ + |1⟩)/√2');
  console.log('   |1⟩ --H--> |-⟩ = (|0⟩ - |1⟩)/√2');
  
  console.log('   Superposition → Computational:');
  console.log('   |+⟩ --H--> |0⟩');
  console.log('   |-⟩ --H--> |1⟩\n');
  
  // Multi-qubit superposition
  console.log('5. Multi-Qubit Uniform Superposition:');
  console.log('   Applying H to each qubit creates uniform superposition over all basis states');
  
  // 2-qubit case
  circuit = new Circuit(2);
  circuit.h(0).h(1);
  result = circuit.execute();
  
  console.log('   H⊗H|00⟩ creates uniform superposition over 4 states:');
  for (let i = 0; i < 4; i++) {
    const binary = i.toString(2).padStart(2, '0');
    const prob = (result.state.probabilities()[i] * 100).toFixed(1);
    console.log(`     |${binary}⟩: ${prob}%`);
  }
  
  // 3-qubit case  
  console.log('   H⊗H⊗H|000⟩ creates uniform superposition over 8 states:');
  circuit = new Circuit(3);
  circuit.h(0).h(1).h(2);
  result = circuit.execute();
  
  for (let i = 0; i < 8; i++) {
    const binary = i.toString(2).padStart(3, '0');
    const prob = (result.state.probabilities()[i] * 100).toFixed(1);
    console.log(`     |${binary}⟩: ${prob}%`);
  }
  console.log();
  
  // Hadamard and interference
  console.log('6. Quantum Interference:');
  console.log('   H creates interference patterns when applied to superposition');
  
  // Demonstrate interference
  circuit = new Circuit(1);
  circuit.h(0).z(0).h(0);  // H-Z-H sequence
  result = circuit.execute();
  
  console.log('   H-Z-H|0⟩ sequence (creates interference):');
  console.log(`     |0⟩: ${(result.state.probabilities()[0] * 100).toFixed(1)}%`);
  console.log(`     |1⟩: ${(result.state.probabilities()[1] * 100).toFixed(1)}%`);
  console.log('   This demonstrates constructive/destructive interference\n');
  
  // Circuit visualization
  console.log('7. Circuit Examples:');
  
  // Simple superposition
  const demoCircuit1 = new Circuit(1);
  demoCircuit1.h(0);
  console.log('   Single Hadamard:');
  console.log(demoCircuit1.toString());
  
  // H-Z-H sequence (equivalent to X)
  const demoCircuit2 = new Circuit(1);
  demoCircuit2.h(0).z(0).h(0);
  console.log('   H-Z-H sequence:');
  console.log(demoCircuit2.toString());
  
  console.log('\n✓ Hadamard gate demonstration completed!');
  console.log('Key concepts:');
  console.log('• Creates equal superposition from basis states');
  console.log('• Self-inverse: applying twice returns original state');
  console.log('• Enables quantum interference and parallelism');
  console.log('• Foundation for many quantum algorithms');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateHadamard();
  process.exit(0);
}
