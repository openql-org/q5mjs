# Q5M.js + Nuxt.js: Quantum Interference Visualization

An interactive demonstration of quantum interference phenomena using Q5M.js with Nuxt.js. This example showcases wave-particle duality, superposition, and interference patterns through dynamic visualizations of famous quantum experiments.

## Features

- **🌊 Real-time Wave Animation**: Smooth Canvas-based interference pattern visualization
- **🔬 Multiple Experiments**: Double-slit, Mach-Zehnder, Ramsey fringes, and custom superposition
- **🎮 Interactive Controls**: Real-time phase and amplitude adjustment with immediate feedback
- **📊 Live Quantum Analysis**: Dynamic probability distributions and amplitude calculations
- **📐 Mathematical Framework**: Complete wave function representations and physics insights
- **⚡ SSR/SPA Hybrid**: Server-side rendering with client-side quantum computations
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **♿ Accessibility**: Full keyboard navigation and screen reader support

## Quantum Experiments

### 🔄 Double-Slit Experiment
The quintessential demonstration of wave-particle duality. A quantum particle travels through both slits simultaneously, creating an interference pattern that depends on the relative phase between paths.

**Wave Function**: |ψ⟩ = α|path1⟩ + βe^(iφ)|path2⟩

### 🔀 Mach-Zehnder Interferometer  
Optical interferometer using beam splitters to demonstrate quantum superposition. The final measurement probability depends on the relative phase accumulated along different paths.

**Wave Function**: |ψ⟩ = (1/√2)(|0⟩ + e^(iφ)|1⟩)

### 📡 Ramsey Fringes
Time-domain interference created by two separated oscillating fields. Fundamental to atomic clocks and precision measurements, showing oscillating population as a function of phase.

**Wave Function**: |ψ⟩ = cos(θ/2)|0⟩ + sin(θ/2)e^(iφ)|1⟩

### ⚙️ Custom Superposition
Explore arbitrary quantum superpositions with adjustable amplitudes and phases. Observe how different combinations create constructive and destructive interference patterns.

**Wave Function**: |ψ⟩ = α|0⟩ + βe^(iφ)|1⟩

## Getting Started

### Prerequisites

- Node.js ≥ 18.0.0
- npm ≥ 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Generate static site
npm run generate

# Preview production build
npm run preview
```

### Development

```bash
# Start dev server with hot reload
npm run dev

# Access the application
open http://localhost:3000
```

## Project Structure

```
03-interference-visualization/
├── assets/
│   └── styles/
│       └── main.css                    # Global styles and animations
├── components/
│   └── InterferenceVisualization.vue   # Main quantum component
├── pages/
│   └── index.vue                       # Home page
├── nuxt.config.ts                      # Nuxt configuration
├── package.json                        # Dependencies
└── README.md                           # Documentation
```

## Technical Implementation

### Canvas-Based Wave Animation

```typescript
const drawWavePattern = () => {
  const ctx = canvas.value.getContext('2d')
  const width = canvas.value.width
  const height = canvas.value.height
  
  // Clear canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.fillRect(0, 0, width, height)
  
  // Draw interference pattern
  const centerY = height / 2
  const timeOffset = time.value * animationSpeed.value
  
  // Wave 1
  ctx.strokeStyle = 'rgba(76, 175, 80, 0.8)'
  ctx.beginPath()
  for (let x = 0; x < width; x++) {
    const y1 = centerY + amplitude1 * Math.sin(0.02 * x + timeOffset)
    if (x === 0) ctx.moveTo(x, y1)
    else ctx.lineTo(x, y1)
  }
  ctx.stroke()
  
  // Wave 2 with phase offset
  ctx.strokeStyle = 'rgba(156, 39, 176, 0.8)'
  ctx.beginPath()
  for (let x = 0; x < width; x++) {
    const y2 = centerY + amplitude2 * Math.sin(0.02 * x + timeOffset + phase)
    if (x === 0) ctx.moveTo(x, y2)
    else ctx.lineTo(x, y2)
  }
  ctx.stroke()
  
  // Interference pattern (sum)
  ctx.strokeStyle = 'rgba(255, 255, 255, 1)'
  ctx.lineWidth = 3
  ctx.beginPath()
  for (let x = 0; x < width; x++) {
    const y1 = amplitude1 * Math.sin(0.02 * x + timeOffset)
    const y2 = amplitude2 * Math.sin(0.02 * x + timeOffset + phase)
    const yTotal = centerY + y1 + y2
    if (x === 0) ctx.moveTo(x, yTotal)
    else ctx.lineTo(x, yTotal)
  }
  ctx.stroke()
}
```

### Quantum State Creation

```typescript
const createQuantumState = () => {
  const circuit = new Q5M.Circuit(1)
  const ratio = parseFloat(amplitudeRatio.value)
  const phase = parseFloat(relativephase.value)
  
  switch (currentExperiment.value) {
    case 'double-slit':
      // General superposition with adjustable amplitude and phase
      const theta = Math.acos(ratio)
      circuit.ry(0, 2 * theta)
      if (Math.abs(phase) > 0.01) {
        circuit.rz(0, phase)
      }
      break
      
    case 'mach-zehnder':
      // Symmetric superposition (1/√2 coefficients)
      circuit.h(0)
      if (Math.abs(phase) > 0.01) {
        circuit.rz(0, phase)
      }
      break
      
    case 'ramsey':
      // Ramsey sequence simulation
      circuit.ry(0, Math.PI/2)      // First π/2 pulse
      circuit.rz(0, phase)          // Free evolution phase
      circuit.ry(0, Math.PI/2 * ratio)  // Second pulse (variable)
      break
  }
  
  const result = circuit.execute()
  quantumState.value = result.state
}
```

### Real-time Controls

```vue
<template>
  <div class="control-group">
    <label>Relative Phase (φ):</label>
    <input 
      type="range" 
      v-model="relativephase" 
      min="0" 
      max="6.283" 
      step="0.01" 
      @input="updateInterference"
    />
    <span class="value-display">{{ phaseDisplay }}</span>
  </div>
