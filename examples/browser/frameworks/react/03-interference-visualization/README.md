# React Quantum Interference Visualization

This example demonstrates quantum interference phenomena using React and Q5M.js, showcasing wave-particle duality through interactive visualizations and multiple quantum experiments.

## Features

- **Animated Wave Patterns**: Real-time canvas animation showing wave interference
- **Multiple Experiments**: Four different quantum interference scenarios
- **Interactive Parameters**: Adjust phase, amplitude, and animation speed
- **Amplitude Visualization**: Complex number display with phase indicators
- **Probability Analysis**: Live measurement probability calculations
- **Educational Content**: Detailed explanations of each experiment

## Quantum Experiments

### 1. Double-Slit Experiment
Classic demonstration of wave-particle duality where a quantum particle travels through both slits simultaneously, creating interference patterns.

**Wave Function**: |ψ⟩ = α|path1⟩ + βe^(iδ)|path2⟩

### 2. Mach-Zehnder Interferometer
Quantum interferometer using beam splitters, showing how quantum amplitudes combine and interfere based on relative phase.

**Wave Function**: |ψ⟩ = (1/√2)(|0⟩ + e^(iδ)|1⟩)

### 3. Ramsey Fringes
Time-domain interference experiment using separated oscillating fields, crucial for atomic clocks and precision measurements.

**Wave Function**: |ψ⟩ = cos(θ/2)|0⟩ + sin(θ/2)e^(iδ)|1⟩

### 4. Custom Superposition
Explore arbitrary quantum superpositions with adjustable amplitudes and phases to understand interference principles.

## Visualization Components

### Wave Canvas Animation
- **Green Wave**: Represents first quantum amplitude
- **Purple Wave**: Represents second quantum amplitude with phase
- **White Wave**: Shows combined interference pattern
- **Real-time Animation**: Smooth wave motion with adjustable speed

### Amplitude Analysis
- **Complex Numbers**: Display real and imaginary parts
- **Phase Indicators**: Visual arrows showing phase angles
- **Probability Bars**: Heights correspond to measurement probabilities
- **Schmidt Decomposition**: Understanding quantum state structure

### Interactive Controls
- **Phase Slider**: Adjust relative phase (0 to 2π)
- **Amplitude Ratio**: Control superposition coefficients
- **Animation Speed**: Customize visualization speed
- **Experiment Buttons**: Switch between different scenarios

## Physics Concepts

### Interference Conditions
- **Constructive**: δ = 2nπ (waves in phase)
- **Destructive**: δ = (2n+1)π (waves out of phase)
- **Fringe Visibility**: V = 2|α₁||α₂|/(|α₁|² + |α₂|²)

### Quantum Superposition
The fundamental principle that quantum systems can exist in multiple states simultaneously until measured.

### Phase Relationships
How relative phases between quantum amplitudes determine interference patterns and measurement probabilities.

## Usage

1. Open `index.html` in a modern web browser
2. Select an experiment from the control panel
3. Adjust phase and amplitude parameters
4. Observe real-time changes in:
   - Wave interference patterns
   - Measurement probabilities
   - Complex amplitude representations
5. Compare theoretical predictions with visualizations

## Educational Value

This example teaches:
- **Wave-Particle Duality**: Fundamental quantum mechanical principle
- **Superposition States**: Linear combinations of quantum states
- **Interference Phenomena**: How quantum amplitudes combine
- **Complex Numbers**: Mathematical representation of quantum amplitudes
- **Measurement Theory**: Connection between amplitudes and probabilities

## Technical Implementation

### React Hooks Used
- `useState`: Component state management
- `useEffect`: Canvas setup and animation lifecycle
- `useRef`: Canvas element and animation frame references
- `useCallback`: Optimized function memoization

### Canvas Animation
- Smooth 60fps wave rendering
- Real-time parameter updates
- Interactive controls with immediate visual feedback
- Optimized drawing algorithms for performance

### Quantum Circuit Integration
- Q5M.js quantum state preparation
- Real-time probability calculations
- Amplitude extraction and formatting
- Dynamic circuit construction based on experiment type

## Browser Compatibility

- Modern browsers supporting Canvas API
- ES6+ JavaScript features
- React 18+ via CDN
- Babel for JSX compilation
- Q5M.js quantum computing library

## Code Structure

- `index.html`: Standalone HTML with React environment
- `InterferenceVisualization.jsx`: Main React component
- `README.md`: This comprehensive documentation

The implementation demonstrates advanced React patterns including custom hooks, canvas integration, and real-time quantum state visualization.