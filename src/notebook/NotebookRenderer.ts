// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * Notebook rendering functionality for Jupyter integration
 * @packageDocumentation
 */

import type { Circuit } from '../core/Circuit';
import type { QubitState } from '../core/QubitState';
import { CircuitRenderer } from '../visualization/CircuitRenderer';
import { StateRenderer } from '../visualization/StateRenderer';
import type { MimeBundle, NotebookRenderOptions, GlobalWithWindow, SVGData } from './types';
import { NotebookOutput } from './types';

/**
 * Provides rendering capabilities for Jupyter Notebook environments
 * @category Notebook
 */
class NotebookRenderer {
  private static isNotebookEnvironment: boolean | null = null;

  /**
   * Detect if running in a Jupyter notebook environment
   */
  static isJupyterEnvironment(): boolean {
    if (this.isNotebookEnvironment !== null) {
      return this.isNotebookEnvironment;
    }

    const global = globalThis as unknown as GlobalWithWindow;
    if (typeof global === 'undefined' || typeof global.window === 'undefined') {
      this.isNotebookEnvironment = false;
      return false;
    }

    const jupyterWindow = global.window;
    this.isNotebookEnvironment = !!(
      jupyterWindow.Jupyter?.notebook?.kernel || jupyterWindow.IPython?.notebook?.kernel
    );

    return this.isNotebookEnvironment;
  }

  /**
   * Enable notebook mode for automatic rich display
   */
  static enableNotebookMode(): void {
    if (!this.isJupyterEnvironment()) {
      console.warn('Not in a Jupyter environment. Notebook mode may not work as expected.');
    }
  }

  /**
   * Render a quantum circuit for notebook display
   * @param circuit - The quantum circuit to render
   * @param options - Rendering options
   * @returns Notebook output with multiple representations
   */
  static renderCircuit(circuit: Circuit, options: NotebookRenderOptions = {}): NotebookOutput {
    const { interactive = true, theme = 'auto' } = options;

    // Generate different representations
    const ascii = CircuitRenderer.renderASCII(circuit, { useUnicode: true });
    const svgData = CircuitRenderer.generateSVGData(circuit);
    const latex = CircuitRenderer.exportLaTeX(circuit);

    // Create SVG string
    const svgString = this.createSVGString(svgData, theme);

    // Create interactive HTML if requested
    const html = interactive
      ? this.createInteractiveCircuitHTML(circuit, svgString, options)
      : this.createStaticHTML(svgString);

    const mimeBundle: MimeBundle = {
      'text/plain': ascii,
      'text/html': html,
      'image/svg+xml': svgString,
      'text/latex': `$$${latex}$$`,
    };

    return new NotebookOutput(mimeBundle);
  }

  /**
   * Render a quantum state for notebook display
   * @param state - The quantum state to render
   * @param options - Rendering options
   * @returns Notebook output with multiple representations
   */
  static renderState(state: QubitState, options: NotebookRenderOptions = {}): NotebookOutput {
    const { showStateVector = true, showMeasurements = true, maxQubitDisplay = 5 } = options;

    // Generate different representations
    const ascii = StateRenderer.renderStateVector(state);
    const probabilities = state.probabilities();

    // Create visualization HTML
    const html = this.createStateHTML(state, {
      ...options,
      showStateVector,
      showMeasurements,
      maxQubitDisplay,
    });

    // Create LaTeX representation for small states
    const latex = state.quantumCount() <= 3 ? this.createStateLatex(state) : undefined;

    const mimeBundle: MimeBundle = {
      'text/plain': ascii,
      'text/html': html,
      ...(latex && { 'text/latex': latex }),
      'application/json': {
        qubitCount: state.quantumCount(),
        probabilities: Array.from(probabilities),
        amplitudes: state.amplitudes(),
      },
    };

    return new NotebookOutput(mimeBundle);
  }

