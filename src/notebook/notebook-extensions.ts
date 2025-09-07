// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * Notebook display extensions for Circuit and QubitState
 *
 * This module provides Jupyter notebook display methods without modifying core files.
 * It adds the necessary display protocol methods to existing classes.
 *
 * @packageDocumentation
 */

import type { Circuit } from '../core/Circuit';
import type { QubitState } from '../core/QubitState';
import { NotebookRenderer } from './NotebookRenderer';
import { CircuitRenderer } from '../visualization/CircuitRenderer';
import { exportToOpenQASM, type OpenQASMExportOptions } from '../converters/openqasm';
import type { MimeBundle, GateParams } from './types';

/**
 * Extend Circuit prototype with Jupyter display methods
 * @param CircuitClass - The Circuit class to extend
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extendCircuitForNotebook(CircuitClass: any): void {
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  // HTML representation
  if (!CircuitClass.prototype._repr_html_) {
    CircuitClass.prototype._repr_html_ = function (this: Circuit): string {
      const output = NotebookRenderer.renderCircuit(this, { interactive: true });
      return output.toHTML();
    };
  }

  // SVG representation
  if (!CircuitClass.prototype._repr_svg_) {
    CircuitClass.prototype._repr_svg_ = function (this: Circuit): string {
      const output = NotebookRenderer.renderCircuit(this, { interactive: false });
      return output.toSVG() || /* istanbul ignore next */ '';
    };
  }

  // LaTeX representation
  if (!CircuitClass.prototype._repr_latex_) {
    CircuitClass.prototype._repr_latex_ = function (this: Circuit): string {
      return `$$${CircuitRenderer.exportLaTeX(this)}$$`;
    };
  }

  // MIME bundle
  if (!CircuitClass.prototype._repr_mimebundle_) {
    CircuitClass.prototype._repr_mimebundle_ = function (this: Circuit): MimeBundle {
      const output = NotebookRenderer.renderCircuit(this);
      return output.toMimeBundle();
    };
  }

  // Notebook helper
  if (!CircuitClass.prototype.toNotebook) {
    CircuitClass.prototype.toNotebook = function (this: Circuit): unknown {
      return NotebookRenderer.renderCircuit(this);
    };
  }

  // OpenQASM export
  if (!CircuitClass.prototype.toOpenQASM) {
    CircuitClass.prototype.toOpenQASM = function (
      this: Circuit,
      options?: OpenQASMExportOptions,
    ): string {
      return exportToOpenQASM(this, options);
    };
  }

  // JSON export
  /* istanbul ignore next */
  CircuitClass.prototype.toJSON = function (this: Circuit): unknown {
    return {
      numQubits: this.quantumCount(),
      instructions: this.instructionsList().map((inst) => ({
        gate: inst.gate.name,
        targets: inst.targets,
        params: (inst.gate as { params?: GateParams }).params,
      })),
    };
  };
  /* eslint-enable @typescript-eslint/no-unsafe-member-access */
}

/**
 * Extend QubitState prototype with Jupyter display methods
 * @param QubitStateClass - The QubitState class to extend
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extendQubitStateForNotebook(QubitStateClass: any): void {
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  // HTML representation
  if (!QubitStateClass.prototype._repr_html_) {
    QubitStateClass.prototype._repr_html_ = function (this: QubitState): string {
      const output = NotebookRenderer.renderState(this, {
        showStateVector: true,
        showMeasurements: true,
      });
      return output.toHTML();
    };
  }

  // LaTeX representation
  if (!QubitStateClass.prototype._repr_latex_) {
    QubitStateClass.prototype._repr_latex_ = function (this: QubitState): string | undefined {
      if (this.quantumCount() <= 3) {
        const output = NotebookRenderer.renderState(this);
        return output.toLaTeX();
      }
      return undefined;
    };
  }

  // JSON representation
  if (!QubitStateClass.prototype._repr_json_) {
    QubitStateClass.prototype._repr_json_ = function (this: QubitState): unknown {
      return {
        qubitCount: this.quantumCount(),
        probabilities: Array.from(this.probabilities()),
        amplitudes: this.amplitudes(),
      };
    };
  }

  // MIME bundle
  if (!QubitStateClass.prototype._repr_mimebundle_) {
    QubitStateClass.prototype._repr_mimebundle_ = function (this: QubitState): MimeBundle {
      const output = NotebookRenderer.renderState(this);
      return output.toMimeBundle();
    };
  }

  // Notebook helper
  if (!QubitStateClass.prototype.toNotebook) {
    QubitStateClass.prototype.toNotebook = function (this: QubitState): unknown {
      return NotebookRenderer.renderState(this);
    };
  }
  /* eslint-enable @typescript-eslint/no-unsafe-member-access */
}

/**
 * Enable notebook mode with automatic extension loading
 * Sets up both the notebook renderer and class extensions
 */
function enableNotebookMode(): void {
  NotebookRenderer.enableNotebookMode();

  // Lazy load to avoid circular dependencies and extend prototypes
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const { Circuit } = require('../core/Circuit');
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const { QubitState } = require('../core/QubitState');

    extendCircuitForNotebook(Circuit);
    extendQubitStateForNotebook(QubitState);
  } catch (error) {
    /* istanbul ignore next */

    console.warn('Failed to load notebook extensions:', error);
  }
}

export { extendCircuitForNotebook, extendQubitStateForNotebook, enableNotebookMode };
