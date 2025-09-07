// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Quantum Error Correction
 * 
 * Quantum error correction protects quantum information from decoherence
 * and other quantum noise. This example demonstrates basic error correction
 * concepts using the 3-qubit bit-flip code and phase-flip code.
 * 
 * Theory:
 * Classical codes: n bits → k bits of information
 * Quantum codes: n qubits → k qubits of information
 * 
 * Key principles:
 * - No-cloning theorem: cannot simply copy quantum states
 * - Error syndrome measurement without destroying state
 * - Quantum codes protect against both bit-flip and phase-flip errors
 * 
 * Famous quantum codes:
 * - 3-qubit repetition code (bit-flip only)
 * - 3-qubit phase-flip code (phase-flip only)  
 * - 9-qubit Shor code (general errors)
 * - 7-qubit Steane code (CSS code)
 */

import { Circuit } from '../../../src/index.js';

export function demonstrateQuantumErrorCorrection(): void {
  console.log('=== Quantum Error Correction ===\\n');
  
  console.log('1. Error Correction Overview:');
  console.log('   Goal: Protect quantum information from noise');
  console.log('   Challenge: Measurement destroys superposition');
  console.log('   Solution: Syndrome measurement + error correction');
  console.log();
  
  // 3-qubit bit-flip code
  console.log('2. Three-Qubit Bit-Flip Code:');
  console.log('   Encoding: |0⟩ → |000⟩, |1⟩ → |111⟩');
  console.log('   Protects against single bit-flip errors');
  console.log();
  
  // Encoding function
  function encodeBitFlip(circuit: Circuit, dataQubit: number): void {
    // Encode |ψ⟩ = α|0⟩ + β|1⟩ → α|000⟩ + β|111⟩
    circuit.cnot(dataQubit, dataQubit + 1);
    circuit.cnot(dataQubit, dataQubit + 2);
  }
  
  // Error syndrome measurement
  function measureBitFlipSyndrome(circuit: Circuit, dataStart: number, ancillaStart: number): void {
    // Syndrome qubits measure parity
    // Ancilla 0: X₀X₁ (parity of qubits 0,1)
    // Ancilla 1: X₁X₂ (parity of qubits 1,2)  
    circuit.cnot(dataStart, ancillaStart);
    circuit.cnot(dataStart + 1, ancillaStart);
    circuit.cnot(dataStart + 1, ancillaStart + 1);
    circuit.cnot(dataStart + 2, ancillaStart + 1);
  }
  
  // Test bit-flip code
  console.log('   Testing bit-flip code with errors:');
  
  // Test case 1: No error
  let circuit = new Circuit(5); // 3 data + 2 syndrome qubits
  circuit.h(0); // Create |+⟩ state
  encodeBitFlip(circuit, 0);
  measureBitFlipSyndrome(circuit, 0, 3);
  
  let result = circuit.execute();
  console.log('   No error case:');
  console.log(`     Syndrome: ${(result.state.probabilities()[8] > 0.4 ? '00' : 'other')}`);
  
  // Test case 2: Error on qubit 0
  circuit = new Circuit(5);
  circuit.h(0); // Create |+⟩ state  
  encodeBitFlip(circuit, 0);
  circuit.x(0); // Introduce bit-flip error
  measureBitFlipSyndrome(circuit, 0, 3);
  
  result = circuit.execute();
  console.log('   Error on qubit 0: Syndrome should be 10');
  
  // Test case 3: Error on qubit 1  
  circuit = new Circuit(5);
  circuit.h(0);
  encodeBitFlip(circuit, 0);
  circuit.x(1); // Error on middle qubit
  measureBitFlipSyndrome(circuit, 0, 3);
  
  result = circuit.execute();
  console.log('   Error on qubit 1: Syndrome should be 11');
  console.log();
  
  // 3-qubit phase-flip code
  console.log('3. Three-Qubit Phase-Flip Code:');
  console.log('   Encoding: |0⟩ → |+++⟩, |1⟩ → |---⟩');
  console.log('   Protects against single phase-flip errors');
  console.log();
  
  function encodePhaseFlip(circuit: Circuit, dataQubit: number): void {
    // Encode in superposition basis
    circuit.cnot(dataQubit, dataQubit + 1);
    circuit.cnot(dataQubit, dataQubit + 2);
    // Convert to |+++⟩ or |---⟩
    circuit.h(dataQubit);
    circuit.h(dataQubit + 1);
    circuit.h(dataQubit + 2);
  }
  
  function measurePhaseFlipSyndrome(circuit: Circuit, dataStart: number, ancillaStart: number): void {
    // Syndrome measurement in Z basis after H rotations
    circuit.h(dataStart);
    circuit.h(dataStart + 1);
    circuit.h(dataStart + 2);
    
    // Measure Z₀Z₁ and Z₁Z₂ parities
    circuit.cnot(dataStart, ancillaStart);
    circuit.cnot(dataStart + 1, ancillaStart);
    circuit.cnot(dataStart + 1, ancillaStart + 1);
    circuit.cnot(dataStart + 2, ancillaStart + 1);
    
    // Rotate back
    circuit.h(dataStart);
    circuit.h(dataStart + 1);  
    circuit.h(dataStart + 2);
  }
  
  console.log('   Testing phase-flip code:');
  
  // Test phase-flip code
  circuit = new Circuit(5);
  circuit.h(0); // Start with |+⟩
  encodePhaseFlip(circuit, 0);
  circuit.z(1); // Introduce phase error
  measurePhaseFlipSyndrome(circuit, 0, 3);
  
  result = circuit.execute();
  console.log('   Phase error on qubit 1: Syndrome measured');
  console.log();
  
  // 9-qubit Shor code (conceptual)
  console.log('4. Nine-Qubit Shor Code (Conceptual):');
  console.log('   Combines 3-qubit bit-flip and phase-flip codes');
  console.log('   Encoding: |0⟩ → (|000⟩ + |111⟩)⊗3 / 2√2');
  console.log('   Protects against arbitrary single-qubit errors');
  console.log();
  console.log('   Structure:');
  console.log('   • Each logical qubit uses 9 physical qubits');
  console.log('   • 3 blocks of 3 qubits each');
  console.log('   • First level: bit-flip protection within blocks');
  console.log('   • Second level: phase-flip protection between blocks');
  console.log();
  
  // Quantum error correction principles
  console.log('5. Key QEC Principles:');
  console.log('   Syndrome Measurement:');
  console.log('   • Extract error information without measuring data');
  console.log('   • Use ancilla qubits for syndrome detection');
  console.log('   • Syndrome uniquely identifies error location');
  console.log();
  console.log('   Error Correction:');
  console.log('   • Apply corrective operations based on syndrome');
  console.log('   • Pauli corrections: X for bit-flip, Z for phase-flip');
  console.log('   • Must be done before decoherence spreads');
  console.log();
  
  // CSS codes
  console.log('6. CSS (Calderbank-Shor-Steane) Codes:');
  console.log('   Construction from classical linear codes:');
  console.log('   • Use two classical codes C₁ ⊆ C₂');
  console.log('   • C₂ corrects bit-flip errors');
  console.log('   • C₁⊥ corrects phase-flip errors');
  console.log('   • Example: 7-qubit Steane code [[7,1,3]]');
  console.log();
  
  // Steane code demonstration (simplified)
  console.log('7. Steane Code Properties:');
  console.log('   Parameters: [[7,1,3]] - 7 physical, 1 logical, distance 3');
  console.log('   Corrects any single-qubit error');
  console.log('   Based on classical [7,4,3] Hamming code');
  console.log();
  console.log('   Generator matrix (simplified representation):');
  console.log('   G = [1 0 0 1 0 1 1]  ← Encodes logical |0⟩');
  console.log('       [1 0 1 0 1 0 1]  ← X stabilizer');
  console.log('       [1 1 0 0 1 1 0]  ← Z stabilizer');
  console.log();
  
  // Surface codes
  console.log('8. Surface Codes (Topological QEC):');
  console.log('   Most promising for fault-tolerant quantum computing:');
  console.log('   • 2D lattice of qubits with local interactions');
  console.log('   • Threshold theorem: >0.1% physical error rate');
  console.log('   • Scalable to arbitrarily large systems');
  console.log('   • Compatible with planar qubit architectures');
  console.log();
  
  // Error correction threshold
  console.log('9. Threshold Theorem:');
  console.log('   Key result: If physical error rate < threshold,');
  console.log('   logical error rate decreases exponentially with code size');
  console.log();
  console.log('   Typical thresholds:');
  console.log('   • Surface codes: ~0.1-1% depending on noise model');
  console.log('   • Concatenated codes: ~10⁻⁴ for realistic noise');
  console.log('   • Color codes: ~0.1% with advantages for magic states');
  console.log();
  
  // Practical considerations
  console.log('10. Practical Implementation:');
  console.log('    Current challenges:');
  console.log('    • High qubit overhead (100-1000x)');
  console.log('    • Fast, accurate syndrome measurement');
  console.log('    • Real-time classical processing');
  console.log('    • Minimizing measurement errors');
  console.log();
  console.log('    Near-term approaches:');
  console.log('    • Error mitigation instead of correction');  
  console.log('    • Small distance codes for proof-of-principle');
  console.log('    • Hybrid error correction/mitigation');
  console.log();
  
  // Future prospects
  console.log('11. Future of Quantum Error Correction:');
  console.log('    Technical developments:');
  console.log('    • Better physical qubits (longer coherence)');
  console.log('    • Improved fabrication (lower error rates)');
  console.log('    • Efficient classical decoders');
  console.log('    • Novel code constructions');
  console.log();
  console.log('    Applications:');
  console.log('    • Fault-tolerant quantum algorithms');
  console.log('    • Large-scale quantum simulations');
  console.log('    • Cryptographically secure communications');
  console.log('    • Quantum advantage in optimization');
  
  console.log('\\n✓ Quantum error correction demonstration completed!');
  console.log('Key concepts:');
  console.log('• Syndrome measurement protects quantum information');
  console.log('• Multiple error types require different correction strategies'); 
  console.log('• Threshold theorem enables scalable quantum computing');
  console.log('• Essential foundation for fault-tolerant quantum algorithms');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateQuantumErrorCorrection();
  process.exit(0);
}
