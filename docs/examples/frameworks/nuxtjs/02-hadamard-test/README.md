# Q5M.js + Nuxt.js: Hadamard Test Demo

An interactive demonstration of the Hadamard test quantum algorithm using Q5M.js with Nuxt.js. This example showcases phase estimation, quantum phase kickback, and statistical measurement analysis with real-time controls.

## Features

- **Interactive Phase Control**: Adjust custom phases with real-time slider
- **Multiple Quantum Gates**: Test Z, S, T, and custom phase gates
- **Real-time Measurements**: Live probability visualization during 1000-measurement runs
- **Mathematical Analysis**: Complete theoretical framework and formulas
- **SSR/SPA Hybrid**: Server-side rendering with client-side quantum computations
- **Responsive Design**: Optimized for all device sizes
- **Accessibility**: Full keyboard navigation and screen reader support

## Quantum Algorithm

### The Hadamard Test

The Hadamard test is a fundamental quantum algorithm for phase estimation that determines the eigenvalue phase φ of a unitary operator U acting on eigenstate |ψ⟩.

**Circuit Protocol:**
1. Initialize ancilla qubit in |+⟩ = (|0⟩ + |1⟩)/√2 using Hadamard gate
2. Prepare target qubit in eigenstate |ψ⟩ (here |1⟩)
3. Apply controlled-U operation (where U has eigenvalue e^(iφ))
4. Apply final Hadamard gate to ancilla qubit
5. Measure ancilla: P(|0⟩) = (1 + cos(φ))/2

### Phase Estimation Formula

The probability of measuring |0⟩ on the ancilla is:
```
P(|0⟩) = (1 + cos(φ))/2
```

From this, we can extract the phase:
```
φ = arccos(2·P(|0⟩) - 1)
```

### Quantum Gates Tested

- **Z Gate**: π phase flip, eigenvalues ±1
- **S Gate**: π/2 phase, square root of Z  
- **T Gate**: π/4 phase, eighth root of Z
- **Phase Gate**: Custom phase φ, general rotation e^(iφ)

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
02-hadamard-test/
├── assets/
│   └── styles/
│       └── main.css              # Global styles
├── components/
│   └── HadamardTest.vue          # Main quantum component
├── pages/
│   └── index.vue                 # Home page
├── nuxt.config.ts                # Nuxt configuration
├── package.json                  # Dependencies
└── README.md                     # Documentation
```

## Technical Implementation

### Circuit Construction

```typescript
// Create 2-qubit Hadamard test circuit
const circuit = new Q5M.Circuit(2)

// Prepare target in eigenstate |1⟩
circuit.x(1)

// Hadamard on ancilla
circuit.h(0)

// Apply controlled gate (example: controlled-Z)
circuit.cz(0, 1)

// Final Hadamard on ancilla
circuit.h(0)

