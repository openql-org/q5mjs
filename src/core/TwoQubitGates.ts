// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @fileoverview Two-qubit quantum gates for the q5m.js framework.
 *
 * This module provides essential two-qubit quantum gates that enable entanglement
 * and complex quantum correlations:
 *
 * - **CNOT Gate**: Fundamental controlled-NOT for entanglement creation
 * - **Controlled Gates**: CZ, CY, CH for various controlled operations
 * - **SWAP Gate**: Exchange quantum states between qubits
 * - **Controlled Phase**: CP for phase relationships between qubits
 * - **Controlled Unitary**: Custom controlled transformations
 *
 * Two-qubit gates operate on 4×4 unitary matrices representing the 4-dimensional
 * Hilbert space of two qubits (|00⟩, |01⟩, |10⟩, |11⟩ basis states).
 *
 * @author OpenQL Project
 * @version 0.1.0
 * @since 2025
 */

import { Q5mGate } from './Q5mGate';
import { Q5mOperator, UnitaryOperator } from './Q5mOperator';
import type { Complex } from '../math/complex';
import { complex } from '../math/complex';
import { create2x2Unitary, type Unitary } from '../math/math-utils';
import type { Q5mIndex } from './Q5mMaterial';

/**
 * CNOT Gate (Controlled-NOT) - the fundamental two-qubit gate for entanglement creation.
 *
 * The CNOT gate performs a controlled NOT operation: it flips the target qubit if and only if
 * the control qubit is in state |1⟩. This gate is universal for quantum computing when
 * combined with arbitrary single-qubit gates.
 *
 * **Matrix Representation (|00⟩, |01⟩, |10⟩, |11⟩ basis):**
 * ```
 * CNOT = [1 0 0 0]
 *        [0 1 0 0]
 *        [0 0 0 1]
 *        [0 0 1 0]
 * ```
 *
 * **Transformations:**
 * - |00⟩ → |00⟩ (control=0: no change)
 * - |01⟩ → |01⟩ (control=0: no change)
 * - |10⟩ → |11⟩ (control=1: flip target)
 * - |11⟩ → |10⟩ (control=1: flip target)
 *
 * **Key Properties:**
 * - Creates Bell states from product states
 * - Self-inverse: CNOT² = I
 * - Universal gate (with single-qubit gates)
 * - Preserves computational basis when control=0
 *
 * @category Two Qubit Gates
 *
 *
 */
class CNOTGate extends Q5mGate {
  readonly name = 'CNOT';
  readonly matrix: Unitary = UnitaryOperator.controlled(Q5mOperator.pauliX()).getMatrix();
}

/**
 * Controlled-Z Gate - applies phase flip when both qubits are |1⟩.
 *
 * The CZ gate applies a phase flip (-1 factor) to the |11⟩ state while leaving all
 * other computational basis states unchanged. Unlike CNOT, CZ is symmetric with
 * respect to control and target qubits.
 *
 * **Matrix Representation:**
 * ```
 * CZ = [1  0  0  0]
 *      [0  1  0  0]
 *      [0  0  1  0]
 *      [0  0  0 -1]
 * ```
 *
 * **Transformations:**
 * - |00⟩ → |00⟩ (no change)
 * - |01⟩ → |01⟩ (no change)
 * - |10⟩ → |10⟩ (no change)
 * - |11⟩ → -|11⟩ (phase flip)
 *
 * **Properties:**
 * - Symmetric: CZ₀₁ = CZ₁₀
 * - Self-inverse: CZ² = I
 * - Diagonal in computational basis
 * - Equivalent to CNOT in Hadamard basis
 *
 * @category Two Qubit Gates
 *
 */
class ControlledZGate extends Q5mGate {
  readonly name = 'CZ';
  readonly matrix: Unitary = UnitaryOperator.controlled(Q5mOperator.pauliZ()).getMatrix();
}

/**
 * Controlled-Y Gate - applies Pauli-Y to target when control is |1⟩.
 *
 * The CY gate applies a Pauli-Y transformation (bit flip with imaginary phase)
 * to the target qubit when the control qubit is |1⟩. It combines the effects
 * of controlled bit flip and controlled phase flip.
 *
 * **Matrix Representation:**
 * ```
 * CY = [1  0  0   0]
 *      [0  1  0   0]
 *      [0  0  0  -i]
 *      [0  0  i   0]
 * ```
 *
 * **Transformations:**
 * - |00⟩ → |00⟩ (control=0: no change)
 * - |01⟩ → |01⟩ (control=0: no change)
 * - |10⟩ → -i|11⟩ (control=1: apply Y to target)
 * - |11⟩ → i|10⟩ (control=1: apply Y to target)
 *
 * **Properties:**
 * - Related to CNOT: CY = S†₁ · CNOT · S₁
 * - Not symmetric (unlike CZ)
 * - Part of universal gate set
 *
 * @category Two Qubit Gates
 *
 */
class ControlledYGate extends Q5mGate {
  readonly name = 'CY';
  readonly matrix: Unitary = UnitaryOperator.controlled(Q5mOperator.pauliY()).getMatrix();
}

