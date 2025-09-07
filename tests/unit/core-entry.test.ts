// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import * as CoreEntry from '@/core-entry';

describe('core-entry module', () => {
  describe('Core Classes', () => {
    it('should export essential core classes', () => {
      expect(CoreEntry.Circuit).toBeDefined();
      expect(CoreEntry.QubitState).toBeDefined();
      expect(CoreEntry.Qubit).toBeDefined();
      expect(CoreEntry.UnitaryOperator).toBeDefined();
      expect(CoreEntry.HermitianOperator).toBeDefined();
    });
  });

  describe('Gate Instances and Factories', () => {
    it('should export single-qubit gate instances', () => {
      const singleQubitInstances = ['H', 'X', 'Y', 'Z', 'S', 'T', 'Identity'] as const;
      
      singleQubitInstances.forEach(gateName => {
        expect(CoreEntry[gateName]).toBeDefined();
        expect(typeof CoreEntry[gateName]).toBe('object');
      });
    });

    it('should export single-qubit gate factories', () => {
      const singleQubitFactories = ['PH', 'RX', 'RY', 'RZ'] as const;
      
      singleQubitFactories.forEach(gateName => {
        expect(CoreEntry[gateName]).toBeDefined();
        expect(typeof CoreEntry[gateName]).toBe('function');
      });
    });

    it('should export two-qubit gate instances', () => {
      const twoQubitInstances = ['CNOT', 'CX', 'CZ', 'CY', 'CH', 'SWAP'] as const;
      
      twoQubitInstances.forEach(gateName => {
        expect(CoreEntry[gateName]).toBeDefined();
        expect(typeof CoreEntry[gateName]).toBe('object');
      });
    });

    it('should export two-qubit gate factories', () => {
      const twoQubitFactories = ['CP', 'CU'] as const;
      
      twoQubitFactories.forEach(gateName => {
        expect(CoreEntry[gateName]).toBeDefined();
        expect(typeof CoreEntry[gateName]).toBe('function');
      });
    });

    it('should export multi-qubit gate instances and factories', () => {
      expect(CoreEntry.HH).toBeDefined();
      expect(typeof CoreEntry.HH).toBe('function');
      expect(CoreEntry.EE).toBeDefined();
      expect(typeof CoreEntry.EE).toBe('function');
    });

    it('should export measurement gate factories', () => {
      const measureFactories = ['Mz', 'Mx', 'My', 'Mp'] as const;
      
      measureFactories.forEach(gateName => {
        expect(CoreEntry[gateName]).toBeDefined();
        expect(typeof CoreEntry[gateName]).toBe('function');
      });
    });
  });

  describe('Complex Number System', () => {
    it('should export complex number system', () => {
      expect(CoreEntry.Complex).toBeDefined();
      expect(CoreEntry.complex).toBeDefined();
      expect(CoreEntry.ZERO).toBeDefined();
      expect(CoreEntry.ONE).toBeDefined();
      expect(CoreEntry.I).toBeDefined();
    });
  });

  describe('Math Utilities', () => {
    it('should export math utilities', () => {
      expect(CoreEntry.isValidAmplitude).toBeDefined();
      expect(CoreEntry.createAmplitude).toBeDefined();
      expect(CoreEntry.normalizeAmplitudes).toBeDefined();
      expect(CoreEntry.isUnitary).toBeDefined();
      expect(CoreEntry.createUnitary).toBeDefined();
      expect(CoreEntry.isHermitian).toBeDefined();
      expect(CoreEntry.createHermitian).toBeDefined();
      expect(CoreEntry.parseAngle).toBeDefined();
      expect(CoreEntry.formatAmplitude).toBeDefined();
      expect(CoreEntry.normalize).toBeDefined();
      expect(CoreEntry.innerP).toBeDefined();
      expect(CoreEntry.tensorP).toBeDefined();
      expect(CoreEntry.matXvec).toBeDefined();
      expect(CoreEntry.matXmat).toBeDefined();
    });

    it('should export dagger operation', () => {
      expect(CoreEntry.dagger).toBeDefined();
    });
  });

  describe('Utility Functions', () => {
    it('should export QubitIndex utilities', () => {
      expect(CoreEntry.isValidQubitIndex).toBeDefined();
    });

    it('should export Results utilities', () => {
      expect(CoreEntry.isProbability).toBeDefined();
      expect(CoreEntry.isZeroOne).toBeDefined();
      expect(CoreEntry.isMeasurementResult).toBeDefined();
      expect(CoreEntry.isExecutionResult).toBeDefined();
    });
  });

  describe('Version', () => {
    it('should export VERSION constant', () => {
      expect(CoreEntry.VERSION).toBeDefined();
      expect(typeof CoreEntry.VERSION).toBe('string');
      expect(CoreEntry.VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('Functional Tests', () => {
    it('should create working circuit with exported gates', () => {
      const circuit = new CoreEntry.Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      expect(circuit.numQubits).toBe(2);
      expect(circuit.instructions.length).toBe(2);
    });

    it('should create working qubit states', () => {
      const qubitState = new CoreEntry.QubitState(1);
      expect(qubitState.quantumCount()).toBe(1);
      
      const qubit = new CoreEntry.Qubit(2);
      expect(qubit.getStateNum()).toBe(2);
    });

    it('should create working complex numbers', () => {
      const c = CoreEntry.complex(1, 1);
      expect(c.re).toBe(1);
      expect(c.im).toBe(1);
      expect(c.abs()).toBeCloseTo(Math.sqrt(2));
    });

    it('should have working gate factories', () => {
      const phaseGate = CoreEntry.PH(Math.PI / 4);
      expect(phaseGate.name).toContain('P(');
      
      const rxGate = CoreEntry.RX(Math.PI / 2);
      expect(rxGate.name).toContain('RX(');
      
      const cpGate = CoreEntry.CP(Math.PI / 3);
      expect(cpGate.name).toContain('CP(');
    });

    it('should have working measurement factories', () => {
      const mz = CoreEntry.Mz();
      const mx = CoreEntry.Mx();
      const mp = CoreEntry.Mp(Math.PI / 4, Math.PI / 6);
      
      expect(mz.name).toBe('Mz');
      expect(mx.name).toBe('Mx');
      expect(mp.name).toContain('Mp(');
    });

    it('should have working multi-qubit factories', () => {
      const globalPhase = CoreEntry.EE(2, Math.PI / 4);
      const multiHadamard = CoreEntry.HH(3, [0, 2]);
      
      expect(globalPhase.size).toBe(4);
      expect(multiHadamard.size).toBe(8);
    });

    it('should validate types correctly', () => {
      expect(CoreEntry.isProbability(0.5)).toBe(true);
      expect(CoreEntry.isProbability(-0.1)).toBe(false);
      expect(CoreEntry.isZeroOne(1)).toBe(true);
      expect(CoreEntry.isZeroOne(2)).toBe(false);
      expect(CoreEntry.isValidQubitIndex(0)).toBe(true);
      expect(CoreEntry.isValidQubitIndex(-1)).toBe(false);
    });

    it('should work with math utilities', () => {
      const amplitudes = [CoreEntry.complex(1, 0), CoreEntry.complex(1, 0)];
      const normalized = CoreEntry.normalizeAmplitudes(amplitudes);
      
      expect(normalized[0]!.abs()).toBeCloseTo(1 / Math.sqrt(2));
      expect(normalized[1]!.abs()).toBeCloseTo(1 / Math.sqrt(2));
    });

    it('should integrate components correctly', () => {
      const circuit = new CoreEntry.Circuit(1);
      circuit.h(0);
      const result = circuit.execute();
      
      expect(result.success).toBe(true);
      expect(result.state).toBeInstanceOf(CoreEntry.QubitState);
    });
  });

  describe('Bundle Size Considerations', () => {
    it('should NOT export detailed gate classes (lightweight bundle)', () => {
      const detailedGateClasses = [
        'HadamardGate', 'PauliXGate', 'CNOTGate', 'GlobalPhaseGate',
        'MeasureZGate', 'MultiQubitGate'
      ] as const;
      
      detailedGateClasses.forEach(gateName => {
        expect(CoreEntry[gateName as keyof typeof CoreEntry]).toBeUndefined();
      });
    });

    it('should have essential exports only', () => {
      const coreEntryKeys = Object.keys(CoreEntry);
      
      // Should have core classes
      expect(coreEntryKeys).toContain('Circuit');
      expect(coreEntryKeys).toContain('QubitState');
      expect(coreEntryKeys).toContain('Complex');
      
      // Should have gate instances/factories
      expect(coreEntryKeys).toContain('H');
      expect(coreEntryKeys).toContain('CNOT');
      expect(coreEntryKeys).toContain('HH');
      expect(coreEntryKeys).toContain('EE');
      
      // Should NOT have detailed gate classes
      expect(coreEntryKeys).not.toContain('HadamardGate');
      expect(coreEntryKeys).not.toContain('CNOTGate');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid inputs gracefully', () => {
      expect(() => new CoreEntry.Circuit(-1)).toThrow();
      expect(() => new CoreEntry.QubitState(0)).toThrow();
      expect(() => CoreEntry.complex(NaN, 0)).not.toThrow(); // Should handle gracefully
    });

    it('should handle edge cases in factories', () => {
      expect(() => CoreEntry.RX(0)).not.toThrow();
      expect(() => CoreEntry.PH(2 * Math.PI)).not.toThrow();
      expect(() => CoreEntry.EE(1, 0)).not.toThrow();
      expect(() => CoreEntry.HH(2, [])).toThrow(); // Empty positions should throw
    });
  });

  describe('Performance Characteristics', () => {
    it('should load exports quickly', () => {
      const start = performance.now();
      const { Circuit, QubitState, H, CNOT } = CoreEntry;
      const end = performance.now();
      
      expect(end - start).toBeLessThan(10); // Should load in < 10ms
      expect(Circuit).toBeDefined();
      expect(QubitState).toBeDefined();
      expect(H).toBeDefined();
      expect(CNOT).toBeDefined();
    });

    it('should create instances efficiently', () => {
      const start = performance.now();
      const circuit = new CoreEntry.Circuit(3);
      const state = new CoreEntry.QubitState(2);
      const complex = CoreEntry.complex(1, 1);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(5); // Should create in < 5ms
      expect(circuit).toBeDefined();
      expect(state).toBeDefined();
      expect(complex).toBeDefined();
    });
  });

  describe('Additional Function Tests', () => {
    it('should test Tdg and Sdg gate instances', () => {
      expect(CoreEntry.Tdg).toBeDefined();
      expect(CoreEntry.Sdg).toBeDefined();
      expect(typeof CoreEntry.Tdg).toBe('object');
      expect(typeof CoreEntry.Sdg).toBe('object');
      
      // Verify these are conjugate gates
      expect(CoreEntry.Tdg.name).toBe('Tdg');
      expect(CoreEntry.Sdg.name).toBe('Sdg');
    });

    it('should test all operator constructors', () => {
      const unitaryOp = new CoreEntry.UnitaryOperator([[CoreEntry.ONE, CoreEntry.ZERO], [CoreEntry.ZERO, CoreEntry.ONE]]);
      expect(unitaryOp).toBeDefined();
      expect(unitaryOp.dimension).toBe(2);
      
      const hermitianOp = new CoreEntry.HermitianOperator([[CoreEntry.ONE, CoreEntry.ZERO], [CoreEntry.ZERO, CoreEntry.ONE]]);
      expect(hermitianOp).toBeDefined();
      expect(hermitianOp.dimension).toBe(2);
    });

    it('should test complex number edge cases', () => {
      // Test ZERO and ONE constants
      expect(CoreEntry.ZERO.re).toBe(0);
      expect(CoreEntry.ZERO.im).toBe(0);
      expect(CoreEntry.ONE.re).toBe(1);
      expect(CoreEntry.ONE.im).toBe(0);
      expect(CoreEntry.I.re).toBe(0);
      expect(CoreEntry.I.im).toBe(1);
      
      // Test complex operations
      const c1 = CoreEntry.complex(3, 4);
      expect(c1.abs()).toBe(5);
      expect(c1.conjugate().im).toBe(-4);
      
      const c2 = CoreEntry.complex(1, -1);
      const sum = c1.add(c2);
      expect(sum.re).toBe(4);
      expect(sum.im).toBe(3);
    });

    it('should test amplitude validation and creation', () => {
      const validAmp = CoreEntry.complex(0.6, 0.8);
      expect(CoreEntry.isValidAmplitude(validAmp)).toBe(true);
      
      const invalidAmp = CoreEntry.complex(2, 0);
      expect(CoreEntry.isValidAmplitude(invalidAmp)).toBe(false);
      
      const createdAmp = CoreEntry.createAmplitude(1, 0);
      expect(createdAmp).toBeDefined();
      expect(createdAmp.abs()).toBeCloseTo(1);
    });

    it('should test matrix operations', () => {
      const vec = [CoreEntry.ONE, CoreEntry.ZERO];
      const mat = [[CoreEntry.ONE, CoreEntry.I], [CoreEntry.I, CoreEntry.ONE]];
      
      // Test matrix-vector multiplication
      const result = CoreEntry.matXvec(mat, vec);
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      
      // Test matrix-matrix multiplication
      const mat2 = [[CoreEntry.ONE, CoreEntry.ZERO], [CoreEntry.ZERO, CoreEntry.ONE]];
      const matResult = CoreEntry.matXmat(mat, mat2);
      expect(matResult).toBeDefined();
      expect(matResult.length).toBe(2);
      expect(matResult[0]!.length).toBe(2);
      
      // Test dagger operation
      const daggerMat = CoreEntry.dagger(mat);
      expect(daggerMat).toBeDefined();
      expect(daggerMat[0]![1]!.im).toBe(-mat[1]![0]!.im);
    });

    it('should test inner and tensor products', () => {
      const vec1 = [CoreEntry.complex(1, 0), CoreEntry.complex(0, 0)];
      const vec2 = [CoreEntry.complex(0, 0), CoreEntry.complex(1, 0)];
      
      // Test inner product
      const inner = CoreEntry.innerP(vec1, vec2);
      expect(inner).toBeDefined();
      expect(inner.re).toBe(0);
      
      // Test tensor product
      const tensor = CoreEntry.tensorP(vec1, vec2);
      expect(tensor).toBeDefined();
      expect(tensor.length).toBe(4);
    });

    it('should test angle parsing', () => {
      const angle1 = CoreEntry.parseAngle(Math.PI);
      expect(angle1).toBeCloseTo(Math.PI);
      
      const angle2 = CoreEntry.parseAngle('pi');
      expect(angle2).toBeCloseTo(Math.PI);
      
      const angle3 = CoreEntry.parseAngle('pi/2');
      expect(angle3).toBeCloseTo(Math.PI / 2);
      
      const angle4 = CoreEntry.parseAngle('2*pi');
      expect(angle4).toBeCloseTo(2 * Math.PI);
    });

    it('should test amplitude formatting', () => {
      const amp = CoreEntry.complex(0.5, 0.5);
      const formatted = CoreEntry.formatAmplitude(amp);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('0.5');
    });

    it('should test normalization', () => {
      const vec = [CoreEntry.complex(1, 0), CoreEntry.complex(1, 0)];
      const normalized = CoreEntry.normalize(vec);
      expect(normalized).toBeDefined();
      expect(normalized.length).toBe(2);
      
      // Check normalization
      const norm = Math.sqrt(
        normalized[0]!.abs() ** 2 + normalized[1]!.abs() ** 2
      );
      expect(norm).toBeCloseTo(1);
    });

    it('should test unitary and hermitian validation', () => {
      const identityMat = [[CoreEntry.ONE, CoreEntry.ZERO], [CoreEntry.ZERO, CoreEntry.ONE]];
      expect(CoreEntry.isUnitary(identityMat)).toBe(true);
      expect(CoreEntry.isHermitian(identityMat)).toBe(true);
      
      const nonUnitary = [[CoreEntry.complex(2, 0), CoreEntry.ZERO], [CoreEntry.ZERO, CoreEntry.ONE]];
      expect(CoreEntry.isUnitary(nonUnitary)).toBe(false);
      
      const unitary = CoreEntry.createUnitary(identityMat);
      expect(unitary).toBeDefined();
      
      const hermitian = CoreEntry.createHermitian(identityMat);
      expect(hermitian).toBeDefined();
    });

    it('should test measurement result validation', () => {
      // isMeasurementResult requires measureIndex, outcome, probability, and collapsedState
      const validResult = { 
        measureIndex: 0,
        outcome: 0, 
        probability: 0.5,
        collapsedState: { amplitudes: [], sparse: false }
      };
      expect(CoreEntry.isMeasurementResult(validResult)).toBe(true);
      
      const invalidResult = { outcome: 0, probability: 0.5 }; // Missing required fields
      expect(CoreEntry.isMeasurementResult(invalidResult)).toBe(false);
      
      const executionResult = { 
        success: true, 
        state: new CoreEntry.QubitState(1),
        hasMeasurements: false
      };
      expect(CoreEntry.isExecutionResult(executionResult)).toBe(true);
    });

    it('should test complex gate interactions', () => {
      const circuit = new CoreEntry.Circuit(2);
      
      // Apply various gates
      circuit.h(0);
      circuit.s(0);
      circuit.t(0);
      circuit.sdg(0);
      circuit.tdg(0);
      circuit.cnot(0, 1);
      circuit.cz(0, 1);
      circuit.swap(0, 1);
      
      expect(circuit.instructions.length).toBe(8);
      
      // Test gate factory methods
      const rxGate = CoreEntry.RX(Math.PI / 4);
      const ryGate = CoreEntry.RY(Math.PI / 4);
      const rzGate = CoreEntry.RZ(Math.PI / 4);
      
      expect(rxGate).toBeDefined();
      expect(ryGate).toBeDefined();
      expect(rzGate).toBeDefined();
    });

    it('should test multi-qubit operations with edge cases', () => {
      // Test HH with all qubits
      const allQubitsHH = CoreEntry.HH(3, [0, 1, 2]);
      expect(allQubitsHH).toBeDefined();
      expect(allQubitsHH.size).toBe(8);
      
      // Test EE with different angles
      const globalPhase1 = CoreEntry.EE(2, 0);
      const globalPhase2 = CoreEntry.EE(2, Math.PI);
      const globalPhase3 = CoreEntry.EE(2, -Math.PI);
      
      expect(globalPhase1).toBeDefined();
      expect(globalPhase2).toBeDefined();
      expect(globalPhase3).toBeDefined();
    });

    it('should test measurement in different bases', () => {
      const circuit = new CoreEntry.Circuit(1);
      
      // Prepare superposition
      circuit.h(0);
      
      // Test different measurement bases
      const mz = CoreEntry.Mz();
      const mx = CoreEntry.Mx();
      const my = CoreEntry.My();
      const mp1 = CoreEntry.Mp(0, 0);
      const mp2 = CoreEntry.Mp(Math.PI / 2, Math.PI / 4);
      
      expect(mz.basisName).toBe('computational');
      expect(mx.basisName).toBe('hadamard');
      expect(my.basisName).toBe('circular');
      expect(mp1.basisName).toContain('arbitrary');
      expect(mp2.basisName).toContain('arbitrary');
    });
  });
});