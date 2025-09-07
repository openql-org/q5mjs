// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import type { Q5mState } from './Q5mState';
import type { Q5mGate } from './Q5mGate';
import type { Q5mIndex } from './Q5mMaterial';
import type { Q5mExecutable, ExecutionResult } from './Results';
import { CircuitExecutor } from './CircuitExecutor';
import type { Unitary } from '../math/math-utils';

/**
 * Represents an instruction in a quantum circuit
 */
interface CircuitInstruction {
  /** The quantum gate to apply */
  gate: Q5mGate;
  /** The target quantum units to apply the gate to */
  targets: Q5mIndex[];
}

/**
 * Basic options for quantum gates
 */
interface GateOptions {
  /** Gate-specific parameters */
  params?: Record<string, unknown>;
  /** Number of quantum units for multi-quantum gates */
  numQuantum?: number;
}

/**
 * Gate factory function type
 */
type GateFactory = (options?: GateOptions) => Q5mGate;

// === Serialization Types ===

/**
 * Simple serialization format for save()/load()
 * Uses internal instruction array representation for efficiency
 */
interface SimpleCircuitData {
  /** Number of qubits in the circuit */
  numQubits: number;
  /** Raw instruction array (internal format) */
  instructions: CircuitInstruction[];
}

/**
 * Gate parameter types for JSON serialization
 */
interface SerializedGateParameters {
  [key: string]: string | number | boolean | object | null;
}

/**
 * Serialized gate representation for JSON format
 */
interface SerializedGate {
  /** Gate name (e.g., "h", "cnot", "rx") */
  name: string;
  /** Target qubit indices */
  targets: number[];
  /** Gate parameters (angles, phases, etc.) */
  parameters?: SerializedGateParameters;
  /** Additional metadata for extensions */
  metadata?: Record<string, unknown>;
}

/**
 * Circuit metadata for JSON format
 */
interface CircuitMetadata {
  /** Human-readable circuit name */
  name?: string;
  /** Circuit description */
  description?: string;
  /** Creation timestamp */
  createdAt?: string;
  /** Last modification timestamp */
  modifiedAt?: string;
  /** Creator information */
  creator?: string;
  /** Custom tags */
  tags?: string[];
  /** Extension-specific metadata */
  extensions?: Record<string, unknown>;
}

/**
 * JSON serialization format for toJSON()/fromJSON()
 * Future-compatible interchange format with versioning
 */
interface SerializedCircuit {
  /** Format version for compatibility */
  version: string;
  /** Format identifier */
  format: 'q5m-circuit';
  /** Number of qubits in the circuit */
  numQubits: number;
  /** Serialized gates array */
  gates: SerializedGate[];
  /** Optional circuit metadata */
  metadata?: CircuitMetadata;
  /** Schema validation information */
  schema?: {
    /** Schema version */
    version: string;
    /** Schema URL for validation */
    url?: string;
  };
}

/**
 * Serialization options for JSON format
 */
interface SerializationOptions {
  /** Enable compression */
  compress?: boolean;
  /** Include metadata */
  includeMetadata?: boolean;
  /** Format version to use */
  version?: string;
  /** Custom metadata to include */
  metadata?: Partial<CircuitMetadata>;
}

/**
 * Load options for deserialization
 */
interface LoadOptions {
  /** Validate format version compatibility */
  validateVersion?: boolean;
  /** Strict mode for parameter validation */
  strict?: boolean;
  /** Allow unknown gate types */
  allowUnknownGates?: boolean;
}

/** Current serialization format version */
const CURRENT_VERSION = '1.0.0';

/** Supported format versions */
const SUPPORTED_VERSIONS = ['1.0.0'];

/** Default serialization options */
const DEFAULT_SERIALIZATION_OPTIONS: SerializationOptions = {
  compress: false,
  includeMetadata: true,
  version: CURRENT_VERSION,
};

/** Default load options */
const DEFAULT_LOAD_OPTIONS: LoadOptions = {
  validateVersion: true,
  strict: true,
  allowUnknownGates: false,
};

