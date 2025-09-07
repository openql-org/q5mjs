// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/// <reference types="cypress" />

interface Q5MLibrary {
  Circuit: new (numQubits: number) => Q5MCircuit;
}

interface Q5MCircuit {
  numQubits: number;
  h(qubit: number): Q5MCircuit;
  cnot(control: number, target: number): Q5MCircuit;
  gates: any[];
  execute(): Q5MQuantumState;
}

interface Q5MQuantumState {
  probabilities(): number[];
}

declare global {
  interface Window {
    Q5M: Q5MLibrary;
    q5m: Q5MLibrary;
  }
}

describe('Q5M.js Core - Circuit API', () => {
  beforeEach(() => {
    // Visit minimal page and load Q5M.js UMD content dynamically
    cy.visit('cypress/fixtures/pages/minimal.html');
    
    // Load Q5M.js UMD content directly and inject it into the page
    cy.readFile('dist/q5m.umd.js').then((umdContent: string) => {
      // Inject the UMD script via script tag creation
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

  it('should create a quantum circuit', () => {
    cy.window().then((win) => {
      const { Circuit } = win.Q5M;
      const circuit = new Circuit(2);
      expect(circuit).to.not.be.undefined;
      expect(circuit.numQubits).to.equal(2);
    });
  });

  it('should execute empty circuit and return initial state', () => {
    cy.window().then((win) => {
      const { Circuit } = win.Q5M;
      const circuit = new Circuit(1);
      const state = circuit.execute();
      
      expect(state).to.not.be.undefined;
      const probs = state.state.probabilities();
      expect(probs[0]).to.be.closeTo(1.0, 0.001);
      expect(probs[1]).to.be.closeTo(0.0, 0.001);
    });
  });

  it('should apply gates using chain API', () => {
    cy.window().then((win) => {
      const { Circuit } = win.Q5M;
      const circuit = new Circuit(2);
      
      circuit.h(0).cnot(0, 1);
      const result = circuit.execute();
      const probs = result.state.probabilities();
      
      // Should create Bell state: |00⟩ and |11⟩ with 50% probability each
      expect(probs[0]).to.be.closeTo(0.5, 0.001); // |00⟩
      expect(probs[3]).to.be.closeTo(0.5, 0.001); // |11⟩
    });
  });

  it('should support circuit composition', () => {
    cy.window().then((win) => {
      const { Circuit } = win.Q5M;
      
      // Create a composite circuit using fluent API
      const circuit = new Circuit(2);
      circuit.h(0).cnot(0, 1); // H followed by CNOT creates Bell state
      
      const result = circuit.execute();
      const probs = result.state.probabilities();
      
      // Should create Bell state: |00⟩ and |11⟩ with 50% probability each
      expect(probs[0]).to.be.closeTo(0.5, 0.001); // |00⟩
      expect(probs[3]).to.be.closeTo(0.5, 0.001); // |11⟩
    });
  });
});
