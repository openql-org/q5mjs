# Extension Development Guide

Comprehensive guide for developing extensions for the q5m.js quantum computing library.

## Quick Start

### Prerequisites

- Node.js 16.0.0 or higher
- TypeScript 5.0 or higher
- Understanding of quantum computing concepts

### Create Your First Extension

1. **Initialize Project**
```bash
mkdir my-quantum-extension
cd my-quantum-extension
npm init -y
npm install --save-dev typescript @types/node
npm install --save-peer q5m
```

2. **Configure TypeScript**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

3. **Create Extension**
```typescript
// src/index.ts
import { 
  BasePlugin,
  QubitState,
  Circuit,
  Q5mState,
  EXTENSION_API_VERSION 
} from 'q5m/extsys';
import type { PluginMetadata } from 'q5m/extsys';

export class MyQuantumExtension extends BasePlugin {
  readonly metadata: PluginMetadata = {
    id: 'my-quantum-extension',
    name: 'My Quantum Extension',
    version: '1.0.0',
    description: 'Custom quantum algorithms and utilities',
    apiVersion: EXTENSION_API_VERSION,
    dependencies: [],
    author: 'Your Name',
    license: 'MIT'
  };

  async initialize(): Promise<void> {
    console.log('Initializing My Quantum Extension');
    
    // Register APIs
    this.registerAPI('algorithms', {
      customGrover: this.customGrover.bind(this),
      enhancedQFT: this.enhancedQFT.bind(this)
    });
  }

  async activate(): Promise<void> {
    console.log('Extension activated');
    this.emit('extension:ready', { id: this.metadata.id });
  }

  private customGrover(oracle: Function, qubits: number) {
    // Implementation using extsys API
    const circuit = new Circuit(qubits);
    const state = new QubitState(qubits);
    
    // Custom Grover implementation
    return `Custom Grover for ${qubits} qubits`;
  }

  private enhancedQFT(qubits: number) {
    // Implementation using Q5m advanced state
    const qstate = new Q5mState(qubits);
    
    // Enhanced QFT implementation
    return `Enhanced QFT for ${qubits} qubits`;
  }
}
```

## Using Extension System APIs

### Quantum State Management

Access and manipulate quantum states using the extension API:

```typescript
import { QubitState, Q5mState, RepType } from 'q5m/extsys';

function analyzeState(state: QubitState) {
  // Get basic state information
  const numQubits = state.numQuantum;
  const probabilities = state.probabilities();
  
  console.log(`State has ${numQubits} qubits`);
  console.log('Measurement probabilities:', probabilities);
}

function useAdvancedState() {
  // Use Q5mState for advanced memory optimization
  const qstate = new Q5mState(10); // 10-qubit state
  console.log('Representation type:', qstate.rep);
  
  // The system automatically optimizes representation
  // based on sparsity and size
}
```

### Quantum Circuit Operations

Create and manipulate quantum circuits:

```typescript
import { Circuit, Q5mGate } from 'q5m/extsys';

function createQuantumCircuit() {
  const circuit = new Circuit(3);
  
  // Build circuit using gate chain API
  circuit.h(0).cnot(0, 1).cnot(1, 2);
  
  // Execute circuit
  const result = circuit.execute();
  console.log('Circuit execution result:', result);
  
  return circuit;
}

function customGateOperations() {
  // Use low-level Q5mGate for custom operations
  const customGate = new Q5mGate(/* custom matrix */);
  // Apply to quantum systems directly
}
```

### Complex Number Operations

Work with complex numbers efficiently:

```typescript
import { Complex } from 'q5m/extsys';

function complexMath() {
  const c1 = new Complex(1, 2);
  const c2 = new Complex(3, -1);
  
  const sum = c1.add(c2);
  const product = c1.mul(c2);
  const magnitude = c1.magnitude();
  
  console.log('Complex sum:', sum);
  console.log('Complex product:', product);
  console.log('Magnitude:', magnitude);
  
  return { sum, product, magnitude };
}
```

## Plugin Development

