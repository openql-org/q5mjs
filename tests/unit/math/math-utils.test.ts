// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import {
  isUnitary,
  createUnitary,
  create2x2Unitary,
  createUnitaryMatrix, // backward compatibility alias
  isHermitian,
  createHermitian,
  formatAmplitude,
  formatComplex,
  isValidAmplitude,
  createAmplitude,
  normalizeAmplitudes,
  isZero,
  areEqual,
  parseAngle,
  matXvec,
  matXmat,
  normalize,
  innerP,
  tensorP,
  isMatrix,
  createMatrix,
  // Backward compatibility aliases
  matrixVectorMultiply,
  matrixMatrixMultiply,
  innerProduct,
  tensorProduct
} from '@/math/math-utils';
import { complex, ZERO, ONE, I, MINUS_ONE, MINUS_I, INV_SQRT2 } from '@/math/complex';

describe('Math Utilities', () => {
  describe('Unitary Matrix Operations', () => {
    it('should validate identity matrix as unitary', () => {
      const identity = [[ONE, ZERO], [ZERO, ONE]];
      expect(isUnitary(identity)).toBe(true);
    });

    it('should validate Pauli gates as unitary', () => {
      const pauliX = [[ZERO, ONE], [ONE, ZERO]];
      const pauliY = [[ZERO, MINUS_I], [I, ZERO]];
      const pauliZ = [[ONE, ZERO], [ZERO, MINUS_ONE]];
      
      expect(isUnitary(pauliX)).toBe(true);
      expect(isUnitary(pauliY)).toBe(true);
      expect(isUnitary(pauliZ)).toBe(true);
    });

    it('should validate Hadamard gate as unitary', () => {
      const h = complex(INV_SQRT2, 0);
      const hadamard = [[h, h], [h, h.neg()]];
      
      expect(isUnitary(hadamard)).toBe(true);
    });

    it('should reject non-unitary matrices', () => {
      const nonUnitary = [[complex(2, 0), ZERO], [ZERO, ONE]];
      expect(isUnitary(nonUnitary)).toBe(false);
    });

    it('should reject non-square matrices', () => {
      const nonSquare = [[ONE, ZERO, ZERO], [ZERO, ONE, ZERO]];
      expect(isUnitary(nonSquare)).toBe(false);
    });

    it('should create valid unitary matrices', () => {
      const pauliX = [[ZERO, ONE], [ONE, ZERO]];
      const unitary = createUnitary(pauliX);
      
      expect(unitary).toEqual(pauliX);
      expect(isUnitary(unitary)).toBe(true);
    });

    it('should throw error for invalid unitary creation', () => {
      const nonUnitary = [[complex(2, 0), ZERO], [ZERO, ONE]];
      expect(() => createUnitary(nonUnitary)).toThrow('Matrix is not unitary');
    });

    it('should create 2x2 unitary matrices', () => {
      const alpha = complex(1, 0);
      const beta = complex(0, 0);
      const result = create2x2Unitary(alpha, beta);
      
      expect(result).toHaveProperty('matrix');
      expect(result).toHaveProperty('normalizedAlpha');
      expect(result).toHaveProperty('normalizedBeta');
      expect(isUnitary(result.matrix)).toBe(true);
    });
  });

  describe('Hermitian Matrix Operations', () => {
    it('should validate Hermitian matrices', () => {
      const hermitian = [[complex(2, 0), complex(1, -1)], [complex(1, 1), complex(3, 0)]];
      expect(isHermitian(hermitian)).toBe(true);
    });

    it('should validate Pauli matrices as Hermitian', () => {
      const pauliX = [[ZERO, ONE], [ONE, ZERO]];
      const pauliY = [[ZERO, MINUS_I], [I, ZERO]];
      const pauliZ = [[ONE, ZERO], [ZERO, MINUS_ONE]];
      
      expect(isHermitian(pauliX)).toBe(true);
      expect(isHermitian(pauliY)).toBe(true);
      expect(isHermitian(pauliZ)).toBe(true);
    });

    it('should reject non-Hermitian matrices', () => {
      const nonHermitian = [[ONE, I], [ONE, ONE]]; // Should be [[ONE, -I], [I, ONE]]
      expect(isHermitian(nonHermitian)).toBe(false);
    });

    it('should create valid Hermitian matrices', () => {
      const hermitian = [[complex(1, 0), complex(0, 1)], [complex(0, -1), complex(2, 0)]];
      const created = createHermitian(hermitian);
      
      expect(created).toEqual(hermitian);
      expect(isHermitian(created)).toBe(true);
    });

    it('should throw error for invalid Hermitian creation', () => {
      const nonHermitian = [[ONE, I], [ONE, ONE]];
      expect(() => createHermitian(nonHermitian)).toThrow('Matrix is not Hermitian');
    });
  });

  describe('Amplitude Operations (Re-exported)', () => {
    it('should format amplitudes correctly', () => {
      expect(formatAmplitude(complex(0.707, 0))).toBe('0.707');
      expect(formatComplex(complex(0.6, 0.8))).toBe('0.600+0.800i');
    });

    it('should validate amplitudes', () => {
      expect(isValidAmplitude(complex(0.6, 0.8))).toBe(true);
      expect(isValidAmplitude(complex(2, 0))).toBe(false);
    });

    it('should create amplitudes', () => {
      const amp = createAmplitude(0.6, 0.8);
      expect(amp.abs()).toBeCloseTo(1, 10);
    });

    it('should normalize amplitudes', () => {
      const unnormalized = [complex(2, 0), complex(0, 2)];
      const normalized = normalizeAmplitudes(unnormalized);
      
      const totalProb = normalized.reduce((sum, amp) => sum + amp.abs() ** 2, 0);
      expect(totalProb).toBeCloseTo(1, 10);
    });

    it('should detect zero amplitudes', () => {
      expect(isZero(ZERO)).toBe(true);
      expect(isZero(complex(0.001, 0))).toBe(false);
    });

    it('should check amplitude equality', () => {
      expect(areEqual(complex(0.5, 0), complex(0.5, 0))).toBe(true);
      expect(areEqual(complex(0.5, 0), complex(0.6, 0))).toBe(false);
    });
  });

  describe('Angle Parsing', () => {
    it('should parse numeric angles', () => {
      expect(parseAngle(Math.PI)).toBe(Math.PI);
      expect(parseAngle(1.5708)).toBeCloseTo(1.5708, 5);
    });

    it('should parse string expressions with pi', () => {
      expect(parseAngle('pi')).toBeCloseTo(Math.PI, 10);
      expect(parseAngle('pi/2')).toBeCloseTo(Math.PI / 2, 10);
      expect(parseAngle('2*pi')).toBeCloseTo(2 * Math.PI, 10);
    });

    it('should parse mathematical expressions', () => {
      expect(parseAngle('pi/4')).toBeCloseTo(Math.PI / 4, 10);
      expect(parseAngle('3*pi/2')).toBeCloseTo(3 * Math.PI / 2, 10);
    });

    it('should handle decimal expressions', () => {
      expect(parseAngle('1.57')).toBeCloseTo(1.57, 10);
      expect(parseAngle('0.785')).toBeCloseTo(0.785, 10);
    });

    it('should throw error for undefined angle', () => {
      expect(() => parseAngle(undefined)).toThrow('angle parameter is required');
    });

    it('should throw error for invalid expressions', () => {
      expect(() => parseAngle('invalid')).toThrow('Invalid angle expression');
      expect(() => parseAngle('pi+')).toThrow('Invalid angle expression');
    });
  });

  describe('Quantum Computing Applications', () => {
    it('should handle rotation gate matrices', () => {
      const theta = Math.PI / 4;
      const cos = Math.cos(theta / 2);
      const sin = Math.sin(theta / 2);
      
      const rx = [
        [complex(cos, 0), complex(0, -sin)],
        [complex(0, -sin), complex(cos, 0)]
      ];
      
      expect(isUnitary(rx)).toBe(true);
    });

    it('should handle controlled gate matrices', () => {
      const cnot = [
        [ONE, ZERO, ZERO, ZERO],
        [ZERO, ONE, ZERO, ZERO],
        [ZERO, ZERO, ZERO, ONE],
        [ZERO, ZERO, ONE, ZERO]
      ];
      
      expect(isUnitary(cnot)).toBe(true);
    });

    it('should handle phase gate matrices', () => {
      const phase = complex(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4));
      const phaseGate = [[ONE, ZERO], [ZERO, phase]];
      
      expect(isUnitary(phaseGate)).toBe(true);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large unitary matrices', () => {
      const size = 8;
      const identity = Array.from({ length: size }, (_, i) =>
        Array.from({ length: size }, (_, j) => i === j ? ONE : ZERO)
      );
      
      expect(isUnitary(identity)).toBe(true);
    });

    it('should handle numerical precision in unitary check', () => {
      // Create a matrix that's clearly non-unitary
      const nonUnitary = [
        [complex(1.01, 0), ZERO],
        [ZERO, complex(0.99, 0)]
      ];
      
      expect(isUnitary(nonUnitary, 1e-1)).toBe(false);  // Should fail even with loose tolerance
      expect(isUnitary(nonUnitary, 1e-12)).toBe(false); // Should fail with strict tolerance
    });

    it('should handle empty matrices gracefully', () => {
      expect(isUnitary([])).toBe(false);
      expect(isHermitian([])).toBe(false);
    });
  });

  describe('Vector and Matrix Operations (Re-exported)', () => {
    it('should perform matrix-vector multiplication', () => {
      const matrix = [[ONE, ZERO], [ZERO, I]];
      const vector = [complex(1, 0), complex(0, 1)];
      
      const result = matXvec(matrix, vector);
      // Matrix [[1,0],[0,i]] * vector [1, i] = [1*1 + 0*i, 0*1 + i*i] = [1, -1]
      expect(result).toEqual([complex(1, 0), complex(-1, 0)]);
      
      // Test alias
      const aliasResult = matrixVectorMultiply(matrix, vector);
      expect(aliasResult).toEqual(result);
    });

    it('should perform matrix-matrix multiplication', () => {
      const matrixA = [[ONE, ZERO], [ZERO, I]];
      const matrixB = [[ZERO, ONE], [ONE, ZERO]];
      
      const result = matXmat(matrixA, matrixB);
      const expected = [[ZERO, ONE], [I, ZERO]];
      expect(result).toEqual(expected);
      
      // Test alias
      const aliasResult = matrixMatrixMultiply(matrixA, matrixB);
      expect(aliasResult).toEqual(result);
    });

    it('should normalize vectors', () => {
      const vector = [complex(3, 0), complex(4, 0)];
      const normalized = normalize(vector);
      
      expect(normalized[0]).toEqual(complex(0.6, 0));
      expect(normalized[1]).toEqual(complex(0.8, 0));
    });

    it('should compute inner products', () => {
      const vec1 = [ONE, ZERO];
      const vec2 = [ZERO, ONE];
      
      const result = innerP(vec1, vec2);
      expect(result).toEqual(ZERO);
      
      // Test alias
      const aliasResult = innerProduct(vec1, vec2);
      expect(aliasResult).toEqual(result);
    });

    it('should compute tensor products', () => {
      const vec1 = [ONE];
      const vec2 = [ZERO, ONE];
      
      const result = tensorP(vec1, vec2);
      expect(result).toEqual([ZERO, ONE]);
      
      // Test alias
      const aliasResult = tensorProduct(vec1, vec2);
      expect(aliasResult).toEqual(result);
    });

    it('should validate matrices', () => {
      const validMatrix = [[ONE, ZERO], [ZERO, ONE]];
      expect(isMatrix(validMatrix)).toBe(true);
      
      const invalidMatrix = [[ONE], [ZERO, ONE]]; // Inconsistent row lengths
      expect(isMatrix(invalidMatrix)).toBe(false);
    });

    it('should create matrices', () => {
      // createMatrix expects different signature, let's test with valid matrix
      const validMatrix = [[ONE, ZERO], [ZERO, ONE]];
      const matrix = createMatrix(validMatrix);
      expect(matrix).toEqual([[ONE, ZERO], [ZERO, ONE]]);
    });
  });

  describe('Type Compatibility', () => {
    it('should work with backward compatibility aliases', () => {
      // Test unitary matrix creation alias
      const alpha = ONE;
      const beta = ZERO;
      const result1 = create2x2Unitary(alpha, beta);
      const result2 = createUnitaryMatrix(alpha, beta);
      
      expect(result2.matrix).toEqual(result1.matrix);
      expect(isUnitary(result2.matrix)).toBe(true);
    });

    it('should maintain type safety', () => {
      const matrix = [[ONE, ZERO], [ZERO, ONE]];
      
      // Should not throw when matrix is actually unitary
      expect(() => createUnitary(matrix)).not.toThrow();
    });
  });
});