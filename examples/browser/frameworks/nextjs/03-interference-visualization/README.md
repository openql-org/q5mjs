# Next.js Quantum Interference Visualization

Interactive demonstration of quantum interference patterns and wave-particle duality using Next.js with real-time canvas animations and Q5M.js.

## Features

- **Real-time Wave Animation**: Smooth 60fps canvas rendering with HTML5 Canvas API
- **Interactive Parameters**: Live adjustment of phase, amplitude, and animation speed
- **Multiple Experiments**: Double-slit, Mach-Zehnder, Ramsey fringes, and custom superposition
- **High DPI Support**: Optimized for retina displays and high-resolution screens
- **Quantum State Analysis**: Real-time amplitude and probability calculations
- **SSR Compatible**: Proper server-side rendering with client-side canvas operations

## Physics Demonstrations

### Double-Slit Experiment
- **Wave-Particle Duality**: Shows how quantum particles exhibit both wave and particle properties
- **Interference Patterns**: Demonstrates constructive and destructive interference
- **Phase Relationships**: Visualizes how relative phase affects interference visibility

### Mach-Zehnder Interferometer
- **Beam Splitting**: Symmetric superposition with controllable phase shifts
- **Path Interference**: How different optical paths create interference patterns
- **Quantum Coherence**: Role of phase relationships in quantum interference

### Ramsey Fringes
- **Time-Domain Interference**: Separated oscillating fields creating interference
- **Atomic Clock Physics**: Fundamental principle behind precision timekeeping
- **Phase Accumulation**: How phase differences develop over time

### Custom Superposition
- **Arbitrary States**: User-defined amplitude and phase combinations
- **Parameter Exploration**: Full control over quantum state parameters
- **Educational Tool**: Understanding superposition principles

## Architecture

### Next.js Integration
```javascript
// SSR-safe dynamic import for canvas components
const InterferenceVisualization = dynamic(() => import('../components/InterferenceVisualization'), {
  ssr: false,
  loading: () => <LoadingComponent />
});
```

### Canvas Animation System
```javascript
// High-performance animation loop
const animate = useCallback(() => {
  if (isAnimating) {
    timeRef.current += 0.03;
    drawWavePattern();
  }
  animationIdRef.current = requestAnimationFrame(animate);
}, [drawWavePattern, isAnimating]);
```

### Quantum State Management
```javascript
// Real-time quantum circuit execution
const createQuantumState = useCallback(() => {
  const circuit = new Q5M.Circuit(1);
  const theta = Math.acos(amplitudeRatio);
  circuit.ry(0, 2 * theta);
  if (Math.abs(phase) > 0.01) {
    circuit.rz(0, phase);
  }
  const result = circuit.execute();
  setQuantumState(result.state);
}, [amplitudeRatio, relativePhase]);
```

## Files Structure

```
03-interference-visualization/
├── pages/
│   └── index.js                    # Main page with SEO optimization
├── components/
│   └── InterferenceVisualization.js # Interactive canvas component
├── styles/
│   └── interference.module.css     # Advanced styling with animations
├── next.config.js                  # Canvas and animation optimizations
├── package.json                    # Performance-focused dependencies
└── README.md                       # This comprehensive documentation
```

## Installation

```bash
# Navigate to the example directory
cd examples/browser/frameworks/nextjs/03-interference-visualization

# Install dependencies
npm install

# Start development server with hot reloading
npm run dev

# Build optimized production version
npm run build
npm start

# Analyze bundle size
npm run analyze

# Clean build artifacts
npm run clean
```

## Canvas Implementation

### High-DPI Rendering
```javascript
// Optimize for high-resolution displays
const canvas = canvasRef.current;
const rect = canvas.getBoundingClientRect();
const dpr = window.devicePixelRatio || 1;
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
canvas.getContext('2d').scale(dpr, dpr);
```

### Wave Equation Implementation
```javascript
// Real-time wave interference calculation
const drawWavePattern = useCallback(() => {
  const amplitude1 = amplitudeRatio * 60;
  const amplitude2 = Math.sqrt(1 - amplitudeRatio * amplitudeRatio) * 60;
  const phase = relativePhase;
  const timeOffset = timeRef.current * animationSpeed;
  
  for (let x = 0; x < width; x++) {
    const y1 = amplitude1 * Math.sin(0.015 * x + timeOffset);
    const y2 = amplitude2 * Math.sin(0.015 * x + timeOffset + phase);
    const yTotal = centerY + y1 + y2;
    // Draw interference pattern...
  }
}, [amplitudeRatio, relativePhase, animationSpeed]);
```

### Performance Optimizations
- **RequestAnimationFrame**: Smooth 60fps animations
- **Canvas Optimization**: Efficient drawing operations
- **Memory Management**: Proper cleanup of animation loops
- **High DPI Support**: Crisp rendering on all displays

## Interactive Controls

### Wave Parameters
```javascript
// Real-time parameter adjustment
const [relativePhase, setRelativePhase] = useState(0);     // 0 to 2π
const [amplitudeRatio, setAmplitudeRatio] = useState(0.7); // 0 to 1
const [animationSpeed, setAnimationSpeed] = useState(1.5); // 0.5x to 3x
```

### Experiment Selection
- **One-Click Setup**: Preset parameters for each experiment
- **Smooth Transitions**: Animated parameter changes
- **Educational Context**: Detailed explanations for each setup

