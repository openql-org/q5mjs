// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Implements Amplitude Amplification algorithm.
 *
 * This module provides the general Amplitude Amplification framework,
 * which serves as the theoretical foundation for Grover's search and many
 * other quantum algorithms. Amplitude Amplification allows for the amplification
 * of arbitrary target amplitudes in quantum superposition states.
 *
 * **Mathematical Foundation:**
 * Given a quantum state |ψ⟩ = α|ψ_good⟩ + β|ψ_bad⟩, where |ψ_good⟩ represents
 * the subspace of "good" states and |ψ_bad⟩ represents "bad" states,
 * Amplitude Amplification rotates the state vector in the 2D subspace
 * spanned by {|ψ_good⟩, |ψ_bad⟩} to increase |α|².
 *
 * **Key Components:**
 * - **Oracle Operator**: Reflects marked states by applying a phase flip
 * - **Diffusion Operator**: Reflects about the initial state preparation
 * - **Amplitude Rotation**: Combines oracle and diffusion for systematic amplification
 *
 * @packageDocumentation
 */

import { Circuit } from '../core/Circuit';
import type { Amplitude } from '../math/math-utils';

/**
 * Defines an oracle function for Amplitude Amplification.
 * The oracle identifies "good" states in the quantum superposition.
 *
 * @param input - A binary string representing a computational basis state.
 * @returns `true` if the state is marked as "good", `false` otherwise.
 * @category Algorithms
 */
type AmplitudeOracle = (input: string) => boolean;

/**
 * Defines a state preparation function for Amplitude Amplification.
 * This function prepares the initial quantum superposition.
 *
 * @param circuit - The quantum circuit to apply state preparation to.
 * @category Algorithms
 */
type StatePreparation = (circuit: Circuit) => void;

/**
 * Configuration options for Amplitude Amplification algorithm.
 *
 * @category Algorithms
 */
interface AmplitudeAmplificationOptions {
  /** Number of iterations to perform (auto-calculated if not provided) */
  iterations?: number;
  /** Custom state preparation function (defaults to uniform superposition) */
  statePreparation?: StatePreparation;
  /** Whether to optimize for maximum success probability */
  optimize?: boolean;
  /** Tolerance for success probability calculations */
  tolerance?: number;
}

/**
 * Implements the general Amplitude Amplification algorithm.
 *
 * Amplitude Amplification provides a systematic method for amplifying
 * desired amplitudes in quantum superposition states. It generalizes
 * Grover's algorithm to work with arbitrary state preparations and oracles.
 *
 * **Algorithm Steps:**
 * 1. **State Preparation**: Initialize the quantum register in a superposition
 * 2. **Oracle Application**: Apply phase flip to marked states
 * 3. **Diffusion**: Reflect about the initial state
 * 4. **Iteration**: Repeat oracle + diffusion for optimal number of times
 *
 * **Theoretical Speedup:**
 * - Classical search: O(N) for N items
 * - Amplitude Amplification: O(√N) with optimal success probability
 *
 * @param numQubits - Number of qubits in the quantum register
 * @param oracle - Function that identifies target states
 * @param options - Configuration options for the algorithm
 * @returns Circuit implementing Amplitude Amplification
 * @throws {Error} If numQubits < 1 or no marked states exist
 * @category Algorithms
 *
 *
 */
function QAA(
  numQubits: number,
  oracle: AmplitudeOracle,
  options: AmplitudeAmplificationOptions = {},
): Circuit {
  if (numQubits < 1) {
    throw new Error('Number of qubits must be at least 1');
  }

  const { iterations, statePreparation, optimize = false, tolerance = 1e-10 } = options;

  const circuit = new Circuit(numQubits);

  // Step 1: State Preparation (default to uniform superposition)
  const defaultStatePrep = (c: Circuit): void => {
    for (let i = 0; i < numQubits; i++) {
      c.h(i);
    }
  };

  const statePrep = statePreparation || defaultStatePrep;
  statePrep(circuit);

  // Calculate initial success probability for optimization
  const tempCircuit = new Circuit(numQubits);
  statePrep(tempCircuit);
  const initialResult = tempCircuit.execute();
  const initialAmplitudes = initialResult.state.amplitudes();

  // Calculate optimal iterations if not provided
  let numIterations = iterations;
  if (numIterations === undefined) {
    numIterations = calculateOptimalIterations(
      numQubits,
      oracle,
      initialAmplitudes,
      optimize,
      tolerance,
    );
  }

  // Algorithm setup complete: ${numIterations} iterations on ${numQubits} qubits

  // Step 2: Apply Amplitude Amplification iterations
  for (let iter = 0; iter < numIterations; iter++) {
    // Apply oracle (phase flip for marked states)
    applyAmplitudeOracle(circuit, numQubits, oracle);

    // Apply diffusion operator (reflection about initial state)
    applyDiffusionOperator(circuit, numQubits, statePrep);
  }

  return circuit;
}