### Basic Plugin Structure

```typescript
import { BasePlugin, QubitState, Q5mState, EXTENSION_API_VERSION } from 'q5m/extsys';

export class QuantumAnalyzerPlugin extends BasePlugin {
  readonly metadata = {
    id: 'quantum-analyzer',
    name: 'Quantum State Analyzer',
    version: '1.0.0',
    description: 'Advanced state analysis tools',
    apiVersion: EXTENSION_API_VERSION,
    dependencies: []
  };

  async initialize(): Promise<void> {
    // Register APIs
    this.registerAPI('analysis', {
      analyzeEntanglement: this.analyzeEntanglement.bind(this),
      calculatePurity: this.calculatePurity.bind(this)
    });
    
    // Set up event listeners
    this.on('state:created', this.onStateCreated.bind(this));
  }

  async activate(): Promise<void> {
    console.log('Quantum analyzer activated');
  }

  async deactivate(): Promise<void> {
    this.removeAllListeners();
  }

  private analyzeEntanglement(state: QubitState): number {
    // Entanglement analysis using direct state access
    const probabilities = state.probabilities();
    
    // Simple entanglement measure (example)
    let entanglement = 0;
    for (let i = 0; i < probabilities.length; i++) {
      if (probabilities[i] > 0) {
        entanglement -= probabilities[i] * Math.log2(probabilities[i]);
      }
    }
    
    return entanglement;
  }

  private calculatePurity(state: QubitState | Q5mState): number {
    // Purity calculation using advanced state features
    if (state instanceof Q5mState) {
      // Use Q5mState advanced features for efficiency
      return this.calculatePurityAdvanced(state);
    } else {
      // Use basic QubitState features
      return this.calculatePurityBasic(state);
    }
  }

  private calculatePurityAdvanced(state: Q5mState): number {
    // Advanced purity calculation with memory optimization
    return 0.99; // Placeholder
  }

  private calculatePurityBasic(state: QubitState): number {
    // Basic purity calculation
    return 0.95; // Placeholder
  }

  private onStateCreated(data: any) {
    console.log('New state created:', data);
  }
}
```

### Cross-Plugin Communication

```typescript
class CollaborativePlugin extends BasePlugin {
  async initialize(): Promise<void> {
    // Provide services to other plugins
    this.registerAPI('optimizer', {
      optimize: this.optimize.bind(this)
    });

    // Use services from other plugins
    try {
      const analyzer = await this.requestAPI('quantum-analyzer', 'analysis');
      const entanglement = analyzer.analyzeEntanglement(someState);
      console.log('Entanglement:', entanglement);
    } catch (error) {
      console.warn('Analyzer plugin not available');
    }
  }

  private optimize(circuit: any): any {
    // Optimization logic
    const optimized = { ...circuit, optimized: true };
    
    // Notify other plugins
    this.emit('optimization:complete', { circuit: optimized });
    
    return optimized;
  }
}
```

### Event-Driven Architecture

```typescript
class EventDrivenPlugin extends BasePlugin {
  async initialize(): Promise<void> {
    // Listen to system events
    this.on('circuit:created', this.onCircuitCreated.bind(this));
    this.on('state:measured', this.onStateMeasured.bind(this));
    
    // Listen to custom events from other plugins
    this.on('optimization:complete', this.onOptimizationComplete.bind(this));
  }

  private onCircuitCreated(data: any) {
    console.log('Circuit created:', data.circuitId);
    
    // Emit custom event
    this.emit('analysis:started', { 
      circuitId: data.circuitId,
      timestamp: new Date()
    });
  }

  private onStateMeasured(data: any) {
    console.log('State measured:', data.result);
  }

  private onOptimizationComplete(data: any) {
    console.log('Optimization complete:', data.circuit);
  }
}
```

## Error Handling

### Extension API Error Handling