/**
 * Quantum circuit for building and executing quantum algorithms with unified gate and measurement support.
 *
 * Circuit is the primary interface for quantum algorithm construction, providing fluent
 * APIs for gate operations, measurements, and circuit execution. It supports both
 * imperative gate-by-gate construction and functional composition patterns with
 * comprehensive gate libraries and measurement capabilities.
 *
 * **Core Features:**
 * - **Fluent API**: Method chaining for intuitive circuit construction
 * - **Unified Gate Support**: Single-qubit, two-qubit, multi-qubit, and controlled operations
 * - **Measurement Integration**: Built-in support for all measurement bases (X, Y, Z, custom)
 * - **Performance Optimization**: Automatic memory optimization for large circuits
 * - **Type Safety**: Comprehensive validation with detailed error reporting
 * - **Reusable Execution**: Support for multiple runs with different initial states
 *
 * **Design Philosophy:**
 * - Builder pattern: Intuitive gate sequence construction
 * - Immutable execution: States are not modified, new states returned
 * - Error-safe validation: Comprehensive checks prevent invalid operations
 * - Performance-aware: Automatic optimization for different circuit sizes
 *
 * **Gate Libraries:**
 * - Single-qubit: H, X, Y, Z, S, T, RX, RY, RZ, custom rotations
 * - Two-qubit: CNOT, CZ, CY, CH, SWAP, controlled phases
 * - Multi-qubit: Global phases, multi-Hadamard, custom multi-qubit gates
 * - Measurements: Mz (Z-basis), Mx (X-basis), My (Y-basis), Mp (custom basis)
 *
 * @category Core Classes
 *
 *
 */
abstract class BaseCircuit implements Q5mExecutable {
  numQubits: number;
  instructions: CircuitInstruction[];

  /**
   * Creates a new quantum circuit with specified number of qubits.
   *
   * Initializes an empty quantum circuit ready for gate operations and measurements.
   * The circuit automatically optimizes memory usage for large qubit systems and
   * provides comprehensive validation for all operations.
   *
   * **Circuit Capabilities:**
   * - Supports 1 to 30+ qubits (memory-dependent)
   * - Automatic sparse optimization for >12 qubits
   * - Fluent API for intuitive gate sequencing
   * - Built-in measurement support for all bases
   * - Comprehensive error checking and validation
   *
   * @param numQubits - Number of quantum units in the circuit (must be positive integer)
   * @param _optimizeMemory - Memory optimization hint (currently auto-determined, reserved for future use)
   * @throws {Error} If numQubits is not a positive integer
   *
   */
  constructor(numQubits: number, _optimizeMemory?: boolean) {
    if (numQubits <= 0) {
      throw new Error('Number of targets must be positive');
    }
    this.numQubits = numQubits;
    this.instructions = [];
  }

  /**
   * Get the number of qubits in the circuit.
   *
   * Returns the total number of quantum bits (qubits) that this circuit operates on.
   * This value is set during circuit construction and may be automatically expanded
   * when gates are applied to higher-indexed qubits.
   *
   * @returns The number of qubits in the circuit
   *
   */
  quantumCount(): number {
    return this.numQubits;
  }

  /**
   * Returns a copy of all instructions in this circuit.
   *
   * Provides access to the complete list of quantum operations (gates and measurements)
   * that have been added to this circuit. The returned array is a shallow copy,
   * so modifications to the array will not affect the circuit, but modifications
   * to individual instruction objects will affect the original circuit.
   *
   * @returns A copy of the circuit's instruction list
   *
   */
  instructionsList(): CircuitInstruction[] {
    return [...this.instructions];
  }

