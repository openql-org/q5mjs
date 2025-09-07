// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @fileoverview Quantum state base class with hybrid representation support.
 */

import { complex, ZERO } from '../math/complex';
import type { Complex } from '../math/complex';
import { Q5mOperator } from './Q5mOperator';
import type { UnitaryOperator } from './Q5mOperator';
import type { Matrix, Unitary, Hermitian } from '../math/math-utils';
import type { Q5mIndex } from './Q5mMaterial';
import type { Probability } from './Results';
import type { Amplitude } from '../math/math-utils';
import { normalizeAmplitudes } from '../math/math-utils';
import type { DensityMatrix, StateVector } from './Q5mMaterial';
import { Q5mMaterial } from './Q5mMaterial';
import { matXvec, matXvecSparse } from '../math/vector-matrix';

/** Quantum state representation types */
enum RepType {
  DENSE = 'dense',
  SPARSE = 'sparse',
  CSR = 'csr',
}

/** Interface for quantum states that can apply unitary operators. */
interface Q5mApplicable<TOperator = Q5mOperator<Unitary>> {
  /** Applies a quantum operator to this quantum state. */
  apply(operator: TOperator): Q5mState;
}

/** Compressed Sparse Row (CSR) format for efficient sparse matrix storage. */
interface CSRFormat {
  /** Non-zero complex amplitudes stored consecutively in row-major order */
  readonly values: StateVector;

  /** Row pointers: rowPtr[i] indicates the start index in values array for row i */
  readonly rowPtr: number[];

  /** Column indices corresponding to each non-zero element (always 0 for vectors) */
  readonly colInd: number[];

  /** Total number of non-zero elements for quick sparsity calculations */
  readonly nnz: number;

  /** Number of rows (state space dimension = 2^numQubits) */
  readonly rows: number;
}

/** TypedArray-based CSR format for improved memory efficiency. */
interface OptimizedCSRFormat {
  /** Real parts of non-zero values */
  readonly valuesReal: Float64Array;

  /** Imaginary parts of non-zero values */
  readonly valuesImag: Float64Array;

  /** Row pointers using 32-bit integers */
  readonly rowPtr: Uint32Array;

  /** Column indices using 32-bit integers */
  readonly colInd: Uint32Array;

  /** Total number of non-zero elements */
  readonly nnz: number;

  /** Number of rows */
  readonly rows: number;
}

/** Configuration for sparse representation selection. */
interface SparseConfig {
  /** Sparsity threshold for DENSE → SPARSE transition */
  readonly denseToSparseThreshold: number;

  /** Sparsity threshold for SPARSE → CSR transition */
  readonly sparseToCSRThreshold: number;

  /** Size threshold for automatic CSR consideration */
  readonly csrSizeThreshold: number;

  /** Enable automatic representation optimization */
  readonly autoOptimize: boolean;
}

/** Default configuration for sparse optimization. */
const DEFAULT_SPARSE_CONFIG: SparseConfig = {
  denseToSparseThreshold: 0.15, // More aggressive sparse usage (was 0.3)
  sparseToCSRThreshold: 0.12, // Better CSR utilization (was 0.05)
  csrSizeThreshold: 1024, // Earlier CSR adoption (was 4096)
  autoOptimize: true,
} as const;

/** Discriminated union types for type-safe representation handling. */
interface DenseState {
  rep: RepType.DENSE;
  stateVector: Amplitude[];
  sparseAmplitudes?: undefined;
  csrData?: undefined;
  optimizedCSRData?: undefined;
}

interface SparseState {
  rep: RepType.SPARSE;
  stateVector?: undefined;
  sparseAmplitudes: Map<number, Amplitude>;
  csrData?: undefined;
  optimizedCSRData?: undefined;
}

interface CSRState {
  rep: RepType.CSR;
  stateVector?: undefined;
  sparseAmplitudes?: undefined;
  csrData: CSRFormat;
  optimizedCSRData?: OptimizedCSRFormat | undefined;
}

/** Union type for all valid representation states. */
type RepState = DenseState | SparseState | CSRState;

