// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @fileoverview Type-safe result types and validation utilities for quantum operations.
 *
 * This module provides core types and validation functions for quantum measurement results
 * and execution results, ensuring type safety throughout the quantum computing library.
 */

import type { Q5mState } from './Q5mState';
import type { Q5mIndex } from './Q5mMaterial';

/** Probability value constrained to [0, 1] range */
type Probability = number;

/** Binary measurement outcome (0 or 1) */
type ZeroOne = 0 | 1;

/** Quantum circuit execution result */
interface ExecutionResult {
  /** Final quantum state after execution */
  state: Q5mState;
  /** Whether execution completed successfully */
  success: boolean;
  /** Error message if execution failed */
  error?: string | undefined;
  /** Measurement results collected during circuit execution */
  measurements?: MeasurementResult[];
  /** Whether any measurements were performed during execution */
  hasMeasurements: boolean;
}

/** Interface for executable quantum objects */
interface Q5mExecutable {
  /** Execute with default initial state */
  execute(): ExecutionResult;
  /** Execute with provided initial state */
  run(initialState: Q5mState): ExecutionResult;
}

/** Quantum measurement result (single or multiple qubits) */
interface MeasurementResult {
  /** Index or indices of measured qubits */
  measureIndex: Q5mIndex | Q5mIndex[];
  /** Measurement outcome: 0, 1 for single qubit; "00", "101" etc. for multiple qubits */
  outcome: ZeroOne | string;
  /** Probability of this measurement outcome */
  probability: Probability;
  /** Collapsed quantum state after measurement */
  collapsedState: Q5mState;
  /** Measurement basis used (e.g., 'computational', 'hadamard', 'circular') */
  basis?: string;
  /** Additional metadata for the measurement */
  metadata?: Record<string, unknown>;
}

/** Minimum contract for measurement gates */
interface Q5mMeasurable {
  /** Perform measurement on quantum state */
  measure(state: Q5mState, index: Q5mIndex): MeasurementResult;
  /** Calculate measurement probabilities without collapsing state */
  probabilities(state: Q5mState, index: Q5mIndex): { prob0: Probability; prob1: Probability };
  /** Name of the measurement basis */
  readonly basisName: string;
}

/**
 * Type guard to check if a value is a valid MeasurementResult.
 *
 * @param value - Value to validate
 * @returns True if value is a valid MeasurementResult
 */
function isMeasurementResult(value: unknown): value is MeasurementResult {
  if (!value || typeof value !== 'object') return false;

  const obj = value as Record<string, unknown>;
  return (
    (typeof obj.measureIndex === 'number' || Array.isArray(obj.measureIndex)) &&
    (obj.outcome === 0 || obj.outcome === 1 || typeof obj.outcome === 'string') &&
    typeof obj.probability === 'number' &&
    obj.probability >= 0 &&
    obj.probability <= 1 &&
    'collapsedState' in obj &&
    obj.collapsedState !== null &&
    typeof obj.collapsedState === 'object'
  );
}

/**
 * Type guard to check if a value is a valid probability (0-1).
 *
 * @param value - Value to validate
 * @returns True if value is a valid probability
 */
function isProbability(value: unknown): value is Probability {
  return typeof value === 'number' && value >= 0 && value <= 1;
}

/**
 * Type guard to check if a value is 0 or 1.
 *
 * @param value - Value to validate
 * @returns True if value is 0 or 1
 */
function isZeroOne(value: unknown): value is ZeroOne {
  return value === 0 || value === 1;
}

/**
 * Validates and normalizes a probability value.
 *
 * @param value - Value to validate
 * @param name - Name of the probability for error messages
 * @returns Validated probability value
 * @throws Error if value is not a valid probability
 */
function validateProbability(value: unknown, name = 'probability'): Probability {
  if (!isProbability(value)) {
    throw new Error(`Invalid ${name}: must be a number between 0 and 1, got ${String(value)}`);
  }
  return value;
}

/**
 * Validates a measurement outcome.
 *
 * @param value - Value to validate
 * @returns Validated ZeroOne value
 * @throws Error if value is not 0 or 1
 */
function validateZeroOne(value: unknown): ZeroOne {
  if (!isZeroOne(value)) {
    throw new Error(`Invalid measurement outcome: must be 0 or 1, got ${String(value)}`);
  }
  return value;
}

/**
 * Creates a standardized measurement result.
 *
 * @param params - Measurement result parameters
 * @returns Validated MeasurementResult
 */
function createMeasurementResult(params: {
  measureIndex: Q5mIndex | Q5mIndex[];
  outcome: ZeroOne | string;
  probability: number;
  collapsedState: Q5mState;
  basis?: string;
  metadata?: Record<string, unknown>;
}): MeasurementResult {
  const { measureIndex, outcome, probability, collapsedState, basis, metadata } = params;

  validateProbability(probability, 'measurement probability');

  const result: MeasurementResult = {
    measureIndex,
    outcome,
    probability,
    collapsedState,
    ...(basis && { basis }),
    ...(metadata && { metadata }),
  };

  return result;
}

/**
 * Type guard to check if a value is a valid ExecutionResult.
 *
 * @param value - Value to validate
 * @returns True if value is a valid ExecutionResult
 */
function isExecutionResult(value: unknown): value is ExecutionResult {
  if (!value || typeof value !== 'object') return false;

  const obj = value as Record<string, unknown>;
  return (
    'state' in obj &&
    obj.state !== null &&
    typeof obj.state === 'object' &&
    typeof obj.success === 'boolean' &&
    typeof obj.hasMeasurements === 'boolean' &&
    (obj.error === undefined || typeof obj.error === 'string') &&
    (obj.measurements === undefined || Array.isArray(obj.measurements))
  );
}

/**
 * Creates a successful execution result.
 *
 * @param state - Final quantum state
 * @param measurements - Optional measurement results
 * @returns ExecutionResult indicating success
 */
function createSuccessResult(state: Q5mState, measurements?: MeasurementResult[]): ExecutionResult {
  const hasMeasurements = Boolean(measurements && measurements.length > 0);
  const result: ExecutionResult = {
    state,
    success: true,
    hasMeasurements,
  };

  if (hasMeasurements && measurements) {
    result.measurements = measurements;
  }

  return result;
}

/**
 * Creates a failed execution result.
 *
 * @param state - Quantum state at failure point
 * @param error - Error message
 * @param measurements - Optional measurement results collected before failure
 * @returns ExecutionResult indicating failure
 */
function createErrorResult(
  state: Q5mState,
  error: string,
  measurements?: MeasurementResult[],
): ExecutionResult {
  const hasMeasurements = Boolean(measurements && measurements.length > 0);
  const result: ExecutionResult = {
    state,
    success: false,
    error,
    hasMeasurements,
  };

  if (hasMeasurements && measurements) {
    result.measurements = measurements;
  }

  return result;
}

export type {
  Probability,
  ZeroOne,
  MeasurementResult,
  ExecutionResult,
  Q5mExecutable,
  Q5mMeasurable,
};

export {
  isProbability,
  isZeroOne,
  isMeasurementResult,
  isExecutionResult,
  validateProbability,
  validateZeroOne,
  createMeasurementResult,
  createSuccessResult,
  createErrorResult,
};
