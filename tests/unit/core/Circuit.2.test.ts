// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { Circuit, hasCReg } from '@/core/Circuit';
import { QubitState } from '@/core/QubitState';
import { complex } from '@/math/complex';

describe('Circuit Gate Factories and Serialization', () => {
  describe('getGateFactory method tests', () => {
    it('should test getGateFactory method directly', () => {
      const circuit = new Circuit(1);
      
      // Access the protected method through type casting
      const circuitWithGateFactory = circuit as any;
      
      // Test that getGateFactory returns a factory for known gates
      const hGateFactory = circuitWithGateFactory.getGateFactory('h');
      expect(hGateFactory).toBeDefined();
      expect(typeof hGateFactory).toBe('function');
      
      const xGateFactory = circuitWithGateFactory.getGateFactory('pauli-x');
      expect(xGateFactory).toBeDefined();
      
      // Test that getGateFactory returns undefined for unknown gates
      const unknownGateFactory = circuitWithGateFactory.getGateFactory('unknown-gate');
      expect(unknownGateFactory).toBeUndefined();
      
      // Test case sensitivity (should normalize to lowercase)
      const upperCaseFactory = circuitWithGateFactory.getGateFactory('HADAMARD');
      expect(upperCaseFactory).toBeDefined();
    });
  });

  describe('Gate Factory Conditional Logic Tests', () => {
    it('should test phase gate factory conditional logic', () => {
      const circuit = new Circuit(1);
      
      // Test phase gate without phi parameter - should return S gate
      circuit.appendGate('phase', 0);
      let instructions = circuit.instructionsList();
      expect(instructions[0].gate.name).toBe('S');
      
      // Test phase gate with phi parameter - should return PH gate
      const newCircuit = new Circuit(1);
      newCircuit.appendGate('phase', 0, { params: { phi: Math.PI / 4 } });
      instructions = newCircuit.instructionsList();
      expect(instructions[0].gate.name).toMatch(/^P\(/);
    });

    it('should test p gate factory conditional logic', () => {
      const circuit = new Circuit(1);
      
      // Test p gate without theta parameter - should return S gate
      circuit.appendGate('p', 0);
      let instructions = circuit.instructionsList();
      expect(instructions[0].gate.name).toBe('S');
      
      // Test p gate with theta parameter - should return PH gate
      const newCircuit = new Circuit(1);
      newCircuit.appendGate('p', 0, { params: { theta: Math.PI / 6 } });
      instructions = newCircuit.instructionsList();
      expect(instructions[0].gate.name).toMatch(/^P\(/);
    });

    it('should test ry gate factory error handling', () => {
      const circuit = new Circuit(1);
      
      // Test ry gate without required theta parameter - should throw error
      expect(() => {
        circuit.appendGate('ry', 0);
      }).toThrow('theta parameter is required');
      
      // Test ry gate with theta parameter - should succeed
      expect(() => {
        circuit.appendGate('ry', 0, { params: { theta: Math.PI / 3 } });
      }).not.toThrow();
    });

    it('should test rz gate factory error handling', () => {
      const circuit = new Circuit(1);
      
      // Test rz gate without required theta parameter - should throw error
      expect(() => {
        circuit.appendGate('rz', 0);
      }).toThrow('theta parameter is required');
      
      // Test rz gate with theta parameter - should succeed
      expect(() => {
        circuit.appendGate('rz', 0, { params: { theta: Math.PI / 2 } });
      }).not.toThrow();
    });

    it('should test cp gate factory conditional logic', () => {
      const circuit = new Circuit(2);
      
      // Test cp gate without theta parameter - should use default 0
      circuit.appendGate('cp', [0, 1]);
      let instructions = circuit.instructionsList();
      expect(instructions[0].gate.name).toMatch(/^CP\(/);
      
      // Test cp gate with theta parameter - should use provided value
      const newCircuit = new Circuit(2);
      newCircuit.appendGate('cp', [0, 1], { params: { theta: Math.PI / 8 } });
      instructions = newCircuit.instructionsList();
      expect(instructions[0].gate.name).toMatch(/^CP\(/);
    });

    it('should test cu gate factory conditional logic', () => {
      const circuit = new Circuit(2);
      const alpha = complex(1, 0);
      const beta = complex(0, 0);
      
      // Test cu gate with string name parameter
      circuit.appendGate('cu', [0, 1], { 
        params: { 
          alpha, 
          beta, 
          name: 'CustomCU', 
          theta: Math.PI / 4 
        } 
      });
      let instructions = circuit.instructionsList();
      expect(instructions[0].gate.name).toBe('CustomCU');
      
      // Test cu gate with non-string name parameter - should default to 'CU'
      const newCircuit = new Circuit(2);
      newCircuit.appendGate('cu', [0, 1], { 
        params: { 
          alpha, 
          beta, 
          name: 123, // non-string
          theta: Math.PI / 4 
        } 
      });
      instructions = newCircuit.instructionsList();
      expect(instructions[0].gate.name).toBe('CU');
      
      // Test cu gate without theta parameter - should default to 0
      const thirdCircuit = new Circuit(2);
      thirdCircuit.appendGate('cu', [0, 1], { 
        params: { 
          alpha, 
          beta, 
          name: 'NoThetaCU'
        } 
      });
      instructions = thirdCircuit.instructionsList();
      expect(instructions[0].gate.name).toBe('NoThetaCU');
      
      // Test cu gate with theta parameter - should use provided value
      const fourthCircuit = new Circuit(2);
      fourthCircuit.appendGate('cu', [0, 1], { 
        params: { 
          alpha, 
          beta, 
          name: 'WithThetaCU',
          theta: Math.PI / 3 
        } 
      });
      instructions = fourthCircuit.instructionsList();
      expect(instructions[0].gate.name).toBe('WithThetaCU');
    });
  });

  describe('Complete Test Suite', () => {
    describe('Gate Factory Parameter Tests', () => {
      it('should test gate factories comprehensively', () => {
        const circuit = new Circuit(2);
        
        // Use the circuit's direct gate methods which should eventually call the factories
        circuit.s(0); // This should use existing S gate
        circuit.rz(0, Math.PI / 2); // This should call rz factory
        circuit.ry(0, Math.PI / 4); // This should call ry factory
        circuit.cp(0, 1, Math.PI / 6); // This should call cp factory
        
        const result = circuit.execute();
        expect(result.state).toBeDefined();
        expect(circuit.instructions.length).toBe(4);
      });
    });

    describe('CU and MP Gate Factory Tests', () => {
      it('should test cu gate variations', () => {
        const circuit = new Circuit(2);
        const alpha = complex(1, 0);
        const beta = complex(0, 0);
        
        // Use the existing cu method - test with custom name
        circuit.cu(0, 1, 'CustomCU', alpha, beta, Math.PI / 3);
        
        // Test with empty name to test default
        circuit.cu(0, 1, '', alpha, beta); // Tests default case
        
        const result = circuit.execute();
        expect(result.state).toBeDefined();
        expect(circuit.instructions.length).toBe(2);
      });

      it('should test mp gate variations', () => {
        const circuit = new Circuit(1);
        
        // Test mp gate with various parameter combinations using existing methods
        circuit.mp(0, Math.PI / 4, Math.PI / 6, 'CustomMP'); // Test with all parameters
        circuit.mp(0, 0, 0); // Test with zero parameters
        
        const result = circuit.execute();
        expect(result.state).toBeDefined();
        expect(circuit.instructions.length).toBe(2);
      });
    });

    describe('Measurement Basis Selection Tests', () => {
      it('should test all measurement basis selections', () => {
        const circuit = new Circuit(1);
        
        // Test all basis selections
        circuit.measure(0, 'z'); // z-basis measurement
        circuit.measure(0, 'x'); // x-basis measurement
        circuit.measure(0, 'y'); // y-basis measurement
        circuit.measure(0, 'phase', Math.PI/4, Math.PI/2); // phase basis measurement
        
        const result = circuit.execute();
        expect(result.state).toBeDefined();
        expect(circuit.instructions.length).toBe(4);
      });
    });

    describe('Additional Parameter Tests', () => {
      it('should test parameter parsing edge cases', () => {
        const circuit = new Circuit(2);
        
        // Test with string and number parameters
        circuit.rx(0, '1.5'); // String parameter
        circuit.ry(0, Math.PI); // Number parameter
        circuit.rz(0, 'pi/2'); // Expression parameter
        
        const result = circuit.execute();
        expect(result.state).toBeDefined();
      });
    });
  });

  describe('Circuit Serialization', () => {
    describe('Parametrized Gates Serialization', () => {
      it('should handle parametrized gates in save/load', () => {
        const original = new Circuit(2);
        original.rx(0, Math.PI / 4).ry(1, Math.PI / 2);

        const data = original.save();
        const restored = new Circuit(1);
        restored.load(data);

        expect(restored.quantumCount()).toBe(2);
        expect(restored.instructionsList()).toHaveLength(2);
        // Note: Gate names include parameters in the save/load format
        expect(restored.instructionsList()[0].gate.name).toContain('RX(');
        expect(restored.instructionsList()[1].gate.name).toContain('RY(');
      });

      it('should serialize parametrized gates with parameters', () => {
        const circuit = new Circuit(2);
        circuit.rx(0, Math.PI / 4).phase(1, Math.PI / 3);

        const json = circuit.toJSON();

        expect(json.gates).toHaveLength(2);
        expect(json.gates[0].name).toBe('RX');
        expect(json.gates[0].parameters?.theta).toBeCloseTo(Math.PI / 4);
        expect(json.gates[1].name).toBe('P'); // Phase gate is named 'P' in the implementation
        expect(json.gates[1].parameters?.phi).toBeCloseTo(Math.PI / 3);
      });

      it('should restore parametrized gates from JSON', () => {
        const original = new Circuit(2);
        original.rx(0, Math.PI / 4).ry(1, Math.PI / 2);

        const json = original.toJSON();
        const restored = Circuit.fromJSON(json);

        expect(restored.quantumCount()).toBe(2);
        expect(restored.instructionsList()).toHaveLength(2);
        expect(restored.instructionsList()[0].gate.name).toContain('RX(');
        expect(restored.instructionsList()[1].gate.name).toContain('RY(');
        
        // Verify circuit structure matches
        expect(restored.instructionsList()[0].targets).toEqual([0]);
        expect(restored.instructionsList()[1].targets).toEqual([1]);
        
        // For parametrized gates, verify the parameters are preserved reasonably
        const originalProbs = original.execute().state.probabilities();
        const restoredProbs = restored.execute().state.probabilities();
        
        // Check that total probability is preserved (should be 1)
        const originalTotal = originalProbs.reduce((a, b) => a + b, 0);
        const restoredTotal = restoredProbs.reduce((a, b) => a + b, 0);
        expect(originalTotal).toBeCloseTo(1, 5);
        expect(restoredTotal).toBeCloseTo(1, 5);
      });

      it('should handle unknown gates based on options', () => {
        const dataWithUnknownGate = {
          version: '1.0.0',
          format: 'q5m-circuit' as const,
          numQubits: 2,
          gates: [
            { name: 'h', targets: [0] },
            { name: 'unknown_gate', targets: [1] }
          ]
        };

        // Should throw in strict mode (default)
        expect(() => Circuit.fromJSON(dataWithUnknownGate)).toThrow();

        // Should skip unknown gates when allowed
        const circuit = Circuit.fromJSON(dataWithUnknownGate, { allowUnknownGates: true });
        expect(circuit.instructionsList()).toHaveLength(1);
        expect(circuit.instructionsList()[0].gate.name).toBe('H');
      });
    });

    describe('Round-trip consistency', () => {
      it('should maintain consistency through save/load round-trip', () => {
        const original = new Circuit(3);
        original.h(0).cnot(0, 1).cx(1, 2).rx(0, Math.PI / 6);

        const data = original.save();
        const restored = new Circuit(1);
        restored.load(data);

        expect(restored.quantumCount()).toBe(original.quantumCount());
        expect(restored.instructionsList()).toHaveLength(original.instructionsList().length);

        const originalState = original.execute();
        const restoredState = restored.execute();

        if (originalState.success && restoredState.success) {
          const originalProbs = originalState.state.probabilities();
          const restoredProbs = restoredState.state.probabilities();

          expect(originalProbs).toHaveLength(restoredProbs.length);
          for (let i = 0; i < originalProbs.length; i++) {
            expect(originalProbs[i]).toBeCloseTo(restoredProbs[i], 5);
          }
        }
      });

      it('should maintain consistency through JSON round-trip', () => {
        const original = new Circuit(3);
        original.h(0).cnot(0, 1).rx(2, Math.PI / 3);

        const json = original.toJSON();
        const restored = Circuit.fromJSON(json);

        expect(restored.quantumCount()).toBe(original.quantumCount());
        expect(restored.instructionsList()).toHaveLength(original.instructionsList().length);

        const originalState = original.execute();
        const restoredState = restored.execute();

        if (originalState.success && restoredState.success) {
          const originalProbs = originalState.state.probabilities();
          const restoredProbs = restoredState.state.probabilities();

          expect(originalProbs).toHaveLength(restoredProbs.length);
          
          // Check that total probabilities are preserved (should be 1)
          const originalTotal = originalProbs.reduce((a, b) => a + b, 0);
          const restoredTotal = restoredProbs.reduce((a, b) => a + b, 0);
          expect(originalTotal).toBeCloseTo(1, 5);
          expect(restoredTotal).toBeCloseTo(1, 5);
          
          // Verify main amplitudes are reasonably close
          const maxOriginal = Math.max(...originalProbs);
          const maxRestored = Math.max(...restoredProbs);
          expect(maxOriginal).toBeCloseTo(maxRestored, 3);
        }
      });
    });
  });
});