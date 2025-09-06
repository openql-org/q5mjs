// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Provides tools for visualizing and analyzing quantum states.
 *
 * @description
 * This module contains the `StateRenderer` class, which offers static methods
 * for rendering quantum states in various formats. It can generate detailed
 * amplitude displays, probability histograms, Bloch sphere coordinates for single
 * qubits, and other analytical data.
 *
 * @packageDocumentation
 */

import type { QubitState } from '../core/QubitState';
import type { Complex } from '../math/complex';
import { formatAmplitude } from '../math/math-utils';

/**
 * Represents detailed information about a single amplitude in a quantum state vector.
 * @category Visualization
 */
interface AmplitudeDisplay {
  /** The computational basis state as a binary string (e.g., "010"). */
  state: string;
  /** The quantum amplitude associated with the basis state. */
  amplitude: Complex;
  /** The probability of measuring this basis state (|amplitude|²). */
  probability: number;
  /** A formatted string representation of the quantum amplitude. */
  amplitudeString: string;
  /** The phase of the amplitude in radians. */
  phase: number;
}

/**
 * Defines options for rendering a quantum state vector.
 * @category Visualization
 */
interface StateRenderOptions {
  /** The maximum number of amplitudes to display. Defaults to 32. */
  maxAmplitudes?: number;
  /** The number of decimal places for formatting numbers. Defaults to 3. */
  precision?: number;
  /** If true, only displays amplitudes with non-zero probabilities. Defaults to `true`. */
  onlyNonZero?: boolean;
  /** If true, sorts the displayed amplitudes by probability in descending order. Defaults to `false`. */
  sortByProbability?: boolean;
  /** If true, includes phase information in the output. Defaults to `true`. */
  showPhase?: boolean;
}

/**
 * Represents the coordinates and angles of a single qubit on the Bloch sphere.
 * @category Visualization
 */
interface BlochSphereData {
  /** The x-coordinate on the Bloch sphere. */
  x: number;
  /** The y-coordinate on the Bloch sphere. */
  y: number;
  /** The z-coordinate on the Bloch sphere. */
  z: number;
  /** The polar angle (theta) in radians. */
  theta: number;
  /** The azimuthal angle (phi) in radians. */
  phi: number;
  /** A textual description of the state's position (e.g., "North Pole"). */
  description: string;
}

/**
 * Represents the data required to render a probability histogram.
 * @category Visualization
 */
interface ProbabilityHistogram {
  /** An array of basis state labels for the x-axis. */
  labels: string[];
  /** An array of probability values for the y-axis. */
  probabilities: number[];
  /** Optional array of color codes for the histogram bars. */
  colors?: string[];
  /** The maximum probability value, useful for scaling. */
  maxProbability: number;
}

/**
 * Represents data for visualizing the phase of each component of a quantum state.
 * @category Visualization
 */
interface PhaseVisualization {
  /** An array of basis state labels. */
  states: string[];
  /** The magnitude of the amplitude for each basis state. */
  magnitudes: number[];
  /** The phase (in radians) of the amplitude for each basis state. */
  phases: number[];
  /** The coordinates of each amplitude on the complex plane. */
  complexPlane: { real: number; imaginary: number }[];
}

/**
 * Provides static methods for visualizing and analyzing quantum states.
 *
 * This class can render quantum states in various formats, including amplitude displays,
 * probability histograms, and Bloch sphere data for single qubits.
 * @category Visualization
 */
class StateRenderer {
  /**
   * Retrieves detailed information about the amplitudes of a quantum state.
   * @param state The quantum state to analyze.
   * @param options Configuration options for the output.
   * @returns An array of `AmplitudeDisplay` objects.
   * @category Visualization
   */
  static getAmplitudes(state: QubitState, options: StateRenderOptions = {}): AmplitudeDisplay[] {
    const {
      maxAmplitudes = 32,
      precision = 3,
      onlyNonZero = true,
      sortByProbability = false,
      showPhase = true,
    } = options;

    const stateVector = state.amplitudes();
    const numQubits = state.quantumCount();

    let amplitudes: AmplitudeDisplay[] = [];

    for (let i = 0; i < stateVector.length; i++) {
      const amplitude = stateVector[i]!;
      const probability = amplitude.abs() ** 2;

      if (onlyNonZero && probability < 1e-12) {
        continue;
      }

      const stateBinary = i.toString(2).padStart(numQubits, '0');
      const phase = Math.atan2(amplitude.im, amplitude.re);

      amplitudes.push({
        state: stateBinary,
        amplitude,
        probability,
        amplitudeString: formatAmplitude(amplitude, precision),
        phase: showPhase ? phase : 0,
      });
    }

    if (sortByProbability) {
      amplitudes.sort((a, b) => b.probability - a.probability);
    }

    if (amplitudes.length > maxAmplitudes) {
      amplitudes = amplitudes.slice(0, maxAmplitudes);
    }

    return amplitudes;
  }

