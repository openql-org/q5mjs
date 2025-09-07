// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @fileoverview Pure qubit state representation for q5m.js quantum computing.
 *
 * This module provides the QubitState class, which represents pure quantum states
 * of qubits (2-level quantum systems). It extends the abstract Q5mSystem class
 * to provide specific implementations for qubit-based quantum computation.
 *
 * Features:
 * - **Memory Optimization**: Automatic sparse/dense representation switching
 * - **State Vector Representation**: Quantum amplitudes for 2^n dimensional space
 * - **Quantum Operations**: Full support for unitary evolution and measurement
 * - **Performance Scaling**: Efficient handling of large qubit systems (>12 qubits)
 * - **Single Qubit Operations**: Integrated single-qubit functionality
 *
 * The QubitState uses quantum amplitudes in Hilbert space where each amplitude
 * corresponds to a computational basis state probability amplitude.
 *
 * @author OpenQL Project
 * @version 0.1.0
 * @since 2025
 */

import type { Complex } from '../math/complex';
import { complex, ZERO, ONE } from '../math/complex';
import { tensorP, formatAmplitude, normalizeAmplitudes, innerP } from '../math/math-utils';
import type { Q5mSystem } from './Q5mSystem';
import { Q5mState, RepType } from './Q5mState';
import type { Q5mApplicable } from './Q5mState';
import type { StateVector } from './Q5mMaterial';
import { Q5mMaterial } from './Q5mMaterial';
import type { Amplitude } from '../math/math-utils';
import type { Q5mOperator } from './Q5mOperator';
import type { Unitary } from '../math/math-utils';
import type { ZeroOne } from './Results';
import type { Q5mIndex } from './Q5mMaterial';

/**
 * Type alias for qubit indices for enhanced type safety.
 * QubitIndex represents a specific qubit position in a quantum circuit,
 * constrained to non-negative integer values.
 */
type QubitIndex = Q5mIndex;

/**
 * Type guard to check if a value is a valid qubit index.
 *
 * Validates that the value is a non-negative integer suitable for
 * indexing qubits in a quantum system.
 *
 * @param value - Value to check
 * @returns True if value is a valid qubit index (non-negative integer)
 */
