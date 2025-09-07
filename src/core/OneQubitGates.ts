// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @fileoverview Single-qubit quantum gates.
 * Includes Pauli, Hadamard, Phase, and Rotation gates.
 */

import { Q5mGate } from './Q5mGate';
import { Q5mOperator, UnitaryOperator } from './Q5mOperator';
import type { Complex } from '../math/complex';
import { ONE, ZERO } from '../math/complex';
import { create2x2Unitary, type Unitary, dagger } from '../math/math-utils';

/**
 * Hadamard gate - creates superposition. H = (1/√2) * [1 1; 1 -1]
 * @category Single Qubit Gates
 */
class HadamardGate extends Q5mGate {
  readonly name = 'H';
  readonly matrix: Unitary = UnitaryOperator.Hadamard(2).getMatrix();
}

/**
 * Pauli-X gate - bit flip. X = [0 1; 1 0]
 * @category Single Qubit Gates
 */
class PauliXGate extends Q5mGate {
  readonly name = 'X';
  readonly matrix: Unitary = Q5mOperator.pauliX().getMatrix();
}

/**
 * Pauli-Y gate - bit flip with phase.
 * Y = [0 -i; i 0]
 */
class PauliYGate extends Q5mGate {
  readonly name = 'Y';
  readonly matrix: Unitary = Q5mOperator.pauliY().getMatrix();
}

/**
 * Pauli-Z gate - phase flip. Z = [1 0; 0 -1]
 * @category Single Qubit Gates
 */
class PauliZGate extends Q5mGate {
  readonly name = 'Z';
  readonly matrix: Unitary = Q5mOperator.pauliZ().getMatrix();
}

/**
 * S gate - 90° phase rotation. S = [1 0; 0 i]
 * @category Single Qubit Gates
 */
class SGate extends Q5mGate {
  readonly name = 'S';
  readonly matrix: Unitary = Q5mOperator.phaseGate(Math.PI / 2).getMatrix();
}

/**
 * T gate - 45° phase rotation. T = [1 0; 0 e^(iπ/4)]
 * @category Single Qubit Gates
 */
class TGate extends Q5mGate {
  readonly name = 'T';
  readonly matrix: Unitary = Q5mOperator.phaseGate(Math.PI / 4).getMatrix();
}

/**
 * T-dagger gate - inverse of T gate. T† = [1 0; 0 e^(-iπ/4)]
 * Computed as the dagger (conjugate transpose) of the T gate matrix.
 * @category Single Qubit Gates
 */
class TdgGate extends Q5mGate {
  readonly name = 'Tdg';
  readonly matrix: Unitary = dagger(new TGate().matrix);
}

/**
 * S-dagger gate - inverse of S gate. S† = [1 0; 0 -i]
 * Computed as the dagger (conjugate transpose) of the S gate matrix.
 * @category Single Qubit Gates
 */
class SdgGate extends Q5mGate {
  readonly name = 'Sdg';
  readonly matrix: Unitary = dagger(new SGate().matrix);
}

/**
 * Identity gate - no operation. I = [1 0; 0 1]
 * @category Single Qubit Gates
 */
class IdentityGate extends Q5mGate {
  readonly name = 'I';
  readonly matrix: Unitary = [
    [ONE, ZERO],
    [ZERO, ONE],
  ];
}

/**
 * Phase gate - adds phase. P(φ) = [1 0; 0 e^iφ]
 * @category Single Qubit Gates
 */
class PhaseGate extends Q5mGate {
  readonly name: string;
  readonly matrix: Unitary;

  /**
   * Creates a new Phase gate with the specified phase angle.
   *
   * @param phi - Phase angle in radians to apply to |1⟩ state
   */
  constructor(phi: number) {
    super();
    this.name = `P(${phi.toFixed(3)})`;
    this.matrix = Q5mOperator.phaseGate(phi).getMatrix();
  }
}

/**
 * X-axis rotation gate. RX(θ) = [cos(θ/2) -i·sin(θ/2); -i·sin(θ/2) cos(θ/2)]
 * @category Single Qubit Gates
 */
class RotationXGate extends Q5mGate {
  readonly name: string;
  readonly matrix: Unitary;

  /**
   * Creates a new X-rotation gate with the specified angle.
   *
   * @param theta - Rotation angle in radians around X-axis
   */
  constructor(theta: number) {
    super();
    this.name = `RX(${theta.toFixed(3)})`;
    this.matrix = Q5mOperator.rotationX(theta).getMatrix();
  }
}

