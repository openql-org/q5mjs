// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * GHZ State Creation
 * 
 * The GHZ (Greenberger-Horne-Zeilinger) state is a maximally entangled
 * quantum state of three or more qubits. It demonstrates quantum
 * entanglement beyond what's possible with classical physics.
 * 
 * Theory:
 * For n qubits, the GHZ state is:
 * |GHZ⟩ = (|00...0⟩ + |11...1⟩)/√2
 * 
 * Properties:
 * - Maximally entangled for n ≥ 3 qubits
 * - Non-local correlations stronger than Bell states
 * - Used in quantum error correction and cryptography
 * - Foundation for quantum networking protocols
 */

import { Circuit } from '../../src/index.js';

export function demonstrateGHZState(): void {
  console.log('=== GHZ State Creation ===\n');
  
  // 3-qubit GHZ state
  console.log('1. Three-Qubit GHZ State:');
  console.log('   |GHZ₃⟩ = (|000⟩ + |111⟩)/√2');
  
  const circuit3 = new Circuit(3);
  circuit3.h(0).cnot(0, 1).cnot(1, 2);
  const result3 = circuit3.execute();
  
  console.log('   Circuit construction:');
  console.log('   |000⟩ → H(0) → CNOT(0,1) → CNOT(1,2)');
  console.log(circuit3.toString());
  
  console.log('   Resulting state:');
  const probs3 = result3.state.probabilities();
  for (let i = 0; i < 8; i++) {
    const binary = i.toString(2).padStart(3, '0');
    const prob = (probs3[i] * 100).toFixed(1);
    if (prob > 0.1) {
      const amplitude = result3.state.amplitude(i);
      console.log(`     |${binary}⟩: ${prob}% (amplitude: ${amplitude.toString()})`);
    }
  }
  console.log('   Perfect correlation: All qubits have same measurement outcome\n');
  
  // 4-qubit GHZ state
  console.log('2. Four-Qubit GHZ State:');
  console.log('   |GHZ₄⟩ = (|0000⟩ + |1111⟩)/√2');
  
  const circuit4 = new Circuit(4);
  circuit4.h(0).cnot(0, 1).cnot(1, 2).cnot(2, 3);
  const result4 = circuit4.execute();
  
  console.log('   Circuit construction:');
  console.log('   |0000⟩ → H(0) → CNOT(0,1) → CNOT(1,2) → CNOT(2,3)');
  
  console.log('   Resulting state:');
  const probs4 = result4.state.probabilities();
  for (let i = 0; i < 16; i++) {
    const binary = i.toString(2).padStart(4, '0');
    const prob = (probs4[i] * 100).toFixed(1);
    if (prob > 0.1) {
      console.log(`     |${binary}⟩: ${prob}%`);
    }
  }
  console.log();
  
  // General n-qubit GHZ state creation
  console.log('3. General n-Qubit GHZ State Creation:');
  console.log('   Algorithm: H(0) followed by CNOT cascade');
  
  function createGHZState(n: number): Circuit {
    const circuit = new Circuit(n);
    circuit.h(0); // Create superposition on first qubit
    
    // Apply CNOT gates to entangle all qubits
    for (let i = 0; i < n - 1; i++) {
      circuit.cnot(i, i + 1);
    }
    
    return circuit;
  }
  
  // Demonstrate 5-qubit GHZ
  const circuit5 = createGHZState(5);
  const result5 = circuit5.execute();
  
  console.log('   5-qubit GHZ state:');
  console.log(circuit5.toString());
  
  const probs5 = result5.state.probabilities();
  console.log('   Non-zero amplitudes:');
  for (let i = 0; i < 32; i++) {
    const binary = i.toString(2).padStart(5, '0');
    const prob = (probs5[i] * 100).toFixed(1);
    if (prob > 0.1) {
      console.log(`     |${binary}⟩: ${prob}%`);
    }
  }
  console.log();
  
  // GHZ vs Bell state comparison
  console.log('4. GHZ vs Bell State Comparison:');
  console.log('   Comparing entanglement properties');
  
  // Bell state (2-qubit)
  const bellCircuit = new Circuit(2);
  bellCircuit.h(0).cnot(0, 1);
  const bellResult = bellCircuit.execute();
  const bellProbs = bellResult.state.probabilities();
  
  console.log('   Bell state |Φ+⟩:');
  for (let i = 0; i < 4; i++) {
    const binary = i.toString(2).padStart(2, '0');
    const prob = (bellProbs[i] * 100).toFixed(1);
    if (prob > 0.1) {
      console.log(`     |${binary}⟩: ${prob}%`);
    }
  }
  
  console.log('   3-qubit GHZ state:');
  for (let i = 0; i < 8; i++) {
    const binary = i.toString(2).padStart(3, '0');
    const prob = (probs3[i] * 100).toFixed(1);
    if (prob > 0.1) {
      console.log(`     |${binary}⟩: ${prob}%`);
    }
  }
  console.log();
  
  // Measurement correlations
  console.log('5. Measurement Correlations:');
  console.log('   GHZ states exhibit perfect correlation:');
  console.log('   • Measuring any qubit in computational basis');
  console.log('   • All other qubits will have the same outcome');
  console.log('   • |000...0⟩ → all measurements give 0');
  console.log('   • |111...1⟩ → all measurements give 1');
  console.log('   • 50% probability for each outcome');
  console.log();
  
  // Applications
  console.log('6. Applications of GHZ States:');
  console.log('   • Quantum Secret Sharing');
  console.log('   • Multi-party quantum cryptography');
  console.log('   • Quantum error correction codes');
  console.log('   • Tests of quantum non-locality');
  console.log('   • Quantum communication networks');
  console.log('   • Quantum sensing and metrology');
  console.log();
  
  // Alternative GHZ preparation methods
  console.log('7. Alternative Preparation Methods:');
  console.log('   Method 1: Linear chain (used above)');
  console.log('   H(0) → CNOT(0,1) → CNOT(1,2) → ...');
  console.log();
  
  console.log('   Method 2: Star pattern');
  const starCircuit = new Circuit(3);
  starCircuit.h(0).cnot(0, 1).cnot(0, 2);
  const starResult = starCircuit.execute();
  
  console.log('   H(0) → CNOT(0,1) → CNOT(0,2)');
  console.log(starCircuit.toString());
  
  console.log('   Both methods create the same GHZ state:');
  const starProbs = starResult.state.probabilities();
  for (let i = 0; i < 8; i++) {
    const binary = i.toString(2).padStart(3, '0');
    const prob = (starProbs[i] * 100).toFixed(1);
    if (prob > 0.1) {
      console.log(`     |${binary}⟩: ${prob}%`);
    }
  }
  console.log();
  
  console.log('✓ GHZ state creation completed!');
  console.log('Key takeaways:');
  console.log('• GHZ states are maximally entangled multi-qubit states');
  console.log('• Perfect correlation: all qubits measure the same');
  console.log('• Essential for quantum communication and cryptography');
  console.log('• Multiple equivalent preparation methods exist');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateGHZState();
  process.exit(0);
}
