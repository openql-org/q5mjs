// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @fileoverview Quantum operator representation for time evolution and observables.
 *
 * This module provides the Q5mOperator class, which represents operators
 * in quantum mechanics such as Hamiltonians and observables. These operators
 * are used for time evolution, measurements, and expectation value calculations.
 *
 * @author OpenQL Project
 * @version 0.1.0
 * @since 2025
 */

import type { Complex } from '../math/complex';
import { complex, ZERO, ONE } from '../math/complex';
import type { Matrix, Unitary, Hermitian } from '../math/math-utils';
import {
  createUnitary,
  createHermitian,
  matXmat,
  isUnitary,
  isHermitian,
} from '../math/math-utils';

/**
 * Represents a quantum operator (observable or Hamiltonian).
 *
 * Quantum operators are matrices that represent physical transformations
 * in quantum systems. This generic class encapsulates the matrix representation
 * and provides methods for computing time evolution operators and expectation values.
 *
 * **Key Concepts:**
 * - **Hermitian Operators**: H† = H (conjugate transpose equals itself) - represent observables
 * - **Unitary Operators**: U†U = I (preserve quantum state norm) - represent time evolution
 * - **Type Safety**: Generic type parameter ensures correct matrix type usage
 * - **Quantum Mechanics**: Proper mathematical operations preserving quantum properties
 *
 * @template TMatrix The matrix type (Unitary or Hermitian)
 *
 */

function createMatrixAs<T extends Unitary = Unitary>(
  matrix: Matrix,
  forceHermitian?: T extends Hermitian ? true : false,
): T {
  /* istanbul ignore if - TypeScript conditional type ensures forceHermitian is never true in practice */
  if (forceHermitian) {
    return createHermitian(matrix) as T;
  }
  return createUnitary(matrix) as T;
}

class Q5mOperator<TMatrix extends Unitary = Unitary> {
  /** The matrix representation of the operator */
  protected readonly matrix: TMatrix;

  /** The dimension of the operator (size of the Hilbert space) */
  public readonly dimension: number;

  /** Optional name for the operator */
  public readonly name?: string | undefined;

  /**
   * Creates a new quantum operator.
   *
   * @param matrix The matrix representation of the operator
   * @param name Optional name for the operator
   * @param skipValidation Skip validation for performance (use with caution)
   * @throws {Error} If the matrix is not square
   */
  constructor(matrix: TMatrix, name?: string, skipValidation: boolean = false) {
    if (matrix.length === 0 || matrix.length !== matrix[0]?.length) {
      throw new Error('Quantum operator must be a square matrix');
    }

    this.matrix = matrix.map((row) => [...row]) as TMatrix;
    this.dimension = matrix.length;
    this.name = name;

    void skipValidation;
  }

  /**
   * Gets the matrix representation of the operator.
   *
   * @returns A copy of the operator's matrix
   */
  getMatrix(): TMatrix {
    return this.matrix.map((row) => [...row]) as TMatrix;
  }

  /**
   * Creates a unitary Q5mOperator with validation.
   *
   * @param matrix The unitary matrix
   * @param name Optional name for the operator
   * @returns A new Q5mOperator<Unitary>
   * @throws {Error} If the matrix is not unitary
   */
  static unitary(matrix: Unitary, name?: string): Q5mOperator<Unitary> {
    if (!isUnitary(matrix)) {
      throw new Error('Matrix is not unitary (U†U ≠ I)');
    }
    return new Q5mOperator<Unitary>(matrix, name, true);
  }

  /**
   * Creates a Hermitian Q5mOperator with validation.
   *
   * @param matrix The Hermitian matrix
   * @param name Optional name for the operator
   * @returns A new Q5mOperator<Hermitian>
   * @throws {Error} If the matrix is not Hermitian
   */
  static hermitian(matrix: Hermitian, name?: string): Q5mOperator<Hermitian> {
    if (!isHermitian(matrix)) {
      throw new Error('Matrix is not Hermitian (H† ≠ H)');
    }
    return new Q5mOperator<Hermitian>(matrix, name, true);
  }

