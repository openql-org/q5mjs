# Jupyter Notebook Integration

Q5M.js provides rich visualization support for Jupyter notebooks, enabling interactive quantum circuit exploration and state visualization.

## Features

- **Automatic Rich Display**: Quantum circuits and states automatically render with rich visualizations in Jupyter
- **Multiple Output Formats**: HTML, SVG, LaTeX, and plain text representations
- **Interactive Widgets**: Clickable buttons, hover tooltips, and interactive controls
- **State Visualization**: Probability distributions, state vectors, and measurement results
- **Export Integration**: Direct export to OpenQASM, Qiskit, and other formats

## Quick Start

```javascript
// In a Jupyter notebook cell
const { Circuit, QubitState, NotebookRenderer } = require('q5m');

// Enable notebook mode (optional - for enhanced features)
NotebookRenderer.enableNotebookMode();

// Create a quantum circuit
const circuit = new Circuit(2);
circuit.h(0).cnot(0, 1);

// Display automatically renders rich visualization
circuit  // Shows interactive circuit diagram

// Execute and display results
const result = circuit.execute();
const state = result.state;
state    // Shows probability distribution
```

## Display Methods

Q5M.js implements Jupyter's display protocol with the following methods:

### Circuit Display

```javascript
// Automatic display (just evaluate the circuit)
circuit

// Specific format methods
circuit._repr_html_()     // Interactive HTML widget
circuit._repr_svg_()      // SVG circuit diagram
circuit._repr_latex_()    // LaTeX representation
circuit._repr_mimebundle_() // All formats in MIME bundle

// Notebook helper
circuit.toNotebook()      // Returns NotebookOutput object
```

### State Display

```javascript
const state = circuit.run();

// Automatic display shows probability distribution
state

// Specific formats
state._repr_html_()       // Probability chart and state info
state._repr_latex_()      // State vector in LaTeX (small states)
state._repr_json_()       // JSON data representation
state.toNotebook()        // NotebookOutput object
```

## Rendering Options

Customize the display with rendering options:

```javascript
const output = NotebookRenderer.renderCircuit(circuit, {
  interactive: true,      // Enable interactive controls
  theme: 'dark',         // 'light', 'dark', or 'auto'
});

const stateOutput = NotebookRenderer.renderState(state, {
  showStateVector: true,    // Display state vector
  showMeasurements: true,   // Show measurement probabilities
  maxQubitDisplay: 5,       // Limit display for large states
});
```

## Interactive Features

In Jupyter notebooks, circuits include:

- **Run Button**: Execute the circuit directly from the display
- **Copy Buttons**: Copy OpenQASM or other formats to clipboard
- **Hover Information**: Gate details on hover
- **Zoom Controls**: For large circuits

## Example: Bell State

```javascript
// Create Bell state
const bell = new Circuit(2);
bell.h(0).cnot(0, 1);

// Display circuit (automatic in Jupyter)
bell

// Run and display state
const result = bell.execute();
const bellState = result.state;
bellState  // Shows |00⟩ and |11⟩ with 50% probability each
```

## Example: Grover's Algorithm

```javascript
// 2-qubit Grover's algorithm
const grover = new Circuit(2);

// Oracle for |11⟩
grover.cz(0, 1);

// Diffusion operator
grover.h(0).h(1)
      .x(0).x(1)
      .cz(0, 1)
      .x(0).x(1)
      .h(0).h(1);

// Display shows the complete circuit
grover

// Run and visualize result
const result = grover.execute();
const groverState = result.state;
groverState  // Shows amplified probability for |11⟩
```

## State Visualization

For quantum states, the notebook display includes:

1. **Probability Bar Chart**: Visual representation of measurement probabilities
2. **State Vector**: Complex amplitudes for small states (≤3 qubits)
3. **Basis Labels**: Clear labeling of computational basis states
4. **Statistics**: State dimensions and properties

## Export Integration

Export circuits directly from notebook displays:

```javascript
// Export to various formats
const openqasm = circuit.toOpenQASM({ includeMeasurements: true });
const json = circuit.toJSON();

// Or use the interactive buttons in the display
```

## Large Circuit Handling

For circuits with many qubits or gates:

```javascript
const largeCircuit = new Circuit(10);
// ... add many gates ...

// Optimized display for large circuits
const output = NotebookRenderer.renderCircuit(largeCircuit, {
  interactive: false,  // Disable interactivity for performance
});
```

## Custom Themes

Match your notebook theme:

```javascript
// Dark theme
NotebookRenderer.renderCircuit(circuit, { theme: 'dark' });

// Light theme
NotebookRenderer.renderCircuit(circuit, { theme: 'light' });

// Auto-detect from notebook
NotebookRenderer.renderCircuit(circuit, { theme: 'auto' });
```

## Technical Details

### MIME Types

Q5M.js provides the following MIME types:

- `text/plain`: ASCII representation
- `text/html`: Interactive HTML widget
- `image/svg+xml`: SVG circuit diagram
- `text/latex`: LaTeX for academic papers
- `application/json`: Structured data

### Browser Compatibility

The notebook integration works with:
- JupyterLab 3.x and 4.x
- Jupyter Notebook 6.x and 7.x
- Google Colab
- Observable notebooks
- VS Code Jupyter extension

### Performance

- Circuits up to 20 qubits render smoothly
- States up to 10 qubits show full details
- Larger systems use optimized sparse representations

## Troubleshooting

### Display Not Working

If rich display isn't working:

```javascript
// Check if in Jupyter environment
NotebookRenderer.isJupyterEnvironment()  // Should return true

// Enable notebook mode explicitly
NotebookRenderer.enableNotebookMode();
```

### Large State Display

For large quantum states:

```javascript
// Limit the display size
NotebookRenderer.renderState(state, {
  maxQubitDisplay: 3,  // Only show details for 3 qubits
});
```

### Custom Output

Get specific output format:

```javascript
const output = circuit.toNotebook();
output.toHTML();   // HTML only
output.toSVG();    // SVG only
output.toText();   // Plain text
```