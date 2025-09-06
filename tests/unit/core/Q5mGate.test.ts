// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { Q5mGate } from '@/core/Q5mGate';
import { QubitState } from '@/core/QubitState';
import { complex, ONE, ZERO } from '@/math/complex';
import type { Unitary } from '@/math/math-utils';

// Create concrete implementations for testing Q5mGate
class TestIdentityGate extends Q5mGate {
  readonly name = 'TestI';
  readonly matrix: Unitary = [
    [ONE, ZERO],
    [ZERO, ONE],
  ];
}

class TestPauliXGate extends Q5mGate {
  readonly name = 'TestX';
  readonly matrix: Unitary = [
    [ZERO, ONE],
    [ONE, ZERO],
  ];
}

class TestTwoQubitGate extends Q5mGate {
  readonly name = 'Test2Q';
  readonly matrix: Unitary = [
    [ONE, ZERO, ZERO, ZERO],
    [ZERO, ONE, ZERO, ZERO],
    [ZERO, ZERO, ZERO, ONE],
    [ZERO, ZERO, ONE, ZERO],
  ];
}

class TestThreeQubitGate extends Q5mGate {
  readonly name = 'Test3Q';
  readonly matrix: Unitary = [
    [ONE, ZERO, ZERO, ZERO, ZERO, ZERO, ZERO, ZERO],
    [ZERO, ONE, ZERO, ZERO, ZERO, ZERO, ZERO, ZERO],
    [ZERO, ZERO, ONE, ZERO, ZERO, ZERO, ZERO, ZERO],
    [ZERO, ZERO, ZERO, ONE, ZERO, ZERO, ZERO, ZERO],
    [ZERO, ZERO, ZERO, ZERO, ONE, ZERO, ZERO, ZERO],
    [ZERO, ZERO, ZERO, ZERO, ZERO, ONE, ZERO, ZERO],
    [ZERO, ZERO, ZERO, ZERO, ZERO, ZERO, ONE, ZERO],
    [ZERO, ZERO, ZERO, ZERO, ZERO, ZERO, ZERO, ONE],
  ];
}

class TestParametricGate extends Q5mGate {
  readonly name: string;
  readonly matrix: Unitary;

  constructor(public readonly angle: number) {
    super();
    this.name = `TestR(${angle.toFixed(3)})`;
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    this.matrix = [
      [complex(cos, 0), complex(-sin, 0)],
      [complex(sin, 0), complex(cos, 0)],
    ];
  }
}

class TestInvalidGate extends Q5mGate {
  readonly name = 'Invalid';
  readonly matrix: Unitary = []; // Invalid empty matrix
}

class TestNonSquareGate extends Q5mGate {
  readonly name = 'NonSquare';
  readonly matrix: Unitary = [
    [ONE, ZERO],
    [ZERO, ONE],
    [ONE, ZERO], // Extra row makes it non-square
  ] as any;
}

