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
    Next: any;
    React: any;
  }
}

describe('Q5M.js - Next.js Integration', () => {
  beforeEach(() => {
    cy.visit('cypress/fixtures/pages/minimal.html');
    
    cy.readFile('dist/q5m.umd.js').then((umdContent: string) => {
      cy.window().then((win) => {
        // Load Q5M
        const q5mScript = win.document.createElement('script');
        q5mScript.type = 'text/javascript';
        q5mScript.textContent = umdContent;
        win.document.head.appendChild(q5mScript);
        
        // Mock Next.js and React
        const nextScript = win.document.createElement('script');
        nextScript.textContent = `
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
          
          window.Next = {
            default: function(Component) {
              return Component;
            },
            getStaticProps: function() {
              return { props: {} };
            },
            getServerSideProps: function() {
              return { props: {} };
            },
            Head: function(props) {
              const head = document.createElement('div');
              head.className = 'next-head';
              return head;
            },
            Link: function(props) {
              const link = document.createElement('a');
              link.href = props.href || '#';
              return link;
            }
          };
        `;
        win.document.head.appendChild(nextScript);
        
        expect(win.Q5M).to.exist;
        expect(win.Next).to.exist;
        expect(win.React).to.exist;
      });
    });
  });

  it('should load Q5M in Next.js environment', () => {
    cy.window().then((win) => {
      expect(win.Q5M).to.not.be.undefined;
      expect(win.Next).to.not.be.undefined;
      expect(win.React).to.not.be.undefined;
      expect(win.Q5M.Circuit).to.be.a('function');
    });
  });

  it('should work with Next.js page structure', () => {
    cy.window().then((win) => {
      const { Next, React, Q5M } = win;
      
      // Create Next.js page component
      function QuantumPage() {
        const circuit = new Q5M.Circuit(2);
        circuit.h(0).cnot(0, 1);
        
        const result = circuit.execute();
        const probs = result.state.probabilities();
        
        const runQuantumCircuit = () => {
          const newCircuit = new Q5M.Circuit(1);
          newCircuit.h(0);
          
          const newResult = newCircuit.execute();
          const newProbs = newResult.state.probabilities();
          
          const display = win.document.querySelector('#nextjs-result');
          if (display) {
            display.textContent = `Superposition: |0⟩=${newProbs[0].toFixed(3)}, |1⟩=${newProbs[1].toFixed(3)}`;
          }
        };
        
        return React.createElement('div', { id: 'nextjs-quantum' },
          React.createElement('div', { className: 'next-head' },
            React.createElement('title', {}, 'Q5M + Next.js')
          ),
          React.createElement('h3', {}, 'Next.js + Q5M Integration'),
          React.createElement('p', {}, `Bell State: |00⟩=${probs[0].toFixed(3)}, |11⟩=${probs[3].toFixed(3)}`),
          React.createElement('button', { 
            onClick: runQuantumCircuit,
            id: 'nextjs-btn'
          }, 'Run Superposition'),
          React.createElement('div', { id: 'nextjs-result' }, 'Click to run')
        );
      }
      
      // "Export" the page component (Next.js pattern)
      const Page = Next.default(QuantumPage);
      
      // Render the page
      const container = win.document.createElement('div');
      win.document.body.appendChild(container);
      container.appendChild(Page());
      
      cy.get('#nextjs-quantum').should('exist');
      cy.get('#nextjs-quantum h3').should('contain', 'Next.js + Q5M Integration');
      cy.get('#nextjs-quantum p').should('contain', 'Bell State:');
      cy.get('#nextjs-btn').should('exist');
      cy.get('#nextjs-result').should('contain', 'Click to run');
      
      // Test interaction
      cy.get('#nextjs-btn').click();
      cy.get('#nextjs-result').should('contain', 'Superposition:');
    });
  });

  it('should handle static generation with quantum data', () => {
    cy.window().then((win) => {
      const { Next, Q5M } = win;
      
      // Simulate getStaticProps
      const getStaticProps = async () => {
        const circuit = new Q5M.Circuit(3);
        circuit.h(0).cnot(0, 1).cnot(0, 2);
        
        const result = circuit.execute();
        const probs = result.state.probabilities();
        
        return {
          props: {
            quantumState: {
              type: 'GHZ',
              probabilities: probs,
              description: 'Three-qubit GHZ state'
            }
          }
        };
      };
      
      // Create static page
      function StaticQuantumPage(props) {
        const container = win.document.createElement('div');
        container.id = 'static-quantum-page';
        container.innerHTML = `
          <h3>Static Quantum Data (Next.js)</h3>
          <h4>${props.quantumState.description}</h4>
          <ul>
            ${props.quantumState.probabilities.map((p, i) => 
              `<li>|${i.toString(2).padStart(3, '0')}⟩: ${p.toFixed(3)}</li>`
            ).join('')}
          </ul>
        `;
        return container;
      }
      
      // Generate static props and render
      getStaticProps().then(({ props }) => {
        const page = StaticQuantumPage(props);
        win.document.body.appendChild(page);
        
        cy.get('#static-quantum-page').should('exist');
        cy.get('#static-quantum-page h4').should('contain', 'GHZ state');
        cy.get('#static-quantum-page ul li').should('have.length', 8);
        cy.get('#static-quantum-page ul li').first().should('contain', '|000⟩');
      });
    });
  });
});
