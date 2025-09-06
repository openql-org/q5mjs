// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Rotation Gates (Rx, Ry, Rz)
 * 
 * Rotation gates perform arbitrary rotations around the X, Y, and Z axes
 * of the Bloch sphere. They are parameterized gates that generalize
 * the Pauli gates and enable continuous quantum operations.
 * 
 * Theory:
 * - Rx(θ): Rotation by angle θ around X-axis
 * - Ry(θ): Rotation by angle θ around Y-axis  
 * - Rz(θ): Rotation by angle θ around Z-axis
 * 
 * Matrix representations:
 * Rx(θ) = cos(θ/2)I - i*sin(θ/2)X = [[cos(θ/2), -i*sin(θ/2)], [-i*sin(θ/2), cos(θ/2)]]
 * Ry(θ) = cos(θ/2)I - i*sin(θ/2)Y = [[cos(θ/2), -sin(θ/2)], [sin(θ/2), cos(θ/2)]]
 * Rz(θ) = cos(θ/2)I - i*sin(θ/2)Z = [[e^(-iθ/2), 0], [0, e^(iθ/2)]]
 * 
 * Special cases:
 * Rx(π) = X, Ry(π) = Y, Rz(π) = Z
 * Rx(π/2) = √X, Ry(π/2) = √Y, Rz(π/2) = S
 */

import { Circuit } from '../../../src/index.js';

