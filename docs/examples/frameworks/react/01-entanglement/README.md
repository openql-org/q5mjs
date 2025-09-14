# React Entanglement Example

Interactive demonstration of quantum entanglement using React hooks and Q5M.js.

## Features

- **React Hooks**: Modern functional components with useState and useEffect
- **Real-time State Management**: Automatic re-rendering when quantum state changes
- **Interactive Controls**: Button-based state creation with visual feedback
- **Component Architecture**: Reusable JSX component structure
- **Performance Optimization**: useCallback for preventing unnecessary re-renders

## Files

- `index.html` - Complete standalone React application using CDN
- `EntanglementDemo.jsx` - Reusable React component for integration in projects
- `README.md` - This documentation

## React Implementation Features

### Hooks Usage
- **useState**: Manages quantum circuit, state, and UI state
- **useEffect**: Handles component lifecycle and state updates  
- **useCallback**: Optimizes circuit execution performance

### State Management
```javascript
const [circuit, setCircuit] = useState(null);
const [quantumState, setQuantumState] = useState(null);
const [currentState, setCurrentState] = useState('reset');
const [numQubits, setNumQubits] = useState(3);
```

### Event Handling
```javascript
const createBellState = () => {
    const newCircuit = new Q5M.Circuit(2);
    newCircuit.h(0).cnot(0, 1);
    setCircuit(newCircuit);
    setCurrentState('bell');
};
```

## Quantum States Demonstrated

### Bell States
- **|Φ⁺⟩**: (|00⟩ + |11⟩)/√2 - Maximum entanglement
- **|Φ⁻⟩**: (|00⟩ - |11⟩)/√2 - Phase-flipped Bell state

### Multi-qubit States
- **GHZ State**: (|000⟩ + |111⟩)/√2 - 3-qubit entanglement
- **W State**: (|001⟩ + |010⟩ + |100⟩)/√3 - Symmetric entanglement

## Component Structure

### Props and State
- No external props required (self-contained)
- Internal state manages quantum circuit and UI
- Derived state for probabilities and amplitudes

### Rendering Logic
- Conditional styling based on active state
- Dynamic probability bar heights
- Filtered amplitude display (only non-zero)
- Responsive grid layouts

## Integration Usage

### In React Project
```javascript
import EntanglementDemo from './EntanglementDemo.jsx';

function App() {
    return (
        <div className="App">
            <EntanglementDemo />
        </div>
    );
}
```

### Styling Requirements
The component expects CSS classes for styling:
- `.entanglement-container`
- `.card`, `.controls`, `.state-display`
- `.state-button`, `.probability-bar`, `.amplitude`

## Educational Value

### React Concepts
- Functional components and hooks
- State management patterns
- Event handling in React
- Component lifecycle management
- Performance optimization techniques

### Quantum Physics
- Quantum entanglement visualization
- Bell state properties
- Multi-qubit entangled states
- Measurement probability interpretation
- Complex amplitude representation

## Development Notes

### Performance Considerations
- useCallback prevents unnecessary circuit re-execution
- Conditional rendering for amplitude display
- Efficient state updates with minimal re-renders

### Error Handling
- Try-catch blocks for circuit execution
- Graceful handling of invalid quantum states
- Console error logging for debugging

Perfect for learning React development while exploring quantum computing concepts.