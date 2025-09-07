/**
 * TypeScript declaration file for q5m.js Internal API
 * 
 * Provides type definitions for extension developers to ensure type safety
 * and enable IntelliSense support in development environments.
 * 
 * @version 1.0.0
 * @stability stable
 */

import { Complex } from '../src/math/complex';
import { Circuit } from '../src/core/Circuit';
import { QubitState } from '../src/core/QubitState';

declare module 'q5m' {
  // ===== Core Types =====

  /**
   * API version information
   */
  export interface APIVersion {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    readonly prerelease?: string;
  }

  /**
   * Current Internal API version constant
   */
  export const INTERNAL_API_VERSION: APIVersion;

  // ===== State Management Types =====

  /**
   * Sparse quantum state representation
   */
  export interface SparseData {
    readonly indices: readonly number[];
    readonly amplitudes: readonly Complex[];
    readonly qubitCount: number;
    readonly size: number;
  }

  /**
   * Dense quantum state representation
   */
  export interface DenseData {
    readonly amplitudes: readonly Complex[];
    readonly qubitCount: number;
  }

  /**
   * Unified state data representation
   */
  export type StateData =
    | { readonly type: 'sparse'; readonly qubitCount: number; readonly sparse: SparseData }
    | { readonly type: 'dense'; readonly qubitCount: number; readonly dense: DenseData };

  /**
   * Memory usage statistics for quantum states
   */
  export interface MemoryStats {
    readonly totalMemory: number;
    readonly usedMemory: number;
    readonly sparseRatio: number;
    readonly compressionRatio: number;
  }

  // ===== Circuit Types =====

  /**
   * Quantum circuit instruction
   */
  export interface Instruction {
    readonly type: 'gate' | 'measurement' | 'barrier';
    readonly gate?: string;
    readonly qubits: readonly number[];
    readonly params?: readonly number[];
    readonly classical?: readonly number[];
    readonly metadata?: Readonly<Record<string, unknown>>;
  }

  /**
   * Circuit optimization rule
   */
  export interface OptimizationRule {
    readonly name: string;
    readonly pattern: readonly Instruction[];
    readonly replacement: readonly Instruction[];
    readonly priority?: number;
    readonly condition?: (instructions: readonly Instruction[]) => boolean;
  }

  /**
   * Circuit performance metrics
   */
  export interface PerformanceMetrics {
    readonly executionTime: number;
    readonly memoryUsage: MemoryStats;
    readonly gateCount: number;
    readonly qubitCount: number;
    readonly optimizations: readonly string[];
  }

  // ===== Mathematical Types =====

  /**
   * Matrix representation for quantum operations
   */
  export interface Matrix {
    readonly rows: number;
    readonly cols: number;
    readonly data: readonly (readonly Complex[])[];
  }

  /**
   * Vector representation for quantum states
   */
  export interface Vector {
    readonly size: number;
    readonly data: readonly Complex[];
  }

  // ===== Version Compatibility Types =====

  /**
   * Compatibility check issue
   */
  export interface CompatibilityIssue {
    readonly severity: 'error' | 'warning' | 'info';
    readonly message: string;
    readonly suggestion?: string;
  }

  /**
   * Version compatibility check result
   */
  export interface CompatibilityResult {
    readonly compatible: boolean;
    readonly requiredVersion: string;
    readonly currentVersion: string;
    readonly issues: readonly CompatibilityIssue[];
  }

  /**
   * Extension metadata for validation
   */
  export interface ExtensionMetadata {
    readonly name: string;
    readonly version: string;
    readonly apiVersion: string;
    readonly author?: string;
    readonly description?: string;
    readonly license?: string;
    readonly homepage?: string;
    readonly repository?: string;
    readonly dependencies?: readonly string[];
  }

  /**
   * Extension validation result
   */
  export interface ExtensionValidationResult {
    readonly valid: boolean;
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
  }

  /**
   * Deprecation information
   */
  export interface DeprecationInfo {
    readonly version: string;
    readonly reason: string;
    readonly alternative?: string;
    readonly removeIn?: string;
  }

  // ===== Error Types =====

  /**
   * Internal API error class
   */
  export class InternalAPIError extends Error {
    readonly code: string;
    readonly context?: Readonly<Record<string, unknown>>;

    constructor(
      code: string,
      message: string,
      context?: Readonly<Record<string, unknown>>
    );
  }

  // ===== Internal API Namespace =====

  /**
   * Stable Internal API for extension developers
   * 
   * This namespace provides guaranteed backward compatibility within major versions
   * and should be used by all extension packages to ensure stability.
   */
  export namespace Internal {
    // ===== State Access API =====

    /**
     * Quantum state access and manipulation utilities
     */
    export class State {
      /**
       * Get amplitudes from a quantum state (safe copy)
       * @param state The quantum state
       * @returns Copy of state amplitudes
       * @throws {InternalAPIError} If state is invalid
       */
      static getAmplitudes(state: QubitState): Complex[];

