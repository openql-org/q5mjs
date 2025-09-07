// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Converts quantum circuits to Google's Cirq format.
 *
 * This module provides functions to export q5m.js circuits into Cirq-compatible
 * formats, including Python code and Cirq's JSON representation. This allows
 * for interoperability with the Google Quantum AI ecosystem.
 *
 * @packageDocumentation
 */

import type { Circuit } from '../core/Circuit';

/**
 * Defines the options for exporting a circuit to Cirq Python code.
 * @category Converters
 */
interface CirqExportOptions {
  /** If true, includes `import cirq` statements. Defaults to `true`. */
  includeImports?: boolean;
  /** If true, includes comments in the generated Python code. Defaults to `true`. */
  includeComments?: boolean;
  /** The variable name for the Cirq circuit object. Defaults to `'circuit'`. */
  circuitVariableName?: string;
  /** The type of qubits to use ('LineQubit' or 'GridQubit'). Defaults to `'LineQubit'`. */
  qubitType?: 'LineQubit' | 'GridQubit';
  /** If true, includes measurement operations at the end of the circuit. Defaults to `false`. */
  includeMeasurements?: boolean;
  /** If true, includes boilerplate code to run a simulation. Defaults to `false`. */
  includeSimulator?: boolean;
}

/**
 * Represents a single operation in Cirq's JSON format.
 * @internal
 */
interface CirqOperation {
  cirq_type: string;
  gate: {
    cirq_type: string;
    [key: string]: unknown;
  };
  qubits: Array<{ cirq_type: string; x: number }>;
}

/**
 * Represents a "moment" (a time slice of operations) in Cirq's JSON format.
 * @internal
 */
interface CirqMoment {
  cirq_type: 'Moment';
  operations: CirqOperation[];
}

/**
 * Represents a full circuit in Cirq's JSON format.
 * @internal
 */
interface CirqJSON {
  cirq_type: 'Circuit';
  moments: CirqMoment[];
  device: { cirq_type: string };
  qubits: Array<{ cirq_type: string; x: number }>;
}

/**
 * Converts a q5m.js circuit to a Cirq-compatible Python script.
 *
 * @param circuit The quantum circuit to export.
 * @param options Configuration options for the export.
 * @returns A string containing the Python code for the Cirq circuit.
 * @category Converters
 *
 */
function exportToCirq(circuit: Circuit, options: CirqExportOptions = {}): string {
  const {
    includeImports = true,
    includeComments = true,
    circuitVariableName = 'circuit',
    qubitType = 'LineQubit',
    includeMeasurements = false,
    includeSimulator = false,
  } = options;

  const numQubits = circuit.quantumCount();
  let cirqCode = '';

  // Add imports
  if (includeImports) {
    cirqCode += 'import cirq\n';
    if (includeSimulator) {
      cirqCode += 'import numpy as np\n';
    }
    cirqCode += '\n';
  }

  // Add header comment
  if (includeComments) {
    cirqCode += '# Q5M.js exported circuit\n';
    cirqCode += `# Generated at: ${new Date().toISOString()}\n`;
    cirqCode += `# Number of targets: ${numQubits}\n\n`;
  }

  // Create qubits
  if (includeComments) {
    cirqCode += '# Create qubits\n';
  }

  if (qubitType === 'LineQubit') {
    cirqCode += `qubits = cirq.LineQubit.range(${numQubits})\n`;
  } else {
    // GridQubit for 2D layout
    const rows = Math.ceil(Math.sqrt(numQubits));
    cirqCode += `qubits = []\n`;
    for (let i = 0; i < numQubits; i++) {
      const row = Math.floor(i / rows);
      const col = i % rows;
      cirqCode += `qubits.append(cirq.GridQubit(${row}, ${col}))\n`;
    }
  }

  cirqCode += '\n';

  // Create circuit
  if (includeComments) {
    cirqCode += '# Create circuit\n';
  }
  cirqCode += `${circuitVariableName} = cirq.Circuit()\n\n`;

  // Add gates
  if (includeComments && circuit.instructionsList().length > 0) {
    cirqCode += '# Add gates\n';
  }

  const instructions = circuit.instructionsList();
  for (const instr of instructions) {
    const cirqGate = gateToCirq(instr.gate.name, instr.targets);
    if (cirqGate) {
      cirqCode += `${circuitVariableName}.append(${cirqGate})\n`;
    }
  }

  // Add measurements if requested
  if (includeMeasurements) {
    cirqCode += '\n# Add measurements\n';

    const measurementGates = Array.from(
      { length: numQubits },
      (_, i) => `cirq.measure(qubits[${i}], key='q${i}')`,
    ).join(', ');

    cirqCode += `${circuitVariableName}.append([${measurementGates}])\n`;
  }

  // Add simulator code if requested
  if (includeSimulator) {
    cirqCode += '\n# Run simulation\n';
    cirqCode += 'simulator = cirq.Simulator()\n';

    if (includeMeasurements) {
      cirqCode += `result = simulator.run(${circuitVariableName}, repetitions=1000)\n`;
      cirqCode += 'print(result)\n';
    } else {
      cirqCode += `result = simulator.simulate(${circuitVariableName})\n`;
      cirqCode += 'print("Final state vector:")\n';
      cirqCode += 'print(result.final_state_vector)\n';
    }
  }

  // Add circuit diagram
  if (includeComments) {
    cirqCode += '\n# Display circuit\n';
    cirqCode += `print(${circuitVariableName})\n`;
  }

  return cirqCode;
}

