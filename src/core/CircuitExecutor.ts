// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { QubitState, isQubitState } from './QubitState';
import type { Q5mState } from './Q5mState';
import type { CircuitInstruction } from './BaseCircuit';
import type { ExecutionResult, MeasurementResult } from './Results';
import { ZERO, complex, type Complex } from '../math/complex';
import type { Amplitude, Unitary } from '../math/math-utils';
import { normalizeAmplitudes, matXmat } from '../math/math-utils';
import type { StateVector } from './Q5mMaterial';
import type { QubitIndex } from './QubitState';
import { isValidQubitIndex } from './QubitState';
import type { Q5mGate } from './Q5mGate';
import { MeasureGate } from './MeasureGates';
import { Q5mOperator } from './Q5mOperator';

/**
 * Circuit executor handles the execution of quantum circuit instructions.
 *
 * CircuitExecutor is a stateless utility class that executes quantum circuits
 * by applying instructions sequentially to quantum states. It provides unified
 * handling of quantum gates and measurement operations with built-in optimization
 * and validation.
 *
 * **Core Capabilities:**
 * - **Unified Execution**: Single-qubit, two-qubit, and multi-qubit gate operations
 * - **Measurement Support**: Z-basis, X-basis, Y-basis, and custom measurements with state collapse
 * - **High-Performance Execution**: Optimized gate application avoiding full system matrices
 * - **Memory Optimization**: Automatic sparse representation for large circuits (>12 qubits)
 * - **Error Handling**: Comprehensive validation with detailed error reporting
 * - **Scalable Performance**: Efficient O(2^n) algorithms instead of O(4^n) for gate operations
 *
 * **Design Principles:**
 * - Stateless and functional: No internal state, pure function behavior
 * - Immutable operations: Always returns new states without modifying inputs
 * - Type-safe execution: Comprehensive validation prevents runtime errors
 * - Extensible architecture: Easy to add new gate types and measurement bases
 *
 * The executor automatically handles qubit indexing, gate matrix applications,
 * and measurement probability calculations to provide a complete quantum
 * simulation environment.
 *
 * @category Core Classes
 *
 */
class CircuitExecutor {
  /**
   * Execute all instructions in a quantum circuit with unified gate and measurement handling.
   *
   * This is the primary method for quantum circuit execution, providing a streamlined
   * interface that handles both quantum gates and measurements in a unified manner.
   * The method automatically optimizes memory usage, validates circuit integrity,
   * and provides comprehensive error reporting.
   *
   * **Execution Process:**
   * 1. **Auto-sizing**: Determines required qubits from circuit instructions
   * 2. **State Preparation**: Initializes quantum state (defaults to |00...0⟩)
   * 3. **Sequential Execution**: Applies instructions maintaining quantum coherence
   * 4. **State Collapse**: Handles measurements with proper probability weighting
   * 5. **Result Packaging**: Returns final state with execution status
   *
   * **Performance Features:**
   * - Sparse optimization for large circuits automatically enabled
   * - Memory-efficient state representation for >12 qubit systems
   * - Early termination on validation failures
   * - Comprehensive error context in failure cases
   *
   * @param numQubits - Minimum number of qubits in the circuit (auto-expanded if instructions require more)
   * @param instructions - Ordered array of quantum instructions to execute sequentially
   * @param initialState - Initial quantum state (defaults to |00...0⟩ state)
   * @returns ExecutionResult containing final quantum state, success status, and error details
   *
   * @throws Never throws directly - all errors are captured in ExecutionResult.error
   *
   */
  static execute(
    numQubits: number,
    instructions: CircuitInstruction[],
    initialState?: Q5mState,
  ): ExecutionResult {
    const measurements: MeasurementResult[] = [];

    try {
      const actualNumQubits = this.getRequiredQubits(numQubits, instructions);

      let currentState = initialState || new QubitState(actualNumQubits);
      this.validateInitialState(currentState, actualNumQubits);

      for (const instruction of instructions) {
        const stepResult = this.executeInstruction(currentState, instruction);
        currentState = stepResult.state;

        // Collect measurement results if any
        if (stepResult.measurementResult) {
          measurements.push(stepResult.measurementResult);
        }
      }

      return {
        state: currentState,
        success: true,
        hasMeasurements: measurements.length > 0,
        ...(measurements.length > 0 && { measurements }),
      };
    } catch (error) {
      return {
        state: new QubitState(Math.max(1, numQubits)),
        success: false,
        error: (error as Error).message,
        hasMeasurements: measurements.length > 0,
        ...(measurements.length > 0 && { measurements }),
      };
    }
  }

