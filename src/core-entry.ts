// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * Core entry point for q5m.js quantum computing library.
 *
 * This module exports only the core quantum computing functionality:
 * - Circuit and QubitState classes
 * - Pre-built quantum gate instances (H, X, Y, Z, CNOT, etc.)
 * - Complex number math utilities
 * - Basic measurement capabilities
 *
 * This is a lightweight bundle without algorithms, converters, or visualization.
 * For detailed gate classes, use full-entry.ts instead.
 */

export { Circuit } from './core/Circuit';
export { QubitState, Qubit, isValidQubitIndex } from './core/QubitState';
export type { QubitIndex } from './core/QubitState';

export { UnitaryOperator, HermitianOperator } from './core/Q5mOperator';

export { H, X, Y, Z, S, T, Tdg, Sdg, Identity, PH, RX, RY, RZ } from './core/Gates';
export { CNOT, CX, CZ, CY, CH, SWAP, CP, CU } from './core/Gates';
export { HH, EE } from './core/Gates';
export { Mz, Mx, My, Mp } from './core/Gates';
export { Complex, ZERO, ONE, I, complex } from './math/complex';

// Mathematical utilities
export {
  isValidAmplitude,
  createAmplitude,
  normalizeAmplitudes,
  isUnitary,
  createUnitary,
  isHermitian,
  createHermitian,
  parseAngle,
  formatAmplitude,
  normalize,
  innerP,
  tensorP,
  matXvec,
  matXmat,
  dagger,
} from './math/math-utils';
export type { Amplitude, Unitary, Hermitian, Radians } from './math/math-utils';

export { isProbability, isZeroOne, isMeasurementResult, isExecutionResult } from './core/Results';
export type { Probability, ZeroOne, MeasurementResult, ExecutionResult } from './core/Results';

/** Current version of the q5m.js library. */
export const VERSION = '0.1.0';
