// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Converts quantum circuits to the OpenQASM format.
 *
 * This module provides functions to export q5m.js circuits into OpenQASM
 * (Quantum Assembly Language), a widely used intermediate representation for
 * quantum instructions. It supports both OpenQASM 2.0 and an experimental
 * version of OpenQASM 3.0.
 *
 * @packageDocumentation
 */

import type { Circuit } from '../core/Circuit';
import { hasCReg } from '../core/Circuit';

/**
 * Defines the options for exporting a circuit to OpenQASM format.
 * @category Converters
 */
interface OpenQASMExportOptions {
  /** If true, includes descriptive comments in the generated QASM code. Defaults to `true`. */
  includeComments?: boolean;
  /** The version of the OpenQASM standard to use. Defaults to `'2.0'`. */
  version?: '2.0' | '3.0';
  /** If true, includes measurement operations for all qubits at the end of the circuit. Defaults to `false`. */
  includeMeasurements?: boolean;
}

/**
 * Converts a q5m.js circuit to an OpenQASM 2.0 string.
 *
 * @param circuit The quantum circuit to export.
 * @param options Configuration options for the export.
 * @returns A string containing the OpenQASM 2.0 representation of the circuit.
 * @category Converters
 *
 */
function exportToOpenQASM(circuit: Circuit, options: OpenQASMExportOptions = {}): string {
  const { includeComments = true, version = '2.0', includeMeasurements = false } = options;

  // Delegate to OpenQASM 3.0 function if version is 3.0
  if (version === '3.0') {
    return exportToOpenQASM3(circuit, { includeComments, includeMeasurements });
  }

  const numQubits = circuit.quantumCount();

  let qasmCode = `OPENQASM ${version};\n`;
  qasmCode += 'include "qelib1.inc";\n\n';

  if (includeComments) {
    qasmCode += '// Q5M.js exported circuit\n';
    qasmCode += `// Generated at: ${new Date().toISOString()}\n`;
    qasmCode += `// Number of targets: ${numQubits}\n\n`;
  }

  // Create quantum register
  qasmCode += `qreg q[${numQubits}];\n`;

  // Extract classical registers from circuit using converter support
  // Modern OpenQASM converters support dynamic classical register detection
  const cregs = extractClassicalRegisters(circuit);

  if (cregs.size > 0) {
    // Add existing classical registers
    for (const [regName, creg] of cregs) {
      qasmCode += `creg ${regName}[${creg.size}];\n`;
    }
  } else {
    // Add default classical register
    qasmCode += `creg c[${numQubits}];\n`;
  }

  qasmCode += '\n';

  // Add gates and collect measurement information
  const instructions = circuit.instructionsList();
  const measurementQubits = new Set<number>();
  const measurementBasisRotations: string[] = [];

  for (const instr of instructions) {
    // Handle measurement gates separately
    if (instr.gate.name === 'Mz' || instr.gate.name === 'Mx' || instr.gate.name === 'My') {
      const qubit = instr.targets[0]!;
      measurementQubits.add(qubit);

      // Add basis rotation gates for non-Z measurements
      if (instr.gate.name === 'Mx') {
        // X-basis measurement requires Hadamard rotation
        measurementBasisRotations.push(`h q[${qubit}]`);
      } else if (instr.gate.name === 'My') {
        // Y-basis measurement requires S†H rotation (or equivalently RY(-π/2))
        measurementBasisRotations.push(`sdg q[${qubit}]`);
        measurementBasisRotations.push(`h q[${qubit}]`);
      }
      // Z-basis (Mz) requires no rotation

      continue;
    }

    const qasmGate = gateToOpenQASM(instr.gate.name, instr.targets);
    qasmCode += `${qasmGate};\n`;
  }

  // Add basis rotation gates for measurements
  if (measurementBasisRotations.length > 0) {
    qasmCode += '\n// Measurement basis rotations\n';
    for (const rotation of measurementBasisRotations) {
      qasmCode += `${rotation};\n`;
    }
  }

  // Add measurements
  const shouldAddMeasurements = includeMeasurements || measurementQubits.size > 0;
  if (shouldAddMeasurements) {
    qasmCode += '\n// Measurements\n';

    const cregName = cregs.size > 0 ? (cregs.keys().next().value as string) : 'c';

    if (measurementQubits.size > 0) {
      // Export only the qubits that have explicit measurement gates
      for (const qubit of measurementQubits) {
        qasmCode += `measure q[${qubit}] -> ${cregName}[${qubit}];\n`;
      }
    } else {
      // Fall back to measuring all qubits if no individual measurements
      for (let i = 0; i < numQubits; i++) {
        qasmCode += `measure q[${i}] -> ${cregName}[${i}];\n`;
      }
    }
  }

  return qasmCode;
}

