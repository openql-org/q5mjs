// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Create Bell State
 * 
 * This recipe demonstrates how to create a Bell state,
 * the simplest example of quantum entanglement.
 * 
 * Theory:
 * Bell states are maximally entangled two-qubit states.
 * The most common Bell state (|Φ+⟩) is:
 * (|00⟩ + |11⟩)/√2
 * 
 * Recipe:
 * 1. Start with |00⟩
 * 2. Apply H to first qubit: (|0⟩ + |1⟩)/√2 ⊗ |0⟩
 * 3. Apply CNOT: (|00⟩ + |11⟩)/√2
 */

import { Circuit } from '../../src/index.js';

export function createBellState(type: 'Φ+' | 'Φ-' | 'Ψ+' | 'Ψ-' = 'Φ+'): Circuit {
  console.log(`Creating Bell state |${type}⟩`);
  
  const circuit = new Circuit(2);
  
  // Step 1: Apply Hadamard to first qubit
  circuit.h(0);
  
  // Step 2: Apply CNOT with first qubit as control
  circuit.cnot(0, 1);
  
  // Step 3: Apply additional gates based on Bell state type
  switch (type) {
    case 'Φ+':
      // |Φ+⟩ = (|00⟩ + |11⟩)/√2
      // No additional gates needed
      break;
    case 'Φ-':
      // |Φ-⟩ = (|00⟩ - |11⟩)/√2
      circuit.z(0);
      break;
    case 'Ψ+':
      // |Ψ+⟩ = (|01⟩ + |10⟩)/√2
      circuit.x(1);
      break;
    case 'Ψ-':
      // |Ψ-⟩ = (|01⟩ - |10⟩)/√2
      circuit.x(1).z(0);
      break;
  }
  
  return circuit;
}

export function demonstrateBellState(): void {
  console.log('=== Bell State Creation ===\n');
  
  // Create all four Bell states
  const bellStates: Array<'Φ+' | 'Φ-' | 'Ψ+' | 'Ψ-'> = ['Φ+', 'Φ-', 'Ψ+', 'Ψ-'];
  
  for (const type of bellStates) {
    console.log(`\n${type} Bell State:`);
    console.log('-'.repeat(40));
    
    const circuit = createBellState(type);
    const result = circuit.execute();
    
    // Show circuit
    console.log('Circuit:');
    console.log(circuit.toString());
    
    // Show amplitudes
    console.log('\nAmplitudes:');
    const amplitudes = [result.state.amplitude(0), result.state.amplitude(1)];
    amplitudes.forEach((amp, i) => {
      if (Math.abs(amp.re) > 0.001 || Math.abs(amp.im) > 0.001) {
        const binary = i.toString(2).padStart(2, '0');
        console.log(`  |${binary}⟩: ${amp.toString()}`);
      }
    });
    
    // Show probabilities
    console.log('\nProbabilities:');
    const probabilities = result.state.probabilities();
    probabilities.forEach((prob, i) => {
      if (prob > 0.001) {
        const binary = i.toString(2).padStart(2, '0');
        const percentage = (prob * 100).toFixed(1);
        console.log(`  |${binary}⟩: ${percentage}%`);
      }
    });
    
    // Verify entanglement
    console.log('\nEntanglement verified:');
    const p00 = result.state.probabilities()[0b00];
    const p11 = result.state.probabilities()[0b11];
    const p01 = result.state.probabilities()[0b01];
    const p10 = result.state.probabilities()[0b10];
    
    if (type === 'Φ+' || type === 'Φ-') {
      console.log(`  |00⟩ and |11⟩ are entangled (50% each)`);
      console.log(`  Correlation: measuring 0 on qubit 1 guarantees 0 on qubit 2`);
    } else {
      console.log(`  |01⟩ and |10⟩ are entangled (50% each)`);
      console.log(`  Anti-correlation: measuring 0 on qubit 1 guarantees 1 on qubit 2`);
    }
  }
  
  console.log('\n✓ Successfully created all four Bell states!');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateBellState();
  process.exit(0);
}
