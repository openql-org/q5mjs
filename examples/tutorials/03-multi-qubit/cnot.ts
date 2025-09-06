// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * CNOT Gate (Controlled-NOT)
 * 
 * The CNOT gate is the most important two-qubit gate in quantum computing.
 * It performs a NOT operation on the target qubit only when the control
 * qubit is in the |1⟩ state.
 * 
 * Theory:
 * CNOT|control,target⟩ = |control⟩ ⊗ |target ⊕ control⟩
 * where ⊕ is XOR (addition modulo 2)
 * 
 * Truth table:
 * |00⟩ → |00⟩
 * |01⟩ → |01⟩  
 * |10⟩ → |11⟩  (control=1, so target flips)
 * |11⟩ → |10⟩  (control=1, so target flips)
 * 
 * Matrix representation (control=0, target=1):
 * CNOT = [[1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0]]
 */

import { Circuit } from '../../../src/index.js';

export function demonstrateCNOT(): void {
  console.log('=== CNOT Gate (Controlled-NOT) ===\n');
  
  // Test all computational basis states
  console.log('1. CNOT Truth Table:');
  console.log('   Testing all computational basis inputs');
  console.log('   \n   Input   →   Output   (Description)');
  console.log('   -----       ------   -----------');
  
  const testCases = [
    { input: '00', control: 0, target: 1, desc: 'Control=0, no flip' },
    { input: '01', control: 0, target: 1, desc: 'Control=0, no flip' },
    { input: '10', control: 0, target: 1, desc: 'Control=1, target flips' },
    { input: '11', control: 0, target: 1, desc: 'Control=1, target flips' }
  ];
  
  for (const test of testCases) {
    const circuit = new Circuit(2);
    
    // Prepare input state
    if (test.input[1] === '1') circuit.x(0);  // Set qubit 0
    if (test.input[0] === '1') circuit.x(1);  // Set qubit 1
    
    // Apply CNOT
    circuit.cnot(test.control, test.target);
    
    // Execute and find output
    const result = circuit.execute();
    const probabilities = result.state.probabilities();
    
    let output = '';
    for (let i = 0; i < 4; i++) {
      if (probabilities[i] > 0.99) {
        output = i.toString(2).padStart(2, '0');
        break;
      }
    }
    
    console.log(`   |${test.input}⟩   →   |${output}⟩   (${test.desc})`);
  }
  console.log();
  
  // CNOT for entanglement creation  
  console.log('2. Creating Bell State with CNOT:');
  console.log('   H(0) followed by CNOT(0,1) creates Bell state');
  
  const bellCircuit = new Circuit(2);
  bellCircuit.h(0).cnot(0, 1);
  const bellState = bellCircuit.execute();
  
  console.log('   |00⟩ → H(0) → CNOT(0,1) → (|00⟩ + |11⟩)/√2');
  console.log('   Result:');
  for (let i = 0; i < 4; i++) {
    const binary = i.toString(2).padStart(2, '0');
    const prob = (bellState.state.probabilities()[i] * 100).toFixed(1);
    const amplitude = bellState.state.amplitude(i);
    if (prob > 0.1) {
      console.log(`     |${binary}⟩: ${prob}% (amplitude: ${amplitude.toString()})`);
    }
  }
  console.log('   This creates maximal entanglement!\n');
  
  // CNOT reversibility
  console.log('3. CNOT Reversibility:');
  console.log('   CNOT is its own inverse: CNOT² = I');
  
  const reversibilityCircuit = new Circuit(2);
  reversibilityCircuit.x(0).x(1);  // Prepare |11⟩
  reversibilityCircuit.cnot(0, 1); // Apply CNOT
  reversibilityCircuit.cnot(0, 1); // Apply CNOT again
  const reversedState = reversibilityCircuit.execute();
  
  console.log('   |11⟩ → CNOT → CNOT → |11⟩ (back to original)');
  console.log('   Final state probabilities:');
  for (let i = 0; i < 4; i++) {
    const binary = i.toString(2).padStart(2, '0');
    const prob = (reversedState.state.probabilities()[i] * 100).toFixed(1);
    if (prob > 0.1) {
      console.log(`     |${binary}⟩: ${prob}%`);
    }
  }
  console.log();
  
  // CNOT with superposition
  console.log('4. CNOT with Superposition:');
  console.log('   CNOT on superposition creates entangled states');
  
  // Control in superposition
  const circuit1 = new Circuit(2);
  circuit1.h(0).cnot(0, 1);  // H on control
  const state1 = circuit1.execute();
  
  console.log('   Control in superposition: H(0)|00⟩ → CNOT(0,1)');
  console.log('   (|0⟩|0⟩ + |1⟩|0⟩)/√2 → (|0⟩|0⟩ + |1⟩|1⟩)/√2');
  
  // Target in superposition  
  const circuit2 = new Circuit(2);
  circuit2.h(1).cnot(0, 1);  // H on target
  const state2 = circuit2.execute();
  
  console.log('   \n   Target in superposition: H(1)|00⟩ → CNOT(0,1)');
  console.log('   (|0⟩|0⟩ + |0⟩|1⟩)/√2 → (|0⟩|0⟩ + |0⟩|1⟩)/√2 (no change)');
  
  // Both in superposition
  const circuit3 = new Circuit(2);
  circuit3.h(0).h(1).cnot(0, 1);
  const state3 = circuit3.execute();
  
  console.log('   \n   Both in superposition: H(0)H(1)|00⟩ → CNOT(0,1)');
  console.log('   Result:');
  for (let i = 0; i < 4; i++) {
    const binary = i.toString(2).padStart(2, '0');
    const prob = (state3.state.probabilities()[i] * 100).toFixed(1);
    if (prob > 0.1) {
      console.log(`     |${binary}⟩: ${prob}%`);
    }
  }
  console.log();
  
  // CNOT properties
  console.log('5. CNOT Properties:');
  console.log('   • Universal: CNOT + single-qubit gates = universal gate set');
  console.log('   • Reversible: CNOT is its own inverse');
  console.log('   • Entangling: Can create entanglement from product states');
  console.log('   • Basis-independent: Works in any basis');
  console.log('   • Conservation: Preserves parity of control + target');
  console.log();
  
  // Parity conservation
  console.log('6. Parity Conservation:');
  console.log('   CNOT preserves (control ⊕ target) mod 2');
  
  const parityTests = ['00', '01', '10', '11'];
  console.log('   \n   Input  Parity  Output  Parity  Conserved?');
  console.log('   -----  ------  ------  ------  ----------');
  
  for (const input of parityTests) {
    const circuit = new Circuit(2);
    
    // Prepare input
    if (input[1] === '1') circuit.x(0);
    if (input[0] === '1') circuit.x(1);
    
    const inputParity = (parseInt(input[0]) + parseInt(input[1])) % 2;
    
    // Apply CNOT
    circuit.cnot(0, 1);
    const result = circuit.execute();
    
    // Find output
    let output = '';
    for (let i = 0; i < 4; i++) {
      if (result.state.probabilities()[i] > 0.99) {
        output = i.toString(2).padStart(2, '0');
        break;
      }
    }
    
    const outputParity = (parseInt(output[1]) + parseInt(output[0])) % 2;
    const conserved = inputParity === outputParity ? 'Yes' : 'No';
    
    console.log(`   |${input}⟩  ${inputParity.toString().padStart(6)}  |${output}⟩  ${outputParity.toString().padStart(6)}  ${conserved.padStart(10)}`);
  }
  console.log();
  
  // Circuit diagrams
  console.log('7. Circuit Examples:');
  
  const simpleCircuit = new Circuit(2);
  simpleCircuit.cnot(0, 1);
  console.log('   Simple CNOT:');
  console.log(simpleCircuit.toString());
  
  const bellCircuitDemo = new Circuit(2);
  bellCircuitDemo.h(0).cnot(0, 1);
  console.log('   Bell state preparation:');
  console.log(bellCircuitDemo.toString());
  
  console.log('\n✓ CNOT gate demonstration completed!');
  console.log('Key takeaways:');
  console.log('• CNOT flips target only when control is |1⟩');
  console.log('• Essential for creating entanglement');
  console.log('• Self-inverse and preserves parity');
  console.log('• Universal for quantum computation with single-qubit gates');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateCNOT();
  process.exit(0);
}