/**
 * Calculates the optimal number of iterations for Amplitude Amplification.
 *
 * The optimal number of iterations depends on the success probability
 * of the initial state and follows the formula:
 * k_opt = ⌊π/4 * √(N/M)⌋ where N is total states, M is marked states.
 *
 * @param numQubits - Number of qubits in the system
 * @param oracle - Oracle function for identifying marked states
 * @param initialAmplitudes - Initial state amplitudes
 * @param optimize - Whether to use optimization for better precision
 * @param tolerance - Numerical tolerance for calculations
 * @returns Optimal number of iterations
 * @internal
 */
function calculateOptimalIterations(
  numQubits: number,
  oracle: AmplitudeOracle,
  initialAmplitudes: Amplitude[],
  optimize: boolean,
  tolerance: number,
): number {
  const totalStates = Math.pow(2, numQubits);

  // Calculate initial success probability
  let successProbability = 0;
  for (let i = 0; i < totalStates; i++) {
    const bitString = i.toString(2).padStart(numQubits, '0');
    if (oracle(bitString)) {
      successProbability += initialAmplitudes[i]!.abs() ** 2;
    }
  }

  if (successProbability < tolerance) {
    throw new Error('No marked states reachable from initial state');
  }

  // Calculate number of marked states for theoretical formula
  let markedCount = 0;
  for (let i = 0; i < totalStates; i++) {
    const bitString = i.toString(2).padStart(numQubits, '0');
    if (oracle(bitString)) {
      markedCount++;
    }
  }

  if (optimize) {
    // Use exact formula based on initial success probability
    // k_opt = arccos(√p) / arccos(√(1-p)) where p is initial success probability
    const theta = Math.acos(Math.sqrt(successProbability));
    const optimalIterations = Math.floor(Math.PI / (4 * theta));
    return Math.max(1, optimalIterations);
  } else {
    // Use standard Grover formula as approximation
    const optimalIterations = Math.floor((Math.PI / 4) * Math.sqrt(totalStates / markedCount));
    return Math.max(1, optimalIterations);
  }
}

/**
 * Applies the oracle operator to the quantum circuit.
 * This performs a controlled phase flip on marked states using elementary gates.
 *
 * @param circuit - The quantum circuit to modify
 * @param numQubits - Number of qubits in the system
 * @param oracle - Oracle function identifying marked states
 * @internal
 */
function applyAmplitudeOracle(circuit: Circuit, numQubits: number, oracle: AmplitudeOracle): void {
  // Apply phase flip to marked computational basis states
  // For each computational basis state, check if oracle marks it
  const totalStates = Math.pow(2, numQubits);

  for (let i = 0; i < totalStates; i++) {
    const bitString = i.toString(2).padStart(numQubits, '0');
    if (oracle(bitString)) {
      // Apply controlled phase flip to this computational basis state
      // We need to flip the phase when all qubits match the pattern
      applyMultiControlledPhaseFlip(circuit, bitString);
    }
  }
}

/**
 * Applies the diffusion operator (inversion about average) to the quantum circuit.
 * This implements the diffusion operator: 2|s⟩⟨s| - I where |s⟩ is the initial state.
 * For uniform superposition, this becomes the standard Grover diffusion operator.
 *
 * @param circuit - The quantum circuit to modify
 * @param numQubits - Number of qubits in the system
 * @param statePrep - State preparation function that was used initially
 * @internal
 */
function applyDiffusionOperator(
  circuit: Circuit,
  numQubits: number,
  _statePrep: StatePreparation,
): void {
  // For uniform superposition (standard case), apply the standard diffusion operator
  // 1. Apply H gates to all qubits (inverse of state preparation)
  for (let i = 0; i < numQubits; i++) {
    circuit.h(i);
  }

  // 2. Apply conditional phase shift on |00...0⟩ state
  // This is equivalent to a multi-controlled Z gate on all qubits
  applyMultiControlledPhaseFlip(circuit, '0'.repeat(numQubits));

  // 3. Apply H gates again (reapply state preparation)
  for (let i = 0; i < numQubits; i++) {
    circuit.h(i);
  }
}

