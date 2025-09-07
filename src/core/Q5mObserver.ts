// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import type { Q5mState } from './Q5mState';
import type { Q5mIndex, StateVector } from './Q5mMaterial';
import { validateQ5mIndex } from './Q5mMaterial';
import { complex, ZERO, type Complex } from '../math/complex';
import { normalizeAmplitudes, createHermitian, type Hermitian } from '../math/math-utils';
import { type Probability, type ZeroOne, type MeasurementResult } from './Results';

/** Lightweight measurement basis */
interface BasisOperator {
  readonly projectors: () => { P0: Hermitian; P1: Hermitian };
  readonly measurementLogic?: (state: Q5mState, index: Q5mIndex) => MeasurementResult;
  readonly probabilityLogic?: (
    state: Q5mState,
    index: Q5mIndex,
  ) => { prob0: Probability; prob1: Probability };
}

/** Unified Quantum Observer for measurement operations */
class Q5mObserver {
  private static readonly basis = new Map<string, BasisOperator>();

  /** Register a custom measurement basis */
  static registerBasis(name: string, basis: BasisOperator): void {
    this.basis.set(name, basis);
  }

  /** Get list of available measurement bases */
  static getAvailableBases(): string[] {
    return Array.from(this.basis.keys());
  }

  /** Get measurement basis by name */
  static getBasis(name: string): BasisOperator | undefined {
    return this.basis.get(name);
  }

  /** Get description of a measurement basis */
  static getBasisDescription(name: string): string {
    if (!this.getBasis(name)) {
      throw new Error(`Unknown measurement basis: ${name}`);
    }
    const desc: Record<string, string> = {
      computational: 'Projective measurement in computational basis {|0⟩, |1⟩}',
      hadamard: 'Projective measurement in Hadamard basis {|+⟩, |−⟩}',
      circular: 'Projective measurement in circular basis {|+i⟩, |−i⟩}',
    };
    return desc[name] || `Custom measurement basis: ${name}`;
  }

  /** Measure a quantum state with a specific measurement basis */
  static measure(
    state: Q5mState,
    index: Q5mIndex,
    basisName: string = 'computational',
  ): MeasurementResult {
    validateQ5mIndex(index, state.quantumCount());

    const basis = this.basis.get(basisName);
    if (!basis) {
      throw new Error(
        `No measurement implementation for basis: ${basisName}. Available: ${this.getAvailableBases().join(', ')}`,
      );
    }

    // Use measurementLogic if available, otherwise use projectors with measureWith
    if (basis.measurementLogic) {
      return basis.measurementLogic(state, index);
    } else {
      const projectors = basis.projectors();
      return this.measureWith(state, index, projectors);
    }
  }

  /** Calculate measurement probabilities for a specific basis */
  static probabilities(
    state: Q5mState,
    index: Q5mIndex,
    basisName = 'computational',
  ): { prob0: Probability; prob1: Probability } {
    validateQ5mIndex(index, state.quantumCount());

    const basis = this.basis.get(basisName);
    if (!basis) {
      throw new Error(
        `No probability calculation for basis: ${basisName}. Available: ${this.getAvailableBases().join(', ')}`,
      );
    }

    // Use probabilityLogic if available, otherwise use projectors with applyProjectors
    if (basis.probabilityLogic) {
      return basis.probabilityLogic(state, index);
    } else {
      const projectors = basis.projectors();
      /* istanbul ignore next */
      const { prob0 = 0, prob1 = 0 } = this.applyProjectors(state, index, projectors, {
        returnProbabilities: true,
      });
      return { prob0, prob1 };
    }
  }

  static measureMultiple(
    state: Q5mState,
    indices: Q5mIndex[],
    basisName: string = 'computational',
  ): MeasurementResult {
    for (const idx of indices) {
      validateQ5mIndex(idx, state.quantumCount());
    }

    let currentState = state;
    let totalProbability = 1;
    let outcomeString = '';

    for (const idx of indices) {
      const result = this.measure(currentState, idx, basisName);
      currentState = result.collapsedState;
      totalProbability *= result.probability;
      outcomeString += String(result.outcome);
    }

    return {
      measureIndex: indices,
      outcome: outcomeString,
      probability: totalProbability,
      collapsedState: currentState,
      basis: basisName,
    };
  }

