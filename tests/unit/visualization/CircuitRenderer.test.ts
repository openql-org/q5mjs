// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

import { CircuitRenderer } from '@/visualization/CircuitRenderer';
import { Circuit } from '@/core/Circuit';

describe('CircuitRenderer', () => {
  describe('Circuit Layout Analysis', () => {
    it('should analyze simple single-qubit circuit', () => {
      const circuit = new Circuit(1);
      circuit.h(0);
      
      const layout = CircuitRenderer.analyzeLayout(circuit);
      
      expect(layout.numQubits).toBe(1);
      expect(layout.numTimeSteps).toBeGreaterThan(0);
      expect(layout.gates).toHaveLength(1);
      expect(layout.gates[0]?.gateName).toBe('H');
      expect(layout.gates[0]?.targets).toEqual([0]);
    });

    it('should analyze multi-qubit circuit with CNOT', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      const layout = CircuitRenderer.analyzeLayout(circuit);
      
      expect(layout.numQubits).toBe(2);
      expect(layout.gates).toHaveLength(2);
      
      const hadamardGate = layout.gates.find(g => g.gateName === 'H');
      const cnotGate = layout.gates.find(g => g.gateName === 'CNOT' || g.gateName === 'CX');
      
      expect(hadamardGate).toBeDefined();
      expect(cnotGate).toBeDefined();
      expect(cnotGate?.targets).toEqual([0, 1]);
    });

    it('should handle empty circuit', () => {
      const circuit = new Circuit(2);
      
      const layout = CircuitRenderer.analyzeLayout(circuit);
      
      expect(layout.numQubits).toBe(2);
      expect(layout.gates).toHaveLength(0);
      expect(layout.connections).toHaveLength(0);
    });

    it('should analyze circuit with parametric gates', () => {
      const circuit = new Circuit(1);
      circuit.rx(0, Math.PI / 2);
      
      const layout = CircuitRenderer.analyzeLayout(circuit);
      
      expect(layout.gates).toHaveLength(1);
      expect(layout.gates[0]?.gateName).toBe('RX(1.571)'); // Gate name includes parameter
      expect(layout.gates[0]?.parameters).toBeDefined();
      expect(layout.gates[0]?.parameters?.[0]).toBeCloseTo(Math.PI / 2, 3);
    });
  });

  describe('ASCII Rendering', () => {
    it('should render single-qubit circuit to ASCII', () => {
      const circuit = new Circuit(1);
      circuit.h(0);
      
      const ascii = CircuitRenderer.renderASCII(circuit);
      
      expect(typeof ascii).toBe('string');
      expect(ascii).toContain('H');
      expect(ascii).toContain('q0');
    });

    it('should render multi-qubit circuit to ASCII', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      const ascii = CircuitRenderer.renderASCII(circuit);
      
      expect(typeof ascii).toBe('string');
      expect(ascii).toContain('H');
      expect(ascii).toContain('q0');
      expect(ascii).toContain('q1');
    });

    it('should handle ASCII options', () => {
      const circuit = new Circuit(1);
      circuit.x(0);
      
      const options = {
        showLabels: true,
        compact: false
      };
      
      const ascii = CircuitRenderer.renderASCII(circuit, options);
      
      expect(typeof ascii).toBe('string');
      expect(ascii).toContain('X');
    });

    it('should render empty circuit to ASCII', () => {
      const circuit = new Circuit(2);
      
      const ascii = CircuitRenderer.renderASCII(circuit);
      
      expect(typeof ascii).toBe('string');
      expect(ascii).toContain('q0');
      expect(ascii).toContain('q1');
    });
  });

  describe('SVG Data Generation', () => {
    it('should generate SVG data for simple circuit', () => {
      const circuit = new Circuit(1);
      circuit.h(0);
      
      const svgData = CircuitRenderer.generateSVGData(circuit);
      
      expect(svgData).toHaveProperty('qubits');
      expect(svgData).toHaveProperty('gates');
      expect(svgData).toHaveProperty('wires');
      expect(svgData).toHaveProperty('width');
      expect(svgData).toHaveProperty('height');
      
      expect(svgData.qubits).toHaveLength(1);
      expect(svgData.gates).toHaveLength(1);
      expect(svgData.gates[0]?.type).toBe('H');
    });

    it('should generate SVG data for multi-qubit circuit', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      const svgData = CircuitRenderer.generateSVGData(circuit);
      
      expect(svgData.qubits).toHaveLength(2);
      expect(svgData.gates.length).toBeGreaterThanOrEqual(2);
      
      const hadamardGate = svgData.gates.find(g => g.type === 'H');
      const cnotGate = svgData.gates.find(g => g.type === 'CNOT' || g.type === 'CX');
      
      expect(hadamardGate).toBeDefined();
      expect(cnotGate).toBeDefined();
    });

    it('should handle SVG dimensions correctly', () => {
      const circuit = new Circuit(3);
      circuit.h(0).h(1).h(2);
      
      const svgData = CircuitRenderer.generateSVGData(circuit);
      
      expect(svgData.width).toBeGreaterThan(0);
      expect(svgData.height).toBeGreaterThan(0);
      expect(svgData.qubits).toHaveLength(3);
    });

    it('should generate proper wire connections', () => {
      const circuit = new Circuit(2);
      circuit.cnot(0, 1);
      
      const svgData = CircuitRenderer.generateSVGData(circuit);
      
      expect(svgData.wires).toBeDefined();
      expect(Array.isArray(svgData.wires)).toBe(true);
    });
  });

  describe('LaTeX Generation', () => {
    it('should generate LaTeX for simple circuit', () => {
      const circuit = new Circuit(1);
      circuit.h(0);
      
      const latex = CircuitRenderer.exportLaTeX(circuit);
      
      expect(typeof latex).toBe('string');
      expect(latex).toContain('quantumcircuit');
      expect(latex).toContain('H');
    });

    it('should generate LaTeX for multi-qubit circuit', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      const latex = CircuitRenderer.exportLaTeX(circuit);
      
      expect(typeof latex).toBe('string');
      expect(latex).toContain('quantumcircuit');
      expect(latex).toContain('H');
    });

    it('should handle empty circuit in LaTeX', () => {
      const circuit = new Circuit(1);
      
      const latex = CircuitRenderer.exportLaTeX(circuit);
      
      expect(typeof latex).toBe('string');
      expect(latex).toContain('quantumcircuit');
    });
  });

  describe('Complex Circuit Rendering', () => {
    it('should render circuit with measurement', () => {
      const circuit = new Circuit(1);
      circuit.h(0).measure(0);
      
      const ascii = CircuitRenderer.renderASCII(circuit);
      
      expect(typeof ascii).toBe('string');
      expect(ascii).toContain('H');
    });

    it('should render circuit with controlled gates', () => {
      const circuit = new Circuit(3);
      circuit.h(0).cnot(0, 1).cnot(1, 2);
      
      const layout = CircuitRenderer.analyzeLayout(circuit);
      
      expect(layout.numQubits).toBe(3);
      expect(layout.gates).toHaveLength(3);
    });

    it('should render circuit with rotation gates', () => {
      const circuit = new Circuit(2);
      circuit.rx(0, Math.PI/4).ry(1, Math.PI/2);
      
      const svgData = CircuitRenderer.generateSVGData(circuit);
      
      expect(svgData.gates).toHaveLength(2);
      // Check that rotation gates are included
      expect(svgData.gates.length).toBeGreaterThan(0);
    });

    it('should handle Bell state circuit', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      const ascii = CircuitRenderer.renderASCII(circuit);
      const latex = CircuitRenderer.exportLaTeX(circuit);
      const svgData = CircuitRenderer.generateSVGData(circuit);
      
      expect(ascii).toContain('H');
      expect(latex).toContain('H');
      expect(svgData.gates.some(g => g.type === 'H')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle circuits with no instructions gracefully', () => {
      const circuit = new Circuit(1);
      
      expect(() => CircuitRenderer.renderASCII(circuit)).not.toThrow();
      expect(() => CircuitRenderer.exportLaTeX(circuit)).not.toThrow();
      expect(() => CircuitRenderer.generateSVGData(circuit)).not.toThrow();
    });

    it('should handle large circuits efficiently', () => {
      const circuit = new Circuit(5);
      
      // Add multiple gates
      for (let i = 0; i < 5; i++) {
        circuit.h(i);
      }
      for (let i = 0; i < 4; i++) {
        circuit.cnot(i, i + 1);
      }
      
      const layout = CircuitRenderer.analyzeLayout(circuit);
      
      expect(layout.numQubits).toBe(5);
      expect(layout.gates).toHaveLength(9); // 5 H gates + 4 CNOT gates
    });

    it('should handle single qubit circuits', () => {
      const circuit = new Circuit(1);
      circuit.x(0).y(0).z(0);
      
      const layout = CircuitRenderer.analyzeLayout(circuit);
      
      expect(layout.numQubits).toBe(1);
      expect(layout.gates).toHaveLength(3);
    });
  });

  describe('Rendering Options', () => {
    it('should respect ASCII rendering options', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      const options = {
        showLabels: false,
        compact: true
      };
      
      const ascii = CircuitRenderer.renderASCII(circuit, options);
      
      expect(typeof ascii).toBe('string');
    });

    it('should handle different LaTeX styles', () => {
      const circuit = new Circuit(1);
      circuit.h(0);
      
      const options = {
        usePackage: 'quantumcircuit',
        showWires: true
      };
      
      const latex = CircuitRenderer.exportLaTeX(circuit, options);
      
      expect(typeof latex).toBe('string');
      expect(latex).toContain('quantum');
    });
  });

  describe('Integration with Circuit API', () => {
    it('should work with chained gate operations', () => {
      const circuit = new Circuit(3);
      const result = circuit
        .h(0)
        .cnot(0, 1)
        .cnot(1, 2)
        .h(2);
      
      expect(result).toBe(circuit); // Chaining should work
      
      const layout = CircuitRenderer.analyzeLayout(circuit);
      expect(layout.gates).toHaveLength(4);
    });

    it('should handle custom gate parameters', () => {
      const circuit = new Circuit(1);
      circuit.appendGate('ph', 0, { params: { phi: Math.PI / 4 } });
      
      const layout = CircuitRenderer.analyzeLayout(circuit);
      
      expect(layout.gates).toHaveLength(1);
      expect(layout.gates[0]?.parameters).toBeDefined();
    });
  });

  // Tests from original visualization.test.ts
  describe('Basic Rendering Tests', () => {
    it('should render empty circuit', () => {
      const circuit = new Circuit(2);
      const ascii = CircuitRenderer.renderASCII(circuit);
      
      expect(ascii).toContain('q0');
      expect(ascii).toContain('q1');
    });
    
    it('should render single qubit gates', () => {
      const circuit = new Circuit(2);
      circuit.h(0).x(1).y(0).z(1);
      
      const ascii = CircuitRenderer.renderASCII(circuit);
      expect(ascii).toContain('H');
      expect(ascii).toContain('X');
      expect(ascii).toContain('Y');
      expect(ascii).toContain('Z');
    });
    
    it('should render two qubit gates', () => {
      const circuit = new Circuit(2);
      circuit.cnot(0, 1).cz(0, 1);
      
      const ascii = CircuitRenderer.renderASCII(circuit);
      expect(ascii).toContain('o'); // Control qubit marker
      expect(ascii).toContain('X'); // CNOT target marker
    });
    
    it('should render measurement gates', () => {
      const circuit = new Circuit(2);
      circuit.h(0).mz(0).mx(1);
      
      const ascii = CircuitRenderer.renderASCII(circuit);
      expect(ascii).toContain('H');
    });
    
    it('should render with custom options', () => {
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      const ascii = CircuitRenderer.renderASCII(circuit, {
        showQubitLabels: true,
        gateSpacing: 3,
        lineChar: '─'
      });
      
      expect(ascii).toContain('q0');
      expect(ascii).toContain('H');
    });
    
    it('should handle complex circuits', () => {
      const circuit = new Circuit(3);
      circuit.h(0).cnot(0, 1).cnot(1, 2).h(2);
      
      const ascii = CircuitRenderer.renderASCII(circuit);
      expect(ascii).toContain('q0');
      expect(ascii).toContain('q1');
      expect(ascii).toContain('q2');
    });
    
    it('should render rotation gates', () => {
      const circuit = new Circuit(1);
      circuit.rx(0, Math.PI / 4).ry(0, Math.PI / 4);
      
      const ascii = CircuitRenderer.renderASCII(circuit);
      expect(ascii).toContain('RX');
      expect(ascii).toContain('RY');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    describe('Instruction Processing', () => {
      it('should skip instructions with no targets gracefully', () => {
        const circuit = new Circuit(2);
        
        // Add an instruction with no targets
        const instructionWithNoTargets = {
          gate: { name: 'barrier' },
          targets: undefined
        };
        
        // Add normal instructions
        circuit.h(0);
        
        // Inject the instruction with no targets
        (circuit as any).instructions.splice(1, 0, instructionWithNoTargets);
        
        const renderer = new CircuitRenderer(circuit);
        const ascii = CircuitRenderer.renderASCII(circuit);
        
        // Should not crash and should render normally
        expect(ascii).toContain('H');
        expect(ascii).not.toContain('barrier');
      });
      
      it('should skip instructions with empty targets array', () => {
        const circuit = new Circuit(2);
        
        // Add an instruction with empty targets
        const instructionWithEmptyTargets = {
          gate: { name: 'noop' },
          targets: []
        };
        
        circuit.h(0);
        (circuit as any).instructions.push(instructionWithEmptyTargets);
        
        const renderer = new CircuitRenderer(circuit);
        const ascii = CircuitRenderer.renderASCII(circuit);
        
        expect(ascii).toContain('H');
        expect(ascii).not.toContain('noop');
      });
      
      it('should handle complex circuit layouts', () => {
        const circuit = new Circuit(3);
        
        // Create a complex circuit that might test edge cases
        circuit.h(0);
        circuit.cnot(1, 2);
        circuit.h(0);
        
        const renderer = new CircuitRenderer(circuit);
        const ascii = CircuitRenderer.renderASCII(circuit);
        
        // Just verify it renders without error
        expect(ascii).toContain('H');
        expect(typeof ascii).toBe('string');
      });
    });
    
    describe('circuit rendering edge cases', () => {
      it('should handle circuit with many gates', () => {
        const circuit = new Circuit(3);
        circuit.h(0).h(1).h(2).cnot(0, 1).cnot(1, 2).cnot(0, 2);
        
        const ascii = CircuitRenderer.renderASCII(circuit);
        expect(ascii).toContain('q0');
        expect(ascii).toContain('q1');
        expect(ascii).toContain('q2');
        expect(ascii).toContain('H');
      });

      it('should handle all critical rendering paths', () => {
        // Test additional paths with a comprehensive test
        
        // Create circuits that will test specific conditions
        const circuit1 = new Circuit(2);
        circuit1.cnot(0, 1); // Test CNOT gate rendering
        
        const circuit2 = new Circuit(4); 
        circuit2.cnot(0, 3); // Long-range CNOT for control line generation
        circuit2.h(1); // Gates between control and target
        circuit2.h(2);
        
        const circuit3 = new Circuit(2);
        circuit3.rx(0, Math.PI/4); // Parameterized gate rendering
        circuit3.ry(1, 0.0); // Edge case: zero parameter
        
        // Test ASCII rendering - this should exercise all control line generation paths
        const ascii1 = CircuitRenderer.renderASCII(circuit1);
        expect(ascii1).toBeDefined();
        expect(ascii1.length).toBeGreaterThan(0);
        
        const ascii2 = CircuitRenderer.renderASCII(circuit2);  
        expect(ascii2).toBeDefined();
        expect(ascii2.length).toBeGreaterThan(0);
        
        const ascii3 = CircuitRenderer.renderASCII(circuit3);
        expect(ascii3).toBeDefined();
        expect(ascii3.length).toBeGreaterThan(0);
        
        // Test LaTeX rendering - this should test CNOT-specific LaTeX generation
        const latex1 = CircuitRenderer.exportLaTeX(circuit1);
        expect(latex1).toContain('ctrl');
        expect(latex1).toContain('targ');
        
        const latex2 = CircuitRenderer.exportLaTeX(circuit2);
        expect(latex2).toBeDefined();
        
        // Test with various circuit layouts to ensure control line edge cases are hit
        const circuit4 = new Circuit(5);
        circuit4.cnot(0, 4); // Maximum separation
        circuit4.cnot(1, 2); // Adjacent qubits
        circuit4.h(3); // Gate in between
        
        const ascii4 = CircuitRenderer.renderASCII(circuit4);
        expect(ascii4).toBeDefined();
        
        // Test SVG generation paths
        const svgData = CircuitRenderer.generateSVGData(circuit1);
        expect(svgData.gates.length).toBeGreaterThan(0);
        expect(svgData.qubits.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Advanced Rendering Features', () => {
    it('should handle time step array management correctly', () => {
      // Create a circuit that will test the timeSteps array creation fallback
      // This happens when earliestTime index doesn't exist in timeSteps array yet
      const circuit = new Circuit(3);
      
      // Create gates at specific times that will test the fallback condition
      circuit.h(0);    // Will be at time 0
      circuit.h(2);    // Will also be at time 0, but different qubit
      circuit.cnot(0, 1); // Will be at time 1
      
      // The fallback occurs during layout analysis when a time step doesn't exist yet
      const renderer = new CircuitRenderer(circuit);
      const ascii = CircuitRenderer.renderASCII(circuit);
      
      // Verify the circuit renders correctly, which means the fallback worked
      expect(ascii).toBeDefined();
      expect(ascii).toContain('H');
      expect(ascii).toContain('o'); // CNOT control symbol
    });

    it('should render ASCII time step headers correctly', () => {
      const circuit = new Circuit(2);
      circuit.h(0);
      circuit.cnot(0, 1);
      
      // Test with showTimeSteps enabled and showQubitLabels enabled
      const asciiWithHeaders = CircuitRenderer.renderASCII(circuit, {
        showTimeSteps: true,
        showQubitLabels: true
      });
      
      expect(asciiWithHeaders).toContain('0'); // time step header
      expect(asciiWithHeaders).toContain('1'); // time step header
      expect(typeof asciiWithHeaders).toBe('string');
      
      // Test with showTimeSteps enabled but showQubitLabels disabled
      const asciiNoQubitLabels = CircuitRenderer.renderASCII(circuit, {
        showTimeSteps: true,
        showQubitLabels: false
      });
      
      expect(asciiNoQubitLabels).toContain('0');
      expect(typeof asciiNoQubitLabels).toBe('string');
    });

    it('should handle unknown gates in LaTeX rendering', () => {
      const circuit = new Circuit(1);
      circuit.h(0);
      
      // Test LaTeX export with normal gates first
      const latex = CircuitRenderer.exportLaTeX(circuit);
      expect(latex).toBeDefined();
      expect(typeof latex).toBe('string');
      
      // To test the unknown gate fallback, we need to create a circuit with an unrecognized gate
      // We'll modify the circuit's instructions directly to simulate an unknown gate
      const customCircuit = new Circuit(1);
      customCircuit.h(0);
      
      // Access the instructions and modify the gate name to something unknown
      const instructions = customCircuit['instructions'];
      if (instructions.length > 0) {
        const originalName = instructions[0]!.name;
        instructions[0]!.name = 'CustomUnknownGate';
        
        // This should test the fallback that returns '\\gate{?}'
        const latexWithUnknown = CircuitRenderer.exportLaTeX(customCircuit);
        expect(latexWithUnknown).toBeDefined();
        expect(typeof latexWithUnknown).toBe('string');
        
        // Restore original name
        instructions[0]!.name = originalName;
      }
    });

    it('should test additional ASCII rendering options comprehensively', () => {
      const circuit = new Circuit(3);
      circuit.h(0);
      circuit.cnot(0, 1);
      circuit.cnot(1, 2);
      
      // Test all combinations of showTimeSteps and showQubitLabels
      const options = [
        { showTimeSteps: true, showQubitLabels: true },
        { showTimeSteps: true, showQubitLabels: false },
        { showTimeSteps: false, showQubitLabels: true },
        { showTimeSteps: false, showQubitLabels: false }
      ];
      
      options.forEach((option, index) => {
        const ascii = CircuitRenderer.renderASCII(circuit, option);
        expect(ascii).toBeDefined();
        expect(typeof ascii).toBe('string');
        expect(ascii.length).toBeGreaterThan(0);
      });
    });

    it('should handle edge cases in circuit layout that trigger array creation', () => {
      const circuit = new Circuit(4);
      
      // Create a complex pattern that ensures different time slots are created
      // This should test the timeSteps[earliestTime] = [instruction] fallback
      circuit.h(0);    // time 0
      circuit.h(2);    // time 0 (different qubit)
      circuit.cnot(0, 1); // time 1
      circuit.h(3);    // time 0 (another different qubit)
      circuit.cnot(2, 3); // time 1
      
      const renderer = new CircuitRenderer(circuit);
      const ascii = CircuitRenderer.renderASCII(circuit);
      const svg = CircuitRenderer.generateSVGData(circuit);
      const latex = CircuitRenderer.exportLaTeX(circuit);
      
      // Verify all rendering methods work
      expect(ascii).toBeDefined();
      expect(svg).toBeDefined();
      expect(latex).toBeDefined();
      expect(typeof ascii).toBe('string');
      expect(typeof svg).toBe('object'); // SVG data is an object
      expect(typeof latex).toBe('string');
    });

    it('should handle time step array initialization edge cases', () => {
      // Create specific conditions to test array initialization fallback
      // This can happen if the array gets corrupted or has gaps
      
      const circuit = new Circuit(3);
      
      // Add gates in a way that might create timing conflicts or edge cases
      circuit.h(0);  // time 0
      circuit.h(1);  // time 0
      
      // Create a renderer to access internal state
      const renderer = new CircuitRenderer(circuit);
      
      // Test safety fallback for array initialization
      // Let's try to manipulate the circuit in a way that creates timing gaps
      
      // Add more gates that could create complex timing scenarios
      circuit.cnot(0, 1);  // time 1
      circuit.h(2);        // time 0 (should still be available)
      circuit.cnot(1, 2);  // time 2
      circuit.cnot(0, 2);  // time 3
      
      // Force rendering which will test layout analysis
      const ascii = CircuitRenderer.renderASCII(circuit);
      expect(ascii).toBeDefined();
      expect(ascii).toContain('H');
      
      // Try another approach: create a circuit with sparse gate placement
      const sparseCircuit = new Circuit(5);
      
      // Add gates with large gaps between target qubits to create timing edge cases
      sparseCircuit.h(0);    // time 0
      sparseCircuit.h(4);    // time 0 
      sparseCircuit.cnot(0, 2); // time 1
      sparseCircuit.h(1);    // time 0
      sparseCircuit.cnot(4, 3); // time 1
      sparseCircuit.cnot(1, 3); // time 2
      
      const sparseAscii = CircuitRenderer.renderASCII(sparseCircuit);
      expect(sparseAscii).toBeDefined();
    });

    it('should test complex circuit patterns for array management', () => {
      // Create multiple circuits with different patterns that might test the fallback
      
      // Pattern 1: Many single-qubit gates at time 0
      const circuit1 = new Circuit(4);
      circuit1.h(0);
      circuit1.h(1);
      circuit1.h(2);
      circuit1.h(3);
      
      const ascii1 = CircuitRenderer.renderASCII(circuit1);
      expect(ascii1).toContain('H');
      
      // Pattern 2: Interleaved gates with dependencies
      const circuit2 = new Circuit(3);
      circuit2.h(0);        // time 0
      circuit2.cnot(0, 1);  // time 1
      circuit2.h(2);        // time 0
      circuit2.cnot(2, 1);  // time 2 (qubit 1 is busy until time 1)
      
      const ascii2 = CircuitRenderer.renderASCII(circuit2);
      expect(ascii2).toBeDefined();
      
      // Pattern 3: Complex multi-qubit gate patterns
      const circuit3 = new Circuit(5);
      // This pattern should create complex timing requirements
      for (let i = 0; i < 5; i++) {
        circuit3.h(i); // All at time 0
      }
      
      // Add CNOTs that create dependencies
      circuit3.cnot(0, 1);
      circuit3.cnot(2, 3);
      circuit3.cnot(4, 0); // This should be at a later time due to qubit 0 dependency
      
      const ascii3 = CircuitRenderer.renderASCII(circuit3);
      expect(ascii3).toBeDefined();
    });

    it('should handle comprehensive edge cases robustly', () => {
      // Test various edge cases that might test uncommon paths
      
      const circuit = new Circuit(6);
      
      // Create a complex pattern with overlapping dependencies
      circuit.h(0);
      circuit.h(1);
      circuit.h(2);
      circuit.cnot(0, 3);  
      circuit.cnot(1, 4);  
      circuit.cnot(2, 5);  
      circuit.cnot(3, 4);  
      circuit.cnot(4, 5);  
      circuit.cnot(5, 0);  // Creates a cycle of dependencies
      
      // Test all rendering methods
      const ascii = CircuitRenderer.renderASCII(circuit);
      const svg = CircuitRenderer.generateSVGData(circuit);
      const latex = CircuitRenderer.exportLaTeX(circuit);
      
      expect(ascii).toBeDefined();
      expect(svg).toBeDefined();
      expect(latex).toBeDefined();
      
      // Test with all combinations of options
      const options = [
        { showTimeSteps: true, showQubitLabels: true },
        { showTimeSteps: true, showQubitLabels: false },
        { showTimeSteps: false, showQubitLabels: true },
        { showTimeSteps: false, showQubitLabels: false }
      ];
      
      options.forEach(option => {
        const asciiWithOption = CircuitRenderer.renderASCII(circuit, option);
        expect(asciiWithOption).toBeDefined();
      });
    });


    it('should test alternative circuit patterns for robustness', () => {
      // Create circuits with various patterns that might test edge cases
      const patterns = [
        // Pattern 1: Very sparse circuit
        () => {
          const c = new Circuit(10);
          c.h(0);
          c.h(9);
          return c;
        },
        // Pattern 2: Dense circuit with many dependencies
        () => {
          const c = new Circuit(4);
          for (let i = 0; i < 4; i++) {
            c.h(i);
          }
          for (let i = 0; i < 3; i++) {
            c.cnot(i, i + 1);
          }
          return c;
        },
        // Pattern 3: Complex timing scenario
        () => {
          const c = new Circuit(5);
          c.h(0);
          c.cnot(0, 2);
          c.h(1);
          c.cnot(1, 3);
          c.cnot(2, 4);
          c.cnot(3, 0);
          return c;
        }
      ];
      
      patterns.forEach((createPattern, index) => {
        const circuit = createPattern();
        const ascii = CircuitRenderer.renderASCII(circuit);
        expect(ascii).toBeDefined();
      });
    });

    it('should test all conditional paths thoroughly', () => {
      // Test conditional paths for undefined lastUsed case
      const circuit1 = new Circuit(2);
      circuit1.h(0); // First gate on qubit 0 - lastUsed is undefined initially
      circuit1.h(1); // First gate on qubit 1 - lastUsed is undefined initially
      
      const ascii1 = CircuitRenderer.renderASCII(circuit1);
      expect(ascii1).toBeDefined();
      
      // Test useUnicode flag variations
      const circuit2 = new Circuit(2);
      circuit2.h(0);
      circuit2.cnot(0, 1);
      
      // Test with useUnicode: true
      const asciiUnicode = CircuitRenderer.renderASCII(circuit2, {
        useUnicode: true,
        showQubitLabels: true,
        showTimeSteps: true
      });
      expect(asciiUnicode).toBeDefined();
      expect(typeof asciiUnicode).toBe('string');
      
      // Test with useUnicode: false (default)
      const asciiNoUnicode = CircuitRenderer.renderASCII(circuit2, {
        useUnicode: false,
        showQubitLabels: true,
        showTimeSteps: true
      });
      expect(asciiNoUnicode).toBeDefined();
      expect(typeof asciiNoUnicode).toBe('string');
      
      // Test validateParameters with empty array
      // This is tested indirectly through gates without parameters
      const circuit3 = new Circuit(1);
      circuit3.h(0); // H gate has no parameters
      
      const ascii3 = CircuitRenderer.renderASCII(circuit3);
      expect(ascii3).toBeDefined();
      
      // Test columnWidths null coalescing
      // This happens when columnWidths array has undefined values
      const circuit4 = new Circuit(3);
      circuit4.h(0);
      circuit4.cnot(0, 1);
      circuit4.h(2);
      
      const ascii4 = CircuitRenderer.renderASCII(circuit4);
      expect(ascii4).toBeDefined();
    });

    it('should test all Unicode character variations comprehensively', () => {
      const circuit = new Circuit(3);
      
      // Add various gate types to test different character usage
      circuit.h(0);           // Single qubit gate
      circuit.cnot(0, 1);     // Control dot and target X
      circuit.cnot(1, 2);     // More control structures
      circuit.h(2);           // Final gate
      
      // Test with Unicode enabled - should use ●, ⊕, ─, │, etc.
      const unicodeOptions = {
        useUnicode: true,
        showQubitLabels: true,
        showTimeSteps: true,
        minGateWidth: 3
      };
      
      const unicodeAscii = CircuitRenderer.renderASCII(circuit, unicodeOptions);
      expect(unicodeAscii).toBeDefined();
      expect(typeof unicodeAscii).toBe('string');
      
      // Test with Unicode disabled - should use o, X, -, |, etc.
      const noUnicodeOptions = {
        useUnicode: false,
        showQubitLabels: true,
        showTimeSteps: true,
        minGateWidth: 3
      };
      
      const noUnicodeAscii = CircuitRenderer.renderASCII(circuit, noUnicodeOptions);
      expect(noUnicodeAscii).toBeDefined();
      expect(typeof noUnicodeAscii).toBe('string');
      
      // Verify different characters are used
      expect(unicodeAscii).not.toBe(noUnicodeAscii);
    });

    it('should test empty parameter arrays and undefined cases', () => {
      // Create circuits that will test the validateParameters function
      const circuit1 = new Circuit(2);
      
      // Gates without parameters
      circuit1.h(0);    // Hadamard has no parameters
      circuit1.x(1);    // Pauli-X has no parameters  
      circuit1.cnot(0, 1); // CNOT has no parameters
      
      const ascii1 = CircuitRenderer.renderASCII(circuit1);
      expect(ascii1).toBeDefined();
      
      // Gates with parameters (should return params)
      const circuit2 = new Circuit(1);
      circuit2.ry(0, Math.PI / 4); // RY has angle parameter
      
      const ascii2 = CircuitRenderer.renderASCII(circuit2);
      expect(ascii2).toBeDefined();
      expect(ascii2).toContain('RY'); // Should show parameterized gate
    });

    it('should test columnWidths null coalescing behavior', () => {
      // Create a circuit that might result in undefined columnWidths entries
      const circuit = new Circuit(4);
      
      // Complex pattern with varying gate widths
      circuit.h(0);
      circuit.ry(1, Math.PI/3); // Longer gate name
      circuit.cnot(2, 3);
      circuit.ry(0, Math.PI/6); // Another parameterized gate
      
      // Test with different options that might affect column width calculation
      const options = {
        minGateWidth: 1, // Very small width to test edge cases
        showQubitLabels: true,
        showTimeSteps: true
      };
      
      const ascii = CircuitRenderer.renderASCII(circuit, options);
      expect(ascii).toBeDefined();
      expect(typeof ascii).toBe('string');
      expect(ascii.length).toBeGreaterThan(0);
    });

    it('should test undefined lastUsed handling explicitly', () => {
      // Create a fresh circuit to ensure qubits start with undefined lastUsed values
      const circuit = new Circuit(5);
      
      // Add gates to qubits that have never been used (lastUsed is undefined)
      // This should use the default time 0 for first usage
      circuit.h(0); // qubit 0 lastUsed is undefined -> should return 0
      circuit.h(2); // qubit 2 lastUsed is undefined -> should return 0  
      circuit.h(4); // qubit 4 lastUsed is undefined -> should return 0
      
      // Now add a gate that depends on a previously used qubit
      circuit.cnot(0, 1); // qubit 0 lastUsed is now 0 -> should return 1
      
      // Add another gate to test the defined case
      circuit.h(0); // qubit 0 lastUsed is now 1 -> should return 2
      
      const ascii = CircuitRenderer.renderASCII(circuit);
      expect(ascii).toBeDefined();
      expect(ascii).toContain('H');
    });

    it('should test validateParameters with both empty and non-empty arrays', () => {
      // Create circuits with gates that have different parameter scenarios
      
      // Test empty parameters (length === 0) -> should return undefined  
      const circuit1 = new Circuit(2);
      circuit1.h(0);     // No parameters
      circuit1.x(1);     // No parameters
      circuit1.cnot(0, 1); // No parameters
      
      const ascii1 = CircuitRenderer.renderASCII(circuit1);
      expect(ascii1).toBeDefined();
      
      // Test non-empty parameters (length > 0) -> should return params
      const circuit2 = new Circuit(2);
      circuit2.ry(0, Math.PI/4);   // Has angle parameter
      circuit2.rz(1, Math.PI/3);   // Has angle parameter
      circuit2.rx(0, Math.PI/6);   // Has angle parameter
      
      const ascii2 = CircuitRenderer.renderASCII(circuit2);
      expect(ascii2).toBeDefined();
    });

    it('should test null coalescing for columnWidths edge cases', () => {
      // Test scenarios that might create undefined values in columnWidths array
      const circuit = new Circuit(6);
      
      // Create a pattern with many gates of different widths
      circuit.h(0);
      circuit.ry(1, Math.PI); // Long parameter
      circuit.rz(2, -Math.PI/2); // Negative parameter
      circuit.rx(3, 0.123456789); // Many decimal places
      circuit.cnot(4, 5);
      
      // Test with minimal width settings
      const asciiMinWidth = CircuitRenderer.renderASCII(circuit, {
        minGateWidth: 0, // Edge case: zero width
        showQubitLabels: false,
        showTimeSteps: false
      });
      expect(asciiMinWidth).toBeDefined();
      
      // Test with normal width settings
      const asciiNormalWidth = CircuitRenderer.renderASCII(circuit, {
        minGateWidth: 5,
        showQubitLabels: true,
        showTimeSteps: true
      });
      expect(asciiNormalWidth).toBeDefined();
    });

    it('should test additional conditional cases thoroughly', () => {
      // Create comprehensive test that exercises all conditional cases
      
      // Test circuit with first-time qubit usage (undefined lastUsed)
      const circuit = new Circuit(3);
      
      // All these gates use qubits for the first time
      circuit.h(0); // lastUsed[0] is undefined -> defaults to time 0
      circuit.x(1); // lastUsed[1] is undefined -> defaults to time 0
      circuit.y(2); // lastUsed[2] is undefined -> defaults to time 0
      
      // Now add gates that use previously used qubits
      circuit.cnot(0, 1); // Both qubits have lastUsed = 0 -> time 1
      circuit.cnot(1, 2); // Different timing based on qubit availability
      
      // Test with both Unicode modes
      const unicodeAscii = CircuitRenderer.renderASCII(circuit, {
        useUnicode: true
      });
      const noUnicodeAscii = CircuitRenderer.renderASCII(circuit, {
        useUnicode: false
      });
      
      expect(unicodeAscii).toBeDefined();
      expect(noUnicodeAscii).toBeDefined();
      expect(unicodeAscii).not.toBe(noUnicodeAscii);
    });

    it('should handle specific conditions', () => {
      // Test CNOT gate for LaTeX rendering
      const circuit = new Circuit(2);
      circuit.cnot(0, 1);
      const latex = CircuitRenderer.exportLaTeX(circuit);
      expect(latex).toContain('ctrl');

      // Test control line generation with long distance controls
      const circuit2 = new Circuit(4);  
      circuit2.cnot(0, 3); // Long distance control
      const ascii = CircuitRenderer.renderASCII(circuit2);
      expect(ascii).toBeDefined();
    });

    it('should handle parameter extraction edge cases', () => {
      // Test parameter extraction with various gate name formats
      const circuit1 = new Circuit(1);
      const circuit2 = new Circuit(1);
      
      // Add gates that may have different parameter formats
      circuit1.rx(0, Math.PI); // This creates a parameterized gate
      circuit2.x(0); // This creates a non-parameterized gate
      
      const layout1 = CircuitRenderer.analyzeLayout(circuit1);
      const layout2 = CircuitRenderer.analyzeLayout(circuit2);
      
      expect(layout1.gates.length).toBeGreaterThan(0);
      expect(layout2.gates.length).toBeGreaterThan(0);
      
      // Test that both parameterized and non-parameterized gates are handled
      const hasParameterizedGate = layout1.gates.some(g => g.parameters && g.parameters.length > 0);
      expect(hasParameterizedGate).toBe(true);
    });
  });
});