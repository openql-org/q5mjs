# Extension API Reference

This document describes the extension API for q5m.js.

## Overview

The extension API provides comprehensive access to quantum computing classes, plugin system, and advanced Q5m components for building powerful extensions.

## Core Classes

### QubitState
```typescript
import { QubitState } from 'q5m/extsys';

const state = new QubitState(3);
// Direct access to all QubitState methods
```

### Circuit
```typescript
import { Circuit } from 'q5m/extsys';

const circuit = new Circuit(2);
circuit.h(0).cnot(0, 1);
// Direct access to all Circuit methods
```

### Complex
```typescript
import { Complex } from 'q5m/extsys';

const complex = new Complex(1, 0);
// Direct access to all Complex number operations
```

## Q5m Core System Classes

### Q5mState
Advanced quantum state management with memory optimization:
```typescript
import { Q5mState, RepType } from 'q5m/extsys';

const qstate = new Q5mState(4); // 4-qubit system
console.log('Representation type:', qstate.rep); // DENSE, SPARSE, or CSR
```

### Q5mGate
Low-level quantum gate operations:
```typescript
import { Q5mGate } from 'q5m/extsys';

const gate = new Q5mGate(/* gate matrix */);
// Apply to quantum states directly
```

### Q5mOperator
Quantum operators for advanced computations:
```typescript
import { Q5mOperator, UnitaryOperator, HermitianOperator } from 'q5m/extsys';

const unitary = new UnitaryOperator(/* matrix */);
const observable = new HermitianOperator(/* hermitian matrix */);
```

### Q5mObserver
Quantum measurement and observation:
```typescript
import { Q5mObserver } from 'q5m/extsys';
import type { BasisOperator } from 'q5m/extsys';

const observer = new Q5mObserver(/* basis operators */);
```

### Q5mMaterial
State representation and material properties:
```typescript
import { Q5mMaterial } from 'q5m/extsys';
import type { DensityMatrix, StateVector, Q5mIndex } from 'q5m/extsys';

const material = new Q5mMaterial(/* parameters */);
```

## Essential Types and Interfaces

### Quantum System Interface
```typescript
import type { Q5mSystem, Q5mApplicable } from 'q5m/extsys';

// Implement quantum system interface
class MyQuantumSystem implements Q5mSystem {
  // Implementation details
}
```

### Execution Results
```typescript
import type { 
  ExecutionResult, 
  MeasurementResult, 
  Q5mExecutable, 
  Q5mMeasurable,
  Probability,
  ZeroOne 
} from 'q5m/extsys';

// Use in quantum computations
function processResult(result: MeasurementResult): Probability {
  return result.probability;
}
```

## Plugin System

### DeprecationManager
```typescript
import { deprecationManager, DeprecationManager } from 'q5m/extsys';

deprecationManager.warn('oldMethod', {
  version: '1.0.0',
  reason: 'Use newMethod instead'
});

// Create custom deprecation manager
const customManager = DeprecationManager.getInstance();
```

### HookManager
```typescript
import { hookManager, HookManager, HookExecutionMode } from 'q5m/extsys';

hookManager.hook('processData', (data) => {
  // Process data
  return data;
});

// Use different execution modes
const hooks = new HookManager();
hooks.execute('myHook', data, { mode: HookExecutionMode.PARALLEL });
```

### EventEmitter
```typescript
import { EventEmitter, eventEmitter } from 'q5m/extsys';

const emitter = new EventEmitter();
emitter.on('event', (data) => console.log(data));
emitter.emit('event', 'Hello World');

// Use global event emitter
eventEmitter.on('system:ready', () => console.log('System ready'));
```

### Plugin Classes
```typescript
import { 
  BasePlugin, 
  SimplePlugin, 
  createPlugin,
  PluginManager,
  pluginManager 
} from 'q5m/extsys';

// Extend BasePlugin for complex plugins
class MyAdvancedPlugin extends BasePlugin {
  // Implementation
}

// Use factory function for simple plugins
const utilsPlugin = createPlugin('utils', metadata, handlers);

// Register with plugin manager
pluginManager.register('my-plugin', new MyAdvancedPlugin());
```

### Error Handling
```typescript
import { 
  PluginError, 
  PluginErrorType, 
  PluginState,
  EventSystemError,
  EventSystemErrorType 
} from 'q5m/extsys';

try {
  // Plugin operations
} catch (error) {
  if (error instanceof PluginError) {
    console.error(`Plugin error [${error.type}]:`, error.message);
  }
}
```

## System Utilities

### Profiler
```typescript
import { Profiler } from 'q5m/extsys';

const profiler = new Profiler();
profiler.startTiming('operation');
// ... perform operation
const duration = profiler.endTiming('operation');
```

### ErrorSystem
```typescript
import { ErrorSystem } from 'q5m/extsys';

const errorSystem = new ErrorSystem();
// Advanced error handling and logging
```

## Configuration Types

### RepType Enum
```typescript
import { RepType } from 'q5m/extsys';

// Available representation types
console.log(RepType.DENSE);  // Dense matrix representation
console.log(RepType.SPARSE); // Sparse representation
console.log(RepType.CSR);    // Compressed Sparse Row
```

## Version Information

```typescript
import { EXTENSION_API_VERSION } from 'q5m/extsys';

console.log('Extension API Version:', EXTENSION_API_VERSION); // "1.0.0"
```

## Usage Example

```typescript
import { 
  QubitState, 
  Circuit, 
  Q5mState,
  BasePlugin,
  deprecationManager,
  EXTENSION_API_VERSION 
} from 'q5m/extsys';

class QuantumExtension extends BasePlugin {
  readonly metadata = {
    id: 'quantum-extension',
    name: 'Quantum Extension',
    version: '1.0.0',
    apiVersion: EXTENSION_API_VERSION
  };

  async initialize(): Promise<void> {
    // Create quantum circuit
    const circuit = new Circuit(2);
    circuit.h(0).cnot(0, 1);
    
    // Create quantum state
    const state = new QubitState(2);
    
    // Use advanced Q5m state
    const qstate = new Q5mState(2);
    
    // Register deprecation for old method
    deprecationManager.registerDeprecation('oldMethod', {
      version: '1.0.0',
      reason: 'Use newMethod instead'
    });
  }
}
```

For detailed documentation on individual classes and methods, refer to the TypeDoc generated documentation.