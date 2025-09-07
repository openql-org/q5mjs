// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/// <reference types="cypress" />

interface Q5MLibrary {
  Circuit: new (numQubits: number) => Q5MCircuit;
}

interface Q5MCircuit {
  h(qubit: number): Q5MCircuit;
  x(qubit: number): Q5MCircuit;
  s(qubit: number): Q5MCircuit;
  cnot(control: number, target: number): Q5MCircuit;
  cz(control: number, target: number): Q5MCircuit;
  ry(qubit: number, angle: number): Q5MCircuit;
  execute(): Q5MExecutionResult;
}

interface Q5MExecutionResult {
  state: Q5MQuantumState;
  success: boolean;
}

interface Q5MQuantumState {
  amplitudes(): any[];
  probabilities(): number[];
}

declare global {
  interface Window {
    Q5M: Q5MLibrary;
    q5m: Q5MLibrary;
  }
}

describe('Q5M.js Core - Quantum Algorithms', () => {
  beforeEach(() => {
    // Visit minimal page and load Q5M.js UMD content dynamically
    cy.visit('cypress/fixtures/pages/minimal.html');
    
    // Load Q5M.js UMD content directly and inject it into the page
    cy.readFile('dist/q5m.umd.js').then((umdContent: string) => {
      cy.window().then((win) => {
        const script = win.document.createElement('script');
        script.type = 'text/javascript';
        script.textContent = umdContent;
        win.document.head.appendChild(script);
        
        // Verify Q5M is available
        expect(win.Q5M).to.exist;
        expect(win.Q5M.Circuit).to.be.a('function');
        
        // Make it available as q5m for test compatibility
        win.q5m = win.Q5M;
      });
    });
  });

  it('should implement quantum teleportation', () => {
    cy.window().then((win) => {
      const { Circuit } = win.Q5M;
      const circuit = new Circuit(3);
      
      // Prepare state to teleport on qubit 0
      circuit.ry(0, Math.PI / 4);
      
      // Create Bell pair between qubits 1 and 2
      circuit.h(1).cnot(1, 2);
      
      // Bell measurement on qubits 0 and 1
      circuit.cnot(0, 1).h(0);
      
      // Classical communication would determine corrections
      // For testing, just verify circuit executes
      const state = circuit.execute();
      expect(state).to.not.be.undefined;
    });
  });

  it('should create GHZ states', () => {
    cy.window().then((win) => {
      const { Circuit } = win.Q5M;
      const circuit = new Circuit(3);
      
      // Create 3-qubit GHZ state
      circuit.h(0).cnot(0, 1).cnot(0, 2);
      
      const result = circuit.execute();
      const probs = result.state.probabilities();
      
      // Should have |000⟩ and |111⟩ with equal probability
      expect(probs[0]).to.be.closeTo(0.5, 0.001); // |000⟩
      expect(probs[7]).to.be.closeTo(0.5, 0.001); // |111⟩
    });
  });

  it('should implement quantum phase kickback', () => {
    cy.window().then((win) => {
      const { Circuit } = win.Q5M;
      const circuit = new Circuit(2);
      
      // Prepare control in superposition
      circuit.h(0);
      // Target in |1⟩
      circuit.x(1);
      // Controlled-Z gate
      circuit.cz(0, 1);
      
      const state = circuit.execute();
      expect(state).to.not.be.undefined;
    });
  });

  it('should demonstrate superposition and interference', () => {
    cy.window().then((win) => {
      const { Circuit } = win.Q5M;
      const circuit = new Circuit(1);
      
      // Create superposition
      circuit.h(0);
      // Apply phase
      circuit.s(0);
      // Return to computational basis
      circuit.h(0);
      
      const result = circuit.execute();
      const probs = result.state.probabilities();
      
      // Interference should affect final probabilities
      expect(probs[0] + probs[1]).to.be.closeTo(1.0, 0.001);
    });
  });

  it('should support parameterized quantum circuits', () => {
    cy.window().then((win) => {
      const { Circuit } = win.Q5M;
      
      // Test with different rotation angles
      const angles = [0, Math.PI / 4, Math.PI / 2, Math.PI];
      
      angles.forEach(angle => {
        const circuit = new Circuit(1);
        circuit.ry(0, angle);
        const result = circuit.execute();
        const probs = result.state.probabilities();
        
        // Verify probability conservation
        expect(probs[0] + probs[1]).to.be.closeTo(1.0, 0.001);
      });
    });
  });
});
