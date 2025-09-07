# Vue.js Hadamard Test Example

Interactive implementation of the Hadamard test algorithm demonstrating phase estimation and phase kickback phenomena.

## Features

- **Interactive Phase Control**: Adjust phase parameters with real-time updates
- **Multiple Gate Types**: Z, S, T, and custom phase gates
- **Live Measurements**: Run 1000 measurements to see statistical results
- **Phase Estimation**: Extract phase information from measurement probabilities
- **Circuit Visualization**: Clear diagram showing the Hadamard test protocol
- **Educational Content**: Built-in explanations of algorithm steps

## Algorithm Overview

The Hadamard test is a fundamental quantum algorithm for:
1. **Phase Estimation**: Estimating eigenvalue phases of unitary operators
2. **Inner Product Estimation**: Computing ⟨ψ|U|ψ⟩ for quantum states
3. **Phase Kickback**: Demonstrating how phases transfer between qubits

## Circuit Structure

```
Ancilla |+⟩: ──[H]────●────[H]────[M]
                      │
Target  |ψ⟩: ────────[U]──────────────
```

Where U can be Z, S, T, or a custom phase gate.

## Key Concepts

### Phase Kickback
When a controlled unitary acts on an eigenstate |ψ⟩ with eigenvalue e^(iφ):
- The phase e^(iφ) gets "kicked back" to the control qubit
- This enables phase information extraction through measurement

### Measurement Probability
For an eigenstate |1⟩ of the phase gate:
- P(|0⟩) = (1 + cos(φ))/2
- P(|1⟩) = (1 - cos(φ))/2

## Vue.js Implementation

### Reactive Features
- **Real-time Updates**: Phase slider instantly updates results
- **Computed Properties**: Automatic calculation of derived values
- **Async Operations**: Non-blocking measurement simulations
- **Dynamic Styling**: Visual feedback based on current state

### Educational Value
- **Interactive Learning**: Hands-on exploration of quantum concepts
- **Visual Feedback**: Immediate results from parameter changes
- **Statistical Analysis**: Multiple measurements show quantum randomness
- **Error Analysis**: Compare estimated vs. actual phase values

## Usage Instructions

1. **Adjust Phase**: Use the slider to change the phase parameter φ
2. **Select Gate**: Choose between Z, S, T, or custom phase gates
3. **Run Tests**: Click "Run 1000 Tests" to see statistical measurements
4. **Observe Results**: Watch how measurement probabilities relate to phase
5. **Compare Values**: Check estimated phase against actual phase

## Technical Details

- **Quantum Circuit**: 2-qubit system (ancilla + target)
- **Gate Operations**: Hadamard, controlled phase gates, measurements
- **Probability Calculation**: Statistical analysis of measurement outcomes
- **Error Estimation**: Quantitative phase estimation accuracy
- **Performance**: Optimized for smooth real-time interaction

Perfect for understanding quantum phase estimation and the fundamental role of phase kickback in quantum algorithms.