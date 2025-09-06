/**
 * Main TypeScript declaration file for q5m.js
 * 
 * This file provides complete type definitions for the q5m.js quantum computing
 * library, including core APIs, Internal APIs, and Plugin System.
 * 
 * @version 1.0.0
 * @author OpenQL Project
 * @license MIT
 */

/// <reference path="./api.d.ts" />
/// <reference path="./plugins.d.ts" />

import { Complex } from '../src/math/complex';
import { Circuit } from '../src/core/Circuit';
import { QubitState } from '../src/core/QubitState';

/**
 * Main q5m module declaration
 */
declare module 'q5m' {
  // ===== Core API Re-exports =====

  /**
   * Complex number class for quantum computations
   */
  export { Complex } from '../src/math/complex';

  /**
   * Quantum circuit class
   */
  export { Circuit } from '../src/core/Circuit';

  /**
   * Quantum state class
   */
  export { QubitState } from '../src/core/QubitState';

  // ===== Extension API Re-exports =====

  /**
   * Stable Extension API namespace for extension developers
   */
  export { Api } from './api';

  /**
   * Current Extension API version
   */
  export { EXTENSION_API_VERSION } from './api';

  /**
   * Extension API error class
   */
  export { ExtensionAPIError } from './api';

  // ===== Extension API Types =====
  export {
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
  } from './api';

  // ===== Library Metadata =====

  /**
   * Library version information
   */
  export const VERSION: string;

  /**
   * Build information
   */
  export const BUILD_INFO: {
    readonly version: string;
    readonly buildDate: string;
    readonly gitCommit: string;
    readonly target: 'development' | 'production';
  };

  // ===== Feature Detection =====

  /**
   * Feature flags for runtime capability detection
   */
  export const FEATURES: {
    readonly webWorkers: boolean;
    readonly webGL: boolean;
    readonly wasmSupport: boolean;
    readonly bigIntSupport: boolean;
    readonly experimentalFeatures: boolean;
  };

  /**
   * Check if a specific feature is available
   * @param feature Feature name to check
   * @returns True if feature is available
   */
  export function hasFeature(feature: keyof typeof FEATURES): boolean;
}

/**
 * Plugin system module declaration
 */
declare module 'q5m/plugins' {
  // All plugin system types are defined in plugins.d.ts
  // This re-export ensures they're available from the main plugin module
  export * from './plugins';
}

/**
 * Core utilities module declaration
 */
declare module 'q5m/core' {
  export { Circuit } from '../src/core/Circuit';
  export { QubitState } from '../src/core/QubitState';
  export { Complex } from '../src/math/complex';
  
  // Additional core utilities
  export namespace Gates {
    // Single qubit gates
    export function H(qubit: number): Instruction;
    export function X(qubit: number): Instruction;
    export function Y(qubit: number): Instruction;
    export function Z(qubit: number): Instruction;
    export function S(qubit: number): Instruction;
    export function T(qubit: number): Instruction;
    export function RX(qubit: number, angle: number): Instruction;
    export function RY(qubit: number, angle: number): Instruction;
    export function RZ(qubit: number, angle: number): Instruction;

    // Two qubit gates
    export function CNOT(control: number, target: number): Instruction;
    export function CX(control: number, target: number): Instruction;
    export function CZ(control: number, target: number): Instruction;
    export function SWAP(qubit1: number, qubit2: number): Instruction;

    // Measurement
    export function Measure(qubit: number, classical?: number): Instruction;
  }

  export namespace Utils {
    /**
     * Create a random quantum state
     * @param qubits Number of qubits
     * @returns Random quantum state
     */
    export function randomState(qubits: number): QubitState;

    /**
     * Create a Bell state
     * @returns Bell state circuit
     */
    export function bellState(): Circuit;

    /**
     * Create a GHZ state
     * @param qubits Number of qubits
     * @returns GHZ state circuit
     */
    export function ghzState(qubits: number): Circuit;
  }
}

/**
 * Mathematical utilities module declaration
 */
declare module 'q5m/math' {
  export { Complex } from '../src/math/complex';
  export { Matrix, Vector } from './api';