/**
 * SWAP Gate - exchanges the quantum states of two qubits.
 *
 * The SWAP gate exchanges the quantum states of two qubits, effectively
 * swapping their information. This is essential for quantum algorithms
 * that require moving quantum information between different qubit positions.
 *
 * **Matrix Representation:**
 * ```
 * SWAP = [1 0 0 0]
 *        [0 0 1 0]
 *        [0 1 0 0]
 *        [0 0 0 1]
 * ```
 *
 * **Transformations:**
 * - |00⟩ → |00⟩ (no change)
 * - |01⟩ → |10⟩ (swap qubits)
 * - |10⟩ → |01⟩ (swap qubits)
 * - |11⟩ → |11⟩ (no change)
 *
 * **Properties:**
 * - Self-inverse: SWAP² = I
 * - Symmetric: SWAP₀₁ = SWAP₁₀
 * - Can be decomposed into 3 CNOT gates
 * - Preserves entanglement structure
 *
 * @category Two Qubit Gates
 *
 */
class SWAPGate extends Q5mGate {
  readonly name = 'SWAP';
  readonly matrix: Unitary = Q5mOperator.swap().getMatrix();
}

/**
 * Controlled Hadamard Gate - applies Hadamard to target when control is |1⟩
 *
 * Matrix representation in computational basis |00⟩, |01⟩, |10⟩, |11⟩:
 * |00⟩ → |00⟩
 * |01⟩ → |01⟩
 * |10⟩ → (|10⟩ + |11⟩)/√2
 * |11⟩ → (|10⟩ - |11⟩)/√2
 */
class ControlledHadamardGate extends Q5mGate {
  readonly name = 'CH';
  readonly matrix: Unitary = UnitaryOperator.controlled(UnitaryOperator.Hadamard(2)).getMatrix();
}

/**
 * Controlled Phase Gate - applies arbitrary phase when both qubits are |1⟩.
 *
 * The CP(φ) gate applies a phase e^(iφ) to the |11⟩ state while leaving all
 * other computational basis states unchanged. It generalizes the CZ gate to
 * arbitrary phase angles and is fundamental in quantum algorithms like QFT.
 *
 * **Matrix Representation:**
 * ```
 * CP(φ) = [1  0  0    0   ]
 *         [0  1  0    0   ]
 *         [0  0  1    0   ]
 *         [0  0  0  e^(iφ)]
 * ```
 *
 * **Transformations:**
 * - |00⟩ → |00⟩ (no change)
 * - |01⟩ → |01⟩ (no change)
 * - |10⟩ → |10⟩ (no change)
 * - |11⟩ → e^(iφ)|11⟩ (phase applied)
 *
 * **Special Cases:**
 * - CP(0) = I (identity)
 * - CP(π) = CZ (controlled-Z)
 * - CP(π/2) = CS (controlled-S)
 * - CP(π/4) = CT (controlled-T)
 *
 * @category Two Qubit Gates
 *
 */
class ControlledPhaseGate extends Q5mGate {
  readonly name: string;
  readonly matrix: Unitary;

  /**
   * Creates a new Controlled Phase gate with specified phase angle.
   *
   * @param phi - Phase angle in radians to apply to |11⟩ state
   */
  constructor(phi: number) {
    super();
    this.name = `CP(${phi.toFixed(3)})`;
    this.matrix = UnitaryOperator.controlled(Q5mOperator.phaseGate(phi)).getMatrix();
  }
}

/**
 * Controlled Unitary Gate - applies a unitary transformation to target when control is |1⟩
 *
 * This gate is constructed from two quantum amplitudes α and β, just like UnitaryGate,
 * but applies the transformation only when the control qubit is |1⟩.
 *
 * The unitary matrix is constructed from normalized α,β as:
 * U = [α  -β*]
 *     [β   α*]
 *
 * Matrix representation in computational basis |00⟩, |01⟩, |10⟩, |11⟩:
 * [1  0  0   0 ]   |00⟩ → |00⟩
 * [0  1  0   0 ]   |01⟩ → |01⟩
 * [0  0  α  -β*]   |10⟩ → α|10⟩ - β*|11⟩
 * [0  0  β   α*]   |11⟩ → β|10⟩ + α*|11⟩
 *
 * Where α and β are automatically normalized to ensure |α|² + |β|² = 1.
 */
class ControlledUnitaryGate extends Q5mGate {
  readonly name: string;
  readonly matrix: Unitary;
  private alpha: Complex;
  private beta: Complex;
  private readonly globalPhase: number;

