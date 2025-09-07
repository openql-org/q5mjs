// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/**
 * Export Formats Showcase
 * 
 * This example demonstrates how to export quantum circuits
 * created with q5m.js to various external formats including
 * Qiskit (Python), Cirq (Python), and OpenQASM.
 * 
 * This is useful for:
 * - Running circuits on real quantum hardware
 * - Collaborating with teams using different frameworks
 * - Validating circuit implementations across platforms
 * - Educational purposes and comparison studies
 */

import { Circuit } from '../../src/index.js';
import { exportToQiskit, exportToCirq, exportToOpenQASM } from '../../src/index.js';

export function demonstrateExports(): void {
  console.log('=== Quantum Circuit Export Formats ===\n');
  
  // Create a sample quantum circuit
  console.log('Creating sample quantum circuit:');
  const circuit = new Circuit(3);
  
  // Build a interesting circuit with various gates
  circuit.h(0)                    // Superposition on qubit 0
    .cnot(0, 1)                   // Entangle qubits 0 and 1
    .rz(Math.PI / 4, 2)          // Phase rotation on qubit 2
    .cz(1, 2)                     // Controlled-Z between qubits 1 and 2
    .ry(Math.PI / 3, 0)          // Y-rotation on qubit 0
    .swap(0, 2)                   // Swap qubits 0 and 2
    .measure([0, 1, 2]);          // Measure all qubits
  
  console.log('Circuit operations:');
  console.log('  1. H gate on qubit 0');
  console.log('  2. CNOT from qubit 0 to 1');
  console.log('  3. RZ(π/4) on qubit 2');
  console.log('  4. CZ from qubit 1 to 2');
  console.log('  5. RY(π/3) on qubit 0');
  console.log('  6. SWAP qubits 0 and 2');
  console.log('  7. Measure all qubits\\n');
  
  // Show the circuit diagram
  console.log('q5m.js Circuit Diagram:');
  console.log(circuit.toString());
  console.log();
  
  // Export to Qiskit
  console.log('1. QISKIT EXPORT:');
  console.log('='.repeat(60));
  try {
    const qiskitCode = exportToQiskit(circuit, {
      circuitName: 'sample_circuit',
      includeImports: true,
      includeExecution: true
    });
    console.log(qiskitCode);
  } catch (error) {
    console.log('Qiskit export not available in this version.');
    console.log('Expected output would be Python code like:');
    console.log(`
from qiskit import QuantumCircuit, ClassicalRegister, execute, Aer

# Create quantum circuit
qc = QuantumCircuit(3, 3)

# Apply gates
qc.h(0)
qc.cx(0, 1)
qc.rz(math.pi/4, 2)
qc.cz(1, 2)
qc.ry(math.pi/3, 0)
qc.swap(0, 2)

# Measure
qc.measure_all()

# Execute
backend = Aer.get_backend('qasm_simulator')
job = execute(qc, backend, shots=1000)
result = job.result()
counts = result.get_counts()
print(counts)
    `);
  }
  
  console.log();
  
  // Export to Cirq
  console.log('2. CIRQ EXPORT:');
  console.log('='.repeat(60));
  try {
    const cirqCode = exportToCirq(circuit, {
      circuitName: 'sample_circuit',
      includeImports: true
    });
    console.log(cirqCode);
  } catch (error) {
    console.log('Cirq export not available in this version.');
    console.log('Expected output would be Python code like:');
    console.log(`
import cirq
import numpy as np

# Create qubits
qubits = cirq.LineQubit.range(3)

# Create circuit
circuit = cirq.Circuit()

# Apply gates
circuit.append(cirq.H(qubits[0]))
circuit.append(cirq.CNOT(qubits[0], qubits[1]))
circuit.append(cirq.rz(np.pi/4)(qubits[2]))
circuit.append(cirq.CZ(qubits[1], qubits[2]))
circuit.append(cirq.ry(np.pi/3)(qubits[0]))
circuit.append(cirq.SWAP(qubits[0], qubits[2]))

# Add measurements
circuit.append(cirq.measure(*qubits, key='result'))

# Simulate
simulator = cirq.Simulator()
result = simulator.run(circuit, repetitions=1000)
print(result.histogram(key='result'))
    `);
  }
  
  console.log();
  
  // Export to OpenQASM
  console.log('3. OPENQASM EXPORT:');
  console.log('='.repeat(60));
  try {
    const qasmCode = exportToOpenQASM(circuit);
    console.log(qasmCode);
  } catch (error) {
    console.log('OpenQASM export not available in this version.');
    console.log('Expected output would be QASM code like:');
    console.log(`
OPENQASM 2.0;
include "qelib1.inc";

qreg q[3];
creg c[3];

h q[0];
cx q[0], q[1];
rz(pi/4) q[2];
cz q[1], q[2];
ry(pi/3) q[0];
swap q[0], q[2];
measure q[0] -> c[0];
measure q[1] -> c[1];
measure q[2] -> c[2];
    `);
  }
  
  // Usage recommendations
  console.log();
  console.log('USAGE RECOMMENDATIONS:');
  console.log('='.repeat(60));
  console.log('• Qiskit: Best for IBM Quantum hardware and simulators');
  console.log('• Cirq: Optimized for Google Quantum AI hardware');
  console.log('• OpenQASM: Universal format supported by many platforms');
  console.log('• Choose format based on your target execution platform');
  
  console.log();
  console.log('WORKFLOW EXAMPLE:');
  console.log('='.repeat(60));
  console.log('1. Develop and test circuit in q5m.js');
  console.log('2. Export to target format (Qiskit/Cirq/QASM)');
  console.log('3. Run on quantum hardware or cloud simulators');
  console.log('4. Analyze results and iterate');
  
  console.log('\\n✓ Successfully demonstrated export formats!');
  console.log('This enables q5m.js integration with the broader quantum ecosystem.');
}

// Helper function for custom export options
export function customExportExample(): void {
  console.log('\\n=== Custom Export Options ===\\n');
  
  const circuit = new Circuit(2);
  circuit.h(0).cnot(0, 1);
  
  // Example with different export options
  console.log('Different export configurations:');
  
  try {
    // Qiskit with different options
    const basicQiskit = exportToQiskit(circuit);
    const fullQiskit = exportToQiskit(circuit, {
      circuitName: 'bell_state_circuit',
      includeImports: true,
      includeExecution: false
    });
    
    console.log('• Basic Qiskit export vs Full Qiskit export');
    console.log('• Custom circuit naming and selective imports');
    
    // OpenQASM with version selection
    const qasm2 = exportToOpenQASM(circuit, '2.0');
    const qasm3 = exportToOpenQASM(circuit, '3.0');
    
    console.log('• OpenQASM 2.0 vs 3.0 format differences');
    
  } catch (error) {
    console.log('Export functions will be implemented in full version.');
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateExports();
  customExportExample();
  process.exit(0);
}
