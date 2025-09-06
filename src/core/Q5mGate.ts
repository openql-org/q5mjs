// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @fileoverview Core quantum gate interface and abstract base class.
 *
 * This module defines the fundamental architecture for quantum gates in the q5m.js
 * quantum computing framework. It provides:
 *
 * - **Gate Interface**: Basic contract for all quantum gates.
 * - **Q5mGate Abstract Class**: Common implementation with matrix operations.
 * - **Type Safety**: Rigorous validation and error handling.
 * - **Quantum Mechanics**: Proper unitary transformations and state evolution.
 *
 * All quantum gates in q5m.js extend from these base definitions, ensuring
 * consistency, type safety, and adherence to quantum mechanical principles.
 *
 * @author OpenQL Project
 * @version 0.1.0
 * @since 2025
 */

import { matXvec, type Unitary } from '../math/math-utils';
import type { Q5mState } from './Q5mState';
import { Q5mOperator } from './Q5mOperator';
import type { Amplitude } from '../math/math-utils';

/**
 * Abstract base class for all quantum gates in the q5m.js framework.
 *
 * This class defines the essential contract that all quantum gates must follow,
 * providing a unified way to represent and manipulate quantum operations.
 * Every gate is characterized by its name, unitary matrix representation,
 * and methods for applying transformations to quantum states.
 *
 * The class is specifically designed for quantum state transformations,
 * focusing on pure quantum states represented as state vectors in Hilbert space.
 * This provides type safety and performance optimizations for state-vector-based
 * quantum computations.
 *
 * The class enforces quantum mechanical constraints by validating dimensions
 * and using mathematically rigorous operations.
 *
 * @category Core Classes
 *
 */
abstract class Q5mGate {
  /**
   * Human-readable name of the quantum gate (e.g., "H", "CNOT", "RZ").
   * This name is used for debugging, logging, and circuit visualization.
   * It should be a concise and descriptive identifier for the gate's operation.
   * Must be implemented by all concrete gate subclasses.
   */
  abstract readonly name: string;

  /**
   * Unitary matrix representation of the quantum gate.
   * This matrix defines how the gate transforms quantum states according to the
   * Schrödinger equation's evolution: |ψ'⟩ = U|ψ⟩.
   * The matrix must be square and unitary (U†U = I) to ensure valid,
   * reversible quantum operations that conserve probability.
   * Must be implemented by all concrete gate subclasses.
   *
   */
  abstract readonly matrix: Unitary;

  /**
   * Dimension of the gate's matrix, which corresponds to the number of basis
   * states in the Hilbert space it acts upon. For a gate acting on n qubits,
   * the size is 2^n.
   *
   * This property is computed dynamically from the matrix dimensions,
   * ensuring that the reported size is always consistent with the matrix.
   *
   *
   * @returns The number of rows (which equals the number of columns) in the gate matrix.
   */
  get size(): number {
    return this.matrix.length;
  }

  /**
   * Applies this quantum gate to a quantum state.
   *
   * This is the primary, high-level method for quantum gate application.
   * It transforms pure quantum states represented as state vectors through
   * unitary matrix operations, ensuring proper quantum mechanical evolution.
   *
   * The method creates a Q5mOperator from the gate's matrix and applies
   * it to the quantum state using the state's apply() method.
   *
   * This ensures proper quantum mechanical evolution while maintaining
   * type safety and performance optimizations specific to state vectors.
   * The complexity of this operation depends on the state's representation
   * (dense or sparse) but is generally `O(2^n)` for an n-qubit gate on an n-qubit state.
   *
   * @param state The quantum state to be transformed. Its dimension must match the gate's size.
   * @returns The transformed quantum state after the gate has been applied.
   * @throws {Error} If the state's dimension does not match the gate's requirements.
   *
   */
  applyTo(state: Q5mState): Q5mState {
    if (state.quantumCount() !== Math.log2(this.size)) {
      throw new Error(
        `Quantum state dimension ${Math.pow(2, state.quantumCount())} does not match gate size ${this.size}`,
      );
    }

    const unitaryOp = new Q5mOperator<Unitary>(this.matrix, this.name, true);
    return state.apply(unitaryOp);
  }

  /**
   * Applies this quantum gate directly to a state vector representation of a quantum state.
   *
   * This method provides low-level access for direct state vector manipulation,
   * performing the matrix-vector multiplication U|ψ⟩. It is primarily used
   * internally by simulators and for compatibility with legacy code that operates
   * directly on arrays of complex numbers.
   *
   * This method performs the fundamental quantum gate operation by multiplying
   * the gate's unitary matrix with the input state vector. It validates that
   * the state vector has the correct dimension before applying the transformation.
   * The complexity of this operation is `O(N^2)` where N is the size of the state vector.
   *
   * This is the core mathematical operation underlying all quantum gate applications.
   * The operation preserves fundamental quantum mechanical properties:
   * - **Unitarity**: ||U|ψ⟩|| = ||ψ⟩|| (The norm of the state is preserved).
   * - **Reversibility**: All quantum gate operations are reversible (U⁻¹ = U†).
   * - **Linearity**: U(α|ψ₁⟩ + β|ψ₂⟩) = αU|ψ₁⟩ + βU|ψ₂⟩.
   *
   * @param stateVector The quantum state vector (an array of quantum amplitudes) to transform.
   * @returns The transformed state vector after gate application.
   * @throws {Error} If the state vector's dimension does not match the gate's size.
   *
   */
  applyToStateVector(stateVector: Amplitude[]): Amplitude[] {
    if (stateVector.length !== this.size) {
      throw new Error(
        `State vector size ${stateVector.length} does not match gate size ${this.size}`,
      );
    }

    return matXvec(this.matrix, stateVector);
  }

  /**
   * Returns a string representation of this quantum gate.
   *
   * The string representation uses the gate's `name` property, making it
   * useful for debugging, logging, circuit visualization, and serialization.
   *
   * @returns The gate's name as a string.
   *
   */
  toString(): string {
    return this.name;
  }
}

export { Q5mGate };