  constructor(name: string, alpha: Complex, beta: Complex, theta?: number) {
    super();

    const actualTheta = theta ?? 0;
    const {
      matrix: unitaryMatrix,
      normalizedAlpha,
      normalizedBeta,
    } = create2x2Unitary(alpha, beta, actualTheta);

    this.alpha = normalizedAlpha;
    this.beta = normalizedBeta;
    this.globalPhase = actualTheta;

    if (name && name.trim() !== '') {
      this.name = name;
    } else {
      const alphaStr = `${normalizedAlpha.re.toFixed(3)}${normalizedAlpha.im >= 0 ? '+' : ''}${normalizedAlpha.im.toFixed(3)}i`;
      const betaStr = `${normalizedBeta.re.toFixed(3)}${normalizedBeta.im >= 0 ? '+' : ''}${normalizedBeta.im.toFixed(3)}i`;
      const phaseStr = actualTheta !== 0 ? `,θ=${actualTheta.toFixed(3)}` : '';
      this.name = `CU(${alphaStr},${betaStr}${phaseStr})`;
    }

    const unitaryOperator = UnitaryOperator.fromUnitaryMatrix(unitaryMatrix);
    this.matrix = UnitaryOperator.controlled(unitaryOperator).getMatrix();
  }

  /**
   * Get the normalized amplitudes used in this gate.
   */
  getAmplitudes(): { alpha: Complex; beta: Complex } {
    return {
      alpha: this.alpha,
      beta: this.beta,
    };
  }

  /**
   * Get the global phase angle of this gate.
   */
  getGlobalPhase(): number {
    return this.globalPhase;
  }

  /**
   * Get the underlying 2x2 unitary matrix that is applied when control is |1⟩
   */
  getUnitaryMatrix(): Unitary {
    const { matrix } = create2x2Unitary(this.alpha, this.beta, this.globalPhase);
    return matrix;
  }

  /**
   * Create a controlled version of any single-qubit gate
   */
  static fromGate(gate: Q5mGate, name?: string): ControlledUnitaryGate {
    if (gate.matrix.length !== 2 || gate.matrix[0]?.length !== 2) {
      throw new Error('Can only create controlled version of single-qubit gates (2x2 matrix)');
    }

    const alpha = gate.matrix[0][0]!;
    const beta = gate.matrix[1]![0]!;

    const gateName = name || `C${gate.name}`;
    return new ControlledUnitaryGate(gateName, alpha, beta);
  }

  /**
   * Static factory method to create a controlled unitary gate that transforms |10⟩ to the specified state.
   *
   * @param name Custom name for the gate
   * @param alpha Amplitude for |10⟩ component when control is |1⟩
   * @param beta Amplitude for |11⟩ component when control is |1⟩
   * @param theta Global phase angle in radians (optional, default: 0)
   * @returns A ControlledUnitaryGate that maps |10⟩ → α|10⟩ + β|11⟩ when control is |1⟩
   */
  static fromState(
    name: string,
    alpha: Complex,
    beta: Complex,
    theta?: number,
  ): ControlledUnitaryGate {
    return new ControlledUnitaryGate(name, alpha, beta, theta);
  }

  /**
   * Create controlled unitary from matrix elements
   */
  static fromElements(
    name: string,
    u00: Complex,
    _u01: Complex,
    u10: Complex,
    _u11: Complex,
    theta?: number,
  ): ControlledUnitaryGate {
    return new ControlledUnitaryGate(name, u00, u10, theta);
  }

  /**
   * Create controlled rotation around arbitrary axis
   */
  static fromRotation(
    name: string,
    rotAngle: number,
    nx: number,
    ny: number,
    nz: number,
    globalPhase?: number,
  ): ControlledUnitaryGate {
    const norm = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (norm === 0) {
      throw new Error('Rotation axis cannot be zero vector');
    }

    nx /= norm;
    ny /= norm;
    nz /= norm;

    const cosHalf = Math.cos(rotAngle / 2);
    const sinHalf = Math.sin(rotAngle / 2);

    const alpha = complex(cosHalf, -sinHalf * nz);
    const beta = complex(sinHalf * ny, -sinHalf * nx);

    return new ControlledUnitaryGate(name || 'CU', alpha, beta, globalPhase);
  }
}

const CNOT = new CNOTGate();
const CX = CNOT;
const CZ = new ControlledZGate();
const CY = new ControlledYGate();
const CH = new ControlledHadamardGate();
const SWAP = new SWAPGate();

const CP = (phase: number): ControlledPhaseGate => new ControlledPhaseGate(phase);

const CU = (name: string, alpha: Complex, beta: Complex, theta?: number): ControlledUnitaryGate =>
  new ControlledUnitaryGate(name, alpha, beta, theta);

interface CircuitControlledMethods {
  cu(
    control: Q5mIndex,
    target: Q5mIndex,
    name: string,
    alpha: Complex,
    beta: Complex,
    theta?: number,
  ): this;
  controlledGate(control: Q5mIndex, target: Q5mIndex, unitaryGate: Q5mGate, name?: string): this;
}

export type { CircuitControlledMethods };
export {
  CNOTGate,
  ControlledZGate,
  ControlledYGate,
  SWAPGate,
  ControlledHadamardGate,
  ControlledPhaseGate,
  ControlledUnitaryGate,
  CNOT,
  CX,
  CZ,
  CY,
  CH,
  SWAP,
  CP,
  CU,
};
