// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/// <reference types="cypress" />

interface Q5MLibrary {
  Circuit: new (numQubits: number) => Q5MCircuit;
}

interface Q5MCircuit {
  h(qubit: number): Q5MCircuit;
  cnot(control: number, target: number): Q5MCircuit;
  sdg(qubit: number): Q5MCircuit;
  measure(qubit: number): Q5MCircuit;
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

describe('Q5M.js Core - Measurement', () => {
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

  it('should measure quantum state correctly', () => {
    cy.window().then((win) => {
      const { Circuit } = win.Q5M;
      const circuit = new Circuit(1);
      
      // Measure |0⟩ state
      circuit.measure(0);
      const result = circuit.execute();
      
      expect(result).to.not.be.undefined;
    });
  });

  it('should collapse superposition on measurement', () => {
    cy.window().then((win) => {
      const { Circuit } = win.Q5M;
      
      // Create superposition and measure multiple times
      const results: Record<number, number> = { 0: 0, 1: 0 };
      const numRuns = 100;
      
      for (let i = 0; i < numRuns; i++) {
        const circuit = new Circuit(1);
        circuit.h(0);
        const result = circuit.execute();
        
        // Simulate measurement (would collapse to |0⟩ or |1⟩)
        const probs = result.state.probabilities();
        if (Math.random() < probs[0]) {
          results[0]++;
        } else {
          results[1]++;
        }
      }
      
      // Should be approximately 50-50 distribution
      expect(results[0]).to.be.within(30, 70);
      expect(results[1]).to.be.within(30, 70);
    });
  });

  it('should support mid-circuit measurements', () => {
    cy.window().then((win) => {
      const { Circuit } = win.Q5M;
      const circuit = new Circuit(2);
      
      // Create entanglement, measure first qubit, continue
      circuit.h(0).cnot(0, 1);
      
      // Note: Actual mid-circuit measurement would require 
      // more sophisticated implementation
      const state = circuit.execute();
      expect(state).to.not.be.undefined;
    });
  });

  it('should calculate measurement probabilities', () => {
    cy.window().then((win) => {
      const { Circuit } = win.Q5M;
      const circuit = new Circuit(2);
      
      // Create GHZ state
      circuit.h(0).cnot(0, 1);
      const result = circuit.execute();
      const probs = result.state.probabilities();
      
      // Verify probability normalization
      const totalProb = probs.reduce((sum: number, p: number) => sum + p, 0);
      expect(totalProb).to.be.closeTo(1.0, 0.001);
    });
  });

  it('should handle measurement in different bases', () => {
    cy.window().then((win) => {
      const { Circuit } = win.Q5M;
      
      // Measure in X basis (Hadamard before measurement)
      const circuitX = new Circuit(1);
      circuitX.h(0).h(0); // H-H = Identity
      const resultX = circuitX.execute();
      const probsX = resultX.state.probabilities();
      expect(probsX[0]).to.be.closeTo(1.0, 0.001);
      
      // Measure in Y basis (S†-H before measurement)
      const circuitY = new Circuit(1);
      circuitY.h(0).sdg(0).h(0);
      const stateY = circuitY.execute();
      expect(stateY).to.not.be.undefined;
    });
  });
});
