// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { Q5mMaterial, isValidQ5mIndex, validateQ5mIndex } from '@/core/Q5mMaterial';
import { Complex, complex } from '@/math/complex';

describe('Q5mMaterial - Full Tests', () => {
  describe('setMaterial method', () => {
    it('should set state vector material', () => {
      const material = new Q5mMaterial<Complex[]>(1, [
        complex(1, 0),
        complex(0, 0)
      ]);
      
      const newStateVector = [
        complex(0.707, 0),
        complex(0.707, 0)
      ];
      
      material.setMaterial(newStateVector);
      expect(material.getMaterial()).toEqual(newStateVector);
    });
    
    it('should set density matrix material', () => {
      const initialMatrix = [
        [complex(1, 0), complex(0, 0)],
        [complex(0, 0), complex(0, 0)]
      ];
      const material = new Q5mMaterial<Complex[][]>(1, initialMatrix);
      
      const newMatrix = [
        [complex(0.5, 0), complex(0.5, 0)],
        [complex(0.5, 0), complex(0.5, 0)]
      ];
      
      material.setMaterial(newMatrix);
      expect(material.getMaterial()).toEqual(newMatrix);
    });
  });
  
  describe('getStateNum method', () => {
    it('should get the number of quantum states', () => {
      const material = new Q5mMaterial<Complex[]>(1, [
        complex(1, 0),
        complex(0, 0)
      ]);
      
      expect(material.getStateNum()).toBe(1);
    });
    
    it('should get correct state number for multi-qubit system', () => {
      const material = new Q5mMaterial<Complex[]>(2, [
        complex(1, 0),
        complex(0, 0),
        complex(0, 0),
        complex(0, 0)
      ]);
      
      expect(material.getStateNum()).toBe(2);
    });
  });
  
  describe('setStateNum method', () => {
    it('should set the number of quantum states', () => {
      const material = new Q5mMaterial<Complex[]>(1, [
        complex(1, 0),
        complex(0, 0)
      ]);
      
      material.setStateNum(3);
      expect(material.getStateNum()).toBe(3);
    });
    
    it('should allow changing state number multiple times', () => {
      const material = new Q5mMaterial<Complex[]>(1, [
        complex(1, 0),
        complex(0, 0)
      ]);
      
      material.setStateNum(2);
      expect(material.getStateNum()).toBe(2);
      
      material.setStateNum(5);
      expect(material.getStateNum()).toBe(5);
      
      material.setStateNum(1);
      expect(material.getStateNum()).toBe(1);
    });
  });

  describe('Constructor with default material', () => {
    it('should create material with default empty array when no material provided', () => {
      const material = new Q5mMaterial<Complex[]>(3); // No material provided
      
      expect(material.getStateNum()).toBe(3);
      expect(material.getMaterial()).toEqual([]);
    });

    it('should create density matrix material with default when no material provided', () => {
      const material = new Q5mMaterial<Complex[][]>(2); // No material provided
      
      expect(material.getStateNum()).toBe(2);
      expect(material.getMaterial()).toEqual([]);
    });
  });

  describe('Utility Functions - isValidQ5mIndex', () => {
    it('should return true for valid Q5m indices', () => {
      expect(isValidQ5mIndex(0)).toBe(true);
      expect(isValidQ5mIndex(1)).toBe(true);
      expect(isValidQ5mIndex(5)).toBe(true);
      expect(isValidQ5mIndex(100)).toBe(true);
    });

    it('should return false for invalid Q5m indices', () => {
      expect(isValidQ5mIndex(-1)).toBe(false);
      expect(isValidQ5mIndex(-10)).toBe(false);
      expect(isValidQ5mIndex(3.14)).toBe(false);
      expect(isValidQ5mIndex(NaN)).toBe(false);
      expect(isValidQ5mIndex(Infinity)).toBe(false);
      expect(isValidQ5mIndex(-Infinity)).toBe(false);
    });

    it('should return false for non-number types', () => {
      expect(isValidQ5mIndex('0')).toBe(false);
      expect(isValidQ5mIndex('5')).toBe(false);
      expect(isValidQ5mIndex(null)).toBe(false);
      expect(isValidQ5mIndex(undefined)).toBe(false);
      expect(isValidQ5mIndex({})).toBe(false);
      expect(isValidQ5mIndex([])).toBe(false);
      expect(isValidQ5mIndex(true)).toBe(false);
      expect(isValidQ5mIndex(false)).toBe(false);
    });
  });

  describe('Utility Functions - validateQ5mIndex', () => {
    it('should pass validation for valid indices within range', () => {
      expect(() => validateQ5mIndex(0, 5)).not.toThrow();
      expect(() => validateQ5mIndex(1, 5)).not.toThrow();
      expect(() => validateQ5mIndex(4, 5)).not.toThrow();
      expect(() => validateQ5mIndex(0, 1)).not.toThrow();
    });

    it('should throw error for negative indices', () => {
      expect(() => validateQ5mIndex(-1, 5)).toThrow('Qubit index -1 out of range');
      expect(() => validateQ5mIndex(-10, 5)).toThrow('Qubit index -10 out of range');
    });

    it('should throw error for indices at or above maxSize', () => {
      expect(() => validateQ5mIndex(5, 5)).toThrow('Qubit index 5 out of range');
      expect(() => validateQ5mIndex(10, 5)).toThrow('Qubit index 10 out of range');
      expect(() => validateQ5mIndex(1, 1)).toThrow('Qubit index 1 out of range');
    });

    it('should handle edge cases', () => {
      expect(() => validateQ5mIndex(0, 0)).toThrow('Qubit index 0 out of range');
      expect(() => validateQ5mIndex(999, 1000)).not.toThrow();
      expect(() => validateQ5mIndex(1000, 1000)).toThrow('Qubit index 1000 out of range');
    });
  });
});