      /**
       * Set amplitudes in a quantum state (creates new state)
       * @param state The original quantum state
       * @param amplitudes New amplitudes array
       * @returns New quantum state with updated amplitudes
       * @throws {InternalAPIError} If state or amplitudes are invalid
       */
      static setAmplitudes(state: QubitState, amplitudes: readonly Complex[]): QubitState;

      /**
       * Get sparse representation of quantum state
       * @param state The quantum state
       * @param threshold Minimum amplitude magnitude to include (default: 1e-14)
       * @returns Sparse data representation
       * @throws {InternalAPIError} If state is invalid
       */
      static getSparseData(state: QubitState, threshold?: number): SparseData;

      /**
       * Get dense representation of quantum state
       * @param state The quantum state
       * @returns Dense data representation
       * @throws {InternalAPIError} If state is invalid
       */
      static getDenseData(state: QubitState): DenseData;

      /**
       * Get complete state data with automatic format selection
       * @param state The quantum state
       * @param forceFormat Force specific format ('sparse' | 'dense')
       * @returns State data in optimal format
       * @throws {InternalAPIError} If state is invalid
       */
      static getStateData(state: QubitState, forceFormat?: 'sparse' | 'dense'): StateData;

      /**
       * Create quantum state from state data
       * @param stateData The state data
       * @returns New quantum state
       * @throws {InternalAPIError} If state data is invalid
       */
      static fromStateData(stateData: StateData): QubitState;

      /**
       * Get memory usage statistics for a quantum state
       * @param state The quantum state
       * @returns Memory statistics
       * @throws {InternalAPIError} If state is invalid
       */
      static getMemoryStats(state: QubitState): MemoryStats;

      /**
       * Get basic information about a quantum state
       * @param state The quantum state
       * @returns State information
       */
      static getStateInfo(state: QubitState): Readonly<Record<string, unknown>>;

      /**
       * Validate quantum state normalization
       * @param state The quantum state
       * @param tolerance Tolerance for normalization check (default: 1e-10)
       * @returns True if state is properly normalized
       * @throws {InternalAPIError} If state is invalid
       */
      static isNormalized(state: QubitState, tolerance?: number): boolean;
    }

    // ===== Circuit Access API =====

    /**
     * Quantum circuit access and manipulation utilities
     */
    export class Circuit {
      /**
       * Get instructions from a quantum circuit
       * @param circuit The quantum circuit
       * @returns Array of circuit instructions
       * @throws {InternalAPIError} If circuit is invalid
       */
      static getInstructions(circuit: Circuit): Instruction[];

      /**
       * Create a new circuit with an instruction inserted at a specific position
       * @param circuit The original circuit
       * @param index Position to insert the instruction
       * @param instruction The instruction to insert
       * @returns New circuit with instruction inserted
       * @throws {InternalAPIError} If parameters are invalid
       */
      static insertInstruction(
        circuit: Circuit,
        index: number,
        instruction: Instruction
      ): Circuit;

      /**
       * Optimize a quantum circuit using optimization rules
       * @param circuit The circuit to optimize
       * @param rules Array of optimization rules to apply
       * @returns Optimized circuit
       * @throws {InternalAPIError} If circuit or rules are invalid
       */
      static optimizeCircuit(circuit: Circuit, rules: readonly OptimizationRule[]): Circuit;

      /**
       * Get performance metrics for a quantum circuit
       * @param circuit The quantum circuit
       * @returns Performance metrics
       * @throws {InternalAPIError} If circuit is invalid
       */
      static getPerformanceMetrics(circuit: Circuit): PerformanceMetrics;

      /**
       * Create a deep copy of a quantum circuit
       * @param circuit The circuit to copy
       * @returns New circuit with same structure
       * @throws {InternalAPIError} If circuit is invalid
       */
      static cloneCircuit(circuit: Circuit): Circuit;

      /**
       * Merge multiple circuits into a single circuit
       * @param circuits Array of circuits to merge
       * @returns Merged circuit
       * @throws {InternalAPIError} If circuits are invalid
       */
      static mergeCircuits(circuits: readonly Circuit[]): Circuit;

      /**
       * Validate circuit structure and operations
       * @param circuit The circuit to validate
       * @returns Validation result with issues
       */
      static validateCircuit(circuit: Circuit): {
        readonly valid: boolean;
        readonly issues: readonly string[];
      };

      /**
       * Get basic information about a quantum circuit
       * @param circuit The quantum circuit
       * @returns Circuit information
       */
      static getCircuitInfo(circuit: Circuit): Readonly<Record<string, unknown>>;
    }

    // ===== Mathematical Utilities API =====

    /**
     * Mathematical operations for quantum computing
     */
    export class Math {
      /**
       * Create a complex number
       * @param real Real part
       * @param imag Imaginary part (default: 0)
       * @returns Complex number
       * @throws {InternalAPIError} If parameters are invalid
       */
      static complex(real: number, imag?: number): Complex;

