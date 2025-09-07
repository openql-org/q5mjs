// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * Type definitions for Jupyter Notebook integration
 * @packageDocumentation
 */

/**
 * MIME bundle format for Jupyter display system
 * @category Notebook
 */
export interface MimeBundle {
  'text/plain': string;
  'text/html'?: string;
  'text/latex'?: string;
  'image/svg+xml'?: string;
  'application/javascript'?: string;
  'application/json'?: unknown;
}

/**
 * Jupyter display object interface
 * @category Notebook
 */
export interface JupyterDisplayObject {
  _repr_html_?(): string;
  _repr_svg_?(): string;
  _repr_latex_?(): string;
  _repr_json_?(): unknown;
  _repr_mimebundle_?(): MimeBundle;
}

/**
 * Options for notebook rendering
 * @category Notebook
 */
export interface NotebookRenderOptions {
  /** Show interactive controls */
  interactive?: boolean;
  /** Include measurement results */
  showMeasurements?: boolean;
  /** Display state vector */
  showStateVector?: boolean;
  /** Theme for visualization */
  theme?: 'light' | 'dark' | 'auto';
  /** Maximum number of qubits to display in detail */
  maxQubitDisplay?: number;
}

/**
 * Jupyter environment detection
 * @category Notebook
 */
export interface JupyterWindow {
  Jupyter?: {
    notebook?: {
      kernel?: unknown;
    };
  };
  IPython?: {
    notebook?: {
      kernel?: unknown;
    };
  };
}

/**
 * Type for global with window property
 */
export interface GlobalWithWindow {
  window?: JupyterWindow;
}

/**
 * Type for SVG data structure from CircuitRenderer
 */
export interface SVGData {
  width: number;
  height: number;
  gates: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }>;
  wires: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }>;
  qubits: Array<{
    y: number;
    label: string;
  }>;
}

/**
 * Type for gate parameters - can be numbers, strings, or undefined
 * @category Notebook
 */
export type GateParams = number[] | string[] | undefined;

/**
 * Notebook output wrapper
 * @category Notebook
 */
export class NotebookOutput {
  constructor(private mimeBundle: MimeBundle) {}

  /**
   * Get MIME bundle for display
   */
  toMimeBundle(): MimeBundle {
    return this.mimeBundle;
  }

  /**
   * Get HTML representation
   */
  toHTML(): string {
    return this.mimeBundle['text/html'] || this.mimeBundle['text/plain'];
  }

  /**
   * Get SVG representation
   */
  toSVG(): string | undefined {
    return this.mimeBundle['image/svg+xml'];
  }

  /**
   * Get LaTeX representation
   */
  toLaTeX(): string | undefined {
    return this.mimeBundle['text/latex'];
  }

  /**
   * Get plain text representation
   */
  toText(): string {
    return this.mimeBundle['text/plain'];
  }
}
