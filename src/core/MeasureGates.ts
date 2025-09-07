// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Quantum measurement gates implementation.
 * @description Provides measurement gates for different quantum bases including Z (computational), X (Hadamard), Y (circular), and arbitrary phase measurements.
 * @packageDocumentation
 */
import { Q5mGate } from './Q5mGate';
import { complex, ONE, ZERO } from '../math/complex';
import type { BasisOperator, Probability, MeasurementResult, Q5mMeasurable } from './Q5mObserver';
import { Q5mObserver } from './Q5mObserver';
import type { Q5mIndex } from './Q5mMaterial';
import type { Q5mState } from './Q5mState';
import type { Unitary, Hermitian } from '../math/math-utils';
import { createHermitian } from '../math/math-utils';

/** Enumeration of quantum measurement basis types. */
enum BasisType {
  Z = 'Z',
  X = 'X',
  Y = 'Y',
  ARBITRARY = 'ARBITRARY',
}

/** Base measurement gate */
abstract class MeasureGate extends Q5mGate implements Q5mMeasurable {
  abstract readonly basis: BasisType;
  abstract readonly basisName: string;
  readonly matrix: Unitary = [
    [ONE, ZERO],
    [ZERO, ONE],
  ];

  measure = (s: Q5mState, i: Q5mIndex): MeasurementResult =>
    Q5mObserver.measure(s, i, this.basisName);
  probabilities = (s: Q5mState, i: Q5mIndex): { prob0: Probability; prob1: Probability } =>
    Q5mObserver.probabilities(s, i, this.basisName);
  clearCache = (): void => {}; // Engine handles caching
}

/** Measurement gate for computational (Z) basis. */
class MeasureZGate extends MeasureGate {
  readonly name = 'Mz';
  readonly basis = BasisType.Z;
  readonly basisName = 'computational';
}

/** Measurement gate for Hadamard (X) basis. */
class MeasureXGate extends MeasureGate {
  readonly name = 'Mx';
  readonly basis = BasisType.X;
  readonly basisName = 'hadamard';
}

/** Measurement gate for circular (Y) basis. */
class MeasureYGate extends MeasureGate {
  readonly name = 'My';
  readonly basis = BasisType.Y;
  readonly basisName = 'circular';
}

/** Arbitrary phase measurement */
class MeasurePhaseGate extends MeasureGate {
  readonly name: string;
  readonly basis = BasisType.ARBITRARY;
  readonly basisName: string;
  readonly matrix: Unitary = [
    [ONE, ZERO],
    [ZERO, ONE],
  ];

  constructor(
    private theta: number,
    private phi: number,
    name?: string,
  ) {
    super();
    this.name = name ?? `Mp(θ=${theta.toFixed(3)},φ=${phi.toFixed(3)})`;
    this.basisName = `arbitrary_${theta.toFixed(3)}_${phi.toFixed(3)}`;
    this.ensureRegistered();
  }

  private ensureRegistered(): void {
    if (!Q5mObserver.getBasis(this.basisName)) {
      const basis: BasisOperator = {
        projectors: () => this.createProjectors(),
      };
      Q5mObserver.registerBasis(this.basisName, basis);
    }
  }

  getAngles = (): { theta: number; phi: number } => ({ theta: this.theta, phi: this.phi });

  measure = (s: Q5mState, i: Q5mIndex): MeasurementResult =>
    Math.abs(this.theta) < 1e-10 && Math.abs(this.phi) < 1e-10
      ? Q5mObserver.measure(s, i, 'computational')
      : Q5mObserver.measure(s, i, this.basisName);

  private createProjectors(): { P0: Hermitian; P1: Hermitian } {
    const [c, s] = [Math.cos(this.theta / 2), Math.sin(this.theta / 2)];
    const [eip, eim] = [
      complex(Math.cos(this.phi), Math.sin(this.phi)),
      complex(Math.cos(-this.phi), Math.sin(-this.phi)),
    ];
    const [s00, s01] = [complex(c), eip.mul(complex(s))];
    const [s10, s11] = [eim.mul(complex(s)), complex(-c)];
    return {
      P0: createHermitian([
        [s00.mul(s00.conjugate()), s00.mul(s01.conjugate())],
        [s01.mul(s00.conjugate()), s01.mul(s01.conjugate())],
      ]),
      P1: createHermitian([
        [s10.mul(s10.conjugate()), s10.mul(s11.conjugate())],
        [s11.mul(s10.conjugate()), s11.mul(s11.conjugate())],
      ]),
    };
  }
}

/** Creates a computational basis (Z) measurement gate. */
const Mz = (): MeasureZGate => new MeasureZGate();

/** Creates a Hadamard basis (X) measurement gate. */
const Mx = (): MeasureXGate => new MeasureXGate();

/** Creates a circular basis (Y) measurement gate. */
const My = (): MeasureYGate => new MeasureYGate();

/**
 * Creates an arbitrary phase measurement gate.
 * @param theta - Polar angle in radians.
 * @param phi - Azimuthal angle in radians.
 * @param name - Optional custom name for the measurement basis.
 */
const Mp = (theta: number, phi: number, name?: string): MeasurePhaseGate =>
  new MeasurePhaseGate(theta, phi, name);

/** Union type for all measurement gate types. */
type MeasureGateType = MeasureZGate | MeasureXGate | MeasureYGate | MeasurePhaseGate;

export { BasisOperator, MeasureGate, MeasureZGate, MeasureXGate, MeasureYGate, MeasurePhaseGate };
export { Mz, Mx, My, Mp };
export type { MeasureGateType };
