// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import {
  HadamardGate,
  PauliXGate,
  PauliYGate,
  PauliZGate,
  SGate,
  TGate,
  RotationXGate,
  RotationYGate,
  RotationZGate,
  PhaseGate,
  H, X, Y, Z, S, T,
  RX, RY, RZ, PH
} from '@/core/OneQubitGates';

import {
  CNOT, CZ, CY, CH, SWAP, CP, CU
} from '@/core/TwoQubitGates';

import {
  HH
} from '@/core/MultiQubitGates';

import {
  Mz,
  Mx,
  My,
  Mp
} from '@/core/MeasureGates';

import { Q5mOperator } from '@/core/Q5mOperator';
import { QubitState } from '@/core/QubitState';
import { complex } from '../../../src/math/complex';

describe('Gates Test Suite', () => {
  describe('Single Qubit Gates', () => {
    it('should create Hadamard gate', () => {
      expect(H.name).toBe('H');
      expect(H.matrix.length).toBe(2);
    });
    
    it('should create Pauli X gate', () => {
      expect(X.name).toBe('X');
      expect(X.matrix.length).toBe(2);
    });
    
    it('should create Pauli Y gate', () => {
      expect(Y.name).toBe('Y');
      expect(Y.matrix.length).toBe(2);
    });
    
    it('should create Pauli Z gate', () => {
      expect(Z.name).toBe('Z');
      expect(Z.matrix.length).toBe(2);
    });
    
    it('should create S gate', () => {
      expect(S.name).toBe('S');
      expect(S.matrix.length).toBe(2);
    });
    
    it('should create T gate', () => {
      expect(T.name).toBe('T');
      expect(T.matrix.length).toBe(2);
    });
    
    it('should create rotation gates', () => {
      const rx = RX(Math.PI / 4);
      const ry = RY(Math.PI / 4);
      const rz = RZ(Math.PI / 4);
      
      expect(rx.name).toContain('RX(');
      expect(ry.name).toContain('RY(');
      expect(rz.name).toContain('RZ(');
    });
    
    it('should create phase gate', () => {
      const p = PH(Math.PI / 4);
      expect(p.name).toContain('P(');
      expect(p.matrix.length).toBe(2);
    });
  });
  
  describe('Two Qubit Gates', () => {
    it('should create CNOT gate', () => {
      expect(CNOT.name).toBe('CNOT');
      expect(CNOT.matrix.length).toBe(4);
    });
    
    it('should create Controlled Z gate', () => {
      expect(CZ.name).toBe('CZ');
      expect(CZ.matrix.length).toBe(4);
    });
    
    it('should create Controlled Y gate', () => {
      expect(CY.name).toBe('CY');
      expect(CY.matrix.length).toBe(4);
    });
    
    it('should create Controlled H gate', () => {
      expect(CH.name).toBe('CH');
      expect(CH.matrix.length).toBe(4);
    });
    
    it('should create SWAP gate', () => {
      expect(SWAP.name).toBe('SWAP');
      expect(SWAP.matrix.length).toBe(4);
    });
    
    it('should create Controlled Phase gate', () => {
      const cp = CP(Math.PI / 4);
      expect(cp.name).toContain('CP(');
      expect(cp.matrix.length).toBe(4);
    });
  });
  
  describe('Multi Qubit Gates', () => {
    it('should create multi-Hadamard gate', () => {
      const hh = HH(3, [0, 1, 2]);
      expect(hh.name).toBe('HH');
      expect(hh.matrix.length).toBe(8);
    });
    
    it('should create controlled unitary gate', () => {
      const alpha = complex(1, 0);
      const beta = complex(0, 0);  
      const cu = CU('CU-test', alpha, beta);
      expect(cu.name).toContain('CU-test');
      expect(cu.matrix.length).toBe(4);
    });
  });
  
  describe('Measurement Gates', () => {
    let state: QubitState;
    
    beforeEach(() => {
      state = QubitState.plus();
    });
    
    it('should create Z measurement gate', () => {
      const mz = Mz();
      expect(mz.name).toBe('Mz');
      
      const result = mz.measure(state, 0);
      expect([0, 1]).toContain(result.outcome);
    });
    
    it('should create X measurement gate', () => {
      const mx = Mx();
      expect(mx.name).toBe('Mx');
      
      const result = mx.measure(state, 0);
      expect([0, 1]).toContain(result.outcome);
    });
    
    it('should create Y measurement gate', () => {
      const my = My();
      expect(my.name).toBe('My');
      
      const result = my.measure(state, 0);
      expect([0, 1]).toContain(result.outcome);
    });
    
    it('should create phase measurement gate', () => {
      const mp = Mp(Math.PI / 4, Math.PI / 2);
      expect(mp.name).toContain('Mp(');
      
      const result = mp.measure(state, 0);
      expect([0, 1]).toContain(result.outcome);
    });
  });
  
  describe('Gate Applications', () => {
    it('should apply single qubit gates to states', () => {
      const state = QubitState.zero();
      
      const newState = H.applyTo(state);
      const probs = newState.probabilities();
      
      expect(probs[0]).toBeCloseTo(0.5, 10);
      expect(probs[1]).toBeCloseTo(0.5, 10);
    });
    
    it('should apply two qubit gates to states', () => {
      const state = new QubitState(2);
      
      const newState = CNOT.applyTo(state);
      expect(newState).toBeDefined();
    });
    
    it('should apply rotation gates with different angles', () => {
      const state = QubitState.zero();
      
      const rx = RX(Math.PI);
      const ry = RY(Math.PI);
      const rz = RZ(Math.PI);
      
      const stateX = rx.applyTo(state);
      const stateY = ry.applyTo(state);
      const stateZ = rz.applyTo(state);
      
      expect(stateX).toBeDefined();
      expect(stateY).toBeDefined();
      expect(stateZ).toBeDefined();
    });
  });
});