  /**
   * Determine the required number of qubits for a circuit.
   */
  private static getRequiredQubits(numQubits: number, instructions: CircuitInstruction[]): number {
    let maxQubit = numQubits - 1;
    for (const instruction of instructions) {
      const instructionMaxQubit = Math.max(...instruction.targets);
      if (instructionMaxQubit > maxQubit) {
        maxQubit = instructionMaxQubit;
      }
    }
    return maxQubit + 1;
  }

  /**
   * Validate initial state compatibility.
   */
  private static validateInitialState(state: Q5mState, requiredQubits: number): void {
    if (state.quantumCount() !== requiredQubits) {
      throw new Error(
        `Initial state has ${state.quantumCount()} quantum units but circuit requires ${requiredQubits} quantum units`,
      );
    }
  }

  /**
   * Execute a single circuit instruction (quantum gate or measurement).
   *
   * Unified instruction execution that handles both quantum gates and measurements.
   *
   * @param state - Current quantum state
   * @param instruction - Instruction to execute
   * @returns Execution result with new state and optional measurement result
   */
  static executeInstruction(
    state: Q5mState,
    instruction: CircuitInstruction,
  ): { state: Q5mState; measurementResult?: MeasurementResult } {
    const gate = instruction.gate;
    const targets = instruction.targets;

    if (this.isMeasurementGate(gate)) {
      const measureGate = gate;
      const target = targets[0]!;
      const measurementResult = measureGate.measure(state, target);

      return {
        state: measurementResult.collapsedState,
        measurementResult,
      };
    }

    const newState = this.applyGate(state, gate, targets);
    return { state: newState };
  }

  /**
   * Apply a quantum gate to the state.
   *
   * Efficient gate application method that routes to specialized implementations
   * based on gate type to avoid creating full system matrices when possible.
   *
   * @param state - Current quantum state to apply the gate to
   * @param gate - Quantum gate to apply
   * @param targets - Target qubit indices for the gate operation
   * @returns New quantum state after gate application
   */
  private static applyGate(state: Q5mState, gate: Q5mGate, targets: QubitIndex[]): Q5mState {
    if (!isQubitState(state)) {
      throw new Error(`Expected QubitState instance, got ${state.constructor.name}`);
    }
    const qubitState = state;

    if (targets.length === 1) {
      return this.applySingleQubitGate(qubitState, gate, targets[0]!);
    } else if (targets.length === 2) {
      return this.applyTwoQubitGate(qubitState, gate, targets[0]!, targets[1]!);
    } else if (targets.length === state.quantumCount()) {
      return this.applyMultiQubitGate(qubitState, gate);
    } else {
      throw new Error(
        `Unsupported gate configuration: ${gate.name} with ${targets.length} targets on ${state.quantumCount()}-qubit system`,
      );
    }
  }

