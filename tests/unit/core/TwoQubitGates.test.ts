// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import {
  CNOTGate,
  ControlledZGate,
  ControlledYGate,
  SWAPGate,
  ControlledHadamardGate,
  ControlledPhaseGate,
  ControlledUnitaryGate,
  CNOT,
  CX,
  CZ,
  CY,
  CH,
  SWAP,
  CP,
  CU,
} from '@/core/TwoQubitGates';
import { QubitState } from '@/core/QubitState';
import { HadamardGate, PauliXGate, PauliYGate, PauliZGate } from '@/core/OneQubitGates';
import { complex, ONE, ZERO } from '@/math/complex';

describe('TwoQubitGates', () => {
  describe('CNOTGate', () => {
    let cnot: CNOTGate;

    beforeEach(() => {
      cnot = new CNOTGate();
    });

    it('should have correct name and matrix size', () => {
      expect(cnot.name).toBe('CNOT');
      expect(cnot.matrix).toHaveLength(4);
      expect(cnot.matrix[0]).toHaveLength(4);
      expect(cnot.size).toBe(4);
    });

    it('should have correct matrix structure for CNOT', () => {
      const expected = [
        [ONE, ZERO, ZERO, ZERO],
        [ZERO, ONE, ZERO, ZERO],
        [ZERO, ZERO, ZERO, ONE],
        [ZERO, ZERO, ONE, ZERO],
      ];
      
      cnot.matrix.forEach((row, i) => {
        row.forEach((element, j) => {
          expect(element.re).toBeCloseTo(expected[i][j].re, 10);
          expect(element.im).toBeCloseTo(expected[i][j].im, 10);
        });
      });
    });

    it('should leave |00⟩ unchanged', () => {
      const state = new QubitState(2, [ONE, ZERO, ZERO, ZERO]);
      const result = cnot.applyTo(state);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[2].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[3].abs()).toBeCloseTo(0, 10);
    });

    it('should leave |01⟩ unchanged', () => {
      const state = new QubitState(2, [ZERO, ONE, ZERO, ZERO]);
      const result = cnot.applyTo(state);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[2].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[3].abs()).toBeCloseTo(0, 10);
    });

    it('should flip |10⟩ to |11⟩', () => {
      const state = new QubitState(2, [ZERO, ZERO, ONE, ZERO]);
      const result = cnot.applyTo(state);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[2].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[3].abs()).toBeCloseTo(1, 10);
    });

    it('should flip |11⟩ to |10⟩', () => {
      const state = new QubitState(2, [ZERO, ZERO, ZERO, ONE]);
      const result = cnot.applyTo(state);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[2].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[3].abs()).toBeCloseTo(0, 10);
    });

    it('should create Bell state from H|0⟩⊗|0⟩', () => {
      // First apply Hadamard to create superposition: (|00⟩ + |10⟩)/√2
      const superposition = new QubitState(2, [
        complex(1/Math.sqrt(2), 0),
        ZERO,
        complex(1/Math.sqrt(2), 0),
        ZERO
      ]);
      
      const bellState = cnot.applyTo(superposition);
      const amplitudes = bellState.amplitudes();
      
      // Should result in (|00⟩ + |11⟩)/√2
      expect(amplitudes[0].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[2].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[3].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
    });

    it('should be self-inverse', () => {
      const state = new QubitState(2);
      const first = cnot.applyTo(state);
      const second = cnot.applyTo(first);
      
      const originalAmps = state.amplitudes();
      const finalAmps = second.amplitudes();
      
      originalAmps.forEach((amp, i) => {
        expect(finalAmps[i].re).toBeCloseTo(amp.re, 10);
        expect(finalAmps[i].im).toBeCloseTo(amp.im, 10);
      });
    });
  });

  describe('ControlledZGate', () => {
    let cz: ControlledZGate;

    beforeEach(() => {
      cz = new ControlledZGate();
    });

    it('should have correct name and matrix size', () => {
      expect(cz.name).toBe('CZ');
      expect(cz.matrix).toHaveLength(4);
      expect(cz.size).toBe(4);
    });

    it('should have correct matrix structure for CZ', () => {
      const expected = [
        [ONE, ZERO, ZERO, ZERO],
        [ZERO, ONE, ZERO, ZERO],
        [ZERO, ZERO, ONE, ZERO],
        [ZERO, ZERO, ZERO, complex(-1, 0)],
      ];
      
      cz.matrix.forEach((row, i) => {
        row.forEach((element, j) => {
          expect(element.re).toBeCloseTo(expected[i][j].re, 10);
          expect(element.im).toBeCloseTo(expected[i][j].im, 10);
        });
      });
    });

    it('should leave |00⟩, |01⟩, |10⟩ unchanged', () => {
      const states = [
        [ONE, ZERO, ZERO, ZERO],    // |00⟩
        [ZERO, ONE, ZERO, ZERO],    // |01⟩
        [ZERO, ZERO, ONE, ZERO],    // |10⟩
      ];

      states.forEach((stateAmps, index) => {
        const state = new QubitState(2, stateAmps);
        const result = cz.applyTo(state);
        const amplitudes = result.amplitudes();
        
        stateAmps.forEach((expectedAmp, i) => {
          expect(amplitudes[i].re).toBeCloseTo(expectedAmp.re, 10);
          expect(amplitudes[i].im).toBeCloseTo(expectedAmp.im, 10);
        });
      });
    });

    it('should apply phase flip to |11⟩', () => {
      const state = new QubitState(2, [ZERO, ZERO, ZERO, ONE]);
      const result = cz.applyTo(state);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[2].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[3].re).toBeCloseTo(-1, 10);
      expect(amplitudes[3].im).toBeCloseTo(0, 10);
    });

    it('should be symmetric', () => {
      // CZ should be symmetric with respect to control and target
      const state = new QubitState(2, [
        complex(0.5, 0),
        complex(0.5, 0),
        complex(0.5, 0),
        complex(0.5, 0)
      ]);
      
      const result = cz.applyTo(state);
      const amplitudes = result.amplitudes();
      
      // Only the |11⟩ component should be phase flipped
      expect(amplitudes[0].re).toBeCloseTo(0.5, 10);
      expect(amplitudes[1].re).toBeCloseTo(0.5, 10);
      expect(amplitudes[2].re).toBeCloseTo(0.5, 10);
      expect(amplitudes[3].re).toBeCloseTo(-0.5, 10);
    });

    it('should be self-inverse', () => {
      const state = new QubitState(2);
      const first = cz.applyTo(state);
      const second = cz.applyTo(first);
      
      const originalAmps = state.amplitudes();
      const finalAmps = second.amplitudes();
      
      originalAmps.forEach((amp, i) => {
        expect(finalAmps[i].re).toBeCloseTo(amp.re, 10);
        expect(finalAmps[i].im).toBeCloseTo(amp.im, 10);
      });
    });
  });

  describe('ControlledYGate', () => {
    let cy: ControlledYGate;

    beforeEach(() => {
      cy = new ControlledYGate();
    });

    it('should have correct name and matrix size', () => {
      expect(cy.name).toBe('CY');
      expect(cy.matrix).toHaveLength(4);
      expect(cy.size).toBe(4);
    });

    it('should leave |00⟩ and |01⟩ unchanged', () => {
      const states = [
        [ONE, ZERO, ZERO, ZERO],    // |00⟩
        [ZERO, ONE, ZERO, ZERO],    // |01⟩
      ];

      states.forEach((stateAmps) => {
        const state = new QubitState(2, stateAmps);
        const result = cy.applyTo(state);
        const amplitudes = result.amplitudes();
        
        stateAmps.forEach((expectedAmp, i) => {
          expect(amplitudes[i].re).toBeCloseTo(expectedAmp.re, 10);
          expect(amplitudes[i].im).toBeCloseTo(expectedAmp.im, 10);
        });
      });
    });

    it('should transform |10⟩ to -i|11⟩', () => {
      const state = new QubitState(2, [ZERO, ZERO, ONE, ZERO]);
      const result = cy.applyTo(state);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[2].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[3].re).toBeCloseTo(0, 10);
      expect(amplitudes[3].im).toBeCloseTo(1, 10); // Y matrix has +i in [1,0] position
    });

    it('should transform |11⟩ to i|10⟩', () => {
      const state = new QubitState(2, [ZERO, ZERO, ZERO, ONE]);
      const result = cy.applyTo(state);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[2].re).toBeCloseTo(0, 10);
      expect(amplitudes[2].im).toBeCloseTo(-1, 10); // Y matrix has -i in [0,1] position
      expect(amplitudes[3].abs()).toBeCloseTo(0, 10);
    });

    it('should apply Pauli-Y when control is |1⟩', () => {
      const superposition = new QubitState(2, [
        ZERO,
        ZERO,
        complex(1/Math.sqrt(2), 0),  // |10⟩
        complex(1/Math.sqrt(2), 0)   // |11⟩
      ]);
      
      const result = cy.applyTo(superposition);
      const amplitudes = result.amplitudes();
      
      // |10⟩ → -i|11⟩, |11⟩ → i|10⟩
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[2].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[3].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
    });
  });

  describe('SWAPGate', () => {
    let swap: SWAPGate;

    beforeEach(() => {
      swap = new SWAPGate();
    });

    it('should have correct name and matrix size', () => {
      expect(swap.name).toBe('SWAP');
      expect(swap.matrix).toHaveLength(4);
      expect(swap.size).toBe(4);
    });

    it('should have correct matrix structure for SWAP', () => {
      const expected = [
        [ONE, ZERO, ZERO, ZERO],
        [ZERO, ZERO, ONE, ZERO],
        [ZERO, ONE, ZERO, ZERO],
        [ZERO, ZERO, ZERO, ONE],
      ];
      
      swap.matrix.forEach((row, i) => {
        row.forEach((element, j) => {
          expect(element.re).toBeCloseTo(expected[i][j].re, 10);
          expect(element.im).toBeCloseTo(expected[i][j].im, 10);
        });
      });
    });

    it('should leave |00⟩ and |11⟩ unchanged', () => {
      const states = [
        [ONE, ZERO, ZERO, ZERO],    // |00⟩
        [ZERO, ZERO, ZERO, ONE],    // |11⟩
      ];

      states.forEach((stateAmps) => {
        const state = new QubitState(2, stateAmps);
        const result = swap.applyTo(state);
        const amplitudes = result.amplitudes();
        
        stateAmps.forEach((expectedAmp, i) => {
          expect(amplitudes[i].re).toBeCloseTo(expectedAmp.re, 10);
          expect(amplitudes[i].im).toBeCloseTo(expectedAmp.im, 10);
        });
      });
    });

    it('should swap |01⟩ to |10⟩', () => {
      const state = new QubitState(2, [ZERO, ONE, ZERO, ZERO]);
      const result = swap.applyTo(state);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[2].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[3].abs()).toBeCloseTo(0, 10);
    });

    it('should swap |10⟩ to |01⟩', () => {
      const state = new QubitState(2, [ZERO, ZERO, ONE, ZERO]);
      const result = swap.applyTo(state);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[2].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[3].abs()).toBeCloseTo(0, 10);
    });

    it('should be self-inverse', () => {
      const state = new QubitState(2);
      const first = swap.applyTo(state);
      const second = swap.applyTo(first);
      
      const originalAmps = state.amplitudes();
      const finalAmps = second.amplitudes();
      
      originalAmps.forEach((amp, i) => {
        expect(finalAmps[i].re).toBeCloseTo(amp.re, 10);
        expect(finalAmps[i].im).toBeCloseTo(amp.im, 10);
      });
    });

    it('should preserve entanglement', () => {
      // Test with Bell state (|00⟩ + |11⟩)/√2
      const bellState = new QubitState(2, [
        complex(1/Math.sqrt(2), 0),
        ZERO,
        ZERO,
        complex(1/Math.sqrt(2), 0)
      ]);
      
      const result = swap.applyTo(bellState);
      const amplitudes = result.amplitudes();
      
      // SWAP should preserve the Bell state structure
      expect(amplitudes[0].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[2].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[3].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
    });
  });

  describe('ControlledHadamardGate', () => {
    let ch: ControlledHadamardGate;

    beforeEach(() => {
      ch = new ControlledHadamardGate();
    });

    it('should have correct name and matrix size', () => {
      expect(ch.name).toBe('CH');
      expect(ch.matrix).toHaveLength(4);
      expect(ch.size).toBe(4);
    });

    it('should leave |00⟩ and |01⟩ unchanged', () => {
      const states = [
        [ONE, ZERO, ZERO, ZERO],    // |00⟩
        [ZERO, ONE, ZERO, ZERO],    // |01⟩
      ];

      states.forEach((stateAmps) => {
        const state = new QubitState(2, stateAmps);
        const result = ch.applyTo(state);
        const amplitudes = result.amplitudes();
        
        stateAmps.forEach((expectedAmp, i) => {
          expect(amplitudes[i].re).toBeCloseTo(expectedAmp.re, 10);
          expect(amplitudes[i].im).toBeCloseTo(expectedAmp.im, 10);
        });
      });
    });

    it('should transform |10⟩ to (|10⟩ + |11⟩)/√2', () => {
      const state = new QubitState(2, [ZERO, ZERO, ONE, ZERO]);
      const result = ch.applyTo(state);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[2].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[3].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
    });

    it('should transform |11⟩ to (|10⟩ - |11⟩)/√2', () => {
      const state = new QubitState(2, [ZERO, ZERO, ZERO, ONE]);
      const result = ch.applyTo(state);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[2].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[3].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[2].re).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[3].re).toBeCloseTo(-1/Math.sqrt(2), 10);
    });

    it('should apply Hadamard when control is |1⟩', () => {
      const superposition = new QubitState(2, [
        ZERO,
        ZERO,
        complex(1/Math.sqrt(2), 0),  // |10⟩
        complex(1/Math.sqrt(2), 0)   // |11⟩
      ]);
      
      const result = ch.applyTo(superposition);
      const amplitudes = result.amplitudes();
      
      // After Hadamard: (1/√2)(H|0⟩) + (1/√2)(H|1⟩) = (1/√2)((|0⟩+|1⟩)/√2) + (1/√2)((|0⟩-|1⟩)/√2) = |0⟩
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[2].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[3].abs()).toBeCloseTo(0, 10);
    });
  });

  describe('ControlledPhaseGate', () => {
    it('should create gate with correct name and phase', () => {
      const cp = new ControlledPhaseGate(Math.PI / 4);
      expect(cp.name).toBe('CP(0.785)');
      expect(cp.matrix).toHaveLength(4);
      expect(cp.size).toBe(4);
    });

    it('should have identity behavior for phase 0', () => {
      const cp = new ControlledPhaseGate(0);
      const identity = [
        [ONE, ZERO, ZERO, ZERO],
        [ZERO, ONE, ZERO, ZERO],
        [ZERO, ZERO, ONE, ZERO],
        [ZERO, ZERO, ZERO, ONE],
      ];
      
      cp.matrix.forEach((row, i) => {
        row.forEach((element, j) => {
          expect(element.re).toBeCloseTo(identity[i][j].re, 10);
          expect(element.im).toBeCloseTo(identity[i][j].im, 10);
        });
      });
    });

    it('should behave like CZ for phase π', () => {
      const cp = new ControlledPhaseGate(Math.PI);
      const state = new QubitState(2, [ZERO, ZERO, ZERO, ONE]);
      const result = cp.applyTo(state);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[3].re).toBeCloseTo(-1, 10);
      expect(amplitudes[3].im).toBeCloseTo(0, 10);
    });

    it('should apply arbitrary phase to |11⟩', () => {
      const phi = Math.PI / 3;
      const cp = new ControlledPhaseGate(phi);
      const state = new QubitState(2, [ZERO, ZERO, ZERO, ONE]);
      const result = cp.applyTo(state);
      const amplitudes = result.amplitudes();
      
      const expectedPhase = complex(Math.cos(phi), Math.sin(phi));
      expect(amplitudes[3].re).toBeCloseTo(expectedPhase.re, 10);
      expect(amplitudes[3].im).toBeCloseTo(expectedPhase.im, 10);
    });

    it('should leave other states unchanged', () => {
      const phi = Math.PI / 6;
      const cp = new ControlledPhaseGate(phi);
      const states = [
        [ONE, ZERO, ZERO, ZERO],    // |00⟩
        [ZERO, ONE, ZERO, ZERO],    // |01⟩
        [ZERO, ZERO, ONE, ZERO],    // |10⟩
      ];

      states.forEach((stateAmps) => {
        const state = new QubitState(2, stateAmps);
        const result = cp.applyTo(state);
        const amplitudes = result.amplitudes();
        
        stateAmps.forEach((expectedAmp, i) => {
          expect(amplitudes[i].re).toBeCloseTo(expectedAmp.re, 10);
          expect(amplitudes[i].im).toBeCloseTo(expectedAmp.im, 10);
        });
      });
    });

    it('should handle negative phases', () => {
      const cp = new ControlledPhaseGate(-Math.PI / 4);
      expect(cp.name).toBe('CP(-0.785)');
      
      const state = new QubitState(2, [ZERO, ZERO, ZERO, ONE]);
      const result = cp.applyTo(state);
      const amplitudes = result.amplitudes();
      
      const expectedPhase = complex(Math.cos(-Math.PI / 4), Math.sin(-Math.PI / 4));
      expect(amplitudes[3].re).toBeCloseTo(expectedPhase.re, 10);
      expect(amplitudes[3].im).toBeCloseTo(expectedPhase.im, 10);
    });
  });

  describe('ControlledUnitaryGate', () => {
    it('should create gate with custom name', () => {
      const cu = new ControlledUnitaryGate('CustomCU', complex(1, 0), complex(0, 0));
      expect(cu.name).toBe('CustomCU');
      expect(cu.matrix).toHaveLength(4);
      expect(cu.size).toBe(4);
    });

    it('should generate name from amplitudes when no name provided', () => {
      const cu = new ControlledUnitaryGate('', complex(1, 0), complex(0, 1));
      expect(cu.name).toMatch(/CU\(/);
      expect(cu.name).toContain('0.707+0.000i'); // Normalized amplitude
    });

    it('should normalize amplitudes', () => {
      const cu = new ControlledUnitaryGate('Test', complex(2, 0), complex(2, 0));
      const amplitudes = cu.getAmplitudes();
      
      const norm = Math.sqrt(
        amplitudes.alpha.re * amplitudes.alpha.re + 
        amplitudes.alpha.im * amplitudes.alpha.im +
        amplitudes.beta.re * amplitudes.beta.re + 
        amplitudes.beta.im * amplitudes.beta.im
      );
      
      expect(norm).toBeCloseTo(1, 10);
    });

    it('should handle global phase', () => {
      const theta = Math.PI / 4;
      const cu = new ControlledUnitaryGate('TestPhase', complex(1, 0), complex(0, 0), theta);
      expect(cu.getGlobalPhase()).toBe(theta);
    });

    it('should get underlying unitary matrix', () => {
      const cu = new ControlledUnitaryGate('Test', complex(1, 0), complex(0, 1));
      const unitaryMatrix = cu.getUnitaryMatrix();
      
      expect(unitaryMatrix).toHaveLength(2);
      expect(unitaryMatrix[0]).toHaveLength(2);
    });

    it('should create from single-qubit gate', () => {
      const xGate = new PauliXGate();
      const cu = ControlledUnitaryGate.fromGate(xGate, 'CX_custom');
      
      expect(cu.name).toBe('CX_custom');
      expect(cu.matrix).toHaveLength(4);
    });

    it('should throw error for non-single-qubit gate', () => {
      const mockGate = {
        name: 'TwoQubit',
        matrix: [[ONE, ZERO], [ZERO, ONE], [ONE, ZERO]]  // Invalid 3x2 matrix
      } as any;
      
      expect(() => ControlledUnitaryGate.fromGate(mockGate)).toThrow('Can only create controlled version of single-qubit gates');
    });

    it('should create from state', () => {
      const cu = ControlledUnitaryGate.fromState('FromState', complex(1, 0), complex(0, 1), Math.PI/2);
      
      expect(cu.name).toBe('FromState');
      expect(cu.getGlobalPhase()).toBe(Math.PI/2);
    });

    it('should create from matrix elements', () => {
      const cu = ControlledUnitaryGate.fromElements(
        'FromElements', 
        complex(1, 0), 
        complex(0, 0), 
        complex(0, 1), 
        complex(1, 0)
      );
      
      expect(cu.name).toBe('FromElements');
    });

    it('should create from rotation around arbitrary axis', () => {
      const cu = ControlledUnitaryGate.fromRotation('Rotation', Math.PI, 1, 0, 0);
      
      expect(cu.name).toBe('Rotation');
      expect(cu.matrix).toHaveLength(4);
    });

    it('should throw error for zero rotation axis', () => {
      expect(() => 
        ControlledUnitaryGate.fromRotation('BadRotation', Math.PI, 0, 0, 0)
      ).toThrow('Rotation axis cannot be zero vector');
    });

    it('should normalize rotation axis', () => {
      const cu = ControlledUnitaryGate.fromRotation('NormalizedRotation', Math.PI/2, 2, 0, 0);
      
      expect(cu.name).toBe('NormalizedRotation');
      expect(cu.matrix).toHaveLength(4);
    });

    it('should handle complex rotations', () => {
      const cu = ControlledUnitaryGate.fromRotation('ComplexRotation', Math.PI/3, 1, 1, 1);
      
      expect(cu.name).toBe('ComplexRotation');
      const amplitudes = cu.getAmplitudes();
      expect(amplitudes.alpha).toBeDefined();
      expect(amplitudes.beta).toBeDefined();
    });

    it('should leave |00⟩ and |01⟩ unchanged', () => {
      const cu = new ControlledUnitaryGate('Test', complex(0, 1), complex(1, 0));
      const states = [
        [ONE, ZERO, ZERO, ZERO],    // |00⟩
        [ZERO, ONE, ZERO, ZERO],    // |01⟩
      ];

      states.forEach((stateAmps) => {
        const state = new QubitState(2, stateAmps);
        const result = cu.applyTo(state);
        const amplitudes = result.amplitudes();
        
        stateAmps.forEach((expectedAmp, i) => {
          expect(amplitudes[i].re).toBeCloseTo(expectedAmp.re, 10);
          expect(amplitudes[i].im).toBeCloseTo(expectedAmp.im, 10);
        });
      });
    });

    it('should apply unitary transformation when control is |1⟩', () => {
      const cu = new ControlledUnitaryGate('Test', complex(0, 1), complex(1, 0));
      const state = new QubitState(2, [ZERO, ZERO, ONE, ZERO]); // |10⟩
      const result = cu.applyTo(state);
      const amplitudes = result.amplitudes();
      
      // Should transform according to the specified unitary
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[2].abs() ** 2 + amplitudes[3].abs() ** 2).toBeCloseTo(1, 10);
    });
  });

  describe('Gate Instances and Factory Functions', () => {
    it('should provide CNOT gate instance', () => {
      expect(CNOT).toBeInstanceOf(CNOTGate);
      expect(CNOT.name).toBe('CNOT');
    });

    it('should provide CX as alias for CNOT', () => {
      expect(CX).toBe(CNOT);
    });

    it('should provide CZ gate instance', () => {
      expect(CZ).toBeInstanceOf(ControlledZGate);
      expect(CZ.name).toBe('CZ');
    });

    it('should provide CY gate instance', () => {
      expect(CY).toBeInstanceOf(ControlledYGate);
      expect(CY.name).toBe('CY');
    });

    it('should provide CH gate instance', () => {
      expect(CH).toBeInstanceOf(ControlledHadamardGate);
      expect(CH.name).toBe('CH');
    });

    it('should provide SWAP gate instance', () => {
      expect(SWAP).toBeInstanceOf(SWAPGate);
      expect(SWAP.name).toBe('SWAP');
    });

    it('should provide CP factory function', () => {
      const cp = CP(Math.PI / 6);
      expect(cp).toBeInstanceOf(ControlledPhaseGate);
      expect(cp.name).toBe('CP(0.524)');
    });

    it('should provide CU factory function', () => {
      const cu = CU('FactoryTest', complex(1, 0), complex(0, 1));
      expect(cu).toBeInstanceOf(ControlledUnitaryGate);
      expect(cu.name).toBe('FactoryTest');
    });
  });

  describe('Matrix Properties', () => {
    it('should have unitary matrices for all gates', () => {
      const gates = [
        new CNOTGate(),
        new ControlledZGate(),
        new ControlledYGate(),
        new SWAPGate(),
        new ControlledHadamardGate(),
        new ControlledPhaseGate(Math.PI / 3),
        new ControlledUnitaryGate('Test', complex(1, 0), complex(0, 1))
      ];

      gates.forEach(gate => {
        const matrix = gate.matrix;
        expect(matrix).toHaveLength(4);
        matrix.forEach(row => {
          expect(row).toHaveLength(4);
        });
        
        // Test that matrix preserves norm (unitary property)
        const testState = new QubitState(2);
        const result = gate.applyTo(testState);
        const originalNorm = testState.amplitudes().reduce((sum, amp) => sum + amp.abs() * amp.abs(), 0);
        const resultNorm = result.amplitudes().reduce((sum, amp) => sum + amp.abs() * amp.abs(), 0);
        
        expect(resultNorm).toBeCloseTo(originalNorm, 10);
      });
    });

    it('should have correct matrix dimensions', () => {
      const gates = [CNOT, CZ, CY, SWAP, CH];
      
      gates.forEach(gate => {
        expect(gate.size).toBe(4);
        expect(gate.matrix).toHaveLength(4);
        gate.matrix.forEach(row => {
          expect(row).toHaveLength(4);
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should throw error for zero amplitudes in ControlledUnitaryGate', () => {
      expect(() => {
        new ControlledUnitaryGate('ZeroTest', complex(0, 0), complex(0, 0));
      }).toThrow('Invalid amplitudes: both alpha and beta cannot be zero');
    });

    it('should handle very small phase angles in ControlledPhaseGate', () => {
      const cp = new ControlledPhaseGate(1e-10);
      const state = new QubitState(2, [ZERO, ZERO, ZERO, ONE]);
      const result = cp.applyTo(state);
      const amplitudes = result.amplitudes();
      
      // Should be approximately identity for very small phase
      expect(amplitudes[3].re).toBeCloseTo(1, 9);
      expect(amplitudes[3].im).toBeCloseTo(0, 9);
    });

    it('should handle large phase angles in ControlledPhaseGate', () => {
      const cp = new ControlledPhaseGate(4 * Math.PI); // Equivalent to 0
      const state = new QubitState(2, [ZERO, ZERO, ZERO, ONE]);
      const result = cp.applyTo(state);
      const amplitudes = result.amplitudes();
      
      expect(amplitudes[3].re).toBeCloseTo(1, 10);
      expect(amplitudes[3].im).toBeCloseTo(0, 10);
    });

    it('should handle complex amplitudes in ControlledUnitaryGate', () => {
      const cu = new ControlledUnitaryGate(
        'ComplexTest', 
        complex(0.5, 0.5), 
        complex(0.5, -0.5)
      );
      
      expect(cu.name).toBe('ComplexTest');
      expect(cu.matrix).toHaveLength(4);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid gate matrices in fromGate', () => {
      const invalidGate = {
        name: 'Invalid',
        matrix: []  // Empty matrix
      } as any;
      
      expect(() => ControlledUnitaryGate.fromGate(invalidGate)).toThrow();
    });

    it('should handle null/undefined parameters', () => {
      expect(() => new ControlledPhaseGate(NaN)).not.toThrow();
      expect(() => new ControlledUnitaryGate('Test', complex(NaN, 0), complex(0, 0))).not.toThrow();
    });
  });

  describe('Comprehensive Gate Tests', () => {
    describe('ControlledUnitaryGate Auto-Name Generation', () => {
      it('should generate automatic name with complex alpha and beta', () => {
        // Test with empty string name to test auto-generation
        const alpha = complex(0.6, 0.2);    // Positive imaginary 
        const beta = complex(0.3, -0.4);    // Negative imaginary
        
        const cu = new ControlledUnitaryGate('', alpha, beta); // Empty name tests auto-generation
        
        expect(cu.name).toContain('CU(');
        expect(cu.name).toContain(','); // Should contain comma separator
        expect(cu.name).toContain('+'); // Positive imaginary part
        expect(cu.name).toContain('-'); // Negative imaginary part
        expect(cu.name).toContain('i'); // Imaginary unit
      });

      it('should generate automatic name without theta when theta is zero', () => {
        const alpha = complex(0.5, 0.5);
        const beta = complex(0.5, -0.5);
        
        const cu = new ControlledUnitaryGate('', alpha, beta, 0); // Zero theta
        
        expect(cu.name).toContain('CU(');
        expect(cu.name).not.toContain('θ='); // Should not include theta when zero
      });

      it('should generate automatic name with theta when theta is non-zero', () => {
        const alpha = complex(0.5, 0);
        const beta = complex(0.5, 0);
        const theta = Math.PI / 3;
        
        const cu = new ControlledUnitaryGate('', alpha, beta, theta); // Non-zero theta
        
        expect(cu.name).toContain('CU(');
        expect(cu.name).toContain(',θ='); // Should include theta when non-zero
        expect(cu.name).toContain(theta.toFixed(3));
      });

      it('should test whitespace-only name with auto-generation', () => {
        const alpha = complex(1, 0);
        const beta = complex(0, 0);
        
        const cu = new ControlledUnitaryGate('   ', alpha, beta); // Whitespace-only name
        
        expect(cu.name).toContain('CU(');
        expect(cu.name).toContain('1.000+0.000i');
      });
    });

    describe('fromGate Default Name Generation', () => {
      it('should use default name when no name provided to fromGate', () => {
        const xGate = new PauliXGate();
        
        // Call fromGate without providing name parameter - should use default name
        const cu = ControlledUnitaryGate.fromGate(xGate); // No name parameter
        
        expect(cu.name).toBe('CX'); // Should default to C + gate.name
      });

      it('should use provided name when name is given to fromGate', () => {
        const yGate = new PauliYGate();
        
        // Call fromGate with name parameter
        const cu = ControlledUnitaryGate.fromGate(yGate, 'CustomCY');
        
        expect(cu.name).toBe('CustomCY'); // Should use provided name
      });
    });

    describe('fromRotation Default Name Generation', () => {
      it('should use default name when no name provided to fromRotation', () => {
        // Call fromRotation without providing name - should use default 'CU'
        const cu = ControlledUnitaryGate.fromRotation(
          '', // Empty name to test default
          Math.PI / 2,
          1, 0, 0
        );
        
        expect(cu.name).toBe('CU'); // Should default to 'CU'
      });

      it('should use default name when null name provided to fromRotation', () => {
        // Call fromRotation with null name
        const cu = ControlledUnitaryGate.fromRotation(
          undefined as any, // Undefined name to test default
          Math.PI / 4,
          0, 1, 0
        );
        
        expect(cu.name).toBe('CU'); // Should default to 'CU'
      });

      it('should use provided name when name is given to fromRotation', () => {
        const cu = ControlledUnitaryGate.fromRotation(
          'CustomRotation',
          Math.PI / 6,
          0, 0, 1
        );
        
        expect(cu.name).toBe('CustomRotation'); // Should use provided name
      });
    });

    describe('Complete Functionality Tests Verification', () => {
      it('should test all combinations of name generation', () => {
        // Test different alpha/beta sign combinations for complete tests
        const testCases = [
          { alpha: complex(0.5, 0.3), beta: complex(0.4, 0.2) },    // Both positive imaginary
          { alpha: complex(0.5, -0.3), beta: complex(0.4, 0.2) },   // Alpha negative, beta positive
          { alpha: complex(0.5, 0.3), beta: complex(0.4, -0.2) },   // Alpha positive, beta negative  
          { alpha: complex(0.5, -0.3), beta: complex(0.4, -0.2) },  // Both negative imaginary
          { alpha: complex(0.7, 0), beta: complex(0.3, 0) },        // Pure real
          { alpha: complex(0, 0.7), beta: complex(0, 0.3) },        // Pure imaginary
        ];

        testCases.forEach((testCase, index) => {
          const cu = new ControlledUnitaryGate('', testCase.alpha, testCase.beta);
          expect(cu.name).toContain('CU(');
          expect(cu.getAmplitudes().alpha).toBeDefined();
          expect(cu.getAmplitudes().beta).toBeDefined();
        });
      });

      it('should verify all static factory methods work with default names', () => {
        // fromState with empty name
        const cuState = ControlledUnitaryGate.fromState('', complex(1, 0), complex(0, 1));
        expect(cuState.name).toContain('CU(');

        // fromElements with empty name
        const cuElements = ControlledUnitaryGate.fromElements(
          '',
          complex(0.707, 0), complex(0, 0.707),
          complex(0, -0.707), complex(0.707, 0)
        );
        expect(cuElements.name).toContain('CU(');
      });
    });
  });
});