  /**
   * Mathematical constants for quantum computing
   */
  export const CONSTANTS: {
    readonly PI: number;
    readonly SQRT2: number;
    readonly SQRT1_2: number;
  };

  /**
   * Pauli matrices
   */
  export const PAULI: {
    readonly I: Matrix;  // Identity
    readonly X: Matrix;  // Pauli-X
    readonly Y: Matrix;  // Pauli-Y  
    readonly Z: Matrix;  // Pauli-Z
  };

  /**
   * Common quantum gates matrices
   */
  export const GATES: {
    readonly H: Matrix;     // Hadamard
    readonly S: Matrix;     // S gate
    readonly T: Matrix;     // T gate
    readonly CNOT: Matrix;  // CNOT gate
  };
}

/**
 * Algorithms module declaration
 */
declare module 'q5m/algorithms' {
  import { Circuit } from 'q5m/core';

  /**
   * Grover's search algorithm
   */
  export namespace Grover {
    /**
     * Create Grover's algorithm circuit
     * @param qubits Number of qubits
     * @param oracle Oracle function
     * @returns Grover circuit
     */
    export function createCircuit(
      qubits: number, 
      oracle: (circuit: Circuit) => void
    ): Circuit;

    /**
     * Calculate optimal number of iterations
     * @param totalStates Total number of states
     * @param markedStates Number of marked states
     * @returns Optimal iterations
     */
    export function optimalIterations(totalStates: number, markedStates: number): number;
  }

  /**
   * Quantum Fourier Transform
   */
  export namespace QFT {
    /**
     * Create QFT circuit
     * @param qubits Number of qubits
     * @returns QFT circuit
     */
    export function createCircuit(qubits: number): Circuit;

    /**
     * Create inverse QFT circuit
     * @param qubits Number of qubits
     * @returns Inverse QFT circuit
     */
    export function createInverseCircuit(qubits: number): Circuit;
  }

  /**
   * Shor's algorithm
   */
  export namespace Shor {
    /**
     * Factor a number using Shor's algorithm
     * @param n Number to factor
     * @returns Factorization result
     */
    export function factor(n: number): Promise<{
      factors: number[];
      success: boolean;
      iterations: number;
    }>;
  }
}

/**
 * Visualization module declaration
 */
declare module 'q5m/visualization' {
  import { Circuit, QubitState } from 'q5m/core';

  /**
   * Circuit visualization options
   */
  export interface CircuitVisualizationOptions {
    readonly format?: 'ascii' | 'svg' | 'png';
    readonly width?: number;
    readonly height?: number;
    readonly showLabels?: boolean;
    readonly showMeasurements?: boolean;
  }

  /**
   * State visualization options
   */
  export interface StateVisualizationOptions {
    readonly format?: 'bar' | 'phase' | 'bloch';
    readonly threshold?: number;
    readonly showProbabilities?: boolean;
    readonly showPhases?: boolean;
  }

  /**
   * Visualize quantum circuit
   * @param circuit Circuit to visualize
   * @param options Visualization options
   * @returns Visualization data or string
   */
  export function visualizeCircuit(
    circuit: Circuit,
    options?: CircuitVisualizationOptions
  ): string | SVGElement | HTMLCanvasElement;

  /**
   * Visualize quantum state
   * @param state State to visualize
   * @param options Visualization options
   * @returns Visualization data
   */
  export function visualizeState(
    state: QubitState,
    options?: StateVisualizationOptions
  ): string | SVGElement | HTMLCanvasElement;

  /**
   * Create Bloch sphere visualization
   * @param state Single qubit state
   * @returns Bloch sphere visualization
   */
  export function blochSphere(state: QubitState): SVGElement;
}

/**
 * Converters module declaration
 */
declare module 'q5m/converters' {
  import { Circuit } from 'q5m/core';

  /**
   * Export circuit to OpenQASM format
   * @param circuit Circuit to export
   * @returns OpenQASM string
   */
  export function toOpenQASM(circuit: Circuit): string;

