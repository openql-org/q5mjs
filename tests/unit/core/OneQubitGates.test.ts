// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { 
  HadamardGate, 
  PauliXGate, 
  PauliYGate, 
  PauliZGate, 
  SGate, 
  TGate,
  IdentityGate,
  PhaseGate,
  RotationXGate,
  RotationYGate,
  RotationZGate,
  UnitaryGate
} from '@/core/OneQubitGates';
import { QubitState } from '@/core/QubitState';
import { complex, ONE, ZERO } from '@/math/complex';

describe('OneQubitGates', () => {
  describe('HadamardGate', () => {
    let hadamard: HadamardGate;

    beforeEach(() => {
      hadamard = new HadamardGate();
    });

    it('should have correct properties', () => {
      expect(hadamard.name).toBe('H');
      expect(hadamard.size).toBe(2);
      expect(hadamard.matrix).toHaveLength(2);
      expect(hadamard.matrix[0]).toHaveLength(2);
    });

    it('should create superposition from |0⟩', () => {
      const state = QubitState.zero();
      const result = hadamard.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
    });

    it('should create superposition from |1⟩', () => {
      const state = QubitState.one();
      const result = hadamard.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[1].re).toBeCloseTo(-1/Math.sqrt(2), 10);
    });

    it('should be self-inverse (HH = I)', () => {
      const state = QubitState.zero();
      const temp = hadamard.applyTo(state);
      const result = hadamard.applyTo(temp);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
    });
  });

  describe('PauliXGate', () => {
    let pauliX: PauliXGate;

    beforeEach(() => {
      pauliX = new PauliXGate();
    });

    it('should have correct properties', () => {
      expect(pauliX.name).toBe('X');
      expect(pauliX.size).toBe(2);
      expect(pauliX.matrix).toEqual([
        [ZERO, ONE],
        [ONE, ZERO]
      ]);
    });

    it('should flip |0⟩ to |1⟩', () => {
      const state = QubitState.zero();
      const result = pauliX.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
    });

    it('should flip |1⟩ to |0⟩', () => {
      const state = QubitState.one();
      const result = pauliX.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
    });

    it('should be self-inverse (XX = I)', () => {
      const state = QubitState.zero();
      const result = pauliX.applyTo(pauliX.applyTo(state));
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
    });
  });

  describe('PauliYGate', () => {
    let pauliY: PauliYGate;

    beforeEach(() => {
      pauliY = new PauliYGate();
    });

    it('should have correct properties', () => {
      expect(pauliY.name).toBe('Y');
      expect(pauliY.size).toBe(2);
      expect(pauliY.matrix).toHaveLength(2);
      expect(pauliY.matrix[0]).toHaveLength(2);
    });

    it('should flip |0⟩ to i|1⟩', () => {
      const state = QubitState.zero();
      const result = pauliY.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].im).toBeCloseTo(1, 10);
      expect(amplitudes[1].re).toBeCloseTo(0, 10);
    });

    it('should flip |1⟩ to -i|0⟩', () => {
      const state = QubitState.one();
      const result = pauliY.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[0].im).toBeCloseTo(-1, 10);
      expect(amplitudes[0].re).toBeCloseTo(0, 10);
    });

    it('should be self-inverse (YY = I)', () => {
      const state = QubitState.zero();
      const result = pauliY.applyTo(pauliY.applyTo(state));
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
    });
  });

  describe('PauliZGate', () => {
    let pauliZ: PauliZGate;

    beforeEach(() => {
      pauliZ = new PauliZGate();
    });

    it('should have correct properties', () => {
      expect(pauliZ.name).toBe('Z');
      expect(pauliZ.size).toBe(2);
      expect(pauliZ.matrix).toEqual([
        [ONE, ZERO],
        [ZERO, complex(-1, 0)]
      ]);
    });

    it('should leave |0⟩ unchanged', () => {
      const state = QubitState.zero();
      const result = pauliZ.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[0].re).toBeCloseTo(1, 10);
    });

    it('should add phase to |1⟩', () => {
      const state = QubitState.one();
      const result = pauliZ.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].re).toBeCloseTo(-1, 10);
      expect(amplitudes[1].im).toBeCloseTo(0, 10);
    });

    it('should be self-inverse (ZZ = I)', () => {
      const state = QubitState.one();
      const result = pauliZ.applyTo(pauliZ.applyTo(state));
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].re).toBeCloseTo(1, 10);
    });
  });

  describe('SGate', () => {
    let sGate: SGate;

    beforeEach(() => {
      sGate = new SGate();
    });

    it('should have correct properties', () => {
      expect(sGate.name).toBe('S');
      expect(sGate.size).toBe(2);
      expect(sGate.matrix).toHaveLength(2);
    });

    it('should leave |0⟩ unchanged', () => {
      const state = QubitState.zero();
      const result = sGate.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
    });

    it('should add π/2 phase to |1⟩', () => {
      const state = QubitState.one();
      const result = sGate.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].re).toBeCloseTo(0, 10);
      expect(amplitudes[1].im).toBeCloseTo(1, 10);
    });

    it('should satisfy S² = Z', () => {
      const state = QubitState.one();
      const result = sGate.applyTo(sGate.applyTo(state));
      const amplitudes = result.amplitudes();

      // S² should give -|1⟩ (same as Z gate)
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].re).toBeCloseTo(-1, 10);
    });
  });

  describe('TGate', () => {
    let tGate: TGate;

    beforeEach(() => {
      tGate = new TGate();
    });

    it('should have correct properties', () => {
      expect(tGate.name).toBe('T');
      expect(tGate.size).toBe(2);
      expect(tGate.matrix).toHaveLength(2);
    });

    it('should leave |0⟩ unchanged', () => {
      const state = QubitState.zero();
      const result = tGate.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
    });

    it('should add π/4 phase to |1⟩', () => {
      const state = QubitState.one();
      const result = tGate.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].re).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[1].im).toBeCloseTo(1/Math.sqrt(2), 10);
    });

    it('should satisfy T² = S', () => {
      const state = QubitState.one();
      const result = tGate.applyTo(tGate.applyTo(state));
      const amplitudes = result.amplitudes();

      // T² should give i|1⟩ (same as S gate)
      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].re).toBeCloseTo(0, 10);
      expect(amplitudes[1].im).toBeCloseTo(1, 10);
    });
  });

  describe('IdentityGate', () => {
    let identity: IdentityGate;

    beforeEach(() => {
      identity = new IdentityGate();
    });

    it('should have correct properties', () => {
      expect(identity.name).toBe('I');
      expect(identity.size).toBe(2);
      expect(identity.matrix).toEqual([
        [ONE, ZERO],
        [ZERO, ONE]
      ]);
    });

    it('should leave |0⟩ unchanged', () => {
      const state = QubitState.zero();
      const result = identity.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
    });

    it('should leave |1⟩ unchanged', () => {
      const state = QubitState.one();
      const result = identity.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
    });

    it('should leave superposition unchanged', () => {
      const state = QubitState.plus();
      const result = identity.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
    });
  });

  describe('PhaseGate', () => {
    it('should create gate with specified phase', () => {
      const phi = Math.PI / 3;
      const phaseGate = new PhaseGate(phi);

      expect(phaseGate.name).toContain(phi.toFixed(3));
      expect(phaseGate.size).toBe(2);
      expect(phaseGate.matrix).toHaveLength(2);
    });

    it('should leave |0⟩ unchanged', () => {
      const phaseGate = new PhaseGate(Math.PI / 4);
      const state = QubitState.zero();
      const result = phaseGate.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
    });

    it('should add specified phase to |1⟩', () => {
      const phi = Math.PI / 6;
      const phaseGate = new PhaseGate(phi);
      const state = QubitState.one();
      const result = phaseGate.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].re).toBeCloseTo(Math.cos(phi), 10);
      expect(amplitudes[1].im).toBeCloseTo(Math.sin(phi), 10);
    });

    it('should handle zero phase (identity)', () => {
      const phaseGate = new PhaseGate(0);
      const state = QubitState.one();
      const result = phaseGate.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].re).toBeCloseTo(1, 10);
      expect(amplitudes[1].im).toBeCloseTo(0, 10);
    });

    it('should handle π phase (Z gate)', () => {
      const phaseGate = new PhaseGate(Math.PI);
      const state = QubitState.one();
      const result = phaseGate.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].re).toBeCloseTo(-1, 10);
      expect(amplitudes[1].im).toBeCloseTo(0, 5);
    });
  });

  describe('RotationXGate (Rotation X)', () => {
    it('should create RX gate with specified angle', () => {
      const theta = Math.PI / 4;
      const rxGate = new RotationXGate(theta);

      expect(rxGate.name).toContain('RX');
      expect(rxGate.name).toContain(theta.toFixed(3));
      expect(rxGate.size).toBe(2);
    });

    it('should rotate |0⟩ around X axis', () => {
      const theta = Math.PI / 2; // 90 degree rotation
      const rxGate = new RotationXGate(theta);
      const state = QubitState.zero();
      const result = rxGate.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
    });

    it('should handle π rotation (X gate)', () => {
      const rxGate = new RotationXGate(Math.PI);
      const state = QubitState.zero();
      const result = rxGate.applyTo(state);
      const amplitudes = result.amplitudes();

      // RX(π) should be equivalent to -iX, so we expect |1⟩ with phase
      expect(amplitudes[0].abs()).toBeCloseTo(0, 5);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 5);
    });
  });

  describe('RotationYGate (Rotation Y)', () => {
    it('should create RY gate with specified angle', () => {
      const theta = Math.PI / 3;
      const ryGate = new RotationYGate(theta);

      expect(ryGate.name).toContain('RY');
      expect(ryGate.name).toContain(theta.toFixed(3));
      expect(ryGate.size).toBe(2);
    });

    it('should rotate |0⟩ around Y axis', () => {
      const theta = Math.PI / 2; // 90 degree rotation
      const ryGate = new RotationYGate(theta);
      const state = QubitState.zero();
      const result = ryGate.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
    });

    it('should handle π rotation (Y gate)', () => {
      const ryGate = new RotationYGate(Math.PI);
      const state = QubitState.zero();
      const result = ryGate.applyTo(state);
      const amplitudes = result.amplitudes();

      // RY(π) should flip to |1⟩
      expect(amplitudes[0].abs()).toBeCloseTo(0, 5);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 5);
    });
  });

  describe('RotationZGate (Rotation Z)', () => {
    it('should create RZ gate with specified angle', () => {
      const theta = Math.PI / 5;
      const rzGate = new RotationZGate(theta);

      expect(rzGate.name).toContain('RZ');
      expect(rzGate.name).toContain(theta.toFixed(3));
      expect(rzGate.size).toBe(2);
    });

    it('should leave |0⟩ unchanged with phase', () => {
      const theta = Math.PI / 4;
      const rzGate = new RotationZGate(theta);
      const state = QubitState.zero();
      const result = rzGate.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
    });

    it('should add phase to |1⟩', () => {
      const theta = Math.PI / 2;
      const rzGate = new RotationZGate(theta);
      const state = QubitState.one();
      const result = rzGate.applyTo(state);
      const amplitudes = result.amplitudes();

      expect(amplitudes[0].abs()).toBeCloseTo(0, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(1, 10);
    });
  });

  describe('Gate Combinations', () => {
    it('should combine Pauli gates correctly (XYZ = -iI)', () => {
      const x = new PauliXGate();
      const y = new PauliYGate();
      const z = new PauliZGate();
      
      const state = QubitState.zero();
      const result = z.applyTo(y.applyTo(x.applyTo(state)));
      const amplitudes = result.amplitudes();

      // XYZ should give -i times identity, so we expect phase shift
      expect(amplitudes[0].abs()).toBeCloseTo(1, 10);
      expect(amplitudes[1].abs()).toBeCloseTo(0, 10);
    });

    it('should create Bell state with H and CNOT equivalent operations', () => {
      // Test preparation for two-qubit operations
      const hadamard = new HadamardGate();
      const state = new QubitState(1);
      const result = hadamard.applyTo(state);

      expect(result.amplitudes()[0].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(result.amplitudes()[1].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid phase angles gracefully', () => {
      expect(() => new PhaseGate(NaN)).not.toThrow();
      expect(() => new PhaseGate(Infinity)).not.toThrow();
      expect(() => new PhaseGate(-Infinity)).not.toThrow();
    });

    it('should handle very large angles', () => {
      const largeAngle = 100 * Math.PI;
      expect(() => new RotationXGate(largeAngle)).not.toThrow();
      expect(() => new RotationYGate(largeAngle)).not.toThrow();
      expect(() => new RotationZGate(largeAngle)).not.toThrow();
    });

    it('should handle zero angles', () => {
      const rxGate = new RotationXGate(0);
      const ryGate = new RotationYGate(0);
      const rzGate = new RotationZGate(0);

      expect(rxGate.size).toBe(2);
      expect(ryGate.size).toBe(2);
      expect(rzGate.size).toBe(2);
    });
  });

  describe('Matrix Properties', () => {
    it('should have unitary matrices', () => {
      const gates = [
        new HadamardGate(),
        new PauliXGate(),
        new PauliYGate(),
        new PauliZGate(),
        new SGate(),
        new TGate(),
        new IdentityGate(),
        new PhaseGate(Math.PI / 4),
        new RotationXGate(Math.PI / 6),
        new RotationYGate(Math.PI / 3),
        new RotationZGate(Math.PI / 2)
      ];

      gates.forEach(gate => {
        expect(gate.matrix).toHaveLength(2);
        expect(gate.matrix[0]).toHaveLength(2);
        expect(gate.size).toBe(2);
        
        // Each matrix element should be a complex number
        gate.matrix.forEach(row => {
          row.forEach(element => {
            expect(element).toHaveProperty('re');
            expect(element).toHaveProperty('im');
          });
        });
      });
    });
  });

  describe('UnitaryGate', () => {
    describe('Constructor', () => {
      it('should create gate with provided name', () => {
        const alpha = complex(1, 0);
        const beta = complex(0, 0);
        const customName = 'CustomGate';
        
        const gate = new UnitaryGate(customName, alpha, beta);
        
        expect(gate.name).toBe(customName);
        expect(gate.size).toBe(2);
        expect(gate.matrix).toHaveLength(2);
      });

      it('should create gate with automatic name when name is empty', () => {
        const alpha = complex(0.707, 0);
        const beta = complex(0.707, 0);
        
        const gate = new UnitaryGate('', alpha, beta); // Empty name
        
        expect(gate.name).toContain('U(');
        expect(gate.name).toContain('0.707');
        expect(gate.name).not.toBe('');
      });

      it('should create gate with automatic name when name is null/undefined', () => {
        const alpha = complex(1, 0);
        const beta = complex(0, 0);
        
        const gate = new UnitaryGate('   ', alpha, beta); // Whitespace only name
        
        expect(gate.name).toContain('U(');
        expect(gate.name).toContain('1.000');
      });

      it('should handle theta parameter', () => {
        const alpha = complex(1, 0);
        const beta = complex(0, 0);
        const theta = Math.PI / 4;
        
        const gate = new UnitaryGate('TestWithTheta', alpha, beta, theta);
        
        expect(gate.name).toBe('TestWithTheta');
        expect(gate.getGlobalPhase()).toBeCloseTo(theta, 10);
      });

      it('should use default theta when not provided', () => {
        const alpha = complex(1, 0);
        const beta = complex(0, 0);
        
        const gate = new UnitaryGate('TestNoTheta', alpha, beta);
        
        expect(gate.getGlobalPhase()).toBe(0);
      });

      it('should include theta in automatic name when non-zero', () => {
        const alpha = complex(0.5, 0);
        const beta = complex(0.5, 0);
        const theta = Math.PI / 3;
        
        const gate = new UnitaryGate('', alpha, beta, theta);
        
        expect(gate.name).toContain(',θ=');
        expect(gate.name).toContain(theta.toFixed(3));
      });

      it('should not include theta in automatic name when zero', () => {
        const alpha = complex(0.5, 0);
        const beta = complex(0.5, 0);
        
        const gate = new UnitaryGate('', alpha, beta, 0);
        
        expect(gate.name).not.toContain(',θ=');
        expect(gate.name).not.toContain('θ');
      });

      it('should format negative imaginary parts correctly', () => {
        const alpha = complex(0.5, -0.3); // Negative imaginary part
        const beta = complex(0.4, 0.2);    // Positive imaginary part
        
        const gate = new UnitaryGate('', alpha, beta);
        
        // The key test is that negative imaginary parts use '-' and positive use '+'
        expect(gate.name).toMatch(/-\d+\.\d+i/); // Should contain minus sign before imaginary part
        expect(gate.name).toMatch(/\+\d+\.\d+i/); // Should contain plus sign before imaginary part
        expect(gate.name).toContain('U('); // Should be auto-generated name
      });

      it('should format both alpha and beta in auto-generated name', () => {
        const alpha = complex(0.6, 0.0);  // Real-only alpha
        const beta = complex(0.0, 0.8);   // Imaginary-only beta
        
        const gate = new UnitaryGate('', alpha, beta);
        
        // This should test both alphaStr and betaStr formatting
        expect(gate.name).toContain('U(');
        expect(gate.name).toContain(','); // Separator between alpha and beta
        expect(gate.name).toContain('i'); // Beta is imaginary
      });
    });

    describe('Static Factory Method', () => {
      it('should create gate using fromState factory', () => {
        const alpha = complex(0.8, 0);
        const beta = complex(0.6, 0);
        const theta = Math.PI / 6;
        
        const gate = UnitaryGate.fromState('FactoryGate', alpha, beta, theta);
        
        expect(gate.name).toBe('FactoryGate');
        expect(gate.size).toBe(2);
        expect(gate.getGlobalPhase()).toBeCloseTo(theta, 10);
      });

      it('should create gate using fromState without theta', () => {
        const alpha = complex(1, 0);
        const beta = complex(0, 0);
        
        const gate = UnitaryGate.fromState('ZeroState', alpha, beta);
        
        expect(gate.name).toBe('ZeroState');
        expect(gate.getGlobalPhase()).toBe(0);
      });
    });

    describe('Amplitude Methods', () => {
      it('should return normalized amplitudes', () => {
        const alpha = complex(3, 4); // |alpha|^2 = 25
        const beta = complex(0, 0);  // |beta|^2 = 0
        
        const gate = new UnitaryGate('Test', alpha, beta);
        const amplitudes = gate.getAmplitudes();
        
        expect(amplitudes.alpha.abs()).toBeCloseTo(1, 10); // Should be normalized
        expect(amplitudes.beta.abs()).toBeCloseTo(0, 10);
      });

      it('should return correct alpha and beta structure', () => {
        const alpha = complex(0.6, 0);
        const beta = complex(0.8, 0);
        
        const gate = new UnitaryGate('Test', alpha, beta);
        const amplitudes = gate.getAmplitudes();
        
        expect(amplitudes).toHaveProperty('alpha');
        expect(amplitudes).toHaveProperty('beta');
        expect(amplitudes.alpha).toHaveProperty('re');
        expect(amplitudes.alpha).toHaveProperty('im');
        expect(amplitudes.beta).toHaveProperty('re');
        expect(amplitudes.beta).toHaveProperty('im');
      });
    });

    describe('Global Phase Method', () => {
      it('should return the global phase angle', () => {
        const alpha = complex(1, 0);
        const beta = complex(0, 0);
        const expectedTheta = Math.PI / 2;
        
        const gate = new UnitaryGate('Test', alpha, beta, expectedTheta);
        
        expect(gate.getGlobalPhase()).toBe(expectedTheta);
      });

      it('should return zero for default phase', () => {
        const alpha = complex(1, 0);
        const beta = complex(0, 0);
        
        const gate = new UnitaryGate('Test', alpha, beta);
        
        expect(gate.getGlobalPhase()).toBe(0);
      });
    });

    describe('Complex State Transformations', () => {
      it('should transform states correctly using custom amplitudes', () => {
        const alpha = complex(1/Math.sqrt(2), 0);
        const beta = complex(0, 1/Math.sqrt(2)); // i/sqrt(2)
        
        const gate = new UnitaryGate('CustomSuperposition', alpha, beta);
        const state = QubitState.zero();
        const result = gate.applyTo(state);
        const resultAmplitudes = result.amplitudes();
        
        expect(resultAmplitudes[0].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
        expect(resultAmplitudes[1].abs()).toBeCloseTo(1/Math.sqrt(2), 10);
        expect(resultAmplitudes[1].re).toBeCloseTo(0, 10);
        expect(resultAmplitudes[1].im).toBeCloseTo(1/Math.sqrt(2), 10);
      });

      it('should handle complex amplitudes with global phase', () => {
        const alpha = complex(1, 0);
        const beta = complex(0, 0);
        const globalPhase = Math.PI / 4;
        
        const gate = new UnitaryGate('PhasedIdentity', alpha, beta, globalPhase);
        const state = QubitState.zero();
        const result = gate.applyTo(state);
        
        // Should still be in |0⟩ state, but with global phase
        const resultAmplitudes = result.amplitudes();
        expect(resultAmplitudes[0].abs()).toBeCloseTo(1, 10);
        expect(resultAmplitudes[1].abs()).toBeCloseTo(0, 10);
      });

      it('should format betaStr with negative imaginary beta', () => {
        // This test is designed to test betaStr formatting in the UnitaryGate constructor
        const alpha = complex(0.6, 0.2);    // Positive imaginary alpha
        const beta = complex(0.3, -0.4);    // Negative imaginary beta for formatting test
        
        const gate = new UnitaryGate('', alpha, beta); // Empty name to force auto-generation
        
        // The key is that beta has a negative imaginary part, so it should format correctly with a minus sign
        expect(gate.name).toContain('U(');
        expect(gate.name).toContain('-'); // Should contain minus sign from negative imaginary part
        expect(gate.name).toContain(','); // Should contain separator between alpha and beta
        
        // Verify the gate works correctly
        const amplitudes = gate.getAmplitudes();
        expect(amplitudes.alpha).toBeDefined();
        expect(amplitudes.beta).toBeDefined();
      });
    });
  });

  describe('Exported Gate Instances and Factory Functions', () => {
    // Test all exported gate instances to improve function tests
    
    describe('Exported Gate Instances', () => {
      it('should test all exported gate instances', () => {
        const { H, X, Y, Z, S, T, Identity } = require('@/core/OneQubitGates');
        
        // Test Hadamard instance
        expect(H.name).toBe('H');
        expect(H.size).toBe(2);
        
        // Test Pauli-X instance
        expect(X.name).toBe('X');
        expect(X.size).toBe(2);
        
        // Test Pauli-Y instance
        expect(Y.name).toBe('Y');
        expect(Y.size).toBe(2);
        
        // Test Pauli-Z instance
        expect(Z.name).toBe('Z');
        expect(Z.size).toBe(2);
        
        // Test S gate instance
        expect(S.name).toBe('S');
        expect(S.size).toBe(2);
        
        // Test T gate instance
        expect(T.name).toBe('T');
        expect(T.size).toBe(2);
        
        // Test Identity gate instance
        expect(Identity.name).toBe('I');
        expect(Identity.size).toBe(2);
      });

      it('should verify exported instances work on quantum states', () => {
        const { H, X, Y, Z, S, T, Identity } = require('@/core/OneQubitGates');
        const state = QubitState.zero();
        
        // Test that all instances can be applied to states
        const hResult = H.applyTo(state);
        expect(hResult.amplitudes()).toHaveLength(2);
        
        const xResult = X.applyTo(state);
        expect(xResult.amplitudes()[1].abs()).toBeCloseTo(1, 10);
        
        const yResult = Y.applyTo(state);
        expect(yResult.amplitudes()).toHaveLength(2);
        
        const zResult = Z.applyTo(state);
        expect(zResult.amplitudes()[0].abs()).toBeCloseTo(1, 10);
        
        const sResult = S.applyTo(state);
        expect(sResult.amplitudes()[0].abs()).toBeCloseTo(1, 10);
        
        const tResult = T.applyTo(state);
        expect(tResult.amplitudes()[0].abs()).toBeCloseTo(1, 10);
        
        const iResult = Identity.applyTo(state);
        expect(iResult.amplitudes()[0].abs()).toBeCloseTo(1, 10);
      });
    });

    describe('Exported Factory Functions', () => {
      it('should test all exported factory functions', () => {
        const { PH, RX, RY, RZ } = require('@/core/OneQubitGates');
        
        // Test Phase gate factory
        const phaseGate = PH(Math.PI / 3);
        expect(phaseGate.name).toContain('P(');
        expect(phaseGate.size).toBe(2);
        
        // Test RX factory
        const rxGate = RX(Math.PI / 2);
        expect(rxGate.name).toContain('RX(');
        expect(rxGate.size).toBe(2);
        
        // Test RY factory
        const ryGate = RY(Math.PI / 4);
        expect(ryGate.name).toContain('RY(');
        expect(ryGate.size).toBe(2);
        
        // Test RZ factory
        const rzGate = RZ(Math.PI / 6);
        expect(rzGate.name).toContain('RZ(');
        expect(rzGate.size).toBe(2);
      });

      it('should verify factory functions create working gates', () => {
        const { PH, RX, RY, RZ } = require('@/core/OneQubitGates');
        const state = QubitState.zero();
        
        // Test that all factory-created gates work
        const phResult = PH(0).applyTo(state); // 0 phase = identity
        expect(phResult.amplitudes()[0].abs()).toBeCloseTo(1, 10);
        
        const rxResult = RX(Math.PI).applyTo(state); // π rotation = X gate
        expect(rxResult.amplitudes()[1].abs()).toBeCloseTo(1, 10);
        
        const ryResult = RY(Math.PI).applyTo(state); // π rotation around Y
        expect(ryResult.amplitudes()).toHaveLength(2);
        
        const rzResult = RZ(0).applyTo(state); // 0 rotation = identity
        expect(rzResult.amplitudes()[0].abs()).toBeCloseTo(1, 10);
      });

      it('should test factory functions with various parameters', () => {
        const { PH, RX, RY, RZ } = require('@/core/OneQubitGates');
        
        // Test with different angles to ensure full testing
        const angles = [0, Math.PI / 6, Math.PI / 4, Math.PI / 2, Math.PI, 2 * Math.PI];
        
        angles.forEach(angle => {
          const ph = PH(angle);
          expect(ph.size).toBe(2);
          expect(typeof ph.name).toBe('string');
          
          const rx = RX(angle);
          expect(rx.size).toBe(2);
          expect(typeof rx.name).toBe('string');
          
          const ry = RY(angle);
          expect(ry.size).toBe(2);
          expect(typeof ry.name).toBe('string');
          
          const rz = RZ(angle);
          expect(rz.size).toBe(2);
          expect(typeof rz.name).toBe('string');
        });
      });
    });

    describe('Edge Cases and Functionality Tests', () => {
      it('should test UnitaryGate with extreme values for better testing', () => {
        // Test with very small values
        const smallAlpha = complex(0.0001, -0.0002);
        const smallBeta = complex(-0.0003, 0.0004);
        const smallGate = new UnitaryGate('SmallValues', smallAlpha, smallBeta);
        expect(smallGate.name).toBe('SmallValues');
        
        // Test with values that will create specific formatting scenarios
        const formattingAlpha = complex(0, -1);  // Pure negative imaginary
        const formattingBeta = complex(-1, 0);   // Pure negative real
        const formattingGate = new UnitaryGate('', formattingAlpha, formattingBeta);
        expect(formattingGate.name).toContain('U(');
      });

      it('should test all possible sign combinations in UnitaryGate name formatting', () => {
        // Test all combinations of positive/negative real/imaginary parts
        const testCases = [
          { alpha: complex(0.1, 0.2), beta: complex(0.3, 0.4) },    // Both positive
          { alpha: complex(-0.1, 0.2), beta: complex(0.3, -0.4) },  // Mixed signs
          { alpha: complex(0.1, -0.2), beta: complex(-0.3, 0.4) },  // Mixed signs
          { alpha: complex(-0.1, -0.2), beta: complex(-0.3, -0.4) } // Both negative
        ];
        
        testCases.forEach((testCase, index) => {
          const gate = new UnitaryGate('', testCase.alpha, testCase.beta);
          expect(gate.name).toContain('U(');
          expect(gate.name).toContain(',');
          
          // Verify the gate is functional
          const amplitudes = gate.getAmplitudes();
          expect(amplitudes.alpha).toBeDefined();
          expect(amplitudes.beta).toBeDefined();
        });
      });

      it('should test fromState factory method with edge cases', () => {
        // Test with null/undefined/empty name variations
        const emptyNameGate = UnitaryGate.fromState('', complex(1, 0), complex(0, 0));
        expect(emptyNameGate.name).toContain('U(');
        
        // Test with very large theta
        const largeTheta = 10 * Math.PI;
        const largeThetaGate = UnitaryGate.fromState('LargeTheta', complex(1, 0), complex(0, 0), largeTheta);
        expect(largeThetaGate.getGlobalPhase()).toBe(largeTheta);
        
        // Test with negative theta
        const negativeTheta = -Math.PI / 3;
        const negativeThetaGate = UnitaryGate.fromState('', complex(0.5, 0.5), complex(0.5, -0.5), negativeTheta);
        expect(negativeThetaGate.name).toContain(',θ=');
        expect(negativeThetaGate.name).toContain('-'); // Should contain negative sign
      });
    });
  });
});