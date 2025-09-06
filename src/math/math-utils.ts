// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Mathematical utility functions for quantum computing.
 *
 * @description
 * This module provides a collection of utility functions for mathematical
 * operations common in quantum computing. It includes a parser for mathematical
 * expressions, functions for vector and matrix manipulation with complex numbers,
 * and other numerical helpers.
 *
 * @packageDocumentation
 */

// Re-export Unitary and Hermitian types and functions for backward compatibility
export type { Unitary } from './unitary';
export type { Hermitian } from './hermitian';
export type { Amplitude } from './amplitude';
export type { Radians, MathConstants } from './angle';
export {
  isUnitary,
  createUnitary,
  create2x2Unitary,
  // Backwards compatibility alias
  create2x2Unitary as createUnitaryMatrix,
} from './unitary';
export type { Vector, Matrix } from './vector-matrix';
export {
  matXvec,
  matXmat,
  normalize,
  innerP,
  tensorP,
  isMatrix,
  createMatrix,
  dagger,
  // Backwards compatibility aliases
  matXvec as matrixVectorMultiply,
  matXmat as matrixMatrixMultiply,
  innerP as innerProduct,
  tensorP as tensorProduct,
} from './vector-matrix';
export { isHermitian, createHermitian } from './hermitian';
export {
  formatAmplitude,
  formatAmplitude as formatComplex,
  isValidAmplitude,
  createAmplitude,
  normalizeAmplitudes,
  isZero,
  areEqual,
} from './amplitude';
export { parseAngle } from './angle';
