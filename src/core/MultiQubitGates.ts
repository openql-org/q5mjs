// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @fileoverview Multi-qubit quantum gates for the q5m.js framework.
 *
 * This module provides quantum gates that operate on multiple qubits simultaneously
 * or on variable numbers of qubits:
 *
 * - **MultiQubitGate Base Class**: Abstract foundation for n-qubit operations
 * - **GlobalPhaseGate**: Applies global phase to entire quantum state
 * - **MultiHadamardGate**: Parallel Hadamard operations on selected qubits
 *
 * These gates enable efficient parallel operations and global transformations
 * that would be cumbersome to express as sequences of smaller gates.
 *
 * @author OpenQL Project
 * @version 0.1.0
 * @since 2025
 */

import { Q5mGate } from './Q5mGate';
import { Q5mOperator } from './Q5mOperator';
import type { Complex } from '../math/complex';
import { complex, ONE, ZERO } from '../math/complex';
import type { Unitary } from '../math/math-utils';
import type { Q5mIndex } from './Q5mMaterial';

/**
 * Abstract base class for quantum gates that operate on multiple qubits.
 *
 * MultiQubitGate extends Q5mGate to handle gates that operate on an arbitrary
 * number of qubits (n ≥ 1). It automatically computes the matrix size as 2^n
 * and provides common functionality for multi-qubit operations.
 *
 * This class is particularly useful for:
 * - Global operations affecting all qubits
 * - Parallel operations on selected qubit subsets
 * - Scalable quantum algorithms
 * - Custom multi-qubit transformations
 *
 * **Matrix Size**: For n qubits, the matrix is 2^n × 2^n
 *
 * @category Multi Qubit Gates
 *
 */
abstract class MultiQubitGate extends Q5mGate {
  protected numQubits: number;

  /**
   * Creates a new multi-qubit gate for the specified number of qubits.
   *
   * @param numQubits - Number of qubits this gate operates on (must be ≥ 1)
   * @throws {Error} If numQubits is less than 1
   */
  constructor(numQubits: number) {
    super();
    if (numQubits < 1) {
      throw new Error('Number of targets must be at least 1');
    }
    this.numQubits = numQubits;
  }

  /**
   * Gets the matrix dimension (2^numQubits) for this multi-qubit gate.
   *
   * @returns Matrix size: 2^n where n is the number of qubits
   */
  get size(): number {
    return Math.pow(2, this.numQubits);
  }
}

/**
 * Global Phase Gate - applies uniform phase e^(iφ) to entire quantum state.
 *
 * The GlobalPhaseGate multiplies every amplitude in the quantum state by the same
 * phase factor e^(iφ). While global phases are physically unobservable (they don't
 * affect measurement probabilities), they are important for:
 *
 * - Quantum interference effects
 * - Relative phases in superposition states
 * - Quantum algorithm implementations
 * - Theoretical quantum mechanics calculations
 *
 * **Matrix Representation:**
 * ```
 * E(φ) = e^(iφ) × I_n
 * ```
 * where I_n is the n-qubit identity matrix (size 2^n × 2^n).
 *
 * **Effect on State:**
 * ```
 * |ψ⟩ → e^(iφ) |ψ⟩
 * ```
 * All basis state amplitudes are multiplied by the same phase factor.
 *
 * **Applications:**
 * - Implementing quantum algorithm phases
 * - Correcting relative phases in circuits
 * - Theoretical quantum state manipulations
 * - Testing phase-sensitive quantum protocols
 *
 * @category Multi Qubit Gates
 *
 */
class GlobalPhaseGate extends MultiQubitGate {
  readonly name: string = 'E';
  readonly matrix: Unitary;
  private phase: number;

  /**
   * Creates a new Global Phase gate.
   *
   * @param numQubits - Number of qubits in the system
   * @param phase - Phase angle in radians to apply globally
   * @param name - Optional custom name for the gate (defaults to 'E')
   */
  constructor(numQubits: number, phase: number, name?: string) {
    super(numQubits);
    this.phase = phase;
    this.name = name ?? 'E';

    const size = this.size;
    const identityOp = Q5mOperator.identity(size);
    const expIPhase = complex(Math.cos(phase), Math.sin(phase));

    this.matrix = identityOp.scale(expIPhase).getMatrix();
  }

  /**
   * Gets the phase angle applied by this gate.
   *
   * @returns Phase angle in radians
   */
  getPhase(): number {
    return this.phase;
  }

  /**
   * Creates a GlobalPhaseGate with specified angle.
   *
   * @param numQubits - Number of qubits in the system
   * @param angle - Phase angle in radians
   * @param name - Optional custom name
   * @returns New GlobalPhaseGate instance
   */
  static fromAngle(numQubits: number, angle: number, name?: string): GlobalPhaseGate {
    return new GlobalPhaseGate(numQubits, angle, name);
  }

  /**
   * Creates a GlobalPhaseGate with phase as multiple of π.
   *
   * @param numQubits - Number of qubits in the system
   * @param piMultiple - Phase as multiple of π (e.g., 0.5 for π/2)
   * @param name - Optional custom name
   * @returns New GlobalPhaseGate instance
   *
   */
  static fromPiMultiple(numQubits: number, piMultiple: number, name?: string): GlobalPhaseGate {
    return new GlobalPhaseGate(numQubits, piMultiple * Math.PI, name);
  }
}

