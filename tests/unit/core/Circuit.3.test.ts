// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { Circuit } from '@/core/Circuit';
import { isUnitary } from '@/math/math-utils';

describe('Circuit Unitary Matrix Computation', () => {
  describe('Basic functionality', () => {
    it('should return identity matrix for empty circuit', () => {
      const circuit = new Circuit(1);
      const unitary = circuit.toUnitary();
      
      expect(unitary.length).toBe(2);
      expect(unitary[0]!.length).toBe(2);
      
      // Should be identity matrix
      expect(unitary[0]![0]!.re).toBeCloseTo(1);
      expect(unitary[0]![0]!.im).toBeCloseTo(0);
      expect(unitary[0]![1]!.re).toBeCloseTo(0);
      expect(unitary[0]![1]!.im).toBeCloseTo(0);
      expect(unitary[1]![0]!.re).toBeCloseTo(0);
      expect(unitary[1]![0]!.im).toBeCloseTo(0);
      expect(unitary[1]![1]!.re).toBeCloseTo(1);
      expect(unitary[1]![1]!.im).toBeCloseTo(0);
    });

    it('should compute correct matrix for single H gate', () => {
      const circuit = new Circuit(1);
      circuit.h(0);
      const unitary = circuit.toUnitary();
      
      const sqrt2 = Math.sqrt(2);
      expect(unitary[0]![0]!.re).toBeCloseTo(1/sqrt2);
      expect(unitary[0]![1]!.re).toBeCloseTo(1/sqrt2);
      expect(unitary[1]![0]!.re).toBeCloseTo(1/sqrt2);
      expect(unitary[1]![1]!.re).toBeCloseTo(-1/sqrt2);
    });

    it('should compute correct matrix for X gate', () => {
      const circuit = new Circuit(1);
      circuit.x(0);
      const unitary = circuit.toUnitary();
      
      expect(unitary[0]![0]!.re).toBeCloseTo(0);
      expect(unitary[0]![1]!.re).toBeCloseTo(1);
      expect(unitary[1]![0]!.re).toBeCloseTo(1);
      expect(unitary[1]![1]!.re).toBeCloseTo(0);
    });

    it('toMatrix() should be an alias for toUnitary()', () => {
      const circuit = new Circuit(1);
      circuit.h(0);
      
      const unitary = circuit.toUnitary();
      const matrix = circuit.toMatrix();
      
      expect(matrix).toEqual(unitary);
    });
  });

  describe('Multi-qubit circuits', () => {
    it('should compute correct matrix for 2-qubit circuit', () => {
      const circuit = new Circuit(2);
      const unitary = circuit.toUnitary();
      
      expect(unitary.length).toBe(4);
      expect(unitary[0]!.length).toBe(4);
    });

    it('should compute Bell state circuit matrix', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      const unitary = circuit.toUnitary();
      
      // Check size
      expect(unitary.length).toBe(4);
      
      // Bell state preparation matrix elements
      // Circuit: H(0) → CNOT(0,1)
      // Expected: CNOT × H ⊗ I
      const sqrt2 = Math.sqrt(2);
      expect(unitary[0]![0]!.re).toBeCloseTo(1/sqrt2);
      expect(unitary[0]![3]!.re).toBeCloseTo(1/sqrt2);
      expect(unitary[1]![1]!.re).toBeCloseTo(1/sqrt2);
      expect(unitary[1]![2]!.re).toBeCloseTo(1/sqrt2);
      expect(unitary[2]![0]!.re).toBeCloseTo(1/sqrt2);
      expect(unitary[2]![3]!.re).toBeCloseTo(-1/sqrt2);
      expect(unitary[3]![1]!.re).toBeCloseTo(1/sqrt2);
      expect(unitary[3]![2]!.re).toBeCloseTo(-1/sqrt2);
    });

    it('should handle CNOT gate correctly', () => {
      const circuit = new Circuit(2);
      circuit.cnot(0, 1);
      const unitary = circuit.toUnitary();
      
      // CNOT matrix
      expect(unitary[0]![0]!.re).toBeCloseTo(1); // |00⟩ -> |00⟩
      expect(unitary[1]![1]!.re).toBeCloseTo(1); // |01⟩ -> |01⟩
      expect(unitary[2]![3]!.re).toBeCloseTo(1); // |10⟩ -> |11⟩
      expect(unitary[3]![2]!.re).toBeCloseTo(1); // |11⟩ -> |10⟩
    });
  });

  describe('Gate composition', () => {
    it('should correctly compose multiple gates', () => {
      const circuit = new Circuit(1);
      circuit.h(0).z(0).h(0); // H·Z·H = X
      const unitary = circuit.toUnitary();
      
      // Should equal X gate
      expect(unitary[0]![0]!.re).toBeCloseTo(0);
      expect(unitary[0]![1]!.re).toBeCloseTo(1);
      expect(unitary[1]![0]!.re).toBeCloseTo(1);
      expect(unitary[1]![1]!.re).toBeCloseTo(0);
    });

    it('should correctly compose rotation gates', () => {
      const circuit = new Circuit(1);
      const angle = Math.PI / 4;
      circuit.rx(0, angle).ry(0, angle);
      const unitary = circuit.toUnitary();
      
      // Check unitarity
      expect(isUnitary(unitary)).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should throw error for circuits with measurements', () => {
      const circuit = new Circuit(1);
      circuit.h(0).mz(0);
      
      expect(() => circuit.toUnitary()).toThrow('Cannot compute unitary for circuit with measurements');
    });

    it('should throw error for circuits that are too large', () => {
      const circuit = new Circuit(17); // >16 qubits
      circuit.h(0);
      
      expect(() => circuit.toUnitary()).toThrow('Circuit too large for unitary computation');
    });

    it('should handle mixed measurement and gate circuit', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1).mz(0).x(1);
      
      expect(() => circuit.toUnitary()).toThrow('Cannot compute unitary for circuit with measurements');
    });
  });

  describe('Unitarity verification', () => {
    it('should produce unitary matrices for all standard gates', () => {
      const tests = [
        { name: 'H gate', build: (c: Circuit) => c.h(0) },
        { name: 'X gate', build: (c: Circuit) => c.x(0) },
        { name: 'Y gate', build: (c: Circuit) => c.y(0) },
        { name: 'Z gate', build: (c: Circuit) => c.z(0) },
        { name: 'S gate', build: (c: Circuit) => c.s(0) },
        { name: 'T gate', build: (c: Circuit) => c.t(0) },
      ];

      for (const test of tests) {
        const circuit = new Circuit(1);
        test.build(circuit);
        const unitary = circuit.toUnitary();
        
        expect(isUnitary(unitary)).toBe(true);
      }
    });

    it('should produce unitary matrix for complex circuit', () => {
      const circuit = new Circuit(3);
      circuit
        .h(0)
        .cnot(0, 1)
        .h(2)
        .cnot(1, 2)
        .rx(0, Math.PI/4)
        .ry(1, Math.PI/3)
        .rz(2, Math.PI/6);
      
      const unitary = circuit.toUnitary();
      expect(isUnitary(unitary, 1e-10)).toBe(true);
    });
  });

  describe('Three-qubit circuits', () => {
    it('should compute correct matrix for 3-qubit circuit', () => {
      const circuit = new Circuit(3);
      const unitary = circuit.toUnitary();
      
      expect(unitary.length).toBe(8);
      expect(unitary[0]!.length).toBe(8);
      
      // Should be identity
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (i === j) {
            expect(unitary[i]![j]!.re).toBeCloseTo(1);
            expect(unitary[i]![j]!.im).toBeCloseTo(0);
          } else {
            expect(unitary[i]![j]!.re).toBeCloseTo(0);
            expect(unitary[i]![j]!.im).toBeCloseTo(0);
          }
        }
      }
    });

    it('should construct Toffoli gate from basic gates', () => {
      // Toffoli gate construction using decomposition
      // CCX = (I⊗I⊗H)(I⊗CX)(I⊗T†⊗I)(CX⊗I)(I⊗T⊗I)(I⊗CX)(I⊗T†⊗I)(CX⊗I)(I⊗I⊗T)(I⊗H⊗I)(CX⊗I)(I⊗I⊗T)(I⊗S⊗I)(I⊗I⊗H)
      // Simplified version using available gates
      const circuit = new Circuit(3);
      
      // This is a simplified Toffoli using the decomposition available with our gates
      // The full decomposition requires controlled-S and controlled-T gates
      // We'll test a partial construction that should still be unitary
      circuit
        .h(2)
        .cnot(1, 2)
        .tdg(2)  // T-dagger
        .cnot(0, 2)
        .t(2)
        .cnot(1, 2)
        .tdg(2)
        .cnot(0, 2)
        .t(1)
        .t(2)
        .h(2)
        .cnot(0, 1)
        .t(0)
        .tdg(1)
        .cnot(0, 1);
      
      const unitary = circuit.toUnitary();
      
      // Check unitarity
      expect(isUnitary(unitary, 1e-10)).toBe(true);
      
      // Check size
      expect(unitary.length).toBe(8);
      
      // Verify some key Toffoli properties
      // |000⟩ -> |000⟩
      expect(unitary[0]![0]!.abs()).toBeCloseTo(1);
      // |001⟩ -> |001⟩
      expect(unitary[1]![1]!.abs()).toBeCloseTo(1);
      // |010⟩ -> |010⟩
      expect(unitary[2]![2]!.abs()).toBeCloseTo(1);
      // |011⟩ -> |011⟩
      expect(unitary[3]![3]!.abs()).toBeCloseTo(1);
      // |100⟩ -> |100⟩
      expect(unitary[4]![4]!.abs()).toBeCloseTo(1);
      // |101⟩ -> |101⟩
      expect(unitary[5]![5]!.abs()).toBeCloseTo(1);
      // |110⟩ -> |111⟩ (the key Toffoli behavior)
      expect(Math.abs(unitary[6]![7]!.abs())).toBeCloseTo(1);
      // |111⟩ -> |110⟩
      expect(Math.abs(unitary[7]![6]!.abs())).toBeCloseTo(1);
    });

    it('should handle GHZ state preparation', () => {
      const circuit = new Circuit(3);
      circuit.h(0).cnot(0, 1).cnot(1, 2);
      
      const unitary = circuit.toUnitary();
      
      // Check unitarity
      expect(isUnitary(unitary, 1e-10)).toBe(true);
      
      // GHZ state preparation: |000⟩ -> (|000⟩ + |111⟩)/√2
      const sqrt2 = Math.sqrt(2);
      expect(unitary[0]![0]!.re).toBeCloseTo(1/sqrt2);
      expect(unitary[0]![7]!.re).toBeCloseTo(1/sqrt2);
      
      // Check other basis states
      expect(unitary[1]![1]!.re).toBeCloseTo(1/sqrt2);
      expect(unitary[1]![6]!.re).toBeCloseTo(1/sqrt2);
    });

    it('should handle W state preparation circuit', () => {
      // W state: (|001⟩ + |010⟩ + |100⟩)/√3
      // This is an approximation using available gates
      const circuit = new Circuit(3);
      
      // Partial W-state circuit (not exact, but tests 3-qubit operations)
      circuit
        .ry(0, 2 * Math.acos(1/Math.sqrt(3)))
        .ch(0, 1)
        .cnot(1, 0)
        .x(0)
        .ch(0, 2);
      
      const unitary = circuit.toUnitary();
      
      // Check unitarity
      expect(isUnitary(unitary, 1e-10)).toBe(true);
      
      // Check it's a valid 8x8 matrix
      expect(unitary.length).toBe(8);
      expect(unitary[0]!.length).toBe(8);
    });

    it('should handle three sequential CNOT gates', () => {
      const circuit = new Circuit(3);
      circuit.cnot(0, 1).cnot(1, 2).cnot(0, 2);
      
      const unitary = circuit.toUnitary();
      
      // Check unitarity
      expect(isUnitary(unitary, 1e-10)).toBe(true);
      
      // Verify specific transformations
      // |000⟩ -> |000⟩
      expect(unitary[0]![0]!.re).toBeCloseTo(1);
      // |100⟩ -> |110⟩
      expect(unitary[4]![6]!.re).toBeCloseTo(1);
      // |110⟩ -> |101⟩
      expect(unitary[6]![5]!.re).toBeCloseTo(1);
    });

    it('should handle mixed single and two-qubit gates on 3 qubits', () => {
      const circuit = new Circuit(3);
      circuit
        .h(0)
        .h(1)
        .h(2)
        .cnot(0, 1)
        .cnot(1, 2)
        .rz(0, Math.PI/4)
        .ry(1, Math.PI/3)
        .rx(2, Math.PI/6);
      
      const unitary = circuit.toUnitary();
      
      // Check unitarity
      expect(isUnitary(unitary, 1e-10)).toBe(true);
      
      // Check size
      expect(unitary.length).toBe(8);
    });
  });

  describe('Special cases', () => {
    it('should handle single-qubit gates on different qubits', () => {
      const circuit = new Circuit(2);
      circuit.x(1); // X on second qubit
      const unitary = circuit.toUnitary();
      
      // |00⟩ -> |01⟩, |01⟩ -> |00⟩, |10⟩ -> |11⟩, |11⟩ -> |10⟩
      expect(unitary[0]![1]!.re).toBeCloseTo(1);
      expect(unitary[1]![0]!.re).toBeCloseTo(1);
      expect(unitary[2]![3]!.re).toBeCloseTo(1);
      expect(unitary[3]![2]!.re).toBeCloseTo(1);
    });

    it('should handle parametrized gates', () => {
      const circuit = new Circuit(1);
      const phi = Math.PI / 6;
      circuit.phase(0, phi);
      const unitary = circuit.toUnitary();
      
      expect(unitary[0]![0]!.re).toBeCloseTo(1);
      expect(unitary[1]![1]!.re).toBeCloseTo(Math.cos(phi));
      expect(unitary[1]![1]!.im).toBeCloseTo(Math.sin(phi));
    });

    it('should handle SWAP gate', () => {
      const circuit = new Circuit(2);
      circuit.swap(0, 1);
      const unitary = circuit.toUnitary();
      
      // SWAP: |01⟩ <-> |10⟩
      expect(unitary[0]![0]!.re).toBeCloseTo(1); // |00⟩ -> |00⟩
      expect(unitary[1]![2]!.re).toBeCloseTo(1); // |01⟩ -> |10⟩
      expect(unitary[2]![1]!.re).toBeCloseTo(1); // |10⟩ -> |01⟩
      expect(unitary[3]![3]!.re).toBeCloseTo(1); // |11⟩ -> |11⟩
    });
  });
});