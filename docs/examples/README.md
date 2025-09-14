# Q5M.js Browser Examples

This directory contains comprehensive browser-based examples showcasing Q5M.js quantum computing library across different frameworks and integration scenarios.

## Structure

### Frameworks
Each framework implements the same three core examples:
- **01-entanglement**: Bell states and GHZ states demonstration
- **02-hadamard-test**: Hadamard test algorithm and phase kickback
- **03-interference-visualization**: Quantum interference patterns visualization

**Supported Frameworks:**
- **Vue.js** - Progressive JavaScript framework
- **React** - Component-based UI library  
- **Angular** - Full-featured application framework
- **Next.js** - React framework with SSR/SSG
- **Nuxt.js** - Vue framework with universal rendering

### Integrations
Library integration examples with popular visualization and creative coding libraries:
- **p5.js** - Creative coding and interactive visualizations
- **Three.js** - 3D graphics and Bloch sphere representations
- **D3.js** - Data-driven visualizations and charts
- **Chart.js** - Simple and responsive charts

### Notebook
Interactive notebook-style examples:
- **Observable** - Interactive data visualization notebooks
- **RunKit** - Embeddable code examples
- **CodePen** - Web development playground snippets

## Quick Start

### CDN Usage
All examples use Q5M.js via CDN for simplicity:

```html
<script src="https://cdn.jsdelivr.net/npm/q5m@latest/dist/q5m.min.js"></script>
```

### Local Development
1. Clone the repository
2. Navigate to any example directory
3. Open `index.html` in a web browser
4. For framework examples, serve files via a local server:

```bash
# Simple HTTP server
python -m http.server 8000
# or
npx serve .
```

## Example Details

### 01-entanglement
Demonstrates quantum entanglement principles:
- **Bell State**: Creates and visualizes maximally entangled 2-qubit states
- **GHZ State**: 3-qubit entangled state with unique measurement correlations
- Interactive controls to create different entangled states
- Real-time probability visualization

### 02-hadamard-test  
Implements the Hadamard test algorithm:
- **Phase Estimation**: Estimates eigenvalue phases of unitary operators
- **Phase Kickback**: Demonstrates how phase information transfers between qubits
- Interactive phase parameter adjustment
- Visual representation of test results

### 03-interference-visualization
Beautiful quantum interference demonstrations:
- **Double-slit Experiment**: Classic quantum mechanics visualization
- **Mach-Zehnder Interferometer**: Quantum interference patterns
- **Ramsey Fringes**: Time-domain interference
- Animated and interactive visualizations

## Framework-Specific Features

### Vue.js Examples
- Reactive data binding for quantum states
- Component-based circuit builders
- Vue directives for quantum gate controls

### React Examples  
- Hook-based state management
- JSX components for quantum circuits
- Real-time rendering optimization

### Angular Examples
- TypeScript integration
- Dependency injection for quantum services
- Angular Material UI components

### Next.js Examples
- Server-side rendering compatibility
- Static site generation
- Optimized bundle splitting

### Nuxt.js Examples
- Universal rendering modes
- Auto-generated routes
- Built-in optimization

## Integration Examples

### p5.js Integration
Creative coding approach to quantum visualization:
- Particle-based state representations
- Interactive circuit building
- Real-time animation and effects

### Three.js Integration
3D quantum visualizations:
- Bloch sphere representations
- 3D circuit diagrams
- Immersive quantum state spaces

### D3.js Integration
Data visualization focus:
- Interactive probability charts
- State evolution timelines
- Complex amplitude plotting

### Chart.js Integration
Simple chart-based visualizations:
- Measurement statistics
- Algorithm performance comparisons
- Probability distributions

## Usage Tips

1. **Start Simple**: Begin with basic examples before exploring complex visualizations
2. **Framework Choice**: Choose the framework you're most comfortable with
3. **Performance**: For complex visualizations, consider using Web Workers
4. **Mobile**: Examples are responsive but complex 3D might perform poorly on mobile
5. **Browser Support**: Modern browsers with ES6+ support recommended

## Related Resources

- [Q5M.js Main Documentation](../../README.md)
- [Core Examples](../README.md)
- [Algorithm Tutorials](../tutorials/README.md)
- [API Reference](../../docs/api/README.md)

## Contributing

To add new examples:
1. Follow the established directory structure
2. Include comprehensive README.md files
3. Ensure cross-browser compatibility
4. Add interactive elements where appropriate
5. Test across different devices and screen sizes