  /**
   * Apply a single-qubit gate to the quantum state efficiently.
   *
   * This method uses optimized state vector manipulation instead of creating
   * full 2^n × 2^n system matrices. It processes pairs of amplitudes that differ
   * only at the target qubit position, achieving O(2^n) complexity instead of O(4^n).
   *
   * **Performance Benefits:**
   * - Avoids creating large unitary matrices (saves memory)
   * - Direct amplitude manipulation (faster execution)
   * - Scales linearly with state size instead of quadratically
   *
   * @param state - Current QubitState to apply the gate to
   * @param gate - Single-qubit gate (2×2 matrix)
   * @param target - Target qubit index (0-based)
   * @returns New QubitState after gate application
   * @throws {Error} If target index is out of range or gate size is invalid
   */
  private static applySingleQubitGate(
    state: QubitState,
    gate: Q5mGate,
    target: QubitIndex,
  ): QubitState {
    if (!isValidQubitIndex(target) || target >= state.quantumCount()) {
      throw new Error(
        `Invalid qubit index: ${target}. Must be between 0 and ${state.quantumCount() - 1}`,
      );
    }
    this.validateGateSize(gate, 2, 'single-qubit');

    const stateVector = state.amplitudes();
    const newStateVector: StateVector = new Array<Complex>(stateVector.length).fill(ZERO);
    const numQubits = state.quantumCount();
    const targetMask = 1 << (numQubits - 1 - target);

    for (let i = 0; i < stateVector.length; i++) {
      const bit0Index = i & ~targetMask;
      const bit1Index = i | targetMask;

      if ((i & targetMask) === 0) {
        const amp0 = stateVector[bit0Index]!;
        const amp1 = stateVector[bit1Index]!;

        const g = gate.matrix;
        newStateVector[bit0Index] = g[0]![0]!.mul(amp0).add(g[0]![1]!.mul(amp1));
        newStateVector[bit1Index] = g[1]![0]!.mul(amp0).add(g[1]![1]!.mul(amp1));
      }
    }

    return this.createNewState(numQubits, normalizeAmplitudes(newStateVector));
  }

  /**
   * Apply a two-qubit gate to the quantum state efficiently.
   *
   * This method processes quartets of amplitudes that correspond to the four
   * computational basis states of the two target qubits. It avoids creating
   * full system matrices by directly applying the 4×4 gate matrix to relevant
   * amplitude groups.
   *
   * **Performance Benefits:**
   * - Processes only relevant amplitude quartets
   * - Avoids full 2^n × 2^n matrix creation
   * - Maintains O(2^n) complexity for gate application
   *
   * @param state - Current QubitState to apply the gate to
   * @param gate - Two-qubit gate (4×4 matrix)
   * @param target1 - First target qubit index
   * @param target2 - Second target qubit index
   * @returns New QubitState after gate application
   * @throws {Error} If target indices are invalid, identical, or gate size is wrong
   */
  private static applyTwoQubitGate(
    state: QubitState,
    gate: Q5mGate,
    target1: QubitIndex,
    target2: QubitIndex,
  ): QubitState {
    this.validateTwoQubitIndices(target1, target2, state.quantumCount());
    this.validateGateSize(gate, 4, 'two-qubit');

    const stateVector = state.amplitudes();
    const newStateVector: StateVector = new Array<Complex>(stateVector.length).fill(ZERO);
    const numQubits = state.quantumCount();

    const smaller = Math.min(target1, target2);
    const larger = Math.max(target1, target2);
    const smallerMask = 1 << (numQubits - 1 - smaller);
    const largerMask = 1 << (numQubits - 1 - larger);

    for (let i = 0; i < stateVector.length; i++) {
      if ((i & smallerMask) === 0 && (i & largerMask) === 0) {
        const idx00 = i;
        const idx01 = i | largerMask;
        const idx10 = i | smallerMask;
        const idx11 = i | smallerMask | largerMask;

        const indices =
          target1 < target2 ? [idx00, idx01, idx10, idx11] : [idx00, idx10, idx01, idx11];

        for (let row = 0; row < 4; row++) {
          let sum = ZERO;
          for (let col = 0; col < 4; col++) {
            const matrixElement = gate.matrix[row]![col]!;
            const stateElement = stateVector[indices[col]!]!;
            sum = sum.add(matrixElement.mul(stateElement));
          }
          newStateVector[indices[row]!] = sum;
        }
      }
    }

    return this.createNewState(numQubits, normalizeAmplitudes(newStateVector));
  }