  /** Measure all qubits and return outcome as string */
  static measureAll(state: Q5mState, basisName: string = 'computational'): MeasurementResult {
    const indices = Array.from({ length: state.quantumCount() }, (_, i) => i);
    return this.measureMultiple(state, indices, basisName);
  }

  /** Measure with custom projectors */
  static measureWith(
    state: Q5mState,
    index: Q5mIndex,
    projectors: { P0: Hermitian; P1: Hermitian },
  ): MeasurementResult {
    // Calculate probabilities using applyProjectors
    /* istanbul ignore next */
    const { prob0 = 0, prob1 = 0 } = this.applyProjectors(state, index, projectors, {
      returnProbabilities: true,
    });

    const total = prob0 + prob1;
    if (total < 1e-12) {
      throw new Error('Measurement probabilities sum to zero - invalid quantum state');
    }

    const normalizedProb0 = prob0 / total;
    const normalizedProb1 = prob1 / total;

    // Random outcome selection
    const outcome: ZeroOne = Math.random() < normalizedProb0 ? 0 : 1;
    const probability = outcome === 0 ? normalizedProb0 : normalizedProb1;

    // State collapse
    const { collapsedState } = this.applyProjectors(state, index, projectors, {
      collapseState: outcome,
    });
    /* istanbul ignore next */
    if (!collapsedState) {
      throw new Error('Failed to collapse state'); // Defensive code - applyProjectors should always return collapsedState when collapseState option is provided
    }

    return {
      measureIndex: index,
      outcome,
      probability,
      collapsedState,
    };
  }

  /** Apply one or two projectors and return states and/or probabilities
   * @internal Used by basis implementations and internal measurement logic
   */
  static applyProjectors(
    state: Q5mState,
    index: Q5mIndex,
    projectors: { P0: Hermitian; P1?: Hermitian },
    options: { returnProbabilities?: boolean; collapseState?: ZeroOne } = {},
  ): {
    collapsedState?: Q5mState;
    prob0?: number;
    prob1?: number;
  } {
    const stateVector = state.amplitudes();
    const numQuantum = state.quantumCount();
    const numStates = stateVector.length;
    const mask = 1 << (numQuantum - 1 - index);

    // Prepare state vectors for P0 and optionally P1
    const newStateVector0: StateVector = new Array<Complex>(numStates).fill(ZERO);
    const newStateVector1: StateVector | null = projectors.P1
      ? new Array<Complex>(numStates).fill(ZERO)
      : null;

    // Single loop to apply projector(s)
    for (let i = 0; i < numStates; i++) {
      let projectedAmplitude0 = ZERO;
      let projectedAmplitude1 = ZERO;
      const iBit = (i & mask) !== 0 ? 1 : 0;

      for (let j = 0; j < numStates; j++) {
        const jBit = (j & mask) !== 0 ? 1 : 0;

        if ((i & ~mask) === (j & ~mask)) {
          const amplitude_j = stateVector[j];
          /* istanbul ignore next */
          if (!amplitude_j) continue; // Defensive code - complex numbers are never null in this implementation

          // Apply P0
          const p0Element = projectors.P0[iBit]?.[jBit];
          if (p0Element) {
            projectedAmplitude0 = projectedAmplitude0.add(p0Element.mul(amplitude_j));
          }

          // Apply P1 if provided
          if (projectors.P1) {
            const p1Element = projectors.P1[iBit]?.[jBit];
            if (p1Element) {
              projectedAmplitude1 = projectedAmplitude1.add(p1Element.mul(amplitude_j));
            }
          }
        }
      }

      newStateVector0[i] = projectedAmplitude0;
      if (newStateVector1) {
        newStateVector1[i] = projectedAmplitude1;
      }
    }

    const result: { collapsedState?: Q5mState; prob0?: number; prob1?: number } = {};

    // Calculate probabilities if requested
    if (options.returnProbabilities) {
      let prob0 = 0;
      for (const amplitude of newStateVector0) {
        prob0 += amplitude.abs() ** 2;
      }
      result.prob0 = Math.max(0, prob0);

      if (newStateVector1) {
        let prob1 = 0;
        for (const amplitude of newStateVector1) {
          prob1 += amplitude.abs() ** 2;
        }
        result.prob1 = Math.max(0, prob1);
      }
    }

    // Collapse state if requested
    if (options.collapseState !== undefined) {
      const vectorToNormalize = options.collapseState === 0 ? newStateVector0 : newStateVector1!;
      result.collapsedState = state.withAmplitudes(normalizeAmplitudes(vectorToNormalize, 1e-12));
    }

    return result;
  }

