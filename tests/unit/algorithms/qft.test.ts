// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import {
  quantumFourierTransform,
  QFT,
  qftEncode
} from '@/algorithms/qft';
import { Circuit } from '@/core/Circuit';

describe('Quantum Fourier Transform', () => {
  describe('quantumFourierTransform', () => {
    it('should apply forward QFT to circuit with default parameters', () => {
      const circuit = new Circuit(3);
      quantumFourierTransform(circuit);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
      expect(circuit.quantumCount()).toBe(3);
    });

    it('should apply forward QFT with specified startQubit and numQubits', () => {
      const circuit = new Circuit(4);
      quantumFourierTransform(circuit, 1, 2);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
      expect(circuit.quantumCount()).toBe(4);
    });

    it('should apply forward QFT with startQubit but undefined numQubits', () => {
      const circuit = new Circuit(4);
      quantumFourierTransform(circuit, 1, undefined);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should apply inverse QFT when inverse=true', () => {
      const circuit = new Circuit(3);
      quantumFourierTransform(circuit, 0, 3, true);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should apply inverse QFT with different startQubit', () => {
      const circuit = new Circuit(5);
      quantumFourierTransform(circuit, 2, 2, true);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle single qubit QFT', () => {
      const circuit = new Circuit(1);
      quantumFourierTransform(circuit, 0, 1, false);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle single qubit inverse QFT', () => {
      const circuit = new Circuit(1);
      quantumFourierTransform(circuit, 0, 1, true);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should throw error for negative startQubit', () => {
      const circuit = new Circuit(3);
      expect(() => {
        quantumFourierTransform(circuit, -1);
      }).toThrow('Invalid start qubit: -1');
    });

    it('should throw error for startQubit >= totalQubits', () => {
      const circuit = new Circuit(3);
      expect(() => {
        quantumFourierTransform(circuit, 3);
      }).toThrow('Invalid start qubit: 3');
    });

    it('should throw error when QFT range exceeds circuit size', () => {
      const circuit = new Circuit(3);
      expect(() => {
        quantumFourierTransform(circuit, 1, 3);
      }).toThrow('QFT range exceeds circuit size');
    });

    it('should throw error when startQubit + numQubits > totalQubits', () => {
      const circuit = new Circuit(4);
      expect(() => {
        quantumFourierTransform(circuit, 2, 3);
      }).toThrow('QFT range exceeds circuit size');
    });
  });

  describe('QFT', () => {
    it('should create forward QFT circuit with default inverse=false', () => {
      const qftCircuit = QFT(3);
      expect(qftCircuit).toBeDefined();
      expect(qftCircuit.quantumCount()).toBe(3);
      
      const result = qftCircuit.execute();
      expect(result).toBeDefined();
    });

    it('should create forward QFT circuit with explicit inverse=false', () => {
      const qftCircuit = QFT(2, false);
      expect(qftCircuit).toBeDefined();
      expect(qftCircuit.quantumCount()).toBe(2);
      
      const result = qftCircuit.execute();
      expect(result).toBeDefined();
    });

    it('should create inverse QFT circuit', () => {
      const qftCircuit = QFT(3, true);
      expect(qftCircuit).toBeDefined();
      expect(qftCircuit.quantumCount()).toBe(3);
      
      const result = qftCircuit.execute();
      expect(result).toBeDefined();
    });

    it('should create single qubit QFT circuit', () => {
      const qftCircuit = QFT(1);
      expect(qftCircuit).toBeDefined();
      expect(qftCircuit.quantumCount()).toBe(1);
    });

    it('should throw error for numQubits < 1', () => {
      expect(() => {
        QFT(0);
      }).toThrow('Number of targets must be at least 1');
    });

    it('should throw error for negative numQubits', () => {
      expect(() => {
        QFT(-1);
      }).toThrow('Number of targets must be at least 1');
    });
  });

  describe('qftEncode', () => {
    it('should encode value 0', () => {
      const circuit = qftEncode(0, 3);
      expect(circuit).toBeDefined();
      expect(circuit.quantumCount()).toBe(3);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should encode value 5 in 3 qubits', () => {
      const value = 5; // Binary 101
      const numQubits = 3;
      const circuit = qftEncode(value, numQubits);
      
      expect(circuit).toBeDefined();
      expect(circuit.quantumCount()).toBe(numQubits);
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should encode maximum value for given qubits', () => {
      const numQubits = 4;
      const maxValue = Math.pow(2, numQubits) - 1; // 15 for 4 qubits
      const circuit = qftEncode(maxValue, numQubits);
      
      expect(circuit).toBeDefined();
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should encode value 1 in single qubit', () => {
      const circuit = qftEncode(1, 1);
      expect(circuit).toBeDefined();
      expect(circuit.quantumCount()).toBe(1);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should throw error for numQubits < 1', () => {
      expect(() => {
        qftEncode(1, 0);
      }).toThrow('Number of qubits must be at least 1');
    });

    it('should throw error for negative numQubits', () => {
      expect(() => {
        qftEncode(1, -1);
      }).toThrow('Number of qubits must be at least 1');
    });

    it('should throw error for negative value', () => {
      expect(() => {
        qftEncode(-1, 3);
      }).toThrow('Value must be an integer between 0 and 7');
    });

    it('should throw error for value exceeding maximum', () => {
      expect(() => {
        qftEncode(8, 3); // 8 > 2^3 - 1 = 7
      }).toThrow('Value must be an integer between 0 and 7');
    });

    it('should throw error for non-integer value', () => {
      expect(() => {
        qftEncode(2.5, 3);
      }).toThrow('Value must be an integer between 0 and 7');
    });

    it('should throw error for value exactly at maxValue + 1', () => {
      const numQubits = 2;
      const maxValue = Math.pow(2, numQubits) - 1; // 3
      expect(() => {
        qftEncode(maxValue + 1, numQubits); // 4
      }).toThrow('Value must be an integer between 0 and 3');
    });
  });

  describe('edge cases and integration', () => {
    it('should work with 2-qubit circuits for all combinations', () => {
      const circuit = new Circuit(2);
      
      // Test forward QFT
      quantumFourierTransform(circuit, 0, 2, false);
      let result = circuit.execute();
      expect(result).toBeDefined();

      // Test inverse QFT on fresh circuit
      const circuit2 = new Circuit(2);
      quantumFourierTransform(circuit2, 0, 2, true);
      result = circuit2.execute();
      expect(result).toBeDefined();
    });

    it('should handle circuits with odd number of qubits for swapping', () => {
      const circuit = new Circuit(5);
      quantumFourierTransform(circuit, 0, 5, false);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle inverse QFT with odd number of qubits', () => {
      const circuit = new Circuit(5);
      quantumFourierTransform(circuit, 0, 5, true);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should work on partial circuit ranges', () => {
      const circuit = new Circuit(6);
      // Apply QFT to middle 3 qubits
      quantumFourierTransform(circuit, 1, 3, false);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });
  });
});