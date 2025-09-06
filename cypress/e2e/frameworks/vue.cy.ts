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
    Vue: any;
  }
}

describe('Q5M.js - Vue.js Integration', () => {
  beforeEach(() => {
    cy.visit('cypress/fixtures/pages/minimal.html');
    
    // Load Q5M.js and Vue.js
    cy.readFile('dist/q5m.umd.js').then((umdContent: string) => {
      cy.window().then((win) => {
        // Load Q5M
        const q5mScript = win.document.createElement('script');
        q5mScript.type = 'text/javascript';
        q5mScript.textContent = umdContent;
        win.document.head.appendChild(q5mScript);
        
        // Load Vue (mock)
        const vueScript = win.document.createElement('script');
        vueScript.textContent = `
          window.Vue = {
            createApp: function(options) {
              return {
                mount: function(selector) {
                  const container = document.querySelector(selector) || document.createElement('div');
                  container.id = selector.replace('#', '');
                  document.body.appendChild(container);
                  
                  if (options.data) {
                    const data = options.data();
                    Object.keys(data).forEach(key => {
                      container.setAttribute('data-' + key, data[key]);
                    });
                  }
                  
                  if (options.template) {
                    container.innerHTML = options.template;
                  }
                  
                  if (options.methods) {
                    Object.keys(options.methods).forEach(methodName => {
                      const btn = container.querySelector('[v-on\\\\:click="' + methodName + '"]');
                      if (btn) {
                        btn.onclick = options.methods[methodName];
                      }
                    });
                  }
                  
                  return container;
                }
              };
            }
          };
        `;
        win.document.head.appendChild(vueScript);
        
        expect(win.Q5M).to.exist;
        expect(win.Vue).to.exist;
      });
    });
  });

  it('should load Q5M in Vue component', () => {
    cy.window().then((win) => {
      expect(win.Q5M).to.not.be.undefined;
      expect(win.Vue).to.not.be.undefined;
      expect(win.Q5M.Circuit).to.be.a('function');
    });
  });

  it('should create quantum circuit in Vue component', () => {
    cy.window().then((win) => {
      const { Vue, Q5M } = win;
      
      // Create Vue app with quantum functionality
      const app = Vue.createApp({
        data() {
          return {
            circuitResult: 'Not executed',
            probabilities: []
          };
        },
        methods: {
          runQuantumCircuit() {
            const circuit = new Q5M.Circuit(2);
            circuit.h(0).cnot(0, 1);
            
            const result = circuit.execute();
            const probs = result.state.probabilities();
            
            this.probabilities = probs;
            this.circuitResult = `Bell State: |00⟩=${probs[0].toFixed(3)}, |11⟩=${probs[3].toFixed(3)}`;
            
            // Update display manually since we're mocking Vue
            const display = win.document.querySelector('#circuit-result');
            if (display) {
              display.textContent = this.circuitResult;
            }
          }
        },
        template: `
          <div id="vue-quantum">
            <h3>Vue + Q5M Integration</h3>
            <button v-on:click="runQuantumCircuit" id="vue-run-btn">Run Circuit</button>
            <div id="circuit-result">{{ circuitResult }}</div>
          </div>
        `
      });
      
      const vueApp = app.mount('#vue-app');
      
      cy.get('#vue-quantum').should('exist');
      cy.get('#vue-quantum h3').should('contain', 'Vue + Q5M Integration');
      cy.get('#vue-run-btn').should('exist');
    });
  });

  it('should handle reactive quantum data in Vue', () => {
    cy.window().then((win) => {
      const { Vue, Q5M } = win;
      
      const app = Vue.createApp({
        data() {
          return {
            qubits: 1,
            gateType: 'H',
            quantumData: null
          };
        },
        methods: {
          createSuperposition() {
            const circuit = new Q5M.Circuit(1);
            circuit.h(0); // Hadamard gate
            
            const result = circuit.execute();
            const probs = result.state.probabilities();
            
            this.quantumData = {
              state: 'superposition',
              probabilities: probs
            };
            
            // Update display
            const display = win.document.querySelector('#quantum-state');
            if (display) {
              display.innerHTML = `
                <h4>Quantum Superposition</h4>
                <p>|0⟩ probability: ${probs[0].toFixed(3)}</p>
                <p>|1⟩ probability: ${probs[1].toFixed(3)}</p>
              `;
            }
          }
        },
        template: `
          <div id="vue-reactive">
            <h3>Reactive Quantum State</h3>
            <button v-on:click="createSuperposition" id="superposition-btn">Create Superposition</button>
            <div id="quantum-state">Click to create superposition</div>
          </div>
        `
      });
      
      app.mount('#reactive-app');
      
      cy.get('#vue-reactive').should('exist');
      cy.get('#superposition-btn').should('exist');
      cy.get('#quantum-state').should('contain', 'Click to create');
      
      // Test reactivity
      cy.get('#superposition-btn').click();
      cy.get('#quantum-state h4').should('contain', 'Quantum Superposition');
      cy.get('#quantum-state').should('contain', 'probability:');
    });
  });
});
