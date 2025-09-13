# Vue.js Entanglement Example

Interactive demonstration of quantum entanglement using Vue.js and Q5M.js.

## Features

- **Bell States**: Create and visualize maximally entangled 2-qubit states
- **GHZ States**: Explore 3-qubit entangled states
- **W States**: Demonstrate symmetric 3-qubit entanglement
- **Real-time Updates**: Vue's reactivity shows instant state changes
- **Probability Visualization**: Interactive bar charts of measurement outcomes
- **Amplitude Display**: Complex number representation of quantum amplitudes

## Quantum States

### Bell States
- **|Φ⁺⟩ = (|00⟩ + |11⟩)/√2**: Classic maximally entangled state
- **|Φ⁻⟩ = (|00⟩ - |11⟩)/√2**: Bell state with relative phase

### 3-Qubit States  
- **GHZ State = (|000⟩ + |111⟩)/√2**: Maximal 3-qubit entanglement
- **W State = (|001⟩ + |010⟩ + |100⟩)/√3**: Symmetric entanglement

## Vue.js Features Used

- **Composition API**: Modern Vue 3 reactive programming
- **Computed Properties**: Automatic updates when quantum state changes  
- **Event Handling**: Button clicks trigger quantum operations
- **Conditional Rendering**: Dynamic display based on state type
- **Reactive Data**: Seamless integration with Q5M.js quantum computations

## Usage

1. Open `index.html` in a web browser
2. Click buttons to create different entangled states
3. Observe probability distributions and quantum amplitudes
4. Compare entanglement properties across different states

## Technical Implementation

- Uses Vue 3 Composition API for state management
- Q5M.js handles quantum circuit creation and execution
- Reactive properties automatically update visualizations
- Complex number formatting for amplitude display
- Responsive grid layout for probability bars

## Educational Value

Perfect for learning:
- Quantum entanglement concepts
- Bell state properties
- Multi-qubit entangled states
- Vue.js reactive programming with quantum data
- Interactive quantum state visualization