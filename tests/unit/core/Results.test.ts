// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import {
  type Probability,
  type ZeroOne,
  type ExecutionResult,
  type Q5mExecutable,
  type MeasurementResult,
  type Q5mMeasurable,
  isMeasurementResult,
  isProbability,
  isZeroOne,
  validateProbability,
  validateZeroOne,
  createMeasurementResult,
  isExecutionResult,
  createSuccessResult,
  createErrorResult,
} from '@/core/Results';
import { QubitState } from '@/core/QubitState';
import type { Q5mState } from '@/core/Q5mState';
import type { Q5mIndex } from '@/core/Q5mMaterial';

// Mock implementations for testing
class MockQ5mState implements Q5mState {
  quantumCount(): number { return 1; }
  dimension(): number { return 2; }
  clone(): Q5mState { return new MockQ5mState(); }
  tensor(other: Q5mState): Q5mState { return new MockQ5mState(); }
  toString(): string { return 'MockState'; }
  purity(): number { return 1; }
  isPure(): boolean { return true; }
  entropy(): number { return 0; }
  fidelity(other: Q5mState): number { return 1; }
}

class MockExecutable implements Q5mExecutable {
  constructor(private shouldSucceed: boolean = true, private errorMessage?: string) {}

  execute(): ExecutionResult {
    return this.shouldSucceed
      ? createSuccessResult(new MockQ5mState())
      : createErrorResult(new MockQ5mState(), this.errorMessage || 'Test error');
  }

  run(initialState: Q5mState): ExecutionResult {
    return this.shouldSucceed
      ? createSuccessResult(initialState)
      : createErrorResult(initialState, this.errorMessage || 'Test error');
  }
}

class MockMeasurable implements Q5mMeasurable {
  readonly basisName = 'test';

  measure(state: Q5mState, index: Q5mIndex): MeasurementResult {
    return createMeasurementResult({
      measureIndex: index,
      outcome: 0,
      probability: 1,
      collapsedState: state,
    });
  }

  probabilities(state: Q5mState, index: Q5mIndex): { prob0: Probability; prob1: Probability } {
    return { prob0: 0.5, prob1: 0.5 };
  }
}