  /**
   * Execute the circuit and return the resulting quantum state.
   *
   * Runs the circuit starting from the computational basis state |000...0⟩
   * and applies all gates and measurements in the order they were added.
   * This is the most common way to execute a quantum circuit.
   *
   * **Execution Process:**
   * 1. Initialize state to |000...0⟩ (all qubits in |0⟩)
   * 2. Apply each gate/measurement in sequence
   * 3. Return final quantum state
   *
   * **Memory Optimization:**
   * - Circuits with ≥13 qubits automatically use sparse representation
   * - Memory usage scales with circuit complexity, not exponentially
   *
   * @returns The quantum state after executing all instructions
   * @throws {Error} If circuit execution fails due to invalid operations
   *
   */
  /**
   * Creates the initial quantum state for circuit execution.
   *
   * Abstract method that must be implemented by concrete circuit classes
   * to specify how initial quantum states are created.
   *
   * @param numQuantum - Number of quantum units for the initial state
   * @returns Initial quantum state in |000...0⟩ configuration
   */
  protected abstract createInitialState(numQuantum: number): Q5mState;

  /**
   * Execute the circuit and return the resulting quantum state.
   */
  execute(): ExecutionResult {
    const initialState = this.createInitialState(this.numQubits);
    return this.run(initialState);
  }

  /**
   * Run the quantum circuit starting from a given initial state.
   *
   * This method applies all circuit instructions to the provided initial state
   * and returns the resulting quantum state. It supports both pure quantum
   * evolution and measurement-based computations with full state control.
   *
   * **Key Features:**
   * - Custom initial state support (not just |000...0⟩)
   * - State validation ensures compatibility
   * - Supports both dense and sparse quantum states
   * - Handles measurements with proper state collapse
   * - Memory-efficient execution for large circuits
   *
   * **State Validation:**
   * - Initial state must have same number of quantum units as circuit
   * - State vector dimensions must match 2^numQubits for qubit systems
   * - Supports both pure states and sparse state representations
   *
   * @param initialState - The initial quantum state to start from
   * @returns The final quantum state after applying all circuit instructions
   * @throws {Error} If circuit execution fails or state compatibility issues occur
   * @throws {Error} If initialState has different number of quantum units than circuit
   *
   */
  run(initialState: Q5mState): ExecutionResult {
    if (initialState.quantumCount() !== this.numQubits) {
      return {
        state: initialState,
        success: false,
        error: `Initial state has ${initialState.quantumCount()} quantum units but circuit has ${this.numQubits} quantum units`,
        hasMeasurements: false,
      };
    }

    return CircuitExecutor.execute(this.numQubits, this.instructions, initialState);
  }

  /**
   * Resets the circuit to its initial empty state.
   *
   * Removes all gates, measurements, and instructions from the circuit while preserving
   * the number of quantum units. This allows reusing the circuit object for different
   * quantum algorithm implementations without creating a new instance.
   *
   * **What gets reset:**
   * - All quantum gates and measurements
   * - Circuit instruction history
   * - Classical register contents (if implemented)
   *
   * **What stays unchanged:**
   * - Number of quantum units
   * - Circuit configuration and optimization settings
   *
   * @returns This circuit instance for method chaining
   *
   */
  reset(): BaseCircuit {
    this.instructions = [];
    return this;
  }

  /**
   * Creates a deep copy of this circuit.
   *
   * The cloned circuit will have the same number of quantum units, instructions,
   * and configuration as the original. This is useful for creating variations
   * of a circuit or preserving the original while making modifications.
   *
   * **Cloning behavior:**
   * - New Circuit instance with identical configuration
   * - Deep copy of all instructions and gates
   * - Independent of original (modifications don't affect each other)
   * - Preserves optimization settings and quantum unit count
   *
   * @returns A new Circuit instance with identical configuration
   *
   */
  /**
   * Creates a copy of this circuit using the concrete circuit class.
   */
  abstract clone(): BaseCircuit;

  /**
   * Get gate factory for a given gate name.
   *
   * Abstract method that must be implemented by concrete circuit classes
   * to provide access to quantum gate implementations.
   *
   * @param gateName - Name of the gate
   * @returns Gate factory function or undefined if not found
   */
  protected abstract getGateFactory(gateName: string): GateFactory | undefined;