  /**
   * Renders the state vector as a formatted text string in Dirac notation.
   * @param state The quantum state to render.
   * @param options Configuration options for rendering.
   * @returns A string representing the state vector.
   * @category Visualization
   */
  static renderStateVector(state: QubitState, options: StateRenderOptions = {}): string {
    const amplitudes = this.getAmplitudes(state, options);

    let result = 'Quantum State:\n';

    if (amplitudes.length === 0) {
      return `${result}|0⟩ (zero state)`;
    }

    const terms: string[] = [];

    for (let i = 0; i < amplitudes.length; i++) {
      const { state, amplitudeString, probability } = amplitudes[i]!;
      const probPercent = (probability * 100).toFixed(1);

      // Format state in ket notation
      const ketNotation = `|${state}⟩`;

      let term = '';
      if (i === 0) {
        term = `${amplitudeString}${ketNotation}`;
      } else {
        const sign = amplitudes[i]!.amplitude.re >= 0 ? '+' : '';
        term = ` ${sign} ${amplitudeString}${ketNotation}`;
      }

      if (options.showPhase !== false) {
        term += ` (${probPercent}%)`;
      }

      terms.push(term);
    }

    result += terms.join('\n');

    // Add normalization check
    const totalProb = amplitudes.reduce((sum, amp) => sum + amp.probability, 0);
    result += `\n\nTotal probability: ${totalProb.toFixed(6)}`;

    return result;
  }

  /**
   * Renders the state's probability distribution as a formatted ASCII table.
   * @param state The quantum state to render.
   * @param options Configuration options for rendering.
   * @returns A string containing the ASCII table.
   * @category Visualization
   */
  static renderProbabilityTable(state: QubitState, options: StateRenderOptions = {}): string {
    const amplitudes = this.getAmplitudes(state, { ...options, onlyNonZero: true });

    if (amplitudes.length === 0) {
      return 'No non-zero amplitudes';
    }

    let table = 'State Probabilities:\n';
    table += '┌──────────┬──────────────────┬─────────────┐\n';
    table += '│  State   │    Amplitude     │ Probability │\n';
    table += '├──────────┼──────────────────┼─────────────┤\n';

    for (const amp of amplitudes) {
      const stateStr = `|${amp.state}⟩`.padEnd(8);
      const ampStr = amp.amplitudeString.padEnd(16);
      const probStr = `${(amp.probability * 100).toFixed(2)}%`;

      table += `│ ${stateStr} │ ${ampStr} │ ${probStr.padStart(11)} │\n`;
    }

    table += '└──────────┴──────────────────┴─────────────┘';

    return table;
  }

  /**
   * Generates the Bloch sphere representation for a single qubit.
   * @param qubit The single qubit to represent.
   * @returns A `BlochSphereData` object with the coordinates and angles.
   * @category Visualization
   */
  static getBlochSphereData(qubit: QubitState): BlochSphereData {
    const stateVector = qubit.amplitudes();
    if (stateVector.length !== 2) {
      throw new Error('Invalid qubit state: expected 2 amplitudes');
    }

    const alpha = stateVector[0]!;
    const beta = stateVector[1]!;

    // Convert to Bloch sphere coordinates
    // |ψ⟩ = α|0⟩ + β|1⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩

    const alphaAbs = alpha.abs();
    const betaAbs = beta.abs();

    // Calculate theta and phi
    const theta = 2 * Math.acos(alphaAbs);
    let phi = 0;

    if (betaAbs > 1e-12) {
      const betaPhase = Math.atan2(beta.im, beta.re);
      const alphaPhase = Math.atan2(alpha.im, alpha.re);
      phi = betaPhase - alphaPhase;
    }

    // Convert to Cartesian coordinates
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);

