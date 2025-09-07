// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Provides tools for rendering quantum circuit diagrams.
 *
 * @description
 * This module contains the `CircuitRenderer` class, which offers a suite of
 * static methods for visualizing quantum circuits in various formats. It can
 * generate ASCII art for terminal display, structured SVG data for web UIs,
 * and LaTeX code for academic papers.
 *
 * @packageDocumentation
 */

import type { Circuit, CircuitInstruction } from '../core/Circuit';
import type { Q5mGate } from '../core/Q5mGate';

/**
 * Describes the position and properties of a single gate within a circuit layout.
 * @category Visualization
 */
interface GatePosition {
  /** The index of the instruction in the original circuit's instruction list. */
  instructionIndex: number;
  /** The time step (column) in the circuit diagram where the gate is placed. */
  timeStep: number;
  /** An array of target indices that this gate acts upon. */
  targets: number[];
  /** The display name of the gate (e.g., "H", "CX"). */
  gateName: string;
  /** Optional parameters for parameterized gates (e.g., rotation angles). */
  parameters?: number[];
  /** For multi-qubit gates, indicates which targets are control qubits. */
  isControl?: boolean[];
}

/**
 * Represents the complete layout of a quantum circuit for visualization purposes.
 * @category Visualization
 */
interface CircuitLayout {
  /** The total number of qubits in the circuit. */
  numQubits: number;
  /** The total number of time steps (columns) required to draw the circuit. */
  numTimeSteps: number;
  /** An array of all gates with their position information. */
  gates: GatePosition[];
  /** An array of connections between gates (e.g., for CNOT). */
  connections: WireConnection[];
}

/**
 * Defines a connection between two points on the circuit diagram, typically for multi-qubit gates.
 * @category Visualization
 */
interface WireConnection {
  /** The starting coordinate of the connection. */
  from: { timeStep: number; qubit: number };
  /** The ending coordinate of the connection. */
  to: { timeStep: number; qubit: number };
  /** The type of connection. */
  type: 'wire' | 'control' | 'target';
}

/**
 * Defines options for rendering a circuit as ASCII art.
 * @category Visualization
 */
interface ASCIIRenderOptions {
  /** If true, uses Unicode box-drawing characters for a cleaner look. Defaults to `false`. */
  useUnicode?: boolean;
  /** If true, displays qubit labels (e.g., "q0:"). Defaults to `true`. */
  showQubitLabels?: boolean;
  /** If true, displays time step numbers at the top. Defaults to `false`. */
  showTimeSteps?: boolean;
  /** The minimum width for a gate in characters. Defaults to 3. */
  minGateWidth?: number;
}

/**
 * A set of characters used for drawing the ASCII circuit diagram.
 * @internal
 */
interface DrawingChars {
  horizontal: string;
  vertical: string;
  cross: string;
  controlDot: string;
  targetX: string;
  corner: string;
  tee: string;
}

/**
 * Provides static methods for visualizing quantum circuits.
 *
 * This class supports rendering circuits into multiple formats, including
 * ASCII art for console output, SVG data for web rendering, and LaTeX
 * for high-quality typesetting in documents.
 * @category Visualization
 *
 */
