// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import {
  MultiQubitGate,
  GlobalPhaseGate,
  MultiHadamardGate,
  EE,
  HH,
  createGlobalPhase,
  createMultiHadamard,
} from '@/core/MultiQubitGates';
import { QubitState } from '@/core/QubitState';
import { complex, ONE, ZERO } from '@/math/complex';
import type { Unitary } from '@/math/math-utils';

// Create a concrete implementation for testing MultiQubitGate
class TestMultiQubitGate extends MultiQubitGate {
  readonly name = 'TestMQG';
  readonly matrix: Unitary;

  constructor(numQubits: number) {
    super(numQubits);
    
    // Create identity matrix for testing
    const size = this.size;
    this.matrix = Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => (i === j ? ONE : ZERO))
    );
  }
}

describe('MultiQubitGates', () => {
  describe('MultiQubitGate Base Class', () => {
    it('should create gate with correct number of qubits', () => {
      const gate = new TestMultiQubitGate(3);
      expect(gate.size).toBe(8); // 2^3
    });

    it('should throw error for invalid number of qubits', () => {
      expect(() => new TestMultiQubitGate(0)).toThrow('Number of targets must be at least 1');
      expect(() => new TestMultiQubitGate(-1)).toThrow('Number of targets must be at least 1');
    });

    it('should calculate correct matrix size for different qubit counts', () => {
      const testCases = [
        { qubits: 1, expectedSize: 2 },
        { qubits: 2, expectedSize: 4 },
        { qubits: 3, expectedSize: 8 },
        { qubits: 4, expectedSize: 16 },
        { qubits: 5, expectedSize: 32 },
      ];

      testCases.forEach(({ qubits, expectedSize }) => {
        const gate = new TestMultiQubitGate(qubits);
        expect(gate.size).toBe(expectedSize);
        expect(gate.matrix).toHaveLength(expectedSize);
        expect(gate.matrix[0]).toHaveLength(expectedSize);
      });
    });

    it('should handle large number of qubits', () => {
      const gate = new TestMultiQubitGate(10);
      expect(gate.size).toBe(1024); // 2^10
    });

    it('should have correct name', () => {
      const gate = new TestMultiQubitGate(2);
      expect(gate.name).toBe('TestMQG');
    });
  });

  describe('GlobalPhaseGate', () => {
    it('should create gate with correct name and properties', () => {
      const gate = new GlobalPhaseGate(2, Math.PI / 4);
      expect(gate.name).toBe('E');
      expect(gate.size).toBe(4);
      expect(gate.getPhase()).toBe(Math.PI / 4);
    });

    it('should create gate with custom name', () => {
      const gate = new GlobalPhaseGate(2, Math.PI / 2, 'CustomPhase');
      expect(gate.name).toBe('CustomPhase');
    });

    it('should have diagonal matrix with phase factors', () => {
      const phase = Math.PI / 3;
      const gate = new GlobalPhaseGate(2, phase);
      
      const expectedPhase = complex(Math.cos(phase), Math.sin(phase));
      
      // Check diagonal elements
      for (let i = 0; i < gate.size; i++) {
        expect(gate.matrix[i][i].re).toBeCloseTo(expectedPhase.re, 10);
        expect(gate.matrix[i][i].im).toBeCloseTo(expectedPhase.im, 10);
      }
      
      // Check off-diagonal elements are zero
      for (let i = 0; i < gate.size; i++) {
        for (let j = 0; j < gate.size; j++) {
          if (i !== j) {
            expect(gate.matrix[i][j].re).toBeCloseTo(0, 10);
            expect(gate.matrix[i][j].im).toBeCloseTo(0, 10);
          }
        }
      }
    });

    it('should apply uniform phase to all amplitudes', () => {
      const phase = Math.PI / 6;
      const gate = new GlobalPhaseGate(2, phase);
      const state = new QubitState(2, [
        complex(0.5, 0),
        complex(0.5, 0),
        complex(0.5, 0),
        complex(0.5, 0)
      ]);
      
      const result = gate.applyTo(state);
      const amplitudes = result.amplitudes();
      
      const expectedPhase = complex(Math.cos(phase), Math.sin(phase));
      const expectedAmp = complex(0.5, 0).mul(expectedPhase);
      
      amplitudes.forEach(amp => {
        expect(amp.re).toBeCloseTo(expectedAmp.re, 10);
        expect(amp.im).toBeCloseTo(expectedAmp.im, 10);
      });
    });

    it('should behave as identity for phase 0', () => {
      const gate = new GlobalPhaseGate(2, 0);
      const state = new QubitState(2);
      
      const result = gate.applyTo(state);
      const originalAmps = state.amplitudes();
      const resultAmps = result.amplitudes();
      
      originalAmps.forEach((amp, i) => {
        expect(resultAmps[i].re).toBeCloseTo(amp.re, 10);
        expect(resultAmps[i].im).toBeCloseTo(amp.im, 10);
      });
    });

    it('should handle phase π (negative identity)', () => {
      const gate = new GlobalPhaseGate(2, Math.PI);
      const state = new QubitState(2, [ONE, ZERO, ZERO, ZERO]);
      
      const result = gate.applyTo(state);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(-1, 10);
      expect(amplitudes[0].im).toBeCloseTo(0, 10);
      expect(amplitudes[1].re).toBeCloseTo(0, 10);
      expect(amplitudes[2].re).toBeCloseTo(0, 10);
      expect(amplitudes[3].re).toBeCloseTo(0, 10);
    });

    it('should handle phase 2π (full cycle)', () => {
      const gate = new GlobalPhaseGate(2, 2 * Math.PI);
      const state = new QubitState(2);
      
      const result = gate.applyTo(state);
      const originalAmps = state.amplitudes();
      const resultAmps = result.amplitudes();
      
      originalAmps.forEach((amp, i) => {
        expect(resultAmps[i].re).toBeCloseTo(amp.re, 10);
        expect(resultAmps[i].im).toBeCloseTo(amp.im, 10);
      });
    });

    it('should work with single qubit', () => {
      const gate = new GlobalPhaseGate(1, Math.PI / 4);
      expect(gate.size).toBe(2);
      expect(gate.matrix).toHaveLength(2);
    });

    it('should work with many qubits', () => {
      const gate = new GlobalPhaseGate(5, Math.PI / 8);
      expect(gate.size).toBe(32);
      expect(gate.getPhase()).toBe(Math.PI / 8);
    });

    it('should handle negative phases', () => {
      const gate = new GlobalPhaseGate(2, -Math.PI / 4);
      expect(gate.getPhase()).toBe(-Math.PI / 4);
      
      const expectedPhase = complex(Math.cos(-Math.PI / 4), Math.sin(-Math.PI / 4));
      expect(gate.matrix[0][0].re).toBeCloseTo(expectedPhase.re, 10);
      expect(gate.matrix[0][0].im).toBeCloseTo(expectedPhase.im, 10);
    });

    describe('Static Factory Methods', () => {
      it('should create gate from angle', () => {
        const angle = Math.PI / 5;
        const gate = GlobalPhaseGate.fromAngle(3, angle, 'AngleGate');
        
        expect(gate.name).toBe('AngleGate');
        expect(gate.getPhase()).toBe(angle);
        expect(gate.size).toBe(8);
      });

      it('should create gate from pi multiple', () => {
        const gate = GlobalPhaseGate.fromPiMultiple(2, 0.5);
        
        expect(gate.getPhase()).toBe(Math.PI / 2);
        expect(gate.size).toBe(4);
      });

      it('should create gate from pi multiple with custom name', () => {
        const gate = GlobalPhaseGate.fromPiMultiple(3, 1.5, 'PiGate');
        
        expect(gate.name).toBe('PiGate');
        expect(gate.getPhase()).toBe(1.5 * Math.PI);
      });

      it('should handle zero pi multiple', () => {
        const gate = GlobalPhaseGate.fromPiMultiple(2, 0);
        expect(gate.getPhase()).toBe(0);
      });

      it('should handle negative pi multiple', () => {
        const gate = GlobalPhaseGate.fromPiMultiple(2, -0.25);
        expect(gate.getPhase()).toBe(-Math.PI / 4);
      });
    });
  });

  describe('MultiHadamardGate', () => {
    it('should create gate with correct properties', () => {
      const gate = new MultiHadamardGate(3, [0, 2]);
      expect(gate.name).toBe('HH');
      expect(gate.size).toBe(8);
      expect(gate.getTargetQubits()).toEqual([0, 2]);
    });

    it('should create gate with custom name', () => {
      const gate = new MultiHadamardGate(2, [0, 1], 'CustomHH');
      expect(gate.name).toBe('CustomHH');
    });

    it('should throw error for empty target list', () => {
      expect(() => new MultiHadamardGate(3, [])).toThrow('At least one target qubit must be specified');
    });

    it('should throw error for out-of-range qubit indices', () => {
      expect(() => new MultiHadamardGate(3, [0, 1, 3])).toThrow('Qubit index 3 out of range');
      expect(() => new MultiHadamardGate(2, [-1])).toThrow('Qubit index -1 out of range');
    });

    it('should remove duplicate target qubits and sort them', () => {
      const gate = new MultiHadamardGate(4, [2, 0, 2, 1, 0]);
      expect(gate.getTargetQubits()).toEqual([0, 1, 2]);
    });

    it('should apply Hadamard to single target qubit', () => {
      const gate = new MultiHadamardGate(2, [0]);
      const state = new QubitState(2, [ONE, ZERO, ZERO, ZERO]); // |00⟩
      
      const result = gate.applyTo(state);
      const amplitudes = result.amplitudes();
      
      // Should create (|00⟩ + |10⟩)/√2
      expect(amplitudes[0].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[2].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[3].abs()).toBeCloseTo(0, 10);
    });

    it('should apply Hadamard to multiple target qubits', () => {
      const gate = new MultiHadamardGate(2, [0, 1]);
      const state = new QubitState(2, [ONE, ZERO, ZERO, ZERO]); // |00⟩
      
      const result = gate.applyTo(state);
      const amplitudes = result.amplitudes();
      
      // Should create (|00⟩ + |01⟩ + |10⟩ + |11⟩)/2
      amplitudes.forEach(amp => {
        expect(amp.abs()).toBeCloseTo(0.5, 10);
      });
    });

    it('should leave non-target qubits unchanged', () => {
      const gate = new MultiHadamardGate(3, [1]);
      const state = new QubitState(3, [ONE, ZERO, ZERO, ZERO, ZERO, ZERO, ZERO, ZERO]); // |000⟩
      
      const result = gate.applyTo(state);
      const amplitudes = result.amplitudes();
      
      // Should create (|000⟩ + |010⟩)/√2
      expect(amplitudes[0].abs()).toBeCloseTo(1/Math.sqrt(2), 10); // |000⟩
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);               // |001⟩
      expect(amplitudes[2].abs()).toBeCloseTo(1/Math.sqrt(2), 10); // |010⟩
      expect(amplitudes[3].abs()).toBeCloseTo(0, 10);               // |011⟩
      expect(amplitudes[4].abs()).toBeCloseTo(0, 10);               // |100⟩
      expect(amplitudes[5].abs()).toBeCloseTo(0, 10);               // |101⟩
      expect(amplitudes[6].abs()).toBeCloseTo(0, 10);               // |110⟩
      expect(amplitudes[7].abs()).toBeCloseTo(0, 10);               // |111⟩
    });

    it('should handle selective Hadamard application correctly', () => {
      const gate = new MultiHadamardGate(3, [0, 2]);
      const state = new QubitState(3, [ONE, ZERO, ZERO, ZERO, ZERO, ZERO, ZERO, ZERO]); // |000⟩
      
      const result = gate.applyTo(state);
      const amplitudes = result.amplitudes();
      
      // Should create (|000⟩ + |001⟩ + |100⟩ + |101⟩)/2
      expect(amplitudes[0].abs()).toBeCloseTo(0.5, 10); // |000⟩
      expect(amplitudes[1].abs()).toBeCloseTo(0.5, 10); // |001⟩
      expect(amplitudes[2].abs()).toBeCloseTo(0, 10);   // |010⟩
      expect(amplitudes[3].abs()).toBeCloseTo(0, 10);   // |011⟩
      expect(amplitudes[4].abs()).toBeCloseTo(0.5, 10); // |100⟩
      expect(amplitudes[5].abs()).toBeCloseTo(0.5, 10); // |101⟩
      expect(amplitudes[6].abs()).toBeCloseTo(0, 10);   // |110⟩
      expect(amplitudes[7].abs()).toBeCloseTo(0, 10);   // |111⟩
    });

    it('should be self-inverse', () => {
      const gate = new MultiHadamardGate(2, [0, 1]);
      const state = new QubitState(2);
      
      const first = gate.applyTo(state);
      const second = gate.applyTo(first);
      
      const originalAmps = state.amplitudes();
      const finalAmps = second.amplitudes();
      
      originalAmps.forEach((amp, i) => {
        expect(finalAmps[i].re).toBeCloseTo(amp.re, 10);
        expect(finalAmps[i].im).toBeCloseTo(amp.im, 10);
      });
    });

    it('should handle single qubit system', () => {
      const gate = new MultiHadamardGate(1, [0]);
      const state = new QubitState(1, [ONE, ZERO]);
      
      const result = gate.applyTo(state);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
    });

    it('should handle all qubits as targets', () => {
      const gate = new MultiHadamardGate(3, [0, 1, 2]);
      const state = new QubitState(3, [ONE, ZERO, ZERO, ZERO, ZERO, ZERO, ZERO, ZERO]);
      
      const result = gate.applyTo(state);
      const amplitudes = result.amplitudes();
      
      // Should create uniform superposition
      amplitudes.forEach(amp => {
        expect(amp.abs()).toBeCloseTo(1/(Math.sqrt(8)), 10);
      });
    });

    describe('Static Factory Methods', () => {
      it('should create gate on specific positions', () => {
        const gate = MultiHadamardGate.onPositions(4, [1, 3], 'PositionGate');
        
        expect(gate.name).toBe('PositionGate');
        expect(gate.getTargetQubits()).toEqual([1, 3]);
        expect(gate.size).toBe(16);
      });

      it('should create gate on all positions', () => {
        const gate = MultiHadamardGate.onAll(3, 'AllGate');
        
        expect(gate.name).toBe('AllGate');
        expect(gate.getTargetQubits()).toEqual([0, 1, 2]);
        expect(gate.size).toBe(8);
      });

      it('should create gate on all positions with default name', () => {
        const gate = MultiHadamardGate.onAll(2);
        
        expect(gate.name).toBe('HH');
        expect(gate.getTargetQubits()).toEqual([0, 1]);
      });
    });

    describe('Matrix Structure', () => {
      it('should have correct matrix size for different qubit counts', () => {
        const testCases = [
          { qubits: 1, expectedSize: 2 },
          { qubits: 2, expectedSize: 4 },
          { qubits: 3, expectedSize: 8 },
        ];

        testCases.forEach(({ qubits, expectedSize }) => {
          const gate = new MultiHadamardGate(qubits, [0]);
          expect(gate.matrix).toHaveLength(expectedSize);
          expect(gate.matrix[0]).toHaveLength(expectedSize);
        });
      });

      it('should preserve matrix unitarity', () => {
        const gate = new MultiHadamardGate(2, [0, 1]);
        const state = new QubitState(2);
        
        const result = gate.applyTo(state);
        const originalNorm = state.amplitudes().reduce((sum, amp) => sum + amp.abs() * amp.abs(), 0);
        const resultNorm = result.amplitudes().reduce((sum, amp) => sum + amp.abs() * amp.abs(), 0);
        
        expect(resultNorm).toBeCloseTo(originalNorm, 10);
      });
    });
  });

  describe('Factory Functions', () => {
    it('should create GlobalPhaseGate with EE function', () => {
      const gate = EE(2, Math.PI / 3);
      
      expect(gate).toBeInstanceOf(GlobalPhaseGate);
      expect(gate.size).toBe(4);
      expect(gate.getPhase()).toBe(Math.PI / 3);
    });

    it('should create MultiHadamardGate with HH function', () => {
      const gate = HH(3, [0, 2]);
      
      expect(gate).toBeInstanceOf(MultiHadamardGate);
      expect(gate.size).toBe(8);
      expect(gate.getTargetQubits()).toEqual([0, 2]);
    });

    it('should create GlobalPhaseGate with createGlobalPhase', () => {
      const gate = createGlobalPhase(2, Math.PI / 4, 'CreatedPhase');
      
      expect(gate).toBeInstanceOf(GlobalPhaseGate);
      expect(gate.name).toBe('CreatedPhase');
      expect(gate.getPhase()).toBe(Math.PI / 4);
    });

    it('should create MultiHadamardGate with createMultiHadamard', () => {
      const gate = createMultiHadamard(4, [1, 3], 'CreatedHH');
      
      expect(gate).toBeInstanceOf(MultiHadamardGate);
      expect(gate.name).toBe('CreatedHH');
      expect(gate.getTargetQubits()).toEqual([1, 3]);
    });
  });

  describe('Edge Cases', () => {

    it('should handle very small phases', () => {
      const gate = new GlobalPhaseGate(2, 1e-10);
      const state = new QubitState(2);
      
      expect(() => gate.applyTo(state)).not.toThrow();
    });

    it('should handle very large phases', () => {
      const gate = new GlobalPhaseGate(2, 100 * Math.PI);
      const state = new QubitState(2);
      
      expect(() => gate.applyTo(state)).not.toThrow();
    });

    it('should handle single target in large system', () => {
      const gate = new MultiHadamardGate(5, [2]);
      
      expect(gate.getTargetQubits()).toEqual([2]);
      expect(gate.size).toBe(32);
    });

    it('should handle all targets in system', () => {
      const gate = new MultiHadamardGate(3, [0, 1, 2]);
      
      expect(gate.getTargetQubits()).toEqual([0, 1, 2]);
      expect(gate.size).toBe(8);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid constructor parameters', () => {
      expect(() => new GlobalPhaseGate(0, Math.PI)).toThrow();
      expect(() => new MultiHadamardGate(0, [0])).toThrow();
    });

    it('should handle NaN phases gracefully', () => {
      expect(() => new GlobalPhaseGate(2, NaN)).not.toThrow();
    });

    it('should handle Infinity phases gracefully', () => {
      expect(() => new GlobalPhaseGate(2, Infinity)).not.toThrow();
      expect(() => new GlobalPhaseGate(2, -Infinity)).not.toThrow();
    });

    it('should validate qubit indices strictly', () => {
      expect(() => new MultiHadamardGate(3, [0, 1, 3])).toThrow();
      expect(() => new MultiHadamardGate(2, [-1, 0])).toThrow();
    });
  });

  // Performance-intensive tests moved to tests/integration/core/MultiQubitGates.performance.test.ts

  describe('Integration Tests', () => {
    it('should work with QubitState correctly', () => {
      const phaseGate = new GlobalPhaseGate(2, Math.PI / 2);
      const hadamardGate = new MultiHadamardGate(2, [0, 1]);
      
      const state = new QubitState(2);
      const afterPhase = phaseGate.applyTo(state);
      const afterHadamard = hadamardGate.applyTo(afterPhase);
      
      expect(afterHadamard.quantumCount()).toBe(2);
      expect(afterHadamard.amplitudes()).toHaveLength(4);
    });

    it('should compose with other gates correctly', () => {
      const globalPhase = new GlobalPhaseGate(2, Math.PI);
      const multiHadamard = new MultiHadamardGate(2, [0]);
      
      const state = new QubitState(2);
      const step1 = multiHadamard.applyTo(state);
      const step2 = globalPhase.applyTo(step1);
      const composed = multiHadamard.applyTo(step2);
      
      // Should return to original state (with overall phase)
      const finalAmps = composed.amplitudes();
      const originalAmps = state.amplitudes();
      
      originalAmps.forEach((amp, i) => {
        expect(finalAmps[i].abs()).toBeCloseTo(amp.abs(), 10);
      });
    });
  });
});