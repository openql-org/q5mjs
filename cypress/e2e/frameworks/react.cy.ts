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
    React: any;
    ReactDOM: any;
  }
}

describe('Q5M.js - React Integration', () => {
  beforeEach(() => {
    cy.visit('cypress/fixtures/pages/minimal.html');
    
    // Load Q5M.js UMD bundle
    cy.readFile('dist/q5m.umd.js').then((umdContent: string) => {
      cy.window().then((win) => {
        // Load Q5M
        const q5mScript = win.document.createElement('script');
        q5mScript.type = 'text/javascript';
        q5mScript.textContent = umdContent;
        win.document.head.appendChild(q5mScript);
        
        // Load React (mock)
        const reactScript = win.document.createElement('script');
        reactScript.textContent = `
          window.React = {
            createElement: function(tag, props, ...children) {
              const element = document.createElement(tag);
              if (props) {
                Object.keys(props).forEach(key => {
                  if (key === 'onClick') element.onclick = props[key];
                  else if (key === 'id') element.id = props[key];
                  else element.setAttribute(key, props[key]);
                });
              }
              children.forEach(child => {
                if (typeof child === 'string') {
                  element.appendChild(document.createTextNode(child));
                } else if (child) {
                  element.appendChild(child);
                }
              });
              return element;
            },
            useState: function(initial) {
              let value = initial;
              const setValue = (newValue) => { value = newValue; };
              return [value, setValue];
            }
          };
          
          window.ReactDOM = {
            render: function(element, container) {
              container.appendChild(element);
            }
          };
        `;
        win.document.head.appendChild(reactScript);
        
        expect(win.Q5M).to.exist;
        expect(win.React).to.exist;
      });
    });
  });

  it('should load Q5M in React component', () => {
    cy.window().then((win) => {
      expect(win.Q5M).to.not.be.undefined;
      expect(win.React).to.not.be.undefined;
      expect(win.Q5M.Circuit).to.be.a('function');
    });
  });

  it('should create quantum circuit in React component', () => {
    cy.window().then((win) => {
      const { React, ReactDOM, Q5M } = win;
      
      // Create a React component that uses Q5M
      const QuantumComponent = () => {
        const circuit = new Q5M.Circuit(2);
        circuit.h(0).cnot(0, 1);
        
        const result = circuit.execute();
        const probs = result.state.probabilities();
        
        return React.createElement('div', { id: 'react-quantum' },
          React.createElement('h3', null, 'React + Q5M Integration'),
          React.createElement('p', null, `Bell State: |00⟩=${probs[0].toFixed(3)}, |11⟩=${probs[3].toFixed(3)}`)
        );
      };
      
      // Render the component
      const container = win.document.createElement('div');
      win.document.body.appendChild(container);
      ReactDOM.render(QuantumComponent(), container);
      
      cy.get('#react-quantum').should('exist');
      cy.get('#react-quantum h3').should('contain', 'React + Q5M Integration');
      cy.get('#react-quantum p').should('contain', 'Bell State:');
    });
  });

  it('should handle quantum operations with React state', () => {
    cy.window().then((win) => {
      const { React, ReactDOM, Q5M } = win;
      
      // Create interactive React component
      const InteractiveQuantum = () => {
        let circuitType = 'bell'; // Simulating React state
        
        const runCircuit = () => {
          const circuit = new Q5M.Circuit(1);
          circuit.h(0); // Superposition
          
          const result = circuit.execute();
          const probs = result.state.probabilities();
          
          // Update display
          const display = win.document.getElementById('quantum-display');
          if (display) {
            display.textContent = `Superposition: |0⟩=${probs[0].toFixed(3)}, |1⟩=${probs[1].toFixed(3)}`;
          }
        };
        
        return React.createElement('div', { id: 'interactive-quantum' },
          React.createElement('h3', null, 'Interactive Quantum Circuit'),
          React.createElement('button', { 
            onClick: runCircuit,
            id: 'run-circuit-btn'
          }, 'Run Quantum Circuit'),
          React.createElement('div', { id: 'quantum-display' }, 'Click button to run')
        );
      };
      
      // Render the component
      const container = win.document.createElement('div');
      win.document.body.appendChild(container);
      ReactDOM.render(InteractiveQuantum(), container);
      
      cy.get('#interactive-quantum').should('exist');
      cy.get('#run-circuit-btn').should('exist');
      cy.get('#quantum-display').should('contain', 'Click button to run');
      
      // Test interaction
      cy.get('#run-circuit-btn').click();
      cy.get('#quantum-display').should('contain', 'Superposition:');
    });
  });
});