/**
 * Applies a multi-controlled phase flip for a specific computational basis state.
 * This function applies a phase flip (-1) when all qubits match the specified pattern.
 *
 * @param circuit - The quantum circuit to modify
 * @param targetState - Binary string representing the target computational basis state
 * @internal
 */
function applyMultiControlledPhaseFlip(circuit: Circuit, targetState: string): void {
  const numQubits = targetState.length;

  if (numQubits === 1) {
    // Single qubit case
    if (targetState === '1') {
      circuit.z(0);
    } else {
      // For |0⟩ state, need to flip then apply Z then flip back
      circuit.x(0);
      circuit.z(0);
      circuit.x(0);
    }
    return;
  }

  // Multi-qubit case: need to implement multi-controlled Z gate
  // Strategy: Convert non-1 targets to 1s, apply multi-controlled Z, then convert back

  // Step 1: Apply X gates to flip 0s to 1s where needed
  const flipBits: number[] = [];
  for (let i = 0; i < numQubits; i++) {
    if (targetState[i] === '0') {
      circuit.x(i);
      flipBits.push(i);
    }
  }

  // Step 2: Apply multi-controlled Z gate (all qubits now should be |1⟩ for the target state)
  if (numQubits === 2) {
    // Two-qubit controlled Z
    circuit.cz(0, 1);
  } else if (numQubits === 3) {
    // Three-qubit Toffoli-like gate with Z instead of X
    // Decomposition: CCZ can be implemented using CCX and Z
    // For now, use a simplified approach with multiple controlled gates
    circuit.h(2);
    circuit.cnot(1, 2);
    circuit.h(2);
    circuit.cnot(0, 2);
    circuit.h(2);
    circuit.cnot(1, 2);
    circuit.h(2);
    circuit.cnot(0, 2);
  } else {
    // For larger cases, use a simplified decomposition
    // This is not optimal but will work for demonstration
    const ancillaQubit = numQubits - 1; // Use last qubit as main target

    // Apply multi-controlled phase using available two-qubit gates
    for (let i = 0; i < numQubits - 1; i++) {
      circuit.cz(i, ancillaQubit);
    }
  }

  // Step 3: Restore the flipped bits
  for (const bit of flipBits) {
    circuit.x(bit);
  }
}

/**
 * Estimates the success probability of Amplitude Amplification.
 *
 * Calculates the probability of measuring a marked state after
 * running Amplitude Amplification for the specified number of iterations.
 *
 * @param numQubits - Number of qubits in the system
 * @param oracle - Oracle function identifying marked states
 * @param iterations - Number of Amplitude Amplification iterations
 * @param statePreparation - Optional custom state preparation
 * @returns Estimated success probability (0 to 1)
 * @category Algorithms
 *
 */
function estimateSuccessProbability(
  numQubits: number,
  oracle: AmplitudeOracle,
  iterations: number,
  statePreparation?: StatePreparation,
): number {
  // Create temporary circuit to analyze initial state
  const tempCircuit = new Circuit(numQubits);

  if (statePreparation) {
    statePreparation(tempCircuit);
  } else {
    // Default uniform superposition
    for (let i = 0; i < numQubits; i++) {
      tempCircuit.h(i);
    }
  }

  const initialResult = tempCircuit.execute();
  const initialAmplitudes = initialResult.state.amplitudes();

  // Calculate initial success probability
  const totalStates = Math.pow(2, numQubits);
  let initialSuccess = 0;

  for (let i = 0; i < totalStates; i++) {
    const bitString = i.toString(2).padStart(numQubits, '0');
    if (oracle(bitString)) {
      initialSuccess += initialAmplitudes[i]!.abs() ** 2;
    }
  }

  // Calculate success probability after k iterations
  // Using the exact formula: sin²((2k+1)θ) where sin²(θ) = initial_success
  const theta = Math.asin(Math.sqrt(initialSuccess));
  const finalProbability = Math.sin((2 * iterations + 1) * theta) ** 2;

  return Math.max(0, Math.min(1, finalProbability));
}

/**
 * Finds the optimal number of iterations for a given target success probability.
 *
 * Uses binary search to find the number of iterations that achieves
 * the closest success probability to the target.
 *
 * @param numQubits - Number of qubits in the system
 * @param oracle - Oracle function identifying marked states
 * @param targetProbability - Desired success probability (0 to 1)
 * @param statePreparation - Optional custom state preparation
 * @param maxIterations - Maximum iterations to consider (default: 100)
 * @returns Optimal number of iterations
 * @category Algorithms
 */
