// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { type Complex } from '../math/complex';
import type { QubitIndex } from './QubitState';
import type { Q5mGate } from './Q5mGate';
import {
  H,
  X,
  Y,
  Z,
  S,
  T,
  Tdg,
  Sdg,
  Identity,
  PH,
  RX,
  RY,
  RZ,
  CNOT,
  CX,
  CZ,
  CY,
  CH,
  CU,
  SWAP,
  CP,
  EE,
  HH,
  Mz,
  Mx,
  My,
  Mp,
} from './Gates';
import { MeasureGate } from './MeasureGates';
import { parseAngle } from '../math/math-utils';
import {
  BaseCircuit,
  type CircuitInstruction,
  type GateOptions,
  type GateFactory,
  type SerializedCircuit,
  type LoadOptions,
  SUPPORTED_VERSIONS,
} from './BaseCircuit';
import { QubitState } from './QubitState';

/** Gate name to factory mapping. */
const GATE_FACTORY_MAP: Map<string, GateFactory> = new Map<string, GateFactory>([
  ['h', () => H],
  ['hadamard', () => H],
  ['x', () => X],
  ['pauli-x', () => X],
  ['not', () => X],
  ['y', () => Y],
  ['pauli-y', () => Y],
  ['z', () => Z],
  ['pauli-z', () => Z],
  ['s', () => S],
  ['t', () => T],
  ['tdg', () => Tdg],
  ['sdg', () => Sdg],
  ['i', () => Identity],
  ['identity', () => Identity],
  [
    'phase',
    (options?: GateOptions) => {
      const phi = options?.params?.phi;
      return phi !== undefined ? PH(parseAngle(phi as string | number)) : S;
    },
  ],
  [
    'p',
    (options?: GateOptions) => {
      const theta = options?.params?.theta;
      return theta !== undefined ? PH(parseAngle(theta as string | number)) : S;
    },
  ],
  [
    'ph',
    (options?: GateOptions) => {
      const phi = options?.params?.phi;
      if (phi === undefined) throw new Error('phi parameter is required');
      return PH(parseAngle(phi as string | number));
    },
  ],
  [
    'rx',
    (options?: GateOptions) => {
      const theta = options?.params?.theta;
      if (theta === undefined) throw new Error('theta parameter is required');
      return RX(parseAngle(theta as string | number));
    },
  ],
  [
    'ry',
    (options?: GateOptions) => {
      const theta = options?.params?.theta;
      if (theta === undefined) throw new Error('theta parameter is required');
      return RY(parseAngle(theta as string | number));
    },
  ],
  [
    'rz',
    (options?: GateOptions) => {
      const theta = options?.params?.theta;
      if (theta === undefined) throw new Error('theta parameter is required');
      return RZ(parseAngle(theta as string | number));
    },
  ],

  ['cx', () => CX],
  ['cnot', () => CNOT],
  ['cz', () => CZ],
  ['cy', () => CY],
  ['ch', () => CH],
  ['swap', () => SWAP],
  [
    'cp',
    (options?: GateOptions) => {
      const theta = options?.params?.theta;
      return CP(theta !== undefined ? parseAngle(theta as string | number) : 0);
    },
  ],

  [
    'ee',
    (options?: GateOptions) => {
      const numQuantum = options?.numQuantum ?? 1;
      const phase = options?.params?.phase;
      const phaseAngle = phase !== undefined ? parseAngle(phase as string | number) : 0;
      return EE(numQuantum, phaseAngle);
    },
  ],
  [
    'hh',
    (options?: GateOptions) => {
      const numQuantum = options?.numQuantum ?? 1;
      const positions = options?.params?.positions ?? [];

      if (!Array.isArray(positions) || !positions.every((p) => typeof p === 'number')) {
        throw new Error('HH gate requires positions parameter as array');
      }

      return HH(numQuantum, positions);
    },
  ],
  [
    'cu',
    (options?: GateOptions) => {
      const params = options?.params;
      if (!params?.alpha || !params?.beta) {
        throw new Error('CU gate requires alpha and beta parameters');
      }
      const alpha = params.alpha as Complex;
      const beta = params.beta as Complex;
      const name = typeof params.name === 'string' ? params.name : 'CU';
      const theta = params.theta;
      const thetaAngle = theta !== undefined ? parseAngle(theta as string | number) : 0;
      return CU(name, alpha, beta, thetaAngle);
    },
  ],

  ['measure', () => Mz()], // Default Z-basis measurement
  ['mz', () => Mz()],
  ['measure-z', () => Mz()],
  ['mx', () => Mx()],
  ['measure-x', () => Mx()],
  ['my', () => My()],
  ['measure-y', () => My()],
  [
    'mp',
    (options?: GateOptions) => {
      const params = options?.params;
      const theta = params?.theta;
      const phi = params?.phi;
      const thetaAngle = theta !== undefined ? parseAngle(theta as string | number) : 0;
      const phiAngle = phi !== undefined ? parseAngle(phi as string | number) : 0;
      const name = typeof params?.name === 'string' ? params.name : undefined;
      return Mp(thetaAngle, phiAngle, name);
    },
  ],
  ['measure-phase', () => Mp(0, 0)],
]);

