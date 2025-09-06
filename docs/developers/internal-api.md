# Extension API Guide

This guide explains how to use the q5m.js extension API for building extension packages.

## Getting Started

### Basic Usage

```typescript
import { QubitState, Circuit, Complex } from 'q5m/extsys';

// Create quantum states
const state = new QubitState(3);

// Build circuits
const circuit = new Circuit(2);
circuit.h(0).cnot(0, 1);

// Work with complex numbers
const amplitude = new Complex(0.707, 0);
```

### Plugin System

```typescript
import { 
  deprecationManager, 
  hookManager, 
  EventEmitter 
} from 'q5m/extsys';

// Deprecation management
deprecationManager.warn('oldMethod', {
  version: '1.0.0',
  reason: 'Use newMethod instead'
});

// Hook system
hookManager.hook('processData', (data) => {
  return processedData;
});

// Event system
const emitter = new EventEmitter();
emitter.on('quantum-result', (result) => {
  console.log('Result:', result);
});
```

## Extension Development

### Package Structure

```json
{
  "name": "my-q5m-extension",
  "version": "1.0.0",
  "peerDependencies": {
    "q5m": "^1.0.0"
  }
}
```

### Example Extension

```typescript
import { QubitState, Circuit, deprecationManager } from 'q5m/extsys';

export class QuantumExtension {
  createBellState(): QubitState {
    const circuit = new Circuit(2);
    circuit.h(0).cnot(0, 1);
    
    const state = new QubitState(2);
    return circuit.execute(state);
  }
}
```

## API Reference

For complete API documentation, see:
- [Extension API Reference](./api-reference.md)
- [API Stability](./api-stability.md)
- Generated TypeDoc documentation