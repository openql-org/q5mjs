// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/// <reference types="cypress" />

interface Q5MLibrary {
  Circuit: new (numQubits: number) => Q5MCircuit;
  QubitState: new (numQubits: number) => Q5MQuantumState;
}

interface Q5MCircuit {
  h(qubit: number): Q5MCircuit;
  cnot(control: number, target: number): Q5MCircuit;
  execute(): Q5MExecutionResult;
}

interface Q5MExecutionResult {
  state: Q5MQuantumState;
  success: boolean;
}

interface Q5MQuantumState {
  probabilities(): number[];
}

declare global {
  interface Window {
    Q5M: Q5MLibrary;
  }
}

describe('Q5M.js - Vanilla JavaScript Integration', () => {
  beforeEach(() => {
    cy.visit('cypress/fixtures/pages/minimal.html');
    
    cy.readFile('dist/q5m.umd.js').then((umdContent: string) => {
      cy.window().then((win) => {
        const script = win.document.createElement('script');
        script.type = 'text/javascript';
        script.textContent = umdContent;
        win.document.head.appendChild(script);
        
        expect(win.Q5M).to.exist;
        expect(win.Q5M.Circuit).to.be.a('function');
      });
    });
  });

  it('should load Q5M globally', () => {
    cy.window().then((win) => {
      expect(win.Q5M).to.not.be.undefined;
      expect(win.Q5M.Circuit).to.be.a('function');
      expect(win.Q5M.QubitState).to.be.a('function');
    });
  });

  it('should work with vanilla JavaScript DOM manipulation', () => {
    cy.window().then((win) => {
      // Create circuit using vanilla JS
      const circuit = new win.Q5M.Circuit(2);
      circuit.h(0).cnot(0, 1);
      
      const result = circuit.execute();
      const probs = result.state.probabilities();
      
      // Should create Bell state: |00⟩ and |11⟩ with equal probability
      expect(probs[0]).to.be.closeTo(0.5, 0.001);
      expect(probs[3]).to.be.closeTo(0.5, 0.001);
      
      // Create DOM element to show result
      const resultDiv = win.document.createElement('div');
      resultDiv.id = 'quantum-result';
      resultDiv.textContent = `Bell state probabilities: |00⟩=${probs[0].toFixed(3)}, |11⟩=${probs[3].toFixed(3)}`;
      win.document.body.appendChild(resultDiv);
      
      // Verify DOM manipulation worked
      cy.get('#quantum-result').should('exist');
      cy.get('#quantum-result').should('contain', 'Bell state probabilities');
    });
  });

  it('should handle quantum operations in vanilla JS', () => {
    cy.window().then((win) => {
      // Create superposition
      const circuit = new win.Q5M.Circuit(1);
      circuit.h(0); // Hadamard creates superposition
      
      const result = circuit.execute();
      const probs = result.state.probabilities();
      
      // Should have equal probabilities for |0⟩ and |1⟩
      expect(probs[0]).to.be.closeTo(0.5, 0.001);
      expect(probs[1]).to.be.closeTo(0.5, 0.001);
      
      // Add result to DOM
      const statusDiv = win.document.createElement('div');
      statusDiv.className = 'quantum-status';
      statusDiv.innerHTML = `
        <h3>Superposition State</h3>
        <p>|0⟩ probability: ${probs[0].toFixed(3)}</p>
        <p>|1⟩ probability: ${probs[1].toFixed(3)}</p>
      `;
      win.document.body.appendChild(statusDiv);
      
      cy.get('.quantum-status').should('exist');
      cy.get('.quantum-status h3').should('contain', 'Superposition State');
    });
  });

  it('should support complex quantum algorithms', () => {
    cy.window().then((win) => {
      // Create 3-qubit GHZ state
      const circuit = new win.Q5M.Circuit(3);
      circuit.h(0).cnot(0, 1).cnot(0, 2);
      
      const result = circuit.execute();
      const probs = result.state.probabilities();
      
      // GHZ state should have |000⟩ and |111⟩ with equal probability
      expect(probs[0]).to.be.closeTo(0.5, 0.001); // |000⟩
      expect(probs[7]).to.be.closeTo(0.5, 0.001); // |111⟩
      
      // All other states should have zero probability
      for (let i = 1; i < 7; i++) {
        expect(probs[i]).to.be.closeTo(0, 0.001);
      }
      
      // Create visualization
      const vizDiv = win.document.createElement('div');
      vizDiv.id = 'ghz-visualization';
      vizDiv.innerHTML = `
        <h4>GHZ State |Ψ⟩ = (|000⟩ + |111⟩)/√2</h4>
        <ul>
          ${probs.map((p, i) => 
            `<li>|${i.toString(2).padStart(3, '0')}⟩: ${p.toFixed(3)}</li>`
          ).join('')}
        </ul>
      `;
      win.document.body.appendChild(vizDiv);
      
      cy.get('#ghz-visualization').should('exist');
      cy.get('#ghz-visualization ul li').should('have.length', 8);
    });
  });
});
