// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { Circuit, hasCReg } from '@/core/Circuit';
import { QubitState } from '@/core/QubitState';
import { complex } from '@/math/complex';
import { isUnitary } from '@/math/math-utils';

describe('Circuit', () => {
  describe('Construction', () => {
    it('should create circuit with specified number of qubits', () => {
      const circuit = new Circuit(3);
      expect(circuit.numQubits).toBe(3);
    });

    it('should throw error for invalid qubit count', () => {
      expect(() => new Circuit(0)).toThrow();
      expect(() => new Circuit(-1)).toThrow();
    });
  });

  describe('Single Qubit Gates', () => {
    it('should apply Hadamard gate', () => {
      const circuit = new Circuit(1);
      circuit.h(0);
      
      const result = circuit.execute();
      const amplitudes = result.state.amplitudes();
      
      expect(amplitudes).toHaveLength(2);
      expect(amplitudes[0].re).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[1].re).toBeCloseTo(1/Math.sqrt(2), 10);
    });

    it('should apply Pauli-X gate', () => {
      const circuit = new Circuit(1);
      circuit.x(0);
      
      const result = circuit.execute();
      const amplitudes = result.state.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(0, 10);
      expect(amplitudes[1].re).toBeCloseTo(1, 10);
    });

    it('should apply Pauli-Y gate', () => {
      const circuit = new Circuit(1);
      circuit.y(0);
      
      const result = circuit.execute();
      const amplitudes = result.state.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(0, 10);
      expect(amplitudes[1].im).toBeCloseTo(1, 10);
    });

    it('should apply Pauli-Z gate', () => {
      const circuit = new Circuit(1);
      circuit.x(0).z(0);
      
      const result = circuit.execute();
      const amplitudes = result.state.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(0, 10);
      expect(amplitudes[1].re).toBeCloseTo(-1, 10);
    });

    it('should apply S gate', () => {
      const circuit = new Circuit(1);
      circuit.x(0).s(0);
      
      const result = circuit.execute();
      const amplitudes = result.state.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(0, 10);
      expect(amplitudes[1].im).toBeCloseTo(1, 10);
    });

    it('should apply T gate', () => {
      const circuit = new Circuit(1);
      circuit.x(0).t(0);
      
      const result = circuit.execute();
      const amplitudes = result.state.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(0, 10);
      expect(amplitudes[1].re).toBeCloseTo(1/Math.sqrt(2), 5);
      expect(amplitudes[1].im).toBeCloseTo(1/Math.sqrt(2), 5);
    });
  });

  describe('Two Qubit Gates', () => {
    it('should apply CNOT gate', () => {
      const circuit = new Circuit(2);
      circuit.x(0).cnot(0, 1);
      
      const result = circuit.execute();
      const amplitudes = result.state.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(0, 10); // |00⟩
      expect(amplitudes[1].re).toBeCloseTo(0, 10); // |01⟩
      expect(amplitudes[2].re).toBeCloseTo(0, 10); // |10⟩
      expect(amplitudes[3].re).toBeCloseTo(1, 10); // |11⟩
    });

    it('should create Bell state', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      const result = circuit.execute();
      const amplitudes = result.state.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(1/Math.sqrt(2), 10); // |00⟩
      expect(amplitudes[1].re).toBeCloseTo(0, 10); // |01⟩
      expect(amplitudes[2].re).toBeCloseTo(0, 10); // |10⟩
      expect(amplitudes[3].re).toBeCloseTo(1/Math.sqrt(2), 10); // |11⟩
    });

    it('should apply controlled-Z gate', () => {
      const circuit = new Circuit(2);
      circuit.x(0).x(1).cz(0, 1);
      
      const result = circuit.execute();
      const amplitudes = result.state.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(0, 10); // |00⟩
      expect(amplitudes[1].re).toBeCloseTo(0, 10); // |01⟩
      expect(amplitudes[2].re).toBeCloseTo(0, 10); // |10⟩
      expect(amplitudes[3].re).toBeCloseTo(-1, 10); // |11⟩
    });

    it('should apply SWAP gate', () => {
      const circuit = new Circuit(2);
      circuit.x(0).swap(0, 1);
      
      const result = circuit.execute();
      const amplitudes = result.state.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(0, 10); // |00⟩
      expect(amplitudes[1].re).toBeCloseTo(1, 10); // |01⟩
      expect(amplitudes[2].re).toBeCloseTo(0, 10); // |10⟩
      expect(amplitudes[3].re).toBeCloseTo(0, 10); // |11⟩
    });
  });

  describe('Parametric Gates', () => {
    it('should apply rotation X gate', () => {
      const circuit = new Circuit(1);
      circuit.rx(0, Math.PI);
      
      const result = circuit.execute();
      const amplitudes = result.state.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(0, 10);
      expect(amplitudes[1].im).toBeCloseTo(-1, 5);
    });

    it('should apply rotation Y gate', () => {
      const circuit = new Circuit(1);
      circuit.ry(0, Math.PI/2);
      
      const result = circuit.execute();
      const amplitudes = result.state.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(1/Math.sqrt(2), 10);
      expect(amplitudes[1].re).toBeCloseTo(1/Math.sqrt(2), 10);
    });

    it('should apply rotation Z gate', () => {
      const circuit = new Circuit(1);
      circuit.x(0).rz(0, Math.PI/2);
      
      const result = circuit.execute();
      const amplitudes = result.state.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(0, 10);
      expect(amplitudes[1].re).toBeCloseTo(1/Math.sqrt(2), 5);
      expect(amplitudes[1].im).toBeCloseTo(1/Math.sqrt(2), 5);
    });

    it('should apply phase gate with parameter', () => {
      const circuit = new Circuit(1);
      circuit.x(0).appendGate('ph', 0, { params: { phi: Math.PI/2 } });
      
      const result = circuit.execute();
      const amplitudes = result.state.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(0, 10);
      expect(amplitudes[1].im).toBeCloseTo(1, 10);
    });
  });

  describe('Circuit Chaining', () => {
    it('should support method chaining', () => {
      const circuit = new Circuit(2);
      const result = circuit
        .h(0)
        .cnot(0, 1)
        .x(0)
        .y(1);
      
      expect(result).toBe(circuit);
      expect(circuit.instructionsList()).toHaveLength(4);
    });

    it('should execute gates in order', () => {
      const circuit = new Circuit(1);
      circuit.x(0).x(0); // Should cancel out
      
      const result = circuit.execute();
      const amplitudes = result.state.amplitudes();
      
      expect(amplitudes[0].re).toBeCloseTo(1, 10);
      expect(amplitudes[1].re).toBeCloseTo(0, 10);
    });
  });

  describe('Measurement', () => {
    it('should add measurement gate with default Z-basis', () => {
      const circuit = new Circuit(1);
      circuit.h(0).measure(0);
      
      const instructions = circuit.instructionsList();
      expect(instructions).toHaveLength(2);
      expect(instructions[1].gate.name).toBe('Mz');
    });

    it('should measure in Z-basis explicitly', () => {
      const circuit = new Circuit(1);
      circuit.h(0).measure(0, 'z');
      
      const instructions = circuit.instructionsList();
      expect(instructions[1].gate.name).toBe('Mz');
    });

    it('should measure in X-basis', () => {
      const circuit = new Circuit(1);
      circuit.h(0).measure(0, 'x');
      
      const instructions = circuit.instructionsList();
      expect(instructions[1].gate.name).toBe('Mx');
    });

    it('should measure in Y-basis', () => {
      const circuit = new Circuit(1);
      circuit.h(0).measure(0, 'y');
      
      const instructions = circuit.instructionsList();
      expect(instructions[1].gate.name).toBe('My');
    });

    it('should measure in phase basis with parameters', () => {
      const circuit = new Circuit(1);
      circuit.h(0).measure(0, 'phase', Math.PI/4, Math.PI/2, 'custom-phase');
      
      const instructions = circuit.instructionsList();
      expect(instructions[1].gate.name).toBe('custom-phase');
    });

    it('should measure in phase basis without custom name', () => {
      const circuit = new Circuit(1);
      circuit.h(0).measure(0, 'phase', Math.PI/4, Math.PI/2);
      
      const instructions = circuit.instructionsList();
      expect(instructions[1].gate.name).toContain('Mp');
      expect(instructions[1].gate.name).toContain('θ=0.785');
      expect(instructions[1].gate.name).toContain('φ=1.571');
    });

    it('should throw error for phase measurement without parameters', () => {
      const circuit = new Circuit(1);
      
      // TypeScript should catch this, but test the runtime error
      expect(() => {
        (circuit.measure as any)(0, 'phase');
      }).toThrow('Phase measurement requires theta and phi parameters');
    });

    it('should be equivalent to direct measurement methods', () => {
      const circuit1 = new Circuit(1);
      const circuit2 = new Circuit(1);
      const circuit3 = new Circuit(1);
      const circuit4 = new Circuit(1);

      // Test equivalence
      circuit1.mx(0);
      circuit2.measure(0, 'x');
      
      circuit3.my(0);  
      circuit4.measure(0, 'y');

      const instructions1 = circuit1.instructionsList();
      const instructions2 = circuit2.instructionsList();
      const instructions3 = circuit3.instructionsList();
      const instructions4 = circuit4.instructionsList();

      expect(instructions1[0].gate.name).toBe(instructions2[0].gate.name);
      expect(instructions3[0].gate.name).toBe(instructions4[0].gate.name);
    });
  });

  describe('Error Handling', () => {
    it('should handle negative qubit indices', () => {
      const circuit = new Circuit(2);
      
      // Negative qubit index should throw immediately
      expect(() => circuit.h(-1)).toThrow('Invalid qubit index: -1');
    });

    it('should throw error for same control and target qubits', () => {
      const circuit = new Circuit(2);
      
      expect(() => circuit.cnot(0, 0)).toThrow();
    });

    it('should throw error for parametric gates without parameters', () => {
      const circuit = new Circuit(1);
      
      expect(() => circuit.appendGate('rx', 0)).toThrow('theta parameter is required');
      expect(() => circuit.appendGate('ph', 0)).toThrow('phi parameter is required');
    });
  });

  describe('Circuit Properties', () => {
    it('should report correct number of instructions', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1).x(1);
      
      expect(circuit.instructionsList()).toHaveLength(3);
    });

    it('should clone circuit correctly', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      const cloned = circuit.clone();
      expect(cloned.numQubits).toBe(2);
      expect(cloned.instructionsList()).toHaveLength(2);
      expect(cloned).not.toBe(circuit);
    });
  });

  // Merged from Circuit test files
  describe('Advanced Gate Tests', () => {
    it('should handle HH gate properly', () => {
      const circuit = new Circuit(3);
      
      // Test valid HH gate
      expect(() => {
        circuit.hh([0, 1, 2]);
      }).not.toThrow();
    });
    
    it('should execute HH gate and produce results', () => {
      const circuit = new Circuit(3);
      circuit.hh([0, 1, 2]);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.state.amplitudes()).toHaveLength(8);
    });
    
    it('should handle controlled unitary gates', () => {
      const circuit = new Circuit(2);
      // CU gate requires name, alpha, and beta parameters
      const alpha = complex(1, 0);
      const beta = complex(0, 0);
      circuit.cu(0, 1, 'test-cu', alpha, beta);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });
    
    it('should create Bell states with probability verification', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      const result = circuit.execute();
      const probs = result.state.probabilities();
      
      expect(probs[0]).toBeCloseTo(0.5, 5);
      expect(probs[3]).toBeCloseTo(0.5, 5);
    });
  });

  // Additional test scenarios
  describe('Additional Gate Tests', () => {
    it('should handle HH gate with invalid positions properly', () => {
      const circuit = new Circuit(3);
      
      // The actual error comes from MultiHadamardGate validation
      expect(() => {
        circuit.addGate('hh', [], {
          numQuantum: 3,
          params: { positions: null as any }
        });
      }).toThrow();
    });

    it('should handle edge cases in gate parameter validation', () => {
      const circuit = new Circuit(2);
      
      // Test various parameter combinations
      circuit.rx(0, Math.PI/2);
      circuit.ry(1, Math.PI/4);
      circuit.rz(0, Math.PI/3);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle measurement gates properly', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      // Add measurement
      circuit.measure(0);
      circuit.measure(1);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle gate chaining extensively', () => {
      const circuit = new Circuit(3);
      
      // Test comprehensive gate chaining
      circuit
        .h(0)
        .x(1)
        .y(2)
        .z(0)
        .s(1)
        .t(2)
        .cnot(0, 1)
        .cz(1, 2)
        .cy(0, 2)
        .ch(1, 0)
        .swap(0, 2);
      
      const result = circuit.execute();
      expect(result.state.probabilities()).toHaveLength(8);
    });

    it('should handle phase gates with various angles', () => {
      const circuit = new Circuit(2);
      
      circuit.phase(0, Math.PI/6);
      circuit.phase(1, Math.PI/3);
      circuit.cp(0, 1, Math.PI/4);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle complex gate parameter combinations', () => {
      const circuit = new Circuit(3);
      
      // Test with different parameter types
      circuit.rx(0, 0);          // Zero rotation
      circuit.ry(1, Math.PI);    // Pi rotation
      circuit.rz(2, -Math.PI/2); // Negative rotation
      
      const result = circuit.execute();
      expect(result.state.quantumCount()).toBe(3);
    });

    it('should validate qubit indices in gate operations', () => {
      const circuit = new Circuit(2);
      
      // These should work (valid indices)
      circuit.h(0);
      circuit.h(1);
      circuit.cnot(0, 1);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle initial state properly', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      // Execute with custom initial state
      const initialState = new QubitState(2);
      const result = circuit.execute(initialState);
      
      expect(result).toBeDefined();
      expect(result.state.quantumCount()).toBe(2);
    });

    it('should handle instruction management', () => {
      const circuit = new Circuit(2);
      
      // Add various instructions
      circuit.h(0);
      circuit.cnot(0, 1);
      circuit.measure(0);
      
      const instructions = circuit.instructionsList();
      expect(instructions).toHaveLength(3);
      
      // Verify instruction structure
      expect(instructions[0].gate).toBeDefined();
      expect(instructions[0].targets).toEqual([0]);
    });

    it('should handle addGate method with string names', () => {
      const circuit = new Circuit(2);
      
      // Test addGate method directly (column parameter is ignored)
      circuit.addGate('h', 0, [0]);
      circuit.addGate('x', 1, [1]);
      circuit.addGate('cnot', 2, [0, 1]);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle alternative gate names', () => {
      const circuit = new Circuit(2);
      
      // Test alternative gate names
      circuit.appendGate('hadamard', 0);
      circuit.appendGate('pauli-x', 0);
      circuit.appendGate('not', 0);
      circuit.appendGate('pauli-y', 0);
      circuit.appendGate('pauli-z', 0);
      circuit.appendGate('identity', 0);
      
      // Test 'p' gate with theta parameter
      circuit.appendGate('p', 0, { params: { theta: Math.PI/4 } });
      
      // Test 'cx' gate
      circuit.appendGate('cx', [0, 1]);
      
      // Test 'measure' gate
      circuit.appendGate('measure', 0);
      
      // Test 'my' gate directly
      circuit.appendGate('my', 1);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle EE gate with various parameters', () => {
      const circuit = new Circuit(3);
      
      // Test EE gate with default parameters
      // EE gate is a global phase gate, so pass array of qubits
      circuit.appendGate('ee', [0, 1], { 
        numQuantum: 2,
        params: { phase: 0 } 
      });
      
      // Test EE gate with phase parameter
      circuit.appendGate('ee', [0, 1, 2], { 
        numQuantum: 3,
        params: { phase: Math.PI/3 } 
      });
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle ee() method for global phase gate', () => {
      const circuit = new Circuit(2);
      
      // Test ee() method with phase parameter
      circuit.h(0).ee(Math.PI / 4).cnot(0, 1);
      
      expect(circuit.instructions.length).toBe(3);
      expect(circuit.instructions[1]!.gate.name).toBe('E');
      expect(circuit.instructions[1]!.targets).toEqual([0, 1]);
      
      const result = circuit.execute();
      expect(result.success).toBe(true);
      expect(result.state).toBeDefined();
    });

    it('should handle EE gate factory with undefined phase parameter', () => {
      const circuit = new Circuit(2);
      
      // Test EE gate with undefined phase parameter (should default to 0)
      circuit.appendGate('ee', [0, 1], { 
        numQuantum: 2,
        params: {} // No phase parameter
      });
      
      expect(circuit.instructions.length).toBe(1);
      expect(circuit.instructions[0]!.gate.name).toBe('E');
      
      const result = circuit.execute();
      expect(result.success).toBe(true);
    });

    it('should handle EE gate factory with undefined numQuantum parameter', () => {
      const circuit = new Circuit(1);
      
      // Test EE gate with undefined numQuantum parameter (should default to 1)
      circuit.appendGate('ee', [0], { 
        params: { phase: Math.PI / 2 } // No numQuantum parameter
      });
      
      expect(circuit.instructions.length).toBe(1);
      expect(circuit.instructions[0]!.gate.name).toBe('E');
      
      const result = circuit.execute();
      expect(result.success).toBe(true);
    });

    it('should handle HH gate parameter validation', () => {
      const circuit = new Circuit(3);
      
      // Test HH gate with invalid positions
      expect(() => {
        circuit.appendGate('hh', [0, 1, 2], {
          numQuantum: 3,
          params: { positions: 'invalid' as any }
        });
      }).toThrow('HH gate requires positions parameter as array');
      
      expect(() => {
        circuit.appendGate('hh', [0, 1, 2], {
          numQuantum: 3,
          params: { positions: ['not_number'] as any }
        });
      }).toThrow('HH gate requires positions parameter as array');
    });

    it('should handle CU gate parameter validation', () => {
      const circuit = new Circuit(2);
      
      // Test CU gate without alpha parameter
      expect(() => {
        circuit.appendGate('cu', [0, 1], {
          params: { beta: complex(0, 1) }
        });
      }).toThrow('CU gate requires alpha and beta parameters');
      
      // Test CU gate without beta parameter
      expect(() => {
        circuit.appendGate('cu', [0, 1], {
          params: { alpha: complex(1, 0) }
        });
      }).toThrow('CU gate requires alpha and beta parameters');
    });

    it('should handle alternative measurement gate names', () => {
      const circuit = new Circuit(2);
      
      // Test alternative measurement gate names
      circuit.appendGate('measure-z', 0);
      circuit.appendGate('measure-x', 1);
      circuit.appendGate('measure-y', 0);
      circuit.appendGate('measure-phase', 1);
      
      // Test mp gate with parameters
      circuit.appendGate('mp', 0, {
        params: { 
          theta: Math.PI/4, 
          phi: Math.PI/6,
          name: 'custom-phase'
        }
      });
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle cx method directly', () => {
      const circuit = new Circuit(2);
      
      // Test cx method
      circuit.cx(0, 1);
      
      const instructions = circuit.instructionsList();
      expect(instructions).toHaveLength(1);
      expect(instructions[0].gate.name).toBe('CNOT'); // CX and CNOT are aliases
      expect(instructions[0].targets).toEqual([0, 1]);
    });

    it('should handle direct measurement methods', () => {
      const circuit = new Circuit(2);
      
      // Test direct measurement methods
      circuit.mz(0);
      circuit.mx(1);
      circuit.my(0);
      circuit.mp(1, Math.PI/4, Math.PI/6, 'test-phase');
      
      const instructions = circuit.instructionsList();
      expect(instructions).toHaveLength(4);
      expect(instructions[0].gate.name).toBe('Mz');
      expect(instructions[1].gate.name).toBe('Mx');
      expect(instructions[2].gate.name).toBe('My');
      expect(instructions[3].gate.name).toBe('test-phase'); // Mp uses custom name if provided
    });

    it('should handle appendGate error cases', () => {
      const circuit = new Circuit(2);
      
      // Test unsupported gate error
      expect(() => {
        circuit.appendGate('unsupported-gate', 0);
      }).toThrow('Unsupported gate: unsupported-gate');
      
      // Test measurement gate with multiple qubits error
      expect(() => {
        circuit.appendGate('mz', [0, 1]);
      }).toThrow('Measurement gate mz can only be applied to a single qubit, got 2 qubits');
      
      // Test gate size mismatch error
      // This would require a gate with specific size, let's use a single qubit gate with two targets
      expect(() => {
        circuit.appendGate('h', [0, 1]);
      }).toThrow('Gate h expects 1 qubits but got 2');
    });

    it('should handle circuit expansion on large qubit indices', () => {
      const circuit = new Circuit(2);
      
      // Test circuit expansion when qubit index exceeds current size
      expect(circuit.numQubits).toBe(2);
      
      // Apply gate to qubit 5, should expand circuit
      circuit.h(5);
      
      expect(circuit.numQubits).toBe(6); // Should expand to accommodate qubit 5
    });

    it('should calculate memory usage correctly', () => {
      // Test memory usage for small circuits
      const smallCircuit = new Circuit(5);
      const smallMemory = smallCircuit.memoryUsage();
      expect(smallMemory).toBe(Math.pow(2, 5) * 16); // 32 * 16 = 512 bytes
      
      // Test memory usage for large circuits
      const largeCircuit = new Circuit(15);
      const largeMemory = largeCircuit.memoryUsage();
      expect(largeMemory).toBe(Math.min(100, 15 * 8)); // min(100, 120) = 100
      
      // Test edge case at 12 qubits
      const edgeCircuit = new Circuit(12);
      const edgeMemory = edgeCircuit.memoryUsage();
      expect(edgeMemory).toBe(Math.min(100, 12 * 8)); // min(100, 96) = 96
    });

    it('should handle hasCReg type guard function', () => {
      const circuit = new Circuit(2);
      
      // Test hasCReg function
      expect(hasCReg(circuit)).toBe(false); // Normal circuit doesn't have cregs
      
      // Create circuit with cregs property
      const circuitWithCReg = circuit as any;
      circuitWithCReg.cregs = new Map();
      expect(hasCReg(circuitWithCReg)).toBe(true);
      
      // Test with non-Map cregs
      circuitWithCReg.cregs = {};
      expect(hasCReg(circuitWithCReg)).toBe(false);
    });

    it('should handle getGateFactory method calls', () => {
      const circuit = new Circuit(2);
      
      // Test getGateFactory method indirectly by using mixed case gate names
      // This should test the toLowerCase() call in getGateFactory
      circuit.appendGate('H', 0);  // Uppercase
      circuit.appendGate('PAULI-X', 1);  // All uppercase
      circuit.appendGate('CnOt', [0, 1]);  // Mixed case
      
      const instructions = circuit.instructionsList();
      expect(instructions).toHaveLength(3);
      expect(instructions[0].gate.name).toBe('H');
      expect(instructions[1].gate.name).toBe('X');
      expect(instructions[2].gate.name).toBe('CNOT');
    });

    it('should handle specialized gate methods', () => {
      const circuit = new Circuit(2);
      
      // Test identity gate
      circuit.i(0);
      
      // Test advanced measurement bases
      circuit.mx(0);
      circuit.my(1);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle multi-qubit gates with options', () => {
      const circuit = new Circuit(3);
      
      // Test HH gate (multi-Hadamard)
      circuit.hh([0, 1, 2]);
      
      const result = circuit.execute();
      expect(result.state.probabilities()).toHaveLength(8);
    });

    it('should handle error conditions in gate creation', () => {
      const circuit = new Circuit(2);
      
      // Test error handling in controlled unitary (should not throw if params are provided)
      const alpha = complex(1, 0);
      const beta = complex(0, 0);
      circuit.cu(0, 1, 'test-cu', alpha, beta);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
    });

    it('should handle SDG gate', () => {
      const circuit = new Circuit(1);
      circuit.sdg(0);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
      
      const instructions = circuit.instructionsList();
      expect(instructions[0].gate.name).toBe('Sdg');
    });

    it('should handle Identity gate', () => {
      const circuit = new Circuit(1);
      circuit.i(0);
      
      const result = circuit.execute();
      expect(result).toBeDefined();
      
      const instructions = circuit.instructionsList();
      expect(instructions[0].gate.name).toBe('I');
    });

    it('should throw error for invalid measurement basis', () => {
      const circuit = new Circuit(1);
      
      expect(() => {
        circuit.measure(0, 'invalid' as any);
      }).toThrow('Invalid measurement basis: invalid');
    });

    it('should handle MX gate via factory', () => {
      const circuit = new Circuit(1);
      circuit.appendGate('mx', 0);
      
      const instructions = circuit.instructionsList();
      expect(instructions[0].gate.name).toBe('Mx');
    });

    it('should handle measurement gates via appendGate', () => {
      const circuit = new Circuit(2);
      
      // Test all measurement gate variations
      circuit.appendGate('measure', 0);
      circuit.appendGate('mz', 1);
      circuit.appendGate('measure-z', 0);
      circuit.appendGate('mx', 1);
      circuit.appendGate('measure-x', 0);
      circuit.appendGate('my', 1);
      circuit.appendGate('measure-y', 0);
      
      const instructions = circuit.instructionsList();
      expect(instructions).toHaveLength(7);
      expect(instructions[0].gate.name).toBe('Mz');
      expect(instructions[1].gate.name).toBe('Mz');
      expect(instructions[2].gate.name).toBe('Mz');
      expect(instructions[3].gate.name).toBe('Mx');
      expect(instructions[4].gate.name).toBe('Mx');
      expect(instructions[5].gate.name).toBe('My');
      expect(instructions[6].gate.name).toBe('My');
    });

    it('should handle MP gate with parameters', () => {
      const circuit = new Circuit(1);
      circuit.appendGate('mp', 0, {
        params: {
          theta: Math.PI / 4,
          phi: Math.PI / 8,
          name: 'custom-phase-measure'
        }
      });
      
      const instructions = circuit.instructionsList();
      expect(instructions[0].gate.name).toBe('custom-phase-measure');
    });

    it('should handle CP gate parameters', () => {
      const circuit = new Circuit(2);
      circuit.appendGate('cp', [0, 1], {
        params: { theta: Math.PI / 3 }
      });
      
      const instructions = circuit.instructionsList();
      expect(instructions[0].gate.name).toBe('CP(1.047)');
    });

    it('should auto-expand qubits when needed', () => {
      const circuit = new Circuit(2);
      
      // Apply gate to qubit index 3, should auto-expand
      circuit.h(3);
      
      expect(circuit.numQubits).toBe(4);
      const result = circuit.execute();
      expect(result.state.quantumCount()).toBe(4);
    });
  });

  describe('Additional Functionality Tests', () => {
    it('should test tdg gate', () => {
      const circuit = new Circuit(1);
      circuit.tdg(0);
      
      const instructions = circuit.instructionsList();
      expect(instructions[0].gate.name).toBe('Tdg');
    });

    it('should test getGateFactory method', () => {
      const circuit = new Circuit(1);
      
      // Test that getGateFactory returns a function for known gates
      const hFactory = (circuit as any).getGateFactory('h');
      expect(typeof hFactory).toBe('function');
      
      // Test that getGateFactory returns undefined for unknown gates
      const unknownFactory = (circuit as any).getGateFactory('unknown_gate');
      expect(unknownFactory).toBeUndefined();
      
      // Also test through appendGate with unknown gate
      expect(() => {
        circuit.appendGate('unknown_gate', 0);
      }).toThrow();
    });

    it('should test fromJSON with various error cases', () => {
      // Invalid format
      expect(() => {
        Circuit.fromJSON({ format: 'invalid' } as any);
      }).toThrow('Invalid circuit format identifier');

      // Missing format
      expect(() => {
        Circuit.fromJSON(null as any);
      }).toThrow('Invalid circuit format identifier');

      // Invalid version
      expect(() => {
        Circuit.fromJSON({
          format: 'q5m-circuit',
          version: '99.0.0',
          numQubits: 2,
          gates: []
        });
      }).toThrow('Unsupported format version');

      // Invalid numQubits
      expect(() => {
        Circuit.fromJSON({
          format: 'q5m-circuit',
          version: '1.0.0',
          numQubits: 0,
          gates: []
        });
      }).toThrow('Invalid number of qubits');

      // Invalid gates array
      expect(() => {
        Circuit.fromJSON({
          format: 'q5m-circuit',
          version: '1.0.0',
          numQubits: 2,
          gates: 'not an array' as any
        });
      }).toThrow('Invalid gates array');
    });

    it('should test fromJSON with invalid gate data in strict mode', () => {
      expect(() => {
        Circuit.fromJSON({
          format: 'q5m-circuit',
          version: '1.0.0',
          numQubits: 2,
          gates: [{ invalidGate: true }]
        }, { strict: true });
      }).toThrow('Invalid gate data structure');
    });

    it('should test fromJSON with invalid gate data in non-strict mode', () => {
      const circuit = Circuit.fromJSON({
        format: 'q5m-circuit',
        version: '1.0.0',
        numQubits: 2,
        gates: [
          { invalidGate: true },
          { name: 'h', targets: [0] }
        ]
      }, { strict: false });
      
      expect(circuit.instructionsList()).toHaveLength(1);
      expect(circuit.instructionsList()[0].gate.name).toBe('H');
    });

    it('should test fromJSON with unknown gates when allowUnknownGates is true', () => {
      const circuit = Circuit.fromJSON({
        format: 'q5m-circuit',
        version: '1.0.0',
        numQubits: 2,
        gates: [
          { name: 'unknown_gate', targets: [0] },
          { name: 'h', targets: [1] }
        ]
      }, { allowUnknownGates: true });
      
      expect(circuit.instructionsList()).toHaveLength(1);
      expect(circuit.instructionsList()[0].gate.name).toBe('H');
    });

    it('should test fromJSON with unknown gates when allowUnknownGates is false', () => {
      expect(() => {
        Circuit.fromJSON({
          format: 'q5m-circuit',
          version: '1.0.0',
          numQubits: 2,
          gates: [
            { name: 'unknown_gate', targets: [0] }
          ]
        }, { allowUnknownGates: false });
      }).toThrow('Failed to reconstruct gate unknown_gate');
    });

    it('should test fromJSON with gate parameters', () => {
      const circuit = Circuit.fromJSON({
        format: 'q5m-circuit',
        version: '1.0.0',
        numQubits: 2,
        gates: [
          { 
            name: 'rx', 
            targets: [0], 
            parameters: { theta: Math.PI / 4 }
          }
        ]
      });
      
      expect(circuit.instructionsList()).toHaveLength(1);
      expect(circuit.instructionsList()[0].gate.name).toBe('RX(0.785)');
    });

    it('should test fromJSON without version validation', () => {
      const circuit = Circuit.fromJSON({
        format: 'q5m-circuit',
        version: '99.0.0',
        numQubits: 2,
        gates: []
      }, { validateVersion: false });
      
      expect(circuit.numQubits).toBe(2);
    });

    it('should test fromJSON with error in gate reconstruction in allowUnknownGates mode', () => {
      // This tests the error path when allowUnknownGates is false by default
      expect(() => {
        Circuit.fromJSON({
          format: 'q5m-circuit',
          version: '1.0.0',
          numQubits: 2,
          gates: [
            { name: 'rx', targets: [0] } // Missing required theta parameter
          ]
        });
      }).toThrow('Failed to reconstruct gate rx');
    });

    it('should test fromJSON with invalid numQubits types', () => {
      expect(() => {
        Circuit.fromJSON({
          format: 'q5m-circuit',
          version: '1.0.0',
          numQubits: -5,
          gates: []
        });
      }).toThrow('Invalid number of qubits');

      expect(() => {
        Circuit.fromJSON({
          format: 'q5m-circuit',
          version: '1.0.0',
          numQubits: 'invalid' as any,
          gates: []
        });
      }).toThrow('Invalid number of qubits');
    });
  });

  describe('Parameter validation edge cases', () => {
    it('should throw error when ph gate lacks phi parameter', () => {
      const circuit = new Circuit(1);
      expect(() => {
        circuit.appendGate('ph', 0);
      }).toThrow('phi parameter is required');
    });

    it('should throw error when ry gate lacks theta parameter', () => {
      const circuit = new Circuit(1);
      expect(() => {
        circuit.appendGate('ry', 0);
      }).toThrow('theta parameter is required');
    });

    it('should throw error when rz gate lacks theta parameter', () => {
      const circuit = new Circuit(1);
      expect(() => {
        circuit.appendGate('rz', 0);
      }).toThrow('theta parameter is required');
    });

    it('should handle cp gate with and without theta parameter', () => {
      const circuit1 = new Circuit(2);
      const circuit2 = new Circuit(2);
      
      // Should work with default theta=0
      circuit1.appendGate('cp', [0, 1]);
      
      // Should work with specified theta
      circuit2.appendGate('cp', [0, 1], { params: { theta: Math.PI/4 } });
      
      expect(() => circuit1.execute()).not.toThrow();
      expect(() => circuit2.execute()).not.toThrow();
    });

    it('should throw error when cu gate lacks alpha or beta parameters', () => {
      const circuit = new Circuit(2);
      
      expect(() => {
        circuit.appendGate('cu', [0, 1]);
      }).toThrow('CU gate requires alpha and beta parameters');
      
      expect(() => {
        circuit.appendGate('cu', [0, 1], { params: { alpha: complex(1, 0) } });
      }).toThrow('CU gate requires alpha and beta parameters');
      
      expect(() => {
        circuit.appendGate('cu', [0, 1], { params: { beta: complex(0, 1) } });
      }).toThrow('CU gate requires alpha and beta parameters');
    });

    it('should handle mp gate with various parameter combinations', () => {
      const circuit1 = new Circuit(1);
      const circuit2 = new Circuit(1);
      const circuit3 = new Circuit(1);
      
      // Default parameters
      circuit1.appendGate('mp', 0);
      
      // With theta only
      circuit2.appendGate('mp', 0, { params: { theta: Math.PI/4 } });
      
      // With both theta and phi
      circuit3.appendGate('mp', 0, { params: { theta: Math.PI/4, phi: Math.PI/2 } });
      
      expect(() => circuit1.execute()).not.toThrow();
      expect(() => circuit2.execute()).not.toThrow();
      expect(() => circuit3.execute()).not.toThrow();
    });

    it('should handle p gate with and without theta parameter', () => {
      const circuit1 = new Circuit(1);
      const circuit2 = new Circuit(1);
      
      // Should work with default (no theta parameter - should use S gate)
      circuit1.appendGate('p', 0);
      
      // Should work with specified theta (should use PH gate)
      circuit2.appendGate('p', 0, { params: { theta: Math.PI/4 } });
      
      expect(() => circuit1.execute()).not.toThrow();
      expect(() => circuit2.execute()).not.toThrow();
    });

    it('should handle cu gate with and without theta parameter', () => {
      const circuit1 = new Circuit(2);
      const circuit2 = new Circuit(2);
      
      // CU gate with alpha, beta and default theta=0
      circuit1.appendGate('cu', [0, 1], { 
        params: { 
          alpha: complex(1, 0), 
          beta: complex(0, 1) 
        } 
      });
      
      // CU gate with alpha, beta and specified theta
      circuit2.appendGate('cu', [0, 1], { 
        params: { 
          alpha: complex(1, 0), 
          beta: complex(0, 1),
          theta: Math.PI/4 
        } 
      });
      
      expect(() => circuit1.execute()).not.toThrow();
      expect(() => circuit2.execute()).not.toThrow();
    });

    it('should handle phase gate with and without phi parameter', () => {
      const circuit1 = new Circuit(1);
      const circuit2 = new Circuit(1);
      
      // Should work with default (no phi parameter - should use S gate)
      circuit1.appendGate('phase', 0);
      
      // Should work with specified phi (should use PH gate)
      circuit2.appendGate('phase', 0, { params: { phi: Math.PI/4 } });
      
      expect(() => circuit1.execute()).not.toThrow();
      expect(() => circuit2.execute()).not.toThrow();
    });
  });

  describe('fromJSON with allowUnknownGates option', () => {
    it('should handle allowUnknownGates option correctly', () => {
      // Create a mock circuit data with an unknown gate
      const mockCircuitData = {
        format: 'q5m-circuit',
        version: '1.0.0',
        numQubits: 1,
        gates: [
          { name: 'unknown_gate', targets: [0], parameters: {} }
        ]
      };
      
      // Should throw without allowUnknownGates
      expect(() => {
        Circuit.fromJSON(mockCircuitData as any);
      }).toThrow('Failed to reconstruct gate unknown_gate');
      
      // Should not throw with allowUnknownGates
      expect(() => {
        Circuit.fromJSON(mockCircuitData as any, { allowUnknownGates: true });
      }).not.toThrow();
    });

    it('should handle allowUnknownGates with multiple unknown gates', () => {
      // Create circuit data with gates that will test appendGate errors
      const mockCircuitData = {
        format: 'q5m-circuit',
        version: '1.0.0',
        numQubits: 2,
        gates: [
          { name: 'unknown_gate1', targets: [0], parameters: {} }, // Will cause "Unsupported gate" error
          { name: 'h', targets: [0], parameters: {} }, // Known gate - should work
          { name: 'x', targets: [-1], parameters: {} } // Will cause "Invalid qubit index" error
        ]
      };
      
      // With allowUnknownGates, should continue processing and create circuit with valid gates
      const circuit = Circuit.fromJSON(mockCircuitData as any, { allowUnknownGates: true });
      expect(circuit).toBeDefined();
      expect(circuit.numQubits).toBe(2);
      // Should have processed only the known gate with valid parameters (h)
      expect(circuit.instructions.length).toBe(1);
      
      // Verify that unknown and invalid gates were skipped
      const firstInstruction = circuit.instructions[0];
      expect(firstInstruction.gate.constructor.name).toBe('HadamardGate');
    });

    it('should skip errors when allowUnknownGates is enabled', () => {
      const mockCircuitData = {
        format: 'q5m-circuit',
        version: '1.0.0',
        numQubits: 3,
        gates: [
          { name: 'nonexistent_gate', targets: [0], parameters: {} }, // Unsupported gate error
          { name: 'ry', targets: [1], parameters: {} }, // Missing required parameter error  
          { name: 'h', targets: [2], parameters: {} } // Valid gate that should be processed
        ]
      };
      
      // Should continue past errors and process valid gates
      const circuit = Circuit.fromJSON(mockCircuitData as any, { allowUnknownGates: true });
      expect(circuit.instructions.length).toBe(1); // Only the valid H gate should be added
      expect(circuit.instructions[0].targets).toEqual([2]);
    });
  });

  describe('Error handling improvements', () => {
    it('should handle non-Error exceptions in fromJSON', () => {
      const mockCircuitData = {
        format: 'q5m-circuit',
        version: '1.0.0',
        numQubits: 2,
        gates: [
          { name: 'bad_gate', targets: [0], parameters: {} }
        ]
      };
      
      // Mock the appendGate method to throw a non-Error object
      const originalAppendGate = Circuit.prototype.appendGate;
      Circuit.prototype.appendGate = function() {
        throw 'String error'; // Throw a string instead of Error
      };
      
      try {
        expect(() => Circuit.fromJSON(mockCircuitData as any)).toThrow(
          'Failed to reconstruct gate bad_gate: String error'
        );
      } finally {
        // Restore original method
        Circuit.prototype.appendGate = originalAppendGate;
      }
    });
  });

  // Additional test sections moved to:
  // - Circuit.2.test.ts: Gate factories and serialization tests
  // - Circuit.3.test.ts: Unitary matrix computation tests
});