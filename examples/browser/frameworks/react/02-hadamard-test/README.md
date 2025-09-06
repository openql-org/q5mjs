# React Hadamard Test Example

This example demonstrates the Hadamard Test algorithm using React and Q5M.js, showcasing phase estimation and quantum phase kickback phenomena.

## Features

- **Interactive Phase Control**: Adjust phase parameters with real-time visual feedback
- **Multiple Gate Types**: Test with Z, S, T, and custom phase gates
- **Phase Kickback Visualization**: Observe how phase is transferred to the control qubit
- **Statistical Analysis**: Run 1000 measurements to verify theoretical predictions
- **Circuit Visualization**: Clear diagram showing the quantum circuit structure
- **Educational Content**: Detailed explanation of the algorithm and its applications

## Algorithm Overview

The Hadamard Test is a fundamental quantum algorithm that estimates the real part of ⟨ψ|U|ψ⟩ for a unitary operator U and quantum state |ψ⟩.

### Circuit Structure
```
Ancilla |+⟩: ─H─●─H─M
Target  |ψ⟩: ───U─────
```

### Key Steps
1. Prepare ancilla in superposition state |+⟩ = (|0⟩ + |1⟩)/√2
2. Apply controlled-U operation
3. Apply final Hadamard to ancilla
4. Measure ancilla: P(|0⟩) = (1 + Re(⟨ψ|U|ψ⟩))/2

## Phase Kickback

When the controlled gate acts on an eigenstate |ψ⟩ with eigenvalue e^(iφ):
- The phase φ gets "kicked back" to the control qubit
- This enables phase estimation without directly measuring the target qubit
- Critical for quantum algorithms like phase estimation and Shor's algorithm

## Usage

1. Open `index.html` in a web browser
2. Adjust the phase slider to see how it affects measurement probabilities
3. Select different gate types (Z, S, T, Phase) to explore various eigenvalues
4. Click "Run 1000 Tests" to perform statistical measurements
5. Compare estimated vs actual phase values

## Educational Value

This example teaches:
- **Phase Estimation**: How to extract phase information from quantum states
- **Controlled Operations**: Understanding controlled unitary gates
- **Quantum Interference**: How superposition states interfere constructively/destructively
- **Measurement Statistics**: Connection between quantum amplitudes and measurement outcomes

## Browser Compatibility

- Modern browsers supporting ES6+
- React 18+ via CDN
- Babel for JSX compilation
- Q5M.js quantum computing library

## Code Structure

- `index.html`: Standalone HTML page with React setup
- `HadamardTest.jsx`: Main React component with quantum circuit logic
- `README.md`: This documentation file

The example uses React hooks (useState, useEffect, useCallback) for state management and follows modern React patterns.