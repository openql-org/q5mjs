// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import type { Q5mSystem } from '@/core/Q5mSystem';
import { QubitState } from '@/core/QubitState';
import { complex, ONE, ZERO } from '@/math/complex';

// Create a concrete implementation for testing Q5mSystem interface
class TestQ5mSystem implements Q5mSystem {
  private dim: number;
  private amplitudes: typeof complex[];

  constructor(dimension: number, amplitudes?: typeof complex[]) {
    this.dim = dimension;
    this.amplitudes = amplitudes || [ONE, ...Array(dimension - 1).fill(ZERO)];
    
    // Normalize amplitudes
    const norm = Math.sqrt(this.amplitudes.reduce((sum, amp) => sum + amp.abs() * amp.abs(), 0));
    if (norm > 0) {
      this.amplitudes = this.amplitudes.map(amp => amp.div(complex(norm, 0)));
    }
  }

  dimension(): number {
    return this.dim;
  }

  clone(): Q5mSystem {
    return new TestQ5mSystem(this.dim, [...this.amplitudes]);
  }

  tensor(other: Q5mSystem): Q5mSystem {
    const newDim = this.dim * other.dimension();
    const otherAmps = (other as TestQ5mSystem).amplitudes || [ONE];
    const newAmps: typeof complex[] = [];

    for (let i = 0; i < this.amplitudes.length; i++) {
      for (let j = 0; j < otherAmps.length; j++) {
        newAmps.push(this.amplitudes[i].mul(otherAmps[j]));
      }
    }

    return new TestQ5mSystem(newDim, newAmps);
  }

  toString(precision: number = 3, threshold: number = 1e-10): string {
    const terms: string[] = [];
    
    for (let i = 0; i < this.amplitudes.length; i++) {
      const amp = this.amplitudes[i];
      if (amp.abs() > threshold) {
        const binary = i.toString(2).padStart(Math.log2(this.dim), '0');
        const ampStr = `${amp.re.toFixed(precision)}${amp.im >= 0 ? '+' : ''}${amp.im.toFixed(precision)}i`;
        terms.push(`${ampStr}|${binary}⟩`);
      }
    }
    
    return terms.join(' + ') || '0';
  }

  purity(): number {
    // For pure states, purity is always 1
    // For normalized states: Sum(|amp|^2) = 1
    // Purity = Sum(|amp|^4) for pure states
    const normSquared = this.amplitudes.reduce((sum, amp) => sum + Math.pow(amp.abs(), 2), 0);
    if (Math.abs(normSquared - 1) < 1e-10) {
      // Normalized pure state
      return 1;
    }
    const trace = this.amplitudes.reduce((sum, amp) => sum + Math.pow(amp.abs(), 4), 0);
    return trace;
  }

  isPure(): boolean {
    return Math.abs(this.purity() - 1) < 1e-10;
  }

  entropy(): number {
    // For pure states, entropy is 0
    // Check if normalized
    const normSquared = this.amplitudes.reduce((sum, amp) => sum + Math.pow(amp.abs(), 2), 0);
    if (Math.abs(normSquared - 1) < 1e-10) {
      return 0; // Pure normalized state has 0 entropy
    }
    
    // Shannon entropy calculation (for mixed states this would be different)
    let entropy = 0;
    for (const amp of this.amplitudes) {
      const prob = amp.abs() * amp.abs();
      if (prob > 1e-15) {
        entropy -= prob * Math.log2(prob);
      }
    }
    return entropy;
  }

  fidelity(other: Q5mSystem): number {
    if (this.dimension() !== other.dimension()) {
      throw new Error('Systems must have same dimension for fidelity calculation');
    }

    const otherAmps = (other as TestQ5mSystem).amplitudes;
    if (!otherAmps) return 0;

    // For pure states: F = |⟨ψ₁|ψ₂⟩|²
    let overlap = complex(0, 0);
    for (let i = 0; i < this.amplitudes.length; i++) {
      overlap = overlap.add(this.amplitudes[i].conjugate().mul(otherAmps[i]));
    }
    
    return overlap.abs() * overlap.abs();
  }

  getAmplitudes(): typeof complex[] {
    return [...this.amplitudes];
  }
}