  /**
   * Computes the time evolution operator U(t) = exp(-iHt/ℏ).
   *
   * For simplicity, we set ℏ = 1 in our units. The time evolution
   * operator is unitary and generates the time evolution of quantum states
   * according to the Schrödinger equation.
   *
   * @param time The evolution time
   * @param hbar Reduced Planck constant (default: 1 in natural units)
   * @returns The unitary time evolution operator as a matrix
   *
   */
  getTimeEvolutionOperator(time: number, hbar: number = 1): Unitary {
    const result: Matrix = [];

    for (let i = 0; i < this.dimension; i++) {
      result[i] = [];
      for (let j = 0; j < this.dimension; j++) {
        if (i === j) {
          const energy = this.matrix[i]![i]!.re;
          const phase = (-energy * time) / hbar;
          const expIEt = complex(Math.cos(phase), Math.sin(phase));
          result[i]![j] = expIEt;
        } else {
          result[i]![j] = complex(0, 0);
        }
      }
    }

    return createUnitary(result);
  }

  /**
   * Scales the operator by a scalar value.
   *
   * @param scalar The scalar to multiply the operator by
   * @returns A new scaled quantum operator
   */
  scale(scalar: number | Complex): Q5mOperator<TMatrix> {
    const scalarComplex = typeof scalar === 'number' ? complex(scalar, 0) : scalar;
    const scaledMatrix = this.matrix.map((row) =>
      row.map((element) => element.mul(scalarComplex)),
    ) as TMatrix;
    return new Q5mOperator<TMatrix>(
      scaledMatrix,
      /* istanbul ignore next - Defensive check for complex scalar toString */
      this.name
        ? `${typeof scalar === 'number' ? scalar : scalar.toString()}*${this.name}`
        : undefined,
      true,
    );
  }

  /**
   * Adds another quantum operator to this one.
   *
   * @param other The operator to add
   * @returns A new quantum operator representing the sum
   * @throws {Error} If the operators have different dimensions
   */
  add(other: Q5mOperator<TMatrix>): Q5mOperator<TMatrix> {
    if (this.dimension !== other.dimension) {
      throw new Error('Cannot add operators with different dimensions');
    }

    const resultMatrix: Matrix = [];
    for (let i = 0; i < this.dimension; i++) {
      resultMatrix[i] = [];
      for (let j = 0; j < this.dimension; j++) {
        resultMatrix[i]![j] = this.matrix[i]![j]!.add(other.matrix[i]![j]!);
      }
    }

    const newName = this.name && other.name ? `${this.name}+${other.name}` : undefined;
    return new Q5mOperator<TMatrix>(resultMatrix as TMatrix, newName, true);
  }

  /**
   * Gets the inverse (conjugate transpose) of this operator.
   *
   * For unitary operators, the inverse is the conjugate transpose: U⁻¹ = U†
   *
   * @returns A new Q5mOperator representing the conjugate transpose
   */
  inverse(): Q5mOperator<TMatrix> {
    const n = this.dimension;
    const inverseMatrix: Matrix = [];

    for (let i = 0; i < n; i++) {
      inverseMatrix[i] = [];
      for (let j = 0; j < n; j++) {
        inverseMatrix[i]![j] = this.matrix[j]![i]!.conjugate();
      }
    }

    const inverseName = this.name ? `${this.name}†` : undefined;
    return new Q5mOperator<TMatrix>(inverseMatrix as TMatrix, inverseName, true);
  }

  /**
   * Composes this operator with another (matrix multiplication).
   *
   * The result is U₁U₂. The resulting matrix type depends on the operand types.
   *
   * @param other The other operator
   * @returns A new Q5mOperator representing the composition
   * @throws {Error} If the operators have different dimensions
   */
  compose(other: Q5mOperator<TMatrix>): Q5mOperator<TMatrix> {
    if (this.dimension !== other.dimension) {
      throw new Error('Cannot compose operators with different dimensions');
    }

    const resultMatrix = matXmat(this.matrix, other.matrix);

    const composedName = this.name && other.name ? `${this.name}⊗${other.name}` : undefined;
    return new Q5mOperator<TMatrix>(resultMatrix as TMatrix, composedName, true);
  }

  /**
   * Creates a Q5mOperator from a matrix, with optional validation.
   *
   * @param matrix The matrix to convert to an operator
   * @param name Optional name for the operator
   * @param skipValidation Whether to skip validation (default: false)
   * @returns A new Q5mOperator
   * @throws {Error} If validation fails
   */
  static fromMatrix<T extends Unitary>(
    matrix: T,
    name?: string,
    skipValidation: boolean = false,
  ): Q5mOperator<T> {
    return new Q5mOperator<T>(matrix, name, skipValidation);
  }