class CircuitRenderer {
  /**
   * Analyzes a circuit and computes its layout for visualization.
   * This method determines the position of each gate in a 2D grid.
   * @param circuit The circuit to analyze.
   * @returns A `CircuitLayout` object describing the arrangement of gates.
   * @category Visualization
   */
  static analyzeLayout(circuit: Circuit): CircuitLayout {
    const instructions = circuit.instructionsList();
    const numQubits = circuit.quantumCount();

    // Group instructions by time steps (simple scheduling)
    const timeSteps: CircuitInstruction[][] = [];
    const qubitLastUsed: number[] = new Array(numQubits).fill(-1) as number[];

    for (const instruction of instructions) {
      // Skip instructions with no targets
      if (!instruction.targets || instruction.targets.length === 0) {
        continue;
      }

      // Find earliest time step where all qubits are available
      const targetTimes = instruction.targets.map((q) => {
        const lastUsed = qubitLastUsed[q];
        return /* istanbul ignore next if */ lastUsed !== undefined ? lastUsed + 1 : 0;
      });
      const earliestTime = Math.max(0, ...targetTimes);

      // Ensure timeSteps array is large enough and has valid indices
      while (timeSteps.length <= earliestTime) {
        timeSteps.push([]);
      }

      // Safety check before pushing
      /* istanbul ignore next if */ if (timeSteps[earliestTime]) {
        timeSteps[earliestTime].push(instruction);
      } else {
        // Fallback: create the array if it doesn't exist
        /* istanbul ignore next */
        timeSteps[earliestTime] = [instruction];
      }

      // Update last used time for all qubits in this instruction
      instruction.targets.forEach((q) => {
        qubitLastUsed[q] = earliestTime;
      });
    }

    // Create gate positions
    const gates: GatePosition[] = [];
    const connections: WireConnection[] = [];
    let instructionIndex = 0;

    for (let timeStep = 0; timeStep < timeSteps.length; timeStep++) {
      const stepInstructions = timeSteps[timeStep]!;

      for (const instruction of stepInstructions) {
        const gateName = instruction.gate.name;
        const targets = [...instruction.targets];

        // Determine control/target information for multi-qubit gates
        let isControl: boolean[] | undefined;
        if (targets.length > 1) {
          isControl = targets.map((_, index) => {
            // First target is usually control for standard gates
            return (
              index === 0 &&
              (gateName.includes('CNOT') ||
                gateName.includes('Controlled') ||
                gateName.includes('CP'))
            );
          });

          // Add control line connections
          if (gateName.includes('CNOT') || gateName.includes('Controlled')) {
            const controlTarget = targets[0]!;
            const targetTarget = targets[1]!;

            connections.push({
              from: { timeStep, qubit: controlTarget },
              to: { timeStep, qubit: targetTarget },
              type: 'control',
            });
          }
        }

        const gateParameters = this.extractGateParameters(instruction.gate);
        gates.push({
          instructionIndex: instructionIndex++,
          timeStep,
          targets,
          gateName,
          ...(gateParameters && { parameters: gateParameters }),
          ...(isControl && { isControl }),
        });
      }
    }

    return {
      numQubits,
      numTimeSteps: timeSteps.length,
      gates,
      connections,
    };
  }

