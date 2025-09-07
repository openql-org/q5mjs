// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Implements Grover's quantum search algorithm using Amplitude Amplification.
 *
 * This module provides functions to construct quantum circuits for Grover's search,
 * a quantum algorithm that offers a quadratic speedup for searching unsorted databases.
 *
 * Grover's algorithm is implemented as a specialized wrapper around the more general
 * Amplitude Amplification framework, eliminating code duplication while maintaining
 * both theoretical correctness and practical efficiency.
 *
 * **Key Features:**
 * - Built on Amplitude Amplification foundation (no code duplication)
 * - Automatic optimal iteration calculation via QAA
 * - Support for multiple marked items and pattern matching
 * - Comprehensive error handling and validation
 * - Performance analysis using QAA's probability estimation
 * - Direct re-export of QAA functions for advanced users
 *
 * **Architecture:**
 * - Core algorithm delegates to `QAA()`
 * - Analysis functions use QAA's estimation and optimization
 * - Helper functions provide Grover-specific conveniences
 * - No duplicate computation logic between Grover and QAA
 *
 * @packageDocumentation
 */

import type { Circuit } from '../core/Circuit';
import {
  QAA,
  findOptimalIterations,
  countMarkedStates,
  createUniformSuperposition,
  calculateTheoreticalOptimal,
  calculateTheoreticalProbability,
  type AmplitudeOracle,
} from './QAA';

/**
 * Defines the oracle function for Grover's algorithm.
 * The oracle is a black-box function that identifies the "marked" items
 * in the search space by returning true for them.
 *
 * This is an alias for AmplitudeOracle to maintain API compatibility
 * while leveraging the Amplitude Amplification foundation.
 *
 * @param input - A binary string representing an item in the search space.
 * @returns `true` if the input is a marked item, `false` otherwise.
 * @category Algorithms
 */
type GroverOracle = AmplitudeOracle;

/**
 * Configuration options for Grover's algorithm.
 *
 * @category Algorithms
 */
interface GroverOptions {
  /** Number of iterations to perform (auto-calculated if not provided) */
  iterations?: number;
  /** Whether to optimize for maximum success probability */
  optimize?: boolean;
  /** Target success probability for optimization */
  targetProbability?: number;
}

/**
 * Implements Grover's quantum search algorithm using Amplitude Amplification.
 *
 * Grover's algorithm provides quadratic speedup for searching unsorted databases.
 * This implementation uses the general Amplitude Amplification framework,
 * which ensures theoretical correctness and optimal performance.
 *
 * **Algorithm Overview:**
 * 1. **Initialization**: Create uniform superposition over all states
 * 2. **Amplitude Amplification**: Apply oracle + diffusion iterations
 * 3. **Measurement**: Obtain marked states with high probability
 *
 * **Theoretical Speedup:**
 * - Classical search: O(N) expected time
 * - Grover's algorithm: O(√N) expected time
 * - Success probability: ~1 with optimal iterations
 *
 * @param numQubits - Number of qubits (search space size = 2^numQubits)
 * @param oracle - Function that identifies marked items
 * @param options - Configuration options for the algorithm
 * @returns Circuit implementing Grover's algorithm
 * @throws {Error} If numQubits < 1 or no marked items exist
 * @category Algorithms
 *
 */
function groverSearch(
  numQubits: number,
  oracle: GroverOracle,
  options: GroverOptions = {},
): Circuit {
  if (numQubits < 1) {
    throw new Error('Number of qubits must be at least 1');
  }

  const { iterations, optimize = false, targetProbability } = options;

  // Use QAA's efficient uniform superposition preparation
  const uniformSuperposition = createUniformSuperposition(numQubits);

  // Use target probability optimization if requested
  let finalIterations = iterations;
  if (finalIterations === undefined && targetProbability !== undefined) {
    finalIterations = findOptimalIterations(
      numQubits,
      oracle,
      targetProbability,
      uniformSuperposition,
    );
  }

  // Apply Amplitude Amplification with Grover-specific parameters
  const amplificationOptions = {
    statePreparation: uniformSuperposition,
    optimize,
    tolerance: 1e-10,
    ...(finalIterations !== undefined && { iterations: finalIterations }),
  };

  return QAA(numQubits, oracle, amplificationOptions);
}

/**
 * Analyzes the success probability of Grover's algorithm.
 *
 * Provides detailed analysis of how Grover's algorithm performs
 * for the given oracle and number of iterations. Uses the underlying
 * Amplitude Amplification framework for accurate analysis.
 *
 * @param numQubits - Number of qubits in the system
 * @param oracle - Oracle function identifying marked items
 * @param iterations - Number of Grover iterations to analyze
 * @returns Object containing success probability and analysis
 * @category Algorithms
 *
 */