  /**
   * Append a gate to the circuit.
   *
   * Abstract method that must be implemented by concrete circuit classes
   * to provide gate addition functionality.
   *
   * @param gateName - Name of the gate
   * @param wire - Qubit indices (Q5mIndex or array of Q5mIndex)
   * @param options - Gate options
   * @returns This circuit for chaining
   */
  abstract appendGate(
    gateName: string,
    wire: Q5mIndex | Q5mIndex[],
    options?: GateOptions,
  ): BaseCircuit;

  /**
   * Add a gate at a specific column position in the circuit.
   *
   * @param gateName - Name of the gate
   * @param wire - Qubit indices (Q5mIndex or array of Q5mIndex)
   * @param column - Column position to place the gate
   * @param options - Gate options
   * @returns This circuit for chaining
   */
  addGate(
    gateName: string,
    wire: Q5mIndex | Q5mIndex[],
    column: number,
    options?: GateOptions,
  ): BaseCircuit {
    const targets = Array.isArray(wire) ? wire : [wire];

    // Handle out of range column - append to end
    const maxColumn = this.getMaxColumnForWires(targets);
    if (column < 0 || column > maxColumn) {
      return this.appendGate(gateName, wire, options);
    }

    // For multi-qubit gates, align to the largest column position
    let targetColumn = column;
    if (targets.length > 1) {
      // For multi-qubit gates, find the maximum required column among all target wires
      let maxRequiredColumn = 0;
      for (const target of targets) {
        let wireColumn = 0;
        for (const instruction of this.instructions) {
          if (instruction.targets.includes(target)) {
            wireColumn++;
          }
        }
        maxRequiredColumn = Math.max(maxRequiredColumn, Math.min(wireColumn, column));
      }
      targetColumn = Math.max(targetColumn, maxRequiredColumn);
    }

    // Find the insertion point based on column position
    let insertIndex = 0;
    let currentColumn = 0;
    let foundTargetColumn = false;

    for (let i = 0; i < this.instructions.length; i++) {
      const instruction = this.instructions[i];
      if (!instruction) continue;
      const hasOverlap = instruction.targets.some((target) => targets.includes(target));

      if (hasOverlap) {
        if (currentColumn === targetColumn) {
          insertIndex = i;
          foundTargetColumn = true;
          break;
        }
        currentColumn++;
        insertIndex = i + 1;
      }
    }

    // If target column exists, shift existing gates backward
    if (foundTargetColumn) {
      this.shiftGatesBackward(insertIndex);
    }

    // Create and insert the gate instruction
    const gateFactory = this.getGateFactory(gateName);
    if (!gateFactory) {
      throw new Error(`Unknown gate: ${gateName}`);
    }

    const gate = gateFactory(options);
    const instruction: CircuitInstruction = { gate, targets };

    if (foundTargetColumn || insertIndex < this.instructions.length) {
      this.instructions.splice(insertIndex, 0, instruction);
    } else {
      this.instructions.push(instruction);
    }

    return this;
  }

  /**
   * Delete a gate at a specific column position for given wire(s).
   *
   * This method removes a gate at the specified column position on the target wire(s),
   * serving as the counterpart to addGate() for column-based gate manipulation.
   *
   * **Key behaviors:**
   * - Deletes gate at specific column position on target wire(s)
   * - For multi-qubit gates, finds gate that affects any of the specified wires
   * - Column out of range: does nothing and returns circuit unchanged
   * - No gate at column: does nothing and returns circuit unchanged
   * - Subsequent gates automatically shift forward to fill the gap
   *
   * **Multi-qubit gate handling:**
   * - Treats multi-qubit gates as occupying the same column
   * - Deletes the entire multi-qubit gate if any target wire matches
   * - Column position is determined by the gate's position in the wire sequence
   *
   * @param wire - Target wire(s) to look for gates on (Q5mIndex or array of Q5mIndex)
   * @param column - Column position to delete gate from (0-based)
   * @returns This circuit instance for method chaining
   */
  deleteGate(wire: Q5mIndex | Q5mIndex[], column: number): BaseCircuit {
    const targets = Array.isArray(wire) ? wire : [wire];

    // Range check - do nothing if column is out of range
    if (column < 0) {
      return this;
    }

    // Find the gate at the specified column for the target wires
    let currentColumn = 0;
    for (let i = 0; i < this.instructions.length; i++) {
      const instruction = this.instructions[i];
      if (!instruction) continue;
      const hasOverlap = instruction.targets.some((target) => targets.includes(target));

      if (hasOverlap) {
        if (currentColumn === column) {
          // Found the gate to delete
          this.instructions.splice(i, 1);
          return this;
        }
        currentColumn++;
      }
    }

    // No gate found at the specified column - do nothing
    return this;
  }