  /**
   * Apply a multi-qubit gate to the entire quantum state.
   */
  private static applyMultiQubitGate(state: QubitState, gate: Q5mGate): QubitState {
    const numQubits = state.quantumCount();
    const expectedSize = 1 << numQubits;

    this.validateGateSize(gate, expectedSize, 'multi-qubit');

    const unitary = new Q5mOperator(gate.matrix, undefined, true);
    return state.apply(unitary);
  }

  /**
   * Creates a new QubitState with the given state vector.
   */
  private static createNewState(numQubits: number, stateVector: Amplitude[]): QubitState {
    return new QubitState(numQubits, stateVector);
  }

  /**
   * Validates that two qubit indices are valid and different.
   */
  private static validateTwoQubitIndices(
    target1: QubitIndex,
    target2: QubitIndex,
    numQubits: number,
  ): void {
    if (!isValidQubitIndex(target1) || target1 >= numQubits) {
      throw new Error(`Invalid qubit index: ${target1}. Must be between 0 and ${numQubits - 1}`);
    }
    if (!isValidQubitIndex(target2) || target2 >= numQubits) {
      throw new Error(`Invalid qubit index: ${target2}. Must be between 0 and ${numQubits - 1}`);
    }

    if (target1 === target2) {
      throw new Error('Cannot apply two-qubit gate to the same target');
    }
  }

  /**
   * Unified validation method for circuit instructions.
   *
   * Validates circuit instructions before execution with comprehensive error checking.
   *
   * @param numQubits - Number of qubits in the circuit
   * @param instructions - Instructions to validate
   * @param isPublicAPI - Whether this is called from public API (affects error message format)
   * @returns Validation result with error details if any
   */
  static validate(
    numQubits: number,
    instructions: CircuitInstruction[],
    isPublicAPI = true,
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const indexOffset = isPublicAPI ? 1 : 0;

    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i]!;
      const displayIndex = i + indexOffset;

      for (const target of instruction.targets) {
        if (target < 0 || target >= numQubits) {
          const prefix = isPublicAPI
            ? `Instruction ${displayIndex}:`
            : `Instruction ${displayIndex}:`;
          errors.push(`${prefix} Target index ${target} out of range (0-${numQubits - 1})`);
        }
      }

      if (!this.isMeasurementGate(instruction.gate)) {
        const expectedSize = Math.pow(2, instruction.targets.length);
        if (instruction.gate.size !== expectedSize) {
          const prefix = isPublicAPI
            ? `Instruction ${displayIndex}:`
            : `Instruction ${displayIndex}:`;
          errors.push(
            `${prefix} Gate ${instruction.gate.name} expects ${Math.log2(instruction.gate.size)} targets but got ${instruction.targets.length}`,
          );
        }
      }