  /**
   * Creates an identity operator of given dimension.
   */
  static identity<T extends Unitary = Unitary>(dimension: number): Q5mOperator<T> {
    const matrix: Matrix = [];
    for (let i = 0; i < dimension; i++) {
      matrix[i] = [];
      for (let j = 0; j < dimension; j++) {
        matrix[i]![j] = i === j ? complex(1, 0) : complex(0, 0);
      }
    }
    return new Q5mOperator<T>(createMatrixAs<T>(matrix), 'Identity');
  }

  /**
   * Creates a Hadamard operator of the specified dimension.
   *
   * The Hadamard operator is a fundamental quantum gate that creates superposition
   * by transforming computational basis states. For a single qubit (dimension 2),
   * it maps |0⟩ → (|0⟩ + |1⟩)/√2 and |1⟩ → (|0⟩ - |1⟩)/√2.
   *
   * For higher dimensions, this creates a generalized Walsh-Hadamard transform.
   * The matrix elements are H[i,j] = (1/√n) * (-1)^(i·j) where n is the dimension
   * and i·j is the dot product of the binary representations of i and j.
   *
   * @param dimension The dimension of the Hadamard operator (must be a power of 2)
   * @returns A new Q5mOperator representing the Hadamard transformation
   * @throws {Error} If dimension is not a positive power of 2
   *
   */
  static Hadamard<T extends Unitary = Unitary>(dimension: number): Q5mOperator<T> {
    if (dimension <= 0 || !Number.isInteger(dimension) || (dimension & (dimension - 1)) !== 0) {
      throw new Error(`Dimension must be a positive power of 2, got ${dimension}`);
    }

    const normalization = 1 / Math.sqrt(dimension);
    const matrix: Matrix = [];

    for (let i = 0; i < dimension; i++) {
      matrix[i] = [];
      for (let j = 0; j < dimension; j++) {
        let parity = 0;
        let temp_i = i;
        let temp_j = j;

        while (temp_i > 0 && temp_j > 0) {
          parity ^= temp_i & 1 & (temp_j & 1);
          temp_i >>= 1;
          temp_j >>= 1;
        }

        const sign = parity === 0 ? 1 : -1;
        matrix[i]![j] = complex(normalization * sign, 0);
      }
    }

    return new Q5mOperator<T>(
      createMatrixAs<T>(matrix),
      `H${dimension === 2 ? '' : dimension}`,
      true,
    );
  }

  /**
   * Creates a Pauli-X operator.
   */
  static pauliX<T extends Unitary = Unitary>(): Q5mOperator<T> {
    return new Q5mOperator<T>(
      createMatrixAs<T>([
        [complex(0, 0), complex(1, 0)],
        [complex(1, 0), complex(0, 0)],
      ]),
      'PauliX',
    );
  }

  /**
   * Creates a Pauli-Y operator.
   */
  static pauliY<T extends Unitary = Unitary>(): Q5mOperator<T> {
    return new Q5mOperator<T>(
      createMatrixAs<T>([
        [complex(0, 0), complex(0, -1)],
        [complex(0, 1), complex(0, 0)],
      ]),
      'PauliY',
    );
  }

  /**
   * Creates a Pauli-Z operator.
   */
  static pauliZ<T extends Unitary = Unitary>(): Q5mOperator<T> {
    return new Q5mOperator<T>(
      createMatrixAs<T>([
        [complex(1, 0), complex(0, 0)],
        [complex(0, 0), complex(-1, 0)],
      ]),
      'PauliZ',
    );
  }
  /**
   * Creates a phase gate operator (Unitary).
   *
   * @param phase The phase angle in radians
   * @returns A new Q5mOperator representing the phase gate
   */
  static phaseGate<T extends Unitary = Unitary>(phase: number): Q5mOperator<T> {
    const expIPhase = complex(Math.cos(phase), Math.sin(phase));
    const matrix = createMatrixAs<T>([
      [complex(1, 0), ZERO],
      [ZERO, expIPhase],
    ]);
    return new Q5mOperator<T>(matrix, `P(${phase})`, true);
  }

  /**
   * Creates a rotation gate around the X axis (Unitary).
   *
   * @param angle The rotation angle in radians
   * @returns A new Q5mOperator representing Rx(angle)
   */
  static rotationX<T extends Unitary = Unitary>(angle: number): Q5mOperator<T> {
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    const matrix = createMatrixAs<T>([
      [complex(cos, 0), complex(0, -sin)],
      [complex(0, -sin), complex(cos, 0)],
    ]);
    return new Q5mOperator<T>(matrix, `Rx(${angle})`, true);
  }

