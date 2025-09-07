// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Vector and matrix operations for quantum computing.
 *
 * @description
 * This module provides fundamental vector and matrix operations for quantum
 * computing, including matrix-vector multiplication, matrix-matrix multiplication,
 * and vector normalization operations.
 *
 * @packageDocumentation
 */

import type { Complex } from './complex';
import { complex, ZERO } from './complex';

/**
 * Represents a vector of complex numbers in quantum computing.
 * Used for quantum state vectors and probability amplitudes.
 */
type Vector = Complex[];

/**
 * Represents a general matrix of complex numbers.
 * This is the base type for all quantum matrices including Unitary and Hermitian matrices.
 */
type Matrix = Complex[][];

/**
 * Type guard to check if a value is a valid Matrix.
 * Validates that the input is a 2D array of Complex numbers.
 */
function isMatrix(value: unknown): value is Matrix {
  if (!Array.isArray(value)) return false;
  if (value.length === 0) return false;

  const firstRow = value[0] as unknown;
  if (!Array.isArray(firstRow)) return false;
  const firstRowLength = firstRow.length;
  if (firstRowLength === 0) return false;

  return value.every((row) => {
    if (!Array.isArray(row)) return false;
    if (row.length !== firstRowLength) return false;

    return row.every((element) => {
      if (!element || typeof element !== 'object') return false;

      const complexCandidate = element as Record<string, unknown>;
      return (
        're' in complexCandidate &&
        'im' in complexCandidate &&
        typeof complexCandidate.re === 'number' &&
        typeof complexCandidate.im === 'number'
      );
    });
  });
}

/**
 * Creates a validated Matrix from a 2D complex array.
 * Ensures structural correctness without mathematical properties.
 */
function createMatrix(matrix: Complex[][]): Matrix {
  if (!isMatrix(matrix)) {
    throw new Error('Invalid matrix structure: must be a 2D array of Complex numbers');
  }

  const rows = matrix.length;
  /* istanbul ignore next */
  if (rows === 0) {
    throw new Error('Matrix cannot be empty'); // Defensive code - unreachable due to isMatrix pre-validation
  }

  const cols = matrix[0]!.length;
  /* istanbul ignore next */
  if (cols === 0) {
    throw new Error('Matrix rows cannot be empty'); // Defensive code - unreachable due to isMatrix pre-validation
  }

  for (let i = 0; i < rows; i++) {
    /* istanbul ignore next */
    if (matrix[i]!.length !== cols) {
      throw new Error(`Row ${i} has length ${matrix[i]!.length}, expected ${cols}`);
    }
  }

  return matrix;
}

function normalize(values: Vector, tolerance: number = 1e-12, tolerant?: number): Vector {
  const sumSquared = values.reduce((sum, v) => sum + v.re * v.re + v.im * v.im, 0);
  const norm = Math.sqrt(sumSquared);

  if (tolerant !== undefined) {
    if (norm <= tolerant) {
      return values;
    }
  } else {
    if (sumSquared < tolerance) {
      throw new Error('Cannot normalize zero vector');
    }
  }

  const normFactor = 1 / norm;
  return values.map((v) => complex(v.re * normFactor, v.im * normFactor));
}

/**
 * Calculates the inner product of two complex vector vectors.
 * The inner product is defined as ⟨a|b⟩ = ∑ᵢ aᵢ* bᵢ, where aᵢ* is the complex conjugate.
 *
 * @param a The first complex vector.
 * @param b The second complex vector.
 * @returns The resulting complex vector from the inner product.
 * @throws {Error} If the vectors have different lengths.
 * @category Math
 */
const innerP = (a: Vector, b: Vector): Complex => {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  return a.reduce((sum, val, i) => {
    return sum.add(val.conjugate().mul(b[i]!));
  }, ZERO);
};

/**
 * Computes the tensor product (or Kronecker product) of two quantum amplitude vectors.
 * This operation is used to combine the state spaces of multiple quantum systems.
 *
 * @param a The first quantum amplitude vector (size m).
 * @param b The second quantum amplitude vector (size n).
 * @returns The resulting tensor product vector (size m * n).
 * @category Math
 */
const tensorP = (a: Vector, b: Vector): Vector => {
  const result: Vector = [];

  for (const aVal of a) {
    for (const bVal of b) {
      result.push(aVal.mul(bVal));
    }
  }

  return result;
};

/**
 * Fast matrix-vector multiplication with minimal validation.
 * Use for performance-critical paths with guaranteed valid inputs.
 * @internal
 */
const matXvecFast = (matrix: Matrix, vector: Vector): Vector => {
  const m = matrix.length;
  const n = vector.length;
  const result = new Array<Complex>(m);

  for (let i = 0; i < m; i++) {
    const row = matrix[i]!;
    let sum = complex(0, 0);
    for (let j = 0; j < n; j++) {
      sum = sum.add(row[j]!.mul(vector[j]!));
    }
    result[i] = sum;
  }

  return result;
};