/** Check if a quantum gate is a measurement gate. */
function isMeasurementGate(gate: Q5mGate): boolean {
  return gate instanceof MeasureGate;
}

/** Extended Circuit class with comprehensive quantum gate library. */
class Circuit extends BaseCircuit {
  /** Creates the initial quantum state for circuit execution. */
  protected createInitialState(numQuantum: number): QubitState {
    return new QubitState(numQuantum);
  }

  /** Creates a copy of this circuit. */
  clone(): Circuit {
    const newCircuit = new Circuit(this.numQubits);
    newCircuit.instructions = [...this.instructions];
    return newCircuit;
  }

  /** Apply Hadamard gate to create superposition. */
  h(qubit: QubitIndex): Circuit {
    this.appendGate('h', qubit);
    return this;
  }

  /** Apply Pauli-X gate (bit flip). */
  x(qubit: QubitIndex): Circuit {
    this.appendGate('x', qubit);
    return this;
  }

  /** Apply Pauli-Y gate. */
  y(qubit: QubitIndex): Circuit {
    this.appendGate('y', qubit);
    return this;
  }

  /** Apply Pauli-Z gate (phase flip). */
  z(qubit: QubitIndex): Circuit {
    this.appendGate('z', qubit);
    return this;
  }

  /** Apply S gate (phase gate, π/2 rotation). */
  s(qubit: QubitIndex): Circuit {
    this.appendGate('s', qubit);
    return this;
  }

  /** Apply T gate (π/4 phase gate). */
  t(qubit: QubitIndex): Circuit {
    this.appendGate('t', qubit);
    return this;
  }

  /** Apply T-dagger gate (conjugate of T gate, -π/4 phase). */
  tdg(qubit: QubitIndex): Circuit {
    this.appendGate('tdg', qubit);
    return this;
  }

  /** Apply S-dagger gate (conjugate of S gate, -π/2 phase). */
  sdg(qubit: QubitIndex): Circuit {
    this.appendGate('sdg', qubit);
    return this;
  }

  /** Apply Identity gate (no operation). */
  i(qubit: QubitIndex): Circuit {
    this.appendGate('i', qubit);
    return this;
  }

  /** Apply arbitrary phase gate. */
  phase(qubit: QubitIndex, phi: number): Circuit {
    this.appendGate('phase', qubit, { params: { phi } });
    return this;
  }

  /** Apply X-axis rotation gate. */
  rx(qubit: QubitIndex, theta: number): Circuit {
    this.appendGate('rx', qubit, { params: { theta } });
    return this;
  }

  /** Apply Y-axis rotation gate. */
  ry(qubit: QubitIndex, theta: number): Circuit {
    this.appendGate('ry', qubit, { params: { theta } });
    return this;
  }

  /** Apply Z-axis rotation gate. */
  rz(qubit: QubitIndex, theta: number): Circuit {
    this.appendGate('rz', qubit, { params: { theta } });
    return this;
  }

  /** Apply Controlled-NOT (CNOT) gate. */
  cnot(control: QubitIndex, target: QubitIndex): Circuit {
    this.appendGate('cnot', [control, target]);
    return this;
  }

  /** Apply Controlled-X (CX) gate (alias for CNOT). */
  cx(control: QubitIndex, target: QubitIndex): Circuit {
    this.appendGate('cx', [control, target]);
    return this;
  }

  /** Apply Controlled-Z (CZ) gate. */
  cz(control: QubitIndex, target: QubitIndex): Circuit {
    this.appendGate('cz', [control, target]);
    return this;
  }

