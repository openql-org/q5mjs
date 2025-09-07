// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * Full-featured entry point for q5m.js quantum computing library.
 *
 * This module combines core functionality with package extensions:
 * - All core functionality from core-entry
 * - All detailed gate classes from full-entry
 * - All package extensions from packages-entry
 *
 * For a lighter bundle, use q5m/core instead.
 */

// Named exports
export * from './core-entry';
export * from './full-entry';
export * from './packages-entry';

// Default export for convenient usage
import { Circuit } from './core/Circuit';
import { QubitState } from './core/QubitState';
import * as Gates from './core/Gates';
import * as algorithms from './algorithms';
import * as converters from './converters';
import * as math from './math/math-utils';
import { complex } from './math/complex';
import { NotebookRenderer } from './notebook/NotebookRenderer';
import {
  enableNotebookMode,
  extendCircuitForNotebook,
  extendQubitStateForNotebook,
} from './notebook/notebook-extensions';

const Q5M = {
  // Core classes
  Circuit,
  QubitState,

  // Gates
  ...Gates,

  // Algorithms
  algorithms,

  // Converters
  converters,

  // Math utilities
  math: {
    ...math,
    complex,
  },

  // Notebook support
  notebook: {
    NotebookRenderer,
    enableNotebookMode,
    extendCircuitForNotebook,
    extendQubitStateForNotebook,
  },
};

export default Q5M;
