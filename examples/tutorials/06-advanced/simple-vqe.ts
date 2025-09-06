// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Simple VQE Demo
 * 
 * A simplified demonstration of Variational Quantum Eigensolver concepts.
 */

import { Circuit } from '../../../src/index.js';

export function demonstrateSimpleVQE(): void {
  console.log('=== Simple VQE Demo ===\\n');
  
  console.log('1. VQE Overview:');
  console.log('   Goal: Find ground state energy using quantum-classical hybrid');
  console.log('   Method: Parameterized quantum circuit + classical optimization\\n');
  
  // Simple ansatz for 2-qubit system
  function createSimpleAnsatz(theta1: number, theta2: number): Circuit {
    const circuit = new Circuit(2);
    circuit.ry(theta1, 0);
    circuit.ry(theta2, 1);
    circuit.cnot(0, 1);
    return circuit;
  }
  
  // Test different parameters
  console.log('2. Testing Different Parameters:');
  const testParams = [
    [0, 0],
    [Math.PI/4, Math.PI/4],
    [Math.PI/2, Math.PI/2],
    [Math.PI, 0]
  ];
  
  testParams.forEach(([theta1, theta2], i) => {
    const circuit = createSimpleAnsatz(theta1, theta2);
    const result = circuit.execute();
    const probs = result.state.probabilities();
    
    console.log(`   Test ${i+1}: θ₁=${(theta1/Math.PI).toFixed(2)}π, θ₂=${(theta2/Math.PI).toFixed(2)}π`);
    console.log(`     |00⟩: ${(probs[0]*100).toFixed(1)}%, |01⟩: ${(probs[1]*100).toFixed(1)}%, |10⟩: ${(probs[2]*100).toFixed(1)}%, |11⟩: ${(probs[3]*100).toFixed(1)}%`);
  });
  
  console.log('\\n3. VQE Applications:');
  console.log('   • Molecular ground state calculations');
  console.log('   • Materials science simulations');
  console.log('   • Optimization problems');
  console.log('   • Quantum machine learning');
  
  console.log('\\n✓ Simple VQE demo completed!');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateSimpleVQE();
  process.exit(0);
}
