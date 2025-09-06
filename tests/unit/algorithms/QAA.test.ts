// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import {
  QAA,
  findOptimalIterations,
  createCompositeOracle,
  estimateSuccessProbability,
  countMarkedStates,
  createUniformSuperposition,
  calculateTheoreticalOptimal,
  calculateTheoreticalProbability,
  type AmplitudeOracle,
  type StatePreparation
} from '@/algorithms/QAA';
import { Circuit } from '@/core/Circuit';

describe('Amplitude Amplification', () => {
  describe('Basic Algorithm Functionality', () => {
    it('should run amplitude amplification with explicit iterations', () => {
      const oracle = (input: string) => input === '01';
      
      const circuit = QAA(2, oracle, { iterations: 1 });
      expect(circuit).toBeDefined();
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should run amplitude amplification with auto-calculated iterations', () => {
      const oracle = (input: string) => input === '11';
      
      // No iterations specified - should auto-calculate
      const circuit = QAA(2, oracle);
      expect(circuit).toBeDefined();
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle custom state preparation', () => {
      const oracle = (input: string) => input === '10';
      const customStatePrep: StatePreparation = (circuit: Circuit) => {
        circuit.h(0);  // First qubit in superposition
        // Second qubit stays |0⟩
      };
      
      const circuit = QAA(2, oracle, { 
        statePreparation: customStatePrep,
        iterations: 1 
      });
      expect(circuit).toBeDefined();
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle optimization mode', () => {
      const oracle = (input: string) => input === '001';
      
      const circuit = QAA(3, oracle, { 
        optimize: true,
        tolerance: 1e-8
      });
      expect(circuit).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid number of qubits', () => {
      const oracle = (input: string) => input === '0';
      
      expect(() => {
        QAA(0, oracle);
      }).toThrow('Number of qubits must be at least 1');
      
      expect(() => {
        QAA(-1, oracle);
      }).toThrow('Number of qubits must be at least 1');
    });

    it('should throw error when no marked states are reachable', () => {
      // Oracle that marks states not reachable from uniform superposition
      const impossibleOracle = (input: string) => false; // Marks no states
      
      expect(() => {
        QAA(2, impossibleOracle);
      }).toThrow('No marked states reachable from initial state');
    });

    it('should throw error for invalid target probability in findOptimalIterations', () => {
      const oracle = (input: string) => input === '01';
      
      expect(() => {
        findOptimalIterations(2, oracle, -0.1);
      }).toThrow('Target probability must be between 0 and 1');
      
      expect(() => {
        findOptimalIterations(2, oracle, 1.1);
      }).toThrow('Target probability must be between 0 and 1');
    });

    it('should throw error for empty oracle list in composite oracle', () => {
      expect(() => {
        createCompositeOracle([]);
      }).toThrow('At least one oracle function is required');
    });

    it('should throw error for unknown operation in composite oracle', () => {
      const oracles = [(input: string) => input === '01'];
      
      expect(() => {
        // @ts-expect-error Testing invalid operation type
        const compositeOracle = createCompositeOracle(oracles, 'INVALID' as any);
        // Call the oracle to test the error in the switch statement
        compositeOracle('01');
      }).toThrow('Unknown operation: INVALID');
    });
  });

  describe('Multi-Qubit Cases', () => {
    it('should handle single qubit amplitude amplification', () => {
      const oracle = (input: string) => input === '1';
      
      const circuit = QAA(1, oracle, { iterations: 1 });
      expect(circuit).toBeDefined();
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle 3-qubit amplitude amplification', () => {
      const oracle = (input: string) => input === '101';
      
      const circuit = QAA(3, oracle, { iterations: 2 });
      expect(circuit).toBeDefined();
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle 4+ qubit amplitude amplification', () => {
      const oracle = (input: string) => input === '1010';
      
      const circuit = QAA(4, oracle, { iterations: 1 });
      expect(circuit).toBeDefined();
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });
  });

  describe('Oracle Variations', () => {
    it('should handle oracle that marks state "0" for single qubit', () => {
      const oracle = (input: string) => input === '0';
      
      const circuit = QAA(1, oracle, { iterations: 1 });
      expect(circuit).toBeDefined();
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle oracle that marks multiple states', () => {
      const oracle = (input: string) => input.startsWith('1');
      
      const circuit = QAA(2, oracle, { iterations: 1 });
      expect(circuit).toBeDefined();
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle oracle with complex patterns', () => {
      const oracle = (input: string) => {
        // Mark states with equal number of 0s and 1s for 4-qubit system
        const ones = input.split('').filter(bit => bit === '1').length;
        return ones === 2;
      };
      
      const circuit = QAA(4, oracle, { iterations: 1 });
      expect(circuit).toBeDefined();
    });
  });

  describe('Success Probability Estimation', () => {
    it('should estimate success probability with default state preparation', () => {
      const oracle = (input: string) => input === '01';
      
      const probability = estimateSuccessProbability(2, oracle, 1);
      expect(probability).toBeGreaterThanOrEqual(0);
      expect(probability).toBeLessThanOrEqual(1);
      expect(typeof probability).toBe('number');
    });

    it('should estimate success probability with custom state preparation', () => {
      const oracle = (input: string) => input === '10';
      const customStatePrep: StatePreparation = (circuit: Circuit) => {
        circuit.h(0);
        circuit.h(1);
      };
      
      const probability = estimateSuccessProbability(2, oracle, 1, customStatePrep);
      expect(probability).toBeGreaterThanOrEqual(0);
      expect(probability).toBeLessThanOrEqual(1);
    });

    it('should handle zero iterations in success probability estimation', () => {
      const oracle = (input: string) => input === '11';
      
      const probability = estimateSuccessProbability(2, oracle, 0);
      expect(probability).toBeGreaterThanOrEqual(0);
      expect(probability).toBeLessThanOrEqual(1);
    });
  });

  describe('Optimal Iterations Finding', () => {
    it('should find optimal iterations for different target probabilities', () => {
      const oracle = (input: string) => input === '01';
      
      const iterations50 = findOptimalIterations(2, oracle, 0.5);
      const iterations90 = findOptimalIterations(2, oracle, 0.9);
      const iterations95 = findOptimalIterations(2, oracle, 0.95);
      
      expect(iterations50).toBeGreaterThanOrEqual(0);
      expect(iterations90).toBeGreaterThanOrEqual(0);
      expect(iterations95).toBeGreaterThanOrEqual(0);
    });

    it('should find optimal iterations with custom max iterations', () => {
      const oracle = (input: string) => input === '111';
      
      const iterations = findOptimalIterations(3, oracle, 0.8, undefined, 50);
      expect(iterations).toBeGreaterThanOrEqual(0);
      expect(iterations).toBeLessThanOrEqual(50);
    });

    it('should find optimal iterations with custom state preparation', () => {
      const oracle = (input: string) => input === '10';
      const customStatePrep: StatePreparation = (circuit: Circuit) => {
        circuit.h(0);
        // Second qubit stays |0⟩
      };
      
      const iterations = findOptimalIterations(2, oracle, 0.7, customStatePrep);
      expect(iterations).toBeGreaterThanOrEqual(0);
    });

    it('should handle boundary target probabilities', () => {
      const oracle = (input: string) => input === '00';
      
      const iterationsMin = findOptimalIterations(2, oracle, 0.01);
      const iterationsMax = findOptimalIterations(2, oracle, 0.99);
      
      expect(iterationsMin).toBeGreaterThanOrEqual(0);
      expect(iterationsMax).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Composite Oracle Functionality', () => {
    it('should create AND composite oracle', () => {
      const oracle1 = (input: string) => input.startsWith('1');
      const oracle2 = (input: string) => input.endsWith('1');
      
      const compositeOracle = createCompositeOracle([oracle1, oracle2], 'AND');
      
      expect(compositeOracle('11')).toBe(true);  // Both conditions met
      expect(compositeOracle('10')).toBe(false); // Only first condition met
      expect(compositeOracle('01')).toBe(false); // Only second condition met
      expect(compositeOracle('00')).toBe(false); // Neither condition met
    });

    it('should create OR composite oracle', () => {
      const oracle1 = (input: string) => input === '01';
      const oracle2 = (input: string) => input === '10';
      
      const compositeOracle = createCompositeOracle([oracle1, oracle2], 'OR');
      
      expect(compositeOracle('01')).toBe(true);
      expect(compositeOracle('10')).toBe(true);
      expect(compositeOracle('00')).toBe(false);
      expect(compositeOracle('11')).toBe(false);
    });

    it('should create XOR composite oracle', () => {
      const oracle1 = (input: string) => input.includes('1');
      const oracle2 = (input: string) => input.includes('0');
      
      const compositeOracle = createCompositeOracle([oracle1, oracle2], 'XOR');
      
      // Test XOR logic: true when exactly one condition is met
      expect(compositeOracle('1')).toBe(true);   // Only first condition (has '1', no '0')
      expect(compositeOracle('0')).toBe(true);   // Only second condition (has '0', no '1')  
      expect(compositeOracle('10')).toBe(false); // Both conditions met (has both '1' and '0')
      expect(compositeOracle('')).toBe(false);   // Neither condition met
    });

    it('should handle single oracle in composite', () => {
      const oracle = (input: string) => input === '11';
      
      const compositeAnd = createCompositeOracle([oracle], 'AND');
      const compositeOr = createCompositeOracle([oracle], 'OR');
      const compositeXor = createCompositeOracle([oracle], 'XOR');
      
      expect(compositeAnd('11')).toBe(true);
      expect(compositeOr('11')).toBe(true);
      expect(compositeXor('11')).toBe(true);
      
      expect(compositeAnd('00')).toBe(false);
      expect(compositeOr('00')).toBe(false);
      expect(compositeXor('00')).toBe(false);
    });

    it('should handle three oracles in composite operations', () => {
      const oracle1 = (input: string) => input.includes('1');
      const oracle2 = (input: string) => input.includes('0');
      const oracle3 = (input: string) => input.length === 3;
      
      const compositeAnd = createCompositeOracle([oracle1, oracle2, oracle3], 'AND');
      const compositeOr = createCompositeOracle([oracle1, oracle2, oracle3], 'OR');
      
      expect(compositeAnd('101')).toBe(true);  // Has 1, has 0, length 3
      expect(compositeOr('111')).toBe(true);   // Has 1, no 0, but length 3
      expect(compositeOr('10')).toBe(true);    // Has 1, has 0, but length 2
    });
  });

  describe('Integration with Circuit Execution', () => {
    it('should produce valid quantum states after amplitude amplification', () => {
      const oracle = (input: string) => input === '10';
      
      const circuit = QAA(2, oracle, { iterations: 1 });
      const result = circuit.execute();
      
      // Check that state is properly normalized
      const stateAmplitudes = result.state.amplitudes();
      const totalProbability = stateAmplitudes.reduce((sum, amp) => sum + amp.abs() ** 2, 0);
      
      expect(Math.abs(totalProbability - 1.0)).toBeLessThan(1e-10);
    });

    it('should amplify target states', () => {
      const oracle = (input: string) => input === '11';
      
      // Without amplitude amplification - uniform superposition
      const baseCircuit = new Circuit(2);
      baseCircuit.h(0);
      baseCircuit.h(1);
      const baseResult = baseCircuit.execute();
      const baseAmplitudes = baseResult.state.amplitudes();
      const baseProbability = baseAmplitudes[3]!.abs() ** 2; // State |11⟩ = index 3
      
      // With amplitude amplification
      const ampCircuit = QAA(2, oracle, { iterations: 1 });
      const ampResult = ampCircuit.execute();
      const ampAmplitudes = ampResult.state.amplitudes();
      const ampProbability = ampAmplitudes[3]!.abs() ** 2;
      
      // Amplitude amplification should increase the probability
      expect(ampProbability).toBeGreaterThan(baseProbability);
    });
  });

  describe('New Utility Functions', () => {
    it('should count marked states correctly', () => {
      const oracle1 = (input: string) => input.startsWith('1');
      expect(countMarkedStates(2, oracle1)).toBe(2); // '10', '11'
      expect(countMarkedStates(3, oracle1)).toBe(4); // '100', '101', '110', '111'

      const oracle2 = (input: string) => input === '101';
      expect(countMarkedStates(3, oracle2)).toBe(1);

      const oracle3 = (input: string) => false;
      expect(countMarkedStates(2, oracle3)).toBe(0);
    });

    it('should create uniform superposition state preparation', () => {
      const prep1 = createUniformSuperposition(1);
      const prep2 = createUniformSuperposition(3);
      
      expect(prep1).toBeInstanceOf(Function);
      expect(prep2).toBeInstanceOf(Function);
      
      // Test that it actually applies the correct gates
      const circuit = new Circuit(2);
      createUniformSuperposition(2)(circuit);
      
      expect(circuit.instructions.length).toBe(2); // Two H gates
      expect(circuit.instructions[0]!.gate.name).toBe('H');
      expect(circuit.instructions[1]!.gate.name).toBe('H');
    });

    it('should calculate theoretical optimal iterations', () => {
      expect(calculateTheoreticalOptimal(4, 1)).toBe(1); // 2-qubit, 1 marked
      expect(calculateTheoreticalOptimal(8, 1)).toBe(2); // 3-qubit, 1 marked  
      expect(calculateTheoreticalOptimal(16, 1)).toBe(3); // 4-qubit, 1 marked
      expect(calculateTheoreticalOptimal(4, 2)).toBe(1); // 2-qubit, 2 marked
      
      expect(() => calculateTheoreticalOptimal(8, 0)).toThrow('Invalid number of marked items');
      expect(() => calculateTheoreticalOptimal(8, 9)).toThrow('Invalid number of marked items');
    });

    it('should calculate theoretical probability', () => {
      // Test with known values
      const prob1 = calculateTheoreticalProbability(4, 1, 1); // 2-qubit, 1 marked, 1 iteration
      expect(prob1).toBeGreaterThan(0.5);
      expect(prob1).toBeLessThanOrEqual(1.0); // Allow for perfect probability
      
      const prob2 = calculateTheoreticalProbability(4, 1, 0); // 0 iterations should return initial probability
      expect(prob2).toBeCloseTo(0.25, 3);
      
      // Test edge cases
      expect(() => calculateTheoreticalProbability(8, 0, 1)).toThrow('Invalid number of marked items');
      expect(() => calculateTheoreticalProbability(8, 9, 1)).toThrow('Invalid number of marked items');
    });

    it('should handle theoretical calculations with multiple marked states', () => {
      const optimal = calculateTheoreticalOptimal(8, 4); // 3-qubit, 4 marked (half)
      expect(optimal).toBe(1);
      
      const prob = calculateTheoreticalProbability(8, 4, optimal);
      expect(prob).toBeGreaterThan(0.4); // Should be reasonable with optimal iterations  
      expect(prob).toBeLessThanOrEqual(1.0); // Should not exceed 1
    });
  });
});