// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Converts quantum circuits to the Qiskit format.
 *
 * This module provides functions to export q5m.js circuits into Qiskit-compatible
 * Python code. This enables users to run simulations or execute circuits on
 * IBM Quantum hardware.
 *
 * @packageDocumentation
 */

import type { Circuit } from '../core/Circuit';
import { hasCReg } from '../core/Circuit';

/**
 * Defines the options for exporting a circuit to Qiskit Python code.
 * @category Converters
 */
interface QiskitExportOptions {
  /** If true, includes descriptive comments in the generated Python code. Defaults to `true`. */
  includeComments?: boolean;
  /** If true, includes necessary `from qiskit import ...` statements. Defaults to `true`. */
  includeImports?: boolean;
  /** The variable name for the Qiskit `QuantumCircuit` object. Defaults to `'circuit'`. */
  circuitVariableName?: string;
  /** If true, adds measurement operations for all qubits to the circuit. Defaults to `false`. */
  includeMeasurements?: boolean;
  /** If true, includes boilerplate code to execute the circuit on a simulator. Defaults to `false`. */
  includeBackend?: boolean;
}

/**
 * Converts a q5m.js Circuit to a Qiskit-compatible Python script.
 *
 * This function enables seamless transition from q5m.js development to execution
 * on IBM Quantum hardware or Qiskit simulators. The generated Python code includes
 * all necessary imports, circuit construction, and optional execution boilerplate.
 *
 * @param circuit The quantum circuit to export.
 * @param options Configuration options for the export.
 * @returns A string containing the Python code that can be executed with Qiskit.
 * @category Converters
 *
 *
 *
 */
function exportToQiskit(circuit: Circuit, options: QiskitExportOptions = {}): string {
  const {
    includeComments = true,
    includeImports = true,
    circuitVariableName = 'circuit',
    includeMeasurements = false,
    includeBackend = false,
  } = options;

  const numQubits = circuit.quantumCount();
  let qiskitCode = '';

  // Add imports
  if (includeImports) {
    qiskitCode += `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\n`;
    if (includeBackend) {
      qiskitCode += `from qiskit import Aer, execute\n`;
      qiskitCode += `from qiskit.visualization import plot_histogram\n`;
    }
    qiskitCode += `\n`;
  }

  // Add header comment
  if (includeComments) {
    qiskitCode += `# Q5M.js exported circuit\n`;
    qiskitCode += `# Generated at: ${new Date().toISOString()}\n`;
    qiskitCode += `# Number of targets: ${numQubits}\n\n`;
  }

  // Create quantum register
  qiskitCode += `qreg = QuantumRegister(${numQubits}, 'q')\n`;

  // Get classical registers from circuit
  const cregs = classicalRegisters(circuit);

  // Add classical registers
  for (const [regName, creg] of cregs) {
    qiskitCode += `${regName} = ClassicalRegister(${creg.size}, '${regName}')\n`;
  }

  // Create circuit
  qiskitCode += `${circuitVariableName} = QuantumCircuit(qreg`;
  for (const [regName] of cregs) {
    qiskitCode += `, ${regName}`;
  }
  qiskitCode += `)\n\n`;

  // Add gates
  if (includeComments && circuit.instructionsList().length > 0) {
    qiskitCode += `# Add quantum gates\n`;
  }

  const instructions = circuit.instructionsList();
  for (const instr of instructions) {
    const qiskitGate = gateToQiskit(instr.gate.name, instr.targets);
    if (qiskitGate) {
      qiskitCode += `${circuitVariableName}.${qiskitGate}\n`;
    }
  }

  // Add measurements if requested
  if (includeMeasurements) {
    qiskitCode += `\n# Add measurements\n`;

    if (cregs.size === 0) {
      // Create default classical register
      qiskitCode += `creg = ClassicalRegister(${numQubits}, 'c')\n`;
      qiskitCode += `${circuitVariableName}.add_register(creg)\n`;

      for (let i = 0; i < numQubits; i++) {
        qiskitCode += `${circuitVariableName}.measure(qreg[${i}], creg[${i}])\n`;
      }
    } else {
      // Use existing classical registers
      const [firstRegName] = cregs.keys();
      for (let i = 0; i < numQubits; i++) {
        qiskitCode += `${circuitVariableName}.measure(qreg[${i}], ${firstRegName}[${i}])\n`;
      }
    }
  }

  // Add backend execution code if requested
  if (includeBackend) {
    qiskitCode += `\n# Execute on simulator\n`;
    qiskitCode += `backend = Aer.get_backend('qasm_simulator')\n`;
    qiskitCode += `job = execute(${circuitVariableName}, backend, shots=1000)\n`;
    qiskitCode += `result = job.result()\n`;
    qiskitCode += `counts = result.get_counts(${circuitVariableName})\n`;
    qiskitCode += `print("Measurement results:", counts)\n`;

    if (includeComments) {
      qiskitCode += `\n# To visualize: plot_histogram(counts)\n`;
    }
  }

  // Add circuit drawing suggestion
  if (includeComments) {
    qiskitCode += `\n# Draw circuit: ${circuitVariableName}.draw('mpl')\n`;
  }

  return qiskitCode;
}