  /**
   * Helper method to count gates in a specific column for given wires.
   * Used for column-based gate positioning logic.
   */
  protected getGateCountInColumn(wires: Q5mIndex[], column: number): number {
    let count = 0;
    let currentColumn = 0;

    for (const instruction of this.instructions) {
      const instructionWires = instruction.targets;
      const hasOverlap = instructionWires.some((wire) => wires.includes(wire));

      if (hasOverlap) {
        if (currentColumn === column) {
          count++;
        }
        currentColumn++;
      }
    }

    return count;
  }

  /**
   * Helper method to find the instruction index at a specific column for given wires.
   * Returns -1 if no gate exists at that column.
   */
  protected findGateIndexAtColumn(wires: Q5mIndex[], column: number): number {
    let currentColumn = 0;

    for (let i = 0; i < this.instructions.length; i++) {
      const instruction = this.instructions[i];
      if (!instruction) continue;
      const instructionWires = instruction.targets;
      const hasOverlap = instructionWires.some((wire) => wires.includes(wire));

      if (hasOverlap) {
        if (currentColumn === column) {
          return i;
        }
        currentColumn++;
      }
    }

    return -1;
  }

  /**
   * Helper method to calculate the maximum column position for multi-qubit gates.
   * For multi-qubit gates, aligns to the largest column position among all wires.
   */
  protected getMaxColumnForWires(wires: Q5mIndex[]): number {
    let maxColumn = 0;

    for (const wire of wires) {
      let wireColumn = 0;
      for (const instruction of this.instructions) {
        if (instruction && instruction.targets.includes(wire)) {
          wireColumn++;
        }
      }
      maxColumn = Math.max(maxColumn, wireColumn);
    }

    return maxColumn;
  }

  /**
   * Helper method to shift gates at and after a specific position backward by one.
   * Used when inserting gates in the middle of the circuit.
   */
  protected shiftGatesBackward(_fromIndex: number): void {
    // Since we're inserting, we don't need to shift - the insertion naturally pushes gates back
    // This method exists for consistency and future enhancements
  }

  /**
   * Insert a gate at a specific position in the instruction sequence.
   *
   * This method allows precise placement of gates within the circuit based on
   * instruction index, enabling fine-grained control over gate ordering.
   *
   * **Key behaviors:**
   * - Inserts at exact index position (0-based)
   * - Existing gates at and after index are shifted backward
   * - Index out of range: does nothing and returns circuit unchanged
   * - Multi-qubit gates are treated as single instructions
   *
   * @param index - Instruction index where to insert the gate (0-based)
   * @param gateName - Name of the gate to insert
   * @param wire - Target qubit(s) for the gate
   * @param options - Optional gate parameters and options
   * @returns This circuit instance for method chaining
   */
  insertGate(
    index: number,
    gateName: string,
    wire: Q5mIndex | Q5mIndex[],
    options?: GateOptions,
  ): BaseCircuit {
    // Range check - do nothing if index is out of range
    if (index < 0 || index > this.instructions.length) {
      return this;
    }

    // Get gate factory and create instruction
    const gateFactory = this.getGateFactory(gateName);
    if (!gateFactory) {
      throw new Error(`Unknown gate: ${gateName}`);
    }

    const targets = Array.isArray(wire) ? wire : [wire];
    const gate = gateFactory(options);
    const instruction: CircuitInstruction = { gate, targets };

    // Insert at specified index
    this.instructions.splice(index, 0, instruction);

    return this;
  }

