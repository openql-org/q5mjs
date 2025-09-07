// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { 
  // Direct imports to test re-exports
  groverSearch,
  grover,
  groverIter,
  groverProb,
  analyzeGroverPerformance,
  estimateSuccessProbability,
  quantumFourierTransform,
  QFT,
  qftEncode,
  quantumPhaseEstimation,
  QPE,
  estimatePhase,
  decodePhaseEstimate,
  estimateControlQubits,
  QAA,
  findOptimalIterations,
  createCompositeOracle,
  CircuitRenderer,
  StateRenderer,
  // Direct converter re-exports
  exportToQiskit,
  exportToOpenQASM,
  exportToCirq,
  // Direct notebook re-exports
  NotebookRenderer,
  NotebookOutput,
  extendCircuitForNotebook,
  extendQubitStateForNotebook,
  enableNotebookMode
} from '../../src/packages-entry';

describe('packages-entry', () => {
  describe('Direct Re-exports', () => {
    describe('Grover Algorithm Re-exports', () => {
      it('should re-export groverSearch function', () => {
        expect(typeof groverSearch).toBe('function');
        const oracle = (input: string) => input === '01';
        const circuit = groverSearch(2, oracle, { iterations: 1 });
        expect(circuit).toBeDefined();
      });

      it('should re-export grover function', () => {
        expect(typeof grover).toBe('function');
        const circuit = grover(2, '01');
        expect(circuit).toBeDefined();
      });

      it('should re-export groverIter function', () => {
        expect(typeof groverIter).toBe('function');
        const iterations = groverIter(4, 1);
        expect(iterations).toBeGreaterThan(0);
      });

      it('should re-export groverProb function', () => {
        expect(typeof groverProb).toBe('function');
        const prob = groverProb(4, 1, 1);
        expect(prob).toBeGreaterThan(0);
        expect(prob).toBeLessThanOrEqual(1);
      });

      it('should re-export analyzeGroverPerformance function', () => {
        expect(typeof analyzeGroverPerformance).toBe('function');
        const oracle = (input: string) => input === '01';
        const analysis = analyzeGroverPerformance(2, oracle, 1);
        expect(analysis).toHaveProperty('successProbability');
        expect(analysis).toHaveProperty('optimalIterations');
      });

      it('should re-export estimateSuccessProbability function', () => {
        expect(typeof estimateSuccessProbability).toBe('function');
        const oracle = (input: string) => input === '01';
        const prob = estimateSuccessProbability(2, oracle, 1);
        expect(prob).toBeGreaterThanOrEqual(0);
        expect(prob).toBeLessThanOrEqual(1);
      });
    });

    describe('QFT Algorithm Re-exports', () => {
      it('should re-export quantumFourierTransform function', async () => {
        const { Circuit } = await import('../../src/core/Circuit');
        expect(typeof quantumFourierTransform).toBe('function');
        
        const circuit = new Circuit(2);
        quantumFourierTransform(circuit);
        expect(circuit).toBeDefined();
      });

      it('should re-export QFT function', () => {
        expect(typeof QFT).toBe('function');
        const circuit = QFT(3);
        expect(circuit).toBeDefined();
      });

      it('should re-export qftEncode function', () => {
        expect(typeof qftEncode).toBe('function');
        const circuit = qftEncode(2, 3);
        expect(circuit).toBeDefined();
      });
    });

    describe('Phase Estimation Algorithm Re-exports', () => {
      it('should re-export quantumPhaseEstimation function', async () => {
        expect(typeof quantumPhaseEstimation).toBe('function');
        // Just check function exists, don't call it as it requires proper setup
      });

      it('should re-export QPE function', async () => {
        const { Circuit } = await import('../../src/core/Circuit');
        expect(typeof QPE).toBe('function');
        
        const unitary = new Circuit(1);
        unitary.x(0);
        const circuit = QPE(unitary, 3);
        expect(circuit).toBeDefined();
      });

      it('should re-export estimatePhase function', async () => {
        const { Circuit } = await import('../../src/core/Circuit');
        expect(typeof estimatePhase).toBe('function');
        
        const unitary = new Circuit(1);
        unitary.x(0);
        const phase = estimatePhase(unitary, 3);
        expect(phase).toBeDefined();
      });

      it('should re-export decodePhaseEstimate function', () => {
        expect(typeof decodePhaseEstimate).toBe('function');
        // decodePhaseEstimate expects a number, not a string
        const phase = decodePhaseEstimate(2, 3); // 2 is binary 010
        expect(typeof phase).toBe('number');
      });

      it('should re-export estimateControlQubits function', () => {
        expect(typeof estimateControlQubits).toBe('function');
        const qubits = estimateControlQubits(0.01);
        expect(qubits).toBeGreaterThan(0);
      });
    });

    describe('Amplitude Amplification Re-exports', () => {
      it('should re-export QAA function', () => {
        expect(typeof QAA).toBe('function');
        const oracle = (input: string) => input === '01';
        const circuit = QAA(2, oracle, { iterations: 1 });
        expect(circuit).toBeDefined();
      });

      it('should re-export findOptimalIterations function', () => {
        expect(typeof findOptimalIterations).toBe('function');
        const oracle = (input: string) => input === '01';
        const iterations = findOptimalIterations(2, oracle, 0.9);
        expect(iterations).toBeGreaterThanOrEqual(0);
      });

      it('should re-export createCompositeOracle function', () => {
        expect(typeof createCompositeOracle).toBe('function');
        const oracle1 = (input: string) => input === '01';
        const oracle2 = (input: string) => input === '10';
        const composite = createCompositeOracle([oracle1, oracle2], 'OR');
        expect(typeof composite).toBe('function');
        expect(composite('01')).toBe(true);
        expect(composite('10')).toBe(true);
        expect(composite('00')).toBe(false);
      });
    });

    describe('Visualization Re-exports', () => {
      it('should re-export CircuitRenderer class', () => {
        expect(typeof CircuitRenderer).toBe('function');
        expect(CircuitRenderer.name).toBe('CircuitRenderer');
        expect(typeof CircuitRenderer.renderASCII).toBe('function');
        expect(typeof CircuitRenderer.generateSVGData).toBe('function');
        expect(typeof CircuitRenderer.exportLaTeX).toBe('function');
      });

      it('should re-export StateRenderer class', () => {
        expect(typeof StateRenderer).toBe('function');
        expect(StateRenderer.name).toBe('StateRenderer');
        expect(typeof StateRenderer.renderStateVector).toBe('function');
        expect(typeof StateRenderer.renderProbabilityTable).toBe('function');
      });
    });

    describe('Converter Re-exports', () => {
      it('should re-export exportToQiskit function', async () => {
        const { Circuit } = await import('../../src/core/Circuit');
        expect(typeof exportToQiskit).toBe('function');
        
        const circuit = new Circuit(2);
        circuit.h(0).cnot(0, 1);
        
        const qiskitCode = exportToQiskit(circuit);
        expect(qiskitCode).toContain('QuantumCircuit');
      });

      it('should re-export exportToOpenQASM function', async () => {
        const { Circuit } = await import('../../src/core/Circuit');
        expect(typeof exportToOpenQASM).toBe('function');
        
        const circuit = new Circuit(2);
        circuit.h(0).cnot(0, 1);
        
        const qasmCode = exportToOpenQASM(circuit);
        expect(qasmCode).toContain('OPENQASM');
      });

      it('should re-export exportToCirq function', async () => {
        const { Circuit } = await import('../../src/core/Circuit');
        expect(typeof exportToCirq).toBe('function');
        
        const circuit = new Circuit(2);
        circuit.h(0).cnot(0, 1);
        
        const cirqCode = exportToCirq(circuit);
        expect(cirqCode).toContain('cirq');
      });
    });
  });

  describe('Notebook Re-exports', () => {
    describe('NotebookRenderer Re-export', () => {
      it('should re-export NotebookRenderer class', () => {
        expect(typeof NotebookRenderer).toBe('function');
        expect(NotebookRenderer.name).toBe('NotebookRenderer');
        
        // Test static method exists
        expect(typeof NotebookRenderer.isJupyterEnvironment).toBe('function');
        expect(typeof NotebookRenderer.enableNotebookMode).toBe('function');
        expect(typeof NotebookRenderer.renderCircuit).toBe('function');
        expect(typeof NotebookRenderer.renderState).toBe('function');
      });
    });

    describe('NotebookOutput Re-export', () => {
      it('should re-export NotebookOutput class', () => {
        expect(typeof NotebookOutput).toBe('function');
        expect(NotebookOutput.name).toBe('NotebookOutput');
        
        // Test constructor
        const output = new NotebookOutput({ 'text/plain': 'test' });
        expect(output).toBeDefined();
        expect(output.toText()).toBe('test');
      });
    });

    describe('Extension Functions Re-exports', () => {
      it('should re-export extendCircuitForNotebook function', () => {
        expect(typeof extendCircuitForNotebook).toBe('function');
        
        // Test with a mock class
        class MockCircuit {
          prototype: any = {};
        }
        
        // This should not throw
        expect(() => extendCircuitForNotebook(MockCircuit)).not.toThrow();
      });

      it('should re-export extendQubitStateForNotebook function', () => {
        expect(typeof extendQubitStateForNotebook).toBe('function');
        
        // Test with a mock class
        class MockQubitState {
          prototype: any = {};
        }
        
        // This should not throw
        expect(() => extendQubitStateForNotebook(MockQubitState)).not.toThrow();
      });

      it('should re-export enableNotebookMode function', () => {
        expect(typeof enableNotebookMode).toBe('function');
        
        // This should not throw (may warn in console but that's ok)
        expect(() => enableNotebookMode()).not.toThrow();
      });
    });
  });
});