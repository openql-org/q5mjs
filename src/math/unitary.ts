// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Unitary matrix operations for quantum computing.
 *
 * @description
 * This module provides specialized operations for unitary matrices, which are
 * fundamental to quantum computing. Unitary matrices represent quantum gates
 * and preserve quantum mechanical probabilities.
 *
 * @packageDocumentation
 */

import type { Complex } from './complex';
import { complex, ZERO } from './complex';
import type { Matrix } from './vector-matrix';

/**
 * Represents a unitary matrix, a complex square matrix `U` where its conjugate transpose `U†` is also its inverse (`U†U = I`).
 * Unitary matrices describe the evolution of a closed quantum system and are guaranteed to conserve probability.
 * All quantum gates are represented by unitary matrices.
 *
 */
type Unitary = Matrix;

/**
 * Generic type guard to check if a matrix is unitary (U†U = I within numerical precision).
 * A unitary matrix preserves quantum mechanical probabilities.
 *
 * @param matrix - Matrix to check
 * @returns True if matrix is unitary within numerical tolerance
 *
 */
function isUnitary(matrix: Matrix): matrix is Unitary {
  const n = matrix.length;
  if (n === 0) return false;

  if (!matrix.every((row) => row.length === n)) return false;

  const tolerance = 1e-10;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = ZERO;

      for (let k = 0; k < n; k++) {
        const matrixRow = matrix[k];
        /* istanbul ignore next */
        if (!matrixRow) {
          return false;
        }

        const uKi = matrixRow[i];
        const uKj = matrixRow[j];
        if (!uKi || !uKj) {
          return false;
        }
        const conjUKi = uKi.conjugate();
        sum = sum.add(conjUKi.mul(uKj));
      }

      const expected = i === j ? 1 : 0;
      if (Math.abs(sum.re - expected) > tolerance || Math.abs(sum.im) > tolerance) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Creates a validated unitary matrix from a 2D complex array.
 * Throws if the matrix is not unitary within numerical precision.
 *
 * @param matrix - Complex matrix to validate
 * @returns Validated unitary matrix
 * @throws Error if matrix is not unitary
 *
 */
function createUnitary(matrix: Matrix): Unitary {
  if (!isUnitary(matrix)) {
    throw new Error('Matrix is not unitary: U†U ≠ I');
  }
  return matrix;
}

/**
 * Creates a 2x2 unitary matrix from two quantum amplitudes and a global phase.
 * The matrix is constructed as U = e^(iθ) * [[α, -β*], [β, α*]], where * denotes
 * the complex conjugate, after normalizing α and β.
 *
 * @param alpha The first quantum amplitude.
 * @param beta The second quantum amplitude.
 * @param theta The global phase angle in radians. Defaults to 0.
 * @returns An object containing the unitary matrix and the normalized amplitudes.
 * @throws {Error} If amplitudes are invalid or result in a zero vector.
 * @category Math
 */
const create2x2Unitary = (
  alpha: Complex,
  beta: Complex,
  theta: number = 0,
): {
  matrix: Unitary;
  normalizedAlpha: Complex;
  normalizedBeta: Complex;
} => {
  if (!alpha || typeof alpha.abs !== 'function') {
    throw new Error('alpha must be a valid Complex object');
  }
  if (!beta || typeof beta.abs !== 'function') {
    throw new Error('beta must be a valid Complex object');
  }

  const norm = Math.sqrt(alpha.abs() ** 2 + beta.abs() ** 2);

  if (norm === 0) {
    throw new Error('Invalid amplitudes: both alpha and beta cannot be zero');
  }

  const normalizedAlpha = alpha.div(complex(norm));
  const normalizedBeta = beta.div(complex(norm));

  const alphaStar = normalizedAlpha.conjugate();
  const betaStar = normalizedBeta.conjugate();

  const globalPhase = complex(Math.cos(theta), Math.sin(theta));

  const matrixCandidate = [
    [normalizedAlpha.mul(globalPhase), betaStar.mul(complex(-1)).mul(globalPhase)],
    [normalizedBeta.mul(globalPhase), alphaStar.mul(globalPhase)],
  ];

  /* istanbul ignore next */
  if (!isUnitary(matrixCandidate)) {
    throw new Error('Constructed matrix is not unitary - this indicates a programming error');
  }
  const matrix = matrixCandidate;

  return {
    matrix,
    normalizedAlpha,
    normalizedBeta,
  };
};

export type { Unitary };

export { isUnitary, createUnitary, create2x2Unitary };