function isValidQubitIndex(value: unknown): value is QubitIndex {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * Type guard to check if a value is a QubitState instance.
 *
 * @param value - Value to check
 * @returns True if value is a QubitState instance with valid quantum state properties
 */
function isQubitState(value: unknown): value is QubitState {
  return (
    value instanceof QubitState &&
    typeof value.quantumCount === 'function' &&
    typeof value.probabilities === 'function' &&
    typeof value.amplitudes === 'function' &&
    value.quantumCount() >= 0
  );
}

/**
 * Represents a pure quantum state of qubits with memory optimization and integrated single-qubit operations.
 *
 * QubitState is the unified quantum state representation in q5m.js, supporting
 * both single qubits and arbitrary multi-qubit systems with automatic optimization
 * for large systems. It provides both the functionality of the original Qubit class
 * for single-qubit operations and the multi-qubit capabilities.
 *
 * **State Representation:**
 * |ψ⟩ = Σᵢ αᵢ|i⟩ where |i⟩ are computational basis states and Σᵢ|αᵢ|² = 1
 *
 * **Memory Strategies:**
 * - Dense representation: Full quantum amplitude vector for small systems (<12 qubits)
 * - Sparse representation: Map-based storage for large or sparse systems
 * - Automatic switching based on sparsity and system size
 *
 * **Single Qubit Features:**
 * - Static factory methods for common states (|0⟩, |1⟩, |+⟩, |−⟩)
 * - Bloch sphere parameterization
 * - Direct amplitude specification
 * - Measurement and state collapse
 * - Phase-aware state comparison
 *
 * **Computational Basis Ordering (Big-Endian):**
 * For n qubits, basis states are ordered as |q_{n-1} ... q_1 q_0⟩.
 * The index `i` of the state vector corresponds to the integer value of the bit string.
 *
 * @category Core Classes
 */
class QubitState<TQubit extends Qubit = Qubit>
  extends Q5mState<TQubit>
  implements Q5mSystem, Q5mApplicable<Q5mOperator<Unitary>>
{
  /**
   * Creates a QubitState with the specified number of qubits.
   *
   * The constructor automatically selects the internal representation (dense or sparse)
   * based on the system size and the provided state vector's sparsity. For systems
   * with 8 or more qubits, sparse representation is enabled by default to conserve memory.
   *
   * @param numQubits Number of qubits in the system. Must be a positive integer.
   * @param stateVector Optional initial state vector of complex amplitudes. If not provided, defaults to the |0...0⟩ state. The length must be 2^numQubits.
   * @param optimizeMemory Manually enable or disable sparse representation. Defaults to `true` for 8 or more qubits.
   * @throws {Error} If `numQubits` is not a positive integer.
   * @throws {Error} If `stateVector` is provided and its length is not equal to 2^numQubits.
   */
  constructor(
    numQubits: number,
    stateVector?: Amplitude[],
    optimizeMemory?: boolean,
    material?: TQubit,
  ) {
    const shouldOptimize = optimizeMemory ?? numQubits >= 8;

    super(numQubits, stateVector, shouldOptimize, material);
  }

  /**
   * Creates a QubitState representing a specific computational basis state.
   *
   * @param numQubits - Number of qubits in the system
   * @param basisIndex - Index of the basis state (0 to 2^numQubits - 1)
   * @returns New QubitState in the specified basis state
   * @throws {Error} If basisIndex is out of range
   */
  static fromBasisState(numQubits: number, basisIndex: QubitIndex): QubitState {
    const size = Math.pow(2, numQubits);
    if (basisIndex < 0 || basisIndex >= size) {
      throw new Error(`Basis index ${basisIndex} out of range for ${numQubits} qubits`);
    }

    const stateVector = new Array(size).fill(ZERO);
    stateVector[basisIndex] = ONE;
    return new QubitState(numQubits, stateVector, true);
  }

  /**
   * Creates a QubitState from a binary string representation.
   *
   * @param bitString - Binary string (e.g., "101" for |101⟩)
   * @returns New QubitState representing the specified basis state
   * @throws {Error} If bitString contains non-binary characters
   */
  static fromBitString(bitString: string): QubitState {
    if (!/^[01]+$/.test(bitString)) {
      throw new Error(`Invalid bit string: ${bitString}. Must contain only 0s and 1s.`);
    }

    const numQubits = bitString.length;
    const basisIndex = parseInt(bitString, 2);
    return QubitState.fromBasisState(numQubits, basisIndex);
  }

  /**
   * Returns the quantum amplitude for a specific basis state.
   * Implementation of Q5mState.amplitude() method.
   *
   * @param basisIndex - Index of the computational basis state
   * @returns Quantum amplitude for the specified basis state
   * @throws {Error} If basisIndex is out of range
   */
  amplitude(basisIndex: QubitIndex): Amplitude {
    if (basisIndex < 0 || basisIndex >= this.stateCount) {
      throw new Error(`Basis index ${basisIndex} out of range`);
    }

    const state = this.getRepState();
    switch (state.rep) {
      case RepType.DENSE:
        return state.stateVector[basisIndex] || ZERO;

      case RepType.SPARSE:
        return state.sparseAmplitudes.get(basisIndex) || ZERO;

      case RepType.CSR:
        return this.getCSRAmplitude(basisIndex);

      default:
        throw new Error(`Unhandled representation type in amplitude(): ${this.rep}`);
    }
  }

  /**
   * Calculates the state space dimension for the given number of quantum units.
   * For qubits (2-level systems): 2^n.
   */
  calculateStateCount(numQubits: number): number {
    return Math.pow(2, numQubits);
  }

  /**
   * Applies a unitary operator to this quantum state.
   *
   * This method uses representation-aware algorithms and preserves the
   * representation type of the original state for consistency.
   *
   * @param unitary - The unitary operator to apply
   * @returns A new QubitState after the unitary transformation
   * @throws {Error} If dimensions don't match
   */
  apply(unitary: Q5mOperator<Unitary>): QubitState {
    if (unitary.dimension !== this.stateCount) {
      throw new Error(
        `Unitary operator dimension ${unitary.dimension} does not match state dimension ${this.stateCount}`,
      );
    }

    const unitaryMatrix = unitary.getMatrix();
    const newState = this.applyUnitaryOptimized(unitaryMatrix);

    const wasOptimized = this.rep !== RepType.DENSE;
    const resultState = new QubitState(this.numQuantum, newState, wasOptimized);

    return resultState;
  }

  /** Normalizes the quantum state to unit length. */
  normalize(): QubitState {
    const currentState = this.amplitudes();
    const normalizedState = normalizeAmplitudes(currentState);
    const resultState = new QubitState(this.numQuantum, normalizedState);

    return resultState;
  }

  /**
   * Creates a new quantum state with the specified amplitudes.
   * @param newAmplitudes - Array of quantum amplitudes.
   */
  withAmplitudes(newAmplitudes: Amplitude[]): QubitState {
    const resultState = new QubitState(this.numQuantum, newAmplitudes);

    return resultState;
  }

  /** Returns the dimension of the quantum state space (2^n). */
  dimension(): number {
    return this.stateCount;
  }

  /** Creates a deep copy of the quantum state. */
  clone(): QubitState {
    const fullStateVector = [...this.amplitudes()];
    const wasOptimized = !this.isDense;
    return new QubitState(this.numQuantum, fullStateVector, wasOptimized);
  }

  /**
   * Computes the tensor product with another quantum state.
   * @param other - Another quantum state to tensor with.
   */
  tensor(other: Q5mSystem): QubitState {
    if (!(other instanceof QubitState)) {
      throw new Error('Can only tensor QubitState with another QubitState');
    }

    const newNumQubits = this.numQuantum + other.numQuantum;
    const thisVector = this.amplitudes();
    const otherVector = other.amplitudes();
    const newStateVector = tensorP(thisVector, otherVector);
    return new QubitState(newNumQubits, newStateVector);
  }

  /**
   * Computes the fidelity between this state and another quantum state.
   * @param other - Another quantum state.
   * @returns Fidelity value between 0 and 1.
   */
  fidelity(other: Q5mSystem): number {
    if (!(other instanceof QubitState)) {
      throw new Error('Can only compute fidelity with another QubitState');
    }

    if (other.numQuantum !== this.numQuantum) {
      throw new Error(
        `Cannot compute fidelity between states with different dimensions: ${this.numQuantum} vs ${other.numQuantum} qubits`,
      );
    }

    const innerProduct = innerP(this.amplitudes(), other.amplitudes());
    return innerProduct.abs() ** 2;
  }

  /**
   * Calculates the trace distance between this quantum state and another.
   *
   * Trace distance is a metric for distinguishing quantum states, ranging from 0 to 1.
   * For pure states, D(|ψ⟩, |φ⟩) = √(1 - |⟨ψ|φ⟩|²)
   *
   * @param other - The other quantum state to compare with
   * @returns The trace distance between 0 (identical) and 1 (maximally different)
   * @throws {Error} If the states have different dimensions
   */
  traceDistance(other: QubitState): number {
    if (this.quantumCount() !== other.quantumCount()) {
      throw new Error(
        `Cannot calculate trace distance between states of different dimensions: ${this.quantumCount()} vs ${other.quantumCount()}`,
      );
    }

    const fid = this.fidelity(other);
    // Clamp fidelity to [0, 1] to avoid numerical issues
    const clampedFidelity = Math.max(0, Math.min(1, fid));
    return Math.sqrt(1 - clampedFidelity);
  }

  /**
   * Calculates the inner product (overlap) between this quantum state and another.
   *
   * The overlap ⟨ψ|φ⟩ is the complex inner product between two state vectors.
   *
   * @param other - The other quantum state to calculate overlap with
   * @returns The complex overlap value ⟨this|other⟩
   * @throws {Error} If the states have different dimensions
   *
   */
  overlap(other: QubitState): Complex {
    if (this.quantumCount() !== other.quantumCount()) {
      throw new Error(
        `Cannot calculate overlap between states of different dimensions: ${this.quantumCount()} vs ${other.quantumCount()}`,
      );
    }

    return innerP(this.amplitudes(), other.amplitudes());
  }

  /**
   * Checks if this quantum state is approximately equal to another.
   *
   * Two states are considered equal if their fidelity is sufficiently close to 1.
   *
   * @param other - The other quantum state to compare with
   * @param tolerance - The tolerance for comparison (default: 1e-10)
   * @returns True if the states are approximately equal
   *
   */
  isEqual(other: QubitState, tolerance: number = 1e-10): boolean {
    if (this.quantumCount() !== other.quantumCount()) {
      return false;
    }

    const fid = this.fidelity(other);
    return Math.abs(fid - 1) < tolerance;
  }

  /**
   * Returns a string representation of the quantum state.
   * @param precision - Decimal precision for amplitudes.
   * @param threshold - Minimum amplitude magnitude to display.
   */
  toString(precision: number = 3, threshold: number = 1e-10): string {
    const terms: string[] = [];
    const amplitudes = this.amplitudes(); // Get amplitudes in unified way

    for (let i = 0; i < amplitudes.length; i++) {
      const amp = amplitudes[i];
      if (amp && amp.abs() > threshold) {
        const bitString = i.toString(2).padStart(this.numQuantum, '0');
        const ampStr = formatAmplitude(amp, precision);
        terms.push(`${ampStr}|${bitString}⟩`);
      }
    }

    return terms.join(' + ') || '0';
  }

  /**
   * Calculates the purity of the quantum state.
   * For pure states (which QubitState represents), purity is always 1.
   */
  purity(): number {
    return 1.0;
  }

  /**
   * Checks if this quantum system represents a pure state.
   * QubitState always represents pure states, so this always returns true.
   */
  isPure(): boolean {
    return true;
  }

  /**
   * Computes the von Neumann entropy of the quantum state.
   * For pure states (which QubitState represents), the entropy is always 0.
   */
  entropy(): number {
    return 0.0;
  }

  /**
   * Creates a QubitState for the |0⟩ computational basis state.
   *
   * @returns New QubitState instance representing |0⟩
   */
  static zero(): QubitState {
    return new QubitState(1, [ONE, ZERO]);
  }

  /**
   * Creates a QubitState for the |1⟩ computational basis state.
   *
   * @returns New QubitState instance representing |1⟩
   */
  static one(): QubitState {
    return new QubitState(1, [ZERO, ONE]);
  }

  /**
   * Creates a QubitState for the |+⟩ Hadamard basis state.
   *
   * @returns New QubitState instance representing |+⟩
   */
  static plus(): QubitState {
    return new QubitState(1, normalizeAmplitudes([ONE, ONE]));
  }

  /**
   * Creates a QubitState for the |−⟩ Hadamard basis state.
   *
   * @returns New QubitState instance representing |−⟩
   */
  static minus(): QubitState {
    return new QubitState(1, normalizeAmplitudes([ONE, complex(-1, 0)]));
  }

  /**
   * Creates a QubitState from Bloch sphere angles.
   *
   * @param theta Polar angle (0 to π)
   * @param phi Azimuthal angle (0 to 2π)
   * @returns New QubitState instance corresponding to the specified angles
   */
  static fromAngle(theta: number, phi: number = 0): QubitState {
    const alpha = complex(Math.cos(theta / 2), 0);
    const beta = complex(Math.cos(phi) * Math.sin(theta / 2), Math.sin(phi) * Math.sin(theta / 2));
    return new QubitState(1, [alpha, beta]);
  }

  /**
   * Creates a QubitState from quantum amplitudes.
   *
   * @param alpha Quantum amplitude for |0⟩ state
   * @param beta Quantum amplitude for |1⟩ state
   * @returns New QubitState instance with the specified amplitudes (auto-normalized)
   */
  static fromAmplitudes(alpha: Amplitude, beta: Amplitude): QubitState {
    return new QubitState(1, normalizeAmplitudes([alpha, beta]));
  }

  /**
   * Performs a projective measurement on a single qubit in the computational basis.
   * This operation is stochastic and collapses the qubit's state to either |0⟩ or |1⟩.
   *
   * @returns The measurement outcome, either 0 or 1
   * @throws {Error} If this state is not a single-qubit state
   *
   */
  measure(): ZeroOne {
    if (this.numQuantum !== 1) {
      throw new Error(`Cannot measure single qubit from ${this.numQuantum}-qubit state`);
    }

    const stateVector = this.amplitudes();
    const prob0 = stateVector[0]!.abs() ** 2;
    const random = Math.random();

    if (random < prob0) {
      this.setAmplitude(0, ONE);
      this.setAmplitude(1, ZERO);
      return 0;
    } else {
      this.setAmplitude(0, ZERO);
      this.setAmplitude(1, ONE);
      return 1;
    }
  }

  /**
   * Sets the amplitude for a specific basis state (internal method).
   * This is used by measurement operations to collapse the state.
   *
   * @param basisIndex - Index of the basis state
   * @param amplitude - New amplitude value
   * @private
   */
  private setAmplitude(basisIndex: number, amplitude: Amplitude): void {
    this.invalidateAmplitudesCache();

    const state = this.getRepState();
    switch (state.rep) {
      case RepType.DENSE:
        if (state.stateVector[basisIndex] !== undefined) {
          state.stateVector[basisIndex] = amplitude;
        }
        break;

      case RepType.SPARSE:
        if (amplitude.abs() > 1e-15) {
          state.sparseAmplitudes.set(basisIndex, amplitude);
        } else {
          state.sparseAmplitudes.delete(basisIndex);
        }
        break;

      case RepType.CSR:
        throw new Error(
          'Direct amplitude modification in CSR format is not supported. Use applyUnitary for state changes.',
        );

      default:
        throw new Error(`Unhandled representation type in setAmplitude(): ${this.rep}`);
    }
  }
}

/**
 * Represents a quantum material specifically for qubit systems.
 *
 * Qubit extends Q5mMaterial and is specialized for storing quantum state vectors
 * (Amplitude[]) that represent pure qubit states. This class provides the material
 * representation layer for quantum computations.
 *
 * @category Core Classes
 *
 */
class Qubit extends Q5mMaterial<StateVector> {
  /**
   * Creates a new Qubit material instance.
   *
   * @param stateNum Number of quantum states (typically 2^n for n qubits)
   * @param stateVector Optional quantum state vector of complex amplitudes
   *
   */
  constructor(stateNum: number, stateVector?: StateVector) {
    super(stateNum, stateVector);
  }

  /**
   * Gets the quantum state vector.
   *
   * @returns The state vector containing quantum amplitudes
   */
  getStateVector(): StateVector {
    return this.getMaterial();
  }

  /**
   * Sets the quantum state vector.
   *
   * @param stateVector New state vector of quantum amplitudes
   */
  setStateVector(stateVector: StateVector): void {
    this.setMaterial(stateVector);
  }

  /**
   * Gets the quantum amplitude at a specific basis index.
   *
   * @param index The basis state index
   * @returns The quantum amplitude at the specified index
   */
  getAmplitude(index: number): Amplitude {
    const stateVector = this.getStateVector();
    return stateVector[index] || ZERO;
  }

  /**
   * Sets the quantum amplitude at a specific basis index.
   *
   * @param index The basis state index
   * @param amplitude The new quantum amplitude
   */
  setAmplitude(index: number, amplitude: Amplitude): void {
    const stateVector = this.getStateVector();
    if (index >= 0 && index < stateVector.length) {
      stateVector[index] = amplitude;
      this.setStateVector(stateVector);
    }
  }

  /**
   * Creates a QubitState for the |0⟩ computational basis state.
   *
   * @returns New QubitState instance representing |0⟩
   */
  static zero(): QubitState {
    const qubit = new Qubit(2, [ONE, ZERO]);
    return new QubitState(1, qubit.getStateVector(), false, qubit);
  }

  /**
   * Creates a QubitState for the |1⟩ computational basis state.
   *
   * @returns New QubitState instance representing |1⟩
   */
  static one(): QubitState {
    const qubit = new Qubit(2, [ZERO, ONE]);
    return new QubitState(1, qubit.getStateVector(), false, qubit);
  }

  /**
   * Creates a QubitState for the |+⟩ Hadamard basis state.
   *
   * @returns New QubitState instance representing |+⟩
   */
  static plus(): QubitState {
    const stateVector = normalizeAmplitudes([ONE, ONE]);
    const qubit = new Qubit(2, stateVector);
    return new QubitState(1, stateVector, false, qubit);
  }

  /**
   * Creates a QubitState for the |−⟩ Hadamard basis state.
   *
   * @returns New QubitState instance representing |−⟩
   */
  static minus(): QubitState {
    const stateVector = normalizeAmplitudes([ONE, complex(-1, 0)]);
    const qubit = new Qubit(2, stateVector);
    return new QubitState(1, stateVector, false, qubit);
  }

  /**
   * Creates a QubitState from Bloch sphere angles.
   *
   * @param theta Polar angle (0 to π)
   * @param phi Azimuthal angle (0 to 2π)
   * @returns New QubitState instance corresponding to the specified angles
   */
  static fromAngle(theta: number, phi: number = 0): QubitState {
    const alpha = complex(Math.cos(theta / 2), 0);
    const beta = complex(Math.cos(phi) * Math.sin(theta / 2), Math.sin(phi) * Math.sin(theta / 2));
    const stateVector = [alpha, beta];
    const qubit = new Qubit(2, stateVector);
    return new QubitState(1, stateVector, false, qubit);
  }

  /**
   * Creates a QubitState from quantum amplitudes.
   *
   * @param alpha Quantum amplitude for |0⟩ state
   * @param beta Quantum amplitude for |1⟩ state
   * @returns New QubitState instance with the specified amplitudes (auto-normalized)
   */
  static fromAmplitudes(alpha: Amplitude, beta: Amplitude): QubitState {
    const stateVector = normalizeAmplitudes([alpha, beta]);
    const qubit = new Qubit(2, stateVector);
    return new QubitState(1, stateVector, false, qubit);
  }

  // === Quantum State Fidelity & Comparison Methods ===
}

export { isQubitState, isValidQubitIndex, QubitState, Qubit };
export type { QubitIndex };
