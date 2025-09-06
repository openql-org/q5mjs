// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { MeasureGate, MeasureZGate, MeasureXGate, MeasureYGate, MeasurePhaseGate, Mz, Mx, My, Mp } from '@/core/MeasureGates';
import { QubitState } from '@/core/QubitState';
import { Q5mObserver } from '@/core/Q5mObserver';
import { complex, ONE, ZERO } from '@/math/complex';

describe('MeasureGates', () => {
  describe('MeasureGate Factory', () => {
    it('should create Z-basis measurement gate', () => {
      const mz = Mz();
      
      expect(mz.name).toBe('Mz');
      expect(mz.size).toBe(2);
      expect(mz.matrix).toBeDefined();
      expect(mz.matrix[0][0]).toEqual(ONE);
      expect(mz.matrix[0][1]).toEqual(ZERO);
      expect(mz.matrix[1][0]).toEqual(ZERO);
      expect(mz.matrix[1][1]).toEqual(ONE);
    });

    it('should create X-basis measurement gate', () => {
      const mx = Mx();
      
      expect(mx.name).toBe('Mx');
      expect(mx.size).toBe(2);
      expect(mx.matrix).toBeDefined();
    });

    it('should create Y-basis measurement gate', () => {
      const my = My();
      
      expect(my.name).toBe('My');
      expect(my.size).toBe(2);
      expect(my.matrix).toBeDefined();
    });

    it('should create phase measurement gate', () => {
      const mp = Mp(Math.PI / 4, Math.PI / 2);
      
      expect(mp.name).toContain('Mp');
      expect(mp.size).toBe(2);
      expect(mp.matrix).toBeDefined();
    });
  });

  describe('Z-basis Measurement', () => {
    it('should measure |0⟩ state in Z basis', () => {
      const mz = Mz();
      const state = QubitState.zero();
      
      const result = mz.measure(state, 0);
      
      expect(result.outcome).toBe(0);
      expect(result.probability).toBeCloseTo(1, 10);
      expect(result.measureIndex).toBe(0);
      expect(result.collapsedState).toBeDefined();
    });

    it('should measure |1⟩ state in Z basis', () => {
      const mz = Mz();
      const state = QubitState.one();
      
      const result = mz.measure(state, 0);
      
      expect(result.outcome).toBe(1);
      expect(result.probability).toBeCloseTo(1, 10);
      expect(result.measureIndex).toBe(0);
    });

    it('should measure superposition state in Z basis', () => {
      const mz = Mz();
      const state = QubitState.plus(); // |+⟩ = (|0⟩ + |1⟩)/√2
      
      const result = mz.measure(state, 0);
      
      expect([0, 1]).toContain(result.outcome);
      expect(result.probability).toBeCloseTo(0.5, 5); // Should be approximately 0.5
      expect(result.measureIndex).toBe(0);
    });

    it('should calculate probabilities for Z measurement', () => {
      const mz = Mz();
      const state = QubitState.plus();
      
      const probs = mz.probabilities(state, 0);
      
      expect(probs.prob0).toBeCloseTo(0.5, 10);
      expect(probs.prob1).toBeCloseTo(0.5, 10);
    });
  });

  describe('X-basis Measurement', () => {
    it('should measure |+⟩ state in X basis', () => {
      const mx = Mx();
      const state = QubitState.plus(); // |+⟩ is |0⟩ in X basis
      
      const result = mx.measure(state, 0);
      
      expect(result.outcome).toBe(0);
      expect(result.probability).toBeCloseTo(1, 10);
    });

    it('should measure |-⟩ state in X basis', () => {
      const mx = Mx();
      const state = QubitState.minus(); // |-⟩ is |1⟩ in X basis
      
      const result = mx.measure(state, 0);
      
      expect(result.outcome).toBe(1);
      expect(result.probability).toBeCloseTo(1, 10);
    });

    it('should measure |0⟩ state in X basis', () => {
      const mx = Mx();
      const state = QubitState.zero();
      
      const result = mx.measure(state, 0);
      
      expect([0, 1]).toContain(result.outcome);
      expect(result.probability).toBeCloseTo(0.5, 5);
    });

    it('should calculate probabilities for X measurement', () => {
      const mx = Mx();
      const state = QubitState.zero();
      
      const probs = mx.probabilities(state, 0);
      
      expect(probs.prob0).toBeCloseTo(0.5, 10);
      expect(probs.prob1).toBeCloseTo(0.5, 10);
    });
  });

  describe('Y-basis Measurement', () => {
    it('should measure state in Y basis', () => {
      const my = My();
      const state = new QubitState(1, [
        complex(1/Math.sqrt(2), 0),
        complex(0, 1/Math.sqrt(2))
      ]); // |i+⟩ = (|0⟩ + i|1⟩)/√2
      
      const result = my.measure(state, 0);
      
      expect([0, 1]).toContain(result.outcome);
      expect(result.probability).toBeGreaterThan(0);
    });

    it('should calculate probabilities for Y measurement', () => {
      const my = My();
      const state = QubitState.zero();
      
      const probs = my.probabilities(state, 0);
      
      expect(probs.prob0).toBeCloseTo(0.5, 10);
      expect(probs.prob1).toBeCloseTo(0.5, 10);
    });
  });

  describe('Phase Measurement', () => {
    it('should measure with zero phase angles', () => {
      const mp = Mp(0, 0);
      const state = QubitState.zero();
      
      const result = mp.measure(state, 0);
      
      expect(result.outcome).toBe(0);
      expect(result.probability).toBeCloseTo(1, 10);
    });

    it('should measure with non-zero phase angles', () => {
      const mp = Mp(Math.PI / 4, Math.PI / 2);
      const state = QubitState.zero();
      
      const result = mp.measure(state, 0);
      
      expect([0, 1]).toContain(result.outcome);
      expect(result.probability).toBeGreaterThan(0);
    });

    it('should get phase angles', () => {
      const theta = Math.PI / 3;
      const phi = Math.PI / 6;
      const mp = Mp(theta, phi);
      
      const angles = mp.getAngles();
      
      expect(angles.theta).toBeCloseTo(theta, 10);
      expect(angles.phi).toBeCloseTo(phi, 10);
    });

    it('should have descriptive name with angles', () => {
      const mp = Mp(Math.PI / 4, Math.PI / 2);
      
      expect(mp.name).toMatch(/Mp\(.*θ=.*φ=.*\)/);
      expect(mp.name).toContain('0.785'); // π/4 ≈ 0.785
      expect(mp.name).toContain('1.571'); // π/2 ≈ 1.571
    });

    it('should accept custom name', () => {
      const customName = 'CustomPhase';
      const mp = Mp(Math.PI / 4, Math.PI / 2, customName);
      
      expect(mp.name).toBe(customName);
    });
  });

  describe('Multi-qubit Measurements', () => {
    it('should measure specific qubit in multi-qubit state', () => {
      const mz = Mz();
      const state = new QubitState(2, [
        complex(0.707, 0), // |00⟩
        complex(0),        // |01⟩
        complex(0.707, 0), // |10⟩
        complex(0)         // |11⟩
      ]);
      
      const result0 = mz.measure(state, 0);
      const result1 = mz.measure(state, 1);
      
      expect([0, 1]).toContain(result0.outcome);
      expect([0, 1]).toContain(result1.outcome);
      expect(result0.measureIndex).toBe(0);
      expect(result1.measureIndex).toBe(1);
    });

    it('should handle measurements on different qubits', () => {
      const mx = Mx();
      const my = My();
      const mz = Mz();
      
      const state = new QubitState(3);
      
      const results = [
        mx.measure(state, 0),
        my.measure(state, 1),
        mz.measure(state, 2)
      ];
      
      results.forEach((result, index) => {
        expect([0, 1]).toContain(result.outcome);
        expect(result.measureIndex).toBe(index);
        expect(result.probability).toBeGreaterThan(0);
      });
    });
  });

  describe('Measurement Results', () => {
    it('should return proper measurement result structure', () => {
      const mz = Mz();
      const state = QubitState.zero();
      
      const result = mz.measure(state, 0);
      
      expect(result).toHaveProperty('outcome');
      expect(result).toHaveProperty('probability');
      expect(result).toHaveProperty('measureIndex');
      expect(result).toHaveProperty('collapsedState');
      
      expect(typeof result.outcome).toBe('number');
      expect(typeof result.probability).toBe('number');
      expect(typeof result.measureIndex).toBe('number');
      expect(result.collapsedState).toBeDefined();
    });

    it('should collapse state after measurement', () => {
      const mz = Mz();
      const state = QubitState.plus();
      
      const result = mz.measure(state, 0);
      const collapsedAmplitudes = result.collapsedState.amplitudes();
      
      // After measurement, state should be in definite |0⟩ or |1⟩
      if (result.outcome === 0) {
        expect(collapsedAmplitudes[0].abs()).toBeCloseTo(1, 10);
        expect(collapsedAmplitudes[1].abs()).toBeCloseTo(0, 10);
      } else {
        expect(collapsedAmplitudes[0].abs()).toBeCloseTo(0, 10);
        expect(collapsedAmplitudes[1].abs()).toBeCloseTo(1, 10);
      }
    });

    it('should maintain measurement index', () => {
      const mz = Mz();
      const state = new QubitState(3);
      
      [0, 1, 2].forEach(index => {
        const result = mz.measure(state, index);
        expect(result.measureIndex).toBe(index);
      });
    });
  });

  describe('Probability Calculations', () => {
    it('should calculate probabilities that sum to 1', () => {
      const mz = Mz();
      const states = [
        QubitState.zero(),
        QubitState.one(),
        QubitState.plus(),
        QubitState.minus()
      ];
      
      states.forEach(state => {
        const probs = mz.probabilities(state, 0);
        expect(probs.prob0 + probs.prob1).toBeCloseTo(1, 10);
      });
    });

    it('should calculate probabilities for different bases', () => {
      const mx = Mx();
      const my = My();
      const mz = Mz();
      const state = QubitState.zero();
      
      const probsX = mx.probabilities(state, 0);
      const probsY = my.probabilities(state, 0);
      const probsZ = mz.probabilities(state, 0);
      
      // Z measurement of |0⟩ should be certain
      expect(probsZ.prob0).toBeCloseTo(1, 10);
      expect(probsZ.prob1).toBeCloseTo(0, 10);
      
      // X and Y measurements of |0⟩ should be random
      expect(probsX.prob0).toBeCloseTo(0.5, 10);
      expect(probsX.prob1).toBeCloseTo(0.5, 10);
      expect(probsY.prob0).toBeCloseTo(0.5, 10);
      expect(probsY.prob1).toBeCloseTo(0.5, 10);
    });
  });

  describe('Cache Management', () => {
    it('should have clearCache method', () => {
      const mz = Mz();
      
      expect(typeof mz.clearCache).toBe('function');
      expect(() => mz.clearCache()).not.toThrow();
    });

    it('should clear cache without affecting functionality', () => {
      const mz = Mz();
      const state = QubitState.plus();
      
      const result1 = mz.measure(state, 0);
      mz.clearCache();
      const result2 = mz.measure(state, 0);
      
      expect([0, 1]).toContain(result1.outcome);
      expect([0, 1]).toContain(result2.outcome);
    });
  });

  describe('Integration with Q5mObserver', () => {
    it('should delegate to Q5mObserver for measurements', () => {
      const mz = Mz();
      const state = QubitState.zero();
      
      // Spy on Q5mObserver.measure to ensure it's called
      const measureSpy = jest.spyOn(Q5mObserver, 'measure');
      
      mz.measure(state, 0);
      
      expect(measureSpy).toHaveBeenCalledWith(state, 0, expect.any(String));
      
      measureSpy.mockRestore();
    });

    it('should delegate to Q5mObserver for probabilities', () => {
      const mz = Mz();
      const state = QubitState.zero();
      
      // Spy on Q5mObserver.probabilities to ensure it's called
      const probsSpy = jest.spyOn(Q5mObserver, 'probabilities');
      
      mz.probabilities(state, 0);
      
      expect(probsSpy).toHaveBeenCalledWith(state, 0, expect.any(String));
      
      probsSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid measurement index', () => {
      const mz = Mz();
      const state = QubitState.zero();
      
      expect(() => mz.measure(state, -1)).toThrow();
      expect(() => mz.measure(state, 1)).toThrow(); // Out of range for single qubit
    });

    it('should handle invalid state', () => {
      const mz = Mz();
      
      expect(() => mz.measure(null as any, 0)).toThrow();
      expect(() => mz.measure(undefined as any, 0)).toThrow();
    });
  });
});