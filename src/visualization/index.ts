// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * @file Visualization tools for quantum circuits and states.
 *
 * @description
 * This module provides a suite of tools for visualizing different aspects of
 * quantum computations, including circuit diagrams, quantum state representations
 * (like Bloch spheres and probability histograms), and measurement outcomes.
 *
 * @packageDocumentation
 */

/**
 * Tools for rendering quantum circuit diagrams.
 * Supports ASCII and SVG formats.
 */
export {
  CircuitRenderer,
  type CircuitLayout,
  type GatePosition,
  type WireConnection,
  type ASCIIRenderOptions,
  type SVGCircuitData,
  type SVGGate,
  type SVGWire,
  type SVGQubit,
  type CircuitRendererType,
} from './CircuitRenderer';

/**
 * Tools for visualizing quantum states.
 * Supports probability histograms, Bloch spheres, and phase plots.
 */
export {
  StateRenderer,
  type AmplitudeDisplay,
  type StateRenderOptions,
  type BlochSphereData,
  type ProbabilityHistogram,
  type PhaseVisualization,
  type StateRendererType,
  type MeasurementVisualization,
} from './StateRenderer';