  /**
   * Remove a gate at a specific position in the instruction sequence.
   *
   * This method removes the instruction at the given index position,
   * allowing precise control over circuit modifications.
   *
   * **Key behaviors:**
   * - Removes instruction at exact index position (0-based)
   * - Subsequent instructions shift forward to fill the gap
   * - Index out of range: does nothing and returns circuit unchanged
   * - Safe operation that never throws errors for invalid indices
   *
   * @param index - Instruction index to remove (0-based)
   * @returns This circuit instance for method chaining
   */
  removeGate(index: number): BaseCircuit {
    // Range check - do nothing if index is out of range
    if (index < 0 || index >= this.instructions.length) {
      return this;
    }

    // Remove instruction at index
    this.instructions.splice(index, 1);

    return this;
  }

  /**
   * Replace a gate at a specific position with a new gate.
   *
   * This method replaces the instruction at the given index with a new gate,
   * maintaining the same position in the circuit while changing the operation.
   *
   * **Key behaviors:**
   * - Replaces instruction at exact index position (0-based)
   * - New gate can target different qubits than the original
   * - Index out of range: does nothing and returns circuit unchanged
   * - Atomic operation - either succeeds completely or makes no changes
   *
   * @param index - Instruction index to replace (0-based)
   * @param gateName - Name of the new gate
   * @param wire - Target qubit(s) for the new gate
   * @param options - Optional gate parameters and options
   * @returns This circuit instance for method chaining
   */
  replaceGate(
    index: number,
    gateName: string,
    wire: Q5mIndex | Q5mIndex[],
    options?: GateOptions,
  ): BaseCircuit {
    // Range check - do nothing if index is out of range
    if (index < 0 || index >= this.instructions.length) {
      return this;
    }

    // Get gate factory and create new instruction
    const gateFactory = this.getGateFactory(gateName);
    if (!gateFactory) {
      throw new Error(`Unknown gate: ${gateName}`);
    }

    const targets = Array.isArray(wire) ? wire : [wire];
    const gate = gateFactory(options);
    const instruction: CircuitInstruction = { gate, targets };

    // Replace instruction at index
    this.instructions[index] = instruction;

    return this;
  }

  /**
   * Computes the unitary matrix representation of the circuit.
   *
   * This method calculates the complete unitary transformation matrix
   * that represents the entire circuit's quantum operations. The matrix
   * is built by multiplying all gate matrices in sequence.
   *
   * **Important notes:**
   * - Only works for circuits without measurements
   * - Matrix size is 2^n × 2^n for n qubits
   * - Memory intensive for large circuits (exponential growth)
   * - Returns the composed unitary U = U_n × ... × U_2 × U_1
   *
   * @param tolerance - Optional numerical tolerance for matrix operations (when omitted, uses high precision mode)
   * @returns The unitary matrix as a 2D array of Complex numbers
   * @throws {Error} If circuit contains measurement gates
   * @throws {Error} If memory requirements are too large (>16 qubits)
   *
   */
  toUnitary(tolerance?: number): Unitary {
    return CircuitExecutor.computeUnitary(this.numQubits, this.instructions, tolerance);
  }

  /**
   * Computes the matrix representation of the circuit.
   *
   * Alias for toUnitary() for convenience. Returns the same
   * unitary transformation matrix representing the circuit.
   *
   * @param tolerance - Optional numerical tolerance for matrix operations (when omitted, uses high precision mode)
   * @returns The circuit's unitary matrix
   * @throws {Error} If circuit contains measurements
   * @throws {Error} If circuit is too large (>16 qubits)
   *
   */
  toMatrix(tolerance?: number): Unitary {
    return this.toUnitary(tolerance);
  }