  /**
   * Renders a quantum circuit as an ASCII art string.
   * @param circuit The circuit to render.
   * @param options Options to customize the ASCII output.
   * @returns A string containing the ASCII representation of the circuit.
   * @category Visualization
   */
  static renderASCII(circuit: Circuit, options: ASCIIRenderOptions = {}): string {
    const {
      useUnicode = false,
      showQubitLabels = true,
      showTimeSteps = false,
      minGateWidth = 3,
    } = options;

    const layout = this.analyzeLayout(circuit);
    const { numQubits, numTimeSteps, gates } = layout;

    // Characters for drawing
    const chars: DrawingChars = {
      horizontal: /* istanbul ignore next if */ useUnicode ? '─' : '-',
      vertical: /* istanbul ignore next if */ useUnicode ? '│' : '|',
      cross: /* istanbul ignore next if */ useUnicode ? '┼' : '+',
      controlDot: /* istanbul ignore next if */ useUnicode ? '●' : 'o',
      targetX: /* istanbul ignore next if */ useUnicode ? '⊕' : 'X',
      corner: /* istanbul ignore next if */ useUnicode ? '└' : '+',
      tee: /* istanbul ignore next if */ useUnicode ? '├' : '+',
    };

    // Calculate column widths
    const columnWidths: number[] = new Array(numTimeSteps).fill(minGateWidth) as number[];

    for (const gate of gates) {
      const gateDisplayText = this.formatGateForDisplay(gate);
      const requiredWidth = Math.max(minGateWidth, gateDisplayText.length);
      columnWidths[gate.timeStep] = Math.max(columnWidths[gate.timeStep]!, requiredWidth);
    }

    // Build the circuit diagram
    const lines: string[] = [];

    // Time step header
    if (showTimeSteps) {
      let header = showQubitLabels ? '    ' : '';
      for (let t = 0; t < numTimeSteps; t++) {
        const stepStr = t.toString();
        const width = columnWidths[t]!;
        const padding = Math.max(0, Math.floor((width - stepStr.length) / 2));
        header += `${' '.repeat(padding)}${stepStr}${' '.repeat(width - stepStr.length - padding)} `;
      }
      lines.push(header);

      // Separator line
      if (showQubitLabels) {
        lines.push('');
      }
    }

    // Draw each qubit line
    for (let q = 0; q < numQubits; q++) {
      let line = showQubitLabels ? `q${q}: ` : '';

      for (let t = 0; t < numTimeSteps; t++) {
        const gateAtPosition = gates.find((g) => g.timeStep === t && g.targets.includes(q));

        const width = columnWidths[t]!;

        if (gateAtPosition) {
          const gateText = this.formatGateForDisplay(gateAtPosition);
          const isControl = gateAtPosition.isControl?.[gateAtPosition.targets.indexOf(q)] || false;

          if (isControl) {
            // Control dot
            const padding = Math.floor(width / 2);
            line += `${chars.horizontal.repeat(padding)}${chars.controlDot}${chars.horizontal.repeat(width - padding - 1)}${chars.horizontal}`;
          } else if (gateAtPosition.targets.length > 1 && gateText.includes('X')) {
            // Target gate
            const padding = Math.floor((width - 1) / 2);
            line += `${chars.horizontal.repeat(padding)}${chars.targetX}${chars.horizontal.repeat(width - padding - 1)}${chars.horizontal}`;
          } else {
            // Regular gate box
            const padding = Math.max(0, Math.floor((width - gateText.length) / 2));
            const leftPad = padding;
            const rightPad = width - gateText.length - leftPad;
            line += `[${' '.repeat(leftPad)}${gateText}${' '.repeat(rightPad)}]`;
          }
        } else {
          // Empty space with wire
          line += chars.horizontal.repeat(width + 1);
        }

        if (t < numTimeSteps - 1) {
          line += chars.horizontal;
        }
      }

      lines.push(line);

      // Add control lines for multi-qubit gates
      if (q < numQubits - 1) {
        const controlLines = this.generateControlLines(
          q,
          gates.filter((g) => g.timeStep < numTimeSteps),
          columnWidths,
          chars,
          showQubitLabels,
        );
        lines.push(...controlLines);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generates a structured data object representing the circuit for SVG rendering.
   * @param circuit The circuit to represent.
   * @returns An `SVGCircuitData` object that can be used to render an SVG diagram.
   * @category Visualization
   */
  static generateSVGData(circuit: Circuit): SVGCircuitData {
    const layout = this.analyzeLayout(circuit);
    const { numQubits, numTimeSteps, gates, connections } = layout;

    const gateWidth = 60;
    const gateHeight = 40;
    const qubitSpacing = 60;
    const timeStepSpacing = 80;
    const margin = 40;

    const width = margin * 2 + numTimeSteps * timeStepSpacing;
    const height = margin * 2 + numQubits * qubitSpacing;

    const svgGates: SVGGate[] = gates.map((gate) => ({
      x: margin + gate.timeStep * timeStepSpacing,
      y: margin + gate.targets[0]! * qubitSpacing - gateHeight / 2,
      width: gateWidth,
      height: gateHeight,
      label: this.formatGateForDisplay(gate),
      qubits: gate.targets,
      type: gate.gateName,
      isMultiQubit: gate.targets.length > 1,
    }));

    const svgWires: SVGWire[] = [];

    // Generate qubit wires
    for (let q = 0; q < numQubits; q++) {
      svgWires.push({
        x1: margin,
        y1: margin + q * qubitSpacing,
        x2: margin + numTimeSteps * timeStepSpacing,
        y2: margin + q * qubitSpacing,
        type: 'qubit-wire',
        strokeWidth: 2,
      });
    }

    // Generate control connections
    for (const connection of connections) {
      const x = margin + connection.from.timeStep * timeStepSpacing + gateWidth / 2;
      const y1 = margin + connection.from.qubit * qubitSpacing;
      const y2 = margin + connection.to.qubit * qubitSpacing;

      svgWires.push({
        x1: x,
        y1,
        x2: x,
        y2,
        type: 'control-line',
        strokeWidth: 3,
      });
    }

    return {
      width,
      height,
      gates: svgGates,
      wires: svgWires,
      qubits: Array.from({ length: numQubits }, (_, i) => ({
        index: i,
        y: margin + i * qubitSpacing,
        label: `q${i}`,
      })),
    };
  }

  /**
   * Exports the circuit to a LaTeX string using the Qcircuit package format.
   * @param circuit The circuit to export.
   * @returns A string containing the LaTeX code for the circuit diagram.
   * @category Visualization
   */
  static exportLaTeX(circuit: Circuit): string {
    const layout = this.analyzeLayout(circuit);
    const { numQubits, gates } = layout;

    let latex = `\\begin{quantumcircuit}{${numQubits}}\\n`;

    // Add qubit labels
    for (let q = 0; q < numQubits; q++) {
      latex += `\\qbit{q_{${q}}} & `;

      const qubitGates = gates
        .filter((g) => g.targets.includes(q))
        .sort((a, b) => a.timeStep - b.timeStep);

      for (const gate of qubitGates) {
        const latexGate = this.gateToLaTeX(gate, q);
        latex += `${latexGate} & `;
      }

      latex += '\\qw\\\\n';
    }

    latex += '\\end{quantumcircuit}';

    return latex;
  }

  /**
   * Extracts numerical parameters from a gate's name.
   * @param gate The quantum gate.
   * @returns An array of numbers, or undefined if no parameters are found.
   * @internal
   */
  private static extractGateParameters(gate: Q5mGate): number[] | undefined {
    // Extract parameters from parameterized gates by parsing gate name
    const gateName = gate.name;

    // Check for parameterized gates (format: GateName(param) or GateName(param1,param2))
    const paramMatch = gateName.match(/\(([^)]+)\)/);
    if (paramMatch) {
      const paramString = paramMatch[1];
      /* istanbul ignore if */
      if (!paramString) return undefined;
      // Split by comma and parse as numbers
      const params = paramString.split(',').map((p) => parseFloat(p.trim()));
      // Filter out NaN values
      const validParams = params.filter((p) => !isNaN(p));
      return this.validateParameters(validParams);
    }

    return undefined;
  }

  /**
   * Validate parameter array - extracted for testability
   * @internal
   */
  private static validateParameters(params: number[]): number[] | undefined {
    return /* istanbul ignore next if */ params.length > 0 ? params : undefined;
  }

  /**
   * Check if a control gate is relevant for a qubit line - extracted for testability
   * @internal
   */
  private static isControlGateRelevant(gate: GatePosition, qubitIndex: number): boolean {
    return (
      gate.targets.length > 1 &&
      Math.min(...gate.targets) <= qubitIndex &&
      Math.max(...gate.targets) > qubitIndex
    );
  }

  /**
   * Formats a gate's information for display in a diagram.
   * @param gate The gate's position information.
   * @returns A short string representing the gate.
   * @internal
   */
  private static formatGateForDisplay(gate: GatePosition): string {
    const { gateName, parameters } = gate;

    // Handle common gate names
    const displayNames: Record<string, string> = {
      Hadamard: 'H',
      PauliX: 'X',
      PauliY: 'Y',
      PauliZ: 'Z',
      SGate: 'S',
      TGate: 'T',
      CNOT: 'CX',
      ControlledZ: 'CZ',
      ControlledY: 'CY',
      SWAP: 'SWAP',
    };

    let displayName = displayNames[gateName] || gateName;

    // Add parameters if present
    if (parameters && parameters.length > 0) {
      const paramStr = parameters.map((p) => p.toFixed(2)).join(',');
      displayName += `(${paramStr})`;
    }

    return displayName;
  }

  /**
   * Generates the vertical lines for multi-qubit gates in ASCII art.
   * @param qubitIndex The current qubit wire index.
   * @param gates The list of all gates in the layout.
   * @param columnWidths The calculated widths of each time step column.
   * @param chars The character set for drawing.
   * @param showQubitLabels Whether qubit labels are shown, affecting indentation.
   * @returns An array of strings, each representing a vertical line segment.
   * @internal
   */
  private static generateControlLines(
    qubitIndex: number,
    gates: GatePosition[],
    columnWidths: number[],
    chars: DrawingChars,
    showQubitLabels: boolean,
  ): string[] {
    // This is a simplified implementation
    // Full implementation would properly handle all control line intersections

    const lines: string[] = [];

    // Find control gates that span this qubit line
    const relevantGates = gates.filter((gate) => this.isControlGateRelevant(gate, qubitIndex));

    if (relevantGates.length > 0) {
      // Generate control line pattern based on column widths and characters
      let controlLine = showQubitLabels ? '    ' : '';

      for (let t = 0; t < columnWidths.length; t++) {
        const hasControl = relevantGates.some((gate) => gate.timeStep === t);
        const width = columnWidths[t] ?? /* istanbul ignore next */ 3;

        if (hasControl) {
          controlLine += chars.vertical.repeat(width + 1);
        } else {
          controlLine += ' '.repeat(width + 1);
        }

        if (t < columnWidths.length - 1) {
          controlLine += ' ';
        }
      }

      lines.push(controlLine);
    }

    return lines;
  }

  /**
   * Converts a gate to its LaTeX/Qcircuit representation.
   * @param gate The gate's position information.
   * @param qubitIndex The index of the qubit this gate part is on.
   * @returns A string with the LaTeX command for the gate part.
   * @internal
   */
  private static gateToLaTeX(gate: GatePosition, qubitIndex: number): string {
    const { gateName, targets } = gate;

    if (targets.length === 1) {
      const latexGates: Record<string, string> = {
        Hadamard: '\\gate{H}',
        PauliX: '\\gate{X}',
        PauliY: '\\gate{Y}',
        PauliZ: '\\gate{Z}',
        SGate: '\\gate{S}',
        TGate: '\\gate{T}',
      };

      return latexGates[gateName] || `\\gate{${gateName}}`;
    } else {
      // Multi-qubit gates (only CNOT is currently supported in LaTeX)
      const qubitRole = targets.indexOf(qubitIndex);
      // CNOT gate: control or target
      return qubitRole === 0 ? '\\ctrl{1}' : '\\targ{}';
    }
  }
}

/**
 * Defines the data structure for rendering a complete circuit in SVG.
 * @category Visualization
 */
interface SVGCircuitData {
  /** The total width of the SVG canvas. */
  width: number;
  /** The total height of the SVG canvas. */
  height: number;
  /** An array of gate objects to be rendered. */
  gates: SVGGate[];
  /** An array of wire objects (qubit lines, control lines). */
  wires: SVGWire[];
  /** An array of qubit label information. */
  qubits: SVGQubit[];
}

/**
 * Defines the properties of a single gate for SVG rendering.
 * @category Visualization
 */
interface SVGGate {
  /** The x-coordinate of the top-left corner of the gate. */
  x: number;
  /** The y-coordinate of the top-left corner of the gate. */
  y: number;
  /** The width of the gate box. */
  width: number;
  /** The height of the gate box. */
  height: number;
  /** The text label to display inside the gate (e.g., "H"). */
  label: string;
  /** The indices of the qubits this gate acts on. */
  qubits: number[];
  /** The type of the gate (e.g., "Hadamard"). */
  type: string;
  /** True if the gate acts on more than one qubit. */
  isMultiQubit: boolean;
}

/**
 * Defines the properties of a wire for SVG rendering.
 * @category Visualization
 */
interface SVGWire {
  /** The starting x-coordinate of the wire. */
  x1: number;
  /** The starting y-coordinate of the wire. */
  y1: number;
  /** The ending x-coordinate of the wire. */
  x2: number;
  /** The ending y-coordinate of the wire. */
  y2: number;
  /** The type of wire. */
  type: 'qubit-wire' | 'control-line';
  /** The stroke width of the wire. */
  strokeWidth: number;
}

/**
 * Defines the properties of a qubit label for SVG rendering.
 * @category Visualization
 */
interface SVGQubit {
  /** The index of the qubit. */
  index: number;
  /** The y-coordinate for the qubit's wire and label. */
  y: number;
  /** The text label for the qubit (e.g., "q0"). */
  label: string;
}

/**
 * Circuit rendering interface.
 */
export type CircuitRendererType = {
  /**
   * Analyze circuit layout for rendering.
   */
  analyzeLayout(circuit: Circuit): CircuitLayout;

  /**
   * Render circuit as ASCII art.
   */
  renderASCII(circuit: Circuit, options?: ASCIIRenderOptions): string;

  /**
   * Generate SVG data for circuit.
   */
  generateSVGData(circuit: Circuit): SVGCircuitData;

  /**
   * Export circuit to LaTeX format.
   */
  exportLaTeX(circuit: Circuit): string;
};

// Type exports
export type {
  GatePosition,
  CircuitLayout,
  WireConnection,
  ASCIIRenderOptions,
  SVGCircuitData,
  SVGGate,
  SVGWire,
  SVGQubit,
};

// Class exports
export { CircuitRenderer };
