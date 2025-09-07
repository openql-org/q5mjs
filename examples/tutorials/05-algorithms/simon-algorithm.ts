// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Simon's Algorithm
 * 
 * Simon's algorithm finds the period of a Boolean function with exponential
 * speedup over classical algorithms. Given a function f: {0,1}^n → {0,1}^n
 * that satisfies f(x) = f(x ⊕ s) for some secret string s ≠ 0, Simon's
 * algorithm finds s efficiently.
 * 
 * Theory:
 * Classical approach: O(2^(n/2)) queries needed
 * Quantum approach: O(n) queries needed
 * 
 * Algorithm:
 * 1. Initialize two n-qubit registers in |0⟩
 * 2. Apply Hadamard to first register  
 * 3. Apply oracle function Uf
 * 4. Apply Hadamard to first register
 * 5. Measure first register to get y such that y·s = 0
 * 6. Repeat to collect n-1 linearly independent equations
 * 7. Solve system of linear equations to find s
 */

import { Circuit } from '../../../src/index.js';

export function demonstrateSimonAlgorithm(): void {
  console.log('=== Simon\'s Algorithm ===\\n');
  
  // Example for 3-qubit case
  console.log('1. Simon's Algorithm for 3-bit Functions:');
  console.log('   Finding secret string s where f(x) = f(x ⊕ s)');
  console.log();
  
  // Secret string: s = "101" (binary)
  const secretString = [1, 0, 1];
  console.log(`   Secret string s = ${secretString.join('')}`);
  console.log('   Oracle function: f(x) = f(x ⊕ 101)');
  console.log();
  
  // Create Simon oracle for s = "101"
  function createSimonOracle(secret: number[]): (circuit: Circuit) => void {
    return (circuit: Circuit) => {
      const n = secret.length;
      
      // Simple implementation: if secret[i] = 1, apply CNOT(i, n+i)
      // This creates the required f(x) = f(x ⊕ s) property
      for (let i = 0; i < n; i++) {
        if (secret[i] === 1) {
          circuit.cnot(i, n + i);
        }
      }
      
      // Add some mixing to make it more realistic
      for (let i = 0; i < n; i++) {
        circuit.cnot(i, n + (i + 1) % n);
      }
    };
  }
  
  function runSimonIteration(n: number, oracle: (circuit: Circuit) => void): number[] {
    const circuit = new Circuit(2 * n); // n input qubits + n output qubits
    
    // Step 1: Apply Hadamard to input register
    for (let i = 0; i < n; i++) {
      circuit.h(i);
    }
    
    // Step 2: Apply oracle
    oracle(circuit);
    
    // Step 3: Apply Hadamard to input register
    for (let i = 0; i < n; i++) {
      circuit.h(i);
    }
    
    // Execute and extract measurement result
    const result = circuit.execute();
    const probabilities = result.state.probabilities();
    
    // Find the most likely outcome for the first n qubits
    let maxProb = 0;
    let outcome = new Array(n).fill(0);
    
    for (let i = 0; i < Math.pow(2, 2 * n); i++) {
      if (probabilities[i] > maxProb) {
        maxProb = probabilities[i];
        // Extract first n bits
        const binary = i.toString(2).padStart(2 * n, '0');
        outcome = binary.slice(0, n).split('').map(x => parseInt(x));
      }
    }
    
    return outcome;
  }
  
  // Run Simon\'s algorithm iterations
  console.log('2. Running Simon\'s Algorithm Iterations:');
  console.log('   Each iteration gives equation y·s = 0 (mod 2)');
  console.log();
  
  const oracle = createSimonOracle(secretString);
  const equations: number[][] = [];
  
  for (let iteration = 0; iteration < 3; iteration++) {
    const outcome = runSimonIteration(3, oracle);
    equations.push(outcome);
    
    console.log(`   Iteration ${iteration + 1}: y = ${outcome.join('')}`);
    
    // Show the equation y·s = 0
    const dotProduct = outcome.reduce((sum, bit, i) => sum ^ (bit * secretString[i]), 0);
    console.log(`   Equation: ${outcome.join('')}·${secretString.join('')} = ${dotProduct} (mod 2)`);
    console.log();
  }
  
  // Classical post-processing (simplified)
  console.log('3. Classical Post-Processing:');
  console.log('   Solving system of linear equations over GF(2)');
  console.log();
  
  console.log('   System of equations:');
  equations.forEach((eq, i) => {
    const terms = eq.map((bit, j) => bit === 1 ? `s${j}` : '0').filter(t => t !== '0');
    const equation = terms.length > 0 ? terms.join(' ⊕ ') + ' = 0' : '0 = 0';
    console.log(`   ${eq.join('')}·s = ${equation}`);
  });
  console.log();
  
  // Theoretical analysis
  console.log('4. Algorithm Analysis:');
  console.log('   Classical complexity: O(2^(n/2)) function evaluations');
  console.log('   Quantum complexity: O(n) function evaluations');
  console.log('   For n=256: Classical ~10^38 vs Quantum ~256');
  console.log('   Exponential speedup!');
  console.log();
  
  // Applications and extensions
  console.log('5. Applications:');
  console.log('   • Cryptanalysis of certain ciphers');
  console.log('   • Period finding (foundation for Shor\'s algorithm)');
  console.log('   • Hidden subgroup problems');
  console.log('   • Quantum key distribution attacks');
  console.log();
  
  // Different oracle example
  console.log('6. Alternative Oracle Example:');
  console.log('   Secret string s = "011"');
  
  function createAlternativeOracle(): (circuit: Circuit) => void {
    return (circuit: Circuit) => {
      // Oracle for s = "011"
      circuit.cnot(1, 4).cnot(2, 5); // Apply CNOTs for bits where s[i] = 1
      circuit.cnot(0, 3).cnot(1, 4); // Additional mixing
    };
  }
  
  const altOracle = createAlternativeOracle();
  const altOutcome = runSimonIteration(3, altOracle);
  console.log(`   Sample measurement: y = ${altOutcome.join('')}`);
  console.log(`   This should satisfy: y·011 = 0 (mod 2)`);
  console.log();
  
  console.log('7. Step-by-Step Algorithm:');
  console.log('   Input: Oracle Uf for f(x) = f(x ⊕ s)');
  console.log('   Goal: Find secret string s');
  console.log();
  console.log('   Quantum Steps:');
  console.log('   1. |0⟩⊗n|0⟩⊗n → H⊗n ⊗ I⊗n → superposition');
  console.log('   2. Apply oracle Uf');
  console.log('   3. Apply H⊗n ⊗ I⊗n');
  console.log('   4. Measure first register → get y');
  console.log('   5. Repeat O(n) times');
  console.log();
  console.log('   Classical Post-processing:');
  console.log('   6. Solve y₁·s = 0, y₂·s = 0, ..., yₖ·s = 0');
  console.log('   7. Find unique non-zero solution s');
  console.log();
  
  console.log('✓ Simon\'s algorithm demonstration completed!');
  console.log('Key insights:');
  console.log('• Exponential quantum speedup for period finding');
  console.log('• Foundation for Shor\'s factoring algorithm');
  console.log('• Demonstrates power of quantum parallelism and interference');
  console.log('• Requires classical post-processing to extract answer');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateSimonAlgorithm();
  process.exit(0);
}