/**
 * Converts a q5m.js gate name and qubit indices to an OpenQASM 2.0 instruction string.
 * @param gateName The name of the gate.
 * @param qubits The indices of the qubits the gate acts on.
 * @returns A string for the OpenQASM instruction, or null if not supported.
 * @internal
 */
/**
 * Helper function to get default parameterized gate string - extracted for testability
 * @internal
 */
function getDefaultParameterizedGate(qasmGateName: string, qubitArgs: string): string | null {
  if (['rx', 'ry', 'rz', 'p', 'cp'].includes(qasmGateName)) {
    return `${qasmGateName}(pi/2) ${qubitArgs}`;
  }
  return null;
}

function gateToOpenQASM(gateName: string, qubits: number[]): string | null {
  const gate = gateName.toLowerCase();

  // Map to QASM gate names
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

  // Check for parameterized gates by removing parameters first
  const baseGate = gate.split('(')[0];
  const qasmGateName = gateMap[gate] || (baseGate ? gateMap[baseGate] : undefined);
  if (!qasmGateName) {
    return null;
  }

  // Format qubit arguments
  const qubitArgs = qubits.map((q) => `q[${q}]`).join(', ');

  // Handle parameterized gates
  if (
    gate.includes('rotation') ||
    gate.includes('phase') ||
    ['rx', 'ry', 'rz', 'p', 'cp'].includes(qasmGateName)
  ) {
    const paramMatch = gateName.match(/\(([^)]+)\)/);
    if (paramMatch && paramMatch[1]) {
      return `${qasmGateName}(${paramMatch[1]}) ${qubitArgs}`;
    }
    // Default angle if not specified - now uses extracted function for testability
    return getDefaultParameterizedGate(qasmGateName, qubitArgs);
  }

  return `${qasmGateName} ${qubitArgs}`;
}

/**
 * Converts a q5m.js circuit to an OpenQASM 3.0 string (experimental).
 *
 * @param circuit The quantum circuit to export.
 * @param options Configuration options for the export (version is ignored).
 * @returns A string containing the OpenQASM 3.0 representation of the circuit.
 * @category Converters
 */
function exportToOpenQASM3(
  circuit: Circuit,
  options: Omit<OpenQASMExportOptions, 'version'> = {},
): string {
  const { includeComments = true, includeMeasurements = false } = options;
  const numQubits = circuit.quantumCount();

  let qasmCode = 'OPENQASM 3.0;\n';
  qasmCode += 'include "stdgates.inc";\n\n';

  if (includeComments) {
    qasmCode += '// Q5M.js exported circuit\n';
    qasmCode += `// Generated at: ${new Date().toISOString()}\n\n`;
  }

  // Create qubit array
  qasmCode += `qubit[${numQubits}] q;\n`;

  // Extract classical registers from circuit using converter support
  // OpenQASM 3.0 provides enhanced support for bit arrays and classical registers
  const cregs = extractClassicalRegisters(circuit);

  if (cregs.size > 0) {
    for (const [regName, creg] of cregs) {
      qasmCode += `bit[${creg.size}] ${regName};\n`;
    }
  } else {
    qasmCode += `bit[${numQubits}] c;\n`;
  }

  qasmCode += '\n';

  // Add gates
  const instructions = circuit.instructionsList();
  for (const instr of instructions) {
    const qasmGate = gateToOpenQASM3(instr.gate.name, instr.targets);
    if (qasmGate) {
      qasmCode += `${qasmGate};\n`;
    }
  }

  // Add measurements if requested
  if (includeMeasurements) {
    qasmCode += '\n// Measurements\n';

    const cregName = cregs.size > 0 ? (cregs.keys().next().value as string) : 'c';
    for (let i = 0; i < numQubits; i++) {
      qasmCode += `${cregName}[${i}] = measure q[${i}];\n`;
    }
  }

  return qasmCode;
}