function analyzeGroverPerformance(
  numQubits: number,
  oracle: GroverOracle,
  iterations: number,
): {
  successProbability: number;
  optimalIterations: number;
  markedStates: number;
  totalStates: number;
  theoreticalOptimum: number;
} {
  const totalStates = Math.pow(2, numQubits);

  // Use QAA's efficient marked states counting
  const markedStates = countMarkedStates(numQubits, oracle);

  if (markedStates === 0) {
    throw new Error('No marked states found');
  }

  // Use QAA's theoretical probability calculation (much faster than simulation)
  const successProbability = calculateTheoreticalProbability(totalStates, markedStates, iterations);

  // Use QAA's theoretical optimum calculation
  const theoreticalOptimum = calculateTheoreticalOptimal(totalStates, markedStates);

  // Use QAA's optimization for actual optimal iterations with uniform superposition
  const uniformSuperposition = createUniformSuperposition(numQubits);
  const optimalIterations = findOptimalIterations(numQubits, oracle, 1.0, uniformSuperposition);

  return {
    successProbability,
    optimalIterations,
    markedStates,
    totalStates,
    theoreticalOptimum,
  };
}

/**
 * Convenient wrapper for searching a specific item using Grover's algorithm.
 *
 * This function provides a simple interface for searching for a single
 * target item in the quantum search space using the optimized Grover implementation.
 *
 * @param numQubits - Number of qubits in the system
 * @param targetItem - Binary string to search for (must be numQubits long)
 * @param options - Optional configuration for the search
 * @returns Circuit that searches for the target item
 * @throws {Error} If target item length doesn't match numQubits
 * @category Algorithms
 *
 */
function grover(numQubits: number, targetItem: string, options: GroverOptions = {}): Circuit {
  if (targetItem.length !== numQubits) {
    throw new Error(`Target item must be ${numQubits} bits`);
  }

  const oracle: GroverOracle = (input: string) => input === targetItem;
  return groverSearch(numQubits, oracle, options);
}

/**
 * Creates a Grover oracle for searching multiple items.
 *
 * This convenience function creates an oracle that marks multiple
 * target items, useful for searching several items simultaneously.
 *
 * @param targetItems - Array of binary strings to search for
 * @returns Oracle function that marks any of the target items
 * @category Algorithms
 *
 */
function groverSearchForMultipleItems(targetItems: string[]): GroverOracle {
  if (targetItems.length === 0) {
    throw new Error('At least one target item must be provided');
  }

  // Validate all items have the same length
  const itemLength = targetItems[0]!.length;
  for (const item of targetItems) {
    if (item.length !== itemLength) {
      throw new Error('All target items must have the same length');
    }
  }

  return (input: string): boolean => targetItems.includes(input);
}

/**
 * Creates advanced Grover oracles using pattern matching.
 *
 * This function provides a flexible way to create oracles based on
 * patterns rather than explicit item lists.
 *
 * @param pattern - Pattern to match ('startsWith', 'endsWith', 'contains', 'regex')
 * @param value - Value to match against
 * @returns Oracle function implementing the pattern match
 * @category Algorithms
 *
 */
function createPatternOracle(
  pattern: 'startsWith' | 'endsWith' | 'contains' | 'regex',
  value: string,
): GroverOracle {
  switch (pattern) {
    case 'startsWith':
      return (input: string) => input.startsWith(value);
    case 'endsWith':
      return (input: string) => input.endsWith(value);
    case 'contains':
      return (input: string) => input.includes(value);
    case 'regex': {
      const regex = new RegExp(value);
      return (input: string) => regex.test(input);
    }
    default:
      throw new Error(`Unknown pattern type: ${String(pattern)}`);
  }
}

// Type exports
export type { GroverOracle, GroverOptions };

// Function exports
export {
  groverSearch,
  analyzeGroverPerformance,
  grover,
  groverSearchForMultipleItems,
  createPatternOracle,
  groverIter,
  groverProb,
};

// Re-export Amplitude Amplification functions for advanced users
export {
  QAA,
  estimateSuccessProbability,
  findOptimalIterations,
  createCompositeOracle,
  countMarkedStates,
  createUniformSuperposition,
  calculateTheoreticalOptimal,
  calculateTheoreticalProbability,
} from './QAA';

/**
 * Calculates the optimal number of iterations for Grover's algorithm.
 *
 * This is a convenience wrapper around QAA's theoretical optimal calculation.
 * For more accurate results with custom state preparations, use `findOptimalIterations` directly.
 *
 * @param numStates - Total number of states (2^numQubits)
 * @param markedStates - Number of marked states
 * @returns Optimal number of iterations
 * @category Algorithms
 */
function groverIter(numStates: number, markedStates: number): number {
  const numQubits = Math.log2(numStates);
  if (!Number.isInteger(numQubits) || numQubits < 1) {
    throw new Error('Number of states must be a power of 2 and at least 2');
  }

  // Delegate to QAA's optimized theoretical calculation
  return calculateTheoreticalOptimal(numStates, markedStates);
}

/**
 * Calculates the success probability of Grover's algorithm.
 *
 * This is a convenience wrapper around QAA's theoretical probability calculation.
 * For custom state preparations, use `estimateSuccessProbability` directly.
 *
 * @param numStates - Total number of states (2^numQubits)
 * @param markedStates - Number of marked states
 * @param iterations - Number of Grover iterations
 * @returns Success probability (0 to 1)
 * @category Algorithms
 */
function groverProb(numStates: number, markedStates: number, iterations: number): number {
  const numQubits = Math.log2(numStates);
  if (!Number.isInteger(numQubits) || numQubits < 1) {
    throw new Error('Number of states must be a power of 2 and at least 2');
  }

  // Delegate to QAA's optimized theoretical probability calculation
  return calculateTheoreticalProbability(numStates, markedStates, iterations);
}
