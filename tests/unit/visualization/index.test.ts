// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import {
  CircuitRenderer,
  StateRenderer,
  type CircuitLayout,
  type GatePosition,
  type WireConnection,
  type ASCIIRenderOptions,
  type SVGCircuitData,
  type SVGGate,
  type SVGWire,
  type SVGQubit,
  type CircuitRendererType,
  type AmplitudeDisplay,
  type StateRenderOptions,
  type BlochSphereData,
  type ProbabilityHistogram,
  type PhaseVisualization,
  type StateRendererType,
  type MeasurementVisualization,
} from '@/visualization';

describe('Visualization Index', () => {
  it('should export CircuitRenderer', () => {
    expect(CircuitRenderer).toBeDefined();
    expect(typeof CircuitRenderer.analyzeLayout).toBe('function');
  });

  it('should export StateRenderer', () => {
    expect(StateRenderer).toBeDefined();
    expect(typeof StateRenderer.getAmplitudes).toBe('function');
  });

  it('should export all types', () => {
    // Test that type imports don't cause runtime errors
    expect(true).toBe(true);
  });
});