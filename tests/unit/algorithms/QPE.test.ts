// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import {
  quantumPhaseEstimation,
  QPE,
  estimatePhase,
  decodePhaseEstimate,
  estimateControlQubits
} from '@/algorithms/QPE';
import { Circuit } from '@/core/Circuit';

describe('Phase Estimation', () => {
  it('should run quantum phase estimation', () => {
    const circuit = new Circuit(4); // 3 control + 1 target
    quantumPhaseEstimation(circuit, 0, 3, 3, 1, 'rz', { angle: Math.PI });
    
    const result = circuit.execute();
    expect(result).toBeDefined();
  });
  
  it('should create phase estimation circuit', () => {
    const circuit = QPE(3, 1, 'rz', { angle: Math.PI });
    expect(circuit).toBeDefined();
    
    const result = circuit.execute();
    expect(result).toBeDefined();
  });
  
  it('should estimate eigenstate phase', () => {
    const circuit = estimatePhase(3, 'rz', '0', { angle: Math.PI });
    expect(circuit).toBeDefined();
    
    const result = circuit.execute();
    expect(result).toBeDefined();
  });
  
  it('should decode phase estimate', () => {
    const measurement = 0;
    const numBits = 3;
    const phase = decodePhaseEstimate(measurement, numBits);
    expect(phase).toBe(0);
  });
  
  it('should decode non-zero phase estimate', () => {
    const measurement = 4; // binary 100
    const numBits = 3;
    const phase = decodePhaseEstimate(measurement, numBits);
    expect(phase).toBe(0.5);
  });
  
  it('should estimate control qubits needed', () => {
    const precision = 0.01;
    const qubits = estimateControlQubits(precision);
    expect(qubits).toBeGreaterThan(0);
  });

  describe('Error handling', () => {
    it('should throw error for invalid control qubits in createPhaseEstimationCircuit', () => {
      expect(() => QPE(0, 1)).toThrow('Number of control qubits must be at least 1');
    });

    it('should throw error for invalid target qubits in createPhaseEstimationCircuit', () => {
      expect(() => QPE(1, 0)).toThrow('Number of target qubits must be at least 1');
    });

    it('should throw error for invalid measurement in decodePhaseEstimate', () => {
      expect(() => decodePhaseEstimate(-1, 3)).toThrow('Measurement -1 is out of range for 3 bits');
      expect(() => decodePhaseEstimate(8, 3)).toThrow('Measurement 8 is out of range for 3 bits');
    });

    it('should throw error for invalid precision in estimateControlQubits', () => {
      expect(() => estimateControlQubits(0)).toThrow('Precision must be between 0 and 1');
      expect(() => estimateControlQubits(1)).toThrow('Precision must be between 0 and 1');
      expect(() => estimateControlQubits(-0.1)).toThrow('Precision must be between 0 and 1');
    });

    it('should throw error for invalid success probability in estimateControlQubits', () => {
      expect(() => estimateControlQubits(0.1, 0)).toThrow('Success probability must be between 0 and 1');
      expect(() => estimateControlQubits(0.1, 1)).toThrow('Success probability must be between 0 and 1');
      expect(() => estimateControlQubits(0.1, -0.1)).toThrow('Success probability must be between 0 and 1');
    });

    it('should throw error for RZ without angle parameter', () => {
      const circuit = new Circuit(4);
      expect(() => quantumPhaseEstimation(circuit, 0, 3, 3, 1, 'rz')).toThrow('RZ gate requires angle parameter');
    });

    it('should throw error for RY without angle parameter', () => {
      const circuit = new Circuit(4);
      expect(() => quantumPhaseEstimation(circuit, 0, 3, 3, 1, 'ry')).toThrow('RY gate requires angle parameter');
    });

    it('should throw error for RX without angle parameter', () => {
      const circuit = new Circuit(4);
      expect(() => quantumPhaseEstimation(circuit, 0, 3, 3, 1, 'rx')).toThrow('RX gate requires angle parameter');
    });

    it('should throw error for unsupported unitary', () => {
      const circuit = new Circuit(4);
      expect(() => quantumPhaseEstimation(circuit, 0, 3, 3, 1, 'unsupported')).toThrow('Unsupported unitary for controlled application: unsupported');
    });

    it('should throw error for unknown eigenstate type', () => {
      expect(() => estimatePhase(3, 'z', 'unknown' as any)).toThrow('Unknown eigenstate type: unknown');
    });

    it('should throw validation errors for quantum phase estimation', () => {
      // Test various validation errors
      let circuit = new Circuit(2);
      expect(() => quantumPhaseEstimation(circuit, 0, 0, 1, 1)).toThrow('Number of control qubits must be at least 1');
      
      circuit = new Circuit(2);
      expect(() => quantumPhaseEstimation(circuit, 0, 1, 1, 0)).toThrow('Number of target qubits must be at least 1');
      
      circuit = new Circuit(2);
      expect(() => quantumPhaseEstimation(circuit, -1, 1, 1, 1)).toThrow('Control start -1 out of range');
      
      circuit = new Circuit(2);
      expect(() => quantumPhaseEstimation(circuit, 0, 1, -1, 1)).toThrow('Target start -1 out of range');
      
      circuit = new Circuit(2);
      expect(() => quantumPhaseEstimation(circuit, 0, 1, 2, 1)).toThrow('Target start 2 out of range');
      
      circuit = new Circuit(2);
      expect(() => quantumPhaseEstimation(circuit, 0, 3, 1, 1)).toThrow('Control qubits exceed circuit size');
      
      circuit = new Circuit(2);
      expect(() => quantumPhaseEstimation(circuit, 0, 1, 1, 2)).toThrow('Target qubits exceed circuit size');
      
      circuit = new Circuit(3);
      expect(() => quantumPhaseEstimation(circuit, 0, 2, 1, 2)).toThrow('Control and target qubit ranges cannot overlap');
    });
  });

  describe('Different unitary gates', () => {
    it('should apply controlled Z gate', () => {
      const circuit = new Circuit(4);
      quantumPhaseEstimation(circuit, 0, 3, 3, 1, 'z');
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should apply controlled X gate', () => {
      const circuit = new Circuit(4);
      quantumPhaseEstimation(circuit, 0, 3, 3, 1, 'x');
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should apply controlled Y gate', () => {
      const circuit = new Circuit(4);
      quantumPhaseEstimation(circuit, 0, 3, 3, 1, 'y');
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should apply controlled H gate', () => {
      const circuit = new Circuit(4);
      quantumPhaseEstimation(circuit, 0, 3, 3, 1, 'h');
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should apply controlled S gate', () => {
      const circuit = new Circuit(4);
      quantumPhaseEstimation(circuit, 0, 3, 3, 1, 's');
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should apply controlled T gate', () => {
      const circuit = new Circuit(4);
      quantumPhaseEstimation(circuit, 0, 3, 3, 1, 't');
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should apply controlled RY gate', () => {
      const circuit = new Circuit(4);
      quantumPhaseEstimation(circuit, 0, 3, 3, 1, 'ry', { angle: Math.PI / 4 });
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should apply controlled RX gate', () => {
      const circuit = new Circuit(4);
      quantumPhaseEstimation(circuit, 0, 3, 3, 1, 'rx', { angle: Math.PI / 4 });
      const result = circuit.execute();
      expect(result).toBeDefined();
    });
  });

  describe('Different eigenstate types', () => {
    it('should prepare |0⟩ eigenstate', () => {
      const circuit = estimatePhase(3, 'z', '0');
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should prepare |1⟩ eigenstate', () => {
      const circuit = estimatePhase(3, 'z', '1');
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should prepare |+⟩ eigenstate', () => {
      const circuit = estimatePhase(3, 'x', '+');
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should prepare |-⟩ eigenstate', () => {
      const circuit = estimatePhase(3, 'x', '-');
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should prepare |i⟩ eigenstate', () => {
      const circuit = estimatePhase(3, 'y', 'i');
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should prepare |-i⟩ eigenstate', () => {
      const circuit = estimatePhase(3, 'y', '-i');
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should use default eigenstate type', () => {
      const circuit = estimatePhase(3, 'z'); // default eigenstate type
      const result = circuit.execute();
      expect(result).toBeDefined();
    });
  });

  describe('Default parameters and edge cases', () => {
    it('should use default parameters in quantumPhaseEstimation', () => {
      const circuit = new Circuit(4);
      quantumPhaseEstimation(circuit, 0, 3, 3, 1, 'z'); // Using z gate which doesn't need angle
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should use individual default parameters', () => {
      const circuit1 = new Circuit(4);
      quantumPhaseEstimation(circuit1, undefined, 3, 3, 1, 'z'); // default controlStart
      expect(circuit1.execute()).toBeDefined();

      const circuit2 = new Circuit(4);
      quantumPhaseEstimation(circuit2, 0, undefined, 3, 1, 'z'); // default numControl
      expect(circuit2.execute()).toBeDefined();

      const circuit3 = new Circuit(4);
      quantumPhaseEstimation(circuit3, 0, 3, 3, undefined, 'z'); // default numTarget
      expect(circuit3.execute()).toBeDefined();

      const circuit4 = new Circuit(4);
      // Default unitaryName is 'rz' which needs angle parameter, so it should throw
      expect(() => quantumPhaseEstimation(circuit4, 0, 3, 3, 1, undefined)).toThrow('RZ gate requires angle parameter');

      const circuit5 = new Circuit(4);
      quantumPhaseEstimation(circuit5, 0, 3, 3, 1, 'z', undefined); // default unitaryParams
      expect(circuit5.execute()).toBeDefined();
    });

    it('should handle parameter variations', () => {
      const circuit = new Circuit(6);
      // Test with specific values but testing default parameter paths
      quantumPhaseEstimation(circuit, 0, 2, 2, 2, 'z'); // Different numControl/numTarget
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should use default targetStart when undefined', () => {
      const circuit = new Circuit(4);
      quantumPhaseEstimation(circuit, 0, 3, undefined, 1, 'rz', { angle: Math.PI });
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle edge case measurements', () => {
      expect(decodePhaseEstimate(0, 1)).toBe(0);
      expect(decodePhaseEstimate(1, 1)).toBe(0.5);
      expect(decodePhaseEstimate(7, 3)).toBe(0.875);
    });

    it('should calculate control qubits for high precision', () => {
      const qubits1 = estimateControlQubits(0.001);
      expect(qubits1).toBeGreaterThan(10);
      
      const qubits2 = estimateControlQubits(0.1, 0.95);
      expect(qubits2).toBeGreaterThan(0);
    });

    it('should handle multiple target qubits', () => {
      const circuit = new Circuit(6);
      quantumPhaseEstimation(circuit, 0, 2, 2, 4, 'x'); // 2 control, 4 target qubits
      const result = circuit.execute();
      expect(result).toBeDefined();
    });
  });
});