  /** Apply Controlled-Y (CY) gate. */
  cy(control: QubitIndex, target: QubitIndex): Circuit {
    this.appendGate('cy', [control, target]);
    return this;
  }

  /** Apply Controlled-Hadamard (CH) gate. */
  ch(control: QubitIndex, target: QubitIndex): Circuit {
    this.appendGate('ch', [control, target]);
    return this;
  }

  /** Apply SWAP gate. */
  swap(qubit1: number, qubit2: number): Circuit {
    this.appendGate('swap', [qubit1, qubit2]);
    return this;
  }

  /** Apply Controlled-Phase (CP) gate. */
  cp(control: QubitIndex, target: QubitIndex, phi: number): Circuit {
    this.appendGate('cp', [control, target], { params: { theta: phi } });
    return this;
  }

  /** Apply Multi-Hadamard (HH) gate. */
  hh(positions: number[]): Circuit {
    const maxQubit = Math.max(...positions);
    const requiredQubits = maxQubit + 1;

    this.appendGate(
      'hh',
      Array.from({ length: Math.max(this.quantumCount(), requiredQubits) }, (_, i) => i),
      {
        params: { positions },
        numQuantum: Math.max(this.quantumCount(), requiredQubits),
      },
    );
    return this;
  }

  /** Apply Global Phase (EE) gate. */
  ee(phase: number): Circuit {
    const numQuantum = this.quantumCount();
    this.appendGate(
      'ee',
      Array.from({ length: numQuantum }, (_, i) => i),
      {
        params: { phase },
        numQuantum,
      },
    );
    return this;
  }

  /** Apply Controlled-Unitary (CU) gate. */
  cu(
    control: QubitIndex,
    target: QubitIndex,
    name: string,
    alpha: Complex,
    beta: Complex,
    theta?: number,
  ): Circuit {
    this.appendGate('cu', [control, target], {
      params: { name, alpha, beta, theta: theta ?? 0 },
    });
    return this;
  }

  /**
   * Measure qubit in specified basis.
   * Acts as a unified interface for all measurement operations:
   * - 'z': Z-basis measurement (computational basis, default) - equivalent to mz()
   * - 'x': X-basis measurement - equivalent to mx()
   * - 'y': Y-basis measurement - equivalent to my()
   * - 'phase': Custom phase basis measurement - equivalent to mp()
   */
  measure(qubit: QubitIndex): Circuit;
  measure(qubit: QubitIndex, basis: 'x' | 'y' | 'z'): Circuit;
  measure(qubit: QubitIndex, basis: 'phase', theta: number, phi: number, name?: string): Circuit;
  measure(
    qubit: QubitIndex,
    basis: 'x' | 'y' | 'z' | 'phase' = 'z',
    theta?: number,
    phi?: number,
    name?: string,
  ): Circuit {
    switch (basis) {
      case 'x':
        return this.mx(qubit);
      case 'y':
        return this.my(qubit);
      case 'z':
        return this.mz(qubit);
      case 'phase':
        if (theta === undefined || phi === undefined) {
          throw new Error('Phase measurement requires theta and phi parameters');
        }
        return this.mp(qubit, theta, phi, name);
      default:
        // TypeScript should prevent this, but just in case
        throw new Error(`Invalid measurement basis: ${String(basis)}`);
    }
  }

  /** Measure qubit in Z-basis (computational basis). */
  mz(qubit: QubitIndex): Circuit {
    this.instructions.push({ gate: Mz(), targets: [qubit] });
    return this;
  }

  /** Measure qubit in X-basis. */
  mx(qubit: QubitIndex): Circuit {
    this.instructions.push({ gate: Mx(), targets: [qubit] });
    return this;
  }

  /** Measure qubit in Y-basis. */
  my(qubit: QubitIndex): Circuit {
    this.instructions.push({ gate: My(), targets: [qubit] });
    return this;
  }

  /** Measure qubit in custom phase basis. */
  mp(qubit: QubitIndex, theta: number, phi: number, name?: string): Circuit {
    this.instructions.push({ gate: Mp(theta, phi, name), targets: [qubit] });
    return this;
  }

  /** Override base circuit's getGateFactory to provide concrete gate implementations. */
  protected getGateFactory(gateName: string): GateFactory | undefined {
    return GATE_FACTORY_MAP.get(gateName.toLowerCase());
  }