/**
 * Performs matrix-vector multiplication with complex numbers.
 * Uses fast path for small matrices, with full validation fallback.
 *
 * @param matrix A unitary matrix.
 * @param vector A complex vector vector.
 * @returns The resulting vector from the multiplication.
 * @throws {Error} If matrix/vector dimensions are incompatible.
 * @category Math
 */
const matXvec = (matrix: Matrix, vector: Vector): Vector => {
  if (matrix.length > 0 && vector.length > 0 && matrix.length <= 16 && vector.length <= 16) {
    const firstRow = matrix[0];
    if (firstRow && firstRow.length === vector.length) {
      try {
        return matXvecFast(matrix, vector);
      } catch {
        // Fall through to validation path
      }
    }
  }
  if (matrix.length === 0) {
    throw new Error('Matrix cannot be empty');
  }

  if (vector.length === 0) {
    throw new Error('Vector cannot be empty');
  }

  const result: Vector = Array.from({ length: matrix.length }, (_, i) => {
    const matrixRow = matrix[i];
    if (!matrixRow) {
      throw new Error(`Matrix row ${i} is undefined`);
    }
    if (matrixRow.length !== vector.length) {
      throw new Error(
        `Matrix row ${i} size ${matrixRow.length} does not match vector size ${vector.length}`,
      );
    }

    return matrixRow.reduce((sum: Complex, matrixElement: Complex, j: number): Complex => {
      const vectorElement = vector[j];
      /* istanbul ignore next */
      if (!vectorElement) {
        throw new Error(`Vector element at index ${j} is undefined`);
      }

      /* istanbul ignore next */
      if (!matrixElement || typeof matrixElement.mul !== 'function') {
        throw new Error(`Matrix element [${i}][${j}] is not a valid Complex object`);
      }

      return sum.add(matrixElement.mul(vectorElement));
    }, ZERO);
  });

  return result;
};

/**
 * Performs matrix-matrix multiplication with complex numbers.
 * This is used for composing quantum operations and gate sequences.
 *
 * @param matrixA The first matrix
 * @param matrixB The second matrix
 * @returns The resulting matrix from A × B
 * @throws {Error} If matrix dimensions are incompatible
 * @category Math
 */
const matXmat = (matrixA: Matrix, matrixB: Matrix): Matrix => {
  if (matrixA.length === 0 || matrixB.length === 0) {
    throw new Error('Matrices cannot be empty');
  }

  const rowsA = matrixA.length;
  const colsA = matrixA[0]!.length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0]!.length;

  if (colsA !== rowsB) {
    throw new Error(`Matrix dimensions incompatible: ${rowsA}×${colsA} × ${rowsB}×${colsB}`);
  }

  const result: Matrix = Array.from({ length: rowsA }, () =>
    Array.from({ length: colsB }, () => ZERO),
  );

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = ZERO;
      for (let k = 0; k < colsA; k++) {
        sum = sum.add(matrixA[i]![k]!.mul(matrixB[k]![j]!));
      }
      result[i]![j] = sum;
    }
  }

  return result;
};

/**
 * Performs optimized matrix-vector multiplication for sparse vectors.
 * Only computes products for non-zero vector elements, improving performance
 * for sparse quantum states.
 *
 * @param matrix Dense matrix to multiply with
 * @param sparseVector Sparse vector represented as Map<index, value>
 * @param vectorSize Total size of the vector (for result allocation)
 * @returns The resulting vector from the multiplication
 * @category Math
 */
const matXvecSparse = (
  matrix: Matrix,
  sparseVector: Map<number, Complex>,
  vectorSize: number,
): Vector => {
  if (matrix.length === 0) {
    throw new Error('Matrix cannot be empty');
  }

  if (matrix[0]!.length !== vectorSize) {
    throw new Error(
      `Matrix column size ${matrix[0]!.length} does not match vector size ${vectorSize}`,
    );
  }

  const result: Vector = Array.from({ length: matrix.length }, () => ZERO);

  for (let i = 0; i < matrix.length; i++) {
    let sum = ZERO;
    for (const [j, vectorElement] of sparseVector) {
      if (j >= vectorSize) continue;
      const matrixElement = matrix[i]![j]!;
      sum = sum.add(matrixElement.mul(vectorElement));
    }
    result[i] = sum;
  }

  return result;
};

/**
 * Performs matrix-vector multiplication for a subset of vector elements.
 * Useful for applying quantum gates to specific qubits without full state vector multiplication.
 *
 * @param matrix Square matrix (typically 2x2 or 4x4 for quantum gates)
 * @param vector Full state vector
 * @param indices Array of indices to apply the operation to
 * @returns New vector with only specified indices modified
 * @category Math
 */
