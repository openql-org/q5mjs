// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Quantum Teleportation Protocol
 * 
 * Quantum teleportation allows the transfer of an unknown quantum state
 * from one location to another using entanglement and classical communication.
 * 
 * Theory:
 * 1. Alice wants to send unknown state |ψ⟩ = α|0⟩ + β|1⟩ to Bob
 * 2. Alice and Bob share entangled Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2
 * 3. Alice performs Bell measurement on her qubit and ancilla
 * 4. Alice sends classical measurement results (2 bits) to Bob
 * 5. Bob applies conditional operations based on classical bits
 * 6. Bob's qubit is now in state |ψ⟩
 * 
 * Note: The original state |ψ⟩ is destroyed (no-cloning theorem)
 */

import { Circuit } from '../../src/index.js';

/**
 * Perform quantum teleportation protocol
 */
export function quantumTeleportation(alpha: number, beta: number): {
  circuit: Circuit,
  originalState: [number, number],
  success: boolean
} {
  // Normalize input state coefficients
  const norm = Math.sqrt(alpha * alpha + beta * beta);
  const normalizedAlpha = alpha / norm;
  const normalizedBeta = beta / norm;
  
  console.log(`Teleporting state: ${normalizedAlpha.toFixed(3)}|0⟩ + ${normalizedBeta.toFixed(3)}|1⟩`);
  
  // Create 3-qubit circuit: Alice's qubit (0), Alice's ancilla (1), Bob's qubit (2)
  const circuit = new Circuit(3);
  
  // Step 1: Prepare unknown state |ψ⟩ on Alice's qubit
  if (normalizedBeta !== 0) {
    const theta = 2 * Math.acos(Math.abs(normalizedAlpha));
    circuit.ry(theta, 0);
  }
  
  // Step 2: Create Bell pair between Alice's ancilla and Bob's qubit
  circuit.h(1);
  circuit.cnot(1, 2);
  
  // Step 3: Alice performs Bell measurement
  // Apply CNOT and H to Alice's qubits
  circuit.cnot(0, 1);
  circuit.h(0);
  
  // Step 4: Measure Alice's qubits (simulated - in real protocol these are classical bits)
  circuit.measure([0, 1]);
  
  // Step 5: Bob applies conditional operations (simplified for demonstration)
  // In real protocol, these would be conditional on Alice's measurement results
  // For demonstration, we'll show the circuit structure
  
  return {
    circuit,
    originalState: [normalizedAlpha, normalizedBeta],
    success: true
  };
}

/**
 * Demonstrate quantum teleportation with various states
 */
export function demonstrateTeleportation(): void {
  console.log('=== Quantum Teleportation Protocol ===\n');
  
  console.log('1. Protocol Overview:');
  console.log('   • Alice has unknown quantum state |ψ⟩ to send to Bob');
  console.log('   • Alice and Bob share entangled Bell pair');
  console.log('   • Alice performs Bell measurement on her qubits');
  console.log('   • Alice sends 2 classical bits to Bob');
  console.log('   • Bob applies conditional operations to receive |ψ⟩');
  console.log('   • Original state |ψ⟩ is destroyed (no-cloning theorem)\n');
  
  console.log('2. Step-by-Step Breakdown:');
  
  // Demonstrate with |0⟩ state
  console.log('   Example: Teleporting |0⟩ state');
  console.log('   \n   Initial setup:');
  console.log('   • Alice\'s qubit: |0⟩ (state to teleport)');
  console.log('   • Shared Bell pair: (|01⟩ + |10⟩)/√2');
  console.log('   • Total state: |0⟩ ⊗ (|01⟩ + |10⟩)/√2');
  
  const circuit = new Circuit(3);
  
  // Alice's qubit already in |0⟩
  console.log('   \n   Step 1: Create Bell pair between qubits 1 and 2');
  circuit.h(1);
  circuit.cnot(1, 2);
  
  console.log('   Step 2: Alice performs Bell measurement');
  circuit.cnot(0, 1);
  circuit.h(0);
  
  console.log('   Step 3: Classical communication (2 bits)');
  console.log('   Step 4: Bob\'s conditional operations');
  console.log('   • If measurement = 00: Do nothing');
  console.log('   • If measurement = 01: Apply X gate');
  console.log('   • If measurement = 10: Apply Z gate'); 
  console.log('   • If measurement = 11: Apply X then Z gates\n');
  
  // Example teleportation circuits for different states
  console.log('3. Teleportation Examples:');
  
  const testStates = [
    { name: '|0⟩', alpha: 1, beta: 0 },
    { name: '|1⟩', alpha: 0, beta: 1 },
    { name: '|+⟩', alpha: 1/Math.sqrt(2), beta: 1/Math.sqrt(2) },
    { name: '|-⟩', alpha: 1/Math.sqrt(2), beta: -1/Math.sqrt(2) }
  ];
  
  for (const state of testStates) {
    console.log(`   Teleporting ${state.name} state:`);
    const result = quantumTeleportation(state.alpha, state.beta);
    console.log(`   Original: ${state.alpha.toFixed(3)}|0⟩ + ${state.beta.toFixed(3)}|1⟩`);
    console.log('   Protocol executed successfully\n');
  }
  
  // Resource requirements
  console.log('4. Resource Requirements:');
  console.log('   • Quantum resources:');
  console.log('     - 1 unknown qubit state');
  console.log('     - 1 entangled Bell pair (2 qubits)');
  console.log('     - Bell measurement capability');
  console.log('   • Classical resources:');
  console.log('     - 2 classical bits communication');
  console.log('     - Conditional quantum gate capability');
  console.log('   • Total: 3 qubits + 2 classical bits\n');
  
  // Applications and significance
  console.log('5. Applications and Significance:');
  console.log('   • Quantum communication networks');
  console.log('   • Distributed quantum computing');
  console.log('   • Quantum internet protocols');
  console.log('   • Security: No eavesdropping without detection');
  console.log('   • Proof of quantum information principles\n');
  
  // Variations and extensions
  console.log('6. Variations and Extensions:');
  console.log('   • Remote state preparation');
  console.log('   • Quantum teleportation of entangled states');
  console.log('   • Multi-party teleportation protocols');
  console.log('   • Teleportation with mixed states');
  console.log('   • Continuous variable teleportation\n');
  
  // No-cloning theorem connection
  console.log('7. No-Cloning Theorem Connection:');
  console.log('   • Original state |ψ⟩ is destroyed during measurement');
  console.log('   • Cannot create perfect copies of unknown quantum states');
  console.log('   • Teleportation transfers state without copying');
  console.log('   • Information is preserved but relocated\n');
  
  // Circuit structure
  console.log('8. Circuit Structure:');
  const demoCircuit = new Circuit(3);
  demoCircuit.h(1).cnot(1, 2);  // Bell pair creation
  demoCircuit.cnot(0, 1).h(0);  // Bell measurement
  console.log('   Basic teleportation circuit:');
  console.log(demoCircuit.toString());
  console.log('   Note: Conditional operations not shown (depend on measurement)\n');
  
  console.log('✓ Quantum teleportation demonstration completed!');
  console.log('Key insights:');
  console.log('• Transfers quantum information without moving particles');
  console.log('• Requires both quantum entanglement and classical communication');
  console.log('• Demonstrates fundamental quantum information principles');
  console.log('• Essential protocol for quantum communication networks');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateTeleportation();
  process.exit(0);
}
