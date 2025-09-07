// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { Q5mOperator, UnitaryOperator, HermitianOperator } from '@/core/Q5mOperator';
import { complex, ONE, ZERO, I } from '@/math/complex';
import type { Unitary, Hermitian } from '@/math/math-utils';

describe('Q5mOperator', () => {
  describe('Constructor', () => {
    it('should create operator with valid matrix', () => {
      const matrix: Unitary = [
        [ONE, ZERO],
        [ZERO, ONE],
      ];
      
      const op = new Q5mOperator(matrix, 'Identity');
      expect(op.dimension).toBe(2);
      expect(op.name).toBe('Identity');
    });

    it('should throw error for empty matrix', () => {
      expect(() => new Q5mOperator([])).toThrow('Quantum operator must be a square matrix');
    });

    it('should throw error for non-square matrix', () => {
      const invalidMatrix = [
        [ONE, ZERO, ZERO],
        [ZERO, ONE],
      ] as any;
      
      expect(() => new Q5mOperator(invalidMatrix)).toThrow('Quantum operator must be a square matrix');
    });

    it('should create copy of matrix', () => {
      const originalMatrix: Unitary = [
        [ONE, ZERO],
        [ZERO, ONE],
      ];
      
      const op = new Q5mOperator(originalMatrix);
      const retrievedMatrix = op.getMatrix();
      
      expect(retrievedMatrix).toEqual(originalMatrix);
      expect(retrievedMatrix).not.toBe(originalMatrix);
      expect(retrievedMatrix[0]).not.toBe(originalMatrix[0]);
    });

    it('should handle optional name parameter', () => {
      const matrix: Unitary = [[ONE]];
      
      const namedOp = new Q5mOperator(matrix, 'Test');
      const unnamedOp = new Q5mOperator(matrix);
      
      expect(namedOp.name).toBe('Test');
      expect(unnamedOp.name).toBeUndefined();
    });
  });

  describe('Factory Functions Tests', () => {
    it('should test createMatrixAs with forceHermitian=true', () => {
      // We need to test the createMatrixAs function with forceHermitian=true
      // This happens in the Hadamard factory method when creating a Hermitian type
      const hadamard = Q5mOperator.Hadamard<Hermitian>(2);
      
      expect(hadamard.dimension).toBe(2);
      expect(hadamard.name).toBe('H');
      
      // Verify it's actually a Hadamard matrix
      const matrix = hadamard.getMatrix();
      const invSqrt2 = 1 / Math.sqrt(2);
      expect(matrix[0][0].re).toBeCloseTo(invSqrt2, 10);
      expect(matrix[1][1].re).toBeCloseTo(-invSqrt2, 10);
    });
  });

  describe('Static Factory Methods', () => {
    it('should create identity operator', () => {
      const sizes = [1, 2, 4, 8];
      
      sizes.forEach(size => {
        const identity = Q5mOperator.identity(size);
        expect(identity.dimension).toBe(size);
        
        const matrix = identity.getMatrix();
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            if (i === j) {
              expect(matrix[i][j]).toEqual(ONE);
            } else {
              expect(matrix[i][j]).toEqual(ZERO);
            }
          }
        }
      });
    });

    it('should throw error for invalid identity size', () => {
      expect(() => Q5mOperator.identity(0)).toThrow('Matrix is not unitary');
      expect(() => Q5mOperator.identity(-1)).toThrow('Matrix is not unitary');
    });

    it('should create Pauli-X operator', () => {
      const pauliX = Q5mOperator.pauliX();
      expect(pauliX.dimension).toBe(2);
      
      const matrix = pauliX.getMatrix();
      expect(matrix[0][0]).toEqual(ZERO);
      expect(matrix[0][1]).toEqual(ONE);
      expect(matrix[1][0]).toEqual(ONE);
      expect(matrix[1][1]).toEqual(ZERO);
    });

    it('should create Pauli-Y operator', () => {
      const pauliY = Q5mOperator.pauliY();
      expect(pauliY.dimension).toBe(2);
      
      const matrix = pauliY.getMatrix();
      expect(matrix[0][0]).toEqual(ZERO);
      expect(matrix[0][1].re).toBeCloseTo(0, 10);
      expect(matrix[0][1].im).toBeCloseTo(-1, 10);
      expect(matrix[1][0].re).toBeCloseTo(0, 10);
      expect(matrix[1][0].im).toBeCloseTo(1, 10);
      expect(matrix[1][1]).toEqual(ZERO);
    });

    it('should create Pauli-Z operator', () => {
      const pauliZ = Q5mOperator.pauliZ();
      expect(pauliZ.dimension).toBe(2);
      
      const matrix = pauliZ.getMatrix();
      expect(matrix[0][0]).toEqual(ONE);
      expect(matrix[0][1]).toEqual(ZERO);
      expect(matrix[1][0]).toEqual(ZERO);
      expect(matrix[1][1].re).toBeCloseTo(-1, 10);
      expect(matrix[1][1].im).toBeCloseTo(0, 10);
    });

    it('should create phase gate', () => {
      const phase = Math.PI / 4;
      const phaseGate = Q5mOperator.phaseGate(phase);
      
      expect(phaseGate.dimension).toBe(2);
      
      const matrix = phaseGate.getMatrix();
      expect(matrix[0][0]).toEqual(ONE);
      expect(matrix[0][1]).toEqual(ZERO);
      expect(matrix[1][0]).toEqual(ZERO);
      expect(matrix[1][1].re).toBeCloseTo(Math.cos(phase), 10);
      expect(matrix[1][1].im).toBeCloseTo(Math.sin(phase), 10);
    });

    it('should create SWAP operator', () => {
      const swap = Q5mOperator.swap();
      expect(swap.dimension).toBe(4);
      
      const matrix = swap.getMatrix();
      const expected = [
        [ONE, ZERO, ZERO, ZERO],
        [ZERO, ZERO, ONE, ZERO],
        [ZERO, ONE, ZERO, ZERO],
        [ZERO, ZERO, ZERO, ONE],
      ];
      
      matrix.forEach((row, i) => {
        row.forEach((element, j) => {
          expect(element.re).toBeCloseTo(expected[i][j].re, 10);
          expect(element.im).toBeCloseTo(expected[i][j].im, 10);
        });
      });
    });
  });

  describe('Rotation Operations', () => {
    it('should create X-rotation operator', () => {
      const angle = Math.PI / 4;
      const rotX = Q5mOperator.rotationX(angle);
      
      expect(rotX.dimension).toBe(2);
      
      const matrix = rotX.getMatrix();
      const cos = Math.cos(angle / 2);
      const sin = Math.sin(angle / 2);
      
      expect(matrix[0][0].re).toBeCloseTo(cos, 10);
      expect(matrix[0][0].im).toBeCloseTo(0, 10);
      expect(matrix[0][1].re).toBeCloseTo(0, 10);
      expect(matrix[0][1].im).toBeCloseTo(-sin, 10);
    });

    it('should create Y-rotation operator', () => {
      const angle = Math.PI / 3;
      const rotY = Q5mOperator.rotationY(angle);
      
      expect(rotY.dimension).toBe(2);
      
      const matrix = rotY.getMatrix();
      const cos = Math.cos(angle / 2);
      
      expect(matrix[0][0].re).toBeCloseTo(cos, 10);
      expect(matrix[1][1].re).toBeCloseTo(cos, 10);
    });

    it('should create Z-rotation operator', () => {
      const angle = Math.PI / 6;
      const rotZ = Q5mOperator.rotationZ(angle);
      
      expect(rotZ.dimension).toBe(2);
      
      const matrix = rotZ.getMatrix();
      const expMinusI = complex(Math.cos(-angle / 2), Math.sin(-angle / 2));
      const expPlusI = complex(Math.cos(angle / 2), Math.sin(angle / 2));
      
      expect(matrix[0][0].re).toBeCloseTo(expMinusI.re, 10);
      expect(matrix[0][0].im).toBeCloseTo(expMinusI.im, 10);
      expect(matrix[1][1].re).toBeCloseTo(expPlusI.re, 10);
      expect(matrix[1][1].im).toBeCloseTo(expPlusI.im, 10);
    });
  });

  describe('Controlled Operations', () => {
    it('should create controlled operator from single-qubit gate', () => {
      const xGate = Q5mOperator.pauliX();
      const controlledX = UnitaryOperator.controlled(xGate);
      
      expect(controlledX.dimension).toBe(4);
      
      const matrix = controlledX.getMatrix();
      // CNOT matrix structure
      expect(matrix[0][0]).toEqual(ONE);
      expect(matrix[1][1]).toEqual(ONE);
      expect(matrix[2][3]).toEqual(ONE);
      expect(matrix[3][2]).toEqual(ONE);
    });

    it('should preserve controlled structure', () => {
      const hGate = UnitaryOperator.Hadamard(2);
      const controlledH = UnitaryOperator.controlled(hGate);
      
      expect(controlledH.dimension).toBe(4);
      
      const matrix = controlledH.getMatrix();
      // First two diagonal elements should be 1 (identity on |00⟩, |01⟩)
      expect(matrix[0][0]).toEqual(ONE);
      expect(matrix[1][1]).toEqual(ONE);
      
      // Bottom-right 2x2 block should be Hadamard
      expect(matrix[2][2].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(matrix[2][3].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
    });
  });

  describe('Scale Operations', () => {
    it('should scale operator by complex number', () => {
      const identity = Q5mOperator.identity(2);
      const scale = complex(2, 0);
      const scaled = identity.scale(scale);
      
      const matrix = scaled.getMatrix();
      expect(matrix[0][0].re).toBeCloseTo(2, 10);
      expect(matrix[1][1].re).toBeCloseTo(2, 10);
      expect(matrix[0][1]).toEqual(ZERO);
      expect(matrix[1][0]).toEqual(ZERO);
    });

    it('should scale by imaginary number', () => {
      const identity = Q5mOperator.identity(2);
      const scaled = identity.scale(I);
      
      const matrix = scaled.getMatrix();
      expect(matrix[0][0].re).toBeCloseTo(0, 10);
      expect(matrix[0][0].im).toBeCloseTo(1, 10);
      expect(matrix[1][1].re).toBeCloseTo(0, 10);
      expect(matrix[1][1].im).toBeCloseTo(1, 10);
    });

    it('should scale by real number', () => {
      const identity = Q5mOperator.identity(2);
      const scaled = identity.scale(3.5);
      
      const matrix = scaled.getMatrix();
      expect(matrix[0][0].re).toBeCloseTo(3.5, 10);
      expect(matrix[1][1].re).toBeCloseTo(3.5, 10);
      expect(scaled.name).toBe('3.5*Identity');
    });

    it('should handle scaling with complex number name', () => {
      const op = Q5mOperator.pauliX();
      const complexScale = complex(2, 3);
      const scaled = op.scale(complexScale);
      
      expect(scaled.name).toBe(`${complexScale.toString()}*PauliX`);
    });
  });

  describe('UnitaryOperator Subclass', () => {
    it('should create Hadamard operator', () => {
      const hadamard = UnitaryOperator.Hadamard(2);
      expect(hadamard.dimension).toBe(2);
      
      const matrix = hadamard.getMatrix();
      const invSqrt2 = 1 / Math.sqrt(2);
      
      expect(matrix[0][0].re).toBeCloseTo(invSqrt2, 10);
      expect(matrix[0][1].re).toBeCloseTo(invSqrt2, 10);
      expect(matrix[1][0].re).toBeCloseTo(invSqrt2, 10);
      expect(matrix[1][1].re).toBeCloseTo(-invSqrt2, 10);
    });

    it('should validate unitarity in constructor', () => {
      const nonUnitaryMatrix = [
        [complex(2, 0), ZERO],
        [ZERO, complex(2, 0)]
      ] as any;
      
      expect(() => new UnitaryOperator(nonUnitaryMatrix)).toThrow('Matrix is not unitary');
    });

    it('should throw error for non-2x2 in controlled operation', () => {
      const op3x3 = Q5mOperator.identity(3);
      
      expect(() => UnitaryOperator.controlled(op3x3)).toThrow('Controlled operation is only implemented for 2x2 unitaries');
    });

    it('should create identity unitary', () => {
      const identity = UnitaryOperator.identity(3);
      expect(identity.dimension).toBe(3);
      
      const matrix = identity.getMatrix();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (i === j) {
            expect(matrix[i][j]).toEqual(ONE);
          } else {
            expect(matrix[i][j]).toEqual(ZERO);
          }
        }
      }
    });

    it('should create from unitary matrix', () => {
      const unitaryMatrix: Unitary = [
        [ONE, ZERO],
        [ZERO, complex(-1, 0)],
      ];
      
      const op = UnitaryOperator.fromUnitaryMatrix(unitaryMatrix);
      expect(op.dimension).toBe(2);
      
      const matrix = op.getMatrix();
      expect(matrix[0][0]).toEqual(ONE);
      expect(matrix[1][1].re).toBeCloseTo(-1, 10);
    });
  });

  describe('HermitianOperator Subclass', () => {
    it('should create Pauli-Z Hermitian operator', () => {
      const pauliZ = HermitianOperator.pauliZ();
      expect(pauliZ.dimension).toBe(2);
      
      const matrix = pauliZ.getMatrix();
      expect(matrix[0][0]).toEqual(ONE);
      expect(matrix[1][1].re).toBeCloseTo(-1, 10);
    });

    it('should validate hermiticity in constructor', () => {
      const nonHermitianMatrix = [
        [ONE, complex(1, 1)],
        [complex(2, -1), ONE] // Not hermitian: (1,-1) vs (2,-1)
      ] as any;
      
      expect(() => new HermitianOperator(nonHermitianMatrix)).toThrow('Matrix is not Hermitian');
    });

    it('should create spin Hamiltonian', () => {
      const energyGap = 2.0;
      const hamiltonian = HermitianOperator.spinHamiltonian(energyGap);
      
      expect(hamiltonian.dimension).toBe(2);
      expect(hamiltonian.name).toBe('H(Δ=2)');
      
      const matrix = hamiltonian.getMatrix();
      expect(matrix[0][0].re).toBeCloseTo(1.0, 10); // energyGap/2
      expect(matrix[1][1].re).toBeCloseTo(-1.0, 10); // -energyGap/2
    });

    it('should compute Hermitian time evolution operator', () => {
      const hamiltonian = HermitianOperator.spinHamiltonian(1.0);
      const time = 0.1;
      const hbar = 2.0;
      
      const evolutionOp = hamiltonian.getTimeEvolutionOperator(time, hbar);
      
      expect(evolutionOp).toBeDefined();
      expect(evolutionOp.length).toBe(2);
      expect(evolutionOp[0].length).toBe(2);
      
      // Check diagonal structure
      expect(evolutionOp[0][1].abs()).toBeCloseTo(0, 10);
      expect(evolutionOp[1][0].abs()).toBeCloseTo(0, 10);
      
      // Check phase evolution
      const energy0 = 0.5; // First diagonal element
      const expectedPhase0 = (-energy0 * time) / hbar;
      expect(evolutionOp[0][0].re).toBeCloseTo(Math.cos(expectedPhase0), 10);
      expect(evolutionOp[0][0].im).toBeCloseTo(Math.sin(expectedPhase0), 10);
    });

    it('should create identity Hermitian', () => {
      const identity = HermitianOperator.identity(2);
      expect(identity.dimension).toBe(2);
      
      const matrix = identity.getMatrix();
      expect(matrix[0][0]).toEqual(ONE);
      expect(matrix[1][1]).toEqual(ONE);
      expect(matrix[0][1]).toEqual(ZERO);
      expect(matrix[1][0]).toEqual(ZERO);
    });

    it('should create from hermitian matrix', () => {
      const hermitianMatrix: Hermitian = [
        [complex(2, 0), complex(1, 1)],
        [complex(1, -1), complex(3, 0)],
      ];
      
      const op = new HermitianOperator(hermitianMatrix);
      expect(op.dimension).toBe(2);
      
      const matrix = op.getMatrix();
      expect(matrix[0][0].re).toBeCloseTo(2, 10);
      expect(matrix[1][1].re).toBeCloseTo(3, 10);
    });
  });

  describe('Additional Static Factory Methods', () => {
    it('should create unitary operator with validation', () => {
      const unitaryMatrix: Unitary = [
        [complex(1/Math.sqrt(2), 0), complex(1/Math.sqrt(2), 0)],
        [complex(1/Math.sqrt(2), 0), complex(-1/Math.sqrt(2), 0)]
      ];
      
      const op = Q5mOperator.unitary(unitaryMatrix, 'Hadamard-validated');
      expect(op.name).toBe('Hadamard-validated');
      expect(op.dimension).toBe(2);
    });

    it('should create fromMatrix static method', () => {
      const matrix: Unitary = [
        [ONE, ZERO],
        [ZERO, complex(-1, 0)]
      ];
      
      const op = Q5mOperator.fromMatrix(matrix, 'TestFromMatrix');
      expect(op.name).toBe('TestFromMatrix');
      expect(op.dimension).toBe(2);
      
      // Test with skipValidation=true
      const op2 = Q5mOperator.fromMatrix(matrix, 'Test2', true);
      expect(op2.name).toBe('Test2');
    });

    it('should reject non-unitary matrix in unitary factory', () => {
      const nonUnitaryMatrix = [
        [ONE, ONE],
        [ZERO, ONE]
      ] as any;
      
      expect(() => Q5mOperator.unitary(nonUnitaryMatrix)).toThrow('Matrix is not unitary');
    });

    it('should create hermitian operator with validation', () => {
      const hermitianMatrix: Hermitian = [
        [complex(1, 0), complex(0, -1)],
        [complex(0, 1), complex(-1, 0)]
      ];
      
      const op = Q5mOperator.hermitian(hermitianMatrix, 'Pauli-Y-validated');
      expect(op.name).toBe('Pauli-Y-validated');
    });

    it('should reject non-hermitian matrix in hermitian factory', () => {
      const nonHermitianMatrix = [
        [ONE, complex(1, 1)],
        [complex(2, 1), ONE]
      ] as any;
      
      expect(() => Q5mOperator.hermitian(nonHermitianMatrix)).toThrow('Matrix is not Hermitian');
    });
  });

  describe('Operator Arithmetic', () => {
    it('should add operators of same dimension', () => {
      const op1 = Q5mOperator.identity(2);
      const op2 = Q5mOperator.pauliZ();
      
      const sum = op1.add(op2);
      expect(sum.dimension).toBe(2);
      
      const resultMatrix = sum.getMatrix();
      expect(resultMatrix[0][0].re).toBe(2); // 1 + 1
      expect(resultMatrix[1][1].re).toBe(0); // 1 + (-1)
    });

    it('should compose operators', () => {
      const op1 = Q5mOperator.pauliX();
      const op2 = Q5mOperator.pauliX();
      
      const composed = op1.compose(op2);
      expect(composed.dimension).toBe(2);
      
      // X * X = I
      const resultMatrix = composed.getMatrix();
      expect(resultMatrix[0][0]).toEqual(ONE);
      expect(resultMatrix[1][1]).toEqual(ONE);
      expect(resultMatrix[0][1]).toEqual(ZERO);
      expect(resultMatrix[1][0]).toEqual(ZERO);
    });

    it('should throw error when composing operators with different dimensions', () => {
      const op1 = Q5mOperator.identity(2);
      const op2 = Q5mOperator.identity(4);
      
      expect(() => op1.compose(op2)).toThrow('Cannot compose operators with different dimensions');
    });

    it('should create composed name for named operators', () => {
      const op1 = Q5mOperator.pauliX();
      const op2 = Q5mOperator.pauliY();
      
      const composed = op1.compose(op2);
      expect(composed.name).toBe('PauliX⊗PauliY');
    });

    it('should throw error when adding operators with different dimensions', () => {
      const op1 = Q5mOperator.identity(2);
      const op2 = Q5mOperator.identity(3);
      
      expect(() => op1.add(op2)).toThrow('Cannot add operators with different dimensions');
    });

    it('should create proper name for sum of named operators', () => {
      const op1 = Q5mOperator.identity(2);
      const op2 = Q5mOperator.pauliX();
      
      const sum = op1.add(op2);
      expect(sum.name).toBe('Identity+PauliX'); // Use actual default names
    });

    it('should handle unnamed operators in addition', () => {
      const matrix1: Unitary = [[ONE]];
      const matrix2: Unitary = [[complex(2, 0)]];
      
      const op1 = new Q5mOperator(matrix1); // No name
      const op2 = new Q5mOperator(matrix2); // No name
      
      const sum = op1.add(op2);
      expect(sum.name).toBeUndefined();
    });
  });

  describe('Inverse Operations', () => {
    it('should compute conjugate transpose', () => {
      const matrix: Unitary = [
        [complex(1, 1), complex(0, -1)],
        [complex(1, 0), complex(0, 1)]
      ];
      const op = new Q5mOperator(matrix);
      
      const inverse = op.inverse();
      expect(inverse.dimension).toBe(2);
      
      const invMatrix = inverse.getMatrix();
      expect(invMatrix[0][0].re).toBe(1);
      expect(invMatrix[0][0].im).toBe(-1); // Conjugate
    });

    it('should create inverse name for named operator', () => {
      const op = Q5mOperator.pauliX();
      const inverse = op.inverse();
      
      expect(inverse.name).toBe('PauliX†');
    });

    it('should handle unnamed operator in inverse', () => {
      const matrix: Unitary = [[ONE]];
      const op = new Q5mOperator(matrix); // No name
      
      const inverse = op.inverse();
      expect(inverse.name).toBeUndefined();
    });
  });

  describe('Time Evolution', () => {
    it('should compute time evolution operator', () => {
      const hamiltonian = Q5mOperator.pauliZ(); // Diagonal Hamiltonian
      const time = 0.5;
      const hbar = 1.0;
      
      const evolutionOp = hamiltonian.getTimeEvolutionOperator(time, hbar);
      
      expect(evolutionOp).toBeDefined();
      expect(evolutionOp.length).toBe(2);
      expect(evolutionOp[0].length).toBe(2);
      
      // Should be diagonal for diagonal Hamiltonian
      expect(evolutionOp[0][1].abs()).toBeCloseTo(0, 10);
      expect(evolutionOp[1][0].abs()).toBeCloseTo(0, 10);
      
      // Check phases: exp(-i * energy * time / hbar)
      const energy0 = 1.0;  // H[0,0] = 1
      const energy1 = -1.0; // H[1,1] = -1
      const expectedPhase0 = (-energy0 * time) / hbar;
      const expectedPhase1 = (-energy1 * time) / hbar;
      
      expect(evolutionOp[0][0].re).toBeCloseTo(Math.cos(expectedPhase0), 10);
      expect(evolutionOp[0][0].im).toBeCloseTo(Math.sin(expectedPhase0), 10);
      expect(evolutionOp[1][1].re).toBeCloseTo(Math.cos(expectedPhase1), 10);
      expect(evolutionOp[1][1].im).toBeCloseTo(Math.sin(expectedPhase1), 10);
    });

    it('should use custom hbar parameter', () => {
      const hamiltonian = Q5mOperator.pauliZ();
      const time = 1.0;
      const customHbar = 2.0;
      
      const evolutionOp = hamiltonian.getTimeEvolutionOperator(time, customHbar);
      
      // Verify phase calculation with custom hbar
      const energy0 = 1.0;
      const expectedPhase = (-energy0 * time) / customHbar;
      expect(evolutionOp[0][0].re).toBeCloseTo(Math.cos(expectedPhase), 10);
    });
  });

  describe('Hadamard Invalid Dimension', () => {
    it('should throw error for non-power-of-2 dimensions', () => {
      const invalidDimensions = [0, -1, 3, 5, 6, 7, 9, 10];
      
      invalidDimensions.forEach(dim => {
        expect(() => Q5mOperator.Hadamard(dim))
          .toThrow(`Dimension must be a positive power of 2, got ${dim}`);
      });
    });

    it('should create valid Hadamard for powers of 2', () => {
      const validDimensions = [1, 2, 4, 8, 16];
      
      validDimensions.forEach(dim => {
        const hadamard = Q5mOperator.Hadamard(dim);
        expect(hadamard.dimension).toBe(dim);
        expect(hadamard.name).toBe(dim === 2 ? 'H' : `H${dim}`);
      });
    });
  });

  describe('Matrix Analysis', () => {
    it('should calculate sparsity ratio', () => {
      // Dense matrix (all non-zero)
      const denseMatrix: Unitary = [
        [complex(0.5, 0), complex(0.5, 0)],
        [complex(0.5, 0), complex(-0.5, 0)]
      ];
      const denseOp = new Q5mOperator(denseMatrix);
      expect(denseOp.getSparsity()).toBe(1.0); // All elements non-zero
      
      // Sparse matrix (identity)
      const identityOp = Q5mOperator.identity(2);
      expect(identityOp.getSparsity()).toBe(0.5); // 2 out of 4 elements non-zero
      
      // Very sparse matrix
      const sparseMatrix: Unitary = [
        [ONE, ZERO, ZERO, ZERO],
        [ZERO, ZERO, ZERO, ZERO],
        [ZERO, ZERO, ZERO, ZERO],
        [ZERO, ZERO, ZERO, ONE]
      ];
      const sparseOp = new Q5mOperator(sparseMatrix);
      expect(sparseOp.getSparsity()).toBe(2/16); // 2 out of 16 elements non-zero
    });

    it('should handle custom tolerance in sparsity calculation', () => {
      const almostZeroMatrix: Unitary = [
        [ONE, complex(1e-16, 0)], // Very small but non-zero
        [ZERO, ONE]
      ];
      const op = new Q5mOperator(almostZeroMatrix);
      
      // With default tolerance (1e-15), element 1e-16 is considered zero
      expect(op.getSparsity()).toBe(0.5); // 2 out of 4 elements non-zero
      
      // With lower tolerance, should consider 1e-16 as non-zero
      expect(op.getSparsity(1e-17)).toBe(0.75); // 3 out of 4 elements non-zero
    });

    it('should determine if matrix is sparse', () => {
      const denseOp = new Q5mOperator([[
        complex(0.5, 0), complex(0.5, 0)],
        [complex(0.5, 0), complex(-0.5, 0)]
      ]);
      expect(denseOp.isSparse()).toBe(false); // sparsity = 1.0 > 0.3
      
      const identityOp = Q5mOperator.identity(4);
      expect(identityOp.isSparse()).toBe(true); // sparsity = 0.25 < 0.3
      
      // Test custom threshold
      expect(identityOp.isSparse(0.2)).toBe(false); // 0.25 > 0.2
    });

    it('should analyze operator structure', () => {
      // Single qubit operator
      const singleQubit = Q5mOperator.pauliX();
      const analysis1 = singleQubit.analyzeStructure();
      expect(analysis1.isSingleQubit).toBe(true);
      expect(analysis1.isControlled).toBe(false);
      expect(analysis1.hasBlockStructure).toBe(false);
      
      // Controlled operator (CNOT structure)
      const cnotMatrix: Unitary = [
        [ONE, ZERO, ZERO, ZERO],
        [ZERO, ONE, ZERO, ZERO],
        [ZERO, ZERO, ZERO, ONE],
        [ZERO, ZERO, ONE, ZERO]
      ];
      const cnot = new Q5mOperator(cnotMatrix);
      const analysis2 = cnot.analyzeStructure();
      expect(analysis2.isSingleQubit).toBe(false);
      expect(analysis2.isControlled).toBe(true);
      
      // Block diagonal structure
      const blockDiag: Unitary = [
        [ONE, ZERO, ZERO, ZERO],
        [ZERO, complex(-1, 0), ZERO, ZERO],
        [ZERO, ZERO, ONE, ZERO],
        [ZERO, ZERO, ZERO, complex(-1, 0)]
      ];
      const blockOp = new Q5mOperator(blockDiag);
      const analysis3 = blockOp.analyzeStructure();
      expect(analysis3.hasBlockStructure).toBe(true);
    });
  });

  describe('Private Method Tests', () => {
    it('should test controlled structure detection for non-4x4 matrix', () => {
      // Test hasControlledStructure for non-4x4
      const op2x2 = Q5mOperator.pauliX();
      const analysis = op2x2.analyzeStructure();
      expect(analysis.isControlled).toBe(false); // Should be false for 2x2
    });

    it('should test block diagonal structure for invalid sizes', () => {
      // Test hasBlockDiagonalStructure for invalid sizes
      const op3x3 = Q5mOperator.identity(3); // Odd dimension
      const analysis1 = op3x3.analyzeStructure();
      expect(analysis1.hasBlockStructure).toBe(false);
      
      const op2x2 = Q5mOperator.identity(2); // Too small
      const analysis2 = op2x2.analyzeStructure();
      expect(analysis2.hasBlockStructure).toBe(false);
    });

    it('should return false for non-block-diagonal matrix', () => {
      // Create a 4x4 matrix that has non-zero elements in off-diagonal blocks
      // This will test the return false
      const nonBlockDiag: Unitary = [
        [ONE, ZERO, complex(0.1, 0), ZERO], // Non-zero in off-diagonal block
        [ZERO, complex(-1, 0), ZERO, ZERO],
        [ZERO, ZERO, ONE, ZERO],
        [ZERO, ZERO, ZERO, complex(-1, 0)]
      ];
      const op = new Q5mOperator(nonBlockDiag);
      const analysis = op.analyzeStructure();
      expect(analysis.hasBlockStructure).toBe(false); // Should be false due to non-zero off-diagonal
    });
  });

  describe('Error Handling', () => {
    it('should handle null/undefined matrices', () => {
      expect(() => new Q5mOperator(null as any)).toThrow();
      expect(() => new Q5mOperator(undefined as any)).toThrow();
    });

    it('should validate matrix structure', () => {
      const invalidMatrices = [
        [[]], // Empty row
        [[ONE], [ZERO, ONE]], // Inconsistent row lengths
        [], // Empty matrix
      ];
      
      invalidMatrices.forEach((matrix) => {
        expect(() => new Q5mOperator(matrix as any))
          .toThrow('Quantum operator must be a square matrix');
      });
    });
  });

  // Advanced tests moved to:
  // - Q5mOperator.2.test.ts: comprehensive tests, mock tests, and unreachable code tests
});