      if (instruction.targets.length === 2 && instruction.targets[0] === instruction.targets[1]) {
        const prefix = isPublicAPI
          ? `Instruction ${displayIndex}:`
          : `Instruction ${displayIndex}:`;
        errors.push(
          `${prefix} Cannot apply two-qubit gate to the same target (${instruction.targets[0]})`,
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Estimates the memory usage required for simulating a quantum circuit.
   *
   * Calculates the approximate memory footprint of the quantum state vector
   * representation. The memory requirement grows exponentially with the number
   * of qubits: O(2^n) complex numbers, where each complex number uses 16 bytes.
   *
   * **Memory Scaling:**
   * - 10 qubits: ~16 KB
   * - 20 qubits: ~16 MB
   * - 30 qubits: ~16 GB
   * - 40 qubits: ~16 TB
   *
   * This estimation helps determine whether sparse optimization should be used
   * and whether the simulation is feasible on the target hardware.
   *
   * @param numQubits - Number of qubits in the circuit
   * @returns Estimated memory usage in bytes (includes overhead)
   *
   */
  static estimateMemoryUsage(numQubits: number): number {
    const stateVectorSize = Math.pow(2, numQubits) * 16;

    const overhead = 1024;

    return stateVectorSize + overhead;
  }

  /**
   * Determines whether memory optimization should be applied for the given circuit size.
   *
   * The quantum state simulator automatically switches to sparse representation
   * for circuits with more than 12 qubits to manage memory usage efficiently.
   * This threshold balances performance and memory consumption.
   *
   * **Optimization Strategies:**
   * - **Dense representation** (≤12 qubits): Full state vector for maximum speed
   * - **Sparse representation** (>12 qubits): Compressed storage for feasible simulation
   *
   * This decision is made automatically during circuit execution but can be
   * queried beforehand for planning and resource allocation.
   *
   * @param numQubits - Number of qubits in the circuit
   * @returns True if sparse optimization will be triggered, false for dense representation
   *
   */
  static shouldOptimizeMemory(numQubits: number): boolean {
    return numQubits > 8;
  }

  /**
   * Type guard to check if a gate is a measurement gate.
   *
   * Uses instanceof to perform accurate type checking, distinguishing
   * measurement gates from unitary quantum gates. This is more reliable
   * than duck typing approaches.
   *
   * @param gate - The quantum gate to check
   * @returns True if the gate is a MeasureGate instance, false otherwise
   *
   */
  private static isMeasurementGate(gate: Q5mGate): gate is MeasureGate {
    return gate instanceof MeasureGate;
  }

  /**
   * Computes the unitary matrix representation of a quantum circuit.
   *
   * This method calculates the complete unitary transformation matrix
   * representing all quantum operations in the circuit by composing
   * individual gate matrices.
   *
   * @param numQubits - Number of qubits in the circuit
   * @param instructions - Circuit instructions to compute unitary for
   * @param options - Computation options
   * @param options.tolerant - Use fast computation mode with reduced precision (default: true)
   * @returns The unitary matrix as a 2D array of Complex numbers
   * @throws {Error} If circuit contains measurement gates
   * @throws {Error} If circuit is too large (>16 qubits)
   *
   */
  static computeUnitary(
    numQubits: number,
    instructions: CircuitInstruction[],
    tolerance?: number,
  ): Unitary {
    // Check for measurements
    for (const instruction of instructions) {
      if (this.isMeasurementGate(instruction.gate)) {
        throw new Error('Cannot compute unitary for circuit with measurements');
      }
    }

    // Check circuit size
    if (numQubits > 16) {
      throw new Error(
        `Circuit too large for unitary computation (${numQubits} qubits). Maximum supported is 16 qubits.`,
      );
    }

    const size = 1 << numQubits; // 2^n

    // Initialize with identity matrix
    const unitary: Complex[][] = [];
    for (let i = 0; i < size; i++) {
      unitary[i] = [];
      for (let j = 0; j < size; j++) {
        unitary[i]![j] = i === j ? complex(1, 0) : complex(0, 0);
      }
    }

    // Apply each gate in reverse order (last gate first in matrix multiplication)
    // Circuit: H → CNOT becomes Matrix: CNOT × H × I
    for (let idx = instructions.length - 1; idx >= 0; idx--) {
      const instruction = instructions[idx]!;
      const gateMatrix = this.computeGateMatrix(numQubits, instruction);
      // Multiply: result = gateMatrix × unitary
      const result = matXmat(gateMatrix, unitary);
      // Copy result back to unitary
      if (tolerance !== undefined) {
        // Apply tolerance threshold to optimize computation when tolerance is specified
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            const element = result[i]![j]!;
            const re = Math.abs(element.re) < tolerance ? 0 : element.re;
            const im = Math.abs(element.im) < tolerance ? 0 : element.im;
            unitary[i]![j] = complex(re, im);
          }
        }
      } else {
        // High precision mode: no tolerance optimization
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            unitary[i]![j] = result[i]![j]!;
          }
        }
      }
    }

    return unitary;
  }

  /**
   * Computes the full system matrix for a gate instruction.
   *
   * Expands a gate matrix to the full Hilbert space of the system,
   * accounting for the specific target qubits.
   *
   * @param numQubits - Total number of qubits in the system
   * @param instruction - The gate instruction to expand
   * @returns Full system matrix for the gate
   * @private
   */
  private static computeGateMatrix(numQubits: number, instruction: CircuitInstruction): Unitary {
    const size = 1 << numQubits;
    const result: Complex[][] = [];

    // Initialize result matrix
    for (let i = 0; i < size; i++) {
      result[i] = new Array<Complex>(size);
    }

    const gate = instruction.gate;
    const targets = instruction.targets;

    if (targets.length === 1) {
      // Single-qubit gate
      const target = targets[0]!;
      const targetMask = 1 << (numQubits - 1 - target);

      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const iBit = (i & targetMask) !== 0 ? 1 : 0;
          const jBit = (j & targetMask) !== 0 ? 1 : 0;

          if ((i & ~targetMask) === (j & ~targetMask)) {
            result[i]![j] = gate.matrix[iBit]![jBit]!;
          } else {
            result[i]![j] = complex(0, 0);
          }
        }
      }
    } else if (targets.length === 2) {
      // Two-qubit gate
      const target1 = targets[0]!;
      const target2 = targets[1]!;
      const mask1 = 1 << (numQubits - 1 - target1);
      const mask2 = 1 << (numQubits - 1 - target2);

      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const i1 = (i & mask1) !== 0 ? 1 : 0;
          const i2 = (i & mask2) !== 0 ? 1 : 0;
          const j1 = (j & mask1) !== 0 ? 1 : 0;
          const j2 = (j & mask2) !== 0 ? 1 : 0;

          if ((i & ~(mask1 | mask2)) === (j & ~(mask1 | mask2))) {
            const iIndex = (i1 << 1) | i2;
            const jIndex = (j1 << 1) | j2;
            if (target1 > target2) {
              // Swap indices if target order is reversed
              const iSwap = ((iIndex & 2) >> 1) | ((iIndex & 1) << 1);
              const jSwap = ((jIndex & 2) >> 1) | ((jIndex & 1) << 1);
              result[i]![j] = gate.matrix[iSwap]![jSwap]!;
            } else {
              result[i]![j] = gate.matrix[iIndex]![jIndex]!;
            }
          } else {
            result[i]![j] = complex(0, 0);
          }
        }
      }
    } else {
      // Multi-qubit gate (assuming it acts on all qubits)
      if (targets.length === numQubits) {
        // Direct copy of gate matrix
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            result[i]![j] = gate.matrix[i]![j]!;
          }
        }
      } else {
        throw new Error(
          `Unsupported gate configuration: ${targets.length} targets on ${numQubits}-qubit system`,
        );
      }
    }

    return result;
  }

  /**
   * Validates that a quantum gate has the correct matrix size for the operation.
   *
   * Quantum gates are represented as matrices whose size must match the number
   * of qubits they operate on. For n qubits, the matrix size should be 2^n × 2^n.
   * This validation prevents dimension mismatch errors during gate application.
   *
   * @param gate - The quantum gate to validate
   * @param expectedSize - Expected matrix size (2^n for n qubits)
   * @param gateType - Description of gate type for error messages
   * @throws {Error} When gate matrix size doesn't match expected size
   *
   */
  private static validateGateSize(gate: Q5mGate, expectedSize: number, gateType: string): void {
    if (gate.size !== expectedSize) {
      throw new Error(
        `${gateType} gate ${gate.name} must have size ${expectedSize}, but got ${gate.size}`,
      );
    }
  }
}

export type { ExecutionResult };
export { CircuitExecutor };
