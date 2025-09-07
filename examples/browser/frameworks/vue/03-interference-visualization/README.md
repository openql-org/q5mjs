# Vue.js Quantum Interference Visualization

Interactive demonstration of quantum interference phenomena with beautiful animated visualizations.

## Features

- **Real-time Wave Animation**: Animated interference patterns showing constructive/destructive interference
- **Multiple Experiments**: Four different quantum interference scenarios
- **Interactive Controls**: Adjust phase, amplitude, and animation parameters
- **Complex Amplitude Display**: Visual representation of quantum amplitudes with phase indicators
- **Educational Content**: Detailed explanations of each interference phenomenon

## Quantum Experiments

### 1. Double-Slit Experiment
- **Concept**: Classic wave-particle duality demonstration
- **Physics**: Particle travels through both slits simultaneously
- **Visualization**: Two wave paths with adjustable relative phase and amplitude
- **Formula**: |ψ⟩ = α|path1⟩ + βe^(iδ)|path2⟩

### 2. Mach-Zehnder Interferometer  
- **Concept**: Optical quantum interferometry
- **Physics**: Beam splitters create symmetric superposition
- **Visualization**: Equal amplitude waves with variable phase difference
- **Formula**: |ψ⟩ = (1/√2)(|0⟩ + e^(iφ)|1⟩)

### 3. Ramsey Fringes
- **Concept**: Time-domain interference for precision measurements
- **Physics**: Two separated oscillating fields create interference
- **Visualization**: Population oscillations as function of phase
- **Application**: Atomic clocks, frequency standards

### 4. Custom Superposition
- **Concept**: General quantum superposition states
- **Physics**: Arbitrary amplitude and phase combinations
- **Visualization**: User-controlled interference patterns
- **Educational**: Explore parameter effects on quantum states

## Interactive Features

### Wave Parameters
- **Relative Phase (δ)**: 0 to 2π phase difference between wave components
- **Amplitude Ratio**: Balance between wave amplitudes (0 to 1)
- **Animation Speed**: Control wave motion speed (0.5x to 3x)

### Visual Elements
- **Wave Canvas**: Real-time animated interference patterns
- **Probability Bars**: Measurement outcome probabilities
- **Amplitude Circles**: Complex amplitudes with rotating phase indicators
- **Mathematical Formulas**: Dynamic equations updating with parameters

## Vue.js Implementation

### Advanced Features
- **Canvas Animation**: Smooth 60fps wave rendering using requestAnimationFrame
- **Reactive Computations**: Automatic updates when parameters change
- **Component Lifecycle**: Proper canvas initialization and cleanup
- **Async Operations**: Non-blocking state updates
- **Real-time Math**: Live calculation of quantum amplitudes and probabilities

### Educational Design
- **Progressive Complexity**: Start simple, explore advanced concepts
- **Visual Learning**: Immediate feedback from parameter changes
- **Mathematical Insight**: Formulas update dynamically with visualizations
- **Intuitive Controls**: Slider-based parameter adjustment

## Physics Concepts

### Interference Conditions
- **Constructive**: δ = 2nπ (waves in phase)
- **Destructive**: δ = (2n+1)π (waves out of phase)
- **Partial**: Intermediate phase values create mixed interference

### Quantum Amplitudes
- **Magnitude**: |α|² gives measurement probability
- **Phase**: arg(α) determines interference effects
- **Normalization**: |α|² + |β|² = 1 for valid quantum states

### Measurement Probabilities
- **Born Rule**: P(outcome) = |⟨outcome|ψ⟩|²
- **Interference Terms**: Probability ∝ |α + βe^(iδ)|²
- **Phase Dependence**: Oscillatory behavior with phase changes

## Usage Instructions

1. **Select Experiment**: Choose from four different interference scenarios
2. **Adjust Parameters**: Use sliders to modify phase and amplitude
3. **Watch Animation**: Observe real-time wave interference patterns
4. **Analyze Results**: Study probability bars and amplitude displays
5. **Compare Effects**: Switch between experiments to see differences

Perfect for understanding fundamental quantum mechanics concepts through interactive visual exploration.