/**
 * Multi-Hadamard gate - applies Hadamard gates to specified qubit positions simultaneously.
 *
 * This gate applies Hadamard transformations to multiple specified qubits in parallel,
 * creating uniform superposition states across selected qubits. It's essential for
 * quantum algorithms that require efficient preparation of superposition states.
 *
 * For n total qubits and k target positions, creates tensor product:
 * H ⊗ I ⊗ H ⊗ ... (Hadamard on targets, Identity elsewhere)
 *
 * **Matrix Structure**: 2^n × 2^n with selective Hadamard transformations
 * **Complexity**: More efficient than sequential Hadamard applications
 *
 * @category Multi Qubit Gates
 *
 */
class MultiHadamardGate extends MultiQubitGate {
  readonly name: string = 'HH';
  readonly matrix: Unitary;
  private targetQubits: Q5mIndex[];

  constructor(numQubits: number, targetQubits: Q5mIndex[], name?: string) {
    super(numQubits);

    if (targetQubits.length === 0) {
      throw new Error('At least one target qubit must be specified');
    }

    for (const qubit of targetQubits) {
      if (qubit < 0 || qubit >= numQubits) {
        throw new Error(`Qubit index ${qubit} out of range [0, ${numQubits - 1}]`);
      }
    }

    this.targetQubits = [...new Set(targetQubits)].sort((a, b) => a - b);

    this.name = name ?? 'HH';

    this.matrix = this.buildSelectiveHadamardMatrix();
  }

  getTargetQubits(): Q5mIndex[] {
    return [...this.targetQubits];
  }

  /**
   * Builds the matrix for selective Hadamard application.
   *
   * Creates a matrix that applies Hadamard gates to specified target qubits
   * and identity operations to non-target qubits. This implements the tensor
   * product H ⊗ I ⊗ H ⊗ ... where H appears at target positions.
   *
   * @returns The complete transformation matrix for the multi-Hadamard operation
   */
  private buildSelectiveHadamardMatrix(): Unitary {
    const size = this.size;
    const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => ZERO));

    const H = Q5mOperator.Hadamard(2).getMatrix();
    const I = Q5mOperator.identity(2).getMatrix();

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let matrixElement: Complex = ONE;

        for (let qubitPos = 0; qubitPos < this.numQubits; qubitPos++) {
          const iBit = (i >> (this.numQubits - 1 - qubitPos)) & 1;
          const jBit = (j >> (this.numQubits - 1 - qubitPos)) & 1;

          if (this.targetQubits.includes(qubitPos)) {
            const hElement = H[iBit]![jBit]!;
            matrixElement = matrixElement.mul(hElement);
          } else {
            const iElement = I[iBit]![jBit]!;
            matrixElement = matrixElement.mul(iElement);
          }
        }

        matrix[i]![j] = matrixElement;
      }
    }

    return matrix;
  }

  static onPositions(numQubits: number, positions: Q5mIndex[], name?: string): MultiHadamardGate {
    return new MultiHadamardGate(numQubits, positions, name);
  }

  static onAll(numQubits: number, name?: string): MultiHadamardGate {
    const allPositions = Array.from({ length: numQubits }, (_, i) => i);
    return new MultiHadamardGate(numQubits, allPositions, name);
  }
}

/**
 * Creates a global phase gate.
 * @param numQubits - Number of qubits.
 * @param phase - Global phase angle.
 */
const EE = (numQubits: number, phase: number): GlobalPhaseGate =>
  new GlobalPhaseGate(numQubits, phase);

/**
 * Creates a multi-Hadamard gate.
 * @param numQubits - Total number of qubits.
 * @param positions - Positions to apply Hadamard gates.
 */
const HH = (numQubits: number, positions: Q5mIndex[]): MultiHadamardGate =>
  new MultiHadamardGate(numQubits, positions);

const createGlobalPhase = (numQubits: number, angle: number, name?: string): GlobalPhaseGate => {
  return GlobalPhaseGate.fromAngle(numQubits, angle, name);
};

const createMultiHadamard = (
  numQubits: number,
  positions: Q5mIndex[],
  name?: string,
): MultiHadamardGate => {
  return MultiHadamardGate.onPositions(numQubits, positions, name);
};

/** Interface for multi-qubit gate methods in quantum circuits. */
interface CircuitMultiQubitMethods {
  /** Apply global phase to all qubits. */
  globalPhase(phase: number): this;
  /** Apply Hadamard gates to specific positions. */
  multiHadamard(positions: Q5mIndex[]): this;
  /** Apply Hadamard gates to all qubits. */
  hadamardAll(): this;
  /** Apply global phase gate (alias for globalPhase). */
  e(phase: number): this;
  /** Apply multi-Hadamard gate (alias for multiHadamard). */
  hh(positions: Q5mIndex[]): this;
}

// Export all types, classes, instances and factory functions
export type { CircuitMultiQubitMethods };
export {
  MultiQubitGate,
  GlobalPhaseGate,
  MultiHadamardGate,
  EE,
  HH,
  createGlobalPhase,
  createMultiHadamard,
};