/**
 * Converts a q5m.js gate name and qubit indices to a Qiskit method call string.
 * @param gateName The name of the gate.
 * @param qubits The indices of the qubits the gate acts on.
 * @returns A string for the Qiskit method call, or null if not supported.
 * @internal
 */
function gateToQiskit(gateName: string, qubits: number[]): string | null {
  const gate = gateName.toLowerCase();

  // Extract base gate name (remove parameters if present)
  const baseGate = gate.replace(/\([^)]*\)/, '');

  // Map gate names to Qiskit equivalents
  const gateMap: Record<string, string> = {
    hadamard: 'h',
    h: 'h',
    paulix: 'x',
    x: 'x',
    pauliy: 'y',
    y: 'y',
    pauliz: 'z',
    z: 'z',
    sgate: 's',
    s: 's',
    tgate: 't',
    t: 't',
    cnot: 'cx',
    controlledz: 'cz',
    cz: 'cz',
    controlledy: 'cy',
    cy: 'cy',
    swap: 'swap',
    rotationx: 'rx',
    rx: 'rx',
    rotationy: 'ry',
    ry: 'ry',
    rotationz: 'rz',
    rz: 'rz',
    phase: 'p',
    p: 'p',
    controlledphase: 'cp',
    cp: 'cp',
  };

  const qiskitGateName = gateMap[baseGate];
  if (!qiskitGateName) {
    return null;
  }

  // Format qubit arguments
  const qubitArgs = qubits.map((q) => `qreg[${q}]`).join(', ');

  // Handle parameterized gates
  if (['rx', 'ry', 'rz', 'p', 'cp'].includes(qiskitGateName)) {
    // Extract parameter from gate name if it exists
    const paramMatch = gateName.match(/\(([^)]+)\)/);
    if (paramMatch && paramMatch[1]) {
      return `${qiskitGateName}(${paramMatch[1]}, ${qubitArgs})`;
    }
    // Default angle if not specified
    return `${qiskitGateName}(3.14159/2, ${qubitArgs})`;
  }

  return `${qiskitGateName}(${qubitArgs})`;
}

/**
 * Extracts classical register information from a circuit.
 *
 * This function identifies classical registers that have been dynamically added to circuits,
 * typically through testing or converter-specific extensions. It provides a bridge between
 * q5m.js circuits and external quantum frameworks that require explicit classical register
 * declarations for measurement storage.
 *
 * **Implementation Notes:**
 * - Supports circuits with dynamically attached classical register metadata
 * - Uses safe type checking to detect extended circuit objects
 * - Returns empty map for standard circuits without classical register metadata
 * - Designed for compatibility with Qiskit's classical register requirements
 *
 * **Performance Characteristics:**
 * - O(n) time complexity where n is the number of classical registers
 * - Minimal memory overhead for register metadata extraction
 * - Safe fallback behavior for unsupported circuit types
 *
 * @param circuit The q5m.js circuit to analyze for classical register information
 * @returns A map containing classical register metadata with size and name properties
 * @internal
 *
 */
function classicalRegisters(circuit: Circuit): Map<string, { size: number; name: string }> {
  // Check if circuit has classical registers manually added for testing or converter extensions
  if (hasCReg(circuit) && circuit.cregs) {
    const result = new Map<string, { size: number; name: string }>();
    for (const [name, reg] of circuit.cregs.entries()) {
      result.set(name, { size: reg.size, name });
    }
    return result;
  }

  // Standard circuits without classical register metadata
  // Return empty map for compatibility with quantum-only circuits
  return new Map();
}

/**
 * Qiskit export function type.
 */
export type QiskitExporterType = (circuit: Circuit, options?: QiskitExportOptions) => string;

// Type exports
export type { QiskitExportOptions };

// Function exports
export { exportToQiskit, classicalRegisters };