  /** Append a gate to the end of the circuit by name. */
  appendGate(gateName: string, wire: QubitIndex | QubitIndex[], options?: GateOptions): Circuit {
    const wires = Array.isArray(wire) ? wire : [wire];

    for (const wireIndex of wires) {
      if (wireIndex === undefined || wireIndex < 0) {
        throw new Error(`Invalid qubit index: ${wireIndex}`);
      }
    }

    const gateFactory = GATE_FACTORY_MAP.get(gateName.toLowerCase());
    if (!gateFactory) {
      throw new Error(`Unsupported gate: ${gateName}`);
    }

    const gate = gateFactory(options);

    if (isMeasurementGate(gate)) {
      if (wires.length !== 1) {
        throw new Error(
          `Measurement gate ${gateName} can only be applied to a single qubit, got ${wires.length} qubits`,
        );
      }
    } else {
      const expectedSize = Math.pow(2, wires.length);
      if (gate.size !== expectedSize) {
        throw new Error(
          `Gate ${gateName} expects ${Math.log2(gate.size)} qubits but got ${wires.length}`,
        );
      }

      if (wires.length === 2 && wires[0] === wires[1]) {
        throw new Error('Cannot apply two-qubit gate to the same qubit');
      }
    }

    const maxQubit = Math.max(...wires);
    if (maxQubit >= this.quantumCount()) {
      this.numQubits = maxQubit + 1;
    }

    this.instructions.push({ gate, targets: wires });
    return this;
  }

  /** Get the current memory usage of the circuit's quantum state. */
  memoryUsage(): number {
    if (this.numQubits >= 12) {
      return Math.min(100, this.numQubits * 8);
    } else {
      return Math.pow(2, this.numQubits) * 16;
    }
  }

  /**
   * Deserializes a Circuit from JSON interchange format.
   *
   * Creates a new Circuit instance from JSON data created by toJSON().
   * Supports version compatibility and parameter restoration.
   *
   * @param data - Serialized circuit JSON data
   * @param options - Load options
   * @returns New Circuit instance
   * @throws {Error} If data format is invalid or incompatible
   */
  static fromJSON(data: SerializedCircuit, options: LoadOptions = {}): Circuit {
    const DEFAULT_LOAD_OPTIONS = {
      validateVersion: true,
      strict: true,
      allowUnknownGates: false,
    };
    const opts = { ...DEFAULT_LOAD_OPTIONS, ...options };

    // Validate format
    if (!data || data.format !== 'q5m-circuit') {
      throw new Error('Invalid circuit format identifier');
    }

    // Version compatibility check
    if (opts.validateVersion && !SUPPORTED_VERSIONS.includes(data.version)) {
      throw new Error(
        `Unsupported format version: ${data.version}. Supported: ${SUPPORTED_VERSIONS.join(', ')}`,
      );
    }

    if (typeof data.numQubits !== 'number' || data.numQubits <= 0) {
      throw new Error('Invalid number of qubits');
    }

    if (!Array.isArray(data.gates)) {
      throw new Error('Invalid gates array');
    }

    // Create new circuit
    const circuit = new Circuit(data.numQubits);

    // Reconstruct gates
    for (const gateData of data.gates) {
      if (!gateData.name || !Array.isArray(gateData.targets)) {
        if (opts.strict) {
          throw new Error('Invalid gate data structure');
        }
        continue; // Skip invalid gates in non-strict mode
      }

      try {
        // Convert parameters back to GateOptions format
        const gateOptions: GateOptions = {};
        if (gateData.parameters) {
          gateOptions.params = gateData.parameters;
        }

        // Apply the gate
        circuit.appendGate(gateData.name, gateData.targets, gateOptions);
      } catch (error) {
        if (opts.allowUnknownGates) {
          continue;
        }
        throw new Error(
          `Failed to reconstruct gate ${gateData.name}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return circuit;
  }
}

/** Classical register definition for circuit conversions. */
interface CReg {
  /** Register name */
  readonly name: string;
  /** Number of bits in the register */
  readonly size: number;
}

/** Extended circuit interface with optional classical registers. */
interface CircuitWithCReg extends Circuit {
  /** Optional classical registers map */
  cregs?: Map<string, CReg>;
}

/** Type guard to check if a circuit has classical registers. */
function hasCReg(circuit: Circuit): circuit is CircuitWithCReg {
  return 'cregs' in circuit && circuit.cregs instanceof Map;
}

export type { CReg, CircuitWithCReg, CircuitInstruction, GateOptions, GateFactory };
export { isMeasurementGate, hasCReg };
export { Circuit };
