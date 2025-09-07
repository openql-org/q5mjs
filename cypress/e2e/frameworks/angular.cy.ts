// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
/// <reference types="cypress" />

interface Q5MLibrary {
  Circuit: new (numQubits: number) => Q5MCircuit;
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
    ng: any;
  }
}

describe('Q5M.js - Angular Integration', () => {
  beforeEach(() => {
    cy.visit('cypress/fixtures/pages/minimal.html');
    
    cy.readFile('dist/q5m.umd.js').then((umdContent: string) => {
      cy.window().then((win) => {
        // Load Q5M
        const q5mScript = win.document.createElement('script');
        q5mScript.type = 'text/javascript';
        q5mScript.textContent = umdContent;
        win.document.head.appendChild(q5mScript);
        
        // Mock Angular-like API
        const ngScript = win.document.createElement('script');
        ngScript.textContent = `
          window.ng = {
            Component: function(config) {
              return function(constructor) {
                constructor.template = config.template;
                constructor.selector = config.selector;
                return constructor;
              };
            }
          };
        `;
        win.document.head.appendChild(ngScript);
        
        expect(win.Q5M).to.exist;
        expect(win.ng).to.exist;
      });
    });
  });

  it('should load Q5M in Angular environment', () => {
    cy.window().then((win) => {
      expect(win.Q5M).to.not.be.undefined;
      expect(win.ng).to.not.be.undefined;
      expect(win.Q5M.Circuit).to.be.a('function');
    });
  });

  it('should work with Angular-like component structure', () => {
    cy.window().then((win) => {
      const { ng, Q5M } = win;
      
      // Create Angular-like component
      @ng.Component({
        selector: 'quantum-component',
        template: `
          <div id="angular-quantum">
            <h3>Angular + Q5M Integration</h3>
            <button id="ng-run-btn">Execute Quantum Circuit</button>
            <div id="ng-result">Ready</div>
          </div>
        `
      })
      class QuantumComponent {
        runQuantumCircuit() {
          const circuit = new Q5M.Circuit(2);
          circuit.h(0).cnot(0, 1);
          
          const result = circuit.execute();
          const probs = result.state.probabilities();
          
          // Update DOM (simulating Angular data binding)
          const resultElement = win.document.querySelector('#ng-result');
          if (resultElement) {
            resultElement.textContent = `Bell State: |00⟩=${probs[0].toFixed(3)}, |11⟩=${probs[3].toFixed(3)}`;
          }
        }
      }
      
      // "Bootstrap" the component
      const component = new QuantumComponent();
      const container = win.document.createElement('div');
      container.innerHTML = QuantumComponent.template;
      win.document.body.appendChild(container);
      
      // Wire up event handlers
      const button = container.querySelector('#ng-run-btn');
      if (button) {
        button.addEventListener('click', () => component.runQuantumCircuit());
      }
      
      cy.get('#angular-quantum').should('exist');
      cy.get('#angular-quantum h3').should('contain', 'Angular + Q5M Integration');
      cy.get('#ng-run-btn').should('exist');
      cy.get('#ng-result').should('contain', 'Ready');
      
      // Test interaction
      cy.get('#ng-run-btn').click();
      cy.get('#ng-result').should('contain', 'Bell State:');
    });
  });

  it('should handle quantum state management', () => {
    cy.window().then((win) => {
      const { Q5M } = win;
      
      // Simulate Angular service for quantum operations
      class QuantumService {
        createSuperposition() {
          const circuit = new Q5M.Circuit(1);
          circuit.h(0);
          
          const result = circuit.execute();
          return result.state.probabilities();
        }
        
        createEntanglement() {
          const circuit = new Q5M.Circuit(2);
          circuit.h(0).cnot(0, 1);
          
          const result = circuit.execute();
          return result.state.probabilities();
        }
      }
      
      const quantumService = new QuantumService();
      
      // Create component that uses the service
      const serviceContainer = win.document.createElement('div');
      serviceContainer.id = 'quantum-service-test';
      serviceContainer.innerHTML = `
        <h3>Quantum Service Test</h3>
        <button id="test-superposition">Test Superposition</button>
        <button id="test-entanglement">Test Entanglement</button>
        <div id="service-result">No operations performed</div>
      `;
      win.document.body.appendChild(serviceContainer);
      
      // Wire up service calls
      serviceContainer.querySelector('#test-superposition')?.addEventListener('click', () => {
        const probs = quantumService.createSuperposition();
        const resultEl = serviceContainer.querySelector('#service-result');
        if (resultEl) {
          resultEl.textContent = `Superposition: |0⟩=${probs[0].toFixed(3)}, |1⟩=${probs[1].toFixed(3)}`;
        }
      });
      
      serviceContainer.querySelector('#test-entanglement')?.addEventListener('click', () => {
        const probs = quantumService.createEntanglement();
        const resultEl = serviceContainer.querySelector('#service-result');
        if (resultEl) {
          resultEl.textContent = `Entanglement: |00⟩=${probs[0].toFixed(3)}, |11⟩=${probs[3].toFixed(3)}`;
        }
      });
      
      cy.get('#quantum-service-test').should('exist');
      cy.get('#test-superposition').should('exist');
      cy.get('#test-entanglement').should('exist');
      
      // Test superposition
      cy.get('#test-superposition').click();
      cy.get('#service-result').should('contain', 'Superposition:');
      
      // Test entanglement  
      cy.get('#test-entanglement').click();
      cy.get('#service-result').should('contain', 'Entanglement:');
    });
  });
});