  /**
   * Export circuit to Qiskit format
   * @param circuit Circuit to export
   * @returns Qiskit Python code string
   */
  export function toQiskit(circuit: Circuit): string;

  /**
   * Export circuit to Cirq format
   * @param circuit Circuit to export
   * @returns Cirq Python code string
   */
  export function toCirq(circuit: Circuit): string;

  /**
   * Import circuit from OpenQASM
   * @param qasm OpenQASM string
   * @returns Parsed circuit
   */
  export function fromOpenQASM(qasm: string): Circuit;
}

/**
 * Testing utilities module declaration
 */
declare module 'q5m/testing' {
  import { Circuit, QubitState } from 'q5m/core';
  import { PluginManagerInterface } from 'q5m/plugins';

  /**
   * Test utilities for quantum circuits
   */
  export namespace CircuitTesting {
    /**
     * Compare two circuits for equivalence
     * @param circuit1 First circuit
     * @param circuit2 Second circuit
     * @param tolerance Numerical tolerance
     * @returns True if circuits are equivalent
     */
    export function areEquivalent(
      circuit1: Circuit,
      circuit2: Circuit,
      tolerance?: number
    ): boolean;

    /**
     * Create test circuit with known properties
     * @param type Test circuit type
     * @param qubits Number of qubits
     * @returns Test circuit
     */
    export function createTestCircuit(
      type: 'bell' | 'ghz' | 'random' | 'identity',
      qubits: number
    ): Circuit;
  }

  /**
   * Test utilities for quantum states
   */
  export namespace StateTesting {
    /**
     * Compare two quantum states
     * @param state1 First state
     * @param state2 Second state
     * @param tolerance Numerical tolerance
     * @returns True if states are equivalent
     */
    export function areEquivalent(
      state1: QubitState,
      state2: QubitState,
      tolerance?: number
    ): boolean;

    /**
     * Calculate fidelity between two states
     * @param state1 First state
     * @param state2 Second state
     * @returns Fidelity value
     */
    export function fidelity(state1: QubitState, state2: QubitState): number;

    /**
     * Create test state with known properties
     * @param type Test state type
     * @param qubits Number of qubits
     * @returns Test state
     */
    export function createTestState(
      type: 'zero' | 'one' | 'plus' | 'minus' | 'bell' | 'random',
      qubits: number
    ): QubitState;
  }

  /**
   * Plugin testing utilities
   */
  export namespace PluginTesting {
    /**
     * Create test plugin manager
     * @returns Test plugin manager
     */
    export function createTestManager(): PluginManagerInterface;
    
    /**
     * Create mock plugin for testing
     * @param id Plugin ID
     * @param options Mock options
     * @returns Mock plugin
     */
    export function createMockPlugin(
      id: string,
      options?: {
        metadata?: any;
        apis?: Record<string, any>;
        lifecycle?: {
          initialize?: () => Promise<void>;
          activate?: () => Promise<void>;
          deactivate?: () => Promise<void>;
          destroy?: () => Promise<void>;
        };
      }
    ): any;
  }
}

// ===== Global Type Augmentations =====

/**
 * Augment the global namespace for browser environments
 */
declare global {
  /**
   * q5m global object (when using UMD build in browser)
   */
  interface Window {
    q5m?: typeof import('q5m');
  }

  /**
   * Node.js global extensions
   */
  namespace NodeJS {
    interface Global {
      q5m?: typeof import('q5m');
    }
  }
}

// ===== Utility Types =====

/**
 * Extract plugin API type from plugin manager
 */
export type PluginAPI<T extends string, U extends string> = 
  ReturnType<import('q5m/plugins').PluginManagerInterface['getAPI']>;

/**
 * Extract event data type from plugin manager events
 */
export type PluginEventData<T extends keyof import('q5m/plugins').PluginManagerEvents> =
  import('q5m/plugins').PluginManagerEvents[T];

/**
 * Make properties of T readonly recursively
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[P] extends Record<any, any>
    ? DeepReadonly<T[P]>
    : T[P];
};

/**
 * Extract return type from async function
 */
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = 
  T extends (...args: any) => Promise<infer R> ? R : never;

export {};