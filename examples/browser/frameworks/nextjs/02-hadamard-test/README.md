# Next.js Hadamard Test Example

Interactive demonstration of the quantum Hadamard test for phase estimation using Next.js with SSR compatibility and Q5M.js.

## Features

- **Hadamard Test Protocol**: Complete implementation of the quantum algorithm
- **Phase Estimation**: Real-time phase estimation through measurement statistics
- **Interactive Controls**: Adjustable phase parameters and gate selection
- **Circuit Visualization**: Visual representation of the quantum circuit
- **Measurement Analysis**: Statistical convergence tracking over multiple runs
- **SSR Compatible**: Proper server-side rendering with client-side quantum operations

## Algorithm Overview

The Hadamard test is a fundamental quantum algorithm used to estimate the real part of the overlap ⟨ψ|U|ψ⟩ between a quantum state |ψ⟩ and its evolution under a unitary operator U.

### Protocol Steps
1. **Initialize**: Prepare ancilla in |+⟩ and target in eigenstate |ψ⟩
2. **Controlled Operation**: Apply controlled-U with ancilla as control
3. **Interference**: Apply final Hadamard to create interference
4. **Measurement**: Measure ancilla to extract phase information

### Mathematical Foundation
- **Measurement Probability**: P(|0⟩) = (1 + cos(φ))/2
- **Phase Estimation**: φ = arccos(2P(|0⟩) - 1)
- **Phase Kickback**: Eigenvalue e^(iφ) affects control qubit state

## Architecture

### Next.js Integration
```javascript
// SSR-safe dynamic import
const HadamardTest = dynamic(() => import('../components/HadamardTest'), {
  ssr: false,
  loading: () => <LoadingComponent />
});
```

### Quantum Library Loading
```javascript
// Client-side only library import
let Q5M;
if (typeof window !== 'undefined') {
  import('../../../../dist/q5m.min.js').then((module) => {
    Q5M = window.Q5M;
  });
}
```

### State Management
```javascript
const [phase, setPhase] = useState(1.57); // π/2 default
const [gateType, setGateType] = useState('phase');
const [prob0, setProb0] = useState(0.5);
const [measurementHistory, setMeasurementHistory] = useState([]);
```

## Files Structure

```
02-hadamard-test/
├── pages/
│   └── index.js              # Main page with algorithm setup
├── components/
│   └── HadamardTest.js       # Interactive Hadamard test component
├── styles/
│   └── hadamard.module.css   # Advanced CSS with animations
├── next.config.js            # Optimized webpack configuration
├── package.json              # Dependencies with TypeScript support
└── README.md                 # This comprehensive documentation
```

## Installation

```bash
# Navigate to the example directory
cd examples/browser/frameworks/nextjs/02-hadamard-test

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start

# Type checking (if using TypeScript)
npm run type-check
```

## Interactive Features

### Phase Control
- **Custom Phase**: Adjustable φ parameter from 0 to 2π
- **Preset Gates**: Z, S, T gates with fixed phases
- **Real-time Updates**: Immediate circuit recalculation

### Gate Selection
- **Z Gate**: π phase flip (Pauli-Z operation)
- **S Gate**: π/2 phase rotation (√Z gate)
- **T Gate**: π/4 phase rotation (⁴√Z gate)
- **Phase Gate**: Custom e^(iφ) rotation

### Measurement Analysis
```javascript
const runMultipleMeasurements = async () => {
  for (let i = 0; i < 1000; i++) {
    const circuit = createHadamardTestCircuit();
    const measurement = circuit.execute().state.measure([0]);
    // Statistical analysis...
  }
};
```

## Quantum Circuit Implementation

### Circuit Construction
```javascript
const circuit = new Q5M.Circuit(2);

// Prepare target in eigenstate |1⟩
circuit.x(1);

// Hadamard test protocol
circuit.h(0);                    // Create superposition
circuit.cp(0, 1, phase);         // Controlled phase operation
circuit.h(0);                    // Create interference

// Measurement
const result = circuit.execute();
const probabilities = result.state.probabilities();
```

### Controlled Gates
- **CZ**: Controlled-Z for π phase kickback
- **CS**: Controlled-S for π/2 phase kickback  
- **CT**: Controlled-T for π/4 phase kickback
- **CP**: Controlled-Phase for arbitrary φ

## Educational Components

### Algorithm Theory
- **Quantum Interference**: How superposition enables phase detection
- **Eigenvalue Problems**: Connection to linear algebra concepts
- **Phase Kickback**: Mechanism of controlled operation effects

### Statistical Analysis
- **Convergence Visualization**: How estimates improve with measurements
- **Error Analysis**: Comparison between estimated and true phases
- **Confidence Intervals**: Statistical significance of results

### Circuit Visualization
```css
.circuitDisplay {
  /* Visual quantum circuit representation */
  display: flex;
  align-items: center;
  gap: 15px;
}

.gate {
  /* Quantum gate styling */
  background: gradient(135deg, #4ECDC4, #45B7D1);
  border-radius: 8px;
}
```

## Performance Optimizations

### Bundle Splitting
- Quantum library loaded only when needed
- CSS modules for optimized styling
- Dynamic imports for component lazy loading

### Measurement Efficiency
```javascript
// Optimized measurement loop with async updates
const measurementBatch = 50;
for (let i = 0; i < 1000; i += measurementBatch) {
  const batchResults = await runMeasurementBatch(measurementBatch);
  updateUI(batchResults);
  await new Promise(resolve => setTimeout(resolve, 5));
}
```

### Memory Management
- Efficient circuit creation and disposal
- Quantum state cleanup between measurements
- Minimal DOM manipulations for smooth animations

## Advanced Features

### Measurement Convergence Tracking
```javascript
const history = [];
history.push({
  measurement: i + 1,
  prob0: currentProb0,
  estimatedPhase: Math.acos(2 * currentProb0 - 1)
});
```

### Phase Error Analysis
```javascript
const getPhaseError = () => {
  const truePhase = getTruePhase(gateType, phase);
  const estimatedPhase = Math.acos(2 * prob0 - 1);
  return Math.abs(truePhase - estimatedPhase);
};
```

### Real-time Circuit Updates
- Automatic recalculation on parameter changes
- Smooth transitions between gate types
- Progressive measurement accumulation

## Browser Compatibility

- **Modern Browsers**: Full WebGL and Canvas support
- **Mobile Devices**: Touch-optimized controls
- **Accessibility**: Screen reader compatible
- **Performance**: 60fps animations on supported devices

## Integration Examples

### Custom Hook Usage
```javascript
function useHadamardTest(initialPhase = Math.PI/2) {
  const [phase, setPhase] = useState(initialPhase);
  const [results, setResults] = useState(null);
  
  const runTest = useCallback(() => {
    // Hadamard test implementation
  }, [phase]);
  
  return { phase, setPhase, results, runTest };
}
```

### API Integration
```javascript
// pages/api/quantum/hadamard-test.js
export default function handler(req, res) {
  // Server-side quantum computation endpoint
  const { phase, gateType, iterations } = req.body;
  // Process and return results
}
```

Perfect for learning advanced quantum algorithms, phase estimation techniques, and modern Next.js development patterns with proper SSR handling and client-side quantum computing.