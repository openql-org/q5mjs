// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Variational Quantum Eigensolver (VQE)
 * 
 * VQE is a hybrid quantum-classical algorithm for finding the ground state
 * energy of molecular systems. It uses a parameterized quantum circuit
 * (ansatz) and classical optimization to minimize the expectation value
 * of a Hamiltonian.
 * 
 * Theory:
 * Given Hamiltonian H, find ground state |ψ₀⟩ such that:
 * E₀ = ⟨ψ₀|H|ψ₀⟩ = min_|ψ⟩ ⟨ψ|H|ψ⟩
 * 
 * VQE uses parameterized state |ψ(θ)⟩ and optimizes:
 * θ* = argmin_θ ⟨ψ(θ)|H|ψ(θ)⟩
 * 
 * Applications:
 * - Quantum chemistry (molecular ground states)
 * - Materials science (electronic properties)  
 * - Optimization problems (QAOA)
 * - Quantum machine learning
 */

import { Circuit } from '../../../src/index.js';

export function demonstrateVQE(): void {
  console.log('=== Variational Quantum Eigensolver (VQE) ===\\n');
  
  console.log('1. VQE Algorithm Overview:');
  console.log('   Goal: Find ground state energy E₀ = min ⟨ψ|H|ψ⟩');
  console.log('   Method: Hybrid quantum-classical optimization');
  console.log('   Quantum: Prepare |ψ(θ)⟩ and measure ⟨H⟩');
  console.log('   Classical: Optimize parameters θ');
  console.log();
  
  // Simple example: H₂ molecule in minimal basis
  console.log('2. Example: H₂ Molecule Ground State');
  console.log('   Hamiltonian: H = -1.0523 I - 0.3979 Z₀ - 0.3979 Z₁');
  console.log('                    - 0.0113 Z₀Z₁ + 0.1809 X₀X₁');
  console.log('   Exact ground state energy: E₀ = -1.8573 Ha');
  console.log();
  
  // Define Hamiltonian coefficients for H₂
  const hamiltonianTerms = [
    { coeff: -1.0523, ops: [] },          // Identity term
    { coeff: -0.3979, ops: ['Z', 0] },    // Z₀ 
    { coeff: -0.3979, ops: ['Z', 1] },    // Z₁
    { coeff: -0.0113, ops: ['Z', 0, 'Z', 1] }, // Z₀Z₁
    { coeff: 0.1809,  ops: ['X', 0, 'X', 1] }  // X₀X₁
  ];
  
  // Hardware-efficient ansatz
  function createVQEAnsatz(theta: number[]): Circuit {
    const circuit = new Circuit(2);
    
    // Layer 1: Single-qubit rotations
    circuit.ry(theta[0], 0);
    circuit.ry(theta[1], 1);
    
    // Entangling layer
    circuit.cnot(0, 1);
    
    // Layer 2: Single-qubit rotations  
    circuit.ry(theta[2], 0);
    circuit.ry(theta[3], 1);
    
    return circuit;
  }
  
  // Measure expectation value ⟨ψ(θ)|H|ψ(θ)⟩
  function measureHamiltonianExpectation(theta: number[]): number {
    let expectation = 0;
    
    // For each term in the Hamiltonian
    for (const term of hamiltonianTerms) {
      const circuit = createVQEAnsatz(theta);
      
      // Apply measurement basis rotations
      for (let i = 0; i < term.ops.length; i += 2) {
        const op = term.ops[i];
        const qubit = term.ops[i + 1] as number;
        
        if (op === 'X') {
          circuit.h(qubit); // Rotate to X basis
        } else if (op === 'Y') {
          circuit.ry(-Math.PI/2, qubit); // Rotate to Y basis
        }
        // Z basis requires no rotation
      }
      
      const result = circuit.execute();
      const probs = result.state.probabilities();
      
      // Calculate expectation for this term
      let termExpectation = 0;
      
      if (term.ops.length === 0) {
        // Identity term
        termExpectation = 1;
      } else if (term.ops.length === 2) {
        // Single Pauli term (e.g., Z₀)
        termExpectation = probs[0] + probs[1] - probs[2] - probs[3];
        if (term.ops[0] === 'Z' && term.ops[1] === 1) {
          termExpectation = probs[0] - probs[1] + probs[2] - probs[3];
        }
      } else if (term.ops.length === 4) {
        // Two-Pauli terms (e.g., Z₀Z₁, X₀X₁)
        if (term.ops[0] === 'Z' && term.ops[2] === 'Z') {
          // Z₀Z₁: +1 for |00⟩,|11⟩ and -1 for |01⟩,|10⟩
          termExpectation = probs[0] - probs[1] - probs[2] + probs[3];
        } else if (term.ops[0] === 'X' && term.ops[2] === 'X') {
          // X₀X₁: measure in X basis
          // Simplified calculation
          termExpectation = probs[0] - probs[1] - probs[2] + probs[3];
        }
      }
      
      expectation += term.coeff * termExpectation;
    }
    
    return expectation;
  }
  
  // Simple classical optimizer (gradient descent approximation)
  function optimizeParameters(initialTheta: number[], steps: number = 10): number[] {
    let theta = [...initialTheta];
    let bestTheta = [...theta];
    let bestEnergy = measureHamiltonianExpectation(theta);
    
    console.log('   VQE Optimization Progress:');
    console.log(`   Step  0: θ = [${theta.map(x => x.toFixed(3)).join(', ')}], E = ${bestEnergy.toFixed(4)}`);
    
    const learningRate = 0.1;
    const epsilon = 0.01;
    
    for (let step = 1; step <= steps; step++) {
      // Simple finite difference gradient approximation
      for (let i = 0; i < theta.length; i++) {
        const thetaPlus = [...theta];
        const thetaMinus = [...theta];
        
        thetaPlus[i] += epsilon;
        thetaMinus[i] -= epsilon;
        
        const energyPlus = measureHamiltonianExpectation(thetaPlus);
        const energyMinus = measureHamiltonianExpectation(thetaMinus);
        
        const gradient = (energyPlus - energyMinus) / (2 * epsilon);
        theta[i] -= learningRate * gradient;
      }
      
      const energy = measureHamiltonianExpectation(theta);
      
      if (energy < bestEnergy) {
        bestEnergy = energy;
        bestTheta = [...theta];
      }
      
      if (step <= 5 || step % 2 === 0) {
        console.log(`   Step ${step.toString().padStart(2)}: θ = [${theta.map(x => x.toFixed(3)).join(', ')}], E = ${energy.toFixed(4)}`);
      }
    }
    
    console.log(`   Best energy found: E = ${bestEnergy.toFixed(4)} Ha`);
    console.log(`   Exact ground state: E₀ = -1.8573 Ha`);
    console.log(`   Error: ${Math.abs(bestEnergy - (-1.8573)).toFixed(4)} Ha`);
    console.log();
    
    return bestTheta;
  }
  
  // Run VQE optimization
  console.log('3. VQE Optimization:');
  const initialTheta = [0.1, 0.1, 0.1, 0.1]; // Initial parameters
  const optimalTheta = optimizeParameters(initialTheta, 10);
  
  // Analyze the optimal state
  console.log('4. Analysis of Optimal State:');
  const optimalCircuit = createVQEAnsatz(optimalTheta);
  const optimalState = optimalCircuit.execute();
  
  console.log('   Optimal circuit:');
  console.log(optimalCircuit.toString());
  
  console.log('   Optimal state amplitudes:');
  const probs = optimalState.state.probabilities();
  ['00', '01', '10', '11'].forEach((basis, i) => {
    const amp = optimalState.state.amplitude(i);
    console.log(`     |${basis}⟩: ${(probs[i] * 100).toFixed(1)}% (${amp.toString()})`);
  });
  console.log();
  
  // Different ansatz comparison
  console.log('5. Alternative Ansatz:');
  console.log('   Comparing hardware-efficient vs UCCSD-inspired ansatz');
  
  function createUCCSDAnsatz(theta: number[]): Circuit {
    const circuit = new Circuit(2);
    
    // UCCSD-inspired ansatz
    circuit.ry(Math.PI/2, 0).ry(Math.PI/2, 1); // Initialize in |++⟩
    circuit.cnot(0, 1);
    circuit.rz(theta[0], 1);  // Single excitation
    circuit.cnot(0, 1);
    circuit.ry(theta[1], 0).ry(theta[2], 1); // Additional rotations
    
    return circuit;
  }
  
  const uccsdEnergy = measureHamiltonianExpectation([0.5, 0.2, 0.3]);
  console.log(`   UCCSD-inspired energy: ${uccsdEnergy.toFixed(4)} Ha`);
  console.log();
  
  // VQE applications
  console.log('6. VQE Applications:');
  console.log('   Quantum Chemistry:');
  console.log('   • Molecular ground state energies');
  console.log('   • Reaction pathway optimization');
  console.log('   • Catalyst design');
  console.log();
  console.log('   Materials Science:');
  console.log('   • Electronic band structure');
  console.log('   • Magnetic properties');
  console.log('   • Superconductivity mechanisms');
  console.log();
  console.log('   Optimization:');
  console.log('   • Quantum Approximate Optimization (QAOA)');
  console.log('   • Portfolio optimization');
  console.log('   • Traffic flow optimization');
  console.log();
  
  // Challenges and improvements
  console.log('7. VQE Challenges and Solutions:');
  console.log('   Challenges:');
  console.log('   • Barren plateaus in optimization landscape');
  console.log('   • Shot noise in quantum measurements');
  console.log('   • Classical optimization complexity');
  console.log('   • Ansatz expressibility limitations');
  console.log();
  console.log('   Solutions:');
  console.log('   • Adaptive ansatz construction');
  console.log('   • Error mitigation techniques');
  console.log('   • Advanced classical optimizers');
  console.log('   • Quantum natural gradient methods');
  console.log();
  
  // Near-term prospects
  console.log('8. Near-term Quantum Advantage:');
  console.log('   Current capabilities:');
  console.log('   • Small molecules (H₂, LiH, H₂O)');
  console.log('   • 10-50 qubits on NISQ devices');
  console.log('   • Proof-of-principle demonstrations');
  console.log();
  console.log('   Future prospects:');
  console.log('   • Pharmaceutically relevant molecules');
  console.log('   • Industrial catalyst optimization');
  console.log('   • Materials discovery acceleration');
  
  console.log('\\n✓ VQE demonstration completed!');
  console.log('Key insights:');
  console.log('• Hybrid quantum-classical approach for optimization');
  console.log('• Promising for near-term quantum advantage');
  console.log('• Foundation for quantum chemistry and materials science');
  console.log('• Demonstrates practical quantum algorithm design');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateVQE();
  process.exit(0);
}
