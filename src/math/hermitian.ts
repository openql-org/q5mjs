// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Hermitian matrix operations for quantum computing.
 *
 * @description
 * This module provides specialized operations for Hermitian matrices, which
 * represent physical observables in quantum mechanics. Hermitian matrices have
 * real eigenvalues and are self-adjoint (H† = H).
 *
 * @packageDocumentation
 */

import type { Matrix } from './vector-matrix';

/**
 * Represents a Hermitian matrix, a complex square matrix `H` that is equal to its own conjugate transpose (`H† = H`).
 * Hermitian matrices represent physical observables in quantum mechanics (e.g., energy, momentum).
 * Their eigenvalues are always real, corresponding to possible measurement outcomes.
 *
 */
type Hermitian = Matrix;

/**
 * Generic type guard to check if a matrix is Hermitian (H† = H within numerical precision).
 * A Hermitian matrix has the property that it equals its conjugate transpose.
 * Hermitian matrices have real eigenvalues and represent observables in quantum mechanics.
 *
 * @param matrix - Matrix to check
 * @returns True if matrix is Hermitian within numerical tolerance
 *
 */
function isHermitian(matrix: Matrix): matrix is Hermitian {
  const n = matrix.length;
  if (n === 0) return false;

  if (!matrix.every((row) => row.length === n)) return false;

  const tolerance = 1e-10;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const rowI = matrix[i];
      const rowJ = matrix[j];
      /* istanbul ignore next */
      if (!rowI || !rowJ) {
        return false;
      }

      const hij = rowI[j];
      const hji = rowJ[i];
      if (!hij || !hji) {
        return false;
      }

      if (Math.abs(hij.re - hji.re) > tolerance || Math.abs(hij.im + hji.im) > tolerance) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Creates a validated Hermitian matrix from a 2D complex array.
 * Throws if the matrix is not Hermitian within numerical precision.
 *
 * @param matrix - Complex matrix to validate
 * @returns Validated Hermitian matrix
 * @throws Error if matrix is not Hermitian
 *
 */
function createHermitian(matrix: Matrix): Hermitian {
  if (!isHermitian(matrix)) {
    throw new Error('Matrix is not Hermitian: H† ≠ H');
  }
  return matrix;
}

export type { Hermitian };

export { isHermitian, createHermitian };