const matXvecPartial = (matrix: Matrix, vector: Vector, indices: number[]): Vector => {
  if (matrix.length !== matrix[0]!.length) {
    throw new Error('Matrix must be square for partial application');
  }

  if (matrix.length !== indices.length) {
    throw new Error(`Matrix size ${matrix.length} does not match indices length ${indices.length}`);
  }

  const result = [...vector];
  const tempValues: Complex[] = [];

  for (const idx of indices) {
    if (idx < 0 || idx >= vector.length) {
      throw new Error(`Index ${idx} out of bounds for vector of length ${vector.length}`);
    }
    tempValues.push(vector[idx]!);
  }

  const transformedValues = matXvec(matrix, tempValues);
  for (let i = 0; i < indices.length; i++) {
    result[indices[i]!] = transformedValues[i]!;
  }

  return result;
};

/**
 * Checks if a matrix is unitary within specified tolerance.
 * A matrix U is unitary if U†U = I, where U† is the conjugate transpose.
 *
 * @param matrix The matrix to check
 * @param tolerance Numerical tolerance for comparison (default: 1e-10)
 * @returns True if the matrix is unitary within tolerance
 * @category Math
 */
const isMatrixUnitary = (matrix: Matrix, tolerance: number = 1e-10): boolean => {
  if (matrix.length !== matrix[0]!.length) {
    return false;
  }

  const n = matrix.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = ZERO;

      for (let k = 0; k < n; k++) {
        const conjugate = matrix[k]![i]!.conjugate();
        const element = matrix[k]![j]!;
        sum = sum.add(conjugate.mul(element));
      }

      const expected = i === j ? complex(1, 0) : ZERO;
      const diff = sum.sub(expected).abs();

      if (diff > tolerance) {
        return false;
      }
    }
  }

  return true;
};

/**
 * In-place matrix-vector multiplication to minimize memory allocation.
 * Modifies the result vector directly instead of creating a new one.
 *
 * @param matrix The matrix to multiply with
 * @param vector The input vector
 * @param result Pre-allocated result vector (will be modified)
 * @throws {Error} If dimensions are incompatible or result vector is wrong size
 * @category Math
 */
const matXvecInPlace = (matrix: Matrix, vector: Vector, result: Vector): void => {
  if (matrix.length === 0) {
    throw new Error('Matrix cannot be empty');
  }

  if (vector.length === 0) {
    throw new Error('Vector cannot be empty');
  }

  if (result.length !== matrix.length) {
    throw new Error(
      `Result vector length ${result.length} does not match matrix rows ${matrix.length}`,
    );
  }

  for (let i = 0; i < matrix.length; i++) {
    const matrixRow = matrix[i]!;
    if (matrixRow.length !== vector.length) {
      throw new Error(
        `Matrix row ${i} size ${matrixRow.length} does not match vector size ${vector.length}`,
      );
    }

    let sum = ZERO;
    for (let j = 0; j < vector.length; j++) {
      const matrixElement = matrixRow[j]!;
      const vectorElement = vector[j]!;
      sum = sum.add(matrixElement.mul(vectorElement));
    }
    result[i] = sum;
  }
};

/**
 * Computes matrix conjugate transpose (Hermitian transpose).
 * For a matrix A, returns A† where (A†)_ij = (A_ji)*
 *
 * @param matrix The input matrix
 * @returns The conjugate transpose matrix
 * @category Math
 */
const matrixConjugateTranspose = (matrix: Matrix): Matrix => {
  if (matrix.length === 0) {
    throw new Error('Matrix cannot be empty');
  }

  const rows = matrix.length;
  const cols = matrix[0]!.length;
  const result: Matrix = Array.from({ length: cols }, () =>
    Array.from({ length: rows }, () => ZERO),
  );

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j]![i] = matrix[i]![j]!.conjugate();
    }
  }

  return result;
};

/**
 * Alias for matrixConjugateTranspose - computes the dagger (†) of a matrix.
 * For a matrix A, returns A† where (A†)_ij = (A_ji)*
 *
 * This is the standard notation in quantum mechanics for the conjugate transpose,
 * also known as the Hermitian adjoint or Hermitian transpose.
 *
 * @param matrix The input matrix
 * @returns The dagger (conjugate transpose) matrix
 * @category Math
 */
const dagger = (matrix: Matrix): Matrix => matrixConjugateTranspose(matrix);

// Type exports
export type { Vector, Matrix };

// Function exports
export {
  normalize,
  innerP,
  tensorP,
  matXvec,
  matXmat,
  matXvecSparse,
  matXvecPartial,
  matXvecInPlace,
  isMatrixUnitary,
  matrixConjugateTranspose,
  dagger,
  isMatrix,
  createMatrix,
};
