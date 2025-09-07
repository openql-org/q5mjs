// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Build Quantum Fourier Transform (QFT)
 * 
 * The Quantum Fourier Transform is the quantum analog of the classical
 * discrete Fourier transform and is a key component in many quantum algorithms
 * including Shor's algorithm and quantum phase estimation.
 * 
 * Theory:
 * QFT transforms computational basis states |j⟩ to:
 * |j⟩ → (1/√N) Σ(k=0 to N-1) e^(2πijk/N) |k⟩
 * 
 * For an n-qubit state |j⟩ = |j₁j₂...jₙ⟩, QFT produces:
 * |j⟩ → (1/√2ⁿ) ⊗(k=1 to n) (|0⟩ + e^(2πij·0.j_k j_(k+1)...jₙ) |1⟩)
 * 
 * Implementation uses controlled rotations and Hadamard gates:
 * 1. Apply H to first qubit
 * 2. Apply controlled rotations from subsequent qubits
 * 3. Repeat for each qubit
 * 4. Reverse qubit order (SWAP gates)
 */

import { Circuit } from '../../src/index.js';

/**
 * Apply QFT to n qubits starting from startQubit
 */
export function applyQFT(circuit: Circuit, startQubit: number, numQubits: number): Circuit {
  // Apply QFT to qubits [startQubit, startQubit + numQubits - 1]
  for (let i = 0; i < numQubits; i++) {
    const currentQubit = startQubit + i;
    
    // Apply Hadamard gate
    circuit.h(currentQubit);
    
    // Apply controlled rotations
    for (let j = i + 1; j < numQubits; j++) {
      const controlQubit = startQubit + j;
      const rotationAngle = Math.PI / Math.pow(2, j - i);
      
      // Controlled rotation Rz gate
      circuit.cp(controlQubit, currentQubit, rotationAngle);
    }
  }
  
  // Reverse qubit order with SWAP gates
  const swapCount = Math.floor(numQubits / 2);
  for (let i = 0; i < swapCount; i++) {
    const qubit1 = startQubit + i;
    const qubit2 = startQubit + numQubits - 1 - i;
    circuit.swap(qubit1, qubit2);
  }
  
  return circuit;
}

/**
 * Apply inverse QFT (QFT†)
 */
export function applyInverseQFT(circuit: Circuit, startQubit: number, numQubits: number): Circuit {
  // Inverse QFT is QFT with reversed operations and negated angles
  
  // First, reverse qubit order
  const swapCount = Math.floor(numQubits / 2);
  for (let i = 0; i < swapCount; i++) {
    const qubit1 = startQubit + i;
    const qubit2 = startQubit + numQubits - 1 - i;
    circuit.swap(qubit1, qubit2);
  }
  
  // Apply inverse operations in reverse order
  for (let i = numQubits - 1; i >= 0; i--) {
    const currentQubit = startQubit + i;
    
    // Apply inverse controlled rotations
    for (let j = numQubits - 1; j > i; j--) {
      const controlQubit = startQubit + j;
      const rotationAngle = -Math.PI / Math.pow(2, j - i);
      
      circuit.cp(controlQubit, currentQubit, rotationAngle);
    }
    
    // Apply Hadamard gate
    circuit.h(currentQubit);
  }
  
  return circuit;
}

/**
 * Create a complete QFT circuit for n qubits
 */
export function createQFTCircuit(numQubits: number): Circuit {
  const circuit = new Circuit(numQubits);
  return applyQFT(circuit, 0, numQubits);
}

/**
 * Encode classical data using QFT
 */
export function qftEncode(data: number[], numQubits?: number): Circuit {
  const n = numQubits || Math.max(4, Math.ceil(Math.log2(data.length)));
  const circuit = new Circuit(n);
  
  // Encode data as phases
  for (let i = 0; i < Math.min(data.length, Math.pow(2, n)); i++) {
    if (data[i] !== 0) {
      // Prepare basis state |i⟩
      const binary = i.toString(2).padStart(n, '0');
      for (let j = 0; j < n; j++) {
        if (binary[n - 1 - j] === '1') {
          circuit.x(j);
        }
      }
      
      // Add phase proportional to data[i]
      const phase = (2 * Math.PI * data[i]) / Math.max(...data);
      circuit.phase(phase, 0); // Apply global phase
      
      // Restore |0⟩
      for (let j = 0; j < n; j++) {
        if (binary[n - 1 - j] === '1') {
          circuit.x(j);
        }
      }
    }
  }
  
  return circuit;
}

/**
 * Demonstrate QFT with various examples
 */
