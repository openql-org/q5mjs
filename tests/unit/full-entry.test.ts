// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import * as FullEntry from '@/full-entry';

describe('full-entry module', () => {
  describe('Single-Qubit Gate Classes', () => {
    it('should export all single-qubit gate classes', () => {
      const singleQubitGates = [
        'HadamardGate',
        'PauliXGate',
        'PauliYGate',
        'PauliZGate',
        'SGate',
        'TGate',
        'IdentityGate',
        'PhaseGate',
        'RotationXGate',
        'RotationYGate',
        'RotationZGate',
        'UnitaryGate',
      ] as const;

      singleQubitGates.forEach(gateName => {
        expect(FullEntry[gateName]).toBeDefined();
        expect(typeof FullEntry[gateName]).toBe('function');
      });
    });

    it('should create working single-qubit gate instances', () => {
      const hadamard = new FullEntry.HadamardGate();
      expect(hadamard.name).toBe('H');
      expect(hadamard.size).toBe(2);

      const pauliX = new FullEntry.PauliXGate();
      expect(pauliX.name).toBe('X');
      expect(pauliX.size).toBe(2);

      const phase = new FullEntry.PhaseGate(Math.PI / 4);
      expect(phase.name).toContain('P(');
      expect(phase.size).toBe(2);

      const rotationX = new FullEntry.RotationXGate(Math.PI / 2);
      expect(rotationX.name).toContain('RX(');
      expect(rotationX.size).toBe(2);
    });
  });

  describe('Two-Qubit Gate Classes', () => {
    it('should export all two-qubit gate classes', () => {
      const twoQubitGates = [
        'CNOTGate',
        'ControlledZGate',
        'ControlledYGate',
        'SWAPGate',
        'ControlledHadamardGate',
        'ControlledPhaseGate',
        'ControlledUnitaryGate',
      ] as const;

      twoQubitGates.forEach(gateName => {
        expect(FullEntry[gateName]).toBeDefined();
        expect(typeof FullEntry[gateName]).toBe('function');
      });
    });

    it('should create working two-qubit gate instances', () => {
      const cnot = new FullEntry.CNOTGate();
      expect(cnot.name).toBe('CNOT');
      expect(cnot.size).toBe(4);

      const cz = new FullEntry.ControlledZGate();
      expect(cz.name).toBe('CZ');
      expect(cz.size).toBe(4);

      const cp = new FullEntry.ControlledPhaseGate(Math.PI / 3);
      expect(cp.name).toContain('CP(');
      expect(cp.size).toBe(4);

      const swap = new FullEntry.SWAPGate();
      expect(swap.name).toBe('SWAP');
      expect(swap.size).toBe(4);
    });
  });

  describe('Multi-Qubit Gate Classes', () => {
    it('should export all multi-qubit gate classes', () => {
      const multiQubitGates = [
        'MultiQubitGate',
        'GlobalPhaseGate',
        'MultiHadamardGate',
        'createGlobalPhase',
        'createMultiHadamard',
      ] as const;

      multiQubitGates.forEach(gateName => {
        expect(FullEntry[gateName]).toBeDefined();
        expect(typeof FullEntry[gateName]).toBe('function');
      });
    });

    it('should create working multi-qubit gate instances', () => {
      const globalPhase = new FullEntry.GlobalPhaseGate(2, Math.PI / 4);
      expect(globalPhase.name).toBe('E');
      expect(globalPhase.size).toBe(4);

      const multiHadamard = new FullEntry.MultiHadamardGate(3, [0, 2]);
      expect(multiHadamard.name).toBe('HH');
      expect(multiHadamard.size).toBe(8);
    });

    it('should work with factory functions', () => {
      const globalPhase = FullEntry.createGlobalPhase(3, Math.PI / 6);
      expect(globalPhase).toBeInstanceOf(FullEntry.GlobalPhaseGate);
      expect(globalPhase.size).toBe(8);

      const multiHadamard = FullEntry.createMultiHadamard(4, [1, 3]);
      expect(multiHadamard).toBeInstanceOf(FullEntry.MultiHadamardGate);
      expect(multiHadamard.size).toBe(16);
    });
  });

  describe('Measurement Gate Classes', () => {
    it('should export all measurement gate classes', () => {
      const measureGates = [
        'MeasureGate',
        'MeasureZGate',
        'MeasureXGate',
        'MeasureYGate',
        'MeasurePhaseGate',
      ] as const;

      measureGates.forEach(gateName => {
        expect(FullEntry[gateName]).toBeDefined();
        expect(typeof FullEntry[gateName]).toBe('function');
      });
    });

    it('should create working measurement gate instances', () => {
      const mz = new FullEntry.MeasureZGate();
      expect(mz.name).toBe('Mz');
      expect(mz.basisName).toBe('computational');

      const mx = new FullEntry.MeasureXGate();
      expect(mx.name).toBe('Mx');
      expect(mx.basisName).toBe('hadamard');

      const my = new FullEntry.MeasureYGate();
      expect(my.name).toBe('My');
      expect(my.basisName).toBe('circular');

      const mp = new FullEntry.MeasurePhaseGate(Math.PI / 4, Math.PI / 6);
      expect(mp.name).toContain('Mp(');
      expect(mp.basisName).toContain('arbitrary');
    });
  });

  describe('Advanced Gate Features', () => {
    it('should support UnitaryGate with custom parameters', () => {
      const { complex } = require('@/math/complex');
      const alpha = complex(1, 0);
      const beta = complex(0, 1);
      
      const unitary = new FullEntry.UnitaryGate('Custom', alpha, beta);
      expect(unitary.name).toBe('Custom');
      expect(unitary.size).toBe(2);
      
      const amplitudes = unitary.getAmplitudes();
      expect(amplitudes.alpha.abs()).toBeCloseTo(1/Math.sqrt(2));
      expect(amplitudes.beta.abs()).toBeCloseTo(1/Math.sqrt(2));
    });

    it('should support ControlledUnitaryGate with custom parameters', () => {
      const { complex } = require('@/math/complex');
      const alpha = complex(1, 0);
      const beta = complex(0, 1);
      
      const controlledUnitary = new FullEntry.ControlledUnitaryGate('CustomCU', alpha, beta);
      expect(controlledUnitary.name).toBe('CustomCU');
      expect(controlledUnitary.size).toBe(4);
      
      const amplitudes = controlledUnitary.getAmplitudes();
      expect(amplitudes.alpha.abs()).toBeCloseTo(1/Math.sqrt(2));
      expect(amplitudes.beta.abs()).toBeCloseTo(1/Math.sqrt(2));
    });

    it('should support static factory methods', () => {
      const { complex } = require('@/math/complex');
      const alpha = complex(0.8, 0);
      const beta = complex(0.6, 0);
      
      const unitaryFromState = FullEntry.UnitaryGate.fromState('FromState', alpha, beta);
      expect(unitaryFromState.name).toBe('FromState');
      expect(unitaryFromState.size).toBe(2);

      const controlledFromRotation = FullEntry.ControlledUnitaryGate.fromRotation(
        'Rotation', Math.PI/3, 0, 0, 1
      );
      expect(controlledFromRotation.name).toBe('Rotation');
      expect(controlledFromRotation.size).toBe(4);
    });
  });

  describe('Gate Composition and Integration', () => {
    it('should work with QubitState from core', () => {
      const { QubitState } = require('@/core/QubitState');
      
      const state = new QubitState(1);
      const hadamard = new FullEntry.HadamardGate();
      
      // Test that gates can be applied (this requires proper gate interface)
      expect(hadamard.matrix.length).toBe(2);
      expect(hadamard.matrix[0]!.length).toBe(2);
    });

    it('should support gate matrix operations', () => {
      const hadamard = new FullEntry.HadamardGate();
      const pauliX = new FullEntry.PauliXGate();
      
      // Verify matrix structures
      expect(hadamard.matrix).toBeDefined();
      expect(hadamard.matrix.length).toBe(2);
      expect(pauliX.matrix).toBeDefined();
      expect(pauliX.matrix.length).toBe(2);
      
      // Verify unitarity (if accessible)
      expect(hadamard.size).toBe(2);
      expect(pauliX.size).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid gate parameters', () => {
      expect(() => new FullEntry.GlobalPhaseGate(0, 0)).toThrow();
      expect(() => new FullEntry.MultiHadamardGate(2, [])).toThrow();
      expect(() => new FullEntry.MultiHadamardGate(2, [5])).toThrow(); // Out of range
    });

    it('should validate controlled gate parameters', () => {
      const { complex } = require('@/math/complex');
      
      expect(() => {
        new FullEntry.ControlledUnitaryGate('', complex(0, 0), complex(0, 0));
      }).toThrow(); // Zero amplitudes
    });
  });

  describe('Performance and Memory', () => {
    it('should create gates efficiently', () => {
      const start = performance.now();
      
      const gates = [
        new FullEntry.HadamardGate(),
        new FullEntry.CNOTGate(),
        new FullEntry.GlobalPhaseGate(2, Math.PI/4),
        new FullEntry.MultiHadamardGate(3, [0, 1]),
      ];
      
      const end = performance.now();
      
      expect(end - start).toBeLessThan(50); // Should create quickly
      expect(gates.length).toBe(4);
      gates.forEach(gate => {
        expect(gate).toBeDefined();
        expect(gate.matrix).toBeDefined();
      });
    });

    it('should handle reasonable gate sizes without memory issues', () => {
      // Test moderate sizes that should work fine
      const globalPhase4 = new FullEntry.GlobalPhaseGate(4, Math.PI/3);
      expect(globalPhase4.size).toBe(16);
      
      const multiHadamard4 = new FullEntry.MultiHadamardGate(4, [0, 2]);
      expect(multiHadamard4.size).toBe(16);
      
      // Verify matrices are properly initialized
      expect(globalPhase4.matrix).toBeDefined();
      expect(multiHadamard4.matrix).toBeDefined();
    });
  });

  describe('Module Structure', () => {
    it('should NOT re-export core-entry functionality', () => {
      // full-entry should ONLY contain detailed gate classes
      const shouldNotExist = [
        'Circuit', 'QubitState', 'Complex', 'complex',
        'H', 'X', 'CNOT', 'CX', // gate instances
        'VERSION', 'isProbability' // utility functions
      ] as const;
      
      shouldNotExist.forEach(exportName => {
        expect(FullEntry[exportName as keyof typeof FullEntry]).toBeUndefined();
      });
    });

    it('should focus on detailed gate class exports', () => {
      const fullEntryKeys = Object.keys(FullEntry);
      
      // Should have detailed gate classes
      expect(fullEntryKeys).toContain('HadamardGate');
      expect(fullEntryKeys).toContain('CNOTGate');
      expect(fullEntryKeys).toContain('GlobalPhaseGate');
      expect(fullEntryKeys).toContain('MeasureZGate');
      
      // Should NOT have core functionality
      expect(fullEntryKeys).not.toContain('Circuit');
      expect(fullEntryKeys).not.toContain('QubitState');
      expect(fullEntryKeys).not.toContain('Complex');
    });
  });

  describe('Additional Function Tests', () => {
    it('should export Q5m core classes', () => {
      expect(FullEntry.Q5mObserver).toBeDefined();
      expect(FullEntry.Q5mState).toBeDefined();
      expect(FullEntry.Q5mGate).toBeDefined();
      expect(FullEntry.Q5mOperator).toBeDefined();
      
      expect(typeof FullEntry.Q5mObserver).toBe('function');
      expect(typeof FullEntry.Q5mState).toBe('function');
      expect(typeof FullEntry.Q5mGate).toBe('function');
      expect(typeof FullEntry.Q5mOperator).toBe('function');
    });

    it('should export RepType enum', () => {
      expect(FullEntry.RepType).toBeDefined();
      expect(typeof FullEntry.RepType).toBe('object');
      // RepType is an enum with string values
      expect(FullEntry.RepType.DENSE).toBe('dense');
      expect(FullEntry.RepType.SPARSE).toBe('sparse');
      expect(FullEntry.RepType.CSR).toBe('csr');
    });

    it('should export version constants', () => {
      expect(FullEntry.CURRENT_VERSION).toBeDefined();
      expect(FullEntry.SUPPORTED_VERSIONS).toBeDefined();
      expect(typeof FullEntry.CURRENT_VERSION).toBe('string');
      expect(Array.isArray(FullEntry.SUPPORTED_VERSIONS)).toBe(true);
    });

    it('should export Q5mIndex validation', () => {
      expect(FullEntry.isValidQ5mIndex).toBeDefined();
      expect(typeof FullEntry.isValidQ5mIndex).toBe('function');
      
      // Test validation
      expect(FullEntry.isValidQ5mIndex(0)).toBe(true);
      expect(FullEntry.isValidQ5mIndex(1)).toBe(true);
      expect(FullEntry.isValidQ5mIndex(-1)).toBe(false);
      expect(FullEntry.isValidQ5mIndex(1.5)).toBe(false);
    });

    it('should test all gate constructors with edge cases', () => {
      // Test Pauli gates
      const pauliY = new FullEntry.PauliYGate();
      const pauliZ = new FullEntry.PauliZGate();
      expect(pauliY.name).toBe('Y');
      expect(pauliZ.name).toBe('Z');
      
      // Test S and T gates
      const sGate = new FullEntry.SGate();
      const tGate = new FullEntry.TGate();
      expect(sGate.name).toBe('S');
      expect(tGate.name).toBe('T');
      
      // Test rotation gates with various angles
      const rx0 = new FullEntry.RotationXGate(0);
      const rxPi = new FullEntry.RotationXGate(Math.PI);
      const rx2Pi = new FullEntry.RotationXGate(2 * Math.PI);
      expect(rx0.name).toContain('RX(');
      expect(rxPi.name).toContain('RX(');
      expect(rx2Pi.name).toContain('RX(');
      
      const ry0 = new FullEntry.RotationYGate(0);
      const ryPi = new FullEntry.RotationYGate(Math.PI);
      expect(ry0.name).toContain('RY(');
      expect(ryPi.name).toContain('RY(');
      
      const rz0 = new FullEntry.RotationZGate(0);
      const rzPi = new FullEntry.RotationZGate(Math.PI);
      expect(rz0.name).toContain('RZ(');
      expect(rzPi.name).toContain('RZ(');
    });

    it('should test controlled gates with various parameters', () => {
      const cy = new FullEntry.ControlledYGate();
      const ch = new FullEntry.ControlledHadamardGate();
      
      expect(cy.name).toBe('CY');
      expect(cy.size).toBe(4);
      expect(ch.name).toBe('CH');
      expect(ch.size).toBe(4);
      
      // Test controlled phase with different angles
      const cp0 = new FullEntry.ControlledPhaseGate(0);
      const cpPi = new FullEntry.ControlledPhaseGate(Math.PI);
      const cp2Pi = new FullEntry.ControlledPhaseGate(2 * Math.PI);
      
      expect(cp0.name).toContain('CP(');
      expect(cpPi.name).toContain('CP(');
      expect(cp2Pi.name).toContain('CP(');
    });

    it('should test Q5mState class export', () => {
      // Just verify the class is exported correctly
      expect(FullEntry.Q5mState).toBeDefined();
      expect(typeof FullEntry.Q5mState).toBe('function');
      
      // Test that RepType values work
      expect(FullEntry.RepType.DENSE).toBe('dense');
      expect(FullEntry.RepType.SPARSE).toBe('sparse');
      expect(FullEntry.RepType.CSR).toBe('csr');
    });

    it('should test Q5mObserver functionality', () => {
      // Q5mObserver is a class with static methods for measurement
      expect(FullEntry.Q5mObserver).toBeDefined();
      expect(typeof FullEntry.Q5mObserver).toBe('function');
      
      // Test static methods if available
      if (FullEntry.Q5mObserver.getAvailableBases) {
        const bases = FullEntry.Q5mObserver.getAvailableBases();
        expect(Array.isArray(bases)).toBe(true);
      }
    });

    it('should test Q5mGate functionality', () => {
      // Q5mGate is an abstract base class
      expect(FullEntry.Q5mGate).toBeDefined();
      expect(typeof FullEntry.Q5mGate).toBe('function');
      
      // Cannot instantiate abstract class directly
      // Just verify it's exported as a constructor function
    });

    it('should test Q5mOperator functionality', () => {
      const { complex } = require('@/math/complex');
      
      // Create a Q5mOperator with matrix  
      const negI = complex(0, -1); // -i
      const matrix = [[complex(1, 0), complex(0, 1)], [negI, complex(1, 0)]];
      const operator = new FullEntry.Q5mOperator(matrix);
      
      expect(operator).toBeDefined();
      expect(operator.dimension).toBe(2);
    });

    it('should test UnitaryGate static methods', () => {
      const { complex } = require('@/math/complex');
      
      // Test fromState with normalized amplitudes
      const alpha = complex(1, 0);
      const beta = complex(0, 0);
      const stateGate = FullEntry.UnitaryGate.fromState('StateGate', alpha, beta);
      expect(stateGate).toBeDefined();
      expect(stateGate.name).toBe('StateGate');
      expect(stateGate).toBeInstanceOf(FullEntry.UnitaryGate);
    });

    it('should test MeasureGate base class', () => {
      // MeasureGate is abstract, test through concrete implementations
      const mz = new FullEntry.MeasureZGate();
      expect(mz).toBeDefined();
      expect(mz.basisName).toBe('computational');
      expect(mz.name).toBe('Mz');
    });

    it('should test measurement gates with different configurations', () => {
      // Test phase measurement with various angles
      const mp1 = new FullEntry.MeasurePhaseGate(0, 0);
      const mp2 = new FullEntry.MeasurePhaseGate(Math.PI / 2, 0);
      const mp3 = new FullEntry.MeasurePhaseGate(0, Math.PI / 2);
      const mp4 = new FullEntry.MeasurePhaseGate(Math.PI, Math.PI);
      
      expect(mp1.basisName).toContain('arbitrary');
      expect(mp2.basisName).toContain('arbitrary');
      expect(mp3.basisName).toContain('arbitrary');
      expect(mp4.basisName).toContain('arbitrary');
    });

    it('should test MultiQubitGate abstract class through concrete implementations', () => {
      // GlobalPhaseGate extends MultiQubitGate
      const global = new FullEntry.GlobalPhaseGate(3, Math.PI / 4);
      expect(global).toBeInstanceOf(FullEntry.MultiQubitGate);
      expect(global.numQubits).toBe(3);
      
      // MultiHadamardGate extends MultiQubitGate
      const multiH = new FullEntry.MultiHadamardGate(4, [0, 1, 2]);
      expect(multiH).toBeInstanceOf(FullEntry.MultiQubitGate);
      expect(multiH.numQubits).toBe(4);
    });

    it('should test gate matrix properties', () => {
      const identity = new FullEntry.IdentityGate();
      const hadamard = new FullEntry.HadamardGate();
      const pauliX = new FullEntry.PauliXGate();
      const cnot = new FullEntry.CNOTGate();
      const swap = new FullEntry.SWAPGate();
      
      // Check matrix dimensions
      expect(identity.matrix.length).toBe(2);
      expect(identity.matrix[0]!.length).toBe(2);
      
      expect(hadamard.matrix.length).toBe(2);
      expect(hadamard.matrix[0]!.length).toBe(2);
      
      expect(pauliX.matrix.length).toBe(2);
      expect(pauliX.matrix[0]!.length).toBe(2);
      
      expect(cnot.matrix.length).toBe(4);
      expect(cnot.matrix[0]!.length).toBe(4);
      
      expect(swap.matrix.length).toBe(4);
      expect(swap.matrix[0]!.length).toBe(4);
    });

    it('should test edge cases for multi-qubit gates', () => {
      // Test with minimum qubits
      const global1 = new FullEntry.GlobalPhaseGate(1, Math.PI);
      expect(global1.numQubits).toBe(1);
      expect(global1.size).toBe(2);
      
      // Test with single position
      const multiH1 = new FullEntry.MultiHadamardGate(3, [1]);
      expect(multiH1.numQubits).toBe(3);
      expect(multiH1.size).toBe(8);
      
      // Test with consecutive positions
      const multiH2 = new FullEntry.MultiHadamardGate(4, [0, 1, 2, 3]);
      expect(multiH2.numQubits).toBe(4);
      expect(multiH2.size).toBe(16);
    });

    it('should test gate parameter validation', () => {
      const { complex } = require('@/math/complex');
      
      // Test PhaseGate with boundary angles
      const p0 = new FullEntry.PhaseGate(0);
      const pPi = new FullEntry.PhaseGate(Math.PI);
      const p2Pi = new FullEntry.PhaseGate(2 * Math.PI);
      const pNegPi = new FullEntry.PhaseGate(-Math.PI);
      
      expect(p0).toBeDefined();
      expect(pPi).toBeDefined();
      expect(p2Pi).toBeDefined();
      expect(pNegPi).toBeDefined();
      
      // Test UnitaryGate with edge case amplitudes
      const smallAlpha = complex(0.01, 0);
      const largeBeta = complex(0.99 * Math.cos(Math.PI), 0.99 * Math.sin(Math.PI));
      const edgeUnitary = new FullEntry.UnitaryGate('EdgeCase', smallAlpha, largeBeta);
      expect(edgeUnitary).toBeDefined();
    });

    it('should test factory function variations', () => {
      // Test createGlobalPhase with various parameters
      const gp1 = FullEntry.createGlobalPhase(1, 0);
      const gp2 = FullEntry.createGlobalPhase(2, Math.PI / 2);
      const gp3 = FullEntry.createGlobalPhase(3, -Math.PI);
      
      expect(gp1).toBeInstanceOf(FullEntry.GlobalPhaseGate);
      expect(gp2).toBeInstanceOf(FullEntry.GlobalPhaseGate);
      expect(gp3).toBeInstanceOf(FullEntry.GlobalPhaseGate);
      
      // Test createMultiHadamard with various configurations
      const mh1 = FullEntry.createMultiHadamard(2, [0]);
      const mh2 = FullEntry.createMultiHadamard(3, [0, 2]);
      const mh3 = FullEntry.createMultiHadamard(4, [1, 2, 3]);
      
      expect(mh1).toBeInstanceOf(FullEntry.MultiHadamardGate);
      expect(mh2).toBeInstanceOf(FullEntry.MultiHadamardGate);
      expect(mh3).toBeInstanceOf(FullEntry.MultiHadamardGate);
    });
  });
});