/**
 * Converts a q5m.js gate name and qubit indices to an OpenQASM 3.0 instruction string.
 * @param gateName The name of the gate.
 * @param qubits The indices of the qubits the gate acts on.
 * @returns A string for the OpenQASM 3.0 instruction, or null if not supported.
 * @internal
 */
function gateToOpenQASM3(gateName: string, qubits: number[]): string | null {
  // Similar to OpenQASM 2.0 but with slight syntax differences
  const gate = gateName.toLowerCase();

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

  // Check for parameterized gates by removing parameters first
  const baseGate = gate.split('(')[0];
  const qasmGateName = gateMap[gate] || (baseGate ? gateMap[baseGate] : undefined);
  if (!qasmGateName) {
    return null;
  }

  // Format qubit arguments
  const qubitArgs = qubits.map((q) => `q[${q}]`).join(', ');

  // Handle parameterized gates
  if (
    gate.includes('rotation') ||
    gate.includes('phase') ||
    ['rx', 'ry', 'rz', 'p', 'cp'].includes(qasmGateName)
  ) {
    const paramMatch = gateName.match(/\(([^)]+)\)/);
    if (paramMatch && paramMatch[1]) {
      return `${qasmGateName}(${paramMatch[1]}) ${qubitArgs}`;
    }
    // Default angle for parameterized gates
    return `${qasmGateName}(pi/2) ${qubitArgs}`;
  }

  return `${qasmGateName} ${qubitArgs}`;
}

/**
 * Extracts classical register information from a quantum circuit.
 *
 * This utility function provides a centralized method for detecting and extracting
 * classical register metadata from q5m.js circuits. It supports both statically
 * defined classical registers and dynamically attached register information,
 * enabling seamless interoperability with OpenQASM's classical bit requirements.
 *
 * **Implementation Strategy:**
 * - Detects circuits with converter-specific classical register extensions
 * - Uses safe type checking to avoid runtime errors on standard circuits
 * - Provides fallback behavior for circuits without classical register metadata
 * - Optimized for both OpenQASM 2.0 and 3.0 format requirements
 *
 * **Performance Characteristics:**
 * - O(n) time complexity where n is the number of classical registers
 * - Minimal memory allocation for register metadata processing
 * - Safe fallback with zero overhead for standard quantum-only circuits
 *
 * @param circuit The q5m.js circuit to analyze for classical register information
 * @returns A map containing classical register metadata with size and name properties
 * @internal
 *
 */
function extractClassicalRegisters(circuit: Circuit): Map<string, { size: number; name: string }> {
  const result = new Map<string, { size: number; name: string }>();

  // Check if circuit has classical registers manually added for converter compatibility
  if (hasCReg(circuit) && circuit.cregs) {
    for (const [name, reg] of circuit.cregs.entries()) {
      result.set(name, { size: reg.size, name });
    }
  }

  return result;
}

// Exports

/**
 * OpenQASM export function type.
 */
export type OpenQASMExporterType = (circuit: Circuit, options?: OpenQASMExportOptions) => string;

// Type exports
export type { OpenQASMExportOptions };

// Function exports
export { exportToOpenQASM, getDefaultParameterizedGate, gateToOpenQASM, exportToOpenQASM3 };