/**
 * Converts a q5m.js gate name and target indices to a Cirq Python string.
 *
 * This function performs the core translation between q5m.js gate representations
 * and Cirq's Python API. It handles both standard quantum gates and parameterized
 * operations, providing comprehensive mapping for quantum circuit conversion.
 *
 * **Supported Gate Types:**
 * - **Single-qubit gates**: H, X, Y, Z, S, T (with full and abbreviated names)
 * - **Two-qubit gates**: CNOT, CZ, CY, SWAP, controlled phase gates
 * - **Parameterized gates**: Rotation gates (rx, ry, rz) and phase gates with angle parameters
 * - **Special handling**: Automatic parameter extraction and format conversion
 *
 * **Parameter Processing:**
 * - Extracts angle parameters from gate names using regex matching
 * - Converts q5m.js angle notation to Cirq's parameter format
 * - Handles phase gates by converting angles to exponents (angle/π)
 * - Maintains precision for rotation and phase operations
 *
 * @param gateName The q5m.js gate name (may include parameters in parentheses)
 * @param targets The qubit indices that the gate operates on
 * @returns Cirq Python code string for the gate operation, or null if unsupported
 * @internal
 *
 */
function gateToCirq(gateName: string, targets: number[]): string | null {
  const gate = gateName.toLowerCase();

  // Extract the base gate name for parametrized gates (e.g., "rx(1.571)" -> "rx")
  const baseGate = gate.split('(')[0] || gate;

  // Map to Cirq gate names (handling both full and abbreviated names)
  const singleQubitGates: Record<string, string> = {
    hadamard: 'cirq.H',
    h: 'cirq.H',
    paulix: 'cirq.X',
    x: 'cirq.X',
    pauliy: 'cirq.Y',
    y: 'cirq.Y',
    pauliz: 'cirq.Z',
    z: 'cirq.Z',
    sgate: 'cirq.S',
    s: 'cirq.S',
    tgate: 'cirq.T',
    t: 'cirq.T',
  };

  const twoQubitGates: Record<string, string> = {
    cnot: 'cirq.CNOT',
    controlledz: 'cirq.CZ',
    cz: 'cirq.CZ',
    controlledy: 'cirq.CY',
    cy: 'cirq.CY',
    swap: 'cirq.SWAP',
    controlledphase: 'cirq.CZPowGate',
    cp: 'cirq.CZPowGate',
  };

  // Handle parameterized gates
  const parametrizedGates: Record<string, string> = {
    rotationx: 'cirq.rx',
    rx: 'cirq.rx',
    rotationy: 'cirq.ry',
    ry: 'cirq.ry',
    rotationz: 'cirq.rz',
    rz: 'cirq.rz',
    phase: 'cirq.ZPowGate',
    p: 'cirq.ZPowGate',
  };

  // Check for parameterized gates first
  if (parametrizedGates[baseGate]) {
    const cirqGate = parametrizedGates[baseGate];
    const paramMatch = gateName.match(/\(([^)]+)\)/);
    /* istanbul ignore if */
    if (!paramMatch) return null;
    const targetArgs = targets.map((q) => `qubits[${q}]`).join(', ');

    // Handle parameterized gates
    if (cirqGate.includes('ZPowGate')) {
      // Phase gates take exponent, not angle
      return `${cirqGate}(exponent=${paramMatch[1]}/np.pi)(${targetArgs})`;
    } else {
      // Rotation gates take angle directly
      return `${cirqGate}(${paramMatch[1]})(${targetArgs})`;
    }
  }

  // Handle standard gates
  if (targets.length === 1) {
    const cirqGate = singleQubitGates[baseGate];
    if (cirqGate) {
      return `${cirqGate}(qubits[${targets[0]}])`;
    }
  } else if (targets.length === 2) {
    const cirqGate = twoQubitGates[baseGate];
    // Handle controlled phase gate specially (always has parameters)
    if (cirqGate === 'cirq.CZPowGate') {
      const paramMatch = gateName.match(/\(([^)]+)\)/);
      /* istanbul ignore if */
      if (!paramMatch) return null;
      return `${cirqGate}(exponent=${paramMatch[1]}/np.pi)(qubits[${targets[0]}], qubits[${targets[1]}])`;
    }
    return `${cirqGate}(qubits[${targets[0]}], qubits[${targets[1]}])`;
  }

  return null;
}