    // Generate description
    let description = '';
    if (Math.abs(z - 1) < 1e-6) {
      description = '|0⟩ (North Pole)';
    } else if (Math.abs(z + 1) < 1e-6) {
      description = '|1⟩ (South Pole)';
    } else if (Math.abs(z) < 1e-6) {
      if (Math.abs(x - 1) < 1e-6) {
        description = '|+⟩ (X+ Axis)';
      } else if (Math.abs(x + 1) < 1e-6) {
        description = '|-⟩ (X- Axis)';
      } else if (Math.abs(y - 1) < 1e-6) {
        description = '|+i⟩ (Y+ Axis)';
      } else if (Math.abs(y + 1) < 1e-6) {
        description = '|-i⟩ (Y- Axis)';
      } else {
        description = 'Equatorial state';
      }
    } else {
      description = `θ=${((theta * 180) / Math.PI).toFixed(1)}°, φ=${((phi * 180) / Math.PI).toFixed(1)}°`;
    }

    return {
      x,
      y,
      z,
      theta,
      phi,
      description,
    };
  }

  /**
   * Generates data for a probability histogram visualization.
   * @param state The quantum state to visualize.
   * @param options Configuration options for the histogram.
   * @returns A `ProbabilityHistogram` object.
   * @category Visualization
   */
  static getProbabilityHistogram(
    state: QubitState,
    options: StateRenderOptions = {},
  ): ProbabilityHistogram {
    const amplitudes = this.getAmplitudes(state, options);

    const labels = amplitudes.map((amp) => `|${amp.state}⟩`);
    const probabilities = amplitudes.map((amp) => amp.probability);
    const maxProbability = Math.max(...probabilities, 0);

    // Generate colors based on probability (optional)
    const colors = probabilities.map((prob) => {
      const intensity = Math.sqrt(prob / maxProbability);
      const blue = Math.floor(255 * (0.3 + 0.7 * intensity));
      return `rgb(70, 130, ${blue})`;
    });

    return {
      labels,
      probabilities,
      colors,
      maxProbability,
    };
  }

  /**
   * Generates data for visualizing the phase and magnitude of each state component.
   * @param state The quantum state to visualize.
   * @returns A `PhaseVisualization` object.
   * @category Visualization
   */
  static getPhaseVisualization(state: QubitState): PhaseVisualization {
    const stateVector = state.amplitudes();
    const numQubits = state.quantumCount();

    const states: string[] = [];
    const magnitudes: number[] = [];
    const phases: number[] = [];
    const complexPlane: { real: number; imaginary: number }[] = [];

    for (let i = 0; i < stateVector.length; i++) {
      const amplitude = stateVector[i]!;
      const magnitude = amplitude.abs();

      if (magnitude > 1e-12) {
        const stateBinary = i.toString(2).padStart(numQubits, '0');
        const phase = Math.atan2(amplitude.im, amplitude.re);

        states.push(stateBinary);
        magnitudes.push(magnitude);
        phases.push(phase);
        complexPlane.push({
          real: amplitude.re,
          imaginary: amplitude.im,
        });
      }
    }

    return {
      states,
      magnitudes,
      phases,
      complexPlane,
    };
  }

  /**
   * Renders the state's probability distribution as an ASCII bar chart.
   * @param state The quantum state to render.
   * @param maxWidth The maximum width of the bar chart in characters. Defaults to 50.
   * @returns A string containing the ASCII bar chart.
   * @category Visualization
   */
  static renderBarChart(state: QubitState, maxWidth: number = 50): string {
    const histogram = this.getProbabilityHistogram(state, { onlyNonZero: true });

    if (histogram.probabilities.length === 0) {
      return 'No non-zero probabilities to display';
    }

    let chart = 'Probability Distribution:\n\n';

    for (let i = 0; i < histogram.labels.length; i++) {
      const label = histogram.labels[i]!;
      const prob = histogram.probabilities[i]!;
      const percentage = (prob * 100).toFixed(1);

      // Calculate bar length
      const barLength = Math.round((prob / histogram.maxProbability) * maxWidth);
      const bar = '█'.repeat(barLength);

      chart += `${label.padEnd(8)} │${bar.padEnd(maxWidth)} │ ${percentage.padStart(6)}%\n`;
    }

    return chart;
  }

  /**
   * Compares two quantum states and returns a summary of their differences.
   * @param state1 The first quantum state.
   * @param state2 The second quantum state.
   * @returns A string containing a comparison table and fidelity/distance metrics.
   * @category Visualization
   */
  static compareStates(state1: QubitState, state2: QubitState): string {
    if (state1.quantumCount() !== state2.quantumCount()) {
      return 'Cannot compare states with different numbers of qubits';
    }

    const amplitudes1 = this.getAmplitudes(state1, { onlyNonZero: false });
    const amplitudes2 = this.getAmplitudes(state2, { onlyNonZero: false });

    let comparison = 'State Comparison:\n\n';
    comparison += '┌──────────┬──────────────────┬──────────────────┬─────────────┐\n';
    comparison += '│  State   │    State 1       │    State 2       │  Difference │\n';
    comparison += '├──────────┼──────────────────┼──────────────────┼─────────────┤\n';

    for (let i = 0; i < amplitudes1.length; i++) {
      const amp1 = amplitudes1[i]!;
      const amp2 = amplitudes2[i]!;

      const stateStr = `|${amp1.state}⟩`.padEnd(8);
      const amp1Str = amp1.amplitudeString.padEnd(16);
      const amp2Str = amp2.amplitudeString.padEnd(16);

      const probDiff = Math.abs(amp1.probability - amp2.probability);
      const diffStr = probDiff.toFixed(4);

      if (probDiff > 1e-6) {
        comparison += `│ ${stateStr} │ ${amp1Str} │ ${amp2Str} │ ${diffStr.padStart(11)} │\n`;
      }
    }

    comparison += '└──────────┴──────────────────┴──────────────────┴─────────────┘\n';

    // Calculate fidelity
    const vec1 = state1.amplitudes();
    const vec2 = state2.amplitudes();
    let fidelity = 0;

    for (let i = 0; i < vec1.length; i++) {
      fidelity += vec1[i]!.conjugate().mul(vec2[i]!).re;
    }
    fidelity = Math.abs(fidelity);

    comparison += `\nFidelity: ${fidelity.toFixed(6)}`;
    comparison += `\nDistance: ${Math.sqrt(2 - 2 * fidelity).toFixed(6)}`;

    return comparison;
  }

  /**
   * Generates a summary of key statistics for a quantum state.
   * @param state The quantum state to summarize.
   * @returns A string containing summary statistics like entropy and purity.
   * @category Visualization
   */
  static getStateSummary(state: QubitState): string {
    const amplitudes = this.getAmplitudes(state, { onlyNonZero: true });
    const probabilities = amplitudes.map((amp) => amp.probability);

    // Calculate entropy
    let entropy = 0;
    for (const prob of probabilities) {
      entropy -= prob * Math.log2(prob);
    }

    // Calculate purity (Tr(ρ²) for pure states = 1)
    const purity = probabilities.reduce((sum, prob) => sum + prob * prob, 0);

    // Count computational basis states
    const numNonZeroStates = amplitudes.length;
    const totalStates = 1 << state.quantumCount();

    let summary = `Quantum State Summary:\n`;
    summary += `• Number of targets: ${state.quantumCount()}\n`;
    summary += `• Total basis states: ${totalStates}\n`;
    summary += `• Non-zero amplitudes: ${numNonZeroStates}\n`;
    summary += `• Entropy: ${entropy.toFixed(4)} bits\n`;
    summary += `• Purity: ${purity.toFixed(6)}\n`;
    summary += `• Maximum probability: ${Math.max(...probabilities, 0).toFixed(4)}\n`;

    if (numNonZeroStates === 1) {
      summary += `• State type: Pure computational basis state\n`;
    } else if (purity > 0.99) {
      summary += `• State type: Pure superposition state\n`;
    } else {
      summary += `• State type: Mixed or partially entangled state\n`;
    }

    return summary;
  }
}

// Exports

/**
 * State visualization interface.
 */
export type StateRendererType = {
  /**
   * Render state as probability histogram.
   */
  renderProbabilityHistogram(state: QubitState, options?: StateRenderOptions): ProbabilityHistogram;

  /**
   * Generate Bloch sphere data for single qubit.
   */
  generateBlochSphereData(state: QubitState, qubitIndex: number): BlochSphereData;

  /**
   * Display amplitude information.
   */
  displayAmplitudes(state: QubitState, options?: StateRenderOptions): AmplitudeDisplay;

  /**
   * Create phase visualization.
   */
  visualizePhases(state: QubitState): PhaseVisualization;
};

/**
 * Simple measurement outcome visualization.
 */
export type MeasurementVisualization = {
  readonly histogram: ProbabilityHistogram;
};

// Type exports
export type {
  AmplitudeDisplay,
  StateRenderOptions,
  BlochSphereData,
  ProbabilityHistogram,
  PhaseVisualization,
};

// Class exports
export { StateRenderer };
