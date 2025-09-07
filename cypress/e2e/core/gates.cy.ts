// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/// <reference types="cypress" />

interface Q5MLibrary {
  Circuit: new (numQubits: number) => Q5MCircuit;
}

interface Q5MCircuit {
  h(qubit: number): Q5MCircuit;
  x(qubit: number): Q5MCircuit;
  y(qubit: number): Q5MCircuit;
  z(qubit: number): Q5MCircuit;
  s(qubit: number): Q5MCircuit;
  t(qubit: number): Q5MCircuit;
  rx(qubit: number, angle: number): Q5MCircuit;
  ry(qubit: number, angle: number): Q5MCircuit;
  rz(qubit: number, angle: number): Q5MCircuit;
  cnot(control: number, target: number): Q5MCircuit;
  cz(control: number, target: number): Q5MCircuit;
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

describe('Q5M.js Core - Quantum Gates', () => {
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

  describe('Single-qubit gates', () => {
    it('should apply Pauli gates correctly', () => {
      cy.window().then((win) => {
        const { Circuit } = win.Q5M;
        
        // X gate (bit flip)
        const circuitX = new Circuit(1);
        circuitX.x(0);
        let result = circuitX.execute();
        let probs = result.state.probabilities();
        expect(probs[1]).to.be.closeTo(1.0, 0.001); // |1⟩
        
        // Y gate
        const circuitY = new Circuit(1);
        circuitY.y(0);
        result = circuitY.execute();
        probs = result.state.probabilities();
        expect(probs[1]).to.be.closeTo(1.0, 0.001); // |1⟩ with phase
        
        // Z gate (phase flip)
        const circuitZ = new Circuit(1);
        circuitZ.h(0).z(0).h(0);
        result = circuitZ.execute();
        probs = result.state.probabilities();
        expect(probs[1]).to.be.closeTo(1.0, 0.001); // |1⟩
      });
    });

    it('should apply Hadamard gate for superposition', () => {
      cy.window().then((win) => {
        const { Circuit } = win.Q5M;
        const circuit = new Circuit(1);
        
        circuit.h(0);
        const result = circuit.execute();
        const probs = result.state.probabilities();
        
        expect(probs[0]).to.be.closeTo(0.5, 0.001);
        expect(probs[1]).to.be.closeTo(0.5, 0.001);
      });
    });

    it('should apply rotation gates', () => {
      cy.window().then((win) => {
        const { Circuit } = win.Q5M;
        
        // RX rotation
        const circuitRX = new Circuit(1);
        circuitRX.rx(0, Math.PI);
        let result = circuitRX.execute();
        let probs = result.state.probabilities();
        expect(probs[1]).to.be.closeTo(1.0, 0.001);
        
        // RY rotation
        const circuitRY = new Circuit(1);
        circuitRY.ry(0, Math.PI);
        result = circuitRY.execute();
        probs = result.state.probabilities();
        expect(probs[1]).to.be.closeTo(1.0, 0.001);
        
        // RZ rotation
        const circuitRZ = new Circuit(1);
        circuitRZ.h(0).rz(0, Math.PI).h(0);
        result = circuitRZ.execute();
        probs = result.state.probabilities();
        expect(probs[1]).to.be.closeTo(1.0, 0.001);
      });
    });
  });

  describe('Two-qubit gates', () => {
    it('should apply CNOT gate', () => {
      cy.window().then((win) => {
        const { Circuit } = win.Q5M;
        const circuit = new Circuit(2);
        
        circuit.x(0).cnot(0, 1);
        const result = circuit.execute();
        const probs = result.state.probabilities();
        
        expect(probs[3]).to.be.closeTo(1.0, 0.001); // |11⟩
      });
    });

    it('should apply controlled phase gates', () => {
      cy.window().then((win) => {
        const { Circuit } = win.Q5M;
        const circuit = new Circuit(2);
        
        circuit.h(0).h(1).cz(0, 1);
        const state = circuit.execute();
        
        expect(state).to.not.be.undefined;
      });
    });

    it('should create entangled states', () => {
      cy.window().then((win) => {
        const { Circuit } = win.Q5M;
        const circuit = new Circuit(2);
        
        // Create Bell state
        circuit.h(0).cnot(0, 1);
        const result = circuit.execute();
        const probs = result.state.probabilities();
        
        expect(probs[0]).to.be.closeTo(0.5, 0.001); // |00⟩
        expect(probs[3]).to.be.closeTo(0.5, 0.001); // |11⟩
        expect(probs[1]).to.be.closeTo(0.0, 0.001); // |01⟩
        expect(probs[2]).to.be.closeTo(0.0, 0.001); // |10⟩
      });
    });
  });
});