/**
 * Y-axis rotation gate. RY(θ) = [cos(θ/2) -sin(θ/2); sin(θ/2) cos(θ/2)]
 * @category Single Qubit Gates
 */
class RotationYGate extends Q5mGate {
  readonly name: string;
  readonly matrix: Unitary;

  /**
   * Creates a new Y-rotation gate with the specified angle.
   *
   * @param theta - Rotation angle in radians around Y-axis
   */
  constructor(theta: number) {
    super();
    this.name = `RY(${theta.toFixed(3)})`;
    this.matrix = Q5mOperator.rotationY(theta).getMatrix();
  }
}

/**
 * Z-axis rotation gate. RZ(θ) = [e^(-iθ/2) 0; 0 e^(iθ/2)]
 * @category Single Qubit Gates
 */
class RotationZGate extends Q5mGate {
  readonly name: string;
  readonly matrix: Unitary;

  /**
   * Creates a new Z-rotation gate with the specified angle.
   *
   * @param theta - Rotation angle in radians around Z-axis
   */
  constructor(theta: number) {
    super();
    this.name = `RZ(${theta.toFixed(3)})`;
    this.matrix = Q5mOperator.rotationZ(theta).getMatrix();
  }
}

/**
 * Arbitrary unitary gate - custom single-qubit gates. U = e^(iθ) * [α -β*; β α*]
 * @category Single Qubit Gates
 */
class UnitaryGate extends Q5mGate {
  readonly name: string;
  readonly matrix: Unitary;
  private normalizedAlpha: Complex;
  private normalizedBeta: Complex;
  private readonly globalPhase: number;

  constructor(name: string, alpha: Complex, beta: Complex, theta?: number) {
    super();

    const actualTheta = theta ?? 0;
    const { matrix, normalizedAlpha, normalizedBeta } = create2x2Unitary(alpha, beta, actualTheta);

    this.matrix = matrix;
    this.normalizedAlpha = normalizedAlpha;
    this.normalizedBeta = normalizedBeta;
    this.globalPhase = actualTheta;

    if (name && name.trim() !== '') {
      this.name = name;
    } else {
      const alphaStr = `${normalizedAlpha.re.toFixed(3)}${normalizedAlpha.im >= 0 ? '+' : ''}${normalizedAlpha.im.toFixed(3)}i`;
      const betaStr = `${normalizedBeta.re.toFixed(3)}${normalizedBeta.im >= 0 ? '+' : ''}${normalizedBeta.im.toFixed(3)}i`;
      const phaseStr = actualTheta !== 0 ? `,θ=${actualTheta.toFixed(3)}` : '';
      this.name = `U(${alphaStr},${betaStr}${phaseStr})`;
    }
  }

  /**
   * Static factory method to create a unitary gate that transforms |0⟩ to the specified state.
   *
   * @param name Custom name for the gate
   * @param alpha Amplitude for |0⟩ component
   * @param beta Amplitude for |1⟩ component
   * @param theta Global phase angle in radians (optional, default: 0)
   * @returns A UnitaryGate that maps |0⟩ → α|0⟩ + β|1⟩ (normalized) with global phase
   */
  static fromState(name: string, alpha: Complex, beta: Complex, theta?: number): UnitaryGate {
    return new UnitaryGate(name, alpha, beta, theta);
  }

  /**
   * Get the normalized amplitudes used in this gate.
   */
  getAmplitudes(): { alpha: Complex; beta: Complex } {
    return {
      alpha: this.normalizedAlpha,
      beta: this.normalizedBeta,
    };
  }

  /**
   * Get the global phase angle of this gate.
   */
  getGlobalPhase(): number {
    return this.globalPhase;
  }
}

const H = new HadamardGate();
const X = new PauliXGate();
const Y = new PauliYGate();
const Z = new PauliZGate();
const S = new SGate();
const T = new TGate();
const Tdg = new TdgGate();
const Sdg = new SdgGate();
const Identity = new IdentityGate();

const PH = (phi: number): PhaseGate => new PhaseGate(phi);
const RX = (theta: number): RotationXGate => new RotationXGate(theta);
const RY = (theta: number): RotationYGate => new RotationYGate(theta);
const RZ = (theta: number): RotationZGate => new RotationZGate(theta);

export {
  HadamardGate,
  PauliXGate,
  PauliYGate,
  PauliZGate,
  SGate,
  TGate,
  TdgGate,
  SdgGate,
  IdentityGate,
  PhaseGate,
  RotationXGate,
  RotationYGate,
  RotationZGate,
  UnitaryGate,
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
};
