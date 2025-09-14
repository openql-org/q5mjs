# Three.js Integration Examples

This directory contains 3D quantum visualization examples using Three.js and Q5M.js, providing immersive and interactive ways to explore quantum computing concepts.

## Examples Overview

### 1. Bloch Sphere Visualization (`bloch-sphere.html`)
Interactive 3D Bloch sphere representation of single-qubit quantum states.

**Features:**
- Real-time 3D Bloch sphere with state vector visualization
- Interactive controls for manual state manipulation (θ, φ parameters)
- Quantum gate application (H, X, Y, Z, S, T, RX, RY, RZ)
- Live display of amplitudes, probabilities, and Bloch coordinates
- Preset quantum states (|0⟩, |1⟩, |+⟩, |-⟩)
- Animation modes and random walk simulation
- Educational explanations and visual legends

**Controls:**
- Mouse: Rotate the 3D view
- Mouse wheel: Zoom in/out
- Sliders: Directly set θ and φ angles
- Gate buttons: Apply quantum gates
- Animation controls: Automated state evolution

### 2. 3D Quantum Circuit (`circuit-3d.html`)
Three-dimensional visualization of quantum circuits with interactive gate placement.

**Features:**
- 3D circuit representation with qubit lines and gate objects
- Support for 1-4 qubits with dynamic scaling
- Comprehensive gate library:
  - Single-qubit: H, X, Y, Z, S, T, S†, T†, RX, RY, RZ, Phase
  - Two-qubit: CNOT, CZ, CY, SWAP
- Preset quantum circuits:
  - Bell state preparation
  - GHZ state creation
  - Quantum Fourier Transform (QFT)
  - Random circuit generation
- Interactive circuit building interface
- Step-by-step execution animation
- Real-time circuit code generation
- Circuit statistics (gate count, depth)

**Visualization Elements:**
- Blue cylindrical bars: Qubit lines
- Cyan cubes: Single-qubit gates
- Red shapes: Two-qubit gate components
- Orange lines: Control connections
- Dynamic highlighting during execution

## Technical Implementation

### Dependencies
Both examples use CDN-hosted libraries:
- **Three.js r128**: 3D rendering engine
- **Q5M.js**: Quantum circuit simulation
- Modern browser with WebGL support

### Architecture
- **Scene Management**: Three.js scene with proper lighting and camera controls
- **Quantum Integration**: Real-time synchronization between Q5M.js circuits and 3D visualization
- **Interactive Controls**: Mouse-based camera manipulation and UI controls
- **Animation System**: Smooth transitions and step-by-step execution visualization

### Performance Considerations
- Optimized geometry and materials for smooth rendering
- Efficient state updates and minimal re-renders
- Shadow mapping and anti-aliasing for visual quality
- Responsive design with automatic resize handling

## Getting Started

### Basic Usage
1. Open either HTML file in a modern web browser
2. The examples will automatically load dependencies from CDN
3. No local server required - files can be opened directly

### Customization Examples

#### Bloch Sphere Customization
```javascript
// Add custom gate sequence
function customGateSequence() {
    circuit = new Q5M.Circuit(1);
    circuit.H(0).RZ(0, Math.PI/4).H(0);
    updateQuantumState();
}

// Modify visualization parameters
const customMaterials = {
    sphere: new THREE.MeshPhongMaterial({ 
        color: 0xff6b6b, 
        transparent: true, 
        opacity: 0.2 
    }),
    vector: 0x00ff88
};
```

#### Circuit Visualization Customization
```javascript
// Add custom gate type
function addCustomGate(targetQubit) {
    circuit.RY(targetQubit, Math.PI/3);
    addSingleQubitGate('Custom', targetQubit);
    updateCircuitDisplay();
}

// Modify gate appearance
const customGateMaterial = new THREE.MeshPhongMaterial({
    color: 0xff9800,
    transparent: true,
    opacity: 0.8
});
```

## Educational Value

### Bloch Sphere Learning Objectives
- **Quantum State Representation**: Understand how qubit states map to points on the Bloch sphere
- **Gate Operations**: Visualize how quantum gates transform states geometrically
- **Superposition**: Observe states between classical |0⟩ and |1⟩ states
- **Phase Relationships**: See how global and relative phases affect the Bloch vector

### 3D Circuit Learning Objectives
- **Circuit Construction**: Learn to build quantum circuits step by step
- **Gate Relationships**: Understand spatial and temporal relationships between gates
- **Multi-Qubit Operations**: Visualize how gates affect multiple qubits simultaneously
- **Algorithm Patterns**: Recognize common patterns in quantum algorithms

## Browser Compatibility

**Supported Browsers:**
- Chrome/Chromium 60+
- Firefox 55+
- Safari 12+
- Edge 79+

**Requirements:**
- WebGL support
- Modern JavaScript (ES6+)
- Hardware-accelerated graphics recommended

## Advanced Features

### Animation System
Both examples include sophisticated animation systems:
- Smooth state transitions
- Step-by-step execution visualization
- Camera movement and orbit controls
- Particle effects and visual feedback

### Interactive Elements
- Real-time parameter adjustment
- Click-to-inspect functionality
- Contextual information displays
- Educational tooltips and explanations

### Export Capabilities
The visualizations can be extended to support:
- Screenshot capture
- Animation recording
- State export
- Circuit code generation

## Troubleshooting

### Common Issues

**Black screen or no visualization:**
- Check browser console for WebGL errors
- Ensure hardware acceleration is enabled
- Update graphics drivers

**Performance issues:**
- Reduce circuit complexity for older hardware
- Close other browser tabs using graphics resources
- Lower animation quality settings

**Interactive controls not working:**
- Ensure JavaScript is enabled
- Check for popup blockers affecting CDN loading
- Try refreshing the page

### Performance Optimization Tips
- Use lower-resolution geometry for complex circuits
- Reduce lighting complexity for better frame rates
- Limit concurrent animations
- Consider using instanced geometry for repeated elements

## Contributing

To enhance these examples:
1. Fork the repository
2. Create feature branches for new visualizations
3. Test across multiple browsers and devices
4. Submit pull requests with detailed descriptions

### Potential Enhancements
- VR/AR support using WebXR
- Advanced lighting effects
- Physics-based animations
- Multi-device synchronization
- Custom shader materials
- Interactive quantum algorithm tutorials

## License

These examples are part of the Q5M.js project and follow the same licensing terms. The Three.js library is used under the MIT license.

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Q5M.js API Reference](https://github.com/your-repo/q5mjs)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [Quantum Computing Basics](https://quantum-computing.ibm.com/composer/docs/iqx/guide/)