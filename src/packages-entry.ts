// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

export {
  groverSearch,
  grover,
  groverIter,
  groverProb,
  analyzeGroverPerformance,
  estimateSuccessProbability,
} from './algorithms/grover';

export { quantumFourierTransform, QFT, qftEncode } from './algorithms/qft';

export {
  quantumPhaseEstimation,
  QPE,
  estimatePhase,
  decodePhaseEstimate,
  estimateControlQubits,
} from './algorithms/QPE';

export { QAA, findOptimalIterations, createCompositeOracle } from './algorithms/QAA';

// Converter
export { exportToQiskit } from './converters/qiskit';
export { exportToOpenQASM } from './converters/openqasm';
export { exportToCirq } from './converters/cirq';

// Visualization
export { CircuitRenderer } from './visualization/CircuitRenderer';
export { StateRenderer } from './visualization/StateRenderer';

// Notebook integration exports
export { NotebookRenderer } from './notebook/NotebookRenderer';
export { NotebookOutput } from './notebook/types';
export {
  extendCircuitForNotebook,
  extendQubitStateForNotebook,
  enableNotebookMode,
} from './notebook/notebook-extensions';

export type {
  MimeBundle,
  JupyterDisplayObject,
  NotebookRenderOptions,
  JupyterWindow,
} from './notebook/types';

// Export comprehensive type definitions for extension development
export * as Types from './types';