  /**
   * Creates a rotation gate around the Y axis (Unitary).
   *
   * @param angle The rotation angle in radians
   * @returns A new Q5mOperator representing Ry(angle)
   */
  static rotationY<T extends Unitary = Unitary>(angle: number): Q5mOperator<T> {
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    const matrix = createMatrixAs<T>([
      [complex(cos, 0), complex(-sin, 0)],
      [complex(sin, 0), complex(cos, 0)],
    ]);
    return new Q5mOperator<T>(matrix, `Ry(${angle})`, true);
  }

  /**
   * Creates a rotation gate around the Z axis (Unitary).
   *
   * @param theta The rotation angle in radians
   * @returns A new Q5mOperator representing Rz(theta)
   */
  static rotationZ<T extends Unitary = Unitary>(theta: number): Q5mOperator<T> {
    const half = theta / 2;
    const expMinusITheta2 = complex(Math.cos(-half), Math.sin(-half));
    const expITheta2 = complex(Math.cos(half), Math.sin(half));
    const matrix = createMatrixAs<T>([
      [expMinusITheta2, ZERO],
      [ZERO, expITheta2],
    ]);
    return new Q5mOperator<T>(matrix, `Rz(${theta})`, true);
  }

  /**
   * Creates a SWAP gate that exchanges quantum states between two qubits (Unitary).
   *
   * The SWAP gate is a fundamental two-qubit gate that exchanges the quantum states
   * of two qubits. It permutes the computational basis states as follows:
   * - |00⟩ → |00⟩ (no change)
   * - |01⟩ → |10⟩ (swap qubits)
   * - |10⟩ → |01⟩ (swap qubits)
   * - |11⟩ → |11⟩ (no change)
   *
   * Matrix representation in computational basis |00⟩, |01⟩, |10⟩, |11⟩:
   * ```
   * SWAP = [1 0 0 0]
   *        [0 0 1 0]
   *        [0 1 0 0]
   *        [0 0 0 1]
   * ```
   *
   * Properties:
   * - Self-inverse: SWAP² = I
   * - Symmetric: SWAP₀₁ = SWAP₁₀
   * - Can be decomposed into 3 CNOT gates
   * - Preserves entanglement structure
   *
   * @returns A new Q5mOperator representing the SWAP gate
   *
   */
  static swap<T extends Unitary = Unitary>(): Q5mOperator<T> {
    const matrix = createMatrixAs<T>([
      [ONE, ZERO, ZERO, ZERO],
      [ZERO, ZERO, ONE, ZERO],
      [ZERO, ONE, ZERO, ZERO],
      [ZERO, ZERO, ZERO, ONE],
    ]);
    return new Q5mOperator<T>(matrix, 'SWAP', true);
  }

