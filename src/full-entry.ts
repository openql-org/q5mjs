// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * Full entry point with detailed gate classes for q5m.js quantum computing library.
 *
 * This module exports detailed gate classes and advanced features:
 * - Individual gate class constructors (HadamardGate, PauliXGate, etc.)
 * - Detailed gate implementations for advanced use cases
 * - Plugin system for extension packages
 * - Event System with EventEmitter and HookManager for inter-plugin communication
 * - Hook mechanism for processing intervention
 * - Does NOT include core-entry functionality (use index.ts for complete access)
 */

// Individual gate classes for advanced usage
export {
  HadamardGate,
  PauliXGate,
  PauliYGate,
  PauliZGate,
  SGate,
  TGate,
  IdentityGate,
  PhaseGate,
  RotationXGate,
  RotationYGate,
  RotationZGate,
  UnitaryGate,
} from './core/OneQubitGates';

export {
  CNOTGate,
  ControlledZGate,
  ControlledYGate,
  SWAPGate,
  ControlledHadamardGate,
  ControlledPhaseGate,
  ControlledUnitaryGate,
} from './core/TwoQubitGates';

export {
  MultiQubitGate,
  GlobalPhaseGate,
  MultiHadamardGate,
  createGlobalPhase,
  createMultiHadamard,
} from './core/MultiQubitGates';

export {
  MeasureGate,
  MeasureZGate,
  MeasureXGate,
  MeasureYGate,
  MeasurePhaseGate,
} from './core/MeasureGates';

export { CURRENT_VERSION, SUPPORTED_VERSIONS } from './core/BaseCircuit';

export { Q5mObserver } from './core/Q5mObserver';
export { Q5mState } from './core/Q5mState';
export { Q5mGate } from './core/Q5mGate';
export { Q5mOperator } from './core/Q5mOperator';
export type { Q5mExecutable, Q5mMeasurable } from './core/Results';

// Core classes (but not Circuit/QubitState as per test requirements)
export { RepType } from './core/Q5mState';

export { isValidQ5mIndex } from './core/Q5mMaterial';
export type { Q5mIndex } from './core/Q5mMaterial';