```typescript
import { PluginError, PluginErrorType, QubitState } from 'q5m/extsys';

function safeOperation(state: QubitState) {
  try {
    const probabilities = state.probabilities();
    return processProbabilities(probabilities);
  } catch (error) {
    if (error instanceof PluginError) {
      console.error(`Plugin Error [${error.type}]: ${error.message}`);
      
      switch (error.type) {
        case PluginErrorType.ACTIVATION_ERROR:
          // Handle activation error
          return getDefaultProbabilities();
        case PluginErrorType.API_ERROR:
          // Handle API error
          throw new Error('Cannot process invalid state');
        default:
          // Re-throw unknown errors
          throw error;
      }
    } else {
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}

function processProbabilities(probabilities: number[]) {
  // Process probabilities
  return probabilities;
}

function getDefaultProbabilities(): number[] {
  // Return default values
  return [1.0, 0.0];
}
```

### Plugin Error Handling

```typescript
class RobustPlugin extends BasePlugin {
  async initialize(): Promise<void> {
    try {
      await this.setupAlgorithms();
    } catch (error) {
      console.error('Failed to initialize algorithms:', error);
      
      // Decide whether to continue with reduced functionality
      // or fail the initialization
      if (this.isCriticalError(error)) {
        throw error; // Prevent plugin activation
      } else {
        console.warn('Continuing with reduced functionality');
      }
    }
  }

  private isCriticalError(error: any): boolean {
    return error.code === 'CRITICAL_FAILURE';
  }
}
```

## Testing

### Unit Testing

```typescript
// test/my-extension.test.ts
import { MyQuantumExtension } from '../src';
import { pluginManager, PluginManager } from 'q5m/extsys';

describe('MyQuantumExtension', () => {
  let extension: MyQuantumExtension;
  let manager: PluginManager;

  beforeEach(async () => {
    manager = new PluginManager();
    extension = new MyQuantumExtension();
    await manager.register('my-extension', extension);
  });

  afterEach(async () => {
    await manager.unregisterAll();
  });

  test('should initialize correctly', () => {
    expect(extension.metadata.id).toBe('my-quantum-extension');
    expect(extension.metadata.version).toBe('1.0.0');
    expect(extension.metadata.apiVersion).toBe('1.0.0');
  });

  test('should provide custom algorithms', async () => {
    await manager.activate('my-extension');
    const api = manager.getAPI('my-extension', 'algorithms');
    
    expect(api).toBeDefined();
    expect(typeof api.customGrover).toBe('function');
    
    const result = api.customGrover(() => {}, 4);
    expect(result).toBe('Custom Grover for 4 qubits');
  });
});
```

### Integration Testing

```typescript
// test/integration.test.ts
import { Circuit, QubitState, Q5mState } from 'q5m/extsys';
import { MyQuantumExtension } from '../src';

describe('Integration Tests', () => {
  test('should work with q5m circuits and states', async () => {
    const extension = new MyQuantumExtension();
    await extension.initialize();
    
    // Test with regular circuit
    const circuit = new Circuit(3);
    circuit.h(0).cnot(0, 1).cnot(1, 2);
    
    // Test with quantum state
    const state = new QubitState(3);
    expect(state.numQuantum).toBe(3);
    
    // Test with advanced Q5m state
    const qstate = new Q5mState(3);
    expect(qstate.numQuantum).toBe(3);
    
    // Test extension with real quantum objects
    const api = extension.getAPI('algorithms');
    const result = api.enhancedQFT(3);
    expect(result).toBe('Enhanced QFT for 3 qubits');
  });

  test('should handle different state representations', async () => {
    const extension = new MyQuantumExtension();
    await extension.initialize();
    
    // Test memory optimization with large state
    const largeState = new Q5mState(10);
    expect(largeState.rep).toBeDefined();
    
    console.log(`Large state uses ${largeState.rep} representation`);
  });
});
```

## Packaging and Distribution

### Package Configuration

```json
{
  "name": "@yourscope/quantum-extension",
  "version": "1.0.0",
  "description": "Quantum computing extension for q5m.js",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "prepublishOnly": "npm run build && npm test"
  },
  "peerDependencies": {
    "q5m": "^1.0.0"
  },
  "devDependencies": {
    "@types/jest": "^29.0.0",
    "@types/node": "^18.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "typescript": "^5.0.0"
  },
  "keywords": [
    "quantum",
    "q5m",
    "extension",
    "quantum-computing"
  ],
  "author": "Your Name",
  "license": "MIT"
}
```