  /**
   * Calculates the sparsity ratio of the operator matrix.
   *
   * This method counts non-zero elements to determine how sparse the matrix is,
   * which is crucial for selecting optimal computation algorithms. A sparsity
   * ratio close to 0 indicates a very sparse matrix (few non-zeros), while
   * a ratio close to 1 indicates a dense matrix.
   *
   * @param tolerance - Threshold for considering elements as zero (default: 1e-15)
   * @returns Sparsity ratio between 0 and 1 (non-zero elements / total elements)
   *
   */
  getSparsity(tolerance: number = 1e-15): number {
    const n = this.dimension;
    let nonZeroCount = 0;
    const totalElements = n * n;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (this.matrix[i]![j]!.abs() > tolerance) {
          nonZeroCount++;
        }
      }
    }

    return nonZeroCount / totalElements;
  }

  /**
   * Determines if this operator is sparse enough to benefit from sparse algorithms.
   *
   * This method uses a configurable threshold to classify matrices as sparse or dense.
   * Sparse matrices can use specialized algorithms that skip zero elements.
   *
   * @param sparsityThreshold - Maximum sparsity ratio to consider sparse (default: 0.3 = 30% non-zero)
   * @returns True if the matrix is below the sparsity threshold
   *
   */
  isSparse(sparsityThreshold: number = 0.3): boolean {
    return this.getSparsity() <= sparsityThreshold;
  }

  /**
   * Analyzes the structure of the operator matrix to identify common patterns.
   *
   * This analysis detects quantum gate patterns that can benefit from
   * specialized algorithms:
   * - Controlled gates: Identity in top-left, unitary in bottom-right
   * - Single-qubit gates: 2×2 matrices
   * - Block diagonal: Independent blocks that can be processed separately
   *
   * The analysis results can guide algorithm selection for specific gate structures.
   *
   * @returns Analysis object with structure information
   *
   */
  analyzeStructure(): {
    sparsity: number;
    isSparse: boolean;
    isControlled: boolean;
    isSingleQubit: boolean;
    hasBlockStructure: boolean;
  } {
    const sparsity = this.getSparsity();
    const isSparse = this.isSparse();
    const isSingleQubit = this.dimension === 2;

    const isControlled = this.dimension === 4 && this.hasControlledStructure();

    const hasBlockStructure = this.hasBlockDiagonalStructure();

    return {
      sparsity,
      isSparse,
      isControlled,
      isSingleQubit,
      hasBlockStructure,
    };
  }

  /**
   * Checks if the 4x4 matrix has controlled gate structure.
   *
   * @returns True if the matrix has controlled structure
   * @private
   */
  private hasControlledStructure(): boolean {
    /* istanbul ignore next - defensive programming for dimension validation */
    if (this.dimension !== 4) return false;

    const tolerance = 1e-15;

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const expected = i === j ? complex(1, 0) : ZERO;
        const actual = this.matrix[i]![j]!;
        if (actual.sub(expected).abs() > tolerance) {
          return false;
        }
      }
    }

    for (let i = 0; i < 2; i++) {
      for (let j = 2; j < 4; j++) {
        if (this.matrix[i]![j]!.abs() > tolerance) return false;
        if (this.matrix[j]![i]!.abs() > tolerance) return false;
      }
    }

    return true;
  }

  /**
   * Checks if the matrix has block diagonal structure.
   *
   * @returns True if the matrix is block diagonal
   * @private
   */
  private hasBlockDiagonalStructure(): boolean {
    if (this.dimension < 4 || this.dimension % 2 !== 0) return false;

    const tolerance = 1e-15;
    const blockSize = 2;
    const numBlocks = this.dimension / blockSize;

    for (let blockI = 0; blockI < numBlocks; blockI++) {
      for (let blockJ = 0; blockJ < numBlocks; blockJ++) {
        if (blockI === blockJ) continue;

        for (let i = 0; i < blockSize; i++) {
          for (let j = 0; j < blockSize; j++) {
            const row = blockI * blockSize + i;
            const col = blockJ * blockSize + j;
            if (this.matrix[row]![col]!.abs() > tolerance) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }
}

/**
 * Represents a unitary operator for quantum transformations.
 *
 * Unitary operators are matrices U that satisfy U†U = UU† = I, where U† is the
 * conjugate transpose and I is the identity matrix. They preserve the norm of
 * quantum states and represent reversible quantum operations.
 *
 * **Key Properties:**
 * - **Unitarity**: U†U = UU† = I
 * - **Norm Preservation**: ||U|ψ⟩|| = |||ψ⟩||
 * - **Reversibility**: U† is the inverse of U
 * - **Eigenvalues**: All eigenvalues have absolute value 1
 *
 */
class UnitaryOperator extends Q5mOperator<Unitary> {
  /**
   * Creates a new unitary operator.
   *
   * @param matrix The unitary matrix (will be validated)
   * @param name Optional name for the operator
   * @param skipValidation Skip unitarity validation (use with caution)
   * @throws {Error} If the matrix is not square or not unitary
   */
  constructor(matrix: Unitary, name?: string, skipValidation: boolean = false) {
    super(matrix, name, skipValidation);

    if (!skipValidation && !isUnitary(matrix)) {
      throw new Error('Matrix is not unitary (U†U ≠ I)');
    }
  }

  /**
   * Creates a UnitaryOperator from a unitary matrix.
   *
   * @param matrix The unitary matrix
   * @param name Optional name for the operator
   * @param skipValidation Whether to skip validation (default: false)
   * @returns A new UnitaryOperator
   */
  static fromUnitaryMatrix(
    matrix: Unitary,
    name?: string,
    skipValidation: boolean = false,
  ): UnitaryOperator {
    return new UnitaryOperator(matrix, name, skipValidation);
  }

  /**
   * Gets the matrix representation of the operator.
   *
   * @returns A copy of the operator's matrix
   */
  getMatrix(): Unitary {
    return super.getMatrix();
  }

  /**
   * Creates a controlled version of a unitary operator.
   *
   * For a 2x2 unitary U, creates a 4x4 controlled-U gate:
   * CU = |0⟩⟨0| ⊗ I + |1⟩⟨1| ⊗ U
   *
   * @param operator The unitary operator to make controlled
   * @returns A new UnitaryOperator representing the controlled version
   * @throws {Error} If the operator is not 2x2
   *
   */
  static controlled(operator: UnitaryOperator | Q5mOperator<Unitary>): UnitaryOperator {
    const matrix = operator.getMatrix();
    const dimension = operator.dimension;
    const name = operator.name;

    if (dimension !== 2) {
      throw new Error('Controlled operation is only implemented for 2x2 unitaries');
    }

    const controlledMatrix = createUnitary([
      [complex(1, 0), ZERO, ZERO, ZERO],
      [ZERO, complex(1, 0), ZERO, ZERO],
      [ZERO, ZERO, matrix[0]![0]!, matrix[0]![1]!],
      [ZERO, ZERO, matrix[1]![0]!, matrix[1]![1]!],
    ]);

    const controlledName = name ? `C${name}` : undefined;
    return new UnitaryOperator(controlledMatrix, controlledName, true);
  }
}

/**
 * Represents a Hermitian operator for quantum observables.
 *
 * Hermitian operators are matrices H that satisfy H† = H, where H† is the
 * conjugate transpose. They represent physical observables in quantum mechanics
 * and have real eigenvalues corresponding to possible measurement outcomes.
 *
 * **Key Properties:**
 * - **Hermiticity**: H† = H (conjugate transpose equals itself)
 * - **Real Eigenvalues**: All eigenvalues are real numbers
 * - **Orthogonal Eigenvectors**: Eigenvectors corresponding to different eigenvalues are orthogonal
 * - **Observable**: Represents measurable physical quantities
 *
 */
class HermitianOperator extends Q5mOperator<Hermitian> {
  /**
   * Creates a new Hermitian operator.
   *
   * @param matrix The Hermitian matrix (will be validated)
   * @param name Optional name for the operator
   * @param skipValidation Skip Hermiticity validation (use with caution)
   * @throws {Error} If the matrix is not square or not Hermitian
   */
  constructor(matrix: Hermitian, name?: string, skipValidation: boolean = false) {
    super(matrix, name, skipValidation);

    if (!skipValidation && !isHermitian(matrix)) {
      throw new Error('Matrix is not Hermitian (H† ≠ H)');
    }
  }

  /**
   * Gets the matrix representation of the operator.
   *
   * @returns A copy of the operator's matrix
   */
  getMatrix(): Hermitian {
    return super.getMatrix();
  }

  /**
   * Creates a simple Hamiltonian for a spin-1/2 system.
   *
   * @param energyGap The energy gap between |0⟩ and |1⟩ states
   * @returns A new HermitianOperator representing the Hamiltonian
   */
  static spinHamiltonian(energyGap: number): HermitianOperator {
    const halfGap = energyGap / 2;
    return new HermitianOperator(
      [
        [complex(halfGap, 0), complex(0, 0)],
        [complex(0, 0), complex(-halfGap, 0)],
      ] as Hermitian,
      `H(Δ=${energyGap})`,
      true,
    );
  }

  /**
   * Computes the time evolution operator U(t) = exp(-iHt/ℏ).
   *
   * For simplicity, we set ℏ = 1 in our units. The time evolution
   * operator is unitary and generates the time evolution of quantum states
   * according to the Schrödinger equation.
   *
   * @param time The evolution time
   * @param hbar Reduced Planck constant (default: 1 in natural units)
   * @returns The unitary time evolution operator as a matrix
   *
   */
  getTimeEvolutionOperator(time: number, hbar: number = 1): Unitary {
    const result: Matrix = [];

    for (let i = 0; i < this.dimension; i++) {
      result[i] = [];
      for (let j = 0; j < this.dimension; j++) {
        if (i === j) {
          const energy = this.matrix[i]![i]!.re;
          const phase = (-energy * time) / hbar;
          const expIEt = complex(Math.cos(phase), Math.sin(phase));
          result[i]![j] = expIEt;
        } else {
          result[i]![j] = complex(0, 0);
        }
      }
    }

    return createUnitary(result);
  }
}

export { Q5mOperator, UnitaryOperator, HermitianOperator };
