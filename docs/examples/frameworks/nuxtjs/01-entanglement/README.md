# Q5M.js + Nuxt.js: Quantum Entanglement Demo

An interactive demonstration of quantum entanglement using Q5M.js quantum computing library with Nuxt.js framework. This example showcases Bell states, GHZ states, and W states with real-time visualization of quantum probabilities and amplitudes.

## Features

- **Multiple Entangled States**: Bell states (|Φ⁺⟩, |Φ⁻⟩), GHZ states, and W states
- **Real-time Visualization**: Interactive probability distributions and quantum amplitudes  
- **SSR/SPA Hybrid**: Server-side rendering with client-side quantum computations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Modern UI**: Glass morphism design with smooth animations

## Quantum States Demonstrated

### Bell States
- **|Φ⁺⟩**: Maximally entangled two-qubit state `(|00⟩ + |11⟩)/√2`
- **|Φ⁻⟩**: Bell state with phase `(|00⟩ - |11⟩)/√2`

### Multi-qubit States  
- **GHZ State**: Three-qubit entangled state `(|000⟩ + |111⟩)/√2`
- **W State**: Symmetric three-qubit state `(|001⟩ + |010⟩ + |100⟩)/√3`

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
01-entanglement/
├── assets/
│   └── styles/
│       └── main.css              # Global styles
├── components/
│   └── EntanglementDemo.vue      # Main quantum component
├── pages/
│   └── index.vue                 # Home page
├── nuxt.config.ts                # Nuxt configuration
├── package.json                  # Dependencies
└── README.md                     # Documentation
```

## Technical Implementation

### SSR/SPA Hybrid Architecture

The application uses Nuxt.js hybrid mode:
- **Server-side**: Initial page load with SEO optimization
- **Client-side**: Quantum computations using `<ClientOnly>` wrapper
- **Progressive Enhancement**: Graceful fallback when JavaScript is disabled

### Quantum Computing Integration

```vue
<template>
  <!-- Server-rendered shell -->
  <ClientOnly>
    <!-- Client-only quantum component -->
    <EntanglementDemo />
    <template #fallback>
      <div class="loading">Loading quantum simulation...</div>
    </template>
  </ClientOnly>
</template>
```

### State Management

```typescript
// Reactive quantum state
const quantumState = ref<any>(null)
const currentState = ref('reset')

// Computed probabilities
const probabilities = computed(() => {
  return quantumState.value?.probabilities() || []
})
```

### Circuit Creation Examples

```typescript
// Bell State |Φ⁺⟩
const circuit = new Q5M.Circuit(2)
circuit.h(0).cnot(0, 1)

// GHZ State
const circuit = new Q5M.Circuit(3) 
circuit.h(0).cnot(0, 1).cnot(0, 2)

// W State (approximation)
const circuit = new Q5M.Circuit(3)
circuit
  .ry(0, Math.acos(Math.sqrt(2/3)))
  .cnot(0, 1)
  .x(0)
  .cry(1, 2, Math.acos(Math.sqrt(1/2)))
  .cnot(0, 1)
```

## Quantum Physics Background

### Entanglement

Quantum entanglement occurs when particles become correlated in such a way that the quantum state of each particle cannot be described independently. Measuring one particle instantly affects the other, regardless of distance.

### Bell States

The four Bell states form a complete basis for two-qubit systems:
- |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 (Bell state shown)
- |Φ⁻⟩ = (|00⟩ - |11⟩)/√2 (Bell state with phase)
- |Ψ⁺⟩ = (|01⟩ + |10⟩)/√2
- |Ψ⁻⟩ = (|01⟩ - |10⟩)/√2

### Schmidt Decomposition

The Schmidt rank indicates the degree of entanglement:
- Rank 1: Separable (no entanglement) 
- Rank > 1: Entangled
- Maximum rank: Maximal entanglement

## Performance Considerations

### Bundle Optimization

- **Code Splitting**: Q5M.js loaded only on client-side
- **Tree Shaking**: Unused Nuxt.js modules excluded
- **Compression**: Gzip/Brotli compression enabled
- **Caching**: Aggressive caching for static assets

### Memory Management

- **Sparse Matrices**: Q5M.js uses sparse representations for large quantum states
- **State Cleanup**: Quantum states properly disposed when component unmounts
- **Reactive Efficiency**: Computed properties minimize unnecessary recalculations

## Browser Compatibility

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **ES2022 Support**: Native async/await, optional chaining, nullish coalescing
- **WebAssembly**: Not required (pure JavaScript implementation)
- **Progressive Enhancement**: Works with JavaScript disabled (SSR fallback)

## Deployment

### Static Generation

```bash
# Generate static site
npm run generate

# Deploy dist/ to any static host
# Vercel, Netlify, GitHub Pages, etc.
```

### Server Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Configuration

### Nuxt.js Config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,                    // Enable SSR
  app: {
    head: {
      script: [{
        src: 'https://cdn.jsdelivr.net/npm/q5m@latest/dist/q5m.min.js',
        defer: true
      }]
    }
  }
})
```

### Environment Variables

```bash
# .env
NUXT_PUBLIC_APP_NAME="Q5M.js Entanglement Demo"
NUXT_PUBLIC_VERSION="1.0.0"
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](../../../../../LICENSE) file for details.

## Acknowledgments

- **Q5M.js Team** - Quantum computing library
- **Nuxt.js Team** - Full-stack Vue.js framework
- **Vue.js Team** - Progressive JavaScript framework
- **Quantum Computing Community** - Scientific foundations

## Related Examples

- [Vue.js Entanglement Demo](../../vue/01-entanglement/) - Pure Vue.js version
- [React Entanglement Demo](../../react/01-entanglement/) - React implementation  
- [Next.js Entanglement Demo](../../nextjs/01-entanglement/) - Next.js version
- [Hadamard Test](../02-hadamard-test/) - Phase estimation demo
- [Interference Visualization](../03-interference-visualization/) - Wave interference patterns

---

*Built with care for the quantum computing community*