  /**
   * Returns a human-readable string representation of the circuit.
   *
   * The string includes the number of quantum units and a detailed list of all instructions
   * with their applied quantum units. This is useful for debugging, logging, and
   * understanding the circuit structure.
   *
   * **Output format:**
   * - Header with quantum units count
   * - Numbered list of instructions
   * - Gate names with target quantum unit
   * - Empty circuit indication when no instructions
   *
   * @returns A string representation of the circuit structure
   *
   */
  toString(): string {
    let str = `Circuit with ${this.numQubits} qubit(s)\n`;
    str += 'Instructions:\n';

    if (this.instructions.length === 0) {
      str += '  (no instructions)\n';
    } else {
      this.instructions.forEach((instruction, index) => {
        const targetStr = instruction.targets.join(', ');
        str += `  ${index + 1}. ${instruction.gate.name}(${targetStr})\n`;
      });
    }

    return str;
  }

  /**
   * Serializes the circuit to simple internal format (save/load).
   *
   * Creates a simple representation using the internal instruction array format
   * for efficient storage and loading. This format is optimized for performance
   * and direct reconstruction of the circuit without conversion overhead.
   *
   * **Simple format features:**
   * - Direct instruction array serialization
   * - Minimal overhead
   * - Fast load/reconstruction
   * - Internal format compatibility
   *
   * @returns Simple circuit data for efficient storage
   *
   */
  save(): SimpleCircuitData {
    return {
      numQubits: this.numQubits,
      instructions: [...this.instructions], // Deep copy
    };
  }

  /**
   * Loads circuit data from simple internal format.
   *
   * Reconstructs the circuit from data created by save(). This method
   * overwrites the current circuit content with the loaded data.
   *
   * @param data - Simple circuit data from save()
   * @returns This circuit instance for method chaining
   * @throws {Error} If data format is invalid
   *
   */
  load(data: SimpleCircuitData): BaseCircuit {
    if (!data || typeof data.numQubits !== 'number' || !Array.isArray(data.instructions)) {
      throw new Error('Invalid simple circuit data format');
    }

    this.numQubits = data.numQubits;
    this.instructions = [...data.instructions]; // Deep copy
    return this;
  }

  /**
   * Serializes the circuit to JSON interchange format.
   *
   * Creates a comprehensive JSON representation suitable for long-term storage,
   * cross-platform interchange, and future compatibility. This format includes
   * versioning, metadata, and detailed gate parameter preservation.
   *
   * **JSON format features:**
   * - Version compatibility tracking
   * - Complete gate parameter preservation
   * - Extensible metadata support
   * - Cross-platform interchange
   * - Future-proof format design
   *
   * @param options - Serialization options
   * @returns JSON-compatible circuit representation
   *
   */
  toJSON(options: SerializationOptions = DEFAULT_SERIALIZATION_OPTIONS): SerializedCircuit {
    const opts = { ...DEFAULT_SERIALIZATION_OPTIONS, ...options };

    const gates: SerializedGate[] = this.instructions.map((instr) => {
      // Clean gate name (remove parameter info like "RX(0.785)" -> "RX")
      const cleanName = this.extractCleanGateName(instr.gate.name);

      const serializedGate: SerializedGate = {
        name: cleanName,
        targets: [...instr.targets],
      };

      // Extract parameters from gate name or properties
      const parameters = this.extractGateParameters(
        instr.gate as unknown as { name: string; [key: string]: unknown },
      );
      if (parameters && Object.keys(parameters).length > 0) {
        serializedGate.parameters = parameters;
      }

      return serializedGate;
    });

    const serialized: SerializedCircuit = {
      version: opts.version || CURRENT_VERSION,
      format: 'q5m-circuit',
      numQubits: this.numQubits,
      gates,
    };

    if (opts.includeMetadata && opts.metadata) {
      serialized.metadata = {
        ...opts.metadata,
        modifiedAt: new Date().toISOString(),
      };
    }

    return serialized;
  }