/**
 * Converts a q5m.js circuit to Cirq's JSON format.
 *
 * @param circuit The quantum circuit to export.
 * @returns A JSON string representing the circuit that can be loaded by Cirq.
 * @category Converters
 */
function exportToCirqJSON(circuit: Circuit): string {
  const numQubits = circuit.quantumCount();
  const instructions = circuit.instructionsList();

  const cirqJSON: CirqJSON = {
    cirq_type: 'Circuit',
    moments: [] as CirqMoment[],
    device: {
      cirq_type: 'UnconstrainedDevice',
    },
    qubits: Array.from({ length: numQubits }, (_, i) => ({
      cirq_type: 'LineQubit',
      x: i,
    })),
  };

  // Group instructions into moments (time steps)
  const moments: CirqOperation[][] = [];
  let currentMoment: CirqOperation[] = [];
  const usedQubits = new Set<number>();

  for (const instr of instructions) {
    // Check if any qubit is already used in current moment
    const conflicts = instr.targets.some((q) => usedQubits.has(q));

    if (conflicts) {
      // Start new moment
      moments.push(currentMoment);
      currentMoment = [];
      usedQubits.clear();
    }

    // Add operation to current moment
    const operation = gateToJSON(instr.gate.name, instr.targets);
    if (operation) {
      currentMoment.push(operation);
      instr.targets.forEach((q) => usedQubits.add(q));
    }
  }

  // Add last moment
  if (currentMoment.length > 0) {
    moments.push(currentMoment);
  }

  // Convert moments to Cirq format
  cirqJSON.moments = moments.map((ops) => ({
    cirq_type: 'Moment',
    operations: ops,
  }));

  return JSON.stringify(cirqJSON, null, 2);
}

/**
 * Converts a q5m.js gate name and target indices to a Cirq JSON operation object.
 * @param gateName The name of the gate.
 * @param targets The indices of the targets the gate acts on.
 * @returns A CirqOperation object, or null if the gate is not supported.
 * @internal
 */
function gateToJSON(gateName: string, targets: number[]): CirqOperation | null {
  const gate = gateName.toLowerCase();

  const gateTypeMap: Record<string, string> = {
    hadamard: 'H',
    h: 'H',
    paulix: 'X',
    x: 'X',
    pauliy: 'Y',
    y: 'Y',
    pauliz: 'Z',
    z: 'Z',
    sgate: 'S',
    s: 'S',
    tgate: 'T',
    t: 'T',
    cnot: 'CNOT',
    swap: 'SWAP',
  };

  const cirqType = gateTypeMap[gate];
  if (!cirqType) {
    return null;
  }

  return {
    cirq_type: 'GateOperation',
    gate: {
      cirq_type: cirqType,
    },
    qubits: targets.map((q) => ({
      cirq_type: 'LineQubit',
      x: q,
    })),
  };
}

// Exports

/**
 * Cirq export function type.
 */
export type CirqExporterType = (circuit: Circuit, options?: CirqExportOptions) => string;

/**
 * Cirq JSON export function type.
 */
export type CirqJSONExporterType = (circuit: Circuit, options?: CirqExportOptions) => string;

// Type exports
export type { CirqExportOptions };

// Function exports
export { exportToCirq, exportToCirqJSON };