export function demonstrateQFT(): void {
  console.log('=== Quantum Fourier Transform (QFT) ===\n');
  
  // Example 1: 2-qubit QFT
  console.log('1. 2-Qubit QFT on |00⟩:');
  let circuit = createQFTCircuit(2);
  let result = circuit.execute();
  
  console.log('   QFT|00⟩ result (uniform superposition):');
  for (let i = 0; i < 4; i++) {
    const binary = i.toString(2).padStart(2, '0');
    const prob = (result.state.probabilities()[i] * 100).toFixed(1);
    const amplitude = result.state.amplitude(i);
    console.log(`     |${binary}⟩: ${prob}% (amplitude: ${amplitude.toString()})`);
  }
  console.log();
  
  // Example 2: QFT on |01⟩ state
  console.log('2. 2-Qubit QFT on |01⟩:');
  circuit = new Circuit(2);
  circuit.x(1);  // Prepare |01⟩
  applyQFT(circuit, 0, 2);
  result = circuit.execute();
  
  console.log('   QFT|01⟩ result:');
  for (let i = 0; i < 4; i++) {
    const binary = i.toString(2).padStart(2, '0');
    const prob = (result.state.probabilities()[i] * 100).toFixed(1);
    const amplitude = result.state.amplitude(i);
    console.log(`     |${binary}⟩: ${prob}% (amplitude: ${amplitude.toString()})`);
  }
  console.log();
  
  // Example 3: 3-qubit QFT
  console.log('3. 3-Qubit QFT on |000⟩:');
  circuit = createQFTCircuit(3);
  result = circuit.execute();
  
  console.log('   QFT|000⟩ result (uniform superposition over 8 states):');
  for (let i = 0; i < 8; i++) {
    const binary = i.toString(2).padStart(3, '0');
    const prob = (result.state.probabilities()[i] * 100).toFixed(1);
    console.log(`     |${binary}⟩: ${prob}%`);
  }
  console.log();
  
  // Example 4: QFT followed by inverse QFT
  console.log('4. QFT followed by Inverse QFT (identity):');
  circuit = new Circuit(2);
  circuit.x(0);  // Prepare |10⟩
  applyQFT(circuit, 0, 2);
  applyInverseQFT(circuit, 0, 2);
  result = circuit.execute();
  
  console.log('   QFT† ∘ QFT |10⟩ (should return |10⟩):');
  for (let i = 0; i < 4; i++) {
    const binary = i.toString(2).padStart(2, '0');
    const prob = (result.state.probabilities()[i] * 100).toFixed(1);
    const expected = binary === '10' ? ' ← Expected' : '';
    console.log(`     |${binary}⟩: ${prob}%${expected}`);
  }
  console.log();
  
  // Example 5: Circuit depth comparison
  console.log('5. Circuit Complexity Analysis:');
  console.log('   QFT circuit requirements:');
  console.log('   \n   Qubits  H Gates  CR Gates  SWAP Gates  Total Gates');
  console.log('   ------  -------  --------  ----------  -----------');
  
  for (let n = 2; n <= 5; n++) {
    const hGates = n;
    const crGates = n * (n - 1) / 2;  // Controlled rotations
    const swapGates = Math.floor(n / 2);
    const totalGates = hGates + crGates + swapGates * 3; // SWAP = 3 CNOTs
    console.log(`   ${n.toString().padStart(6)}  ${hGates.toString().padStart(7)}  ${crGates.toString().padStart(8)}  ${swapGates.toString().padStart(10)}  ${totalGates.toString().padStart(11)}`);
  }
  console.log('   Time complexity: O(n²) for n qubits');
  console.log();
  
  // Example 6: QFT in quantum algorithms
  console.log('6. Applications of QFT:');
  console.log('   • Shor\'s Algorithm: Period finding');
  console.log('   • Quantum Phase Estimation: Eigenvalue estimation');
  console.log('   • Quantum Counting: Amplitude estimation');
  console.log('   • Hidden Subgroup Problem: Group theory applications');
  console.log('   • Quantum Simulation: Fourier analysis of quantum systems');
  console.log();
  
  // Example 7: QFT vs Classical DFT
  console.log('7. QFT vs Classical DFT Comparison:');
  console.log('   Classical DFT: O(N log N) with FFT, O(N²) naive');
  console.log('   Quantum QFT: O((log N)²) gates for N = 2ⁿ items');
  console.log('   Exponential advantage in gate count!');
  console.log('   Note: Measuring QFT output destroys superposition');
  console.log();
  
  // Circuit visualization
  console.log('8. Circuit Structure Examples:');
  
  const demo2Circuit = createQFTCircuit(2);
  console.log('   2-qubit QFT circuit:');
  console.log(demo2Circuit.toString());
  
  const demo3Circuit = createQFTCircuit(3);
  console.log('   3-qubit QFT circuit:');
  console.log(demo3Circuit.toString());
  
  console.log('\n✓ Quantum Fourier Transform demonstration completed!');
  console.log('Key insights:');
  console.log('• QFT transforms between computational and Fourier bases');
  console.log('• Requires O(n²) gates for n qubits');  
  console.log('• Essential component in quantum algorithms');
  console.log('• Provides exponential advantage in circuit depth');
  console.log('• Inverse QFT exactly reverses the transformation');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateQFT();
  process.exit(0);
}
