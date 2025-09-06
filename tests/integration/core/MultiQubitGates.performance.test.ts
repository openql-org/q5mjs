// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

/**
 * Performance and edge case integration tests for MultiQubitGates
 * These tests were moved from unit tests due to their computational intensity
 */

import {
  MultiQubitGate,
  GlobalPhaseGate,
  MultiHadamardGate,
} from '../../../src/core/MultiQubitGates';
import { QubitState } from '../../../src/core/QubitState';
import { complex, ONE, ZERO } from '../../../src/math/complex';
import type { Unitary } from '../../../src/math/math-utils';

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

describe('MultiQubitGates Performance Integration Tests', () => {
  describe('Edge Cases - Large Systems', () => {
    it('should handle maximum reasonable number of qubits', () => {
      expect(() => new TestMultiQubitGate(10)).not.toThrow();
      expect(() => new GlobalPhaseGate(8, Math.PI)).not.toThrow();
      expect(() => new MultiHadamardGate(6, [0, 1, 2])).not.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    it('should handle moderate-sized systems efficiently', () => {
      const startTime = performance.now();
      const gate = new MultiHadamardGate(6, [0, 1, 2, 3, 4, 5]);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in < 1 second
      expect(gate.size).toBe(64);
    });

    it('should create matrices without memory issues for reasonable sizes', () => {
      expect(() => {
        const gate = new GlobalPhaseGate(8, Math.PI);
        expect(gate.matrix).toHaveLength(256);
      }).not.toThrow();
    });

    it('should handle large system applications efficiently', () => {
      const startTime = performance.now();
      
      // Create a 7-qubit system with multi-Hadamard gate
      const gate = new MultiHadamardGate(7, [0, 2, 4, 6]);
      const state = new QubitState(7);
      const result = gate.applyTo(state);
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(2000); // Should complete in < 2 seconds
      expect(result.quantumCount()).toBe(7);
      expect(result.amplitudes()).toHaveLength(128);
    });

    it('should handle repeated operations on large systems', () => {
      const gate = new GlobalPhaseGate(6, Math.PI / 4);
      const state = new QubitState(6);
      
      const startTime = performance.now();
      
      let currentState = state;
      for (let i = 0; i < 10; i++) {
        currentState = gate.applyTo(currentState);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(3000); // Should complete in < 3 seconds
      expect(currentState.quantumCount()).toBe(6);
    });
  });

  describe('Memory Usage - Large Matrices', () => {
    it('should handle 9-qubit systems without excessive memory usage', () => {
      const initialMemory = process.memoryUsage();
      
      const gate = new TestMultiQubitGate(9);
      expect(gate.size).toBe(512);
      
      const afterCreation = process.memoryUsage();
      const memoryIncrease = afterCreation.heapUsed - initialMemory.heapUsed;
      
      // Should not use more than 50MB for a 9-qubit gate
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should properly clean up after large computations', () => {
      const initialMemory = process.memoryUsage();
      
      // Create and destroy several large gates
      for (let i = 0; i < 5; i++) {
        const gate = new GlobalPhaseGate(8, Math.PI / (i + 1));
        const state = new QubitState(8);
        gate.applyTo(state);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Should not have significant memory leak
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe('Computational Complexity - Stress Tests', () => {
    it('should handle complex gate compositions on large systems', () => {
      const startTime = performance.now();
      
      const phaseGate = new GlobalPhaseGate(5, Math.PI / 3);
      const hadamardGate = new MultiHadamardGate(5, [1, 3]);
      const state = new QubitState(5);
      
      // Apply multiple gate operations
      let currentState = state;
      currentState = hadamardGate.applyTo(currentState);
      currentState = phaseGate.applyTo(currentState);
      currentState = hadamardGate.applyTo(currentState);
      currentState = phaseGate.applyTo(currentState);
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in < 5 seconds
      expect(currentState.quantumCount()).toBe(5);
    });

    it('should maintain precision in repeated large system operations', () => {
      const gate = new MultiHadamardGate(4, [0, 1, 2, 3]);
      const state = new QubitState(4);
      
      // Apply Hadamard twice (should return to original state)
      const first = gate.applyTo(state);
      const second = gate.applyTo(first);
      
      const originalAmps = state.amplitudes();
      const finalAmps = second.amplitudes();
      
      originalAmps.forEach((amp, i) => {
        expect(finalAmps[i].re).toBeCloseTo(amp.re, 8); // Lower precision for large systems
        expect(finalAmps[i].im).toBeCloseTo(amp.im, 8);
      });
    });
  });
});