### Animation Controls
- **Play/Pause**: Toggle animation state
- **Speed Control**: Adjust animation frame rate
- **Real-time Updates**: Immediate response to parameter changes

## Quantum Physics Education

### Mathematical Foundations
```javascript
// Wave function representation
const getWaveFunction = () => {
  switch (currentExperiment) {
    case 'double-slit':
      return `|ψ⟩ = α|path1⟩ + βe^(iδ)|path2⟩`;
    case 'mach-zehnder':
      return `|ψ⟩ = (1/√2)(|0⟩ + e^(iδ)|1⟩)`;
    // ... other experiments
  }
};
```

### Interference Conditions
- **Constructive Interference**: δ = 2nπ (waves in phase)
- **Destructive Interference**: δ = (2n+1)π (waves out of phase)
- **Visibility**: V = (I_max - I_min)/(I_max + I_min)

### Amplitude Analysis
```javascript
// Complex amplitude visualization
const displayAmplitudes = getDisplayAmplitudes();
{displayAmplitudes.map((amp, index) => (
  <div className={styles.amplitudeItem}>
    <div className={styles.amplitudeCircle}>
      <div 
        className={styles.phaseIndicator} 
        style={{
          transform: `rotate(${amp.phase}rad)`,
          height: `${amp.magnitude * 40}px`
        }}
      />
    </div>
    <div>{formatComplex(amp)}</div>
  </div>
))}
```

## Performance Features

### Bundle Optimization
```javascript
// next.config.js optimizations
config.optimization = {
  splitChunks: {
    cacheGroups: {
      quantum: {
        test: /[\\/]q5m/,
        name: 'quantum-lib',
        priority: 30,
      },
      animations: {
        test: /[\\/](canvas|animation|webgl)/,
        name: 'animation-lib',
        priority: 25,
      },
    },
  },
};
```

### Runtime Performance
- **React 18 Concurrent Features**: Smooth user interactions
- **Canvas Memory Management**: Efficient graphics operations
- **Animation Optimization**: RequestAnimationFrame scheduling
- **State Updates**: Batched quantum calculations

### Browser Compatibility
- **Modern Browsers**: Full Canvas API support
- **Mobile Devices**: Touch-optimized controls
- **High DPI Displays**: Retina-ready rendering
- **Performance Scaling**: Adaptive quality based on device capabilities

## Advanced Features

### Wave Interference Analysis
```javascript
// Real-time interference pattern calculation
for (let x = 0; x < width; x += 20) {
  const y1 = amplitude1 * Math.sin(0.015 * x + timeOffset);
  const y2 = amplitude2 * Math.sin(0.015 * x + timeOffset + phase);
  const totalAmplitude = Math.abs(y1 + y2);
  
  if (totalAmplitude > (amplitude1 + amplitude2) * 0.8) {
    // Constructive interference - highlight in green
  } else if (totalAmplitude < (amplitude1 + amplitude2) * 0.3) {
    // Destructive interference - highlight in red
  }
}
```

### Phase Visualization
```javascript
// Visual phase indicators
<div 
  className={styles.phaseIndicator} 
  style={{
    transform: `rotate(${amp.phase}rad)`,
    height: `${amp.magnitude * 40}px`
  }}
/>
```

### Educational Enhancements
- **Interactive Tooltips**: Contextual physics explanations
- **Parameter Relationships**: How changes affect interference
- **Real-time Calculations**: Live probability and amplitude updates
- **Visual Feedback**: Color-coded interference regions

## Integration Examples

### Custom Hook Pattern
```javascript
function useQuantumInterference() {
  const [state, setState] = useState(null);
  const [parameters, setParameters] = useState({
    phase: 0,
    amplitude: 0.7,
    speed: 1.5
  });
  
  const updateQuantumState = useCallback(() => {
    // Quantum state calculation
  }, [parameters]);
  
  return { state, parameters, setParameters, updateQuantumState };
}
```

### API Integration
```javascript
// pages/api/quantum/interference.js
export default function handler(req, res) {
  const { phase, amplitude, experiment } = req.body;
  // Server-side quantum calculations for complex scenarios
  res.json({ 
    probabilities: calculateProbabilities(phase, amplitude),
    visibility: calculateVisibility(phase, amplitude)
  });
}
```

### Component Composition
```javascript
// Reusable quantum visualization component
<QuantumCanvas 
  experiment="double-slit"
  phase={Math.PI/2}
  amplitude={0.7}
  onStateChange={handleStateChange}
  renderMode="high-quality"
/>
```

## Educational Value

### Physics Concepts
- **Wave-Particle Duality**: Fundamental quantum mechanical principle
- **Superposition**: Quantum states existing in multiple states simultaneously
- **Interference**: How quantum amplitudes combine mathematically
- **Measurement**: Collapse of superposition to definite states

### Programming Concepts
- **Canvas Animation**: HTML5 graphics programming
- **Performance Optimization**: Smooth 60fps rendering techniques
- **State Management**: Complex interactive application state
- **Modern React**: Hooks, context, and concurrent features

### Mathematical Visualization
- **Complex Numbers**: Amplitude and phase representation
- **Trigonometric Functions**: Wave equation implementation
- **Linear Algebra**: Quantum state vector operations
- **Probability Theory**: Measurement outcome calculations

Perfect for advanced quantum physics education, demonstrating the beautiful mathematical foundations of quantum mechanics through interactive, real-time visualizations with professional-grade Next.js implementation.