/** Abstract base class for quantum states with state vector representation. */
abstract class Q5mState<
  TMaterial extends Q5mMaterial<StateVector | DensityMatrix> = Q5mMaterial<StateVector>,
> {
  /** The total number of basis states in the Hilbert space (its dimension). */
  protected stateCount: number;

  /** The number of quantum units (e.g., qubits, qutrits) in this state. */
  protected numQuantum: number;

  /** The quantum material associated with this state. */
  protected material: TMaterial;

  /** The state vector containing quantum amplitudes for each basis state. Optional for sparse representations. */
  protected stateVector?: Amplitude[];

  /** Sparse representation using Map for memory optimization */
  protected sparseAmplitudes?: Map<number, Amplitude> | undefined;

  /** CSR (Compressed Sparse Row) representation for large sparse states */
  protected csrData?: CSRFormat | undefined;

  /** Optimized CSR representation using TypedArrays */
  protected optimizedCSRData?: OptimizedCSRFormat | undefined;

  /** Current representation type */
  protected rep: RepType = RepType.DENSE;

  /** Configuration for sparse optimization */
  protected sparseConfig: SparseConfig = DEFAULT_SPARSE_CONFIG;

  /** Cached amplitude array for performance */
  private _memoizedAmplitudes: Amplitude[] | undefined = undefined;

  /** Cache version for invalidation tracking */
  private _amplitudesVersion: number = 0;

  /** Flag indicating whether dense or sparse representation is currently used (backward compatibility) */
  protected get isDense(): boolean {
    return this.rep === RepType.DENSE;
  }

  /** Creates a Q5mState with the specified number of quantum units and optional state vector. */
  protected constructor(
    numQuantum: number,
    stateVector?: Amplitude[],
    enableSparse?: boolean,
    material?: TMaterial,
  ) {
    if (numQuantum <= 0) {
      throw new Error('Number of quantum units must be positive');
    }

    this.numQuantum = numQuantum;
    this.stateCount = this.calculateStateCount(numQuantum);
    this.material = material || (new Q5mMaterial(this.stateCount) as TMaterial);

    if (stateVector) {
      if (stateVector.length !== this.stateCount) {
        throw new Error(
          `State vector size ${stateVector.length} does not match expected size ${this.stateCount} for ${numQuantum} quantum units`,
        );
      }

      const norm = Math.sqrt(stateVector.reduce((sum, amplitude) => sum + amplitude.abs() ** 2, 0));
      if (norm === 0) {
        throw new Error('Cannot normalize zero vector');
      }

      this.stateVector = [...stateVector];
    } else {
      this.stateVector = Array.from({ length: this.stateCount }, () => complex(0, 0));
      this.stateVector[0] = complex(1, 0);
    }

    if (enableSparse && this.stateVector) {
      this.chooseSparseRepresentation(this.stateVector);
    } else {
      this.rep = RepType.DENSE;
      this.sparseAmplitudes = undefined;
      this.csrData = undefined;
      this.optimizedCSRData = undefined;
    }
  }

  /** Calculates the state space dimension for the given number of quantum units. */
  abstract calculateStateCount(numQuantum: number): number;

  /** Returns the effective number of quantum units (e.g., qubits) in this state. */
  quantumCount(): number {
    return this.numQuantum;
  }

  /** Type-safe getter for representation state. */
  protected getRepState(): RepState {
    switch (this.rep) {
      case RepType.DENSE:
        return {
          rep: RepType.DENSE,
          stateVector: this.stateVector || Array.from({ length: this.stateCount }, () => ZERO),
          sparseAmplitudes: undefined,
          csrData: undefined,
          optimizedCSRData: undefined,
        };

      case RepType.SPARSE:
        return {
          rep: RepType.SPARSE,
          stateVector: undefined,
          sparseAmplitudes:
            this.sparseAmplitudes || /* istanbul ignore next */ new Map<number, Amplitude>(),
          csrData: undefined,
          optimizedCSRData: undefined,
        };

      case RepType.CSR:
        return {
          rep: RepType.CSR,
          stateVector: undefined,
          sparseAmplitudes: undefined,
          csrData: this.csrData || {
            values: [],
            rowPtr: [0],
            colInd: [],
            nnz: 0,
            rows: this.stateCount,
          },
          optimizedCSRData: this.optimizedCSRData,
        };

      default:
        console.warn(`Unknown representation type: ${String(this.rep)}. Falling back to ZERO.`);
        return {
          rep: RepType.DENSE,
          stateVector: Array.from({ length: this.stateCount }, () => ZERO),
          sparseAmplitudes: undefined,
          csrData: undefined,
          optimizedCSRData: undefined,
        };
    }
  }

  /**
   * Returns the full array of quantum amplitudes of the quantum state.
   * Uses memoization to reduce memory allocations for repeated access.
   * @returns Array of quantum amplitudes.
   * @remarks Do not modify the returned array directly.
   */
  amplitudes(): Amplitude[] {
    // Return cached amplitudes if available
    if (this._memoizedAmplitudes && this._amplitudesVersion > 0) {
      return this._memoizedAmplitudes;
    }

    // Compute amplitudes from current representation
    let amplitudes: Amplitude[];
    switch (this.rep) {
      case RepType.DENSE:
        amplitudes = this.stateVector
          ? normalizeAmplitudes([...this.stateVector])
          : Array.from({ length: this.stateCount }, () => ZERO);
        break;

      case RepType.SPARSE:
        amplitudes = this.getAmplitudesFromSparse();
        break;

      case RepType.CSR:
        amplitudes = this.getAmplitudesFromCSR();
        break;

      default:
        console.warn(
          `Unhandled representation type in amplitudes(): ${String(this.rep)}, returning zero array`,
        );
        amplitudes = Array.from({ length: this.stateCount }, () => ZERO);
    }

    // Cache and return amplitudes
    this._memoizedAmplitudes = amplitudes;
    this._amplitudesVersion = 1;
    return amplitudes;
  }

  /** Reconstruct full state vector from sparse Map representation. */
  protected getAmplitudesFromSparse(): Amplitude[] {
    const fullState = Array.from({ length: this.stateCount }, () => ZERO);
    if (this.sparseAmplitudes) {
      for (const [index, amplitude] of this.sparseAmplitudes) {
        fullState[index] = amplitude;
      }
    }
    return fullState;
  }

  /** Reconstruct full state vector from CSR representation. */
  protected getAmplitudesFromCSR(): Amplitude[] {
    const fullState = Array.from({ length: this.stateCount }, () => ZERO);

    if (this.csrData) {
      const { values, colInd } = this.csrData;
      for (let i = 0; i < colInd.length; i++) {
        const index = colInd[i]!;
        fullState[index] = values[i]!;
      }
      return fullState;
    }

    if (!this.optimizedCSRData) {
      return fullState;
    }

    const { valuesReal, valuesImag, colInd } = this.optimizedCSRData;

    for (let i = 0; i < colInd.length; i++) {
      const index = colInd[i]!;
      fullState[index] = complex(valuesReal[i]!, valuesImag[i]);
    }

    return fullState;
  }

  /** Returns the measurement probabilities for all computational basis states. */
  probabilities(): Probability[] {
    const amps = this.amplitudes();
    return amps.map((amplitude) => amplitude.abs() ** 2);
  }

  /** Returns the probability of measuring a specific computational basis state. */
  probability(basisIndex: number): number {
    return this.amplitude(basisIndex).abs() ** 2;
  }

  /** Returns the quantum amplitude for a specific computational basis state. */
  amplitude(basisIndex: Q5mIndex): Amplitude {
    if (basisIndex < 0 || basisIndex >= this.stateCount) {
      throw new Error(`Basis index ${basisIndex} out of range [0, ${this.stateCount - 1}]`);
    }

    const state = this.getRepState();
    switch (state.rep) {
      case RepType.DENSE:
        return state.stateVector[basisIndex] || ZERO;

      case RepType.SPARSE:
        return state.sparseAmplitudes.get(basisIndex) || ZERO;

      case RepType.CSR:
        return this.getCSRAmplitude(basisIndex);

      default:
        console.warn(`Unknown representation type: ${this.rep}. Falling back to ZERO.`);
        return ZERO;
    }
  }

  /** Get amplitude from CSR representation. */
  protected getCSRAmplitude(basisIndex: number): Amplitude {
    if (this.csrData) {
      const { values, colInd } = this.csrData;

      for (let i = 0; i < colInd.length; i++) {
        if (colInd[i] === basisIndex) {
          return values[i]!;
        }
      }
      return ZERO;
    }

    if (!this.optimizedCSRData) {
      return ZERO;
    }

    const { valuesReal, valuesImag, colInd } = this.optimizedCSRData;

    for (let i = 0; i < colInd.length; i++) {
      if (colInd[i] === basisIndex) {
        return complex(valuesReal[i]!, valuesImag[i]);
      }
    }

    return ZERO;
  }

  /** Applies a unitary transformation to the quantum state. */
  abstract apply(unitary: Q5mOperator<Unitary>): Q5mState;

  /** Evolves the quantum state in time according to a Hamiltonian operator. */
  evolve(hamiltonian: Q5mOperator<Hermitian>, time: number, hbar: number = 1): Q5mState {
    const evolutionMatrix = hamiltonian.getTimeEvolutionOperator(time, hbar);

    const evolutionOperator = new Q5mOperator<Unitary>(evolutionMatrix, `U(${time})`, true);

    return this.apply(evolutionOperator);
  }

  /** Returns a normalized copy of this quantum state. */
  abstract normalize(): Q5mState;

  /** Creates a new quantum state with the specified amplitudes. */
  abstract withAmplitudes(newAmplitudes: Amplitude[]): Q5mState;

  /** Invalidates memoized amplitude cache when state changes. */
  protected invalidateAmplitudesCache(): void {
    this._memoizedAmplitudes = undefined;
    this._amplitudesVersion = 0;
  }

  /** Selects the appropriate representation for the quantum state. */
  protected chooseSparseRepresentation(stateVector: Amplitude[]): void {
    const amplitudes = new Map<number, Amplitude>();
    let nonZeroCount = 0;
    const TOLERANCE = 1e-12; // Improved tolerance for better quantum precision

    for (let i = 0; i < stateVector.length; i++) {
      const amplitude = stateVector[i]!;
      if (amplitude.abs() > TOLERANCE) {
        amplitudes.set(i, amplitude);
        nonZeroCount++;
      }
    }

    const representationType = this.selectRepType(stateVector.length, nonZeroCount);

    switch (representationType) {
      case RepType.DENSE:
        this.rep = RepType.DENSE;
        this.sparseAmplitudes = undefined;
        this.csrData = undefined;
        this.optimizedCSRData = undefined;
        break;

      case RepType.SPARSE:
        this.rep = RepType.SPARSE;
        this.sparseAmplitudes = amplitudes;
        this.csrData = undefined;
        this.optimizedCSRData = undefined;
        delete this.stateVector;
        break;

      case RepType.CSR:
        this.rep = RepType.CSR;
        this.sparseAmplitudes = undefined;
        this.csrData = this.createCSRFromSparse(amplitudes, stateVector.length);
        this.optimizedCSRData = this.optimizeCSRFormat(this.csrData);
        delete this.stateVector;
        break;
    }

    // Invalidate amplitude cache since representation changed
    this.invalidateAmplitudesCache();
  }

  /** Select the best representation type based on size and sparsity. */
  protected selectRepType(size: number, nonZeroCount: number): RepType {
    const sparsity = nonZeroCount / size;

    // Small systems: use dense for cache efficiency
    if (size <= 16) {
      return RepType.DENSE;
    }

    // Medium systems: optimized thresholds
    if (size <= 256) {
      if (sparsity >= 0.2) {
        return RepType.DENSE;
      }
    } else if (size <= 4096) {
      if (sparsity >= this.sparseConfig.denseToSparseThreshold) {
        return RepType.DENSE;
      }
    } else {
      // Large systems: aggressive sparse usage
      if (sparsity >= 0.08) {
        return RepType.DENSE;
      }
    }

    // Calculate memory usage for representation selection
    const sparseMemory = nonZeroCount * 40; // Complex + Map overhead
    const csrMemory = nonZeroCount * 16 + (nonZeroCount + size + 1) * 4; // Values + indices

    if (this.shouldUseCSRRepresentation(size, sparsity, nonZeroCount, sparseMemory, csrMemory)) {
      return RepType.CSR;
    }

    return RepType.SPARSE;
  }

  /** Determine if CSR representation should be used. */
  protected shouldUseCSRRepresentation(
    size: number,
    sparsity: number,
    nonZeroCount: number,
    sparseMemory: number,
    csrMemory: number,
  ): boolean {
    if (size < this.sparseConfig.csrSizeThreshold || nonZeroCount < 50) {
      return false;
    }

    const sparseIsBetter = sparsity <= this.sparseConfig.sparseToCSRThreshold;
    const csrMemoryBetter = csrMemory < sparseMemory * 0.85;
    const sizeJustifiesCSR = size >= 512;

    if (size > 16384) {
      return sparsity <= 0.15 && nonZeroCount > 100;
    }

    return sparseIsBetter && csrMemoryBetter && sizeJustifiesCSR;
  }

  /** Create CSR format from sparse Map representation. */
  protected createCSRFromSparse(sparseMap: Map<number, Complex>, totalSize: number): CSRFormat {
    const entries = Array.from(sparseMap.entries()).sort(([a], [b]) => a - b);
    const nnz = entries.length;

    const values: StateVector = entries.map(([, value]) => value);
    const colInd: number[] = entries.map(([index]) => index);
    const rowPtr: number[] = new Array<number>(totalSize + 1);

    let currentNonZero = 0;
    for (let i = 0; i <= totalSize; i++) {
      rowPtr[i] = currentNonZero;
      if (currentNonZero < entries.length && entries[currentNonZero]![0] === i) {
        currentNonZero++;
      }
    }

    return {
      values,
      rowPtr,
      colInd,
      nnz,
      rows: totalSize,
    };
  }

  /** Convert CSR format to memory-optimized TypedArray format. */
  protected optimizeCSRFormat(csr: CSRFormat): OptimizedCSRFormat {
    const valuesReal = new Float64Array(csr.nnz);
    const valuesImag = new Float64Array(csr.nnz);

    for (let i = 0; i < csr.nnz; i++) {
      valuesReal[i] = csr.values[i]!.re;
      valuesImag[i] = csr.values[i]!.im;
    }

    return {
      valuesReal,
      valuesImag,
      rowPtr: new Uint32Array(csr.rowPtr),
      colInd: new Uint32Array(csr.colInd),
      nnz: csr.nnz,
      rows: csr.rows,
    };
  }

  /** Calculates the estimated memory usage for the current quantum state. */
  memoryUsage(): number {
    const complexSize = 16;

    if (this.rep !== RepType.DENSE && this.rep !== RepType.SPARSE && this.rep !== RepType.CSR) {
      console.warn(
        `Unhandled representation type in memoryUsage(): ${String(this.rep)}, returning 0`,
      );
      return 0;
    }

    /* istanbul ignore next */
    switch (this.rep) {
      case RepType.DENSE:
        if (!this.stateVector) {
          console.warn(`Dense representation has no stateVector, returning 0`);
          return 0;
        }
        return this.stateVector.length * complexSize;

      case RepType.SPARSE:
        if (!this.sparseAmplitudes) {
          console.warn(`Sparse representation has no sparseAmplitudes, returning 0`);
          return 0;
        }
        return this.sparseAmplitudes.size * (complexSize + 8);

      case RepType.CSR:
        if (!this.csrData) {
          console.warn(`CSR representation has no csrData, returning 0`);
          return 0;
        }
        return this.calculateCSRMemoryUsage();

      default:
        /* istanbul ignore next - Unreachable due to early return at line 585 handling all invalid enum values */
        return 0;
    }
  }

  /** Calculate memory usage for CSR representation. */
  protected calculateCSRMemoryUsage(): number {
    if (this.csrData) {
      const { values, rowPtr, colInd } = this.csrData;

      const complexSize = 16;
      return values.length * complexSize + rowPtr.length * 4 + colInd.length * 4;
    }

    if (!this.optimizedCSRData) {
      return 0;
    }

    const { valuesReal, valuesImag, rowPtr, colInd } = this.optimizedCSRData;

    return valuesReal.byteLength + valuesImag.byteLength + rowPtr.byteLength + colInd.byteLength;
  }

  /** Perform efficient matrix-vector multiplication for CSR representation. */
  protected applyUnitaryCSR(unitaryMatrix: Matrix): Amplitude[] {
    const n = this.stateCount;
    const result: Amplitude[] = Array.from({ length: n }, () => ZERO);

    if (this.csrData) {
      const { values, colInd } = this.csrData;

      for (let i = 0; i < n; i++) {
        let sum = ZERO;

        for (let k = 0; k < colInd.length; k++) {
          const j = colInd[k]!;
          const stateValue = values[k]!;

          const matrixElement = unitaryMatrix[i]![j]!;
          sum = sum.add(matrixElement.mul(stateValue));
        }

        result[i] = sum;
      }

      return result;
    }

    if (!this.optimizedCSRData) {
      throw new Error('CSR data not available for CSR multiplication');
    }

    const { valuesReal, valuesImag, colInd } = this.optimizedCSRData;

    for (let i = 0; i < n; i++) {
      let sum = ZERO;

      for (let k = 0; k < colInd.length; k++) {
        const j = colInd[k]!;
        const stateReal = valuesReal[k]!;
        const stateImag = valuesImag[k]!;
        const stateValue = complex(stateReal, stateImag);

        const matrixElement = unitaryMatrix[i]![j]!;
        sum = sum.add(matrixElement.mul(stateValue));
      }

      result[i] = sum;
    }

    return result;
  }

  /** Perform efficient sparse matrix-vector multiplication when both matrix and vector are sparse. */
  protected applyUnitarySparseCSR(sparseMatrix: OptimizedCSRFormat): Amplitude[] {
    if (!this.optimizedCSRData) {
      throw new Error('CSR data not available for sparse CSR multiplication');
    }

    const n = this.stateCount;
    const result: Amplitude[] = Array.from({ length: n }, () => ZERO);

    for (let i = 0; i < n; i++) {
      const rowStart = sparseMatrix.rowPtr[i]!;
      const rowEnd = sparseMatrix.rowPtr[i + 1]!;

      if (rowStart === rowEnd) continue;

      let sum = ZERO;

      for (let matIdx = rowStart; matIdx < rowEnd; matIdx++) {
        const j = sparseMatrix.colInd[matIdx]!;
        const matReal = sparseMatrix.valuesReal[matIdx]!;
        const matImag = sparseMatrix.valuesImag[matIdx]!;
        const matrixElement = complex(matReal, matImag);

        const stateElement = this.getCSRAmplitude(j);
        if (stateElement.abs() > 1e-15) {
          sum = sum.add(matrixElement.mul(stateElement));
        }
      }

      result[i] = sum;
    }

    return result;
  }

  /** Applies unitary matrix multiplication with representation-aware algorithms. */
  protected applyUnitaryOptimized(
    unitaryMatrix: Matrix,
    unitaryOperator?: UnitaryOperator,
  ): Amplitude[] {
    this.invalidateAmplitudesCache();
    if (
      unitaryOperator &&
      this.sparseConfig.autoOptimize &&
      typeof unitaryOperator.analyzeStructure === 'function'
    ) {
      const analysis = unitaryOperator.analyzeStructure();

      if (analysis.isControlled && this.rep === RepType.CSR) {
        return this.applyControlledGateCSR(unitaryMatrix);
      }

      if (analysis.isSingleQubit && this.stateCount > 4) {
        return this.applySingleQubitGateOptimized(unitaryMatrix);
      }

      if (analysis.hasBlockStructure) {
        return this.applyBlockStructuredGate(unitaryMatrix);
      }
    }

    switch (this.rep) {
      case RepType.DENSE:
        return this.applyUnitaryDense(unitaryMatrix);

      case RepType.SPARSE:
        return this.applyUnitarySparse(unitaryMatrix);

      case RepType.CSR:
        return this.applyUnitaryCSR(unitaryMatrix);

      default:
        console.warn(
          `Unhandled representation type in applyUnitary(): ${String(this.rep)}, falling back to dense`,
        );
        return this.applyUnitaryDense(unitaryMatrix);
    }
  }

  /** Optimized application of controlled gates for CSR representation. */
  protected applyControlledGateCSR(controlledMatrix: Matrix): Amplitude[] {
    const newState: Amplitude[] = Array.from({ length: this.stateCount }, () => ZERO);

    if (!this.optimizedCSRData) {
      return this.applyUnitaryDense(controlledMatrix);
    }

    const { valuesReal, valuesImag, colInd } = this.optimizedCSRData;

    const targetUnitary = [
      [controlledMatrix[2]![2]!, controlledMatrix[2]![3]!],
      [controlledMatrix[3]![2]!, controlledMatrix[3]![3]!],
    ];

    for (let k = 0; k < colInd.length; k++) {
      const index = colInd[k]!;
      newState[index] = complex(valuesReal[k]!, valuesImag[k]);
    }

    for (let k = 0; k < colInd.length; k++) {
      const index = colInd[k]!;
      const controlBit = (index >> (this.numQuantum - 1)) & 1;

      if (controlBit === 1) {
        const targetIndex = index & ((1 << (this.numQuantum - 1)) - 1);
        const targetBit = targetIndex & 1;

        const amplitude = complex(valuesReal[k]!, valuesImag[k]);
        const flippedTargetIndex = index ^ 1;

        newState[index] = targetUnitary[targetBit]![targetBit]!.mul(amplitude);
        const existingAmplitude = newState[flippedTargetIndex] || /* istanbul ignore next */ ZERO;
        newState[flippedTargetIndex] = existingAmplitude.add(
          targetUnitary[1 - targetBit]![targetBit]!.mul(amplitude),
        );
      }
    }

    return newState;
  }

  /** Optimized application of single-qubit gates to large quantum systems. */
  protected applySingleQubitGateOptimized(singleQubitMatrix: Matrix): Amplitude[] {
    return this.applyUnitarySparse(singleQubitMatrix);
  }

  /** Optimized application of block-structured gates. */
  protected applyBlockStructuredGate(blockMatrix: Matrix): Amplitude[] {
    switch (this.rep) {
      case RepType.DENSE:
        return this.applyUnitaryDense(blockMatrix);
      case RepType.SPARSE:
        return this.applyUnitarySparse(blockMatrix);
      case RepType.CSR:
        return this.applyUnitaryCSR(blockMatrix);
      default:
        console.warn(
          `Unhandled representation type in applyBlockStructuredGate(): ${String(this.rep)}, falling back to dense`,
        );
        return this.applyUnitaryDense(blockMatrix);
    }
  }

  /**
   * Standard dense matrix-vector multiplication.
   * Uses optimized implementation from math/vector-matrix.ts
   *
   * @param unitaryMatrix Dense unitary matrix
   * @returns New state vector after multiplication
   * @protected
   */
  protected applyUnitaryDense(unitaryMatrix: Matrix): Amplitude[] {
    const currentState = this.amplitudes();
    return matXvec(unitaryMatrix, currentState);
  }

  /**
   * Sparse matrix-vector multiplication for sparse Map representation.
   * Uses optimized implementation from math/vector-matrix.ts
   *
   * @param unitaryMatrix Dense unitary matrix
   * @returns New state vector after multiplication
   * @protected
   */
  protected applyUnitarySparse(unitaryMatrix: Matrix): Amplitude[] {
    if (!this.sparseAmplitudes) {
      return Array.from({ length: this.stateCount }, () => ZERO);
    }

    return matXvecSparse(unitaryMatrix, this.sparseAmplitudes, this.stateCount);
  }
}

export type { Q5mApplicable };
export { RepType, Q5mState };