      /**
       * Add two complex numbers
       * @param a First complex number
       * @param b Second complex number
       * @returns Sum of complex numbers
       * @throws {InternalAPIError} If parameters are invalid
       */
      static addComplex(a: Complex, b: Complex): Complex;

      /**
       * Multiply two complex numbers
       * @param a First complex number
       * @param b Second complex number
       * @returns Product of complex numbers
       * @throws {InternalAPIError} If parameters are invalid
       */
      static multiplyComplex(a: Complex, b: Complex): Complex;

      /**
       * Calculate the magnitude (absolute value) of a complex number
       * @param z Complex number
       * @returns Magnitude
       * @throws {InternalAPIError} If parameter is invalid
       */
      static magnitude(z: Complex): number;

      /**
       * Calculate the phase (argument) of a complex number
       * @param z Complex number
       * @returns Phase in radians
       * @throws {InternalAPIError} If parameter is invalid
       */
      static phase(z: Complex): number;

      /**
       * Create a complex number from polar coordinates
       * @param magnitude Magnitude (r)
       * @param phase Phase in radians (θ)
       * @returns Complex number
       * @throws {InternalAPIError} If parameters are invalid
       */
      static fromPolar(magnitude: number, phase: number): Complex;

      /**
       * Create an identity matrix
       * @param size Matrix size
       * @returns Identity matrix
       * @throws {InternalAPIError} If size is invalid
       */
      static identityMatrix(size: number): Matrix;

      /**
       * Create a zero matrix
       * @param rows Number of rows
       * @param cols Number of columns (default: same as rows)
       * @returns Zero matrix
       * @throws {InternalAPIError} If dimensions are invalid
       */
      static zeroMatrix(rows: number, cols?: number): Matrix;

      /**
       * Multiply two matrices
       * @param a First matrix
       * @param b Second matrix
       * @returns Product matrix
       * @throws {InternalAPIError} If matrices are invalid or incompatible
       */
      static multiplyMatrix(a: Matrix, b: Matrix): Matrix;

      /**
       * Apply matrix to vector
       * @param matrix Matrix to apply
       * @param vector Vector to transform
       * @returns Transformed vector
       * @throws {InternalAPIError} If dimensions are incompatible
       */
      static applyMatrix(matrix: Matrix, vector: Vector): Vector;

      /**
       * Calculate tensor product of two matrices
       * @param a First matrix
       * @param b Second matrix
       * @returns Tensor product matrix
       * @throws {InternalAPIError} If matrices are invalid
       */
      static tensorProduct(a: Matrix, b: Matrix): Matrix;

      /**
       * Normalize a vector
       * @param vector Vector to normalize
       * @returns Normalized vector
       * @throws {InternalAPIError} If vector is invalid or zero
       */
      static normalizeVector(vector: Vector): Vector;

      /**
       * Calculate inner product of two vectors
       * @param a First vector
       * @param b Second vector
       * @returns Inner product (complex conjugate of a with b)
       * @throws {InternalAPIError} If vectors are invalid or incompatible
       */
      static innerProduct(a: Vector, b: Vector): Complex;

      /**
       * Check if two complex numbers are approximately equal
       * @param a First complex number
       * @param b Second complex number
       * @param tolerance Tolerance for comparison (default: 1e-10)
       * @returns True if approximately equal
       * @throws {InternalAPIError} If parameters are invalid
       */
      static isApproximatelyEqual(a: Complex, b: Complex, tolerance?: number): boolean;
    }

    // ===== Version and Compatibility API =====

    /**
     * Current API version
     */
    export const VERSION: APIVersion;

    /**
     * Check version compatibility
     * @param requiredVersion Required API version string
     * @returns Compatibility check result
     */
    export function checkCompatibility(requiredVersion: string): CompatibilityResult;

    /**
     * Show deprecation warning for an API
     * @param apiName Name of the deprecated API
     * @param deprecationInfo Deprecation information
     */
    export function deprecationWarning(apiName: string, deprecationInfo: DeprecationInfo): void;

    /**
     * Validate extension metadata
     * @param metadata Extension metadata to validate
     * @returns Validation result
     */
    export function validateExtension(metadata: ExtensionMetadata): ExtensionValidationResult;
  }

  // ===== Module Exports =====

  /**
   * Re-export Internal namespace for convenience
   */
  export { Internal };

  /**
   * Re-export common types for extension developers
   */
  export {
    InternalAPIError,
    APIVersion,
    SparseData,
    DenseData,
    StateData,
    MemoryStats,
    Instruction,
    OptimizationRule,
    PerformanceMetrics,
    Matrix,
    Vector,
    CompatibilityResult,
    CompatibilityIssue,
    ExtensionMetadata,
    ExtensionValidationResult,
    DeprecationInfo
  };
}