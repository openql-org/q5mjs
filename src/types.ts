// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * Complete Type Definition Export for q5m.js Extension Development
 *
 * This module provides comprehensive type definitions by re-exporting types from the core
 * modules. Extension packages can import these types to build type-safe extensions.
 *
 */

// === Core Circuit Types ===
export type {
  CircuitInstruction,
  GateOptions,
  GateFactory,
  SimpleCircuitData,
  SerializedGateParameters,
  SerializedGate,
  CircuitMetadata,
  SerializedCircuit,
  SerializationOptions,
  LoadOptions,
} from './core/BaseCircuit';

export { CURRENT_VERSION, SUPPORTED_VERSIONS } from './core/BaseCircuit';

// === Execution and Results ===
export type {
  Probability,
  ZeroOne,
  ExecutionResult,
  Q5mExecutable,
  MeasurementResult,
} from './core/Results';

// === Core Classes ===
export { Circuit } from './core/Circuit';
export { QubitState } from './core/QubitState';

// === Core System Types ===
export type { Q5mSystem } from './core/Q5mSystem';
export type { Q5mIndex, StateVector } from './core/Q5mMaterial';
export type { Q5mGate } from './core/Q5mGate';
export { RepType } from './core/Q5mState';
export type { Q5mApplicable, Q5mState } from './core/Q5mState';

// === Visualization Types ===
export type {
  GatePosition,
  CircuitLayout,
  WireConnection,
  ASCIIRenderOptions,
  SVGCircuitData,
  SVGGate,
  SVGWire,
  SVGQubit,
} from './visualization/CircuitRenderer';

export { CircuitRenderer } from './visualization/CircuitRenderer';

export type {
  AmplitudeDisplay,
  StateRenderOptions,
  BlochSphereData,
  ProbabilityHistogram,
  PhaseVisualization,
} from './visualization/StateRenderer';

export { StateRenderer } from './visualization/StateRenderer';

// === Notebook Integration Types ===
export type {
  MimeBundle,
  JupyterDisplayObject,
  NotebookRenderOptions,
  JupyterWindow,
  GlobalWithWindow,
  SVGData,
  GateParams,
} from './notebook/types';

export { NotebookOutput } from './notebook/types';

// === Algorithm Types ===
// Re-export algorithm-related types from algorithms modules
export * from './algorithms';

// === Converter Types ===
// Re-export converter types from converters modules
export * from './converters';

// === Mathematical Types ===
export type { Complex } from './math/complex';
export { complex, ZERO, ONE, I } from './math/complex';
export type { Amplitude, Unitary, Hermitian, Radians } from './math/math-utils';
export {
  isValidAmplitude,
  createAmplitude,
  normalizeAmplitudes,
  isUnitary,
  createUnitary,
  isHermitian,
  createHermitian,
  parseAngle,
  formatAmplitude,
  normalize,
  innerP,
  tensorP,
  matXvec,
  matXmat,
  dagger,
} from './math/math-utils';

/**
 * Type utility to help extension developers identify q5m types
 */
export type Q5mTypeMarker = 'q5m-type';

/**
 * Base interface that extension types can implement for better integration
 */
export interface Q5mExtensionType {
  readonly __q5mType: Q5mTypeMarker;
}
