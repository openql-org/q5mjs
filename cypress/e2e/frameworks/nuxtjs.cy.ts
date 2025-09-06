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
    Nuxt: any;
    Vue: any;
  }
}

describe('Q5M.js - Nuxt.js Integration', () => {
  beforeEach(() => {
    cy.visit('cypress/fixtures/pages/minimal.html');
    
    cy.readFile('dist/q5m.umd.js').then((umdContent: string) => {
      cy.window().then((win) => {
        // Load Q5M
        const q5mScript = win.document.createElement('script');
        q5mScript.type = 'text/javascript';
        q5mScript.textContent = umdContent;
        win.document.head.appendChild(q5mScript);
        
        // Mock Nuxt.js and Vue
        const nuxtScript = win.document.createElement('script');
        nuxtScript.textContent = `
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
                        btn.onclick = options.methods[methodName].bind(options);
                      }
                    });
                  }
                  
                  return container;
                }
              };
            }
          };
          
          window.Nuxt = {
            asyncData: function(context) {
              return {};
            },
            head: function() {
              return {
                title: 'Q5M + Nuxt.js',
                meta: [
                  { charset: 'utf-8' },
                  { name: 'description', content: 'Quantum computing with Nuxt.js' }
                ]
              };
            },
            middleware: function(context) {
              // Middleware simulation
            },
            plugins: [],
            layout: 'default'
          };
        `;
        win.document.head.appendChild(nuxtScript);
        
        expect(win.Q5M).to.exist;
        expect(win.Nuxt).to.exist;
        expect(win.Vue).to.exist;
      });
    });
  });

  it('should load Q5M in Nuxt.js environment', () => {
    cy.window().then((win) => {
      expect(win.Q5M).to.not.be.undefined;
      expect(win.Nuxt).to.not.be.undefined;
      expect(win.Vue).to.not.be.undefined;
      expect(win.Q5M.Circuit).to.be.a('function');
    });
  });

  it('should work with Nuxt.js page component', () => {
    cy.window().then((win) => {
      const { Nuxt, Vue, Q5M } = win;
      
      // Create Nuxt.js page component
      const QuantumPage = {
        name: 'QuantumPage',
        
        head: Nuxt.head,
        
        data() {
          return {
            quantumResult: 'Not executed',
            algorithm: 'Bell State'
          };
        },
        
        async asyncData(context) {
          // Simulate server-side quantum computation
          const circuit = new Q5M.Circuit(2);
          circuit.h(0).cnot(0, 1);
          
          const result = circuit.execute();
          const probs = result.state.probabilities();
          
          return {
            serverQuantumData: {
              probabilities: probs,
              description: 'Server-side Bell state generation'
            }
          };
        },
        
        methods: {
          runClientQuantum() {
            const circuit = new Q5M.Circuit(1);
            circuit.h(0);
            
            const result = circuit.execute();
            const probs = result.state.probabilities();
            
            this.quantumResult = `Superposition: |0⟩=${probs[0].toFixed(3)}, |1⟩=${probs[1].toFixed(3)}`;
            
            // Update display
            const display = win.document.querySelector('#nuxt-result');
            if (display) {
              display.textContent = this.quantumResult;
            }
          }
        },
        
        template: `
          <div id="nuxt-quantum">
            <h3>Nuxt.js + Q5M Integration</h3>
            <p>Algorithm: {{ algorithm }}</p>
            <button v-on:click="runClientQuantum" id="nuxt-btn">Run Client Quantum</button>
            <div id="nuxt-result">{{ quantumResult }}</div>
            <div id="server-data">Server data loaded</div>
          </div>
        `
      };
      
      // Simulate asyncData execution
      QuantumPage.asyncData({}).then((asyncData) => {
        Object.assign(QuantumPage.data(), asyncData);
        
        // Create Vue app with the page component
        const app = Vue.createApp(QuantumPage);
        const vueApp = app.mount('#nuxt-app');
        
        cy.get('#nuxt-quantum').should('exist');
        cy.get('#nuxt-quantum h3').should('contain', 'Nuxt.js + Q5M Integration');
        cy.get('#nuxt-btn').should('exist');
        cy.get('#nuxt-result').should('contain', 'Not executed');
        cy.get('#server-data').should('contain', 'Server data loaded');
        
        // Test client-side interaction
        cy.get('#nuxt-btn').click();
        cy.get('#nuxt-result').should('contain', 'Superposition:');
      });
    });
  });

  it('should handle Nuxt.js store integration', () => {
    cy.window().then((win) => {
      const { Vue, Q5M } = win;
      
      // Simulate Vuex store for quantum state management
      const quantumStore = {
        state: {
          quantumHistory: [],
          currentCircuit: null
        },
        
        mutations: {
          ADD_QUANTUM_RESULT(state, result) {
            state.quantumHistory = state.quantumHistory || [];
            state.quantumHistory.push(result);
          },
          SET_CURRENT_CIRCUIT(state, circuit) {
            state.currentCircuit = circuit;
          }
        },
        
        actions: {
          async runQuantumAlgorithm({ commit }, algorithmType) {
            let circuit;
            let description;
            
            switch (algorithmType) {
              case 'superposition':
                circuit = new Q5M.Circuit(1);
                circuit.h(0);
                description = 'Single qubit superposition';
                break;
              case 'entanglement':
                circuit = new Q5M.Circuit(2);
                circuit.h(0).cnot(0, 1);
                description = 'Two qubit entanglement';
                break;
              default:
                throw new Error('Unknown algorithm type');
            }
            
            const result = circuit.execute();
            const quantumResult = {
              type: algorithmType,
              description,
              probabilities: result.state.probabilities(),
              timestamp: new Date().toISOString()
            };
            
            commit('ADD_QUANTUM_RESULT', quantumResult);
            commit('SET_CURRENT_CIRCUIT', circuit);
            
            return quantumResult;
          }
        }
      };
      
      // Create Nuxt component that uses the store
      const StoreComponent = {
        data() {
          return {
            store: quantumStore,
            lastResult: null
          };
        },
        
        methods: {
          async runSuperposition() {
            const circuit = new Q5M.Circuit(1);
            circuit.h(0);
            
            const result = circuit.execute();
            const quantumResult = {
              type: 'superposition',
              description: 'Single qubit superposition',
              probabilities: result.state.probabilities(),
              timestamp: new Date().toISOString()
            };
            
            quantumStore.mutations.ADD_QUANTUM_RESULT(quantumStore.state, quantumResult);
            this.lastResult = quantumResult;
            
            const display = win.document.querySelector('#store-result');
            if (display) {
              display.textContent = `${this.lastResult.description}: ${this.lastResult.probabilities.map((p, i) => `|${i}⟩=${p.toFixed(3)}`).join(', ')}`;
            }
          },
          
          async runEntanglement() {
            const circuit = new Q5M.Circuit(2);
            circuit.h(0).cnot(0, 1);
            
            const result = circuit.execute();
            const quantumResult = {
              type: 'entanglement',
              description: 'Two qubit entanglement',
              probabilities: result.state.probabilities(),
              timestamp: new Date().toISOString()
            };
            
            quantumStore.mutations.ADD_QUANTUM_RESULT(quantumStore.state, quantumResult);
            this.lastResult = quantumResult;
            
            const display = win.document.querySelector('#store-result');
            if (display) {
              display.textContent = `${this.lastResult.description}: |00⟩=${this.lastResult.probabilities[0].toFixed(3)}, |11⟩=${this.lastResult.probabilities[3].toFixed(3)}`;
            }
          }
        },
        
        template: `
          <div id="nuxt-store">
            <h3>Nuxt.js Store Integration</h3>
            <button v-on:click="runSuperposition" id="store-superposition">Run Superposition</button>
            <button v-on:click="runEntanglement" id="store-entanglement">Run Entanglement</button>
            <div id="store-result">Click a button to run quantum algorithm</div>
          </div>
        `
      };
      
      const app = Vue.createApp(StoreComponent);
      app.mount('#store-app');
      
      cy.get('#nuxt-store').should('exist');
      cy.get('#store-superposition').should('exist');
      cy.get('#store-entanglement').should('exist');
      cy.get('#store-result').should('contain', 'Click a button');
      
      // Test store interactions
      cy.get('#store-superposition').click();
      cy.get('#store-result').should('contain', 'Single qubit superposition');
      
      cy.get('#store-entanglement').click();
      cy.get('#store-result').should('contain', 'Two qubit entanglement');
    });
  });
});
