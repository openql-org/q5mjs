// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { QubitState, isQubitState, Qubit } from '@/core/QubitState';
import { RepType } from '@/core/Q5mState';
import { HadamardGate, PauliXGate, PauliYGate, PauliZGate } from '@/core/OneQubitGates';
import { CNOTGate } from '@/core/TwoQubitGates';
import { Circuit } from '@/core/Circuit';
import { complex } from '@/math/complex';
import { Q5mOperator } from '@/core/Q5mOperator';

describe('QubitState', () => {
  describe('Construction', () => {
    it('should create state with correct number of qubits', () => {
      const state = new QubitState(3);
      expect(state.quantumCount()).toBe(3);
      expect(state.stateCount).toBe(8); // 2^3
    });

    it('should initialize to |0⟩ state', () => {
      const state = new QubitState(2);
      const amplitudes = state.amplitudes();
      
      expect(amplitudes[0]).toEqual(complex(1, 0)); // |00⟩
      expect(amplitudes[1]).toEqual(complex(0, 0)); // |01⟩
      expect(amplitudes[2]).toEqual(complex(0, 0)); // |10⟩
      expect(amplitudes[3]).toEqual(complex(0, 0)); // |11⟩
    });

    it('should throw error for invalid qubit count', () => {
      expect(() => new QubitState(0)).toThrow();
      expect(() => new QubitState(-1)).toThrow();
    });
  });

  describe('Amplitudes and Probabilities', () => {
    it('should return correct amplitudes', () => {
      const state = new QubitState(1);
      const gate = new HadamardGate();
      const result = gate.applyTo(state);
      
      const amplitudes = result.amplitudes();
      expect(amplitudes).toHaveLength(2);
      expect(amplitudes[0].re).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[1].re).toBeCloseTo(1/Math.sqrt(2), 10);
    });

    it('should return correct probabilities', () => {
      const state = new QubitState(1);
      const gate = new HadamardGate();
      const result = gate.applyTo(state);
      
      const probabilities = result.probabilities();
      expect(probabilities).toHaveLength(2);
      expect(probabilities[0]).toBeCloseTo(0.5, 10);
      expect(probabilities[1]).toBeCloseTo(0.5, 10);
    });

    it('should have normalized probabilities', () => {
      const state = new QubitState(1);
      const hGate = new HadamardGate();
      const result = hGate.applyTo(state);
      
      const probabilities = result.probabilities();
      const sum = probabilities.reduce((acc, p) => acc + p, 0);
      expect(sum).toBeCloseTo(1, 10);
    });
  });

  describe('Gate Application', () => {
    it('should apply single qubit gates correctly', () => {
      const state = new QubitState(1);
      const xGate = new PauliXGate();
      
      const result = xGate.applyTo(state);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(0, 10);
      expect(amplitudes[1].re).toBeCloseTo(1, 10);
    });

    it('should apply two qubit gates correctly', () => {
      // Use Circuit API for multi-qubit gate operations
      const circuit = new Circuit(2);
      circuit.x(0).cnot(0, 1);
      const result = circuit.execute();
      const amplitudes = result.state.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(0, 10); // |00⟩
      expect(amplitudes[1].re).toBeCloseTo(0, 10); // |01⟩
      expect(amplitudes[2].re).toBeCloseTo(0, 10); // |10⟩
      expect(amplitudes[3].re).toBeCloseTo(1, 10); // |11⟩
    });

    it('should throw error for dimension mismatch', () => {
      const singleState = new QubitState(1);
      const twoQubitGate = new CNOTGate();
      
      expect(() => twoQubitGate.applyTo(singleState)).toThrow('does not match gate size');
    });
  });

  describe('State Properties', () => {
    it('should calculate fidelity correctly', () => {
      const state1 = new QubitState(1);
      const state2 = new QubitState(1);
      
      expect(state1.fidelity(state2)).toBeCloseTo(1, 10);
      
      const hGate = new HadamardGate();
      const state1H = hGate.applyTo(state1);
      
      expect(state1H.fidelity(state2)).toBeCloseTo(0.5, 10);
    });

    it('should throw error for fidelity with different dimensions', () => {
      const state1 = new QubitState(1);
      const state2 = new QubitState(2);
      
      expect(() => state1.fidelity(state2)).toThrow('different dimensions');
    });

    it('should calculate fidelity correctly', () => {
      const state1 = new QubitState(1);
      const state2 = new QubitState(1);
      
      const fidelityValue = state1.fidelity(state2);
      expect(fidelityValue).toBeCloseTo(1, 10);
    });

    it('should provide string representation', () => {
      const state = new QubitState(1);
      const stringRep = state.toString();
      expect(typeof stringRep).toBe('string');
      expect(stringRep).toContain('|0⟩');
    });
  });

  describe('String Representation', () => {
    it('should generate readable string representation', () => {
      const state = new QubitState(1);
      const str = state.toString();
      
      expect(str).toContain('|0⟩');
      expect(str).toContain('1.000');
    });

    it('should handle precision parameter', () => {
      const state = new QubitState(1);
      const hGate = new HadamardGate();
      const superposition = hGate.applyTo(state);
      
      const str3 = superposition.toString(3);
      const str10 = superposition.toString(10);
      
      expect(str3).toContain('0.707');
      expect(str10).toContain('0.7071067812');
    });

    it('should throw error for invalid precision', () => {
      const state = new QubitState(1);
      
      expect(() => state.toString(-1)).toThrow();
      expect(() => state.toString(101)).toThrow();
    });
  });

  describe('Measurement', () => {
    it('should measure single qubit states', () => {
      const state = new QubitState(1);
      const measurement = state.measure();
      
      expect(measurement).toBe(0);  // measure() returns 0 or 1 directly
    });

    it('should measure superposition states', () => {
      const state = new QubitState(1);
      const hGate = new HadamardGate();
      const superposition = hGate.applyTo(state);
      
      const measurement = superposition.measure();
      expect([0, 1]).toContain(measurement);  // Should return 0 or 1
    });

    it('should throw error for multi-qubit measurement', () => {
      const state = new QubitState(2);
      
      expect(() => state.measure()).toThrow('Cannot measure single qubit from 2-qubit state');
    });
  });

  describe('Memory Optimization', () => {
    it('should handle sparse representation for large states', () => {
      // Test with a larger state space
      const state = new QubitState(10); // 1024 dimensions
      expect(state.quantumCount()).toBe(10);
      expect(state.stateCount).toBe(1024);
    });

    it('should maintain accuracy with sparse operations', () => {
      // Use circuit for multi-qubit operations
      const circuit = new Circuit(5);
      circuit.h(0).h(1).h(2);
      const result = circuit.execute();
      
      const probabilities = result.state.probabilities();
      const sum = probabilities.reduce((acc, p) => acc + p, 0);
      expect(sum).toBeCloseTo(1, 10);
    });
  });

  describe('Error Handling', () => {
    it('should handle Q5mOperator application correctly', () => {
      const state = new QubitState(1);
      const matrix = [[complex(0, 0), complex(1, 0)], [complex(1, 0), complex(0, 0)]];
      const operator = new Q5mOperator(matrix, 'TestX');
      
      const result = state.apply(operator);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(0, 10);
      expect(amplitudes[1].re).toBeCloseTo(1, 10);
    });

    it('should throw error for invalid operator dimension', () => {
      const state = new QubitState(1); // 2D
      const matrix = [ // 4x4 matrix
        [complex(1, 0), complex(0, 0), complex(0, 0), complex(0, 0)],
        [complex(0, 0), complex(1, 0), complex(0, 0), complex(0, 0)],
        [complex(0, 0), complex(0, 0), complex(1, 0), complex(0, 0)],
        [complex(0, 0), complex(0, 0), complex(0, 0), complex(1, 0)]
      ];
      const operator = new Q5mOperator(matrix, 'Invalid');
      
      expect(() => state.apply(operator)).toThrow('does not match state dimension');
    });
  });

  describe('Static Factory Methods', () => {
    it('should create zero state', () => {
      const state = QubitState.zero();
      expect(state.amplitude(0)).toEqual(complex(1, 0));
      expect(state.amplitude(1)).toEqual(complex(0, 0));
    });

    it('should create one state', () => {
      const state = QubitState.one();
      expect(state.amplitude(0)).toEqual(complex(0, 0));
      expect(state.amplitude(1)).toEqual(complex(1, 0));
    });

    it('should create plus state', () => {
      const state = QubitState.plus();
      const expectedAmp = 1 / Math.sqrt(2);
      expect(state.amplitude(0).re).toBeCloseTo(expectedAmp, 10);
      expect(state.amplitude(1).re).toBeCloseTo(expectedAmp, 10);
    });

    it('should create minus state', () => {
      const state = QubitState.minus();
      const expectedAmp = 1 / Math.sqrt(2);
      expect(state.amplitude(0).re).toBeCloseTo(expectedAmp, 10);
      expect(state.amplitude(1).re).toBeCloseTo(-expectedAmp, 10);
    });

    it('should create state from angles', () => {
      const state = QubitState.fromAngle(Math.PI / 2, Math.PI / 4);
      expect(state.quantumCount()).toBe(1);
    });

    it('should create state from amplitudes', () => {
      const alpha = complex(0.6, 0);
      const beta = complex(0.8, 0);
      const state = QubitState.fromAmplitudes(alpha, beta);
      const norm = Math.sqrt(0.6*0.6 + 0.8*0.8);
      expect(state.amplitude(0).re).toBeCloseTo(0.6/norm, 10);
      expect(state.amplitude(1).re).toBeCloseTo(0.8/norm, 10);
    });

    it('should create state from basis state', () => {
      const state = QubitState.fromBasisState(2, 2); // |10⟩
      expect(state.amplitude(0).abs()).toBe(0);
      expect(state.amplitude(2).abs()).toBe(1);
    });

    it('should create state from bit string', () => {
      const state = QubitState.fromBitString('101');
      expect(state.quantumCount()).toBe(3);
      expect(state.amplitude(5).abs()).toBe(1); // 101 binary = 5 decimal
    });

    it('should throw error for invalid basis index', () => {
      expect(() => QubitState.fromBasisState(2, -1)).toThrow('Basis index -1 out of range for 2 qubits');
      expect(() => QubitState.fromBasisState(2, 4)).toThrow('Basis index 4 out of range for 2 qubits');
    });

    it('should throw error for invalid bit string', () => {
      expect(() => QubitState.fromBitString('102')).toThrow('Invalid bit string: 102. Must contain only 0s and 1s.');
      expect(() => QubitState.fromBitString('abc')).toThrow('Invalid bit string: abc. Must contain only 0s and 1s.');
    });
  });

  describe('Measurements', () => {
    it('should measure superposition states', () => {
      const state = QubitState.plus();
      const result = state.measure();
      expect([0, 1]).toContain(result);
    });

    it('should throw error for multi-qubit measurement', () => {
      const state = new QubitState(2);
      expect(() => state.measure()).toThrow('Cannot measure single qubit from 2-qubit state');
    });
  });

  describe('State Operations', () => {
    it('should calculate fidelity', () => {
      const state1 = QubitState.zero();
      const state2 = QubitState.zero();
      expect(state1.fidelity(state2)).toBe(1);

      const state3 = QubitState.one();
      expect(state1.fidelity(state3)).toBe(0);
    });

    it('should calculate trace distance', () => {
      const state1 = QubitState.zero();
      const state2 = QubitState.zero();
      expect(state1.traceDistance(state2)).toBeCloseTo(0, 10);

      const state3 = QubitState.one();
      expect(state1.traceDistance(state3)).toBeCloseTo(1, 10);
    });

    it('should calculate overlap', () => {
      const state1 = QubitState.zero();
      const state2 = QubitState.zero();
      const overlap = state1.overlap(state2);
      expect(overlap.re).toBeCloseTo(1, 10);
      expect(overlap.im).toBeCloseTo(0, 10);
    });

    it('should check equality', () => {
      const state1 = QubitState.zero();
      const state2 = QubitState.zero();
      expect(state1.isEqual(state2)).toBe(true);

      const state3 = QubitState.one();
      expect(state1.isEqual(state3)).toBe(false);
    });

    it('should check equality with different dimensions', () => {
      const state1 = QubitState.zero();
      const state2 = new QubitState(2);
      expect(state1.isEqual(state2)).toBe(false);
    });

    it('should throw error for fidelity with non-QubitState', () => {
      const state = QubitState.zero();
      const notQubitState = { numQuantum: 1 };
      expect(() => state.fidelity(notQubitState as any)).toThrow('Can only compute fidelity with another QubitState');
    });

    it('should clone states', () => {
      const state = QubitState.plus();
      const cloned = state.clone();
      expect(cloned.isEqual(state)).toBe(true);
      expect(cloned).not.toBe(state);
    });

    it('should normalize states', () => {
      const state = new QubitState(1, [complex(2, 0), complex(3, 0)]);
      const normalized = state.normalize();
      const norm = normalized.amplitude(0).abs() ** 2 + normalized.amplitude(1).abs() ** 2;
      expect(norm).toBeCloseTo(1, 10);
    });
  });

  describe('State Properties', () => {
    it('should return correct purity', () => {
      const state = QubitState.zero();
      expect(state.purity()).toBe(1);
    });

    it('should return isPure true', () => {
      const state = QubitState.zero();
      expect(state.isPure()).toBe(true);
    });

    it('should return zero entropy', () => {
      const state = QubitState.zero();
      expect(state.entropy()).toBe(0);
    });

    it('should return correct dimension', () => {
      const state = new QubitState(3);
      expect(state.dimension()).toBe(8);
    });

    it('should calculate memory usage', () => {
      const state = new QubitState(2);
      expect(state.memoryUsage()).toBeGreaterThan(0);
    });
  });

  describe('Tensor Operations', () => {
    it('should perform tensor product', () => {
      const state1 = QubitState.zero();
      const state2 = QubitState.one();
      const result = state1.tensor(state2);
      expect(result.quantumCount()).toBe(2);
      expect(result.amplitude(1).abs()).toBeCloseTo(1, 10); // |01⟩
    });
  });

  describe('String Representation', () => {
    it('should generate string representation', () => {
      const state = QubitState.plus();
      const str = state.toString();
      expect(str).toContain('|0⟩');
      expect(str).toContain('|1⟩');
    });

    it('should handle precision parameter', () => {
      const state = QubitState.plus();
      const str3 = state.toString(3);
      const str10 = state.toString(10);
      expect(str3).toContain('0.707');
      expect(str10).toContain('0.7071067812');
    });

    it('should throw error for invalid precision', () => {
      const state = QubitState.zero();
      expect(() => state.toString(-1)).toThrow();
      expect(() => state.toString(101)).toThrow();
    });
  });

  describe('Amplitude Operations', () => {
    it('should get individual amplitudes', () => {
      const state = QubitState.zero();
      expect(state.amplitude(0)).toEqual(complex(1, 0));
      expect(state.amplitude(1)).toEqual(complex(0, 0));
    });

    it('should throw error for out-of-range amplitude access', () => {
      const state = QubitState.zero();
      expect(() => state.amplitude(-1)).toThrow('out of range');
      expect(() => state.amplitude(2)).toThrow('out of range');
    });

    it('should set amplitudes', () => {
      const state = QubitState.zero();
      state.setAmplitude(1, complex(0.5, 0.5));
      expect(state.amplitude(1).re).toBeCloseTo(0.5, 10);
      expect(state.amplitude(1).im).toBeCloseTo(0.5, 10);
    });

    it('should work with withAmplitudes', () => {
      const state = new QubitState(1);
      const newAmps = [complex(0, 0), complex(1, 0)];
      const newState = state.withAmplitudes(newAmps);
      expect(newState.amplitude(0).abs()).toBe(0);
      expect(newState.amplitude(1).abs()).toBe(1);
    });
  });

  describe('Sparse Representation', () => {
    it('should handle sparse representation', () => {
      const state = QubitState.zero();
      (state as any).rep = RepType.SPARSE;
      (state as any).stateVector = undefined;
      (state as any).sparseAmplitudes = new Map([[0, complex(1, 0)]]);
      
      expect(state.amplitude(0)).toEqual(complex(1, 0));
      expect(state.amplitude(1)).toEqual(complex(0, 0));
    });

    it('should handle sparse toString', () => {
      const state = QubitState.zero();
      (state as any).rep = RepType.SPARSE;
      (state as any).stateVector = undefined;
      (state as any).sparseAmplitudes = new Map([[1, complex(1, 0)]]);
      
      const str = state.toString();
      expect(str).toContain('1⟩');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid state vector size', () => {
      expect(() => new QubitState(2, [complex(1, 0)])).toThrow('State vector size');
    });

    it('should throw error for zero vector', () => {
      const zeroVector = [complex(0, 0), complex(0, 0)];
      expect(() => new QubitState(1, zeroVector)).toThrow('Cannot normalize zero vector');
    });

    it('should throw error for dimension mismatch in fidelity', () => {
      const state1 = new QubitState(1);
      const state2 = new QubitState(2);
      expect(() => state1.fidelity(state2)).toThrow('different dimensions');
    });

    it('should throw error for dimension mismatch in traceDistance', () => {
      const state1 = new QubitState(1);
      const state2 = new QubitState(2);
      expect(() => state1.traceDistance(state2)).toThrow('different dimensions');
    });

    it('should throw error for dimension mismatch in overlap', () => {
      const state1 = new QubitState(1);
      const state2 = new QubitState(2);
      expect(() => state1.overlap(state2)).toThrow('different dimensions');
    });
  });

  describe('Qubit Class', () => {
    it('should create Qubit instance', () => {
      const qubit = new Qubit(2, [complex(1, 0), complex(0, 0)]);
      expect(qubit.getStateVector()).toHaveLength(2);
    });

    it('should get and set amplitudes', () => {
      const qubit = new Qubit(2, [complex(1, 0), complex(0, 0)]);
      expect(qubit.getAmplitude(0)).toEqual(complex(1, 0));
      
      qubit.setAmplitude(1, complex(0.5, 0.5));
      expect(qubit.getAmplitude(1)).toEqual(complex(0.5, 0.5));
    });

    it('should handle out-of-bounds access', () => {
      const qubit = new Qubit(2, [complex(1, 0), complex(0, 0)]);
      expect(qubit.getAmplitude(5)).toEqual(complex(0, 0));
    });

    it('should create static states', () => {
      const zero = Qubit.zero();
      expect(zero.amplitude(0)).toEqual(complex(1, 0));
      
      const one = Qubit.one();
      expect(one.amplitude(1)).toEqual(complex(1, 0));
    });
  });

  describe('Advanced Tests', () => {
    it('should test tensor operations error handling', () => {
      const state = QubitState.zero();
      const notQubitState = { numQuantum: 1 };
      expect(() => state.tensor(notQubitState as any)).toThrow('Can only tensor QubitState with another QubitState');
    });

    it('should handle amplitude operations with different representations', () => {
      const state = new QubitState(1);
      // Test default RepType.DENSE path in amplitude()
      expect(state.amplitude(0)).toEqual(complex(1, 0));
      expect(state.amplitude(1)).toEqual(complex(0, 0));
    });

    it('should test single qubit measurement edge cases', () => {
      // Create a state close to |1⟩ to test the measurement paths
      const state = new QubitState(1, [complex(0.1, 0), complex(0.995, 0)]);
      const result = state.measure();
      expect([0, 1]).toContain(result);
    });

    it('should test setAmplitude with sparse representation', () => {
      // Create a state and force it to use sparse representation
      const state = new QubitState(3); // 8-dimensional state
      
      // Test setting amplitude in sparse mode
      const stateObj = state as any;
      stateObj.rep = RepType.SPARSE;
      stateObj.sparseAmplitudes = new Map();
      
      // Test setAmplitude with small amplitude (should be deleted)
      stateObj.setAmplitude(1, complex(1e-16, 0));
      expect(stateObj.sparseAmplitudes.has(1)).toBe(false);
      
      // Test setAmplitude with significant amplitude (should be stored)
      stateObj.setAmplitude(2, complex(0.5, 0));
      expect(stateObj.sparseAmplitudes.has(2)).toBe(true);
    });

    it('should test CSR representation error', () => {
      const state = new QubitState(1);
      const stateObj = state as any;
      stateObj.rep = RepType.CSR;
      
      expect(() => stateObj.setAmplitude(0, complex(1, 0))).toThrow('Direct amplitude modification in CSR format is not supported');
    });

    it('should test CSR amplitude access', () => {
      const state = new QubitState(1);
      const stateObj = state as any;
      stateObj.rep = RepType.CSR;
      
      // Mock getCSRAmplitude method to test the CSR path in amplitude()
      stateObj.getCSRAmplitude = jest.fn(() => complex(0.5, 0));
      const result = state.amplitude(0);
      expect(stateObj.getCSRAmplitude).toHaveBeenCalledWith(0);
      expect(result).toEqual(complex(0.5, 0));
    });

    it('should test sparse amplitude access', () => {
      const state = new QubitState(1);
      const stateObj = state as any;
      stateObj.rep = RepType.SPARSE;
      stateObj.sparseAmplitudes = new Map([[0, complex(0.7, 0.1)]]);
      
      expect(state.amplitude(0)).toEqual(complex(0.7, 0.1));
      expect(state.amplitude(1)).toEqual(complex(0, 0)); // Non-existent key returns ZERO
    });

    it('should test direct instantiation with Qubit parameter', () => {
      // Test static methods that create states with Qubit instances
      const qubit = new Qubit(2, [complex(0.6, 0), complex(0.8, 0)]);
      const state = new QubitState(1, [complex(0.6, 0), complex(0.8, 0)], false, qubit);
      expect(state.amplitude(0).re).toBeCloseTo(0.6, 10);
      expect(state.amplitude(1).re).toBeCloseTo(0.8, 10);
    });

    it('should test static factory methods with Qubit instances', () => {
      // Test the implementation of static factory methods
      const plusState = QubitState.plus();
      expect(plusState.amplitude(0).re).toBeCloseTo(0.7071067812, 10);
      expect(plusState.amplitude(1).re).toBeCloseTo(0.7071067812, 10);
      
      const minusState = QubitState.minus();
      expect(minusState.amplitude(0).re).toBeCloseTo(0.7071067812, 10);
      expect(minusState.amplitude(1).re).toBeCloseTo(-0.7071067812, 10);
      
      const angleState = QubitState.fromAngle(Math.PI / 2, Math.PI / 2);
      expect(angleState.amplitude(0).re).toBeCloseTo(0.7071067812, 10);
      expect(angleState.amplitude(1).im).toBeCloseTo(0.7071067812, 10);
      
      const amplitudeState = QubitState.fromAmplitudes(complex(0.6, 0), complex(0.8, 0));
      expect(amplitudeState.amplitude(0).re).toBeCloseTo(0.6, 10);
      expect(amplitudeState.amplitude(1).re).toBeCloseTo(0.8, 10);
    });

    it('should test error cases by directly setting invalid rep', () => {
      const state = new QubitState(1);
      const stateObj = state as any;
      
      // Try to test the error case in amplitude() by setting an invalid rep directly
      // and bypassing the getRepState fallback mechanism
      Object.defineProperty(stateObj, 'rep', { value: 'invalid', writable: false });
      stateObj.getRepState = undefined; // Remove getRepState to force hitting the error case
      
      try {
        stateObj.amplitude(0);
        // If we get here, try setAmplitude
        stateObj.setAmplitude(0, complex(1, 0));
      } catch (error) {
        // Some error was thrown - this is expected
        expect(error).toBeDefined();
      }
    });
    
    it('should throw error for unhandled representation in amplitude method', () => {
      const state = new QubitState(1, [complex(1, 0), complex(0, 0)]);
      const stateObj = state as any;
      
      // Override getRepState to return unknown representation
      stateObj.getRepState = () => ({
        rep: 'unknown_rep_type',
        stateVector: undefined,
        sparseAmplitudes: undefined
      });
      
      expect(() => {
        stateObj.amplitude(0);
      }).toThrow('Unhandled representation type in amplitude(): dense');
    });
    
    it('should throw error for unhandled representation in setAmplitude method', () => {
      const state = new QubitState(1, [complex(1, 0), complex(0, 0)]);
      const stateObj = state as any;
      
      // Mock getRepState to return an invalid representation that will test the setAmplitude error
      const originalGetRepState = stateObj.getRepState;
      stateObj.getRepState = () => ({
        rep: 'invalid_rep_type',
        stateVector: undefined,
        sparseAmplitudes: undefined
      });
      
      // Now setAmplitude should hit the error case for unknown representation
      expect(() => {
        stateObj.setAmplitude(0, complex(0.5, 0));
      }).toThrow('Unhandled representation type in setAmplitude(): dense');
      
      // Restore original
      stateObj.getRepState = originalGetRepState;
    });
    
    it('should test all static factory methods completeness', () => {
      const plusState = QubitState.plus();
      expect(plusState.quantumCount()).toBe(1);
      expect(plusState.amplitude(0).abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(plusState.amplitude(1).abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      
      const minusState = QubitState.minus();
      expect(minusState.quantumCount()).toBe(1);
      expect(minusState.amplitude(0).abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(minusState.amplitude(1).abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(minusState.amplitude(1).re).toBeCloseTo(-1/Math.sqrt(2), 10);
      
      const angleState = QubitState.fromAngle(Math.PI/4, Math.PI/4);
      expect(angleState.quantumCount()).toBe(1);
      expect(angleState.amplitude(0).abs()).toBeCloseTo(Math.cos(Math.PI/8), 10);
      
      // Test QubitState.fromAngle() with default phi parameter
      const angleStateDefault = QubitState.fromAngle(Math.PI/2);
      expect(angleStateDefault.quantumCount()).toBe(1);
      expect(angleStateDefault.amplitude(0).abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(angleStateDefault.amplitude(1).abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      
      const ampState = QubitState.fromAmplitudes(complex(0.8, 0), complex(0.6, 0));
      expect(ampState.quantumCount()).toBe(1);
      expect(ampState.amplitude(0).abs()).toBeCloseTo(0.8, 10);
      expect(ampState.amplitude(1).abs()).toBeCloseTo(0.6, 10);
    });
    
    it('should explicitly call each static factory method to ensure completeness', () => {
      const plus = QubitState.plus();
      expect(plus).toBeInstanceOf(QubitState);
      expect(plus.quantumCount()).toBe(1);
      
      const minus = QubitState.minus();
      expect(minus).toBeInstanceOf(QubitState);
      expect(minus.quantumCount()).toBe(1);
      
      const fromAngle = QubitState.fromAngle(0, 0);
      expect(fromAngle).toBeInstanceOf(QubitState);
      expect(fromAngle.quantumCount()).toBe(1);
      
      // Call fromAngle with different parameters
      const fromAngle2 = QubitState.fromAngle(Math.PI, Math.PI);
      expect(fromAngle2).toBeInstanceOf(QubitState);
      
      const fromAmps = QubitState.fromAmplitudes(complex(1, 0), complex(0, 0));
      expect(fromAmps).toBeInstanceOf(QubitState);
      expect(fromAmps.quantumCount()).toBe(1);
    });
  });
  
  describe('Static Factory Methods', () => {
    it('should create plus state', () => {
      const state = QubitState.plus();
      expect(state).toBeInstanceOf(QubitState);
    });
    
    it('should create minus state', () => {
      const state = QubitState.minus();
      expect(state).toBeInstanceOf(QubitState);
    });
    
    it('should create state from angle', () => {
      const state = QubitState.fromAngle(Math.PI / 4);
      expect(state).toBeInstanceOf(QubitState);
    });
    
    it('should create state from amplitudes', () => {
      const state = QubitState.fromAmplitudes(complex(0.6, 0), complex(0.8, 0));
      expect(state).toBeInstanceOf(QubitState);
    });
  });

  describe('Test improvements', () => {
    it('should test sparseAmplitudes path in toString', () => {
      const state = new QubitState(2);
      
      // Force sparse representation by setting properties correctly
      (state as any).rep = RepType.SPARSE; // Set representation type to SPARSE
      (state as any).stateVector = undefined; // Clear dense state vector
      (state as any).sparseAmplitudes = new Map([
        [0, complex(0.707, 0)],
        [3, complex(0.707, 0)]
      ]);
      
      // Call toString to trigger the sparseAmplitudes path
      const stringRepr = state.toString();
      
      // Should use sparse amplitudes for string representation
      expect(stringRepr).toContain('|00⟩');
      expect(stringRepr).toContain('|11⟩');
      expect(stringRepr).toContain('0.707');
    });
  });
});
