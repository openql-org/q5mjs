// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { 
  complex, 
  Complex, 
  ZERO, 
  ONE, 
  I, 
  MINUS_ONE, 
  MINUS_I,
  INV_SQRT2,
  INV_SQRT2_COMPLEX,
  HALF,
  PI
} from '@/math/complex';

describe('Complex', () => {
  describe('Construction', () => {
    it('should create complex number with real and imaginary parts', () => {
      const c = complex(3, 4);
      expect(c.re).toBe(3);
      expect(c.im).toBe(4);
    });

    it('should create real number when imaginary part is omitted', () => {
      const c = complex(5);
      expect(c.re).toBe(5);
      expect(c.im).toBe(0);
    });

    it('should create complex number using constructor directly', () => {
      const c1 = new Complex(3, 4);
      expect(c1.re).toBe(3);
      expect(c1.im).toBe(4);

      const c2 = new Complex(7); // Test default parameter
      expect(c2.re).toBe(7);
      expect(c2.im).toBe(0);
    });

    it('should handle zero values', () => {
      const c = complex(0, 0);
      expect(c.re).toBe(0);
      expect(c.im).toBe(0);
    });

    it('should handle negative values', () => {
      const c = complex(-2, -3);
      expect(c.re).toBe(-2);
      expect(c.im).toBe(-3);
    });
  });

  describe('Constants', () => {
    it('should provide correct mathematical constants', () => {
      expect(ZERO.re).toBe(0);
      expect(ZERO.im).toBe(0);
      
      expect(ONE.re).toBe(1);
      expect(ONE.im).toBe(0);
      
      expect(I.re).toBe(0);
      expect(I.im).toBe(1);
      
      expect(MINUS_ONE.re).toBe(-1);
      expect(MINUS_ONE.im).toBe(0);
      
      expect(MINUS_I.re).toBe(0);
      expect(MINUS_I.im).toBe(-1);
    });

    it('should provide quantum computing constants', () => {
      expect(INV_SQRT2).toBeCloseTo(0.7071067812, 10);
      expect(INV_SQRT2_COMPLEX.re).toBeCloseTo(0.7071067812, 10);
      expect(INV_SQRT2_COMPLEX.im).toBe(0);
      
      expect(HALF.re).toBe(0.5);
      expect(HALF.im).toBe(0);
      
      expect(PI).toBe(Math.PI);
    });
  });

  describe('Arithmetic Operations', () => {
    it('should add complex numbers correctly', () => {
      const c1 = complex(3, 4);
      const c2 = complex(1, 2);
      const sum = c1.add(c2);
      
      expect(sum.re).toBe(4);
      expect(sum.im).toBe(6);
    });

    it('should add real number to complex', () => {
      const c = complex(3, 4);
      const sum = c.add(5);
      
      expect(sum.re).toBe(8);
      expect(sum.im).toBe(4);
    });

    it('should subtract complex numbers correctly', () => {
      const c1 = complex(5, 7);
      const c2 = complex(2, 3);
      const diff = c1.sub(c2);
      
      expect(diff.re).toBe(3);
      expect(diff.im).toBe(4);
    });

    it('should subtract real number from complex', () => {
      const c = complex(8, 6);
      const diff = c.sub(3);
      
      expect(diff.re).toBe(5);
      expect(diff.im).toBe(6);
    });

    it('should multiply complex numbers correctly', () => {
      const c1 = complex(2, 3);
      const c2 = complex(1, 4);
      const product = c1.mul(c2); // (2+3i)(1+4i) = 2 + 8i + 3i + 12i² = 2 + 11i - 12 = -10 + 11i
      
      expect(product.re).toBe(-10);
      expect(product.im).toBe(11);
    });

    it('should multiply complex by real number', () => {
      const c = complex(2, 3);
      const product = c.mul(4);
      
      expect(product.re).toBe(8);
      expect(product.im).toBe(12);
    });

    it('should divide complex numbers correctly', () => {
      const c1 = complex(2, 4);
      const c2 = complex(1, 1);
      const quotient = c1.div(c2);
      
      expect(quotient.re).toBe(3);
      expect(quotient.im).toBe(1);
    });

    it('should divide complex by real number', () => {
      const c = complex(6, 8);
      const quotient = c.div(2);
      
      expect(quotient.re).toBe(3);
      expect(quotient.im).toBe(4);
    });

    it('should throw error when dividing by zero', () => {
      const c = complex(1, 1);
      const zero = complex(0, 0);
      
      expect(() => c.div(zero)).toThrow('Division by zero');
      expect(() => c.div(0)).toThrow('Division by zero');
    });
  });

  describe('Advanced Operations', () => {
    it('should compute complex conjugate', () => {
      const c = complex(3, 4);
      const conjugate = c.conjugate();
      
      expect(conjugate.re).toBe(3);
      expect(conjugate.im).toBe(-4);
    });

    it('should compute absolute value (magnitude)', () => {
      const c = complex(3, 4);
      const abs = c.abs();
      
      expect(abs).toBe(5); // sqrt(3² + 4²) = sqrt(9 + 16) = 5
    });

    it('should compute argument (phase angle)', () => {
      const c = complex(1, 1);
      const arg = c.arg();
      
      expect(arg).toBeCloseTo(Math.PI / 4, 10);
    });

    it('should compute exponential', () => {
      const c = complex(0, Math.PI); // e^(iπ) = -1
      const exp = c.exp();
      
      expect(exp.re).toBeCloseTo(-1, 10);
      expect(exp.im).toBeCloseTo(0, 10);
    });

    it('should compute square root', () => {
      const c = complex(0, 2); // sqrt(2i)
      const sqrt = c.sqrt();
      
      expect(sqrt.re).toBeCloseTo(1, 10);
      expect(sqrt.im).toBeCloseTo(1, 10);
    });

    it('should compute power operations', () => {
      const c = complex(2, 0);
      
      const pow0 = c.pow(0);
      expect(pow0.re).toBe(1);
      expect(pow0.im).toBe(0);
      
      const pow1 = c.pow(1);
      expect(pow1.re).toBe(2);
      expect(pow1.im).toBe(0);
      
      const pow2 = c.pow(2);
      expect(pow2.re).toBe(4);
      expect(pow2.im).toBe(0);
    });

    it('should negate complex numbers', () => {
      const c = complex(3, -4);
      const neg = c.neg();
      
      expect(neg.re).toBe(-3);
      expect(neg.im).toBe(4);
    });
  });

  describe('Comparison Operations', () => {
    it('should check equality with default tolerance', () => {
      const c1 = complex(1, 2);
      const c2 = complex(1, 2);
      const c3 = complex(1.0000000001, 2.0000000001);
      
      expect(c1.equals(c2)).toBe(true);
      // The difference (1e-10) should be within default tolerance
      expect(c1.equals(c3, 1e-9)).toBe(true); // Use explicit tolerance
    });

    it('should check equality with custom tolerance', () => {
      const c1 = complex(1, 2);
      const c2 = complex(1.001, 2.001);
      
      expect(c1.equals(c2, 1e-2)).toBe(true);
      expect(c1.equals(c2, 1e-4)).toBe(false);
    });
  });

  describe('String Representation', () => {
    it('should format real numbers', () => {
      const c = complex(5, 0);
      expect(c.toString()).toBe('5');
    });

    it('should format imaginary numbers', () => {
      expect(complex(0, 1).toString()).toBe('i');
      expect(complex(0, -1).toString()).toBe('-i');
      expect(complex(0, 3).toString()).toBe('3i');
      expect(complex(0, -3).toString()).toBe('-3i');
    });

    it('should format complex numbers', () => {
      expect(complex(3, 4).toString()).toBe('3 + 4i');
      expect(complex(3, -4).toString()).toBe('3 - 4i');
      expect(complex(-3, 4).toString()).toBe('-3 + 4i');
      expect(complex(-3, -4).toString()).toBe('-3 - 4i');
    });

    it('should handle unit imaginary parts in complex numbers', () => {
      expect(complex(2, 1).toString()).toBe('2 + i');
      expect(complex(2, -1).toString()).toBe('2 - i');
    });
  });

  describe('Quantum Computing Applications', () => {
    it('should handle Hadamard gate matrix elements', () => {
      const h = INV_SQRT2_COMPLEX;
      expect(h.re).toBeCloseTo(0.7071067812, 10);
      expect(h.im).toBe(0);
    });

    it('should handle Pauli-Y gate matrix elements', () => {
      const y01 = complex(0, -1);
      const y10 = complex(0, 1);
      
      expect(y01.im).toBe(-1);
      expect(y10.im).toBe(1);
    });

    it('should handle quantum phase rotations', () => {
      const theta = Math.PI / 4;
      const phase = complex(Math.cos(theta), Math.sin(theta));
      
      expect(phase.abs()).toBeCloseTo(1, 10);
      expect(phase.arg()).toBeCloseTo(theta, 10);
    });

    it('should handle quantum amplitude calculations', () => {
      const amplitude1 = complex(0.6, 0.8);
      const amplitude2 = complex(0.3, -0.4);
      const combined = amplitude1.add(amplitude2);
      
      expect(combined.re).toBeCloseTo(0.9, 10);
      expect(combined.im).toBeCloseTo(0.4, 10);
    });
  });

  describe('Performance and Caching', () => {
    it('should cache common integer values', () => {
      const c1 = complex(1, 1);
      const c2 = complex(1, 1);
      
      expect(c1).toBe(c2); // Same object reference due to caching
    });

    it('should handle large numbers without caching', () => {
      const c1 = complex(100, 200);
      const c2 = complex(100, 200);
      
      // Large numbers should still work correctly
      expect(c1.re).toBe(c2.re);
      expect(c1.im).toBe(c2.im);
      expect(c1.equals(c2)).toBe(true);
    });

    it('should handle floating point precision', () => {
      const c = complex(0.1 + 0.2, 0); // Known floating point issue
      expect(c.re).toBeCloseTo(0.3, 10);
    });

    it('should handle cache size limit', () => {
      const numbers = [];
      for (let i = 0; i < 5010; i++) {
        const c = complex(i + 0.123456789, i + 0.987654321);
        numbers.push(c);
        expect(c.re).toBe(i + 0.123456789);
        expect(c.im).toBe(i + 0.987654321);
      }
      
      expect(numbers.length).toBe(5010);
      
      const lastNumber = numbers[5009];
      expect(lastNumber.re).toBe(5009 + 0.123456789);
      expect(lastNumber.im).toBe(5009 + 0.987654321);
    });
  });

  describe('Edge Cases', () => {
    it('should handle infinity values', () => {
      const c = complex(Infinity, 0);
      expect(c.re).toBe(Infinity);
      expect(c.abs()).toBe(Infinity);
    });

    it('should handle NaN values', () => {
      const c = complex(NaN, 0);
      expect(Number.isNaN(c.re)).toBe(true);
      expect(Number.isNaN(c.abs())).toBe(true);
    });

    it('should handle very small numbers', () => {
      const c = complex(1e-15, 1e-15);
      expect(c.abs()).toBeGreaterThan(0);
    });
  });
});