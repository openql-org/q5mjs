# Q5M.js Notebook Gallery

A simple gallery for viewing Jupyter notebook examples that demonstrate quantum computing with Q5M.js.

## Quick Start

### Option 1: Local Server (Recommended)
```bash
# From project root directory
npx serve .
# Then visit: http://localhost:3000/examples/browser/notebook/

# Or with Python
python -m http.server 8000
# Then visit: http://localhost:8000/examples/browser/notebook/
```

### Option 2: Direct File Access
1. Open `index.html` directly in your browser
2. Click on any notebook to view it (will show sample content)
3. For full notebook content, use Option 1

## Structure

```
examples/browser/notebook/
├── index.html                   # Simple notebook gallery
├── notebook-viewer.html         # Jupyter notebook viewer
├── assets/css/
│   └── jupyter-theme.css       # Notebook styling
└── notebooks/                  # Example notebooks
    ├── tutorials/              # Learning materials
    ├── algorithms/             # Quantum algorithms
    ├── visualization/          # Visual demonstrations
    └── advanced/               # Advanced topics
```

## Notebook Categories

### Tutorials
- **01-quantum-basics.ipynb**: Introduction to qubits, superposition, and measurement
- **02-single-qubit-gates.ipynb**: X, Y, Z, H gates and applications
- **03-multi-qubit-systems.ipynb**: Entanglement and Bell states
- **04-measurements.ipynb**: Measurement bases and Born rule

### Algorithms  
- **01-grovers-search.ipynb**: Grover's quantum search algorithm
- **02-quantum-fourier-transform.ipynb**: QFT implementation
- **03-phase-estimation.ipynb**: Phase estimation algorithm

### Visualization
- **01-circuit-rendering.ipynb**: Circuit visualization methods
- **02-state-visualization.ipynb**: Quantum state displays
- **03-bloch-sphere.ipynb**: 3D qubit state visualization

### Advanced
- **01-custom-gates.ipynb**: Creating custom quantum gates
- **02-noise-models.ipynb**: Modeling quantum noise
- **03-quantum-error-correction.ipynb**: Basic error correction

## Features

### Gallery (`index.html`)
- Clean, organized display of all notebooks
- Categories by topic and difficulty
- Direct links to notebook viewer

### Viewer (`notebook-viewer.html`)
- Beautiful rendering of .ipynb files
- Syntax highlighting for code
- Math equation support with MathJax
- Download and share functionality
- Responsive design for all devices

## Technical Details

- **No Build Process**: Open files directly in browser
- **CDN Dependencies**: MathJax, highlight.js loaded from CDN
- **Sample Data**: Notebooks include sample content for demonstration
- **Cross-Platform**: Works on all modern browsers

## Usage

### Viewing Notebooks
Simply open `index.html` in your browser and click on any notebook to view it. The viewer will display:
- Formatted markdown cells with math equations
- Syntax-highlighted code cells
- Sample outputs and results
- Notebook metadata

### Adding New Notebooks
1. Create a new `.ipynb` file in the appropriate category folder
2. Follow the standard Jupyter notebook format
3. Add the notebook entry to `index.html`

## Sample Content

The included notebooks contain example Q5M.js code demonstrating:

```javascript
// Example from quantum-basics.ipynb
const { Circuit } = Q5M;

const circuit = new Circuit();
circuit.addQubit();
circuit.H(0); // Apply Hadamard gate

console.log('Quantum state:', circuit.state().toString());
```

This serves as a foundation for learning quantum programming concepts with Q5M.js.

---

**Start exploring quantum computing by opening `index.html`**