describe('Q5mGate', () => {
  describe('Basic Properties', () => {
    it('should have correct name property', () => {
      const identityGate = new TestIdentityGate();
      const xGate = new TestPauliXGate();
      
      expect(identityGate.name).toBe('TestI');
      expect(xGate.name).toBe('TestX');
    });

    it('should have correct matrix property', () => {
      const identityGate = new TestIdentityGate();
      
      expect(identityGate.matrix).toHaveLength(2);
      expect(identityGate.matrix[0]).toHaveLength(2);
      expect(identityGate.matrix[0][0]).toBe(ONE);
      expect(identityGate.matrix[0][1]).toBe(ZERO);
      expect(identityGate.matrix[1][0]).toBe(ZERO);
      expect(identityGate.matrix[1][1]).toBe(ONE);
    });

    it('should calculate correct size for different gates', () => {
      const singleQubit = new TestIdentityGate();
      const twoQubit = new TestTwoQubitGate();
      const threeQubit = new TestThreeQubitGate();
      
      expect(singleQubit.size).toBe(2);
      expect(twoQubit.size).toBe(4);
      expect(threeQubit.size).toBe(8);
    });

    it('should handle parametric gates', () => {
      const gate = new TestParametricGate(Math.PI / 4);
      
      expect(gate.name).toBe('TestR(0.785)');
      expect(gate.angle).toBe(Math.PI / 4);
      expect(gate.size).toBe(2);
    });
  });

  describe('toString Method', () => {
    it('should return gate name', () => {
      const identityGate = new TestIdentityGate();
      const xGate = new TestPauliXGate();
      
      expect(identityGate.toString()).toBe('TestI');
      expect(xGate.toString()).toBe('TestX');
    });

    it('should work with parametric gates', () => {
      const gate = new TestParametricGate(Math.PI / 2);
      expect(gate.toString()).toBe('TestR(1.571)');
    });

    it('should be usable in string interpolation', () => {
      const gate = new TestIdentityGate();
      const message = `Applying ${gate} gate`;
      expect(message).toBe('Applying TestI gate');
    });
  });

  describe('applyTo Method', () => {
    it('should apply single-qubit gate to single-qubit state', () => {
      const xGate = new TestPauliXGate();
      const zeroState = QubitState.zero();
      
      const result = xGate.applyTo(zeroState);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
    });

    it('should apply identity gate without changing state', () => {
      const identityGate = new TestIdentityGate();
      const state = new QubitState(1, [complex(0.6, 0.8), ZERO]);
      
      const result = identityGate.applyTo(state);
      const originalAmps = state.amplitudes();
      const resultAmps = result.amplitudes();
      
      originalAmps.forEach((amp, i) => {
        expect(resultAmps[i].re).toBeCloseTo(amp.re, 10);
        expect(resultAmps[i].im).toBeCloseTo(amp.im, 10);
      });
    });

    it('should apply two-qubit gate to two-qubit state', () => {
      const twoQubitGate = new TestTwoQubitGate();
      const state = new QubitState(2, [ZERO, ZERO, ONE, ZERO]); // |10⟩
      
      const result = twoQubitGate.applyTo(state);
      const amplitudes = result.amplitudes();
      
      // CNOT-like transformation: |10⟩ → |11⟩
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[2].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[3].abs()).toBeCloseTo(1, 10);
    });

    it('should throw error for mismatched dimensions', () => {
      const singleQubitGate = new TestIdentityGate();
      const twoQubitState = new QubitState(2);
      
      expect(() => singleQubitGate.applyTo(twoQubitState))
        .toThrow('Quantum state dimension 4 does not match gate size 2');
    });

    it('should throw error when single-qubit gate applied to two-qubit state', () => {
      const identityGate = new TestIdentityGate();
      const twoQubitState = new QubitState(2);
      
      expect(() => identityGate.applyTo(twoQubitState))
        .toThrow('does not match gate size');
    });

    it('should throw error when two-qubit gate applied to single-qubit state', () => {
      const twoQubitGate = new TestTwoQubitGate();
      const singleQubitState = new QubitState(1);
      
      expect(() => twoQubitGate.applyTo(singleQubitState))
        .toThrow('does not match gate size');
    });

    it('should work with parametric gates', () => {
      const rotationGate = new TestParametricGate(Math.PI);
      const zeroState = QubitState.zero();
      
      const result = rotationGate.applyTo(zeroState);
      const amplitudes = result.amplitudes();
      
      // π rotation should flip |0⟩ to |1⟩
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
    });

    it('should preserve quantum state normalization', () => {
      const xGate = new TestPauliXGate();
      const state = new QubitState(1, [complex(0.6, 0), complex(0, 0.8)]);
      
      const result = xGate.applyTo(state);
      const resultAmps = result.amplitudes();
      
      const norm = resultAmps.reduce((sum, amp) => sum + amp.abs() * amp.abs(), 0);
      expect(norm).toBeCloseTo(1, 10);
    });

    it('should handle complex superposition states', () => {
      const identityGate = new TestIdentityGate();
      const superposition = new QubitState(1, [
        complex(1/Math.sqrt(2), 0),
        complex(0, 1/Math.sqrt(2))
      ]);
      
      const result = identityGate.applyTo(superposition);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[0].im).toBeCloseTo(0, 10);
      expect(amplitudes[1].re).toBeCloseTo(0, 10);
      expect(amplitudes[1].im).toBeCloseTo(1/Math.sqrt(2), 10);
    });
  });

  describe('applyToStateVector Method', () => {
    it('should apply gate to state vector directly', () => {
      const xGate = new TestPauliXGate();
      const stateVector = [ONE, ZERO]; // |0⟩
      
      const result = xGate.applyToStateVector(stateVector);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(ZERO);
      expect(result[1]).toEqual(ONE);
    });

    it('should handle complex state vectors', () => {
      const identityGate = new TestIdentityGate();
      const stateVector = [complex(0.6, 0.8), ZERO];
      
      const result = identityGate.applyToStateVector(stateVector);
      
      expect(result[0].re).toBeCloseTo(0.6, 10);
      expect(result[0].im).toBeCloseTo(0.8, 10);
      expect(result[1]).toEqual(ZERO);
    });

    it('should apply two-qubit gate to four-element vector', () => {
      const twoQubitGate = new TestTwoQubitGate();
      const stateVector = [ZERO, ZERO, ONE, ZERO]; // |10⟩
      
      const result = twoQubitGate.applyToStateVector(stateVector);
      
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual(ZERO);
      expect(result[1]).toEqual(ZERO);
      expect(result[2]).toEqual(ZERO);
      expect(result[3]).toEqual(ONE); // |11⟩
    });

    it('should throw error for mismatched vector size', () => {
      const singleQubitGate = new TestIdentityGate();
      const wrongSizeVector = [ONE, ZERO, ZERO, ZERO]; // 4 elements instead of 2
      
      expect(() => singleQubitGate.applyToStateVector(wrongSizeVector))
        .toThrow('State vector size 4 does not match gate size 2');
    });

    it('should handle empty state vector appropriately', () => {
      const invalidGate = new TestInvalidGate();
      const emptyVector: any[] = [];
      
      expect(() => invalidGate.applyToStateVector(emptyVector))
        .toThrow('Matrix cannot be empty');
    });

    it('should preserve vector properties', () => {
      const identityGate = new TestIdentityGate();
      const stateVector = [complex(0.8, 0), complex(0, 0.6)];
      
      const result = identityGate.applyToStateVector(stateVector);
      
      // Check normalization is preserved
      const originalNorm = stateVector.reduce((sum, amp) => sum + amp.abs() * amp.abs(), 0);
      const resultNorm = result.reduce((sum, amp) => sum + amp.abs() * amp.abs(), 0);
      
      expect(resultNorm).toBeCloseTo(originalNorm, 10);
    });

    it('should work with parametric gates on state vectors', () => {
      const rotationGate = new TestParametricGate(Math.PI / 2);
      const stateVector = [ONE, ZERO];
      
      const result = rotationGate.applyToStateVector(stateVector);
      
      expect(result).toHaveLength(2);
      expect(result[0].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(result[1].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
    });

    it('should handle three-qubit gates', () => {
      const threeQubitGate = new TestThreeQubitGate();
      const stateVector = [ONE, ZERO, ZERO, ZERO, ZERO, ZERO, ZERO, ZERO]; // |000⟩
      
      const result = threeQubitGate.applyToStateVector(stateVector);
      
      expect(result).toHaveLength(8);
      expect(result[0]).toEqual(ONE);
      result.slice(1).forEach(amp => {
        expect(amp).toEqual(ZERO);
      });
    });
  });

  describe('Matrix Size Calculations', () => {
    it('should calculate size correctly for various matrix dimensions', () => {
      const gates = [
        new TestIdentityGate(),      // 2x2
        new TestTwoQubitGate(),      // 4x4
        new TestThreeQubitGate(),    // 8x8
      ];
      
      const expectedSizes = [2, 4, 8];
      
      gates.forEach((gate, index) => {
        expect(gate.size).toBe(expectedSizes[index]);
      });
    });

    it('should handle dynamic size calculation', () => {
      class DynamicGate extends Q5mGate {
        readonly name = 'Dynamic';
        matrix: Unitary;
        
        constructor(dimension: number) {
          super();
          this.matrix = Array.from({ length: dimension }, () =>
            Array.from({ length: dimension }, () => ZERO)
          );
          // Set diagonal to identity
          for (let i = 0; i < dimension; i++) {
            this.matrix[i][i] = ONE;
          }
        }
      }
      
      const gate2 = new DynamicGate(2);
      const gate4 = new DynamicGate(4);
      const gate16 = new DynamicGate(16);
      
      expect(gate2.size).toBe(2);
      expect(gate4.size).toBe(4);
      expect(gate16.size).toBe(16);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid matrix dimensions gracefully', () => {
      const invalidGate = new TestInvalidGate();
      expect(invalidGate.size).toBe(0);
    });

    it('should validate state dimensions strictly', () => {
      const singleQubitGate = new TestIdentityGate();
      
      const validState = new QubitState(1);
      expect(() => singleQubitGate.applyTo(validState)).not.toThrow();
      
      const invalidState = new QubitState(2);
      expect(() => singleQubitGate.applyTo(invalidState)).toThrow();
    });

    it('should validate state vector dimensions strictly', () => {
      const twoQubitGate = new TestTwoQubitGate();
      
      const validVector = [ONE, ZERO, ZERO, ZERO];
      expect(() => twoQubitGate.applyToStateVector(validVector)).not.toThrow();
      
      const invalidVector = [ONE, ZERO];
      expect(() => twoQubitGate.applyToStateVector(invalidVector)).toThrow();
    });

    it('should provide meaningful error messages', () => {
      const singleQubitGate = new TestIdentityGate();
      const twoQubitState = new QubitState(2);
      
      expect(() => singleQubitGate.applyTo(twoQubitState))
        .toThrow(/dimension.*does not match.*size/);
    });

    it('should handle null/undefined inputs gracefully', () => {
      const gate = new TestIdentityGate();
      
      expect(() => gate.applyTo(null as any)).toThrow();
      expect(() => gate.applyTo(undefined as any)).toThrow();
      expect(() => gate.applyToStateVector(null as any)).toThrow();
      expect(() => gate.applyToStateVector(undefined as any)).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small rotations', () => {
      const smallRotation = new TestParametricGate(1e-10);
      const state = QubitState.zero();
      
      const result = smallRotation.applyTo(state);
      expect(() => result.amplitudes()).not.toThrow();
    });

    it('should handle large rotations', () => {
      const largeRotation = new TestParametricGate(100 * Math.PI);
      const state = QubitState.zero();
      
      const result = largeRotation.applyTo(state);
      expect(() => result.amplitudes()).not.toThrow();
    });

    it('should throw error for zero-amplitude states', () => {
      const gate = new TestIdentityGate();
      
      expect(() => {
        new QubitState(1, [ZERO, ZERO]);
      }).toThrow('Cannot normalize zero vector');
    });

    it('should handle maximum precision amplitudes', () => {
      const gate = new TestIdentityGate();
      const preciseState = new QubitState(1, [
        complex(0.123456789012345, 0.987654321098765),
        ZERO
      ]);
      
      const result = gate.applyTo(preciseState);
      expect(() => result.amplitudes()).not.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    it('should handle reasonable-sized gates efficiently', () => {
      const startTime = performance.now();
      
      const gate = new TestThreeQubitGate();
      const state = new QubitState(3);
      gate.applyTo(state);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it('should not cause memory leaks with repeated applications', () => {
      const gate = new TestIdentityGate();
      let state = new QubitState(1);
      
      // Apply gate many times
      for (let i = 0; i < 1000; i++) {
        state = gate.applyTo(state);
      }
      
      expect(state.amplitudes()).toHaveLength(2);
    });
  });

  describe('Integration with QubitState', () => {
    it('should work seamlessly with QubitState methods', () => {
      const xGate = new TestPauliXGate();
      const state = QubitState.zero();
      
      const result = xGate.applyTo(state);
      
      expect(result.quantumCount()).toBe(1);
      expect(result.amplitudes()).toHaveLength(2);
      expect(result.toString()).toContain('|1⟩');
    });

    it('should preserve QubitState type after application', () => {
      const gate = new TestIdentityGate();
      const state = new QubitState(1);
      
      const result = gate.applyTo(state);
      
      expect(result).toBeInstanceOf(QubitState);
      expect(typeof result.quantumCount).toBe('function');
    });

    it('should work with QubitState factory methods', () => {
      const xGate = new TestPauliXGate();
      
      const zeroResult = xGate.applyTo(QubitState.zero());
      const oneResult = xGate.applyTo(QubitState.one());
      
      expect(zeroResult.toString()).toContain('|1⟩');
      expect(oneResult.toString()).toContain('|0⟩');
    });
  });
});