### Publishing

```bash
# Build and test
npm run build
npm test

# Publish to npm
npm publish --access public
```

## Best Practices

### 1. Version Compatibility

Always check API version compatibility:

```typescript
import { EXTENSION_API_VERSION } from 'q5m/extsys';

function initExtension() {
  console.log('Extension API Version:', EXTENSION_API_VERSION);
  
  // Ensure your extension is compatible
  const requiredVersion = '1.0.0';
  if (EXTENSION_API_VERSION !== requiredVersion) {
    console.warn(`Extension built for API version ${requiredVersion}, running on ${EXTENSION_API_VERSION}`);
  }
}
```

### 2. Memory Management

Handle large quantum states efficiently:

```typescript
import { QubitState, Q5mState, RepType } from 'q5m/extsys';

function processLargeState(state: QubitState | Q5mState) {
  const qubits = state.numQuantum;
  
  if (qubits > 20) {
    // Use Q5mState for automatic optimization
    if (state instanceof Q5mState) {
      console.log('Using optimized representation:', state.rep);
      return processOptimized(state);
    } else {
      // Convert to Q5mState for better memory efficiency
      const qstate = new Q5mState(qubits);
      return processOptimized(qstate);
    }
  } else {
    // Use regular QubitState for small systems
    const probabilities = state.probabilities();
    return processSmall(probabilities);
  }
}

function processOptimized(state: Q5mState) {
  // Process using optimized Q5m state
  return `Processed ${state.numQuantum} qubits with ${state.rep} representation`;
}

function processSmall(probabilities: number[]) {
  // Process small state probabilities
  return `Processed ${probabilities.length} amplitudes`;
}
```

### 3. Error Recovery

Implement graceful error recovery:

```typescript
async function robustOperation() {
  const maxRetries = 3;
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await performOperation();
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error);
      lastError = error;
      await delay(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
  
  throw lastError;
}
```

### 4. Performance Optimization

Cache expensive computations:

```typescript
import { QubitState, Q5mState, Profiler } from 'q5m/extsys';

class CachedAnalyzer {
  private cache = new Map<string, any>();
  private profiler = new Profiler();
  
  analyzeState(state: QubitState | Q5mState): any {
    this.profiler.startTiming('state-analysis');
    
    const key = this.getStateKey(state);
    
    if (this.cache.has(key)) {
      const duration = this.profiler.endTiming('state-analysis');
      console.log(`Cache hit! Analysis took ${duration}ms`);
      return this.cache.get(key);
    }
    
    const result = this.performAnalysis(state);
    this.cache.set(key, result);
    
    // Limit cache size
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    const duration = this.profiler.endTiming('state-analysis');
    console.log(`Analysis completed in ${duration}ms`);
    
    return result;
  }
  
  private getStateKey(state: QubitState | Q5mState): string {
    // Generate unique key based on state properties
    return `${state.numQuantum}_${Date.now()}`;
  }
  
  private performAnalysis(state: QubitState | Q5mState): any {
    // Perform expensive state analysis
    const probabilities = state.probabilities();
    return { probabilities, entropy: this.calculateEntropy(probabilities) };
  }
  
  private calculateEntropy(probabilities: number[]): number {
    return probabilities.reduce((entropy, p) => {
      return p > 0 ? entropy - p * Math.log2(p) : entropy;
    }, 0);
  }
}
```

## Resources

- [Internal API Reference](./api-reference.md)
- [Plugin System Documentation](./plugin-system.md)
- [API Stability Guide](./api-stability.md)
- [Extension Examples](./extension-examples.md)
- [Best Practices](./best-practices.md)
- [Internal API Overview](./internal-api.md)

---

*This guide provides the foundation for developing powerful quantum computing extensions for q5m.js.*