</template>
```

### Animation Loop

```typescript
const animate = () => {
  time.value += 0.05
  drawWavePattern()
  animationId.value = requestAnimationFrame(animate)
}

// Start animation on mount
onMounted(() => {
  if (canvas.value) {
    animate()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
})
```

## Physics Background

### Superposition Principle

Quantum superposition allows a particle to exist in multiple states simultaneously:
```
|ψ⟩ = α|0⟩ + βe^(iφ)|1⟩
```
where |α|² + |β|² = 1 (normalization condition)

### Interference Conditions

- **Constructive Interference**: φ = 2nπ (waves add constructively)
- **Destructive Interference**: φ = (2n+1)π (waves cancel)
- **Partial Interference**: 0 < φ < π (varying degrees of constructive/destructive)

### Measurement Probabilities

The probability of measuring state |0⟩ or |1⟩ depends on both amplitude and phase:
```
P(|0⟩) = |α|²
P(|1⟩) = |β|²
```

### Classical Wave Analogy

The quantum interference can be understood through classical wave superposition:
```
ψ(x,t) = A₁sin(kx - ωt) + A₂sin(kx - ωt + φ)
```

## Educational Applications

### Quantum Mechanics Courses

- **Wave-Particle Duality**: Fundamental quantum concept demonstration
- **Superposition**: Interactive exploration of quantum state combinations
- **Interference**: Understanding constructive and destructive patterns
- **Measurement**: Collapse of superposition upon observation

### Interactive Learning Features

- **Real-time Feedback**: Immediate visual response to parameter changes
- **Multiple Perspectives**: Classical wave and quantum state representations
- **Mathematical Insight**: Complete wave function and probability analysis
- **Experimental Variety**: Four different interference scenarios

### Physics Demonstrations

- **Lecture Integration**: Perfect for classroom quantum mechanics demonstrations
- **Student Exploration**: Hands-on investigation of quantum principles
- **Conceptual Understanding**: Visual reinforcement of abstract concepts
- **Advanced Topics**: Foundation for quantum computing and information

## Advanced Features

### Dynamic Phase Control

Interactive phase slider with real-time π-fraction display:
```typescript
const phaseDisplay = computed(() => {
  const piRatio = phase.value / Math.PI
  
  if (Math.abs(piRatio - 0.5) < 0.05) return 'π/2'
  if (Math.abs(piRatio - 1) < 0.05) return 'π'
  if (Math.abs(piRatio - 1.5) < 0.05) return '3π/2'
  
  return `${phase.value.toFixed(2)}`
})
```

### Amplitude Analysis

Real-time complex amplitude visualization:
```vue
<div class="amplitude-item">
  <div class="complex-number">{{ formatComplex(amp) }}</div>
  <div class="magnitude">|{{ amp.magnitude.toFixed(3) }}|</div>
  <div class="phase">∠{{ (amp.phase * 180 / Math.PI).toFixed(1) }}°</div>
</div>
```

### Experiment Switching

Seamless transitions between different quantum experiments:
```typescript
const doubleSlitExperiment = () => {
  currentExperiment.value = 'double-slit'
  updateInterference()
}

const machZehnderInterferometer = () => {
  currentExperiment.value = 'mach-zehnder'
  amplitudeRatio.value = 0.707 // 1/√2 for symmetric superposition
  updateInterference()
}
```

## Performance Optimization

### Canvas Rendering

Optimized drawing with requestAnimationFrame:
```typescript
const animate = () => {
  time.value += 0.05
  drawWavePattern()
  animationId.value = requestAnimationFrame(animate)
}
```

### Reactive State Management

Efficient computed properties for quantum state analysis:
```typescript
const probabilities = computed(() => {
  if (!quantumState.value) return []
  return quantumState.value.probabilities()
})
```

### Memory Management

Proper cleanup and resource management:
```typescript
onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
})
```

## Browser Compatibility

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Canvas 2D Support**: Required for wave visualization
- **ES2022 Features**: Native async/await, optional chaining
- **Progressive Enhancement**: Works without JavaScript (SSR fallback)
- **WebAssembly**: Not required (pure JavaScript implementation)

## Deployment

### Static Generation

```bash
# Generate static site for hosting
npm run generate

