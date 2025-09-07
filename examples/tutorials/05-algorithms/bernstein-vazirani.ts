// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Bernstein-Vazirani Algorithm
 * 
 * The Bernstein-Vazirani algorithm determines a secret bit string s
 * given a black-box function f(x) = s·x (mod 2) where s·x is the
 * dot product. While classically this requires n queries, the quantum
 * algorithm finds s with just 1 query.
 * 
 * Theory:
 * Given oracle for f(x) = s₀x₀ ⊕ s₁x₁ ⊕ ... ⊕ sₙ₋₁xₙ₋₁
 * Classical: Need n queries (test each bit individually)  
 * Quantum: Need 1 query (test all bits simultaneously)
 * 
 * Algorithm:
 * 1. Initialize n qubits in |0⟩ and ancilla in |1⟩
 * 2. Apply Hadamard to all qubits
 * 3. Apply oracle function Uf
 * 4. Apply Hadamard to first n qubits  
 * 5. Measure first n qubits → directly gives secret s
 */

import { Circuit } from '../../../src/index.js';

export function demonstrateBernsteinVazirani(): void {
  console.log('=== Bernstein-Vazirani Algorithm ===\\n');
  
  console.log('1. Algorithm Overview:');
  console.log('   Goal: Find secret string s given oracle f(x) = s·x (mod 2)');
  console.log('   Classical queries needed: n (one per bit)');
  console.log('   Quantum queries needed: 1 (all bits simultaneously)');
  console.log();
  
  // Example with 3-bit secret
  console.log('2. Example: 3-bit Secret String');
  const secretString = [1, 0, 1]; // s = "101"
  console.log(`   Secret string: s = ${secretString.join('')}`);
  console.log(`   Oracle function: f(x) = s·x = ${secretString.join('')}·x`);
  console.log('   f(x) = s₀x₀ ⊕ s₁x₁ ⊕ s₂x₂ = 1·x₀ ⊕ 0·x₁ ⊕ 1·x₂');
  console.log();
  
  // Create Bernstein-Vazirani oracle
  function createBVOracle(secret: number[]): (circuit: Circuit) => void {
    return (circuit: Circuit) => {
      const n = secret.length;
      // Apply CNOT(i, ancilla) for each bit i where secret[i] = 1
      for (let i = 0; i < n; i++) {
        if (secret[i] === 1) {
          circuit.cnot(i, n); // n is the ancilla qubit index
        }
      }
    };
  }
  
  function runBernsteinVazirani(n: number, oracle: (circuit: Circuit) => void): number[] {
    const circuit = new Circuit(n + 1); // n input qubits + 1 ancilla
    
    // Step 1: Initialize ancilla in |1⟩
    circuit.x(n);
    
    // Step 2: Apply Hadamard to all qubits
    for (let i = 0; i <= n; i++) {
      circuit.h(i);
    }
    
    // Step 3: Apply oracle
    oracle(circuit);
    
    // Step 4: Apply Hadamard to first n qubits
    for (let i = 0; i < n; i++) {
      circuit.h(i);
    }
    
    console.log('   Quantum circuit:');
    console.log(circuit.toString());
    
    // Execute and extract result
    const result = circuit.execute();
    const probabilities = result.state.probabilities();
    
    // Find most likely state for first n qubits
    let maxProb = 0;
    let foundSecret = new Array(n).fill(0);
    
    for (let i = 0; i < Math.pow(2, n + 1); i++) {
      if (probabilities[i] > maxProb) {
        maxProb = probabilities[i];
        // Extract first n bits (reverse bit order for little-endian)
        const binary = i.toString(2).padStart(n + 1, '0');
        foundSecret = binary.slice(0, n).split('').map(x => parseInt(x)).reverse();
      }
    }
    
    return foundSecret;
  }
  
  // Run the algorithm
  const oracle = createBVOracle(secretString);
  const result = runBernsteinVazirani(3, oracle);
  
  console.log('3. Algorithm Execution:');
  console.log(`   Input secret: s = ${secretString.join('')}`);
  console.log(`   Algorithm result: ${result.join('')}`);
  console.log(`   Match: ${JSON.stringify(secretString) === JSON.stringify(result) ? '✓' : '✗'}`);
  console.log();
  
  // Multiple examples
  console.log('4. Testing Multiple Secret Strings:');
  const testSecrets = [
    [1, 1, 1], // "111"
    [1, 0, 0], // "100"  
    [0, 1, 0], // "010"
    [0, 0, 0], // "000"
  ];
  
  testSecrets.forEach((secret, index) => {
    const oracle = createBVOracle(secret);
    const result = runBernsteinVazirani(3, oracle);
    const match = JSON.stringify(secret) === JSON.stringify(result);
    
    console.log(`   Test ${index + 1}: s = ${secret.join('')} → result = ${result.join('')} ${match ? '✓' : '✗'}`);
  });
  console.log();
  
  // Larger example  
  console.log('5. Larger Example: 5-bit Secret');
  const largeSecret = [1, 0, 1, 1, 0]; // "10110"
  console.log(`   Secret: s = ${largeSecret.join('')}`);
  
  const largeOracle = createBVOracle(largeSecret);
  const largeResult = runBernsteinVazirani(5, largeOracle);
  
  console.log(`   Result: ${largeResult.join('')}`);
  console.log(`   Correct: ${JSON.stringify(largeSecret) === JSON.stringify(largeResult) ? '✓' : '✗'}`);
  console.log();
  
  // Oracle function demonstration
  console.log('6. Oracle Function Analysis:');
  console.log('   For secret s = 101, the oracle computes:');
  console.log('   f(000) = 1·0 ⊕ 0·0 ⊕ 1·0 = 0');
  console.log('   f(001) = 1·0 ⊕ 0·0 ⊕ 1·1 = 1');
  console.log('   f(010) = 1·0 ⊕ 0·1 ⊕ 1·0 = 0'); 
  console.log('   f(011) = 1·0 ⊕ 0·1 ⊕ 1·1 = 1');
  console.log('   f(100) = 1·1 ⊕ 0·0 ⊕ 1·0 = 1');
  console.log('   f(101) = 1·1 ⊕ 0·0 ⊕ 1·1 = 0');
  console.log('   f(110) = 1·1 ⊕ 0·1 ⊕ 1·0 = 1');
  console.log('   f(111) = 1·1 ⊕ 0·1 ⊕ 1·1 = 0');
  console.log();
  
  // Classical vs quantum comparison
  console.log('7. Classical vs Quantum Approach:');
  console.log('   Classical strategy:');
  console.log('   • Query f(100) to find s₀ = f(100) = s₀');
  console.log('   • Query f(010) to find s₁ = f(010) = s₁');  
  console.log('   • Query f(001) to find s₂ = f(001) = s₂');
  console.log('   • Total: n queries for n-bit secret');
  console.log();
  console.log('   Quantum strategy:');
  console.log('   • Single query on superposition |+⟩⊗n');
  console.log('   • Interference reveals all bits simultaneously');
  console.log('   • Total: 1 query regardless of n');
  console.log();
  
  // Algorithm steps detailed
  console.log('8. Detailed Algorithm Steps:');
  console.log('   Input: Oracle Uf where Uf|x⟩|y⟩ = |x⟩|y ⊕ s·x⟩');
  console.log('   Goal: Find secret string s');
  console.log();
  console.log('   Step 1: |0⟩⊗n|1⟩ (initialize input in |0⟩, ancilla in |1⟩)');
  console.log('   Step 2: H⊗(n+1) → |+⟩⊗n|−⟩ (create superposition)');
  console.log('   Step 3: Apply Uf → phase kickback encodes s');
  console.log('   Step 4: H⊗n ⊗ I → interference extracts s');
  console.log('   Step 5: Measure first n qubits → get s directly');
  console.log();
  
  // Quantum advantage
  console.log('9. Quantum Advantage:');
  console.log('   • Exponential improvement over classical for large n');
  console.log('   • Demonstrates quantum parallelism');
  console.log('   • Foundation for more complex algorithms');
  console.log('   • Shows power of phase kickback technique');
  console.log();
  
  // Extensions and variations
  console.log('10. Extensions and Applications:');
  console.log('    • Generalization to Simon\'s algorithm');
  console.log('    • Building block for Shor\'s algorithm');
  console.log('    • Quantum machine learning applications');  
  console.log('    • Quantum error correction syndrome extraction');
  console.log('    • Hidden linear function problems');
  
  console.log('\\n✓ Bernstein-Vazirani algorithm completed!');
  console.log('Key takeaways:');
  console.log('• Single quantum query vs n classical queries');
  console.log('• Perfect success probability (deterministic)');
  console.log('• Demonstrates quantum parallelism and interference');
  console.log('• Foundation for understanding quantum advantage');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateBernsteinVazirani();
  process.exit(0);
}