describe('Results Module', () => {
  describe('Type Definitions', () => {
    it('should accept valid Probability values', () => {
      const validProbs: Probability[] = [0, 0.5, 1, 0.001, 0.999];
      
      validProbs.forEach(prob => {
        expect(typeof prob).toBe('number');
        expect(prob).toBeGreaterThanOrEqual(0);
        expect(prob).toBeLessThanOrEqual(1);
      });
    });

    it('should accept valid ZeroOne values', () => {
      const validZeroOnes: ZeroOne[] = [0, 1];
      
      validZeroOnes.forEach(value => {
        expect([0, 1]).toContain(value);
      });
    });

    it('should define ExecutionResult interface correctly', () => {
      const result: ExecutionResult = {
        state: new MockQ5mState(),
        success: true,
      };
      
      expect(result.state).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(result.error).toBeUndefined();
    });

    it('should define MeasurementResult interface correctly', () => {
      const result: MeasurementResult = {
        measureIndex: 0,
        outcome: 1,
        probability: 0.8,
        collapsedState: new MockQ5mState(),
      };
      
      expect(typeof result.measureIndex).toBe('number');
      expect(result.outcome).toBeDefined();
      expect(typeof result.probability).toBe('number');
      expect(result.collapsedState).toBeDefined();
    });
  });

  describe('Type Guards', () => {
    describe('isProbability', () => {
      it('should return true for valid probabilities', () => {
        const validProbs = [0, 0.5, 1, 0.001, 0.999, 0.123456789];
        
        validProbs.forEach(prob => {
          expect(isProbability(prob)).toBe(true);
        });
      });

      it('should return false for invalid probabilities', () => {
        const invalidProbs = [-0.1, 1.1, 2, -1, NaN, Infinity, -Infinity, 'string', null, undefined, {}];
        
        invalidProbs.forEach(prob => {
          expect(isProbability(prob)).toBe(false);
        });
      });

      it('should handle edge cases', () => {
        expect(isProbability(Number.MIN_VALUE)).toBe(true);
        expect(isProbability(1 - Number.EPSILON)).toBe(true);
        expect(isProbability(1 + Number.EPSILON)).toBe(false);
      });
    });

    describe('isZeroOne', () => {
      it('should return true for 0 and 1', () => {
        expect(isZeroOne(0)).toBe(true);
        expect(isZeroOne(1)).toBe(true);
      });

      it('should return false for other values', () => {
        const invalidValues = [-1, 2, 0.5, 1.5, NaN, Infinity, 'string', null, undefined, true, false, {}];
        
        invalidValues.forEach(value => {
          expect(isZeroOne(value)).toBe(false);
        });
      });
    });

    describe('isMeasurementResult', () => {
      it('should return true for valid MeasurementResult', () => {
        const validResult = {
          measureIndex: 0,
          outcome: 1,
          probability: 0.8,
          collapsedState: new MockQ5mState(),
        };
        
        expect(isMeasurementResult(validResult)).toBe(true);
      });

      it('should return true for MeasurementResult with array measureIndex', () => {
        const validResult = {
          measureIndex: [0, 1, 2],
          outcome: '101',
          probability: 0.25,
          collapsedState: new MockQ5mState(),
        };
        
        expect(isMeasurementResult(validResult)).toBe(true);
      });

      it('should return false for invalid objects', () => {
        const invalidResults = [
          null,
          undefined,
          'string',
          123,
          {},
          { measureIndex: 0 }, // missing required fields
          { measureIndex: 0, outcome: 1, probability: 1.5, collapsedState: {} }, // invalid probability
          { measureIndex: 0, outcome: 1, probability: -0.1, collapsedState: {} }, // invalid probability
          { measureIndex: 0, outcome: 1, probability: 0.5 }, // missing collapsedState
          { measureIndex: 'invalid', outcome: 1, probability: 0.5, collapsedState: {} }, // invalid measureIndex
        ];
        
        invalidResults.forEach(result => {
          expect(isMeasurementResult(result)).toBe(false);
        });
      });

      it('should handle optional fields correctly', () => {
        const resultWithOptionals = {
          measureIndex: 0,
          outcome: 1,
          probability: 0.8,
          collapsedState: new MockQ5mState(),
          basis: 'z',
          metadata: { basis: 'z' },
        };
        
        expect(isMeasurementResult(resultWithOptionals)).toBe(true);
      });
    });

    describe('isExecutionResult', () => {
      it('should return true for valid ExecutionResult', () => {
        const validResults = [
          { state: new MockQ5mState(), success: true, hasMeasurements: false },
          { state: new MockQ5mState(), success: false, error: 'Test error', hasMeasurements: false },
          { state: new MockQ5mState(), success: true, error: undefined, hasMeasurements: true, measurements: [] },
        ];
        
        validResults.forEach(result => {
          expect(isExecutionResult(result)).toBe(true);
        });
      });

      it('should return false for invalid objects', () => {
        const invalidResults = [
          null,
          undefined,
          'string',
          123,
          {},
          { success: true }, // missing state
          { state: new MockQ5mState() }, // missing success
          { state: null, success: true }, // null state
          { state: new MockQ5mState(), success: 'true' }, // invalid success type
          { state: new MockQ5mState(), success: true, error: 123 }, // invalid error type
        ];
        
        invalidResults.forEach(result => {
          expect(isExecutionResult(result)).toBe(false);
        });
      });
    });
  });

  describe('Validation Functions', () => {
    describe('validateProbability', () => {
      it('should return valid probabilities unchanged', () => {
        const validProbs = [0, 0.5, 1, 0.001, 0.999];
        
        validProbs.forEach(prob => {
          expect(validateProbability(prob)).toBe(prob);
        });
      });

      it('should throw error for invalid probabilities', () => {
        const invalidProbs = [-0.1, 1.1, 2, -1, NaN, Infinity, 'string'];
        
        invalidProbs.forEach(prob => {
          expect(() => validateProbability(prob)).toThrow('Invalid probability');
        });
      });

      it('should use custom name in error messages', () => {
        expect(() => validateProbability(-0.1, 'test probability'))
          .toThrow('Invalid test probability');
      });

      it('should include the invalid value in error message', () => {
        expect(() => validateProbability(1.5)).toThrow('got 1.5');
        expect(() => validateProbability('invalid')).toThrow('got invalid');
      });
    });

    describe('validateZeroOne', () => {
      it('should return valid ZeroOne values unchanged', () => {
        expect(validateZeroOne(0)).toBe(0);
        expect(validateZeroOne(1)).toBe(1);
      });

      it('should throw error for invalid values', () => {
        const invalidValues = [-1, 2, 0.5, 1.5, NaN, 'string', null];
        
        invalidValues.forEach(value => {
          expect(() => validateZeroOne(value)).toThrow('Invalid measurement outcome');
        });
      });

      it('should include the invalid value in error message', () => {
        expect(() => validateZeroOne(2)).toThrow('got 2');
        expect(() => validateZeroOne('invalid')).toThrow('got invalid');
      });
    });
  });

  describe('Factory Functions', () => {
    describe('createMeasurementResult', () => {
      it('should create valid MeasurementResult', () => {
        const params = {
          measureIndex: 0,
          outcome: 1,
          probability: 0.8,
          collapsedState: new MockQ5mState(),
        };
        
        const result = createMeasurementResult(params);
        
        expect(result.measureIndex).toBe(0);
        expect(result.outcome).toBe(1);
        expect(result.probability).toBe(0.8);
        expect(result.collapsedState).toBe(params.collapsedState);
      });

      it('should handle array measureIndex', () => {
        const params = {
          measureIndex: [0, 1, 2],
          outcome: '101',
          probability: 0.25,
          collapsedState: new MockQ5mState(),
        };
        
        const result = createMeasurementResult(params);
        
        expect(result.measureIndex).toEqual([0, 1, 2]);
        expect(result.outcome).toBe('101');
      });

      it('should include optional fields when provided', () => {
        const basis = 'hadamard';
        
        const metadata = { basis: 'hadamard', angle: Math.PI / 4 };
        
        const params = {
          measureIndex: [0, 1],
          outcome: '10',
          probability: 0.6,
          collapsedState: new MockQ5mState(),
          basis,
          metadata,
        };
        
        const result = createMeasurementResult(params);
        
        expect(result.basis).toBe(basis);
        expect(result.metadata).toBe(metadata);
      });

      it('should validate probability parameter', () => {
        const params = {
          measureIndex: 0,
          outcome: 1,
          probability: 1.5, // Invalid
          collapsedState: new MockQ5mState(),
        };
        
        expect(() => createMeasurementResult(params))
          .toThrow('Invalid measurement probability');
      });

      it('should omit optional fields when not provided', () => {
        const params = {
          measureIndex: 0,
          outcome: 1,
          probability: 0.8,
          collapsedState: new MockQ5mState(),
        };
        
        const result = createMeasurementResult(params);
        
        expect('basis' in result).toBe(false);
        expect('metadata' in result).toBe(false);
      });
    });

    describe('createSuccessResult', () => {
      it('should create successful ExecutionResult', () => {
        const state = new MockQ5mState();
        const result = createSuccessResult(state);
        
        expect(result.state).toBe(state);
        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should work with different state types', () => {
        const qubitState = QubitState.zero();
        const result = createSuccessResult(qubitState);
        
        expect(result.state).toBe(qubitState);
        expect(result.success).toBe(true);
      });
    });

    describe('createErrorResult', () => {
      it('should create failed ExecutionResult', () => {
        const state = new MockQ5mState();
        const errorMsg = 'Test error message';
        const result = createErrorResult(state, errorMsg);
        
        expect(result.state).toBe(state);
        expect(result.success).toBe(false);
        expect(result.error).toBe(errorMsg);
      });

      it('should handle different error messages', () => {
        const state = new MockQ5mState();
        const errors = [
          'Measurement failed',
          'Invalid gate operation',
          'Dimension mismatch',
          '',
        ];
        
        errors.forEach(errorMsg => {
          const result = createErrorResult(state, errorMsg);
          expect(result.error).toBe(errorMsg);
          expect(result.success).toBe(false);
        });
      });
    });
  });

  describe('Interface Implementations', () => {
    describe('Q5mExecutable', () => {
      it('should implement execute method', () => {
        const executable = new MockExecutable(true);
        const result = executable.execute();
        
        expect(isExecutionResult(result)).toBe(true);
        expect(result.success).toBe(true);
      });

      it('should implement run method', () => {
        const executable = new MockExecutable(true);
        const initialState = new MockQ5mState();
        const result = executable.run(initialState);
        
        expect(isExecutionResult(result)).toBe(true);
        expect(result.success).toBe(true);
        expect(result.state).toBe(initialState);
      });

      it('should handle execution failures', () => {
        const executable = new MockExecutable(false, 'Custom error');
        const result = executable.execute();
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Custom error');
      });
    });

    describe('Q5mMeasurable', () => {
      it('should implement measure method', () => {
        const measurable = new MockMeasurable();
        const state = new MockQ5mState();
        const result = measurable.measure(state, 0);
        
        expect(isMeasurementResult(result)).toBe(true);
        expect(result.measureIndex).toBe(0);
      });

      it('should implement probabilities method', () => {
        const measurable = new MockMeasurable();
        const state = new MockQ5mState();
        const probs = measurable.probabilities(state, 0);
        
        expect(isProbability(probs.prob0)).toBe(true);
        expect(isProbability(probs.prob1)).toBe(true);
        expect(probs.prob0 + probs.prob1).toBeCloseTo(1, 10);
      });

      it('should have basisName property', () => {
        const measurable = new MockMeasurable();
        expect(typeof measurable.basisName).toBe('string');
        expect(measurable.basisName).toBe('test');
      });
    });
  });

  describe('Integration with Real Types', () => {
    it('should work with QubitState', () => {
      const qubitState = QubitState.zero();
      
      // Test with ExecutionResult
      const successResult = createSuccessResult(qubitState);
      expect(isExecutionResult(successResult)).toBe(true);
      
      // Test with MeasurementResult
      const measurementResult = createMeasurementResult({
        measureIndex: 0,
        outcome: 0,
        probability: 1,
        collapsedState: qubitState,
      });
      expect(isMeasurementResult(measurementResult)).toBe(true);
    });

    it('should validate probabilities from real calculations', () => {
      // Test with probabilities that might come from quantum calculations
      const quantumProbs = [
        Math.sin(Math.PI / 8) ** 2,
        Math.cos(Math.PI / 8) ** 2,
        0.5,
        1 / 3,
      ];
      
      quantumProbs.forEach(prob => {
        expect(isProbability(prob)).toBe(true);
        expect(() => validateProbability(prob)).not.toThrow();
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle null and undefined gracefully', () => {
      expect(isMeasurementResult(null)).toBe(false);
      expect(isMeasurementResult(undefined)).toBe(false);
      expect(isExecutionResult(null)).toBe(false);
      expect(isExecutionResult(undefined)).toBe(false);
      
      expect(() => validateProbability(null)).toThrow();
      expect(() => validateProbability(undefined)).toThrow();
      expect(() => validateZeroOne(null)).toThrow();
      expect(() => validateZeroOne(undefined)).toThrow();
    });

    it('should handle edge case numbers', () => {
      // Test with special number values
      expect(isProbability(NaN)).toBe(false);
      expect(isProbability(Infinity)).toBe(false);
      expect(isProbability(-Infinity)).toBe(false);
      
      expect(isZeroOne(NaN)).toBe(false);
      expect(isZeroOne(Infinity)).toBe(false);
      expect(isZeroOne(-Infinity)).toBe(false);
    });

    it('should handle complex object structures', () => {
      const complexObject = {
        measureIndex: [0, 1],
        outcome: '10',
        probability: 0.25,
        collapsedState: new MockQ5mState(),
        metadata: {
          basis: 'computational',
          timestamp: new Date(),
          nested: {
            deep: {
              value: 42,
            },
          },
        },
      };
      
      expect(isMeasurementResult(complexObject)).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('should enforce type constraints at runtime', () => {
      // This test ensures our type guards work as intended
      const value: unknown = { measureIndex: 0, outcome: 1, probability: 0.5, collapsedState: {} };
      
      if (isMeasurementResult(value)) {
        // TypeScript should now know this is a MeasurementResult
        expect(typeof value.measureIndex).toBe('number');
        expect(typeof value.probability).toBe('number');
        expect(value.collapsedState).toBeDefined();
      }
    });

    it('should work with type narrowing', () => {
      const maybeProb: unknown = 0.5;
      
      if (isProbability(maybeProb)) {
        // TypeScript should now know this is a Probability (number)
        expect(maybeProb * 2).toBe(1.0);
      }
    });

    it('should work with union types', () => {
      const maybeZeroOne: unknown = 1;
      
      if (isZeroOne(maybeZeroOne)) {
        // TypeScript should now know this is ZeroOne (0 | 1)
        expect([0, 1]).toContain(maybeZeroOne);
      }
    });
  });

  describe('Performance Considerations', () => {
    it('should handle type guards efficiently', () => {
      const testObject = {
        measureIndex: 0,
        outcome: 1,
        probability: 0.8,
        collapsedState: new MockQ5mState(),
      };
      
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        isMeasurementResult(testObject);
        isProbability(0.5);
        isZeroOne(1);
        isExecutionResult({ state: new MockQ5mState(), success: true });
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });

    it('should create objects efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        createMeasurementResult({
          measureIndex: i,
          outcome: i % 2,
          probability: Math.random(),
          collapsedState: new MockQ5mState(),
        });
        
        createSuccessResult(new MockQ5mState());
        createErrorResult(new MockQ5mState(), `Error ${i}`);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Result factory functions with measurements', () => {
    it('should create successful execution result with measurements', () => {
      const state = new MockQ5mState();
      const measurements = [
        {
          measureIndex: 0,
          outcome: 1,
          probability: 0.7,
          collapsedState: state
        }
      ];
      
      const result = createSuccessResult(state, measurements);
      
      expect(result.success).toBe(true);
      expect(result.state).toBe(state);
      expect(result.hasMeasurements).toBe(true);
      expect(result.measurements).toEqual(measurements);
      expect(result.error).toBeUndefined();
    });

    it('should create successful execution result without measurements when none provided', () => {
      const state = new MockQ5mState();
      
      const result = createSuccessResult(state, undefined);
      
      expect(result.success).toBe(true);
      expect(result.state).toBe(state);
      expect(result.hasMeasurements).toBe(false);
      expect(result.measurements).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    it('should create failed execution result with measurements', () => {
      const state = new MockQ5mState();
      const measurements = [
        {
          measureIndex: 0,
          outcome: 0,
          probability: 0.5,
          collapsedState: state
        }
      ];
      
      const result = createErrorResult(state, 'Test error', measurements);
      
      expect(result.success).toBe(false);
      expect(result.state).toBe(state);
      expect(result.hasMeasurements).toBe(true);
      expect(result.measurements).toEqual(measurements);
      expect(result.error).toBe('Test error');
    });

    it('should create failed execution result without measurements when none provided', () => {
      const state = new MockQ5mState();
      
      const result = createErrorResult(state, 'Test error', undefined);
      
      expect(result.success).toBe(false);
      expect(result.state).toBe(state);
      expect(result.hasMeasurements).toBe(false);
      expect(result.measurements).toBeUndefined();
      expect(result.error).toBe('Test error');
    });
  });
});