describe('Q5mSystem Interface', () => {
  describe('Basic Properties', () => {
    it('should report correct dimension', () => {
      const system2 = new TestQ5mSystem(2);
      const system4 = new TestQ5mSystem(4);
      const system8 = new TestQ5mSystem(8);

      expect(system2.dimension()).toBe(2);
      expect(system4.dimension()).toBe(4);
      expect(system8.dimension()).toBe(8);
    });

    it('should handle different dimension sizes', () => {
      const dimensions = [2, 4, 8, 16, 32, 64];
      
      dimensions.forEach(dim => {
        const system = new TestQ5mSystem(dim);
        expect(system.dimension()).toBe(dim);
      });
    });

    it('should work with QubitState as Q5mSystem', () => {
      const qubitState: Q5mSystem = new QubitState(1);
      expect(qubitState.dimension()).toBe(2);
      expect(typeof qubitState.clone).toBe('function');
      expect(typeof qubitState.tensor).toBe('function');
    });

    it('should work with multi-qubit systems', () => {
      const twoQubitState: Q5mSystem = new QubitState(2);
      const threeQubitState: Q5mSystem = new QubitState(3);
      
      expect(twoQubitState.dimension()).toBe(4);
      expect(threeQubitState.dimension()).toBe(8);
    });
  });

  describe('Clone Operations', () => {
    it('should create independent clone', () => {
      const original = new TestQ5mSystem(2, [complex(0.6, 0), complex(0, 0.8)]);
      const clone = original.clone();
      
      expect(clone).not.toBe(original);
      expect(clone.dimension()).toBe(original.dimension());
      expect(clone.toString()).toBe(original.toString());
    });

    it('should clone with different dimensions', () => {
      const systems = [
        new TestQ5mSystem(2),
        new TestQ5mSystem(4),
        new TestQ5mSystem(8),
      ];
      
      systems.forEach(system => {
        const clone = system.clone();
        expect(clone.dimension()).toBe(system.dimension());
        expect(clone).not.toBe(system);
      });
    });

    it('should preserve quantum state in clone', () => {
      const amplitudes = [
        complex(0.5, 0),
        complex(0.5, 0),
        complex(0.5, 0),
        complex(0.5, 0)
      ];
      const original = new TestQ5mSystem(4, amplitudes);
      const clone = original.clone();
      
      expect(clone.toString()).toBe(original.toString());
      expect(clone.purity()).toBeCloseTo(original.purity(), 10);
    });

    it('should work with QubitState clone', () => {
      const original = QubitState.plus();
      const clone = original.clone();
      
      expect(clone).not.toBe(original);
      expect(clone.dimension()).toBe(original.dimension());
      expect(clone.toString()).toBe(original.toString());
    });
  });

  describe('Tensor Operations', () => {
    it('should create correct tensor product dimensions', () => {
      const sys1 = new TestQ5mSystem(2);
      const sys2 = new TestQ5mSystem(2);
      const sys3 = new TestQ5mSystem(4);
      
      const tensor1 = sys1.tensor(sys2);
      const tensor2 = sys1.tensor(sys3);
      const tensor3 = sys3.tensor(sys1);
      
      expect(tensor1.dimension()).toBe(4);  // 2 × 2
      expect(tensor2.dimension()).toBe(8);  // 2 × 4
      expect(tensor3.dimension()).toBe(8);  // 4 × 2
    });

    it('should handle tensor products with different amplitudes', () => {
      const sys1 = new TestQ5mSystem(2, [ONE, ZERO]);          // |0⟩
      const sys2 = new TestQ5mSystem(2, [ZERO, ONE]);          // |1⟩
      
      const tensor = sys1.tensor(sys2);
      expect(tensor.dimension()).toBe(4);
      
      const tensorAmps = (tensor as TestQ5mSystem).getAmplitudes();
      expect(tensorAmps[0].abs()).toBeCloseTo(0, 10);  // |00⟩
      expect(tensorAmps[1].abs()).toBeCloseTo(1, 10);  // |01⟩
      expect(tensorAmps[2].abs()).toBeCloseTo(0, 10);  // |10⟩
      expect(tensorAmps[3].abs()).toBeCloseTo(0, 10);  // |11⟩
    });

    it('should handle superposition tensor products', () => {
      const plus = new TestQ5mSystem(2, [
        complex(1/Math.sqrt(2), 0), 
        complex(1/Math.sqrt(2), 0)
      ]);
      const zero = new TestQ5mSystem(2, [ONE, ZERO]);
      
      const tensor = plus.tensor(zero);
      const tensorAmps = (tensor as TestQ5mSystem).getAmplitudes();
      
      expect(tensorAmps[0].abs()).toBeCloseTo(1/Math.sqrt(2), 10);  // |00⟩
      expect(tensorAmps[1].abs()).toBeCloseTo(0, 10);               // |01⟩
      expect(tensorAmps[2].abs()).toBeCloseTo(1/Math.sqrt(2), 10);  // |10⟩
      expect(tensorAmps[3].abs()).toBeCloseTo(0, 10);               // |11⟩
    });

    it('should work with QubitState tensor products', () => {
      const qubit1: Q5mSystem = QubitState.zero();
      const qubit2: Q5mSystem = QubitState.plus();
      
      const tensor = qubit1.tensor(qubit2);
      expect(tensor.dimension()).toBe(4);
      expect(tensor).toBeInstanceOf(QubitState);
    });

    it('should handle multiple tensor products', () => {
      const sys1 = new TestQ5mSystem(2);
      const sys2 = new TestQ5mSystem(2);
      const sys3 = new TestQ5mSystem(2);
      
      const tensor12 = sys1.tensor(sys2);
      const tensorCombined = tensor12.tensor(sys3);
      
      expect(tensorCombined.dimension()).toBe(8);  // 2 × 2 × 2
    });

    it('should preserve normalization in tensor products', () => {
      const sys1 = new TestQ5mSystem(2, [complex(0.6, 0), complex(0, 0.8)]);
      const sys2 = new TestQ5mSystem(2, [complex(0.8, 0), complex(0, 0.6)]);
      
      const tensor = sys1.tensor(sys2);
      const tensorAmps = (tensor as TestQ5mSystem).getAmplitudes();
      
      const norm = tensorAmps.reduce((sum, amp) => sum + amp.abs() * amp.abs(), 0);
      expect(norm).toBeCloseTo(1, 10);
    });
  });

  describe('String Representation', () => {
    it('should provide readable string representation', () => {
      const system = new TestQ5mSystem(2, [ONE, ZERO]);
      const str = system.toString();
      
      expect(str).toContain('|0⟩');
      expect(str).not.toContain('|1⟩');
    });

    it('should handle precision parameter', () => {
      const system = new TestQ5mSystem(2, [
        complex(1/Math.sqrt(2), 0), 
        complex(1/Math.sqrt(2), 0)
      ]);
      
      const str1 = system.toString(1);
      const str3 = system.toString(3);
      
      expect(str1).toMatch(/0\.7/);
      expect(str3).toMatch(/0\.707/);
    });

    it('should handle threshold parameter', () => {
      const system = new TestQ5mSystem(4, [
        complex(0.99, 0), 
        complex(0.01, 0), 
        ZERO, 
        ZERO
      ]);
      
      const strLow = system.toString(3, 1e-3);
      const strHigh = system.toString(3, 0.1);
      
      expect(strLow).toContain('|01⟩');
      expect(strHigh).not.toContain('|01⟩');
    });

    it('should work with QubitState toString', () => {
      const qubitState: Q5mSystem = QubitState.plus();
      const str = qubitState.toString();
      
      expect(str).toContain('|0⟩');
      expect(str).toContain('|1⟩');
    });

    it('should handle complex amplitudes', () => {
      const system = new TestQ5mSystem(2, [
        complex(0.5, 0.5), 
        complex(0.5, -0.5)
      ]);
      
      const str = system.toString();
      expect(str).toContain('0.500+0.500i');
      expect(str).toContain('0.500-0.500i');
    });

    it('should handle zero state appropriately', () => {
      const system = new TestQ5mSystem(2, [ZERO, ZERO]);
      const str = system.toString();
      
      expect(str).toBe('0');
    });
  });

  describe('Purity Calculations', () => {
    it('should return 1 for pure states', () => {
      const systems = [
        new TestQ5mSystem(2, [ONE, ZERO]),
        new TestQ5mSystem(2, [ZERO, ONE]),
        new TestQ5mSystem(2, [complex(1/Math.sqrt(2), 0), complex(1/Math.sqrt(2), 0)]),
      ];
      
      systems.forEach(system => {
        expect(system.purity()).toBeCloseTo(1, 10);
      });
    });

    it('should handle different system sizes', () => {
      const dimensions = [2, 4, 8];
      
      dimensions.forEach(dim => {
        const system = new TestQ5mSystem(dim);
        expect(system.purity()).toBeCloseTo(1, 10);
      });
    });

    it('should work with QubitState purity', () => {
      const qubitStates = [
        QubitState.zero(),
        QubitState.one(),
        QubitState.plus(),
        QubitState.minus(),
      ];
      
      qubitStates.forEach(state => {
        expect((state as Q5mSystem).purity()).toBeCloseTo(1, 10);
      });
    });

    it('should be consistent with isPure method', () => {
      const systems = [
        new TestQ5mSystem(2),
        new TestQ5mSystem(4),
        new TestQ5mSystem(8),
      ];
      
      systems.forEach(system => {
        const isPure = system.isPure();
        const purity = system.purity();
        
        if (isPure) {
          expect(purity).toBeCloseTo(1, 10);
        }
      });
    });
  });

  describe('Pure State Checks', () => {
    it('should correctly identify pure states', () => {
      const pureSystems = [
        new TestQ5mSystem(2, [ONE, ZERO]),
        new TestQ5mSystem(2, [ZERO, ONE]),
        new TestQ5mSystem(4, [ONE, ZERO, ZERO, ZERO]),
      ];
      
      pureSystems.forEach(system => {
        expect(system.isPure()).toBe(true);
      });
    });

    it('should work with QubitState pure checks', () => {
      const qubitStates = [
        QubitState.zero(),
        QubitState.one(),
        QubitState.plus(),
      ];
      
      qubitStates.forEach(state => {
        expect((state as Q5mSystem).isPure()).toBe(true);
      });
    });

    it('should handle edge cases', () => {
      const almostPure = new TestQ5mSystem(2, [
        complex(0.999999, 0), 
        complex(0.000001, 0)
      ]);
      
      expect(almostPure.isPure()).toBe(true);
    });
  });

  describe('Entropy Calculations', () => {
    it('should return 0 for pure states', () => {
      const pureSystems = [
        new TestQ5mSystem(2, [ONE, ZERO]),
        new TestQ5mSystem(4, [ONE, ZERO, ZERO, ZERO]),
        new TestQ5mSystem(8, [ONE, ZERO, ZERO, ZERO, ZERO, ZERO, ZERO, ZERO]),
      ];
      
      pureSystems.forEach(system => {
        expect(system.entropy()).toBe(0);
      });
    });

    it('should work with QubitState entropy', () => {
      const qubitStates = [
        QubitState.zero(),
        QubitState.one(),
        QubitState.plus(),
      ];
      
      qubitStates.forEach(state => {
        expect((state as Q5mSystem).entropy()).toBe(0);
      });
    });

    it('should handle superposition states correctly', () => {
      const superposition = new TestQ5mSystem(2, [
        complex(1/Math.sqrt(2), 0), 
        complex(1/Math.sqrt(2), 0)
      ]);
      
      // For pure superposition, entropy should still be 0
      expect(superposition.entropy()).toBeCloseTo(0, 10);
    });
  });

  describe('Fidelity Calculations', () => {
    it('should return 1 for identical states', () => {
      const system1 = new TestQ5mSystem(2, [ONE, ZERO]);
      const system2 = new TestQ5mSystem(2, [ONE, ZERO]);
      
      expect(system1.fidelity(system2)).toBeCloseTo(1, 10);
      expect(system2.fidelity(system1)).toBeCloseTo(1, 10);
    });

    it('should return 0 for orthogonal states', () => {
      const zero = new TestQ5mSystem(2, [ONE, ZERO]);
      const one = new TestQ5mSystem(2, [ZERO, ONE]);
      
      expect(zero.fidelity(one)).toBeCloseTo(0, 10);
      expect(one.fidelity(zero)).toBeCloseTo(0, 10);
    });

    it('should handle superposition fidelities', () => {
      const zero = new TestQ5mSystem(2, [ONE, ZERO]);
      const plus = new TestQ5mSystem(2, [
        complex(1/Math.sqrt(2), 0), 
        complex(1/Math.sqrt(2), 0)
      ]);
      
      const fidelity = zero.fidelity(plus);
      expect(fidelity).toBeCloseTo(0.5, 10);
    });

    it('should be symmetric', () => {
      const sys1 = new TestQ5mSystem(2, [complex(0.6, 0), complex(0, 0.8)]);
      const sys2 = new TestQ5mSystem(2, [complex(0.8, 0), complex(0, 0.6)]);
      
      const fid12 = sys1.fidelity(sys2);
      const fid21 = sys2.fidelity(sys1);
      
      expect(fid12).toBeCloseTo(fid21, 10);
    });

    it('should work with QubitState fidelities', () => {
      const zero: Q5mSystem = QubitState.zero();
      const one: Q5mSystem = QubitState.one();
      const plus: Q5mSystem = QubitState.plus();
      
      expect(zero.fidelity(one)).toBeCloseTo(0, 10);
      expect(zero.fidelity(plus)).toBeCloseTo(0.5, 10);
      expect(zero.fidelity(zero)).toBeCloseTo(1, 10);
    });

    it('should throw error for dimension mismatch', () => {
      const sys2 = new TestQ5mSystem(2);
      const sys4 = new TestQ5mSystem(4);
      
      expect(() => sys2.fidelity(sys4)).toThrow('same dimension');
      expect(() => sys4.fidelity(sys2)).toThrow('same dimension');
    });

    it('should handle complex overlaps correctly', () => {
      const sys1 = new TestQ5mSystem(2, [complex(1, 0), complex(0, 1)]);
      const sys2 = new TestQ5mSystem(2, [complex(0, 1), complex(1, 0)]);
      
      const fidelity = sys1.fidelity(sys2);
      expect(fidelity).toBeCloseTo(0, 10);
    });
  });

  describe('Interface Compliance', () => {
    it('should implement all required methods', () => {
      const system: Q5mSystem = new TestQ5mSystem(2);
      
      expect(typeof system.dimension).toBe('function');
      expect(typeof system.clone).toBe('function');
      expect(typeof system.tensor).toBe('function');
      expect(typeof system.toString).toBe('function');
      expect(typeof system.purity).toBe('function');
      expect(typeof system.isPure).toBe('function');
      expect(typeof system.entropy).toBe('function');
      expect(typeof system.fidelity).toBe('function');
    });

    it('should work with QubitState as Q5mSystem', () => {
      const qubitState: Q5mSystem = new QubitState(2);
      
      expect(typeof qubitState.dimension).toBe('function');
      expect(typeof qubitState.clone).toBe('function');
      expect(typeof qubitState.tensor).toBe('function');
      expect(typeof qubitState.toString).toBe('function');
    });

    it('should handle polymorphic usage', () => {
      const systems: Q5mSystem[] = [
        new TestQ5mSystem(2),
        new QubitState(1),
        new QubitState(2),
      ];
      
      systems.forEach(system => {
        expect(system.dimension()).toBeGreaterThan(0);
        expect(system.purity()).toBeGreaterThan(0);
        expect(system.isPure()).toBeDefined();
        expect(system.entropy()).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very small amplitudes', () => {
      const system = new TestQ5mSystem(2, [
        complex(1 - 1e-15, 0), 
        complex(1e-15, 0)
      ]);
      
      expect(() => system.toString()).not.toThrow();
      expect(() => system.purity()).not.toThrow();
      expect(() => system.entropy()).not.toThrow();
    });

    it('should handle zero amplitudes', () => {
      const system = new TestQ5mSystem(2, [ZERO, ZERO]);
      
      expect(system.toString()).toBe('0');
      expect(() => system.purity()).not.toThrow();
    });

    it('should handle large dimensions efficiently', () => {
      const largeDim = 64;
      const system = new TestQ5mSystem(largeDim);
      
      expect(system.dimension()).toBe(largeDim);
      expect(() => system.toString()).not.toThrow();
    });

    it('should handle precision edge cases', () => {
      const system = new TestQ5mSystem(2);
      
      expect(() => system.toString(0)).not.toThrow();
      expect(() => system.toString(10)).not.toThrow();
      expect(() => system.toString(100)).not.toThrow();  // Max precision for toFixed
    });

    it('should handle threshold edge cases', () => {
      const system = new TestQ5mSystem(2);
      
      expect(() => system.toString(3, 0)).not.toThrow();
      expect(() => system.toString(3, 1)).not.toThrow();
      expect(() => system.toString(3, -1)).not.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    it('should handle moderate system sizes efficiently', () => {
      const startTime = performance.now();
      
      const system = new TestQ5mSystem(32);
      system.clone();
      system.toString();
      system.purity();
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle repeated operations efficiently', () => {
      const system = new TestQ5mSystem(4);
      
      for (let i = 0; i < 100; i++) {
        const clone = system.clone();
        clone.purity();
        clone.toString();
      }
      
      expect(system.dimension()).toBe(4);
    });
  });
});