  /** Calculate fidelity between two quantum states */
  static fidelity(state1: Q5mState, state2: Q5mState): number {
    if (state1.quantumCount() !== state2.quantumCount()) {
      throw new Error('States must have the same number of qubits');
    }
    const v1 = state1.amplitudes();
    const v2 = state2.amplitudes();
    let inner = ZERO;
    for (let i = 0; i < v1.length; i++) {
      inner = inner.add(v1[i]!.conjugate().mul(v2[i]!));
    }
    return inner.abs() ** 2;
  }
}

// Standard basis
const computationalBasis: BasisOperator = {
  probabilityLogic: (
    state: Q5mState,
    index: Q5mIndex,
  ): { prob0: Probability; prob1: Probability } => {
    const stateVector = state.amplitudes();
    const mask = 1 << (state.quantumCount() - 1 - index);

    let prob0 = 0;
    for (let i = 0; i < stateVector.length; i++) {
      if ((i & mask) === 0) {
        prob0 += stateVector[i]!.abs() ** 2;
      }
    }

    return { prob0, prob1: 1 - prob0 };
  },

  measurementLogic: (state: Q5mState, index: Q5mIndex): MeasurementResult => {
    // Use probabilityLogic for probability calculation (computational basis has this defined)
    const { prob0 } = computationalBasis.probabilityLogic!(state, index);

    // Random outcome selection
    const outcome: ZeroOne = Math.random() < prob0 ? 0 : 1;

    // State collapse
    const stateVector = state.amplitudes();
    const numQuantum = state.quantumCount();
    const mask = 1 << (numQuantum - 1 - index);
    const newStateVector = new Array<Complex>(stateVector.length);

    for (let i = 0; i < stateVector.length; i++) {
      const bit = (i & mask) !== 0 ? 1 : 0;
      newStateVector[i] = bit === outcome ? stateVector[i]! : ZERO;
    }

    return {
      measureIndex: index,
      outcome,
      probability: outcome === 0 ? prob0 : 1 - prob0,
      collapsedState: state.withAmplitudes(normalizeAmplitudes(newStateVector, 1e-12)),
    };
  },

  projectors: () => {
    return {
      P0: createHermitian([
        [complex(1), complex(0)],
        [complex(0), complex(0)],
      ]),
      P1: createHermitian([
        [complex(0), complex(0)],
        [complex(0), complex(1)],
      ]),
    };
  },
};

const hadamardBasis: BasisOperator = {
  projectors: () => {
    const half = complex(0.5);
    return {
      P0: createHermitian([
        [half, half],
        [half, half],
      ]),
      P1: createHermitian([
        [half, half.mul(complex(-1))],
        [half.mul(complex(-1)), half],
      ]),
    };
  },
};

const circularBasis: BasisOperator = {
  projectors: () => {
    const half = complex(0.5);
    const halfI = complex(0, 0.5);
    const minusHalfI = complex(0, -0.5);
    return {
      P0: createHermitian([
        [half, minusHalfI],
        [halfI, half],
      ]),
      P1: createHermitian([
        [half, halfI],
        [minusHalfI, half],
      ]),
    };
  },
};

// Initialize standard bases
Q5mObserver.registerBasis('computational', computationalBasis);
Q5mObserver.registerBasis('hadamard', hadamardBasis);
Q5mObserver.registerBasis('circular', circularBasis);

export { Q5mObserver };
export type { BasisOperator };
export type { Probability, ZeroOne, MeasurementResult, Q5mMeasurable } from './Results';
export { isMeasurementResult, isProbability, isZeroOne } from './Results';
