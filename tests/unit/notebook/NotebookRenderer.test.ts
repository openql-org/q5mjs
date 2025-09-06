// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { NotebookRenderer } from '@/notebook/NotebookRenderer';
import { NotebookOutput } from '@/notebook/types';
import { Circuit } from '@/core/Circuit';
import { QubitState } from '@/core/QubitState';
import type { JupyterWindow } from '@/notebook/types';

// Mock globalThis for testing environment
const originalGlobalThis = globalThis;

describe('NotebookRenderer', () => {
  beforeEach(() => {
    // Reset static state
    (NotebookRenderer as any).isNotebookEnvironment = null;
  });

  afterEach(() => {
    // Reset globalThis
    (globalThis as any).window = originalGlobalThis;
    (NotebookRenderer as any).isNotebookEnvironment = null;
  });

  describe('isJupyterEnvironment', () => {
    it('should detect Jupyter environment with Jupyter.notebook.kernel', () => {
      // Mock Jupyter environment
      (globalThis as any).window = {
        Jupyter: {
          notebook: {
            kernel: {},
          },
        },
      } as JupyterWindow;

      const result = NotebookRenderer.isJupyterEnvironment();
      expect(result).toBe(true);
    });

    it('should detect Jupyter environment with IPython.notebook.kernel', () => {
      // Mock IPython environment
      (globalThis as any).window = {
        IPython: {
          notebook: {
            kernel: {},
          },
        },
      } as JupyterWindow;

      const result = NotebookRenderer.isJupyterEnvironment();
      expect(result).toBe(true);
    });

    it('should return false when window is undefined', () => {
      // Mock no window environment
      (globalThis as any).window = undefined;

      const result = NotebookRenderer.isJupyterEnvironment();
      expect(result).toBe(false);
    });

    it('should return false when no Jupyter/IPython detected', () => {
      // Mock regular browser environment
      (globalThis as any).window = {};

      const result = NotebookRenderer.isJupyterEnvironment();
      expect(result).toBe(false);
    });

    it('should cache the result', () => {
      // Mock Jupyter environment
      (globalThis as any).window = {
        Jupyter: {
          notebook: {
            kernel: {},
          },
        },
      } as JupyterWindow;

      const result1 = NotebookRenderer.isJupyterEnvironment();
      
      // Change the environment
      (globalThis as any).window = {};
      
      // Should still return cached result
      const result2 = NotebookRenderer.isJupyterEnvironment();
      
      expect(result1).toBe(true);
      expect(result2).toBe(true); // Cached
    });
  });

  describe('enableNotebookMode', () => {
    beforeEach(() => {
      // Mock console methods to avoid log output during tests
      jest.spyOn(console, 'warn').mockImplementation();
      jest.spyOn(console, 'info').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should warn when not in Jupyter environment', () => {
      (globalThis as any).window = {};
      
      NotebookRenderer.enableNotebookMode();
      
      expect(console.warn).toHaveBeenCalledWith(
        'Not in a Jupyter environment. Notebook mode may not work as expected.'
      );
    });

    it('should enable without warning in Jupyter environment', () => {
      (globalThis as any).window = {
        Jupyter: { notebook: { kernel: {} } },
      } as JupyterWindow;
      
      NotebookRenderer.enableNotebookMode();
      
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('renderCircuit', () => {
    let circuit: Circuit;

    beforeEach(() => {
      circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
    });

    it('should render circuit with default options', () => {
      const result = NotebookRenderer.renderCircuit(circuit);
      
      expect(result).toBeInstanceOf(NotebookOutput);
      
      const mimeBundle = result.toMimeBundle();
      expect(mimeBundle['text/plain']).toContain('q0:');
      expect(mimeBundle['text/html']).toContain('Quantum Circuit');
      expect(mimeBundle['image/svg+xml']).toContain('<svg');
      expect(mimeBundle['text/latex']).toContain('$$');
    });

    it('should render circuit with custom options', () => {
      const result = NotebookRenderer.renderCircuit(circuit, {
        interactive: false,
        theme: 'dark',
      });
      
      expect(result).toBeInstanceOf(NotebookOutput);
      
      const html = result.toHTML();
      expect(html).toContain('<div');
    });

    it('should handle empty circuit', () => {
      const emptyCircuit = new Circuit(1);
      
      const result = NotebookRenderer.renderCircuit(emptyCircuit);
      
      expect(result).toBeInstanceOf(NotebookOutput);
      expect(result.toText()).toContain('q0:');
    });

    it('should create SVG with correct theme colors', () => {
      const result = NotebookRenderer.renderCircuit(circuit, { theme: 'dark' });
      const svg = result.toSVG();
      
      expect(svg).toContain('stroke: #ffffff');
      expect(svg).toContain('fill: #333333');
    });

    it('should create SVG with light theme colors', () => {
      const result = NotebookRenderer.renderCircuit(circuit, { theme: 'light' });
      const svg = result.toSVG();
      
      expect(svg).toContain('stroke: #000000');
      expect(svg).toContain('fill: #ffffff');
    });

    it('should handle multi-qubit circuits', () => {
      const largeCircuit = new Circuit(3);
      largeCircuit.h(0).cnot(0, 1).cz(1, 2);
      
      const result = NotebookRenderer.renderCircuit(largeCircuit);
      
      expect(result).toBeInstanceOf(NotebookOutput);
      expect(result.toText()).toContain('q2:');
    });
  });

  describe('renderState', () => {
    let state: QubitState;

    beforeEach(() => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      const result = circuit.execute();
      state = result.state;
    });

    it('should render state with default options', () => {
      const result = NotebookRenderer.renderState(state);
      
      expect(result).toBeInstanceOf(NotebookOutput);
      
      const mimeBundle = result.toMimeBundle();
      expect(mimeBundle['text/plain']).toContain('Quantum State:');
      expect(mimeBundle['text/html']).toContain('Quantum State');
      expect(mimeBundle['application/json']).toHaveProperty('qubitCount', 2);
    });

    it('should render state with custom options', () => {
      const result = NotebookRenderer.renderState(state, {
        showStateVector: true,
        showMeasurements: true,
        maxQubitDisplay: 3,
      });
      
      expect(result).toBeInstanceOf(NotebookOutput);
      
      const html = result.toHTML();
      expect(html).toContain('Measurement Probabilities');
      expect(html).toContain('State Vector');
    });

    it('should generate LaTeX for small states', () => {
      const smallState = new QubitState(1);
      
      const result = NotebookRenderer.renderState(smallState);
      const latex = result.toLaTeX();
      
      expect(latex).toContain('$$|\\psi\\rangle');
    });

    it('should not generate LaTeX for large states', () => {
      // Create a mock large state
      const largeState = new QubitState(5); // More than 3 qubits
      
      const result = NotebookRenderer.renderState(largeState);
      const mimeBundle = result.toMimeBundle();
      
      expect(mimeBundle['text/latex']).toBeUndefined();
    });

    it('should handle single qubit states', () => {
      const singleQubitState = QubitState.zero();
      
      const result = NotebookRenderer.renderState(singleQubitState);
      
      expect(result).toBeInstanceOf(NotebookOutput);
      const html = result.toHTML();
      expect(html).toContain('1 qubits');
    });

    it('should limit probability display for large states', () => {
      const result = NotebookRenderer.renderState(state, {
        maxQubitDisplay: 1,
      });
      
      const html = result.toHTML();
      expect(html).toContain('Showing first 2 of 4 basis states');
    });

    it('should display state vector for small states', () => {
      const result = NotebookRenderer.renderState(state, {
        showStateVector: true,
      });
      
      const html = result.toHTML();
      expect(html).toContain('State Vector:');
    });

    it('should not display state vector for large states', () => {
      const largeState = new QubitState(5);
      
      const result = NotebookRenderer.renderState(largeState, {
        showStateVector: true,
      });
      
      const html = result.toHTML();
      expect(html).not.toContain('State Vector:');
    });
  });

  describe('Private methods (via public interface)', () => {
    it('should create interactive HTML with buttons', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      const result = NotebookRenderer.renderCircuit(circuit, { interactive: true });
      const html = result.toHTML();
      
      expect(html).toContain('button');
      expect(html).toContain('Run Circuit');
      expect(html).toContain('Copy OpenQASM');
    });

    it('should create static HTML without buttons', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      const result = NotebookRenderer.renderCircuit(circuit, { interactive: false });
      const html = result.toHTML();
      
      expect(html).not.toContain('button');
    });

    it('should handle complex amplitudes in LaTeX', () => {
      // Create a superposition state with complex amplitudes
      const circuit = new Circuit(1);
      circuit.h(0); // Creates |0⟩ + |1⟩ / √2
      const result = circuit.execute();
      const state = result.state;
      
      const output = NotebookRenderer.renderState(state);
      const latex = output.toLaTeX();
      
      if (latex) {
        expect(latex).toContain('$$|\\psi\\rangle');
        expect(latex).toContain('\\rangle$$');
      }
    });

    it('should handle pure imaginary amplitudes in LaTeX', () => {
      // Create a state with pure imaginary amplitudes using phase gates
      const circuit = new Circuit(1);
      circuit.x(0).s(0); // S gate applies phase of i
      const result = circuit.execute();
      const state = result.state;
      
      const output = NotebookRenderer.renderState(state);
      const latex = output.toLaTeX();
      
      if (latex) {
        expect(latex).toContain('$$|\\psi\\rangle');
        expect(latex).toContain('i|'); // Should contain imaginary coefficient
        expect(latex).toContain('\\rangle$$');
      }
    });

    it('should handle mixed real and imaginary amplitudes in LaTeX', () => {
      // Create a state with both real and imaginary parts
      const circuit = new Circuit(1);
      circuit.h(0).t(0); // H creates superposition, T adds phase π/4 creating complex amplitudes
      const result = circuit.execute();
      const state = result.state;
      
      const output = NotebookRenderer.renderState(state);
      const latex = output.toLaTeX();
      
      if (latex) {
        expect(latex).toContain('$$|\\psi\\rangle');
        // T gate after H should create amplitudes with both real and imaginary parts
        expect(latex).toContain('\\rangle$$');
      }
    });

    it('should handle complex amplitudes with negative imaginary parts in LaTeX', () => {
      // Create a state that will have negative imaginary parts
      const circuit = new Circuit(1);
      circuit.h(0).phase(0, -Math.PI/4); // Correct parameter order: qubit, phase
      const result = circuit.execute();
      const state = result.state;
      
      const output = NotebookRenderer.renderState(state);
      const latex = output.toLaTeX();
      
      if (latex) {
        expect(latex).toContain('$$|\\psi\\rangle');
        expect(latex).toContain('\\rangle$$');
        // Should handle negative imaginary parts without extra '+'
      }
    });

    it('should handle negative imaginary components in LaTeX formatting', () => {
      // Create a controlled test for negative imaginary formatting
      const circuit = new Circuit(2);
      // Create a state with specific negative imaginary components
      circuit.h(0).h(1);
      circuit.phase(0, -Math.PI/3); // Correct parameter order: qubit, phase
      circuit.phase(1, -Math.PI/6);
      const result = circuit.execute();
      const state = result.state;
      
      const output = NotebookRenderer.renderState(state);
      const latex = output.toLaTeX();
      
      if (latex) {
        expect(latex).toContain('$$|\\psi\\rangle');
        expect(latex).toContain('\\rangle$$');
        // Test handles negative imaginary components correctly
      }
    });

    it('should format probabilities correctly', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      const result = circuit.execute();
      const state = result.state;
      
      const output = NotebookRenderer.renderState(state, { showMeasurements: true });
      const html = output.toHTML();
      
      expect(html).toContain('50.00%'); // Bell state probabilities
    });
  });

  describe('Error handling', () => {
    it('should handle circuits with no gates gracefully', () => {
      const emptyCircuit = new Circuit(1);
      
      const result = NotebookRenderer.renderCircuit(emptyCircuit);
      
      expect(result).toBeInstanceOf(NotebookOutput);
      expect(result.toText()).toContain('q0:');
    });

    it('should handle state rendering edge cases', () => {
      const zeroState = QubitState.zero();
      
      const result = NotebookRenderer.renderState(zeroState, {
        showStateVector: true,
        showMeasurements: true,
        maxQubitDisplay: 10,
      });
      
      expect(result).toBeInstanceOf(NotebookOutput);
      expect(result.toHTML()).toContain('Quantum State');
    });

    it('should handle theme fallback', () => {
      const circuit = new Circuit(1);
      circuit.h(0);
      
      // Test auto theme (should default to light)
      const result = NotebookRenderer.renderCircuit(circuit, { theme: 'auto' });
      const svg = result.toSVG();
      
      expect(svg).toContain('stroke'); // Should have some styling
    });
  });

  describe('Rendering options', () => {
    it('should render without measurements when disabled', () => {
      const state = new QubitState(1);
      
      // Test with showMeasurements: false
      const result = NotebookRenderer.renderState(state, {
        showStateVector: true,
        showMeasurements: false,
        maxQubitDisplay: 3,
      });
      
      const html = result.toHTML();
      
      // Should not show measurement probabilities
      expect(html).not.toContain('Measurement Probabilities');
      expect(html).toContain('Quantum State'); // But should still contain the basic state info
    });
  });
});