  /**
   * Deserializes a circuit from JSON interchange format.
   *
   * Reconstructs a circuit from JSON data created by toJSON(). Supports
   * version compatibility checking and handles parameter restoration
   * for parametrized gates.
   *
   * @param data - Serialized circuit JSON data
   * @param options - Load options
   * @returns New circuit instance from the data
   * @throws {Error} If data format is invalid or incompatible
   *
   */
  static fromJSON(
    data: SerializedCircuit,
    options: LoadOptions = DEFAULT_LOAD_OPTIONS,
  ): BaseCircuit {
    const opts = { ...DEFAULT_LOAD_OPTIONS, ...options };

    // Validate format
    if (!data || data.format !== 'q5m-circuit') {
      throw new Error('Invalid circuit format identifier');
    }

    // Version compatibility check
    if (opts.validateVersion && !SUPPORTED_VERSIONS.includes(data.version)) {
      throw new Error(
        `Unsupported format version: ${data.version}. Supported: ${SUPPORTED_VERSIONS.join(', ')}`,
      );
    }

    if (typeof data.numQubits !== 'number' || data.numQubits <= 0) {
      throw new Error('Invalid number of qubits');
    }

    if (!Array.isArray(data.gates)) {
      throw new Error('Invalid gates array');
    }

    // Create new circuit instance - this is abstract, so concrete classes must override
    throw new Error('BaseCircuit.fromJSON() must be overridden by concrete circuit classes');
  }

  /**
   * Extract clean gate name without parameter info.
   * E.g., "RX(0.785)" -> "RX", "CNOT" -> "CNOT"
   */
  protected extractCleanGateName(gateName: string): string {
    const parenIndex = gateName.indexOf('(');
    return parenIndex !== -1 ? gateName.substring(0, parenIndex) : gateName;
  }

  /**
   * Extract parameters from gate name or properties.
   * Handles parametrized gates like RX, RY, RZ, Phase, etc.
   */
  protected extractGateParameters(gate: {
    name: string;
    [key: string]: unknown;
  }): SerializedGateParameters {
    const parameters: SerializedGateParameters = {};

    // Extract from gate name if it contains parameters
    const gateName = gate.name;
    if (typeof gateName === 'string' && gateName.includes('(')) {
      const cleanName = this.extractCleanGateName(gateName);
      const paramMatch = gateName.match(/\((.*)\)$/);
      if (paramMatch && paramMatch[1]) {
        const paramValue = parseFloat(paramMatch[1]);
        if (!isNaN(paramValue)) {
          // Map parameter names based on gate type
          switch (cleanName.toLowerCase()) {
            case 'rx':
              parameters.theta = paramValue;
              break;
            case 'ry':
              parameters.theta = paramValue;
              break;
            case 'rz':
              parameters.theta = paramValue;
              break;
            case 'phase':
            case 'p':
              parameters.phi = paramValue;
              break;
            case 'cp':
              parameters.theta = paramValue;
              break;
            default:
              parameters.value = paramValue;
              break;
          }
        }
      }
    }

    // Also check for explicit params property
    if ('params' in gate && gate.params) {
      const serializedParams = this.serializeGateParameters(gate.params as Record<string, unknown>);
      Object.assign(parameters, serializedParams);
    }

    return parameters;
  }

  /**
   * Helper method to serialize gate parameters.
   * Concrete classes can override this for specialized parameter handling.
   */
  protected serializeGateParameters(params: Record<string, unknown>): SerializedGateParameters {
    const serialized: SerializedGateParameters = {};

    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) {
        serialized[key] = null;
      } else if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        serialized[key] = value;
      } else {
        // Convert complex objects to JSON representation
        try {
          serialized[key] = JSON.parse(JSON.stringify(value)) as
            | string
            | number
            | boolean
            | object
            | null;
        } catch {
          if (typeof value === 'object' && value !== null) {
            serialized[key] = '[object]';
          } else {
            // All other types (functions, symbols, etc.)
            serialized[key] = '[unknown]';
          }
        }
      }
    }

    return serialized;
  }
}

export type {
  CircuitInstruction,
  GateOptions,
  GateFactory,
  SimpleCircuitData,
  SerializedGate,
  SerializedGateParameters,
  SerializedCircuit,
  CircuitMetadata,
  SerializationOptions,
  LoadOptions,
};
export { BaseCircuit, CURRENT_VERSION, SUPPORTED_VERSIONS };