  /**
   * Create SVG string from circuit data
   * @param svgData - Circuit SVG data structure
   * @param theme - Theme for styling ('light', 'dark', 'auto')
   * @returns SVG string representation
   */
  private static createSVGString(svgData: SVGData, theme: string): string {
    const { width, height, gates, wires, qubits } = svgData;

    const strokeColor = theme === 'dark' ? '#ffffff' : '#000000';
    const fillColor = theme === 'dark' ? '#333333' : '#ffffff';
    const textColor = theme === 'dark' ? '#ffffff' : '#000000';

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<style>
      .gate-box { fill: ${fillColor}; stroke: ${strokeColor}; stroke-width: 2; }
      .gate-text { fill: ${textColor}; font-family: monospace; font-size: 14px; text-anchor: middle; }
      .qubit-wire { stroke: ${strokeColor}; stroke-width: 2; }
      .control-dot { fill: ${strokeColor}; }
      .qubit-label { fill: ${textColor}; font-family: monospace; font-size: 12px; }
    </style>`;

    // Draw wires
    for (const wire of wires) {
      svg += `<line x1="${wire.x1}" y1="${wire.y1}" x2="${wire.x2}" y2="${wire.y2}" class="qubit-wire"/>`;
    }

    // Draw gates
    for (const gate of gates) {
      svg += `<rect x="${gate.x}" y="${gate.y}" width="${gate.width}" height="${gate.height}" class="gate-box"/>`;
      svg += `<text x="${gate.x + gate.width / 2}" y="${gate.y + gate.height / 2 + 5}" class="gate-text">${gate.label}</text>`;
    }

    // Draw qubit labels
    for (const qubit of qubits) {
      svg += `<text x="10" y="${qubit.y + 5}" class="qubit-label">${qubit.label}</text>`;
    }

    svg += '</svg>';
    return svg;
  }

  /**
   * Create interactive HTML for circuit display
   * @param circuit - The quantum circuit
   * @param svgString - SVG representation of the circuit
   * @param options - Rendering options
   * @returns HTML string with interactive elements
   */
  private static createInteractiveCircuitHTML(
    circuit: Circuit,
    svgString: string,
    options: NotebookRenderOptions,
  ): string {
    const circuitId = `circuit-${Math.random().toString(36).substr(2, 9)}`;

    return `
      <div id="${circuitId}" style="padding: 10px; background: ${options.theme === 'dark' ? '#1e1e1e' : '#ffffff'};">
        <div style="margin-bottom: 10px;">
          <strong>Quantum Circuit</strong> (${circuit.quantumCount()} qubits, ${circuit.instructionsList().length} gates)
        </div>
        <div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px;">
          ${svgString}
        </div>
        <div style="margin-top: 10px;">
          <button onclick="(() => {
            console.log('Circuit executed! Check console for details.');
            alert('Circuit executed! Check console for details.');
          })()">Run Circuit</button>
          <button onclick="navigator.clipboard.writeText('# OpenQASM export')">Copy OpenQASM</button>
        </div>
      </div>
    `;
  }

  /**
   * Create static HTML display
   * @param svgString - SVG representation
   * @returns Static HTML string
   */
  private static createStaticHTML(svgString: string): string {
    return `
      <div style="padding: 10px;">
        ${svgString}
      </div>
    `;
  }

  /**
   * Create HTML visualization for quantum state
   * @param state - The quantum state
   * @param options - Rendering options
   * @returns HTML string with state visualization
   */
  private static createStateHTML(state: QubitState, options: NotebookRenderOptions): string {
    const stateId = `state-${Math.random().toString(36).substr(2, 9)}`;
    const probabilities = state.probabilities();
    const numStates = Math.min(2 ** options.maxQubitDisplay!, probabilities.length);

    let html = `
      <div id="${stateId}" style="padding: 10px;">
        <div style="margin-bottom: 10px;">
          <strong>Quantum State</strong> (${state.quantumCount()} qubits)
        </div>
    `;

    // Probability distribution chart
    if (options.showMeasurements) {
      html += '<div style="margin: 10px 0;"><strong>Measurement Probabilities:</strong></div>';
      html += '<div style="display: flex; align-items: flex-end; height: 100px; gap: 2px;">';

      for (let i = 0; i < numStates; i++) {
        const prob = probabilities[i] || 0;
        const height = prob * 100;
        const basis = i.toString(2).padStart(state.quantumCount(), '0');

        html += `
          <div style="flex: 1; background: #4CAF50; height: ${height}px; position: relative;" 
               title="|${basis}⟩: ${(prob * 100).toFixed(2)}%">
            <div style="position: absolute; bottom: -20px; font-size: 10px; width: 100%; text-align: center;">
              ${basis}
            </div>
          </div>
        `;
      }

      html += '</div>';

      if (probabilities.length > numStates) {
        html += `<div style="margin-top: 30px; font-size: 12px; color: #666;">
          Showing first ${numStates} of ${probabilities.length} basis states
        </div>`;
      }
    }

    // State vector display
    if (options.showStateVector && state.quantumCount() <= 3) {
      html += '<div style="margin-top: 20px;"><strong>State Vector:</strong></div>';
      html += '<div style="font-family: monospace; font-size: 12px; margin: 5px 0;">';

      const amplitudes = state.amplitudes();
      for (let i = 0; i < Math.min(8, amplitudes.length); i++) {
        const amp = amplitudes[i];
        if (amp && (Math.abs(amp.re) > 1e-10 || Math.abs(amp.im) > 1e-10)) {
          const basis = i.toString(2).padStart(state.quantumCount(), '0');
          const realPart = amp.re.toFixed(3);
          const imagPart = amp.im >= 0 ? `+${amp.im.toFixed(3)}i` : `${amp.im.toFixed(3)}i`;
          html += `<div>|${basis}⟩: ${realPart}${imagPart}</div>`;
        }
      }

      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  /**
   * Create LaTeX representation for quantum state
   * @param state - The quantum state
   * @returns LaTeX string representation
   */
  private static createStateLatex(state: QubitState): string {
    const amplitudes = state.amplitudes();
    let latex = '$$|\\psi\\rangle = ';
    const terms: string[] = [];

    for (let i = 0; i < amplitudes.length; i++) {
      const amp = amplitudes[i];
      if (amp && (Math.abs(amp.re) > 1e-10 || Math.abs(amp.im) > 1e-10)) {
        const basis = i.toString(2).padStart(state.quantumCount(), '0');
        let term = '';

        if (Math.abs(amp.im) < 1e-10) {
          term = `${amp.re.toFixed(3)}|${basis}\\rangle`;
        } else if (Math.abs(amp.re) < 1e-10) {
          term = `${amp.im.toFixed(3)}i|${basis}\\rangle`;
        } else {
          const imagPart = amp.im >= 0 ? `+${amp.im.toFixed(3)}i` : `${amp.im.toFixed(3)}i`;
          term = `(${amp.re.toFixed(3)}${imagPart})|${basis}\\rangle`;
        }

        terms.push(term);
      }
    }

    latex += terms.join(' + ');
    latex += '$$';
    return latex;
  }
}

export { NotebookRenderer };