// Extract measurement probabilities
const result = circuit.execute()
const probabilities = result.state.probabilities()
const p0 = probabilities[0] + probabilities[1] // P(|0⟩) on ancilla
```

### Phase Estimation

```typescript
// Estimate phase from measurement probability
const estimatedPhase = computed(() => {
  try {
    const phaseEst = Math.acos(2 * prob0.value - 1)
    return phaseEst
  } catch (error) {
    return NaN
  }
})
```

### Statistical Measurement

```typescript
// Run 1000 measurements for statistical validation
const runMultipleMeasurements = async () => {
  let totalZeros = 0
  const numMeasurements = 1000
  
  for (let i = 0; i < numMeasurements; i++) {
    const circuit = new Q5M.Circuit(2)
    // ... construct circuit ...
    
    const result = circuit.execute()
    const measurement = result.state.measure([0])
    
    if (measurement[0] === 0) totalZeros++
    
    // Update display every 100 measurements
    if (i % 100 === 0) {
      prob0.value = totalZeros / (i + 1)
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }
  
  prob0.value = totalZeros / numMeasurements
}
```

## Mathematical Background

### Quantum State Evolution

1. **Initial State**: |0⟩ ⊗ |1⟩
2. **After First H**: |+⟩ ⊗ |1⟩ = (|0⟩ + |1⟩)/√2 ⊗ |1⟩  
3. **After Controlled-U**: (|0⟩ ⊗ |1⟩ + e^(iφ)|1⟩ ⊗ |1⟩)/√2
4. **Final State**: ((1 + e^(iφ))|0⟩ + (1 - e^(iφ))|1⟩)/2 ⊗ |1⟩

### Phase Kickback Mechanism

When the controlled gate acts on eigenstate |ψ⟩ with eigenvalue e^(iφ), the phase "kicks back" to the control qubit:

```
CU|c⟩|ψ⟩ = |c⟩ · e^(iφ·c) |ψ⟩
```

This phase kickback enables the Hadamard test to detect the eigenvalue phase.

### Error Analysis

The phase estimation error depends on:
- **Measurement statistics**: More measurements → better precision
- **Quantum decoherence**: Environmental noise affects accuracy  
- **Gate fidelity**: Imperfect gates introduce systematic errors
- **Finite precision**: Limited floating-point representation

## Performance Optimization

### Client-Side Rendering

```vue
<template>
  <ClientOnly>
    <HadamardTest />
    <template #fallback>
      <div class="loading">Loading quantum simulation...</div>
    </template>
  </ClientOnly>
</template>
```

### Reactive State Management

```typescript
// Efficient computed properties
const probabilities = computed(() => {
  if (!quantumState.value) return []
  return quantumState.value.probabilities()
})

// Debounced phase updates
watch(phase, debounce(() => {
  runHadamardTest()
}, 100))
```

### Memory Management

- Quantum circuits properly disposed after use
- Measurement arrays cleared between runs
- Reactive state efficiently updated

## Browser Compatibility

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **ES2022 Features**: Native async/await, optional chaining
- **Progressive Enhancement**: Works without JavaScript (SSR fallback)
- **WebAssembly**: Not required (pure JavaScript implementation)

## Educational Applications

### Quantum Computing Courses

- **Quantum Algorithms**: Fundamental building block for phase estimation
- **Quantum Fourier Transform**: Hadamard test as core component
- **Error Correction**: Understanding phase errors and mitigation
- **Quantum Sensing**: Phase estimation for precision measurements

### Interactive Learning

- **Real-time Feedback**: Immediate visual response to parameter changes
- **Statistical Validation**: Compare theoretical predictions with measurements  
- **Error Analysis**: Explore sources of phase estimation errors
- **Gate Comparison**: Understand different quantum gates and their phases

## Advanced Features

### Phase Slider

Interactive phase control with real-time updates:
```vue
<input 
  type="range" 
  v-model="phase" 
  min="0" 
  max="6.283" 
  step="0.01" 
  @input="runHadamardTest"
/>
```

### Statistical Display

Live probability bars during measurement runs:
```vue
<div class="bar prob-0" :style="{ width: (prob0 * 100) + '%' }"></div>
<div class="bar prob-1" :style="{ width: (prob1 * 100) + '%' }"></div>
```

### Circuit Visualization

ASCII-art quantum circuit diagram:
```
|0⟩ ─[H]─●─[H]─[M]
         │      
|1⟩ ─────[φ]────
```

## Deployment

### Static Generation

```bash
# Generate static site
npm run generate

# Deploy to static hosting (Vercel, Netlify, etc.)
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

## Troubleshooting

### Common Issues

**Q5M not loading:**
```javascript
// Add loading check
const checkQ5M = () => {
  if (typeof window !== 'undefined' && window.Q5M) {
    initQuantumDemo()
  } else {
    setTimeout(checkQ5M, 100)
  }
}
```

**SSR hydration errors:**
```vue
<!-- Use ClientOnly wrapper -->
<ClientOnly>
  <HadamardTest />
</ClientOnly>
```

**Phase calculation errors:**
```javascript
// Add error handling
try {
  const phaseEst = Math.acos(2 * prob0.value - 1)
  return phaseEst
} catch (error) {
  return NaN
}
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](../../../../../LICENSE) file for details.

## References

### Quantum Computing Papers

- Nielsen & Chuang: "Quantum Computation and Quantum Information"
- Kitaev: "Quantum measurements and the Abelian Stabilizer Problem"
- Cleve et al.: "Quantum algorithms revisited"

### Educational Resources

- [Q5M.js Documentation](https://github.com/your-repo/q5mjs-poc)
- [Qiskit Textbook](https://qiskit.org/textbook/)
- [Microsoft Q# Documentation](https://docs.microsoft.com/en-us/quantum/)

## Related Examples

- [Entanglement Demo](../01-entanglement/) - Bell states and GHZ states
- [Interference Visualization](../03-interference-visualization/) - Wave interference patterns  
- [Vue.js Hadamard Test](../../vue/02-hadamard-test/) - Pure Vue.js version
- [React Hadamard Test](../../react/02-hadamard-test/) - React implementation
- [Next.js Hadamard Test](../../nextjs/02-hadamard-test/) - Next.js version

---

*Built with love for quantum computing education*