# Deploy dist/ folder to:
# - Vercel, Netlify, GitHub Pages
# - Any static hosting service
```

### Server Deployment

```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

## Configuration

### Nuxt.js Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,
  app: {
    head: {
      script: [{
        src: 'https://cdn.jsdelivr.net/npm/q5m@latest/dist/q5m.min.js',
        defer: true
      }]
    }
  },
  css: ['~/assets/styles/main.css']
})
```

### Environment Variables

```bash
# .env
NUXT_PUBLIC_APP_NAME="Q5M.js Interference Visualization Demo"
NUXT_PUBLIC_VERSION="1.0.0"
```

## Troubleshooting

### Common Issues

**Canvas not rendering:**
```typescript
// Ensure canvas element exists before drawing
const drawWavePattern = () => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return
  // ... drawing code
}
```

**Animation not starting:**
```typescript
// Wait for component mount and DOM ready
onMounted(() => {
  nextTick(() => {
    if (canvas.value) {
      animate()
    }
  })
})
```

**Q5M library not loading:**
```javascript
// Add proper loading check
const initQuantumDemo = () => {
  const checkQ5M = () => {
    if (typeof window !== 'undefined' && window.Q5M) {
      createQuantumState()
      animate()
    } else {
      setTimeout(checkQ5M, 100)
    }
  }
  checkQ5M()
}
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-visualization`)
3. Commit changes (`git commit -m 'Add amazing visualization feature'`)
4. Push to branch (`git push origin feature/amazing-visualization`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](../../../../../LICENSE) file for details.

## References

### Quantum Physics Literature

- Feynman, R.P.: "The Feynman Lectures on Physics, Volume III"
- Griffiths, D.J.: "Introduction to Quantum Mechanics"
- Nielsen & Chuang: "Quantum Computation and Quantum Information"
- Sakurai, J.J.: "Modern Quantum Mechanics"

### Online Resources

- [Q5M.js Documentation](https://github.com/your-repo/q5mjs-poc)
- [Qiskit Textbook](https://qiskit.org/textbook/)
- [IBM Quantum Experience](https://quantum-computing.ibm.com/)
- [Microsoft Q# Documentation](https://docs.microsoft.com/en-us/quantum/)

### Canvas and Animation

- [MDN Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [requestAnimationFrame Guide](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)

## Related Examples

- [Entanglement Demo](../01-entanglement/) - Bell states and quantum entanglement
- [Hadamard Test](../02-hadamard-test/) - Phase estimation algorithm
- [Vue.js Interference](../../vue/03-interference-visualization/) - Pure Vue.js version
- [React Interference](../../react/03-interference-visualization/) - React implementation
- [Next.js Interference](../../nextjs/03-interference-visualization/) - Next.js version

---

*Exploring the wave nature of quantum reality with interactive visualizations*