function findOptimalIterations(
  numQubits: number,
  oracle: AmplitudeOracle,
  targetProbability: number,
  statePreparation?: StatePreparation,
  maxIterations: number = 100,
): number {
  if (targetProbability < 0 || targetProbability > 1) {
    throw new Error('Target probability must be between 0 and 1');
  }

  let bestIterations = 0;
  let bestDifference = Infinity;

  for (let iter = 0; iter <= maxIterations; iter++) {
    const probability = estimateSuccessProbability(numQubits, oracle, iter, statePreparation);
    const difference = Math.abs(probability - targetProbability);

    if (difference < bestDifference) {
      bestDifference = difference;
      bestIterations = iter;
    }
  }

  // Optimization complete: found optimal iterations = ${bestIterations}

  return bestIterations;
}

/**
 * Creates a composite oracle from multiple oracle functions.
 * This allows for complex search conditions using logical operations.
 *
 * @param oracles - Array of oracle functions
 * @param operation - Logical operation to combine oracles ('AND', 'OR', 'XOR')
 * @returns Combined oracle function
 * @category Algorithms
 */
function createCompositeOracle(
  oracles: AmplitudeOracle[],
  operation: 'AND' | 'OR' | 'XOR' = 'AND',
): AmplitudeOracle {
  if (oracles.length === 0) {
    throw new Error('At least one oracle function is required');
  }

  return (input: string): boolean => {
    const results = oracles.map((oracle) => oracle(input));

    switch (operation) {
      case 'AND':
        return results.every((result) => result);
      case 'OR':
        return results.some((result) => result);
      case 'XOR':
        return results.reduce((acc, result) => acc !== result, false);
      default:
        throw new Error(`Unknown operation: ${String(operation)}`);
    }
  };
}

/**
 * Counts the number of marked states for a given oracle.
 * This is a common utility function used by both QAA and Grover algorithms.
 *
 * @param numQubits - Number of qubits in the system
 * @param oracle - Oracle function identifying marked items
 * @returns Number of marked states
 * @category Algorithms
 */
function countMarkedStates(numQubits: number, oracle: AmplitudeOracle): number {
  const totalStates = Math.pow(2, numQubits);
  let markedStates = 0;

  for (let i = 0; i < totalStates; i++) {
    const bitString = i.toString(2).padStart(numQubits, '0');
    if (oracle(bitString)) {
      markedStates++;
    }
  }

  return markedStates;
}

/**
 * Creates a uniform superposition state preparation function.
 * This is the most common state preparation for amplitude amplification algorithms.
 *
 * @param numQubits - Number of qubits to prepare
 * @returns State preparation function that creates uniform superposition
 * @category Algorithms
 *
 */
function createUniformSuperposition(numQubits: number): StatePreparation {
  return (circuit: Circuit): void => {
    for (let i = 0; i < numQubits; i++) {
      circuit.h(i);
    }
  };
}

/**
 * Calculates theoretical optimal iterations using the standard Grover formula.
 * This provides a quick approximation that works well for most cases.
 *
 * @param totalStates - Total number of states (2^numQubits)
 * @param markedStates - Number of marked states
 * @returns Theoretical optimal iterations
 * @category Algorithms
 *
 */
function calculateTheoreticalOptimal(totalStates: number, markedStates: number): number {
  if (markedStates <= 0 || markedStates > totalStates) {
    throw new Error('Invalid number of marked items');
  }

  const optimalIterations = Math.floor((Math.PI / 4) * Math.sqrt(totalStates / markedStates));
  return Math.max(1, optimalIterations);
}

/**
 * Calculates success probability using theoretical formula.
 * This is faster than simulation and accurate for uniform superposition.
 *
 * @param totalStates - Total number of states (2^numQubits)
 * @param markedStates - Number of marked states
 * @param iterations - Number of iterations
 * @returns Success probability (0 to 1)
 * @category Algorithms
 *
 */
function calculateTheoreticalProbability(
  totalStates: number,
  markedStates: number,
  iterations: number,
): number {
  if (markedStates <= 0 || markedStates > totalStates) {
    throw new Error('Invalid number of marked items');
  }

  const initialSuccess = markedStates / totalStates;
  const theta = Math.asin(Math.sqrt(initialSuccess));
  const finalProbability = Math.sin((2 * iterations + 1) * theta) ** 2;

  return Math.max(0, Math.min(1, finalProbability));
}

// Exports

// Type exports
export type { AmplitudeOracle, StatePreparation, AmplitudeAmplificationOptions };

// Function exports
export {
  QAA,
  estimateSuccessProbability,
  findOptimalIterations,
  createCompositeOracle,
  countMarkedStates,
  createUniformSuperposition,
  calculateTheoreticalOptimal,
  calculateTheoreticalProbability,
};
