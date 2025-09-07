// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import {
  Amplitude,
  formatAmplitude,
  isValidAmplitude,
  createAmplitude,
  normalizeAmplitudes,
  isZero,
  areEqual
} from '@/math/amplitude';
import { complex, ZERO, ONE, I } from '@/math/complex';

describe('Amplitude Operations', () => {
  describe('Amplitude Validation', () => {
    it('should validate correct amplitudes', () => {
      expect(isValidAmplitude(complex(0.6, 0.8))).toBe(true); // |0.6 + 0.8i| = 1
      expect(isValidAmplitude(complex(1, 0))).toBe(true);     // |1| = 1
      expect(isValidAmplitude(complex(0, 1))).toBe(true);     // |i| = 1
      expect(isValidAmplitude(complex(0.5, 0.5))).toBe(true); // |0.5 + 0.5i| < 1
    });

    it('should reject invalid amplitudes', () => {
      expect(isValidAmplitude(complex(2, 0))).toBe(false);    // |2| > 1
      expect(isValidAmplitude(complex(0.8, 0.8))).toBe(false); // |0.8 + 0.8i| > 1
      expect(isValidAmplitude(complex(1.5, 0.5))).toBe(false); // magnitude > 1
    });

    it('should handle edge cases with numerical tolerance', () => {
      const slightlyOverOne = complex(1.0000000001, 0);
      expect(isValidAmplitude(slightlyOverOne)).toBe(true); // Within numerical tolerance
    });
  });

  describe('Amplitude Creation', () => {
    it('should create valid amplitudes', () => {
      const amp1 = createAmplitude(0.6, 0.8);
      expect(amp1.re).toBe(0.6);
      expect(amp1.im).toBe(0.8);
      expect(amp1.abs()).toBeCloseTo(1, 10);

      const amp2 = createAmplitude(1, 0);
      expect(amp2.re).toBe(1);
      expect(amp2.im).toBe(0);

      const amp3 = createAmplitude(0, 1);
      expect(amp3.re).toBe(0);
      expect(amp3.im).toBe(1);
    });

    it('should create real amplitudes when imaginary part omitted', () => {
      const amp = createAmplitude(0.7);
      expect(amp.re).toBe(0.7);
      expect(amp.im).toBe(0);
    });

    it('should throw error for invalid amplitudes', () => {
      expect(() => createAmplitude(2, 0)).toThrow('Invalid amplitude: magnitude');
      expect(() => createAmplitude(0.8, 0.8)).toThrow('Invalid amplitude: magnitude');
      expect(() => createAmplitude(1.5, 0.5)).toThrow('Invalid amplitude: magnitude');
    });
  });

  describe('Amplitude Normalization', () => {
    it('should normalize amplitude arrays', () => {
      const unnormalized = [complex(2, 0), complex(0, 2)];
      const normalized = normalizeAmplitudes(unnormalized);
      
      expect(normalized[0]?.re).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(normalized[0]?.im).toBeCloseTo(0, 10);
      expect(normalized[1]?.re).toBeCloseTo(0, 10);
      expect(normalized[1]?.im).toBeCloseTo(1/Math.sqrt(2), 10);
      
      // Check total probability = 1
      const totalProb = normalized.reduce((sum, amp) => sum + amp.abs() ** 2, 0);
      expect(totalProb).toBeCloseTo(1, 10);
    });

    it('should normalize complex amplitude arrays', () => {
      const unnormalized = [complex(1, 1), complex(1, -1)];
      const normalized = normalizeAmplitudes(unnormalized);
      
      const totalProb = normalized.reduce((sum, amp) => sum + amp.abs() ** 2, 0);
      expect(totalProb).toBeCloseTo(1, 10);
    });

    it('should throw error for zero amplitude array', () => {
      const zeroAmplitudes = [ZERO, ZERO, ZERO];
      expect(() => normalizeAmplitudes(zeroAmplitudes)).toThrow('Cannot normalize zero vector');
    });

    it('should handle tolerant normalization', () => {
      const smallAmplitudes = [complex(1e-15, 0), complex(1e-15, 0)];
      
      // With tolerant parameter, should not throw
      const result = normalizeAmplitudes(smallAmplitudes, 1e-12, 1e-10);
      expect(result).toEqual(smallAmplitudes); // Unchanged
    });

    it('should normalize quantum state amplitudes', () => {
      // Bell state: |00⟩ + |11⟩
      const unnormalized = [complex(1, 0), ZERO, ZERO, complex(1, 0)];
      const normalized = normalizeAmplitudes(unnormalized);
      
      expect(normalized[0]?.re).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(normalized[3]?.re).toBeCloseTo(1/Math.sqrt(2), 10);
      
      const totalProb = normalized.reduce((sum, amp) => sum + amp.abs() ** 2, 0);
      expect(totalProb).toBeCloseTo(1, 10);
    });
  });

  describe('Amplitude Formatting', () => {
    it('should format real amplitudes', () => {
      const amp = complex(0.707, 0);
      expect(formatAmplitude(amp)).toBe('0.707');
      expect(formatAmplitude(amp, 5)).toBe('0.70700');
    });

    it('should format imaginary amplitudes', () => {
      expect(formatAmplitude(complex(0, 1))).toBe('i');
      expect(formatAmplitude(complex(0, -1))).toBe('-i');
      expect(formatAmplitude(complex(0, 0.5))).toBe('0.500i');
      expect(formatAmplitude(complex(0, -0.5))).toBe('-0.500i');
    });

    it('should format complex amplitudes', () => {
      expect(formatAmplitude(complex(0.6, 0.8))).toBe('0.600+0.800i');
      expect(formatAmplitude(complex(0.6, -0.8))).toBe('0.600-0.800i');
      expect(formatAmplitude(complex(-0.6, 0.8))).toBe('-0.600+0.800i');
      expect(formatAmplitude(complex(-0.6, -0.8))).toBe('-0.600-0.800i');
    });

    it('should format with unit imaginary parts', () => {
      expect(formatAmplitude(complex(2, 1))).toBe('2.000+1.000i');
      expect(formatAmplitude(complex(2, -1))).toBe('2.000-1.000i');
    });

    it('should handle precision parameter', () => {
      const amp = complex(1/3, 2/3);
      expect(formatAmplitude(amp, 1)).toBe('0.3+0.7i');
      expect(formatAmplitude(amp, 6)).toBe('0.333333+0.666667i');
    });

    it('should handle very small values', () => {
      const amp = complex(1e-5, 1e-5);
      expect(formatAmplitude(amp, 3)).toBe('0.000');  // Both real and imaginary are below precision
      expect(formatAmplitude(amp, 6)).toBe('0.000010+0.000010i');
    });
  });

  describe('Amplitude Comparison', () => {
    it('should detect zero amplitudes', () => {
      expect(isZero(ZERO)).toBe(true);
      expect(isZero(complex(1e-15, 1e-15))).toBe(true);
      expect(isZero(complex(0.001, 0))).toBe(false);
    });

    it('should handle custom tolerance for zero detection', () => {
      const small = complex(1e-5, 1e-5);
      expect(isZero(small, 1e-4)).toBe(true);
      expect(isZero(small, 1e-6)).toBe(false);
    });

    it('should check amplitude equality', () => {
      const amp1 = complex(0.6, 0.8);
      const amp2 = complex(0.6, 0.8);
      const amp3 = complex(0.6000000001, 0.8000000001);
      
      expect(areEqual(amp1, amp2)).toBe(true);
      expect(areEqual(amp1, amp3, 1e-9)).toBe(true); // Within custom tolerance
    });

    it('should handle custom tolerance for equality', () => {
      const amp1 = complex(0.6, 0.8);
      const amp2 = complex(0.601, 0.801);
      
      expect(areEqual(amp1, amp2, 1e-2)).toBe(true);
      expect(areEqual(amp1, amp2, 1e-4)).toBe(false);
    });
  });

  describe('Quantum Computing Applications', () => {
    it('should handle ground state amplitude', () => {
      const ground = createAmplitude(1, 0);
      expect(isValidAmplitude(ground)).toBe(true);
      expect(ground.abs()).toBe(1);
      expect(formatAmplitude(ground)).toBe('1.000');
    });

    it('should handle excited state amplitude', () => {
      const excited = createAmplitude(0, 1);
      expect(isValidAmplitude(excited)).toBe(true);
      expect(excited.abs()).toBe(1);
      expect(formatAmplitude(excited)).toBe('i');
    });

    it('should handle superposition state amplitudes', () => {
      const plus = createAmplitude(1/Math.sqrt(2), 0);
      const minus = createAmplitude(1/Math.sqrt(2), 0);
      
      expect(isValidAmplitude(plus)).toBe(true);
      expect(isValidAmplitude(minus)).toBe(true);
      
      const superposition = [plus, minus];
      const totalProb = superposition.reduce((sum, amp) => sum + amp.abs() ** 2, 0);
      expect(totalProb).toBeCloseTo(1, 10);
    });

    it('should handle Bell state amplitudes', () => {
      const bellAmps = [
        createAmplitude(1/Math.sqrt(2), 0), // |00⟩
        createAmplitude(0, 0),               // |01⟩
        createAmplitude(0, 0),               // |10⟩
        createAmplitude(1/Math.sqrt(2), 0)   // |11⟩
      ];
      
      const totalProb = bellAmps.reduce((sum, amp) => sum + amp.abs() ** 2, 0);
      expect(totalProb).toBeCloseTo(1, 10);
    });

    it('should handle GHZ state amplitudes', () => {
      const ghzAmps = [
        createAmplitude(1/Math.sqrt(2), 0), // |000⟩
        createAmplitude(0, 0),               // |001⟩
        createAmplitude(0, 0),               // |010⟩
        createAmplitude(0, 0),               // |011⟩
        createAmplitude(0, 0),               // |100⟩
        createAmplitude(0, 0),               // |101⟩
        createAmplitude(0, 0),               // |110⟩
        createAmplitude(1/Math.sqrt(2), 0)   // |111⟩
      ];
      
      const totalProb = ghzAmps.reduce((sum, amp) => sum + amp.abs() ** 2, 0);
      expect(totalProb).toBeCloseTo(1, 10);
    });

    it('should handle phase rotations', () => {
      const theta = Math.PI / 4;
      const amplitude = createAmplitude(Math.cos(theta), Math.sin(theta));
      
      expect(isValidAmplitude(amplitude)).toBe(true);
      expect(amplitude.abs()).toBeCloseTo(1, 10);
      expect(amplitude.arg()).toBeCloseTo(theta, 10);
    });
  });

  describe('Error Handling', () => {
    it('should handle edge cases gracefully', () => {
      expect(() => createAmplitude(Infinity, 0)).toThrow();
      expect(() => createAmplitude(NaN, 0)).toThrow();
      
      expect(isZero(complex(NaN, 0))).toBe(false); // NaN.abs() is NaN, not < tolerance
      expect(areEqual(complex(NaN, 0), complex(0, 0))).toBe(false);
    });

    it('should handle empty amplitude arrays', () => {
      const empty: Amplitude[] = [];
      expect(() => normalizeAmplitudes(empty)).toThrow();
    });
  });
});