export function demonstrateRotationGates(): void {
  console.log('=== Rotation Gates (Rx, Ry, Rz) ===\n');
  
  // Rx gate - X-axis rotation
  console.log('1. Rx Gate (X-axis Rotation):');
  console.log('   Rotates state vector around X-axis of Bloch sphere');
  
  // π/2 rotation
  let circuit = new Circuit(1);
  circuit.rx(Math.PI / 2, 0);
  let result = circuit.execute();
  let amplitudes = [result.state.amplitude(0), result.state.amplitude(1)];
  
  console.log('   Rx(π/2)|0⟩:');
  console.log(`     Amplitude |0⟩: ${amplitudes[0].toString()}`);
  console.log(`     Amplitude |1⟩: ${amplitudes[1].toString()}`);
  console.log(`     Probabilities: |0⟩: ${(result.state.probabilities()[0] * 100).toFixed(1)}%, |1⟩: ${(result.state.probabilities()[1] * 100).toFixed(1)}%`);
  
  // π rotation (equivalent to X gate)
  circuit = new Circuit(1);
  circuit.rx(Math.PI, 0);
  result = circuit.execute();
  console.log('   Rx(π)|0⟩ (equivalent to X gate):');
  console.log(`     |0⟩: ${(result.state.probabilities()[0] * 100).toFixed(1)}%, |1⟩: ${(result.state.probabilities()[1] * 100).toFixed(1)}%\n`);
  
  // Ry gate - Y-axis rotation
  console.log('2. Ry Gate (Y-axis Rotation):');
  console.log('   Creates real superpositions (no complex phases)');
  
  // π/4 rotation
  circuit = new Circuit(1);
  circuit.ry(Math.PI / 4, 0);
  result = circuit.execute();
  amplitudes = [result.state.amplitude(0), result.state.amplitude(1)];
  
  console.log('   Ry(π/4)|0⟩:');
  console.log(`     Amplitude |0⟩: ${amplitudes[0].toString()}`);
  console.log(`     Amplitude |1⟩: ${amplitudes[1].toString()}`);
  console.log(`     Probabilities: |0⟩: ${(result.state.probabilities()[0] * 100).toFixed(1)}%, |1⟩: ${(result.state.probabilities()[1] * 100).toFixed(1)}%`);
  
  // π/2 rotation (45-degree tilt)
  circuit = new Circuit(1);
  circuit.ry(Math.PI / 2, 0);
  result = circuit.execute();
  console.log('   Ry(π/2)|0⟩ (equal real superposition):');
  console.log(`     |0⟩: ${(result.state.probabilities()[0] * 100).toFixed(1)}%, |1⟩: ${(result.state.probabilities()[1] * 100).toFixed(1)}%\n`);
  
  // Rz gate - Z-axis rotation  
  console.log('3. Rz Gate (Z-axis Rotation):');
  console.log('   Adds relative phase without changing probabilities');
  
  // π/4 rotation
  circuit = new Circuit(1);
  circuit.h(0).rz(Math.PI / 4, 0);  // Apply to superposition to see phase
  result = circuit.execute();
  amplitudes = [result.state.amplitude(0), result.state.amplitude(1)];
  
  console.log('   H then Rz(π/4)|0⟩:');
  console.log(`     Amplitude |0⟩: ${amplitudes[0].toString()}`);
  console.log(`     Amplitude |1⟩: ${amplitudes[1].toString()}`);
  console.log('   Note: |1⟩ amplitude has acquired phase');
  
  // π/2 rotation (equivalent to S gate)
  circuit = new Circuit(1);
  circuit.h(0).rz(Math.PI / 2, 0);
  result = circuit.execute();
  amplitudes = [result.state.amplitude(0), result.state.amplitude(1)];
  console.log('   H then Rz(π/2)|0⟩ (equivalent to H-S):');
  console.log(`     Amplitude |0⟩: ${amplitudes[0].toString()}`);
  console.log(`     Amplitude |1⟩: ${amplitudes[1].toString()}\n`);
  
  // Arbitrary angle demonstrations
  console.log('4. Arbitrary Angle Rotations:');
  console.log('   Demonstrating smooth parameter variation');
  
  const angles = [0, Math.PI/8, Math.PI/4, Math.PI/2, Math.PI];
  const angleNames = ['0', 'π/8', 'π/4', 'π/2', 'π'];
  
  console.log('   Ry rotations on |0⟩:');
  console.log('   Angle    |0⟩ Prob   |1⟩ Prob');
  console.log('   -----    --------   --------');
  
  for (let i = 0; i < angles.length; i++) {
    circuit = new Circuit(1);
    circuit.ry(angles[i], 0);
    result = circuit.execute();
    const prob0 = (result.state.probabilities()[0] * 100).toFixed(1);
    const prob1 = (result.state.probabilities()[1] * 100).toFixed(1);
    console.log(`   ${angleNames[i].padEnd(6)}   ${prob0.padStart(5)}%     ${prob1.padStart(5)}%`);
  }
  console.log();
  
  // Rotation composition
  console.log('5. Rotation Composition:');
  console.log('   Multiple rotations can be combined');
  
  // Rx followed by Ry
  circuit = new Circuit(1);
  circuit.rx(Math.PI / 4, 0).ry(Math.PI / 4, 0);
  result = circuit.execute();
  amplitudes = [result.state.amplitude(0), result.state.amplitude(1)];
  
  console.log('   Rx(π/4) then Ry(π/4)|0⟩:');
  console.log(`     Amplitude |0⟩: ${amplitudes[0].toString()}`);
  console.log(`     Amplitude |1⟩: ${amplitudes[1].toString()}`);
  
  // Universal rotation (Euler angles)
  console.log('   \n   Universal single-qubit rotation U = Rz(γ)Ry(β)Rz(α):');
  circuit = new Circuit(1);
  const alpha = Math.PI / 6;
  const beta = Math.PI / 3;  
  const gamma = Math.PI / 4;
  circuit.rz(alpha, 0).ry(beta, 0).rz(gamma, 0);
  result = circuit.execute();
  amplitudes = [result.state.amplitude(0), result.state.amplitude(1)];
  
  console.log(`   U(α=${(alpha/Math.PI).toFixed(2)}π, β=${(beta/Math.PI).toFixed(2)}π, γ=${(gamma/Math.PI).toFixed(2)}π)|0⟩:`);
  console.log(`     Amplitude |0⟩: ${amplitudes[0].toString()}`);
  console.log(`     Amplitude |1⟩: ${amplitudes[1].toString()}\n`);
  
  // Bloch sphere interpretation
  console.log('6. Bloch Sphere Interpretation:');
  console.log('   Rotation gates correspond to 3D rotations on the Bloch sphere');
  console.log('   • Rx: Rotation around X-axis (longitude lines)');
  console.log('   • Ry: Rotation around Y-axis (latitude changes)'); 
  console.log('   • Rz: Rotation around Z-axis (azimuthal angle)');
  console.log('   • Any single-qubit unitary can be written as Rz(γ)Ry(β)Rz(α)\n');
  
  // Practical applications
  console.log('7. Practical Applications:');
  console.log('   • State preparation: Ry gates for amplitude control');
  console.log('   • Quantum algorithms: Parameterized quantum circuits');
  console.log('   • Quantum optimization: Variational quantum algorithms');
  console.log('   • Pulse sequences: Implementing physical gate operations');
  
  // Circuit examples
  console.log('\n8. Circuit Examples:');
  
  const demoCircuit1 = new Circuit(1);
  demoCircuit1.ry(Math.PI / 4, 0);
  console.log('   Y-rotation (π/4):');
  console.log(demoCircuit1.toString());
  
  const demoCircuit2 = new Circuit(1);
  demoCircuit2.rz(Math.PI / 6, 0).ry(Math.PI / 3, 0).rz(Math.PI / 4, 0);
  console.log('   Universal rotation (Euler decomposition):');
  console.log(demoCircuit2.toString());
  
  console.log('\n✓ Rotation gates demonstration completed!');
  console.log('Key insights:');
  console.log('• Rx, Ry, Rz enable arbitrary single-qubit rotations');
  console.log('• Continuous parameters allow fine-grained control');
  console.log('• Universal gate set: any single-qubit operation possible');
  console.log('• Foundation for parameterized quantum circuits');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateRotationGates();
  process.exit(0);
}
